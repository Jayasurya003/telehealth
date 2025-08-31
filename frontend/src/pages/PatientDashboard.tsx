import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Badge, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const PatientDashboard: React.FC = () => {
  // Get user name and id from localStorage (set at login)
  let userName = 'Patient';
  let userId = null;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user && user.name) userName = user.name;
      if (user && user.id) userId = user.id;
    }
  } catch {}

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setForm({ doctorId: '', date: '', time: '', type: 'video' });
    setError('');
    setSuccess('');
  };

  // Form state
  const [form, setForm] = useState({ doctorId: '', date: '', time: '', type: 'video' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<{ id: number; user: { name: string } }[]>([]);
  const [patientId, setPatientId] = useState<number | null>(null);

  // Appointments and messages state
  const [appointments, setAppointments] = useState<any[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  // Medical records and prescriptions state
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(false);
  const [prescriptionsError, setPrescriptionsError] = useState('');
  const [showPrescriptionsModal, setShowPrescriptionsModal] = useState(false);

  // Chat modal state
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatDoctorId, setChatDoctorId] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatSendLoading, setChatSendLoading] = useState(false);

  // Record upload state
  const [recordFile, setRecordFile] = useState<File | null>(null);
  const [recordUploadLoading, setRecordUploadLoading] = useState(false);
  const [recordUploadError, setRecordUploadError] = useState('');
  const [recordUploadSuccess, setRecordUploadSuccess] = useState('');
  const [showRecordModal, setShowRecordModal] = useState(false);

  // Add state for selected appointment for chat
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  const navigate = useNavigate();

  // Fetch doctors for dropdown
  useEffect(() => {
    api.get('/doctors/').then(res => {
      setDoctors(res.data);
    }).catch(() => setDoctors([]));
  }, []);

  // Fetch patient profile for this user
  useEffect(() => {
    if (!userId) return;
    api.get(`/patients/by_user/${userId}`)
      .then(res => {
        setPatientId(res.data.id);
      })
      .catch(() => {
        setPatientId(null);
      });
  }, [userId]);

  // Filter appointments using patientId
  const fetchAppointments = () => {
    if (!patientId) return;
    setAppointmentsLoading(true);
    setAppointmentsError('');
    api.get('/appointments/')
      .then(res => {
        const filtered = res.data.filter((appt: any) => appt.patient && appt.patient.id == patientId);
        setAppointments(filtered);
        console.log('PatientDashboard appointments:', filtered);
      })
      .catch(() => setAppointmentsError('Failed to load appointments.'))
      .finally(() => setAppointmentsLoading(false));
  };
  useEffect(() => {
    fetchAppointments();
  }, [patientId]);

  // Poll for new messages every 10 seconds
  useEffect(() => {
    if (!patientId) return;
    const fetchMessages = () => {
      api.get('/messages/').then(res => {
        // Show all messages for this patient
        const relevant = res.data.filter((msg: any) => msg.appointment_id && msg.sender && msg.appointment && msg.appointment.patient && msg.appointment.patient.id == patientId);
        setMessages(relevant);
        // Count unread (not sent by this patient)
        let userId = null;
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) userId = JSON.parse(userStr).id;
        } catch {}
        const unread = relevant.filter(msg => msg.sender && msg.sender.id !== userId).length;
        setUnreadCount(unread);
      });
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [patientId]);

  // Fetch prescriptions
  useEffect(() => {
    if (!patientId) return;
    setPrescriptionsLoading(true);
    setPrescriptionsError('');
    api.get('/prescriptions/')
      .then(res => {
        setPrescriptions(res.data.filter((p: any) => p.patient_id === patientId));
      })
      .catch(() => setPrescriptionsError('Failed to load prescriptions.'))
      .finally(() => setPrescriptionsLoading(false));
  }, [patientId]);

  // Handle form input
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Book appointment
  const handleBook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.doctorId || !form.date || !form.time || !patientId) {
      setError(!patientId ? 'Loading your profile. Please wait...' : 'Please fill all fields.');
      return;
    }
    setLoading(true);
    try {
      const scheduled_time = `${form.date}T${form.time}`;
      await api.post('/appointments/', {
        doctor_id: Number(form.doctorId),
        patient_id: patientId,
        scheduled_time,
        status: 'pending',
      });
      setSuccess('Appointment booked successfully!');
      fetchAppointments(); // Refresh appointments after booking
      setTimeout(() => {
        handleCloseModal();
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to book appointment.');
    } finally {
      setLoading(false);
    }
  };

  // Upload medical record
  const handleRecordUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRecordUploadLoading(true);
    setRecordUploadError('');
    setRecordUploadSuccess('');
    if (!recordFile || !patientId) {
      setRecordUploadError('Please select a file.');
      setRecordUploadLoading(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', recordFile);
      formData.append('patient_id', String(patientId));
      await api.post('/medical-records/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setRecordUploadSuccess('Record uploaded!');
      setRecordFile(null);
      setTimeout(() => setShowRecordModal(false), 1200);
    } catch (err: any) {
      setRecordUploadError('Failed to upload record.');
    } finally {
      setRecordUploadLoading(false);
    }
  };

  // Open chat with a doctor for a specific appointment
  const handleOpenChat = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowChatModal(true);
    setChatMessages([]);
    setChatLoading(true);
    setChatError('');
    api.get('/messages/')
      .then(res => {
        const filtered = res.data.filter((msg: any) =>
          msg.doctor && msg.patient &&
          msg.doctor.id == appointment.doctor.id &&
          msg.patient.id == appointment.patient.id
        );
        setChatMessages(filtered);
      })
      .catch(() => setChatError('Failed to load chat.'))
      .finally(() => setChatLoading(false));
  };

  // Send message using correct IDs
  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedAppointment) return;
    setChatSendLoading(true);
    let userId = null;
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        userId = user.id;
      }
      const res = await api.post('/messages/', {
        content: chatInput,
        appointment_id: selectedAppointment.id,
        sender_id: userId,
      });
      setChatMessages(msgs => [...msgs, res.data]);
      setChatInput('');
      setChatError('');
      // Redirect to messages page after sending
      setTimeout(() => {
        sessionStorage.setItem('selectedConvId', String(selectedAppointment.id));
        navigate('/patient/messages');
      }, 500);
    } catch {
      setChatError('Failed to send message.');
    } finally {
      setChatSendLoading(false);
    }
  };

  // Compute next appointment from appointments array
  const nextAppointment = appointments.length > 0 ? appointments[0] : null;

  useEffect(() => {
    if (patientId) {
      console.log('PatientDashboard patientId:', patientId);
    }
  }, [patientId]);

  return (
    <Container fluid className="bg-light min-vh-100 p-0">
      <Row className="bg-primary bg-gradient text-white py-4 px-3 align-items-center shadow-sm rounded-bottom">
        <Col md={8}>
          <h2 className="fw-bold mb-0">Welcome, {userName}</h2>
          <div className="text-white-50">Your health, your schedule.</div>
        </Col>
        <Col md={4} className="text-md-end mt-3 mt-md-0">
          <Button variant="light" className="me-2 text-primary fw-bold" onClick={handleOpenModal}>Book Appointment</Button>
          <Button variant="outline-light" className="fw-bold">View Records</Button>
        </Col>
      </Row>
      <Container className="py-5">
        <Row className="mb-4 g-4">
          <Col md={6} lg={4}>
            <Card className="shadow border-0 h-100" style={{ background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)' }}>
              <Card.Body>
                <h5 className="fw-bold text-primary mb-3">Next Appointment</h5>
                {nextAppointment ? (
                  <>
                    <div className="mb-2"><strong>Date:</strong> {nextAppointment.scheduled_time?.split('T')[0]}</div>
                    <div className="mb-2"><strong>Time:</strong> {nextAppointment.scheduled_time?.split('T')[1]?.slice(0,5)}</div>
                    <div className="mb-2"><strong>Doctor:</strong> {nextAppointment.doctor_name || nextAppointment.doctor_id}</div>
                    <div className="mb-2"><strong>Type:</strong> {nextAppointment.type || 'Consultation'}</div>
                    <Button variant="primary" className="mt-3 w-100 shadow-sm" style={{ borderRadius: 20 }}>Join Video Call</Button>
                  </>
                ) : (
                  <div className="text-muted small">No upcoming appointments.</div>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={4}>
            <Card className="shadow border-0 h-100" style={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }}>
              <Card.Body>
                <h5 className="fw-bold text-primary mb-3">Quick Actions</h5>
                <Button variant="outline-primary" className="mb-2 w-100 shadow-sm quick-action-btn" style={{ borderRadius: 20 }} onClick={() => setShowRecordModal(true)}>Upload Medical Record</Button>
                <Button variant="outline-primary" className="w-100 shadow-sm quick-action-btn" style={{ borderRadius: 20 }} onClick={() => setShowPrescriptionsModal(true)}>View Prescriptions</Button>
                <Button variant="outline-primary" className="mb-2 w-100 shadow-sm quick-action-btn" style={{ borderRadius: 20 }} onClick={() => doctors.length > 0 && handleOpenChat(String(doctors[0].id))}>Message Doctor</Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={12} lg={4}>
            <Card className="shadow border-0 h-100" style={{ background: 'linear-gradient(135deg, #f8ffae 0%, #43c6ac 100%)' }}>
              <Card.Body>
                <h5 className="fw-bold text-primary mb-3">
                  Recent Messages {unreadCount > 0 && <Badge bg="danger" className="ms-2">{unreadCount} new</Badge>}
                </h5>
                <ListGroup variant="flush">
                  {messagesLoading ? (
                    <div className="text-center py-3"><Spinner animation="border" size="sm" /></div>
                  ) : messagesError ? (
                    <div className="text-danger small py-2">{messagesError}</div>
                  ) : messages.length === 0 ? (
                    <div className="text-muted small py-2">No messages yet.</div>
                  ) : (
                    messages.map((msg: any, idx: number) => (
                      <ListGroup.Item key={idx} className="d-flex justify-content-between align-items-start">
                        <div>
                          <div className="fw-semibold text-primary">{msg.sender?.id === patientId ? 'You' : (msg.sender?.role === 'doctor' ? 'Doctor' : 'Patient')}</div>
                          <div className="small text-muted">{msg.content}</div>
                        </div>
                        <Badge bg="primary" pill>{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}</Badge>
                      </ListGroup.Item>
                    ))
                  )}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <Card className="shadow border-0 mt-4">
              <Card.Body>
                <h5 className="fw-bold text-primary mb-3">Appointments</h5>
                <ListGroup variant="flush">
                  {appointmentsLoading ? (
                    <div className="text-center py-3"><Spinner animation="border" size="sm" /></div>
                  ) : appointmentsError ? (
                    <div className="text-danger small py-2">{appointmentsError}</div>
                  ) : appointments.length === 0 ? (
                    <div className="text-muted small py-2">No appointments yet.</div>
                  ) : (
                    appointments.map((appt, idx) => (
                      <ListGroup.Item key={idx} className="d-flex justify-content-between align-items-center">
                        <div>
                          <span className="fw-semibold">{appt.scheduled_time?.split('T')[0]} at {appt.scheduled_time?.split('T')[1]?.slice(0,5)}</span> with <span className="text-primary">{appt.doctor?.user?.name || appt.doctor?.id}</span>
                        </div>
                        <Badge bg={appt.status === 'pending' ? 'warning' : appt.status === 'accepted' ? 'success' : 'secondary'}>{appt.status}</Badge>
                        <Button variant="outline-primary" size="sm" className="ms-2" onClick={() => handleOpenChat(appt)}>
                          Message Doctor
                        </Button>
                      </ListGroup.Item>
                    ))
                  )}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      {/* Book Appointment Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>Book Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!patientId && <Alert variant="info">Loading your profile...</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Form onSubmit={handleBook}>
            <Form.Group className="mb-3" controlId="formDoctor">
              <Form.Label>Doctor</Form.Label>
              <Form.Select name="doctorId" value={form.doctorId} onChange={handleChange} required>
                <option value="">Select doctor</option>
                {doctors.map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.user.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formDate">
              <Form.Label>Date</Form.Label>
              <Form.Control type="date" name="date" value={form.date} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formTime">
              <Form.Label>Time</Form.Label>
              <Form.Control type="time" name="time" value={form.time} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formType">
              <Form.Label>Type</Form.Label>
              <Form.Select name="type" value={form.type} onChange={handleChange} required>
                <option value="video">Video Consultation</option>
                <option value="inperson">In-Person</option>
              </Form.Select>
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100 shadow-sm" style={{ borderRadius: 20 }} disabled={loading || !patientId}>
              {loading ? <Spinner animation="border" size="sm" /> : 'Book'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      {/* Upload Medical Record Modal */}
      <Modal show={showRecordModal} onHide={() => setShowRecordModal(false)} centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>Upload Medical Record</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {recordUploadError && <Alert variant="danger">{recordUploadError}</Alert>}
          {recordUploadSuccess && <Alert variant="success">{recordUploadSuccess}</Alert>}
          <Form onSubmit={handleRecordUpload}>
            <Form.Group className="mb-3">
              <Form.Label>File</Form.Label>
              <Form.Control type="file" onChange={e => {
                const target = e.target as HTMLInputElement;
                setRecordFile(target.files?.[0] || null);
              }} required />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100 shadow-sm" style={{ borderRadius: 20 }} disabled={recordUploadLoading}>
              {recordUploadLoading ? <Spinner animation="border" size="sm" /> : 'Upload'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      {/* View Prescriptions Modal */}
      <Modal show={showPrescriptionsModal} onHide={() => setShowPrescriptionsModal(false)} centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>Prescriptions</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {prescriptionsLoading ? (
            <div className="text-center py-3"><Spinner animation="border" size="sm" /></div>
          ) : prescriptionsError ? (
            <div className="text-danger small py-2">{prescriptionsError}</div>
          ) : prescriptions.length === 0 ? (
            <div className="text-muted small py-2">No prescriptions yet.</div>
          ) : (
            <ListGroup>
              {prescriptions.map((p, idx) => (
                <ListGroup.Item key={idx}>
                  <div className="fw-semibold">{p.title || `Prescription #${p.id}`}</div>
                  <div className="small text-muted">{p.created_at?.split('T')[0]}</div>
                  {p.file_url && <a href={p.file_url} target="_blank" rel="noopener noreferrer">Download</a>}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Modal.Body>
      </Modal>
      {/* Chat Modal */}
      <Modal show={showChatModal} onHide={() => setShowChatModal(false)} centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>Chat with Dr. {selectedAppointment?.doctor?.user?.name || ''}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {chatLoading ? (
            <div className="text-center py-3"><Spinner animation="border" size="sm" /></div>
          ) : chatError ? (
            <div className="text-danger small py-2">{chatError}</div>
          ) : (
            <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 10 }}>
              {chatMessages.length === 0 ? (
                <div className="text-muted small py-2">No messages yet.</div>
              ) : (
                chatMessages.map((msg, idx) => {
                  let userStr = '';
                  let userId = null;
                  try {
                    const userStrRaw = localStorage.getItem('user');
                    if (userStrRaw) {
                      const user = JSON.parse(userStrRaw);
                      userId = user.id;
                    }
                  } catch {}
                  let senderLabel = '';
                  if (msg.sender && msg.sender.id === userId) {
                    senderLabel = 'You';
                  } else if (msg.sender && msg.sender.role === 'doctor') {
                    senderLabel = 'Doctor';
                  } else if (msg.sender && msg.sender.role === 'patient') {
                    senderLabel = 'Patient';
                  }
                  return (
                    <div key={idx} className={msg.sender && msg.sender.id === userId ? 'text-end' : 'text-start'}>
                      <span className={msg.sender && msg.sender.id === userId ? 'bg-primary text-white px-2 py-1 rounded' : 'bg-light px-2 py-1 rounded'}>
                        <strong>{senderLabel}:</strong> {msg.content}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}
          <Form onSubmit={handleSendMessage} className="d-flex gap-2 mt-2">
            <Form.Control type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type a message..." disabled={chatSendLoading} />
            <Button type="submit" variant="primary" className="shadow-sm" style={{ borderRadius: 20 }} disabled={chatSendLoading || !chatInput.trim()}>{chatSendLoading ? <Spinner animation="border" size="sm" /> : 'Send'}</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default PatientDashboard;

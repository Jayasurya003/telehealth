import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Badge, Spinner, Modal, Form, Alert } from 'react-bootstrap';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const DoctorDashboard: React.FC = () => {
  // Get doctor info from localStorage (set at login)
  let doctorName = 'Doctor';
  let userId = null;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user && user.name) doctorName = `Dr. ${user.name}`;
      if (user && user.id) userId = user.id;
    }
  } catch {}

  // Appointments and messages state
  const [appointments, setAppointments] = useState<any[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [actionError, setActionError] = useState('');

  // Medical records and prescriptions state
  const [records, setRecords] = useState<any[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState('');
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [recordFile, setRecordFile] = useState<File | null>(null);
  const [recordUploadLoading, setRecordUploadLoading] = useState(false);
  const [recordUploadError, setRecordUploadError] = useState('');
  const [recordUploadSuccess, setRecordUploadSuccess] = useState('');

  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(false);
  const [prescriptionsError, setPrescriptionsError] = useState('');
  const [showPrescriptionsModal, setShowPrescriptionsModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [prescriptionUploadLoading, setPrescriptionUploadLoading] = useState(false);
  const [prescriptionUploadError, setPrescriptionUploadError] = useState('');
  const [prescriptionUploadSuccess, setPrescriptionUploadSuccess] = useState('');

  // Chat modal state
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatPatientId, setChatPatientId] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatSendLoading, setChatSendLoading] = useState(false);

  // Add state for selected appointment for chat
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  // Doctor profile state
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({ specialization: '', schedule: '', availability: '' });
  const [profileUpdateLoading, setProfileUpdateLoading] = useState(false);
  const [profileUpdateError, setProfileUpdateError] = useState('');
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState('');
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [doctorId, setDoctorId] = useState<number | null>(null);

  const navigate = useNavigate();

  // Fetch doctor profile for this user
  useEffect(() => {
    if (!userId) return;
    api.get(`/doctors/by_user/${userId}`)
      .then(res => {
        setDoctorProfile(res.data);
        setDoctorId(res.data.id);
        setProfile(res.data);
        setProfileForm({
          specialization: res.data.specialization || '',
          schedule: res.data.schedule || '',
          availability: res.data.availability || '',
        });
      })
      .catch(() => {
        setDoctorProfile(null);
        setDoctorId(null);
        setProfileError('Failed to load profile.');
      })
      .finally(() => setProfileLoading(false));
  }, [userId]);

  // Filter appointments using doctorId
  const fetchAppointments = () => {
    if (!doctorId) return;
    setAppointmentsLoading(true);
    setAppointmentsError('');
    api.get('/appointments/')
      .then(res => {
        const filtered = res.data.filter((appt: any) => appt.doctor && appt.doctor.id == doctorId);
        setAppointments(filtered);
        console.log('DoctorDashboard appointments:', filtered);
      })
      .catch(() => setAppointmentsError('Failed to load appointments.'))
      .finally(() => setAppointmentsLoading(false));
  };
  useEffect(() => {
    fetchAppointments();
  }, [doctorId]);

  useEffect(() => {
    if (doctorId) {
      console.log('DoctorDashboard doctorId:', doctorId);
    }
  }, [doctorId]);

  // Fetch messages for this doctor
  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    if (!doctorId) return;
    setMessagesLoading(true);
    setMessagesError('');
    api.get('/messages/')
      .then(res => {
        // Show all messages for this doctor
        const relevant = res.data.filter((msg: any) => msg.appointment_id && msg.sender && msg.appointment && msg.appointment.doctor && msg.appointment.doctor.id == doctorId);
        setMessages(relevant);
        // Count unread (not sent by this doctor)
        let userId = null;
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) userId = JSON.parse(userStr).id;
        } catch {}
        const unread = relevant.filter(msg => msg.sender && msg.sender.id !== userId).length;
        setUnreadCount(unread);
      })
      .catch(() => setMessagesError('Failed to load messages.'))
      .finally(() => setMessagesLoading(false));
  }, [doctorId]);

  // Poll for new messages every 10 seconds
  useEffect(() => {
    if (!doctorId) return;
    const fetchMessages = () => {
      api.get('/messages/').then(res => {
        // Show all messages for this doctor
        const relevant = res.data.filter((msg: any) => msg.appointment_id && msg.sender && msg.appointment && msg.appointment.doctor && msg.appointment.doctor.id == doctorId);
        setMessages(relevant);
        // Count unread (not sent by this doctor)
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
  }, [doctorId]);

  // Fetch medical records
  useEffect(() => {
    if (!doctorId) return;
    setRecordsLoading(true);
    setRecordsError('');
    api.get('/medical-records/')
      .then(res => {
        setRecords(res.data.filter((rec: any) => rec.doctor_id === doctorId));
      })
      .catch(() => setRecordsError('Failed to load records.'))
      .finally(() => setRecordsLoading(false));
  }, [doctorId]);

  // Fetch prescriptions
  useEffect(() => {
    if (!doctorId) return;
    setPrescriptionsLoading(true);
    setPrescriptionsError('');
    api.get('/prescriptions/')
      .then(res => {
        setPrescriptions(res.data.filter((p: any) => p.doctor_id === doctorId));
      })
      .catch(() => setPrescriptionsError('Failed to load prescriptions.'))
      .finally(() => setPrescriptionsLoading(false));
  }, [doctorId]);

  // Accept/Reject appointment
  const handleStatus = async (id: number, status: string) => {
    setActionLoading(id);
    setActionError('');
    try {
      const appt = appointments.find(a => a.id === id);
      await api.put(`/appointments/${id}`, {
        doctor_id: appt.doctor.id,
        patient_id: appt.patient.id,
        scheduled_time: appt.scheduled_time,
        status,
      });
      fetchAppointments(); // Refresh appointments after status change
      setAppointments(appts => appts.map(a => a.id === id ? { ...a, status } : a));
    } catch (err: any) {
      setActionError('Failed to update appointment.');
    } finally {
      setActionLoading(null);
    }
  };

  // Upload medical record
  const handleRecordUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRecordUploadLoading(true);
    setRecordUploadError('');
    setRecordUploadSuccess('');
    if (!recordFile || !doctorId) {
      setRecordUploadError('Please select a file.');
      setRecordUploadLoading(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', recordFile);
      formData.append('doctor_id', String(doctorId));
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

  // Upload prescription
  const handlePrescriptionUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPrescriptionUploadLoading(true);
    setPrescriptionUploadError('');
    setPrescriptionUploadSuccess('');
    if (!prescriptionFile || !doctorId) {
      setPrescriptionUploadError('Please select a file.');
      setPrescriptionUploadLoading(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', prescriptionFile);
      formData.append('doctor_id', String(doctorId));
      await api.post('/prescriptions/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPrescriptionUploadSuccess('Prescription uploaded!');
      setPrescriptionFile(null);
      setTimeout(() => setShowPrescriptionModal(false), 1200);
    } catch (err: any) {
      setPrescriptionUploadError('Failed to upload prescription.');
    } finally {
      setPrescriptionUploadLoading(false);
    }
  };

  // Open chat with a patient for a specific appointment
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
      setTimeout(() => navigate('/doctor/messages'), 500);
    } catch {
      setChatError('Failed to send message.');
    } finally {
      setChatSendLoading(false);
    }
  };

  // Handle profile form input
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  // Update profile
  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileUpdateLoading(true);
    setProfileUpdateError('');
    setProfileUpdateSuccess('');
    try {
      await api.put(`/doctors/${doctorId}`, {
        ...profileForm,
      });
      setProfileUpdateSuccess('Profile updated!');
      setTimeout(() => setShowProfileModal(false), 1200);
    } catch {
      setProfileUpdateError('Failed to update profile.');
    } finally {
      setProfileUpdateLoading(false);
    }
  };

  return (
    <Container fluid className="bg-light min-vh-100 p-0">
      <Row className="bg-primary bg-gradient text-white py-4 px-3 align-items-center shadow-sm rounded-bottom">
        <Col md={8}>
          <h2 className="fw-bold mb-0">Welcome, {doctorName}</h2>
          <div className="text-white-50">
            {profileLoading ? <Spinner animation="border" size="sm" /> : profileError ? <span className="text-danger">{profileError}</span> : profile ? (
              <>
                Specialization: {profile.specialization || 'N/A'}<br />
                Schedule: {profile.schedule || 'N/A'}<br />
                Availability: {profile.availability || 'N/A'}
              </>
            ) : null}
          </div>
        </Col>
        <Col md={4} className="text-md-end mt-3 mt-md-0">
          <Button variant="light" className="me-2 text-primary fw-bold" onClick={() => setShowProfileModal(true)}>Manage Profile</Button>
          <Button variant="outline-light" className="fw-bold">View Patients</Button>
        </Col>
      </Row>
      <Container className="py-5">
        <Row className="mb-4 g-4">
          <Col md={6} lg={4}>
            <Card className="shadow border-0 h-100" style={{ background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)' }}>
              <Card.Body>
                <h5 className="fw-bold text-primary mb-3">Upcoming Appointments</h5>
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
                          <span className="fw-semibold">{appt.scheduled_time?.split('T')[0]} at {appt.scheduled_time?.split('T')[1]?.slice(0,5)}</span> with <span className="text-primary">{appt.patient?.user?.name || appt.patient?.id}</span>
                          <div className="small text-muted">{appt.type || 'Consultation'}</div>
                        </div>
                        <div>
                          <Badge bg={appt.status === 'pending' ? 'warning' : appt.status === 'accepted' ? 'success' : 'secondary'}>{appt.status}</Badge>
                          {appt.status === 'pending' && (
                            <>
                              <Button size="sm" variant="success" className="ms-2 shadow-sm" style={{ borderRadius: 20 }} disabled={actionLoading === appt.id} onClick={() => handleStatus(appt.id, 'accepted')}>{actionLoading === appt.id ? <Spinner animation="border" size="sm" /> : 'Accept'}</Button>
                              <Button size="sm" variant="danger" className="ms-2 shadow-sm" style={{ borderRadius: 20 }} disabled={actionLoading === appt.id} onClick={() => handleStatus(appt.id, 'rejected')}>{actionLoading === appt.id ? <Spinner animation="border" size="sm" /> : 'Reject'}</Button>
                            </>
                          )}
                          <Button variant="outline-primary" size="sm" className="ms-2" onClick={() => handleOpenChat(appt)}>
                            Message Patient
                          </Button>
                        </div>
                      </ListGroup.Item>
                    ))
                  )}
                </ListGroup>
                {actionError && <Alert variant="danger" className="mt-2">{actionError}</Alert>}
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={4}>
            <Card className="shadow border-0 h-100" style={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }}>
              <Card.Body>
                <h5 className="fw-bold text-primary mb-3">Quick Actions</h5>
                <Button variant="outline-primary" className="mb-2 w-100 shadow-sm quick-action-btn" style={{ borderRadius: 20 }} onClick={() => setShowPrescriptionModal(true)}>Write Prescription</Button>
                <Button variant="outline-primary" className="mb-2 w-100 shadow-sm quick-action-btn" style={{ borderRadius: 20 }} onClick={() => setShowRecordModal(true)}>Upload Medical Record</Button>
                <Button variant="outline-primary" className="w-100 shadow-sm quick-action-btn" style={{ borderRadius: 20 }} onClick={() => setShowPrescriptionsModal(true)}>View Prescriptions</Button>
                <Button variant="outline-primary" className="w-100 shadow-sm quick-action-btn" style={{ borderRadius: 20 }} onClick={() => appointments.length > 0 && handleOpenChat(appointments[0])}>Message Patient</Button>
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
                    messages.map((msg, idx) => (
                      <ListGroup.Item key={idx} className="d-flex justify-content-between align-items-start">
                        <div>
                          <div className="fw-semibold text-primary">{msg.sender?.id === doctorId ? 'You' : (msg.sender?.role === 'patient' ? 'Patient' : 'Doctor')}</div>
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
      </Container>
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
              <Form.Control type="file" onChange={e => setRecordFile(e.target.files?.[0] || null)} required />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100 shadow-sm" style={{ borderRadius: 20 }} disabled={recordUploadLoading}>
              {recordUploadLoading ? <Spinner animation="border" size="sm" /> : 'Upload'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      {/* Write Prescription Modal */}
      <Modal show={showPrescriptionModal} onHide={() => setShowPrescriptionModal(false)} centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>Write Prescription</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {prescriptionUploadError && <Alert variant="danger">{prescriptionUploadError}</Alert>}
          {prescriptionUploadSuccess && <Alert variant="success">{prescriptionUploadSuccess}</Alert>}
          <Form onSubmit={handlePrescriptionUpload}>
            <Form.Group className="mb-3">
              <Form.Label>File</Form.Label>
              <Form.Control type="file" onChange={e => setPrescriptionFile(e.target.files?.[0] || null)} required />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100 shadow-sm" style={{ borderRadius: 20 }} disabled={prescriptionUploadLoading}>
              {prescriptionUploadLoading ? <Spinner animation="border" size="sm" /> : 'Upload'}
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
          <Modal.Title>Chat with {selectedAppointment?.patient?.user?.name || ''}</Modal.Title>
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
      {/* Doctor Profile Modal */}
      <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {profileUpdateError && <Alert variant="danger">{profileUpdateError}</Alert>}
          {profileUpdateSuccess && <Alert variant="success">{profileUpdateSuccess}</Alert>}
          <Form onSubmit={handleProfileUpdate}>
            <Form.Group className="mb-3">
              <Form.Label>Specialization</Form.Label>
              <Form.Control name="specialization" value={profileForm.specialization} onChange={handleProfileChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Schedule</Form.Label>
              <Form.Control name="schedule" value={profileForm.schedule} onChange={handleProfileChange} placeholder="e.g. Mon-Fri 9am-5pm" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Availability</Form.Label>
              <Form.Control name="availability" value={profileForm.availability} onChange={handleProfileChange} placeholder="e.g. Available, On Leave" />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100 shadow-sm" style={{ borderRadius: 20 }} disabled={profileUpdateLoading}>
              {profileUpdateLoading ? <Spinner animation="border" size="sm" /> : 'Update'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default DoctorDashboard;

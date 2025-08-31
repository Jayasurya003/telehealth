import React, { useEffect, useState } from 'react';
import { Container, Row, Col, ListGroup, Badge, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import api from '../api/axios';

const DoctorMessages: React.FC = () => {
  console.log('DoctorMessages mounted');
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatSendLoading, setChatSendLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [readConvs, setReadConvs] = useState<Set<number>>(new Set());

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) setUserId(JSON.parse(userStr).id);
    } catch {}
  }, []);

  // Fetch all appointments for this doctor
  useEffect(() => {
    if (!userId) return;
    api.get('/appointments/').then(res => setAppointments(res.data));
  }, [userId]);

  // Fetch all messages and group by patient/appointment
  useEffect(() => {
    console.log('DoctorMessages userId:', userId);
    if (!userId) return;
    setLoading(true);
    api.get('/messages/').then(res => {
      console.log('DoctorMessages /messages/ API response:', res.data);
      const grouped: { [key: string]: any } = {};
      res.data.forEach((msg: any) => {
        const appt = appointments.find(a => a.id === msg.appointment_id && a.doctor && a.doctor.user && a.doctor.user.id === userId);
        if (appt) {
          const key = msg.appointment_id;
          if (!grouped[key]) {
            grouped[key] = {
              appointment: appt,
              patient: appt.patient,
              messages: [],
              unread: 0,
            };
          }
          grouped[key].messages.push(msg);
          if (msg.sender && msg.sender.id !== userId) grouped[key].unread++;
        }
      });
      setConversations(Object.values(grouped));
      setLoading(false);
    });
  }, [userId, appointments]);

  // Load readConvs from localStorage on mount and when userId changes
  useEffect(() => {
    if (!userId) return;
    const key = `doctor_read_convs_${userId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setReadConvs(new Set(JSON.parse(stored)));
      } catch {}
    }
  }, [userId]);

  // When a conversation is selected, show its messages and persist as read
  useEffect(() => {
    if (selectedConv && userId) {
      setMessages(selectedConv.messages);
      setChatError('');
      setReadConvs(prev => {
        const updated = new Set([...prev, selectedConv.appointment.id]);
        localStorage.setItem(`doctor_read_convs_${userId}`, JSON.stringify(Array.from(updated)));
        return updated;
      });
    }
  }, [selectedConv, userId]);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedConv) return;
    setChatSendLoading(true);
    try {
      const res = await api.post('/messages/', {
        content: chatInput,
        appointment_id: selectedConv.appointment.id,
        sender_id: userId,
      });
      setMessages(msgs => [...msgs, res.data]);
      setChatInput('');
      setChatError('');
    } catch {
      setChatError('Failed to send message.');
    } finally {
      setChatSendLoading(false);
    }
  };

  return (
    <Container fluid className="py-4" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)' }}>
      <Row>
        <Col md={4} className="border-end">
          <h5 className="fw-bold mb-3">Conversations</h5>
          {loading ? <Spinner animation="border" /> : (
            <ListGroup>
              {conversations.length === 0 && <div className="text-muted small px-3 py-2">No conversations yet.</div>}
              {conversations.map((conv, idx) => (
                <ListGroup.Item
                  key={conv.appointment.id}
                  action
                  active={selectedConv && selectedConv.appointment.id === conv.appointment.id}
                  onClick={() => setSelectedConv(conv)}
                  className="d-flex align-items-center py-3 px-2 border-0 shadow-sm mb-2 rounded"
                  style={{ background: selectedConv && selectedConv.appointment.id === conv.appointment.id ? 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)' : '#fff', cursor: 'pointer' }}
                >
                  <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center me-3" style={{ width: 40, height: 40, fontWeight: 600, fontSize: 18 }}>
                    {conv.patient.user.name.charAt(0)}
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-semibold">{conv.patient.user.name}</div>
                    <div className="small text-muted">Appt: {conv.appointment.scheduled_time?.split('T')[0]}</div>
                  </div>
                  {conv.unread > 0 && !readConvs.has(conv.appointment.id) && <Badge bg="danger">{conv.unread}</Badge>}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
        <Col md={8}>
          <h5 className="fw-bold mb-3">{selectedConv ? `Chat with ${selectedConv.patient.user.name}` : 'Select a conversation'}</h5>
          <Card className="mb-3 shadow-sm" style={{ minHeight: 300, maxHeight: 400, overflowY: 'auto', background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)' }}>
            <Card.Body>
              {selectedConv ? (
                messages.length === 0 ? (
                  <div className="text-muted small py-2">No messages yet.</div>
                ) : (
                  messages.map((msg: any, idx: number) => {
                    let senderLabel = '';
                    if (msg.sender && msg.sender.id === userId) {
                      senderLabel = 'You';
                    } else if (msg.sender && msg.sender.role === 'doctor') {
                      senderLabel = 'Doctor';
                    } else if (msg.sender && msg.sender.role === 'patient') {
                      senderLabel = 'Patient';
                    }
                    const isMe = msg.sender && msg.sender.id === userId;
                    return (
                      <div key={idx} className={`d-flex ${isMe ? 'justify-content-end' : 'justify-content-start'} mb-2`}>
                        <div style={{ maxWidth: '70%' }}>
                          <div className={`px-3 py-2 rounded-4 ${isMe ? 'bg-success text-white' : 'bg-white border'}`} style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                            <div className="small fw-bold mb-1">{senderLabel}</div>
                            <div>{msg.content}</div>
                            <div className="text-end small text-muted mt-1" style={{ fontSize: 11 }}>{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )
              ) : (
                <div className="text-muted small py-2">Select a conversation to view messages.</div>
              )}
            </Card.Body>
          </Card>
          {selectedConv && (
            <Form onSubmit={handleSendMessage} className="d-flex gap-2">
              <Form.Control type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type a message..." disabled={chatSendLoading} />
              <Button type="submit" variant="primary" disabled={chatSendLoading || !chatInput.trim()}>{chatSendLoading ? <Spinner animation="border" size="sm" /> : 'Send'}</Button>
            </Form>
          )}
          {chatError && <Alert variant="danger" className="mt-2">{chatError}</Alert>}
        </Col>
      </Row>
    </Container>
  );
};

export default DoctorMessages;

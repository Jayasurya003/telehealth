import React, { useState } from 'react';
import { Carousel, Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../AuthContext';

const carouselsByRole = {
  patient: [
    {
      src: 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&w=900&q=80',
      title: 'Patient Portal',
      desc: 'Book appointments, chat with doctors, and manage your health online.'
    },
    {
      src: 'https://images.pexels.com/photos/6749774/pexels-photo-6749774.jpeg?auto=compress&w=900&q=80',
      title: 'Your Health, Anywhere',
      desc: 'Access your medical records and e-prescriptions anytime.'
    }
  ],
  doctor: [
    {
      src: 'https://images.pexels.com/photos/8460158/pexels-photo-8460158.jpeg?auto=compress&w=900&q=80',
      title: 'Doctor Portal',
      desc: 'Manage appointments, patients, and prescriptions with ease.'
    },
    {
      src: 'https://images.pexels.com/photos/8376293/pexels-photo-8376293.jpeg?auto=compress&w=900&q=80',
      title: 'Connect with Patients',
      desc: 'Provide care and consultations from anywhere.'
    }
  ],
  admin: [
    {
      src: 'https://images.pexels.com/photos/7578801/pexels-photo-7578801.jpeg?auto=compress&w=900&q=80',
      title: 'Admin Panel',
      desc: 'Manage doctors, patients, and appointments securely.'
    },
    {
      src: 'https://images.pexels.com/photos/8460158/pexels-photo-8460158.jpeg?auto=compress&w=900&q=80',
      title: 'System Overview',
      desc: 'Oversee the telehealth platform with powerful tools.'
    }
  ],
  default: [
    {
      src: 'https://images.unsplash.com/photo-1519494080410-f9aa8f52f1e1?auto=format&fit=crop&w=900&q=80',
      title: 'Welcome to Telehealth',
      desc: 'Book appointments and chat with your doctor online.'
    },
    {
      src: 'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=900&q=80',
      title: 'Manage Your Health',
      desc: 'Access medical records and e-prescriptions anytime.'
    }
  ]
};

function getRoleFromQuery(search: string) {
  const params = new URLSearchParams(search);
  const role = params.get('role');
  if (role === 'patient' || role === 'doctor' || role === 'admin') return role;
  return 'default';
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const role = getRoleFromQuery(location.search);
  const carouselItems = carouselsByRole[role] || carouselsByRole.default;
  const { login: authLogin } = useAuth();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidated(true);
    setError('');
    if (!email || !password) return;
    setLoading(true);
    try {
      const payload = { email, password };
      const res = await api.post('/auth/login', payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      // Use AuthContext login
      authLogin(res.data.user, res.data.access_token);
      if (res.data.user && res.data.user.role) {
        if (res.data.user.role === 'doctor') {
          navigate('/doctor');
        } else if (res.data.user.role === 'patient') {
          navigate('/patient');
        } else if (res.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        setError('Login succeeded but user info is missing in response.');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <Row className="shadow-lg rounded-4 overflow-hidden w-100" style={{ maxWidth: 900 }}>
        <Col md={6} className="p-0 d-none d-md-block bg-primary bg-gradient">
          <Carousel controls={false} indicators={false} interval={3500} fade>
            {carouselItems.map((item, idx) => (
              <Carousel.Item key={idx}>
                <div style={{height: '100%', minHeight: 420, background: `url(${item.src}) center/cover no-repeat`, filter: 'brightness(0.7)'}} />
                <Carousel.Caption className="mb-5">
                  <h3 className="fw-bold text-shadow">{item.title}</h3>
                  <p className="lead text-shadow">{item.desc}</p>
                </Carousel.Caption>
              </Carousel.Item>
            ))}
          </Carousel>
        </Col>
        <Col md={6} xs={12} className="bg-white p-5 d-flex flex-column justify-content-center">
          <div className="mb-4 text-center">
            <img src="/vite.svg" alt="Telehealth Logo" width={60} className="mb-2" />
            <h2 className="fw-bold mb-0">Sign in to Telehealth</h2>
            <p className="text-muted">Access your health, anywhere.</p>
          </div>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="loginEmail">Email address</Form.Label>
              <Form.Control
                required
                type="email"
                id="loginEmail"
                name="email"
                placeholder="Enter email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoFocus
              />
              <Form.Control.Feedback type="invalid">
                Please enter a valid email.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="loginPassword">Password</Form.Label>
              <Form.Control
                required
                type="password"
                id="loginPassword"
                name="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <Form.Control.Feedback type="invalid">
                Please enter your password.
              </Form.Control.Feedback>
            </Form.Group>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Form.Check type="checkbox" label="Remember me" />
              <Link to="/forgot-password" className="small text-primary">Forgot password?</Link>
            </div>
            <Button variant="primary" type="submit" className="w-100" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </Button>
          </Form>
          <div className="text-center mt-4">
            <span className="text-muted">Don't have an account? </span>
            <Link to="/register">Register</Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;

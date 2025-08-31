import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';

function getRoleFromQuery(search: string) {
  const params = new URLSearchParams(search);
  const role = params.get('role');
  if (role === 'patient' || role === 'doctor') return role;
  return undefined;
}

const Register: React.FC = () => {
  const location = useLocation();
  const preselectedRole = getRoleFromQuery(location.search);
  const isRolePreselected = !!preselectedRole;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState(preselectedRole || 'patient');
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidated(true);
    setError('');
    setSuccess('');
    if (!name || !email || !password || !confirmPassword || !role) return;
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', { name, email, password, role });
      setSuccess('Registration successful! You can now log in.');
      setTimeout(() => navigate('/'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <Row className="w-100 justify-content-center">
        <Col md={7} lg={5}>
          <Card className="shadow-lg rounded-4 p-4">
            <Card.Body>
              <div className="mb-4 text-center">
                <img src="/vite.svg" alt="Telehealth Logo" width={60} className="mb-2" />
                <h2 className="fw-bold mb-0">Create an Account</h2>
                <p className="text-muted">Join Telehealth as a patient or doctor</p>
              </div>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formName">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter your name.
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    required
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter a valid email.
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    required
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter a password.
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formConfirmPassword">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    required
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please confirm your password.
                  </Form.Control.Feedback>
                </Form.Group>
                {/* Only show role selector if not preselected by query param */}
                {!isRolePreselected ? (
                  <Form.Group className="mb-4" controlId="formRole">
                    <Form.Label>Role</Form.Label>
                    <Form.Select value={role} onChange={e => setRole(e.target.value)} required>
                      <option value="patient">Patient</option>
                      <option value="doctor">Doctor</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      Please select a role.
                    </Form.Control.Feedback>
                  </Form.Group>
                ) : (
                  <input type="hidden" name="role" value={role} />
                )}
                <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                  {loading ? 'Registering...' : 'Register'}
                </Button>
              </Form>
              <div className="text-center mt-4">
                <span className="text-muted">Already have an account? </span>
                <Link to="/">Login</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;

import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [validated, setValidated] = useState(false);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidated(true);
    setSuccess('');
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setSuccess('If this email exists, a password reset link has been sent.');
      setLoading(false);
    }, 1200);
  };

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <Row className="w-100 justify-content-center">
        <Col md={7} lg={5}>
          <Card className="shadow-lg rounded-4 p-4">
            <Card.Body>
              <div className="mb-4 text-center">
                <img src="/vite.svg" alt="Telehealth Logo" width={60} className="mb-2" />
                <h2 className="fw-bold mb-0">Forgot Password?</h2>
                <p className="text-muted">Enter your email to receive a reset link</p>
              </div>
              {success && <Alert variant="success">{success}</Alert>}
              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    required
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoFocus
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter a valid email.
                  </Form.Control.Feedback>
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </Form>
              <div className="text-center mt-4">
                <span className="text-muted">Back to </span>
                <Link to="/">Login</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPassword;





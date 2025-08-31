import React from 'react';
import { Container, Row, Col, Card, Button, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUserMd, FaUserInjured, FaUserShield, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

const carouselItems = [
  {
    src: 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&w=1200&q=80',
    title: 'Welcome to Telehealth',
    desc: 'Book appointments, chat with your doctor, and manage your health online.'
  },
  {
    src: 'https://images.pexels.com/photos/6749774/pexels-photo-6749774.jpeg?auto=compress&w=1200&q=80',
    title: 'Manage Your Health',
    desc: 'Access medical records and e-prescriptions anytime, anywhere.'
  },
  {
    src: 'https://images.pexels.com/photos/8460158/pexels-photo-8460158.jpeg?auto=compress&w=1200&q=80',
    title: 'Connect with Experts',
    desc: 'Consult with top doctors and specialists from the comfort of your home.'
  }
];

const Home: React.FC = () => (
  <>
    <Carousel controls={true} indicators={true} interval={4000} fade>
      {carouselItems.map((item, idx) => (
        <Carousel.Item key={idx}>
          <div style={{
            height: 400,
            background: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url(${item.src}) center/cover no-repeat`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }} />
          <Carousel.Caption className="mb-5">
            <h2 className="fw-bold text-shadow display-5" style={{ textShadow: '0 2px 8px #222' }}>{item.title}</h2>
            <p className="lead text-shadow" style={{ textShadow: '0 2px 8px #222' }}>{item.desc}</p>
          </Carousel.Caption>
        </Carousel.Item>
      ))}
    </Carousel>
    <Container className="py-5">
      <h1 className="text-center mb-5 fw-bold">Welcome to Telehealth</h1>
      <Row className="g-4 justify-content-center">
        <Col md={4}>
          <Card className="shadow border-0 h-100" style={{ background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)' }}>
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <FaUserInjured size={48} style={{ color: '#0d6efd', marginBottom: 16 }} />
              <Card.Title className="fw-bold text-primary">Patient Dashboard</Card.Title>
              <Card.Text className="text-center">Book appointments, chat with doctors, view prescriptions and records.</Card.Text>
              <Button as={Link as any} to="/login?role=patient" variant="primary" className="mt-2 w-100">Go to Patient Login</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow border-0 h-100" style={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }}>
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <FaUserMd size={48} style={{ color: '#17a2b8', marginBottom: 16 }} />
              <Card.Title className="fw-bold" style={{ color: '#17a2b8' }}>Doctor Dashboard</Card.Title>
              <Card.Text className="text-center">Manage appointments, patients, prescriptions, and availability.</Card.Text>
              <Button as={Link as any} to="/login?role=doctor" variant="info" className="mt-2 w-100 text-white">Go to Doctor Login</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow border-0 h-100" style={{ background: 'linear-gradient(135deg, #f8ffae 0%, #43c6ac 100%)' }}>
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <FaUserShield size={48} style={{ color: '#198754', marginBottom: 16 }} />
              <Card.Title className="fw-bold text-success">Admin Panel</Card.Title>
              <Card.Text className="text-center">Manage doctors, patients, and appointments.</Card.Text>
              <Button as={Link as any} to="/login?role=admin" variant="success" className="mt-2 w-100 text-white">Go to Admin Login</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="g-4 justify-content-center mt-4">
        <Col md={4}>
          <Card className="shadow border-0 h-100">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <FaSignInAlt size={36} style={{ color: '#0d6efd', marginBottom: 8 }} />
              <Card.Title className="fw-bold">Login</Card.Title>
              <Card.Text className="text-center">Sign in to your account to access your dashboard.</Card.Text>
              <Button as={Link as any} to="/login" variant="outline-primary" className="mt-2 w-100">Login</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow border-0 h-100">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <FaUserPlus size={36} style={{ color: '#198754', marginBottom: 8 }} />
              <Card.Title className="fw-bold">Register</Card.Title>
              <Card.Text className="text-center">Create a new account as a patient or doctor.</Card.Text>
              <Button as={Link as any} to="/register" variant="outline-success" className="mt-2 w-100">Register</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* Testimonials Section */}
      <Row className="justify-content-center mt-5">
        <Col md={10}>
          <h2 className="text-center fw-bold mb-4" style={{ color: '#0d6efd' }}>What Our Users Say</h2>
          <Carousel indicators={false} interval={6000} className="mb-5">
            <Carousel.Item>
              <Card className="shadow border-0 mx-auto" style={{ maxWidth: 700, background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)' }}>
                <Card.Body className="p-4">
                  <blockquote className="blockquote mb-0">
                    <p className="fs-5">“Booking appointments and chatting with my doctor online is so easy. Telehealth has made managing my health stress-free!”</p>
                    <footer className="blockquote-footer mt-3">Jane Smith, <cite title="Patient">Patient</cite></footer>
                  </blockquote>
                </Card.Body>
              </Card>
            </Carousel.Item>
            <Carousel.Item>
              <Card className="shadow border-0 mx-auto" style={{ maxWidth: 700, background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }}>
                <Card.Body className="p-4">
                  <blockquote className="blockquote mb-0">
                    <p className="fs-5">“I can manage my schedule, accept appointments, and send prescriptions all in one place. The platform is a game changer for doctors.”</p>
                    <footer className="blockquote-footer mt-3">Dr. Dinesh Kumar, <cite title="Doctor">Doctor</cite></footer>
                  </blockquote>
                </Card.Body>
              </Card>
            </Carousel.Item>
            <Carousel.Item>
              <Card className="shadow border-0 mx-auto" style={{ maxWidth: 700, background: 'linear-gradient(135deg, #f8ffae 0%, #43c6ac 100%)' }}>
                <Card.Body className="p-4">
                  <blockquote className="blockquote mb-0">
                    <p className="fs-5">“Managing doctors, patients, and appointments is seamless. The admin panel is intuitive and powerful.”</p>
                    <footer className="blockquote-footer mt-3">Priya Sharma, <cite title="Admin">Admin</cite></footer>
                  </blockquote>
                </Card.Body>
              </Card>
            </Carousel.Item>
          </Carousel>
        </Col>
      </Row>
    </Container>
  </>
);

export default Home;

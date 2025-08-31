import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const AppNavbar = () => {
  const { user, logout } = useAuth();

  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand
          as={Link}
          to={user ? (user.role === 'doctor' ? '/doctor' : user.role === 'patient' ? '/patient' : user.role === 'admin' ? '/admin' : '/') : '/'}
        >
          Telehealth
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {!user && <Nav.Link as={Link} to="/login">Login</Nav.Link>}
            {!user && <Nav.Link as={Link} to="/register">Register</Nav.Link>}
            {user && user.role === 'doctor' && (
              <>
                <Nav.Link as={Link} to="/doctor">Doctor Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/doctor/messages">Messages</Nav.Link>
              </>
            )}
            {user && user.role === 'patient' && (
              <>
                <Nav.Link as={Link} to="/patient">Patient Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/patient/messages">Messages</Nav.Link>
              </>
            )}
            {user && user.role === 'admin' && (
              <Nav.Link as={Link} to="/admin">Admin Panel</Nav.Link>
            )}
          </Nav>
          {user && (
            <Nav className="ms-auto">
              <Nav.Link onClick={logout}>Logout</Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;

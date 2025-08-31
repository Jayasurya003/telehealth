import React, { useEffect, useState } from 'react';
import { Table, Button, Spinner, Alert, Tabs, Tab, Container } from 'react-bootstrap';
import api from '../api/axios';

const AdminPanel: React.FC = () => {
  // State
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('doctors');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Fetch all data
  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([
      api.get('/doctors/'),
      api.get('/patients/'),
      api.get('/appointments/'),
    ])
      .then(([d, p, a]) => {
        setDoctors(d.data);
        setPatients(p.data);
        setAppointments(a.data);
      })
      .catch(() => setError('Failed to load admin data.'))
      .finally(() => setLoading(false));
  }, []);

  // Delete doctor/patient/appointment
  const handleDelete = async (type: string, id: number) => {
    setDeleteLoading(true);
    setDeleteError('');
    try {
      // Assume DELETE endpoints exist: /doctors/{id}, /patients/{id}, /appointments/{id}
      await api.delete(`/${type}/${id}`);
      if (type === 'doctors') setDoctors(ds => ds.filter(d => d.id !== id));
      if (type === 'patients') setPatients(ps => ps.filter(p => p.id !== id));
      if (type === 'appointments') setAppointments(as => as.filter(a => a.id !== id));
    } catch {
      setDeleteError('Failed to delete.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <h2>Admin Panel</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Tabs activeKey={tab} onSelect={k => setTab(k || 'doctors')} className="mb-3">
        <Tab eventKey="doctors" title="Doctors">
          {loading ? <Spinner animation="border" /> : (
            <Table striped bordered hover>
              <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Actions</th></tr></thead>
              <tbody>
                {doctors.map(doc => (
                  <tr key={doc.id}>
                    <td>{doc.id}</td>
                    <td>{doc.user?.name || doc.name}</td>
                    <td>{doc.user?.email || doc.email}</td>
                    <td>
                      <Button variant="danger" size="sm" disabled={deleteLoading} onClick={() => handleDelete('doctors', doc.id)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Tab>
        <Tab eventKey="patients" title="Patients">
          {loading ? <Spinner animation="border" /> : (
            <Table striped bordered hover>
              <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Actions</th></tr></thead>
              <tbody>
                {patients.map(pat => (
                  <tr key={pat.id}>
                    <td>{pat.id}</td>
                    <td>{pat.user?.name || pat.name}</td>
                    <td>{pat.user?.email || pat.email}</td>
                    <td>
                      <Button variant="danger" size="sm" disabled={deleteLoading} onClick={() => handleDelete('patients', pat.id)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Tab>
        <Tab eventKey="appointments" title="Appointments">
          {loading ? <Spinner animation="border" /> : (
            <Table striped bordered hover>
              <thead><tr><th>ID</th><th>Doctor</th><th>Patient</th><th>Date/Time</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {appointments.map(appt => (
                  <tr key={appt.id}>
                    <td>{appt.id}</td>
                    <td>{appt.doctor_id}</td>
                    <td>{appt.patient_id}</td>
                    <td>{appt.scheduled_time}</td>
                    <td>{appt.status}</td>
                    <td>
                      <Button variant="danger" size="sm" disabled={deleteLoading} onClick={() => handleDelete('appointments', appt.id)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Tab>
      </Tabs>
      {deleteError && <Alert variant="danger">{deleteError}</Alert>}
    </Container>
  );
};

export default AdminPanel;

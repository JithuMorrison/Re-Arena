import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const TherapistDashboard = () => {
  const { currentUser } = useAuth();
  const [patients, setPatients] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    email: '',
    age: '',
    condition: ''
  });

  useEffect(() => {
    fetchPatients();
    fetchSessions();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/therapist/patients?therapistId=${currentUser.id}`);
      const data = await response.json();
      if (response.ok) {
        setPatients(data.patients);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/sessions?userId=${currentUser.id}&userType=therapist`);
      const data = await response.json();
      if (response.ok) {
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/therapist/add-patient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          therapistId: currentUser.id,
          patient: newPatient
        }),
      });
      
      const data = await response.json();
      if (response.ok) {
        setPatients([...patients, { ...newPatient, _id: data.patientId }]);
        setNewPatient({ name: '', email: '', age: '', condition: '' });
        setShowAddPatient(false);
      }
    } catch (error) {
      console.error('Error adding patient:', error);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 col-lg-2 sidebar bg-primary text-white vh-100">
          <div className="d-flex flex-column p-3">
            <h4 className="text-center mb-4">Therapist Panel</h4>
            <ul className="nav nav-pills flex-column">
              <li className="nav-item">
                <a href="#" className="nav-link active text-white">Dashboard</a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link text-white">Patients</a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link text-white">Sessions</a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link text-white">Reports</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9 col-lg-10 p-4">
          <h2 className="mb-4">Therapist Dashboard</h2>
          
          {/* Stats Cards */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card stat-card">
                <div className="card-body">
                  <h5 className="card-title">Total Patients</h5>
                  <h2 className="card-text">{patients.length}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card stat-card">
                <div className="card-body">
                  <h5 className="card-title">Sessions</h5>
                  <h2 className="card-text">{sessions.length}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card stat-card">
                <div className="card-body">
                  <h5 className="card-title">Avg. Rating</h5>
                  <h2 className="card-text">
                    {sessions.length > 0 
                      ? (sessions.reduce((sum, session) => sum + session.rating, 0) / sessions.length).toFixed(1)
                      : '0.0'
                    }
                  </h2>
                </div>
              </div>
            </div>
          </div>

          {/* Patients Section */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Patients</h4>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowAddPatient(true)}
                >
                  Add New Patient
                </button>
              </div>

              {showAddPatient && (
                <div className="card mb-4">
                  <div className="card-body">
                    <h5 className="card-title">Add New Patient</h5>
                    <form onSubmit={handleAddPatient}>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Name</label>
                          <input
                            type="text"
                            className="form-control"
                            value={newPatient.name}
                            onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Email</label>
                          <input
                            type="email"
                            className="form-control"
                            value={newPatient.email}
                            onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Age</label>
                          <input
                            type="number"
                            className="form-control"
                            value={newPatient.age}
                            onChange={(e) => setNewPatient({...newPatient, age: e.target.value})}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Condition</label>
                          <input
                            type="text"
                            className="form-control"
                            value={newPatient.condition}
                            onChange={(e) => setNewPatient({...newPatient, condition: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-success">Add Patient</button>
                        <button 
                          type="button" 
                          className="btn btn-secondary"
                          onClick={() => setShowAddPatient(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="card">
                <div className="card-body">
                  {patients.length === 0 ? (
                    <p className="text-center">No patients found. Add your first patient.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Age</th>
                            <th>Condition</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {patients.map(patient => (
                            <tr key={patient._id}>
                              <td>{patient.name}</td>
                              <td>{patient.email}</td>
                              <td>{patient.age}</td>
                              <td>{patient.condition}</td>
                              <td>
                                <button className="btn btn-sm btn-outline-primary">View</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="row">
            <div className="col-12">
              <h4 className="mb-3">Recent Sessions</h4>
              <div className="card">
                <div className="card-body">
                  {sessions.length === 0 ? (
                    <p className="text-center">No sessions found.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Patient</th>
                            <th>Date</th>
                            <th>Rating</th>
                            <th>Review</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sessions.map(session => (
                            <tr key={session._id}>
                              <td>{session.patientId}</td>
                              <td>{new Date(session.date).toLocaleDateString()}</td>
                              <td>
                                <span className={`badge ${session.rating >= 4 ? 'bg-success' : session.rating >= 3 ? 'bg-warning' : 'bg-danger'}`}>
                                  {session.rating}/5
                                </span>
                              </td>
                              <td>{session.review}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistDashboard;
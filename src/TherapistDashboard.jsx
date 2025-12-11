import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const TherapistDashboard = () => {
  const { currentUser } = useAuth();
  const [patients, setPatients] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [games, setGames] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientGames, setPatientGames] = useState({});
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showGameConfig, setShowGameConfig] = useState(false);
  const [showAssignInstructor, setShowAssignInstructor] = useState(false);
  const [showCreateReport, setShowCreateReport] = useState(false);
  const [showPatientSessions, setShowPatientSessions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [newPatient, setNewPatient] = useState({
    name: '',
    email: '',
    age: '',
    condition: ''
  });
  const [reportData, setReportData] = useState({
    title: '',
    summary: '',
    progress: '',
    recommendations: '',
    sessionIds: []
  });

  useEffect(() => {
    if (currentUser) {
      fetchPatients();
      fetchSessions();
      fetchAvailableGames();
      fetchInstructors();
      fetchReports();
    }
  }, [currentUser]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/therapist/patients?therapistId=${currentUser.id}`);
      const data = await response.json();
      if (response.ok) {
        setPatients(data.patients);
      } else {
        console.error('Error fetching patients:', data.error);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
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

  const fetchAvailableGames = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/therapist/available-games');
      const data = await response.json();
      if (response.ok) {
        setGames(data.games);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  const fetchInstructors = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/therapist/instructors');
      const data = await response.json();
      if (response.ok) {
        setInstructors(data.instructors);
      }
    } catch (error) {
      console.error('Error fetching instructors:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/therapist/reports?therapistId=${currentUser.id}`);
      const data = await response.json();
      if (response.ok) {
        setReports(data.reports);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const fetchPatientGames = async (patientId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/therapist/patient-games?patientId=${patientId}&therapistId=${currentUser.id}`);
      const data = await response.json();
      if (response.ok) {
        setPatientGames(data.games || {});
      }
    } catch (error) {
      console.error('Error fetching patient games:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientSessions = async (patientId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/sessions?patientId=${patientId}&userType=therapist&userId=${currentUser.id}`);
      const data = await response.json();
      if (response.ok) {
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Error fetching patient sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
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
        setPatients([...patients, { ...newPatient, _id: data.patientId, userCode: data.userCode }]);
        setNewPatient({ name: '', email: '', age: '', condition: '' });
        setShowAddPatient(false);
        alert('Patient added successfully!');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error adding patient:', error);
      alert('Error adding patient');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignInstructor = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData(e.target);
      const instructorId = formData.get('instructorId');
      
      const response = await fetch('http://localhost:5000/api/therapist/assign-instructor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          therapistId: currentUser.id,
          patientId: selectedPatient._id,
          instructorId: instructorId
        }),
      });
      
      const data = await response.json();
      if (response.ok) {
        alert('Instructor assigned successfully!');
        setShowAssignInstructor(false);
        fetchPatients();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error assigning instructor:', error);
      alert('Error assigning instructor');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigureGames = async (patient) => {
    setSelectedPatient(patient);
    await fetchPatientGames(patient._id);
    setShowGameConfig(true);
  };

  const handleViewSessions = async (patient) => {
    setSelectedPatient(patient);
    await fetchPatientSessions(patient._id);
    setShowPatientSessions(true);
  };

  const handleCreateReport = async (patient) => {
    setSelectedPatient(patient);
    setShowCreateReport(true);
  };

  const handleGameConfigChange = (gameName, field, value) => {
    setPatientGames(prev => ({
      ...prev,
      [gameName]: {
        ...prev[gameName],
        [field]: value
      }
    }));
  };

  const handleNestedFieldChange = (gameName, parentField, childField, value) => {
    setPatientGames(prev => ({
      ...prev,
      [gameName]: {
        ...prev[gameName],
        [parentField]: {
          ...(prev[gameName]?.[parentField] || {}),
          [childField]: parseFloat(value) || 0
        }
      }
    }));
  };

  const handleSaveGameConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/therapist/update-patient-games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          therapistId: currentUser.id,
          patientId: selectedPatient._id,
          gameConfigs: patientGames
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setShowGameConfig(false);
        setSelectedPatient(null);
        alert('Game configurations saved successfully!');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error saving game config:', error);
      alert('Error saving configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReportSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const formData = new FormData(e.target);
      const selectedSessions = formData.getAll('sessionIds');
      
      const response = await fetch('http://localhost:5000/api/therapist/create-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          therapistId: currentUser.id,
          patientId: selectedPatient._id,
          reportData: {
            title: formData.get('title'),
            summary: formData.get('summary'),
            progress: formData.get('progress'),
            recommendations: formData.get('recommendations')
          },
          sessionIds: selectedSessions
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Report created successfully!');
        setShowCreateReport(false);
        setReportData({
          title: '',
          summary: '',
          progress: '',
          recommendations: '',
          sessionIds: []
        });
        fetchReports();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating report:', error);
      alert('Error creating report');
    } finally {
      setLoading(false);
    }
  };

  const getDefaultConfigForGame = (game) => {
    const configurableFields = game.configurable_fields || [];
    let defaultConfig = {};
    if (game.name === 'bubble_game') {
      defaultConfig = {
        enabled: true,
        difficulty: 'medium',
        game_name: game.name,
        target_score: 20,
        spawnAreaSize: 5,
        bubbleSpeedAction: 5,
        bubbleLifetime: 3,
        spawnHeight: 3,
        numBubbles: 10,
        bubbleSize: 1
      }
    }
    else{
      defaultConfig = {
        enabled: true,
        difficulty: 'medium',
        game_name: game.name,
      }
    }

    configurableFields.forEach(field => {
      if (field.default !== undefined) {
        defaultConfig[field.name] = field.default;
      }
    });

    return defaultConfig;
  };

  const initializeGameConfig = (game) => {
    const defaultConfig = getDefaultConfigForGame(game);
    setPatientGames(prev => ({
      ...prev,
      [game.name]: prev[game.name] || defaultConfig
    }));
  };

  const renderGameConfigField = (game, field, config) => {
    switch (field.type) {
      case 'select':
        return (
          <select
            className="form-select form-select-sm"
            value={config[field.name] || field.default}
            onChange={(e) => handleGameConfigChange(game.name, field.name, e.target.value)}
          >
            {field.options.map(option => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            type="number"
            className="form-control form-control-sm"
            value={config[field.name] || field.default}
            onChange={(e) => handleGameConfigChange(game.name, field.name, parseFloat(e.target.value))}
            min={field.min}
            max={field.max}
            step={field.step || 1}
          />
        );

      case 'object':
        if (field.name === 'lights_green_prob') {
          return (
            <div className="spawn-area-config">
              {field.fields.map(subField => (
                <div key={subField.name} className="input-group input-group-sm mb-2">
                  <span className="input-group-text bg-light">{subField.name.replace('_', ' ').toUpperCase()}</span>
                  <input
                    type="number"
                    className="form-control"
                    step="0.1"
                    value={patientGames[game.name]?.lights_green_prob?.[subField.name] ?? subField.default}
                    onChange={(e) => handleNestedFieldChange(game.name, "lights_green_prob", subField.name, e.target.value)}
                  />
                </div>
              ))}
            </div>
          );
        }
        return null;

      default:
        return null;
    }
  };

  const renderBubbleGameFields = (game, config) => {
    if (game.name !== 'bubble_game') {
      return game.configurable_fields?.map(field => (
        <div key={field.name} className="mb-2">
          <label className="form-label small mb-1">
            {field.name.replace('_', ' ').toUpperCase()}
          </label>
          {renderGameConfigField(game, field, config)}
        </div>
      ));
    }

    return (
      <>
        <div className="row">
          <div className="col-md-6 mb-2">
            <label className="form-label small mb-1">Difficulty</label>
            <select
              className="form-select form-select-sm"
              value={config.difficulty || 'medium'}
              onChange={(e) => handleGameConfigChange(game.name, 'difficulty', e.target.value)}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="col-md-6 mb-2">
            <label className="form-label small mb-1">Target Score</label>
            <input
              type="number"
              className="form-control form-control-sm"
              value={config.target_score || 20}
              onChange={(e) => handleGameConfigChange(game.name, 'target_score', parseInt(e.target.value))}
              min="5"
              max="100"
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-6 mb-2">
            <label className="form-label small mb-1">Spawn Area Size</label>
            <input
              type="number"
              className="form-control form-control-sm"
              value={config.spawnAreaSize || 5}
              onChange={(e) => handleGameConfigChange(game.name, 'spawnAreaSize', parseFloat(e.target.value))}
              min="1"
              max="10"
              step="0.1"
            />
          </div>
          <div className="col-md-6 mb-2">
            <label className="form-label small mb-1">Bubble Speed</label>
            <input
              type="number"
              className="form-control form-control-sm"
              value={config.bubbleSpeedAction || 5}
              onChange={(e) => handleGameConfigChange(game.name, 'bubbleSpeedAction', parseFloat(e.target.value))}
              min="1"
              max="10"
              step="0.1"
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-6 mb-2">
            <label className="form-label small mb-1">Bubble Lifetime</label>
            <input
              type="number"
              className="form-control form-control-sm"
              value={config.bubbleLifetime || 3}
              onChange={(e) => handleGameConfigChange(game.name, 'bubbleLifetime', parseFloat(e.target.value))}
              min="1"
              max="10"
              step="0.1"
            />
          </div>
          <div className="col-md-6 mb-2">
            <label className="form-label small mb-1">Spawn Height</label>
            <input
              type="number"
              className="form-control form-control-sm"
              value={config.spawnHeight || 3}
              onChange={(e) => handleGameConfigChange(game.name, 'spawnHeight', parseFloat(e.target.value))}
              min="1"
              max="10"
              step="0.1"
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-6 mb-2">
            <label className="form-label small mb-1">Number of Bubbles</label>
            <input
              type="number"
              className="form-control form-control-sm"
              value={config.numBubbles || 10}
              onChange={(e) => handleGameConfigChange(game.name, 'numBubbles', parseInt(e.target.value))}
              min="1"
              max="20"
            />
          </div>
          <div className="col-md-6 mb-2">
            <label className="form-label small mb-1">Bubble Size</label>
            <input
              type="number"
              className="form-control form-control-sm"
              value={config.bubbleSize || 1}
              onChange={(e) => handleGameConfigChange(game.name, 'bubbleSize', parseFloat(e.target.value))}
              min="0.1"
              max="5"
              step="0.1"
            />
          </div>
        </div>
      </>
    );
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h6 className="text-muted text-uppercase small">{title}</h6>
            <h2 className="mb-0 fw-bold" style={{ color: color }}>{value}</h2>
          </div>
          <div className={`p-3 rounded-circle`} style={{ backgroundColor: `${color}15` }}>
            <i className={`bi bi-${icon}`} style={{ fontSize: '1.5rem', color: color }}></i>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading && !showGameConfig && !showAssignInstructor && !showCreateReport && !showPatientSessions) {
    return (
      <div className="container-fluid py-5">
        <div className="row">
          <div className="col-12 text-center">
            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0 bg-light" style={{ minHeight: '100vh' }}>

      {/* Main Content */}
      <div className="container-fluid py-4">
        {/* Stats Cards */}
        <div className="row mb-4">
          <div className="col-xl-3 col-md-6">
            <StatCard 
              title="Total Patients" 
              value={patients.length} 
              icon="people" 
              color="#4e73df"
            />
          </div>
          <div className="col-xl-3 col-md-6">
            <StatCard 
              title="Sessions" 
              value={sessions.length} 
              icon="calendar-check" 
              color="#1cc88a"
            />
          </div>
          <div className="col-xl-3 col-md-6">
            <StatCard 
              title="Avg. Rating" 
              value={sessions.length > 0 
                ? (sessions.reduce((sum, session) => sum + (session.rating || 0), 0) / sessions.length).toFixed(1)
                : '0.0'
              }
              icon="star" 
              color="#f6c23e"
            />
          </div>
          <div className="col-xl-3 col-md-6">
            <StatCard 
              title="Available Games" 
              value={games.length} 
              icon="controller" 
              color="#e74a3b"
            />
          </div>
        </div>

        {/* Main Tabs */}
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white border-bottom-0">
            <ul className="nav nav-tabs card-header-tabs">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  <i className="bi bi-speedometer2 me-2"></i>
                  Dashboard
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'patients' ? 'active' : ''}`}
                  onClick={() => setActiveTab('patients')}
                >
                  <i className="bi bi-people me-2"></i>
                  Patients
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'reports' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reports')}
                >
                  <i className="bi bi-file-text me-2"></i>
                  Reports
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'sessions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('sessions')}
                >
                  <i className="bi bi-calendar-week me-2"></i>
                  Sessions
                </button>
              </li>
            </ul>
          </div>
          
          <div className="card-body">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="row">
                <div className="col-lg-8">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-header bg-white">
                      <h5 className="mb-0">
                        <i className="bi bi-activity me-2"></i>
                        Recent Activity
                      </h5>
                    </div>
                    <div className="card-body">
                      {sessions.length === 0 ? (
                        <div className="text-center py-5">
                          <i className="bi bi-calendar-x display-1 text-muted"></i>
                          <p className="mt-3 text-muted">No recent sessions found</p>
                        </div>
                      ) : (
                        <div className="list-group list-group-flush">
                          {sessions.slice(0, 5).map(session => {
                            const patient = patients.find(p => p._id === session.patientId);
                            return (
                              <div key={session._id} className="list-group-item border-0 px-0 py-3">
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <h6 className="mb-1">{patient?.name || 'Unknown Patient'}</h6>
                                    <p className="text-muted small mb-0">
                                      <i className="bi bi-controller me-1"></i>
                                      {session.gameData?.gameName || 'Unknown Game'}
                                      <span className="mx-2">•</span>
                                      <i className="bi bi-clock me-1"></i>
                                      {new Date(session.date).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div>
                                    <span className={`badge ${session.rating >= 4 ? 'bg-success' : session.rating >= 3 ? 'bg-warning' : 'bg-danger'}`}>
                                      {session.rating || 'N/A'}/5
                                    </span>
                                    <span className="badge bg-light text-dark ms-2">
                                      Score: {session.gameData?.score || 'N/A'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="col-lg-4 mt-4 mt-lg-0">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-header bg-white">
                      <h5 className="mb-0">
                        <i className="bi bi-clipboard-data me-2"></i>
                        Quick Actions
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="d-grid gap-3">
                        <button 
                          className="btn btn-primary btn-lg d-flex align-items-center justify-content-start"
                          onClick={() => {
                            setActiveTab('patients');
                            setShowAddPatient(true);
                          }}
                        >
                          <i className="bi bi-person-plus me-3 fs-5"></i>
                          <div className="text-start">
                            <div>Add New Patient</div>
                            <small className="opacity-75">Register a new patient</small>
                          </div>
                        </button>
                        
                        <button 
                          className="btn btn-success btn-lg d-flex align-items-center justify-content-start"
                          onClick={() => {
                            if (patients.length > 0) {
                              handleCreateReport(patients[0]);
                            }
                          }}
                          disabled={patients.length === 0}
                        >
                          <i className="bi bi-file-earmark-medical me-3 fs-5"></i>
                          <div className="text-start">
                            <div>Create Report</div>
                            <small className="opacity-75">Generate patient report</small>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Patients Tab */}
            {activeTab === 'patients' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="mb-0">
                    <i className="bi bi-people me-2"></i>
                    Patient Management
                  </h5>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowAddPatient(true)}
                    disabled={loading}
                  >
                    <i className="bi bi-person-plus me-2"></i>
                    Add New Patient
                  </button>
                </div>

                {showAddPatient && (
                  <div className="card border-primary mb-4">
                    <div className="card-header bg-primary text-white">
                      <h5 className="mb-0">
                        <i className="bi bi-person-plus me-2"></i>
                        Register New Patient
                      </h5>
                    </div>
                    <div className="card-body">
                      <form onSubmit={handleAddPatient}>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Full Name *</label>
                            <input
                              type="text"
                              className="form-control"
                              value={newPatient.name}
                              onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                              required
                              disabled={loading}
                              placeholder="Enter patient's full name"
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Email Address *</label>
                            <input
                              type="email"
                              className="form-control"
                              value={newPatient.email}
                              onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                              required
                              disabled={loading}
                              placeholder="patient@example.com"
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Age *</label>
                            <input
                              type="number"
                              className="form-control"
                              value={newPatient.age}
                              onChange={(e) => setNewPatient({...newPatient, age: e.target.value})}
                              required
                              disabled={loading}
                              placeholder="Enter age"
                              min="1"
                              max="120"
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Medical Condition *</label>
                            <input
                              type="text"
                              className="form-control"
                              value={newPatient.condition}
                              onChange={(e) => setNewPatient({...newPatient, condition: e.target.value})}
                              required
                              disabled={loading}
                              placeholder="e.g., Stroke Recovery, PTSD"
                            />
                          </div>
                        </div>
                        <div className="d-flex gap-2">
                          <button type="submit" className="btn btn-success" disabled={loading}>
                            {loading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Adding Patient...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-check-circle me-2"></i>
                                Add Patient
                              </>
                            )}
                          </button>
                          <button 
                            type="button" 
                            className="btn btn-outline-secondary"
                            onClick={() => setShowAddPatient(false)}
                            disabled={loading}
                          >
                            <i className="bi bi-x-circle me-2"></i>
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {patients.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-people display-1 text-muted"></i>
                    <h4 className="mt-3 text-muted">No Patients Found</h4>
                    <p className="text-muted">Add your first patient to get started</p>
                    <button 
                      className="btn btn-primary mt-2"
                      onClick={() => setShowAddPatient(true)}
                    >
                      <i className="bi bi-person-plus me-2"></i>
                      Add First Patient
                    </button>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th><i className="bi bi-person me-1"></i> Patient</th>
                          <th><i className="bi bi-envelope me-1"></i> Email</th>
                          <th><i className="bi bi-calendar me-1"></i> Age</th>
                          <th><i className="bi bi-heart-pulse me-1"></i> Condition</th>
                          <th><i className="bi bi-key me-1"></i> Access Code</th>
                          <th className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patients.map(patient => (
                          <tr key={patient._id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="avatar-sm bg-primary rounded-circle d-flex align-items-center justify-content-center me-3">
                                  <i className="bi bi-person text-white"></i>
                                </div>
                                <div>
                                  <strong>{patient.name}</strong>
                                </div>
                              </div>
                            </td>
                            <td>{patient.email}</td>
                            <td>{patient.age} years</td>
                            <td>
                              <span className="badge bg-info bg-opacity-10 text-info">
                                {patient.condition}
                              </span>
                            </td>
                            <td>
                              <code className="bg-light p-2 rounded border">{patient.userCode}</code>
                            </td>
                            <td>
                              <div className="d-flex justify-content-end gap-2">
                                <button 
                                  className="btn btn-sm btn-outline-primary d-flex align-items-center"
                                  onClick={() => handleConfigureGames(patient)}
                                  title="Configure Games"
                                >
                                  <i className="bi bi-gear me-1"></i>
                                  Games
                                </button>
                                <button 
                                  className="btn btn-sm btn-outline-info d-flex align-items-center"
                                  onClick={() => handleViewSessions(patient)}
                                  title="View Sessions"
                                >
                                  <i className="bi bi-calendar-week me-1"></i>
                                  Sessions
                                </button>
                                <button 
                                  className="btn btn-sm btn-outline-success d-flex align-items-center"
                                  onClick={() => {
                                    setSelectedPatient(patient);
                                    setShowAssignInstructor(true);
                                  }}
                                  title="Assign Instructor"
                                >
                                  <i className="bi bi-person-plus me-1"></i>
                                  Assign
                                </button>
                                <button 
                                  className="btn btn-sm btn-outline-warning d-flex align-items-center"
                                  onClick={() => handleCreateReport(patient)}
                                  title="Create Report"
                                >
                                  <i className="bi bi-file-text me-1"></i>
                                  Report
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div>
                <h5 className="mb-4">
                  <i className="bi bi-file-text me-2"></i>
                  Patient Reports
                </h5>

                {reports.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-file-earmark-text display-1 text-muted"></i>
                    <h4 className="mt-3 text-muted">No Reports Found</h4>
                    <p className="text-muted">Create your first patient report</p>
                  </div>
                ) : (
                  <div className="row">
                    {reports.map(report => {
                      const patient = patients.find(p => p._id === report.patientId);
                      return (
                        <div key={report._id} className="col-md-6 col-lg-4 mb-4">
                          <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                  <span className="badge bg-primary bg-opacity-10 text-primary mb-2">
                                    {patient ? patient.name : 'Unknown Patient'}
                                  </span>
                                  <h5 className="card-title mb-1">{report.reportData?.title || 'Untitled Report'}</h5>
                                </div>
                                <button className="btn btn-sm btn-light">
                                  <i className="bi bi-three-dots"></i>
                                </button>
                              </div>
                              <p className="card-text text-muted small mb-3">
                                {report.reportData?.summary?.substring(0, 100)}...
                              </p>
                              <div className="d-flex justify-content-between align-items-center">
                                <small className="text-muted">
                                  <i className="bi bi-calendar me-1"></i>
                                  {new Date(report.createdAt).toLocaleDateString()}
                                </small>
                                <button className="btn btn-sm btn-outline-primary">
                                  <i className="bi bi-eye me-1"></i>
                                  View
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Sessions Tab */}
            {activeTab === 'sessions' && (
              <div>
                <h5 className="mb-4">
                  <i className="bi bi-calendar-week me-2"></i>
                  Recent Sessions
                </h5>

                {sessions.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-calendar-x display-1 text-muted"></i>
                    <h4 className="mt-3 text-muted">No Sessions Found</h4>
                    <p className="text-muted">Patient sessions will appear here</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Patient</th>
                          <th>Date</th>
                          <th>Game</th>
                          <th>Score</th>
                          <th>Rating</th>
                          <th>Review</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessions.slice(0, 10).map(session => {
                          const patient = patients.find(p => p._id === session.patientId);
                          return (
                            <tr key={session._id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="avatar-sm bg-primary rounded-circle d-flex align-items-center justify-content-center me-2">
                                    <i className="bi bi-person text-white"></i>
                                  </div>
                                  <span>{patient?.name || 'Unknown'}</span>
                                </div>
                              </td>
                              <td>
                                <div>
                                  <div>{new Date(session.date).toLocaleDateString()}</div>
                                  <small className="text-muted">{new Date(session.date).toLocaleTimeString()}</small>
                                </div>
                              </td>
                              <td>
                                <span className="badge bg-info bg-opacity-10 text-info">
                                  {session.gameData?.gameName || 'Unknown'}
                                </span>
                              </td>
                              <td>
                                <span className="fw-bold">{session.gameData?.score || 'N/A'}</span>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="progress flex-grow-1 me-2" style={{ height: '6px' }}>
                                    <div 
                                      className="progress-bar bg-warning" 
                                      style={{ width: `${(session.rating || 0) * 20}%` }}
                                    ></div>
                                  </div>
                                  <span className="small">{session.rating || 'N/A'}/5</span>
                                </div>
                              </td>
                              <td>
                                <div className="text-truncate" style={{ maxWidth: '150px' }}>
                                  {session.review || 'No review'}
                                </div>
                              </td>
                              <td>
                                <span className={`badge ${session.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                  {session.status || 'completed'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {/* Game Configuration Modal */}
      {showGameConfig && selectedPatient && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="bi bi-gear me-2"></i>
                  Game Configuration for {selectedPatient.name}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowGameConfig(false)}
                  disabled={loading}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  Configure game settings for {selectedPatient.name}. Enable/disable games and adjust parameters as needed.
                </div>
                <div className="row">
                  {games.map(game => {
                    const config = patientGames[game.name] || getDefaultConfigForGame(game);
                    return (
                      <div key={game.name} className="col-md-6 mb-4">
                        <div className="card border-0 shadow-sm h-100">
                          <div className="card-header bg-white border-bottom">
                            <div className="form-check form-switch form-switch-lg">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                checked={config.enabled !== false}
                                onChange={(e) => {
                                  initializeGameConfig(game);
                                  handleGameConfigChange(game.name, 'enabled', e.target.checked);
                                }}
                                disabled={loading}
                              />
                              <label className="form-check-label fw-bold">
                                <i className="bi bi-controller me-2"></i>
                                {game.display_name || game.name}
                              </label>
                            </div>
                          </div>
                          <div className="card-body">
                            {config.enabled !== false && (
                              <>
                                <p className="text-muted small mb-3">{game.description}</p>
                                <div className="border-top pt-3">
                                  {renderBubbleGameFields(game, config)}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={() => setShowGameConfig(false)}
                  disabled={loading}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleSaveGameConfig}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Save Configuration
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Instructor Modal */}
      {showAssignInstructor && selectedPatient && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">
                  <i className="bi bi-person-plus me-2"></i>
                  Assign Instructor to {selectedPatient.name}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowAssignInstructor(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleAssignInstructor}>
                  <div className="mb-4">
                    <label className="form-label fw-bold">Select Instructor</label>
                    <select name="instructorId" className="form-select form-select-lg" required>
                      <option value="">Choose an instructor...</option>
                      {instructors.map(instructor => (
                        <option key={instructor._id} value={instructor.userId}>
                          {instructor.name} - {instructor.email}
                        </option>
                      ))}
                    </select>
                    <div className="form-text">
                      This instructor will have access to monitor {selectedPatient.name}'s progress.
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-success flex-grow-1" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Assigning...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Assign Instructor
                        </>
                      )}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary"
                      onClick={() => setShowAssignInstructor(false)}
                    >
                      <i className="bi bi-x-circle me-2"></i>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Report Modal */}
      {showCreateReport && selectedPatient && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-warning text-white">
                <h5 className="modal-title">
                  <i className="bi bi-file-earmark-medical me-2"></i>
                  Create Report for {selectedPatient.name}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowCreateReport(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleCreateReportSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Report Title</label>
                    <input 
                      type="text" 
                      name="title"
                      className="form-control form-control-lg" 
                      required 
                      placeholder="Enter report title"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Summary</label>
                    <textarea 
                      name="summary"
                      className="form-control" 
                      rows="3" 
                      required 
                      placeholder="Provide a brief summary of the patient's progress"
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Progress Assessment</label>
                    <textarea 
                      name="progress"
                      className="form-control" 
                      rows="3" 
                      required 
                      placeholder="Detail the patient's progress and achievements"
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Recommendations</label>
                    <textarea 
                      name="recommendations"
                      className="form-control" 
                      rows="3" 
                      required 
                      placeholder="Provide recommendations for next steps"
                    ></textarea>
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-bold">Include Sessions</label>
                    <div className="border rounded p-3" style={{maxHeight: '200px', overflowY: 'auto'}}>
                      {sessions.filter(s => s.patientId === selectedPatient._id).map(session => (
                        <div key={session._id} className="form-check mb-2">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            name="sessionIds"
                            value={session._id} 
                            id={`session-${session._id}`}
                          />
                          <label className="form-check-label" htmlFor={`session-${session._id}`}>
                            <span className="fw-bold">{new Date(session.date).toLocaleDateString()}</span>
                            <span className="text-muted ms-2">
                              - {session.gameData?.gameName || 'Unknown Game'} (Score: {session.gameData?.score || 'N/A'})
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                    <div className="form-text">
                      Select sessions to include in this report
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-warning flex-grow-1" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Creating...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-file-earmark-plus me-2"></i>
                          Create Report
                        </>
                      )}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary"
                      onClick={() => setShowCreateReport(false)}
                    >
                      <i className="bi bi-x-circle me-2"></i>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patient Sessions Modal */}
      {showPatientSessions && selectedPatient && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header bg-info text-white">
                <h5 className="modal-title">
                  <i className="bi bi-calendar-week me-2"></i>
                  Sessions for {selectedPatient.name}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowPatientSessions(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Game</th>
                        <th>Score</th>
                        <th>Duration</th>
                        <th>Rating</th>
                        <th>Review</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.filter(s => s.patientId === selectedPatient._id).map(session => (
                        <tr key={session._id}>
                          <td>
                            <div className="d-flex flex-column">
                              <span>{new Date(session.date).toLocaleDateString()}</span>
                              <small className="text-muted">{new Date(session.date).toLocaleTimeString()}</small>
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-info bg-opacity-10 text-info">
                              {session.gameData?.gameName || 'Unknown'}
                            </span>
                          </td>
                          <td>
                            <span className="fw-bold">{session.gameData?.score || 'N/A'}</span>
                          </td>
                          <td>
                            <span className="text-muted">{session.duration || 'N/A'}</span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="progress flex-grow-1 me-2" style={{ height: '6px' }}>
                                <div 
                                  className="progress-bar bg-warning" 
                                  style={{ width: `${(session.rating || 0) * 20}%` }}
                                ></div>
                              </div>
                              <span className="small">{session.rating || 'N/A'}/5</span>
                            </div>
                          </td>
                          <td>
                            <div className="text-truncate" style={{ maxWidth: '200px' }}>
                              {session.review || 'No review'}
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${session.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                              {session.status || 'completed'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPatientSessions(false)}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Bootstrap Icons CSS in your HTML head */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css"></link>
    </div>
  );
};

export default TherapistDashboard;
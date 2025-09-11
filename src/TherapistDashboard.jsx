import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const TherapistDashboard = () => {
  const { currentUser } = useAuth();
  const [patients, setPatients] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [games, setGames] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientGames, setPatientGames] = useState({});
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showGameConfig, setShowGameConfig] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    email: '',
    age: '',
    condition: ''
  });

  useEffect(() => {
    if (currentUser) {
      fetchPatients();
      fetchSessions();
      fetchAvailableGames();
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

  const handleConfigureGames = async (patient) => {
    setSelectedPatient(patient);
    await fetchPatientGames(patient._id);
    setShowGameConfig(true);
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

  const handleSpawnAreaChange = (gameName, axis, value) => {
    setPatientGames(prev => ({
      ...prev,
      [gameName]: {
        ...prev[gameName],
        spawn_area: {
          ...(prev[gameName]?.spawn_area || {}),
          [axis]: parseFloat(value) || 0
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

  const getDefaultConfigForGame = (game) => {
    const configurableFields = game.configurable_fields || [];
    const defaultConfig = {
      enabled: true,
      difficulty: 'medium',
      target_score: 20,
      max_bubbles: 10,
      spawn_area: {
        x_min: -5, x_max: 5,
        y_min: 1, y_max: 5,
        z_min: -5, z_max: 5
      }
    };

    // Set defaults from game definition
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
            className="form-select"
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
            className="form-control"
            value={config[field.name] || field.default}
            onChange={(e) => handleGameConfigChange(game.name, field.name, parseInt(e.target.value))}
            min={field.min}
            max={field.max}
          />
        );

      case 'object':
        if (field.name === 'spawn_area') {
          return (
            <div className="spawn-area-config">
              {field.fields.map(subField => (
                <div key={subField.name} className="input-group mb-2">
                  <span className="input-group-text">{subField.name.replace('_', ' ').toUpperCase()}</span>
                  <input
                    type="number"
                    className="form-control"
                    step="0.1"
                    value={config.spawn_area?.[subField.name] || subField.default}
                    onChange={(e) => handleSpawnAreaChange(game.name, subField.name, e.target.value)}
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

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                <a href="#" className="nav-link text-white">Games</a>
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
                      ? (sessions.reduce((sum, session) => sum + (session.rating || 0), 0) / sessions.length).toFixed(1)
                      : '0.0'
                    }
                  </h2>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card stat-card">
                <div className="card-body">
                  <h5 className="card-title">Available Games</h5>
                  <h2 className="card-text">{games.length}</h2>
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
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add New Patient'}
                </button>
              </div>

              {showAddPatient && (
                <div className="card mb-4">
                  <div className="card-body">
                    <h5 className="card-title">Add New Patient</h5>
                    <form onSubmit={handleAddPatient}>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Name *</label>
                          <input
                            type="text"
                            className="form-control"
                            value={newPatient.name}
                            onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                            required
                            disabled={loading}
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Email *</label>
                          <input
                            type="email"
                            className="form-control"
                            value={newPatient.email}
                            onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                            required
                            disabled={loading}
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
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Condition *</label>
                          <input
                            type="text"
                            className="form-control"
                            value={newPatient.condition}
                            onChange={(e) => setNewPatient({...newPatient, condition: e.target.value})}
                            required
                            disabled={loading}
                          />
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-success" disabled={loading}>
                          {loading ? 'Adding...' : 'Add Patient'}
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-secondary"
                          onClick={() => setShowAddPatient(false)}
                          disabled={loading}
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
                            <th>User Code</th>
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
                                <code className="bg-light p-1 rounded">{patient.userCode}</code>
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  <button 
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleConfigureGames(patient)}
                                    disabled={loading}
                                  >
                                    Configure Games
                                  </button>
                                  <button className="btn btn-sm btn-outline-secondary">
                                    View Sessions
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
              </div>
            </div>
          </div>

          {/* Game Configuration Modal */}
          {showGameConfig && selectedPatient && (
            <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-xl">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      Game Configuration for {selectedPatient.name}
                    </h5>
                    <button 
                      type="button" 
                      className="btn-close"
                      onClick={() => setShowGameConfig(false)}
                      disabled={loading}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="row">
                      {games.map(game => {
                        const config = patientGames[game.name] || getDefaultConfigForGame(game);
                        return (
                          <div key={game.name} className="col-md-6 mb-4">
                            <div className="card h-100">
                              <div className="card-header">
                                <div className="form-check form-switch">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={config.enabled !== false}
                                    onChange={(e) => {
                                      initializeGameConfig(game);
                                      handleGameConfigChange(game.name, 'enabled', e.target.checked);
                                    }}
                                    disabled={loading}
                                  />
                                  <label className="form-check-label fw-bold">
                                    {game.display_name || game.name}
                                  </label>
                                </div>
                              </div>
                              <div className="card-body">
                                {config.enabled !== false && (
                                  <>
                                    <p className="text-muted small mb-3">{game.description}</p>
                                    
                                    {game.configurable_fields?.map(field => (
                                      <div key={field.name} className="mb-3">
                                        <label className="form-label">
                                          {field.name.replace('_', ' ').toUpperCase()}
                                        </label>
                                        {renderGameConfigField(game, field, config)}
                                      </div>
                                    ))}
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
                      className="btn btn-secondary"
                      onClick={() => setShowGameConfig(false)}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={handleSaveGameConfig}
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Configuration'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                            <th>Game</th>
                            <th>Score</th>
                            <th>Rating</th>
                            <th>Review</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sessions.slice(0, 5).map(session => (
                            <tr key={session._id}>
                              <td>
                                {patients.find(p => p._id === session.patientId)?.name || session.patientId}
                              </td>
                              <td>{new Date(session.date).toLocaleDateString()}</td>
                              <td>{session.gameData?.gameName || 'Unknown'}</td>
                              <td>{session.gameData?.score || 'N/A'}</td>
                              <td>
                                <span className={`badge ${session.rating >= 4 ? 'bg-success' : session.rating >= 3 ? 'bg-warning' : 'bg-danger'}`}>
                                  {session.rating || 'N/A'}/5
                                </span>
                              </td>
                              <td className="text-truncate" style={{ maxWidth: '200px' }}>
                                {session.review || 'No review'}
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
        </div>
      </div>
    </div>
  );
};

export default TherapistDashboard;
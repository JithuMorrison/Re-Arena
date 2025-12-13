import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const InstructorDashboard = () => {
  const { currentUser } = useAuth();
  const [userCode, setUserCode] = useState('');
  const [userData, setUserData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    notes: '',
    gameData: {
      gameName: '',
      analytics: {
        score: 0,
        spawnAreaSize: 5,
        bubbleSpeedAction: 5,
        bubbleLifetime: 3,
        spawnHeight: 3,
        numBubbles: 10,
        bubbleSize: 1
      }
    }
  });
  const [sessionData, setSessionData] = useState({
    patientId: '',
    gameName: '',
    sessionId: ''
  });
  const [availableSessions, setAvailableSessions] = useState([]);
  const [selectedSessionForReview, setSelectedSessionForReview] = useState(null);

  useEffect(() => {
    if (currentUser) {
      fetchSessions();
    }
  }, [currentUser]);

  const fetchSessions = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/sessions?userId=${currentUser.id}&userType=instructor`
      );
      const data = await response.json();
      if (response.ok) {
        setSessions(data.sessions);
        setAvailableSessions(data.sessions.filter(s => s.status === 'active'));
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const handleUserCodeSubmit = async (e) => {
    e.preventDefault();
    if (!userCode) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/user-by-code?userCode=${userCode}`
      );
      const data = await response.json();
      if (response.ok) {
        setUserData(data.user);
        const sessionsResponse = await fetch(
          `http://localhost:5000/api/sessions?patientId=${data.user._id}&userType=instructor&userId=${currentUser.id}`
        );
        const sessionsData = await sessionsResponse.json();
        if (sessionsResponse.ok) {
          setAvailableSessions(sessionsData.sessions.filter(s => s.status === 'active'));
        }
      } else {
        alert('User not found');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!userData) return;

    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          therapistId: userData.therapistId,
          patientId: userData._id,
          instructorId: currentUser.id,
          gameData: {
            gameName: sessionData.gameName,
            status: 'active'
          }
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSessionData(prev => ({...prev, sessionId: data.sessionId}));
        setShowSessionForm(false);
        fetchSessions();
      } else {
        alert('Error creating session');
      }
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSessionForReview) {
      alert('Please select a session to review');
      return;
    }

    try {
      const dataToSend = {
        sessionId: selectedSessionForReview.sessionId,
        instructorId: currentUser.id,
        patientId: userData._id,
        therapistId: userData.therapistId,
        review: reviewData.notes,
        rating: reviewData.rating,
        gameData: {
          gameName: reviewData.gameData.gameName,
          analytics: reviewData.gameData.analytics
        }
      };

      const response = await fetch('http://localhost:5000/api/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        alert('Session review submitted successfully');
        setShowReviewForm(false);
        setReviewData({
          rating: 5,
          notes: '',
          gameData: {
            gameName: '',
            analytics: {
              score: 0,
              spawnAreaSize: 5,
              bubbleSpeedAction: 5,
              bubbleLifetime: 3,
              spawnHeight: 3,
              numBubbles: 10,
              bubbleSize: 1
            }
          }
        });
        setSelectedSessionForReview(null);
        fetchSessions();
      } else {
        alert('Error submitting review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const handleCloseSession = async (sessionId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/session/${sessionId}/close`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Session closed successfully');
        fetchSessions();
      } else {
        alert('Error closing session');
      }
    } catch (error) {
      console.error('Error closing session:', error);
    }
  };

  const handleReloadGameData = async (sessionId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/session/${sessionId}`);
      const data = await response.json();
      
      if (response.ok) {
        setSelectedSession(data.session);
      } else {
        alert('Error reloading game data');
      }
    } catch (error) {
      console.error('Error reloading game data:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <style jsx>{`
        .dashboard-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
        }
        
        .sidebar {
          background: linear-gradient(135deg, #1cc88a 0%, #13855c 100%);
          min-height: 100vh;
          box-shadow: 3px 0 20px rgba(0,0,0,0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        
        .sidebar .nav-link {
          border-radius: 8px;
          margin: 4px 0;
          padding: 0.75rem 1rem;
          transition: all 0.3s ease;
          color: rgba(255, 255, 255, 0.9);
        }
        
        .sidebar .nav-link:hover {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          transform: translateX(5px);
        }
        
        .sidebar .nav-link.active {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          font-weight: 500;
        }
        
        .stat-card {
          background: white;
          border-radius: 12px;
          border: none;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        
        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }
        
        .action-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.3s ease;
          border: none;
        }
        
        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(5px);
          z-index: 1050;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .modal-content-custom {
          background: white;
          border-radius: 20px;
          border: none;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }
        
        .modal-header-custom {
          background: linear-gradient(135deg, #1cc88a 0%, #13855c 100%);
          color: white;
          border-radius: 20px 20px 0 0;
          border: none;
          padding: 1.5rem 2rem;
        }
        
        .user-code-input {
          border: 2px solid #e9ecef;
          border-radius: 10px;
          padding: 1rem;
          font-size: 1.1rem;
          transition: all 0.3s ease;
        }
        
        .user-code-input:focus {
          border-color: #1cc88a;
          box-shadow: 0 0 0 0.25rem rgba(28, 200, 138, 0.25);
        }
        
        .session-table {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        
        .session-table th {
          background: #f8f9fa;
          border-bottom: 2px solid #dee2e6;
          font-weight: 600;
          color: #495057;
          padding: 1rem;
        }
        
        .session-table td {
          padding: 1rem;
          vertical-align: middle;
          border-bottom: 1px solid #e9ecef;
        }
        
        .session-table tr:hover {
          background-color: rgba(28, 200, 138, 0.05);
        }
        
        .badge-custom {
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          font-weight: 500;
        }
        
        .btn-outline-custom {
          border: 2px solid;
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        
        .btn-outline-custom:hover {
          transform: translateY(-2px);
        }
        
        .user-info-card {
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
          border-radius: 15px;
          border: 1px solid #e9ecef;
          overflow: hidden;
          box-shadow: 0 5px 20px rgba(0,0,0,0.08);
        }
        
        .user-info-header {
          background: linear-gradient(135deg, #1cc88a 0%, #13855c 100%);
          color: white;
          padding: 1.5rem;
        }
        
        .user-avatar {
          width: 120px;
          height: 120px;
          border: 4px solid white;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .analytics-input {
          border: 2px solid #e9ecef;
          border-radius: 8px;
          padding: 0.75rem;
          transition: all 0.3s ease;
        }
        
        .analytics-input:focus {
          border-color: #4e73df;
          box-shadow: 0 0 0 0.25rem rgba(78, 115, 223, 0.25);
        }
        
        .rating-stars {
          display: flex;
          gap: 5px;
        }
        
        .rating-stars i {
          font-size: 1.2rem;
        }
        
        .hover-lift {
          transition: transform 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-3px);
        }
        
        .bg-success-gradient {
          background: linear-gradient(135deg, #1cc88a 0%, #13855c 100%);
        }
        
        .bg-primary-gradient {
          background: linear-gradient(135deg, #4e73df 0%, #224abe 100%);
        }
        
        .text-muted-light {
          color: #6c757d;
        }
      `}</style>

      <div className="container-fluid p-0" style={{marginTop: '80px'}}>
        <div className="row g-0">
          {/* Main Content */}
          <div>
            <div className="p-4">
              {/* Header */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h2 className="fw-bold mb-1 text-dark">Instructor Dashboard</h2>
                  <p className="text-muted-light mb-0">
                    <i className="bi bi-person-video2 me-1"></i>
                    Manage patient sessions and reviews
                  </p>
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-success action-btn d-flex align-items-center"
                    onClick={() => setShowSessionForm(true)}
                    disabled={!userData}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    New Session
                  </button>
                  <button
                    className="btn btn-primary action-btn d-flex align-items-center"
                    onClick={() => setShowReviewForm(true)}
                    disabled={!userData}
                  >
                    <i className="bi bi-journal-plus me-2"></i>
                    Add Review
                  </button>
                </div>
              </div>

              {/* Stats Overview */}
              <div className="row g-4 mb-4">
                <div className="col-md-3 col-sm-6">
                  <div className="stat-card p-3">
                    <div className="d-flex align-items-center">
                      <div className="stat-icon bg-success bg-opacity-10 text-success me-3">
                        <i className="bi bi-person-check"></i>
                      </div>
                      <div>
                        <h4 className="fw-bold mb-0">{sessions.length}</h4>
                        <p className="text-muted-light mb-0">Total Sessions</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 col-sm-6">
                  <div className="stat-card p-3">
                    <div className="d-flex align-items-center">
                      <div className="stat-icon bg-primary bg-opacity-10 text-primary me-3">
                        <i className="bi bi-play-circle"></i>
                      </div>
                      <div>
                        <h4 className="fw-bold mb-0">{availableSessions.length}</h4>
                        <p className="text-muted-light mb-0">Active Sessions</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 col-sm-6">
                  <div className="stat-card p-3">
                    <div className="d-flex align-items-center">
                      <div className="stat-icon bg-info bg-opacity-10 text-info me-3">
                        <i className="bi bi-star-fill"></i>
                      </div>
                      <div>
                        <h4 className="fw-bold mb-0">
                          {sessions.length > 0 
                            ? (sessions.reduce((sum, session) => sum + (session.rating || 0), 0) / sessions.length).toFixed(1)
                            : '0.0'
                          }
                        </h4>
                        <p className="text-muted-light mb-0">Avg Rating</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 col-sm-6">
                  <div className="stat-card p-3">
                    <div className="d-flex align-items-center">
                      <div className="stat-icon bg-warning bg-opacity-10 text-warning me-3">
                        <i className="bi bi-arrow-up-right"></i>
                      </div>
                      <div>
                        <h4 className="fw-bold mb-0">95%</h4>
                        <p className="text-muted-light mb-0">Success Rate</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Code Input */}
              <div className="row mb-4">
                <div className="col-12">
                  <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center mb-3">
                        <div className="icon-circle bg-primary bg-opacity-10 text-primary rounded-circle p-3 me-3">
                          <i className="bi bi-key fs-4"></i>
                        </div>
                        <div>
                          <h5 className="fw-bold mb-1">Access Patient Dashboard</h5>
                          <p className="text-muted-light mb-0">Enter patient's access code to manage their sessions</p>
                        </div>
                      </div>
                      <form onSubmit={handleUserCodeSubmit}>
                        <div className="row g-3 align-items-center">
                          <div className="col-md-8">
                            <div className="input-group input-group-lg">
                              <span className="input-group-text bg-light border-end-0">
                                <i className="bi bi-ticket-perforated text-primary"></i>
                              </span>
                              <input
                                type="text"
                                className="form-control form-control-lg user-code-input border-start-0"
                                placeholder="Enter patient access code (e.g., ABCD-1234)"
                                value={userCode}
                                onChange={(e) => setUserCode(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="col-md-4">
                            <button type="submit" className="btn btn-primary btn-lg w-100 py-3">
                              <i className="bi bi-search me-2"></i>
                              Load Patient
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Information */}
              {userData && (
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="user-info-card">
                      <div className="user-info-header">
                        <div className="d-flex align-items-center">
                          <div className="avatar-circle bg-white text-success rounded-circle p-3 me-3">
                            {userData.name?.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h4 className="fw-bold mb-1">{userData.name}</h4>
                            <p className="mb-0">
                              <i className="bi bi-key me-1"></i>
                              Access Code: {userData.userCode}
                            </p>
                          </div>
                          <div className="ms-auto">
                            <span className="badge bg-white text-success px-3 py-2">
                              <i className="bi bi-check-circle me-1"></i>
                              Active Patient
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="row">
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label text-muted-light mb-1">
                                <i className="bi bi-envelope me-2"></i>
                                Email Address
                              </label>
                              <p className="fw-medium mb-0">{userData.email}</p>
                            </div>
                            {userData.age && (
                              <div className="mb-3">
                                <label className="form-label text-muted-light mb-1">
                                  <i className="bi bi-calendar3 me-2"></i>
                                  Age
                                </label>
                                <p className="fw-medium mb-0">{userData.age} years</p>
                              </div>
                            )}
                          </div>
                          <div className="col-md-6">
                            {userData.condition && (
                              <div className="mb-3">
                                <label className="form-label text-muted-light mb-1">
                                  <i className="bi bi-heart-pulse me-2"></i>
                                  Condition
                                </label>
                                <p className="fw-medium mb-0">{userData.condition}</p>
                              </div>
                            )}
                            {userData.therapistId && (
                              <div className="mb-3">
                                <label className="form-label text-muted-light mb-1">
                                  <i className="bi bi-person-badge me-2"></i>
                                  Assigned Therapist
                                </label>
                                <p className="fw-medium mb-0">Dr. {userData.therapistId}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Session History */}
              <div className="row">
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h4 className="fw-bold mb-1">Session History</h4>
                      <p className="text-muted-light mb-0">All patient therapy sessions</p>
                    </div>
                    <div className="text-end">
                      <span className="badge bg-light text-dark px-3 py-2">
                        <i className="bi bi-list-check me-1"></i>
                        {sessions.length} total sessions
                      </span>
                    </div>
                  </div>
                  
                  <div className="session-table">
                    <div className="table-responsive rounded-4">
                      <table className="table table-hover mb-0">
                        <thead>
                          <tr>
                            <th>Session Details</th>
                            <th>Patient</th>
                            <th>Date & Time</th>
                            <th>Game</th>
                            <th>Performance</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sessions.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="text-center py-5">
                                <div className="mb-3">
                                  <i className="bi bi-calendar-x text-muted fs-1"></i>
                                </div>
                                <h5 className="text-muted mb-2">No sessions found</h5>
                                <p className="text-muted mb-0">Load a patient to view their session history</p>
                              </td>
                            </tr>
                          ) : (
                            sessions.map(session => (
                              <tr key={session._id} className="hover-lift">
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div className="icon-circle bg-primary bg-opacity-10 text-primary rounded-circle p-2 me-3">
                                      <i className="bi bi-controller"></i>
                                    </div>
                                    <div style={{marginRight: '10px'}}>
                                      <h6 className="fw-bold mb-1">{session.gameData?.gameName || 'Unknown Game'}</h6>
                                      <code className="text-muted-light small">{session.sessionId}</code>
                                    </div>
                                    <button 
                                      className="btn btn-outline-secondary btn-outline-custom btn-sm"
                                      onClick={() => {
                                        alert(`Session ID: ${session.sessionId} copied to clipboard`);
                                        navigator.clipboard.writeText(session.sessionId);
                                      }}
                                    >
                                      <i className="bi bi-clipboard"></i>
                                    </button>
                                  </div>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div>
                                      {session.patientId?.slice(0, 9)+"..." || '--'}
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div className="d-flex flex-column">
                                    <span className="fw-medium">{new Date(session.date).toLocaleDateString()}</span>
                                    <small className="text-muted-light">
                                      {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </small>
                                  </div>
                                </td>
                                <td>
                                  <span className="badge bg-light text-dark px-3 py-2">
                                    <i className="bi bi-joystick me-1"></i>
                                    {session.gameData?.gameName || 'Unknown'}
                                  </span>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div className="rating-stars me-2">
                                      {[...Array(5)].map((_, i) => (
                                        <i 
                                          key={i} 
                                          className={`bi ${i < Math.floor(session.rating || 0) ? 'bi-star-fill' : 'bi-star'} ${i < Math.floor(session.rating || 0) ? 'text-warning' : 'text-muted'}`}
                                        ></i>
                                      ))}
                                    </div>
                                    <span className="fw-bold">
                                      {session.rating || 'N/A'}/5
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  <span className={`badge ${session.status === 'active' ? 'bg-primary' : 'bg-success'} badge-custom px-3 py-2`}>
                                    <i className={`bi ${session.status === 'active' ? 'bi-play-circle' : 'bi-check-circle'} me-1`}></i>
                                    {session.status}
                                  </span>
                                </td>
                                <td>
                                  <div className="d-flex gap-2">
                                    <button 
                                      className="btn btn-outline-info btn-outline-custom btn-sm d-flex align-items-center"
                                      onClick={() => handleReloadGameData(session.sessionId)}
                                    >
                                      <i className="bi bi-arrow-clockwise me-1"></i>
                                      Reload
                                    </button>
                                    {session.status === 'active' && (
                                      <button 
                                        className="btn btn-outline-warning btn-outline-custom btn-sm d-flex align-items-center"
                                        onClick={() => handleCloseSession(session.sessionId)}
                                      >
                                        <i className="bi bi-x-circle me-1"></i>
                                        Close
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Session Modal */}
      {showSessionForm && (
        <div className="modal-overlay">
          <div className="modal-content-custom" style={{ maxWidth: '500px', width: '90%' }}>
            <div className="modal-header-custom">
              <h5 className="modal-title fw-bold">Create New Session</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setShowSessionForm(false)}
              ></button>
            </div>
            <div className="modal-body p-4">
              <form onSubmit={handleCreateSession}>
                <div className="mb-4">
                  <label className="form-label fw-medium">Selected Patient</label>
                  <div className="p-3 bg-light rounded-3">
                    <div className="d-flex align-items-center">
                      <div className="avatar-circle bg-success text-white rounded-circle p-2 me-3">
                        {userData.name?.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h6 className="fw-bold mb-0">{userData.name}</h6>
                        <p className="text-muted-light mb-0">Access Code: {userData.userCode}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="form-label fw-medium">Select Game</label>
                  <select 
                    className="form-select form-select-lg analytics-input"
                    value={sessionData.gameName}
                    onChange={(e) => setSessionData({...sessionData, gameName: e.target.value})}
                    required
                  >
                    <option value="">Choose a therapy game</option>
                    <option value="bubble_game">Bubble Pop Game</option>
                    <option value="memory_match">Memory Match</option>
                    <option value="reaction_test">Reaction Test</option>
                  </select>
                  <div className="form-text">Select the game for this therapy session</div>
                </div>
                
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary btn-lg flex-grow-1 py-3" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Creating Session...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-plus-circle me-2"></i>
                        Create Session
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-lg px-4"
                    onClick={() => setShowSessionForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewForm && (
        <div className="modal-overlay" style={{overflow: 'auto', scrollbarWidth: 'none'}}>
          <div className="modal-content-custom" style={{ maxWidth: '800px', width: '90%' }}>
            <div className="modal-header-custom">
              <h5 className="modal-title fw-bold" style={{marginTop: '400px'}}>Add Session Review</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setShowReviewForm(false)}
              ></button>
            </div>
            <div className="modal-body p-4">
              <form onSubmit={handleReviewSubmit}>
                {/* Session Selection */}
                <div className="mb-4">
                  <label className="form-label fw-medium">Select Active Session</label>
                  <select
                    className="form-select form-select-lg analytics-input"
                    value={selectedSessionForReview ? selectedSessionForReview.sessionId : ''}
                    onChange={(e) => {
                      const session = availableSessions.find(s => s.sessionId === e.target.value);
                      setSelectedSessionForReview(session);
                    }}
                    required
                  >
                    <option value="">Choose an active session</option>
                    {availableSessions.map(session => (
                      <option key={session.sessionId} value={session.sessionId}>
                        {session.sessionId} - {session.gameData?.gameName || 'Unknown Game'} • {new Date(session.date).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                  <div className="form-text">Select the active session you want to review</div>
                </div>
                
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-medium">Session Rating</label>
                    <select
                      className="form-select analytics-input"
                      value={reviewData.rating}
                      onChange={(e) => setReviewData({ ...reviewData, rating: parseInt(e.target.value) })}
                    >
                      <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                      <option value="4">⭐⭐⭐⭐ Very Good</option>
                      <option value="3">⭐⭐⭐ Good</option>
                      <option value="2">⭐⭐ Fair</option>
                      <option value="1">⭐ Needs Improvement</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-medium">Game Type</label>
                    <select
                      className="form-select analytics-input"
                      value={reviewData.gameData.gameName}
                      onChange={(e) => setReviewData({ 
                        ...reviewData, 
                        gameData: {...reviewData.gameData, gameName: e.target.value} 
                      })}
                      required
                    >
                      <option value="">Select game type</option>
                      <option value="bubble_game">Bubble Pop Game</option>
                      <option value="memory_match">Memory Match</option>
                      <option value="reaction_test">Reaction Test</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="form-label fw-medium">Session Notes</label>
                  <textarea
                    className="form-control analytics-input"
                    rows="4"
                    placeholder="Enter detailed notes about the session..."
                    value={reviewData.notes}
                    onChange={(e) => setReviewData({ ...reviewData, notes: e.target.value })}
                    required
                  ></textarea>
                </div>
                
                <div className="card border-0 bg-light rounded-4 mb-4">
                  <div className="card-header bg-transparent border-0 py-3">
                    <h6 className="fw-bold mb-0">
                      <i className="bi bi-graph-up me-2"></i>
                      Game Performance Analytics
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Score</label>
                        <input
                          type="number"
                          className="form-control analytics-input"
                          value={reviewData.gameData.analytics.score}
                          onChange={(e) => setReviewData({
                            ...reviewData,
                            gameData: {
                              ...reviewData.gameData,
                              analytics: {
                                ...reviewData.gameData.analytics,
                                score: parseInt(e.target.value)
                              }
                            }
                          })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Number of Bubbles</label>
                        <input
                          type="number"
                          className="form-control analytics-input"
                          value={reviewData.gameData.analytics.numBubbles}
                          onChange={(e) => setReviewData({
                            ...reviewData,
                            gameData: {
                              ...reviewData.gameData,
                              analytics: {
                                ...reviewData.gameData.analytics,
                                numBubbles: parseInt(e.target.value)
                              }
                            }
                          })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Bubble Speed</label>
                        <input
                          type="number"
                          step="0.1"
                          className="form-control analytics-input"
                          value={reviewData.gameData.analytics.bubbleSpeedAction}
                          onChange={(e) => setReviewData({
                            ...reviewData,
                            gameData: {
                              ...reviewData.gameData,
                              analytics: {
                                ...reviewData.gameData.analytics,
                                bubbleSpeedAction: parseFloat(e.target.value)
                              }
                            }
                          })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Bubble Lifetime</label>
                        <input
                          type="number"
                          step="0.1"
                          className="form-control analytics-input"
                          value={reviewData.gameData.analytics.bubbleLifetime}
                          onChange={(e) => setReviewData({
                            ...reviewData,
                            gameData: {
                              ...reviewData.gameData,
                              analytics: {
                                ...reviewData.gameData.analytics,
                                bubbleLifetime: parseFloat(e.target.value)
                              }
                            }
                          })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Spawn Area Size</label>
                        <input
                          type="number"
                          step="0.1"
                          className="form-control analytics-input"
                          value={reviewData.gameData.analytics.spawnAreaSize}
                          onChange={(e) => setReviewData({
                            ...reviewData,
                            gameData: {
                              ...reviewData.gameData,
                              analytics: {
                                ...reviewData.gameData.analytics,
                                spawnAreaSize: parseFloat(e.target.value)
                              }
                            }
                          })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Spawn Height</label>
                        <input
                          type="number"
                          step="0.1"
                          className="form-control analytics-input"
                          value={reviewData.gameData.analytics.spawnHeight}
                          onChange={(e) => setReviewData({
                            ...reviewData,
                            gameData: {
                              ...reviewData.gameData,
                              analytics: {
                                ...reviewData.gameData.analytics,
                                spawnHeight: parseFloat(e.target.value)
                              }
                            }
                          })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Bubble Size</label>
                        <input
                          type="number"
                          step="0.1"
                          className="form-control analytics-input"
                          value={reviewData.gameData.analytics.bubbleSize}
                          onChange={(e) => setReviewData({
                            ...reviewData,
                            gameData: {
                              ...reviewData.gameData,
                              analytics: {
                                ...reviewData.gameData.analytics,
                                bubbleSize: parseFloat(e.target.value)
                              }
                            }
                          })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer border-0 p-4">
              <button
                type="button"
                className="btn btn-outline-secondary btn-lg px-4"
                onClick={() => setShowReviewForm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-lg px-4"
                onClick={handleReviewSubmit}
                disabled={!selectedSessionForReview}
              >
                <i className="bi bi-check-circle me-2"></i>
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="modal-overlay">
          <div className="modal-content-custom" style={{ maxWidth: '700px', width: '90%' }}>
            <div className="modal-header-custom">
              <h5 className="modal-title fw-bold">Session Details</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setSelectedSession(null)}
              ></button>
            </div>
            <div className="modal-body p-4">
              <div className="mb-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="icon-circle bg-primary bg-opacity-10 text-primary rounded-circle p-3 me-3">
                    <i className="bi bi-controller fs-3"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">{selectedSession.gameData?.gameName || 'Unknown Game'}</h6>
                    <code className="text-muted-light">{selectedSession.sessionId}</code>
                  </div>
                </div>
                
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-3">
                      <label className="form-label text-muted-light mb-1">Session Date</label>
                      <p className="fw-medium mb-0">{new Date(selectedSession.date).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-3">
                      <label className="form-label text-muted-light mb-1">Status</label>
                      <span className={`badge ${selectedSession.status === 'active' ? 'bg-primary' : 'bg-success'} px-3 py-2`}>
                        {selectedSession.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="d-flex align-items-center mb-3">
                  <div className="rating-stars me-3">
                    {[...Array(5)].map((_, i) => (
                      <i 
                        key={i} 
                        className={`bi ${i < Math.floor(selectedSession.rating || 0) ? 'bi-star-fill' : 'bi-star'} ${i < Math.floor(selectedSession.rating || 0) ? 'text-warning' : 'text-muted'} fs-4`}
                      ></i>
                    ))}
                  </div>
                  <h5 className="fw-bold mb-0">{selectedSession.rating || 'N/A'}/5</h5>
                </div>
                
                <div className="mb-4">
                  <label className="form-label fw-medium">Review Notes</label>
                  <div className="p-3 bg-light rounded-3">
                    <p className="mb-0">{selectedSession.review || 'No review available'}</p>
                  </div>
                </div>
                
                {selectedSession.gameData?.analytics && (
                  <div>
                    <h6 className="fw-bold mb-3">Performance Analytics</h6>
                    <div className="row g-3">
                      {Object.entries(selectedSession.gameData.analytics).map(([key, value]) => (
                        <div key={key} className="col-md-6">
                          <div className="p-3 bg-light rounded-3">
                            <label className="form-label text-muted-light mb-1">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </label>
                            <p className="fw-bold fs-5 mb-0">{value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer border-0 p-4">
              <button
                type="button"
                className="btn btn-primary btn-lg px-4"
                onClick={() => setSelectedSession(null)}
              >
                <i className="bi bi-x-circle me-2"></i>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Bootstrap Icons */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css"></link>
    </div>
  );
};

export default InstructorDashboard;
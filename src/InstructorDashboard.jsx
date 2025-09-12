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
    gameData: {}
  });
  const [sessionData, setSessionData] = useState({
    patientId: '',
    gameName: '',
    sessionId: ''
  });
  const [gameAnalytics, setGameAnalytics] = useState({
    score: 0,
    movements: 0,
    steps: 0,
    handMovements: 0,
    legMovements: 0
  });

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
        alert(`Session created successfully! Session ID: ${data.sessionId}`);
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

    try {
      const dataToSend = {
        instructorId: currentUser.id,
        patientId: userData._id,
        therapistId: userData.therapistId,
        review: reviewData.notes,
        rating: reviewData.rating,
        gameData: {
          ...reviewData.gameData,
          analytics: gameAnalytics
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
        setReviewData({ rating: 5, notes: '', gameData: {} });
        setGameAnalytics({
          score: 0,
          movements: 0,
          steps: 0,
          handMovements: 0,
          legMovements: 0
        });
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
        alert('Game data reloaded successfully');
      } else {
        alert('Error reloading game data');
      }
    } catch (error) {
      console.error('Error reloading game data:', error);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 col-lg-2 sidebar bg-success text-white vh-100">
          <div className="d-flex flex-column p-3">
            <div className="text-center w-100 mb-4">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'Instructor')}&background=random`}
                alt="Instructor"
                className="rounded-circle"
                width="80"
              />
              <h5 className="my-2">{currentUser?.name}</h5>
              <p className="text-light small">Instructor</p>
            </div>

            <ul className="nav nav-pills flex-column">
              <li className="nav-item">
                <a href="#" className="nav-link active text-white">
                  <i className="bi bi-speedometer2 me-2"></i> Dashboard
                </a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link text-white">
                  <i className="bi bi-people me-2"></i> My Users
                </a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link text-white">
                  <i className="bi bi-journal-text me-2"></i> Session History
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="col-md-9 col-lg-10 p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Instructor Dashboard</h2>
            <div className="d-flex gap-2">
              <button
                className="btn btn-success"
                onClick={() => setShowSessionForm(true)}
              >
                <i className="bi bi-plus-circle me-1"></i> Create Session
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setShowReviewForm(true)}
                disabled={!userData}
              >
                <i className="bi bi-plus-circle me-1"></i> Add Session Review
              </button>
            </div>
          </div>

          {/* User Code Input */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title mb-3">Enter User Code</h5>
                  <form onSubmit={handleUserCodeSubmit}>
                    <div className="row">
                      <div className="col-md-8">
                        <input
                          type="text"
                          className="form-control form-control-lg user-code-input"
                          placeholder="Enter User Code"
                          value={userCode}
                          onChange={(e) => setUserCode(e.target.value)}
                        />
                      </div>
                      <div className="col-md-4">
                        <button type="submit" className="btn btn-primary btn-lg w-100">
                          Load User
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
                <div className="card">
                  <div className="card-header bg-white">
                    <h5 className="mb-0">User Information</h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-4 text-center">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`}
                          alt="User"
                          className="rounded-circle mb-3"
                          width="100"
                        />
                        <h5>{userData.name}</h5>
                        <p className="text-muted">User Code: {userData.userCode}</p>
                      </div>
                      <div className="col-md-8">
                        <div className="row">
                          <div className="col-6 mb-3">
                            <p className="mb-0"><strong>Email:</strong> {userData.email}</p>
                          </div>
                          {userData.age && (
                            <div className="col-6 mb-3">
                              <p className="mb-0"><strong>Age:</strong> {userData.age}</p>
                            </div>
                          )}
                          {userData.condition && (
                            <div className="col-6 mb-3">
                              <p className="mb-0"><strong>Condition:</strong> {userData.condition}</p>
                            </div>
                          )}
                        </div>
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
              <h4 className="mb-3">Session History</h4>
              <div className="card">
                <div className="card-body">
                  {sessions.length === 0 ? (
                    <p className="text-center">No sessions found.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Session ID</th>
                            <th>Patient</th>
                            <th>Date</th>
                            <th>Game</th>
                            <th>Score</th>
                            <th>Rating</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sessions.map(session => (
                            <tr key={session._id}>
                              <td>
                                <code>{session.sessionId}</code>
                                <button 
                                  className="btn btn-sm btn-outline-secondary ms-2"
                                  onClick={() => {
                                    navigator.clipboard.writeText(session.sessionId);
                                    alert('Session ID copied to clipboard');
                                  }}
                                >
                                  Copy
                                </button>
                              </td>
                              <td>{session.patientId}</td>
                              <td>{new Date(session.date).toLocaleDateString()}</td>
                              <td>{session.gameData?.gameName || 'Unknown'}</td>
                              <td>{session.gameData?.score || 'N/A'}</td>
                              <td>
                                <span className={`badge ${session.rating >= 4 ? 'bg-success' : session.rating >= 3 ? 'bg-warning' : 'bg-danger'}`}>
                                  {session.rating}/5
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${session.status === 'active' ? 'bg-primary' : 'bg-success'}`}>
                                  {session.status}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex gap-1">
                                  <button 
                                    className="btn btn-sm btn-outline-info"
                                    onClick={() => handleReloadGameData(session.sessionId)}
                                  >
                                    Reload
                                  </button>
                                  {session.status === 'active' && (
                                    <button 
                                      className="btn btn-sm btn-outline-warning"
                                      onClick={() => handleCloseSession(session.sessionId)}
                                    >
                                      Close
                                    </button>
                                  )}
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
        </div>
      </div>

      {/* Create Session Modal */}
      {showSessionForm && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Session</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowSessionForm(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleCreateSession}>
                  <div className="mb-3">
                    <label className="form-label">Patient</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={userData ? userData.name : ''} 
                      disabled 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Game Name</label>
                    <select 
                      className="form-select"
                      value={sessionData.gameName}
                      onChange={(e) => setSessionData({...sessionData, gameName: e.target.value})}
                      required
                    >
                      <option value="">Select a game</option>
                      <option value="bubble_game">Bubble Pop Game</option>
                      <option value="memory_match">Memory Match</option>
                    </select>
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Creating...' : 'Create Session'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowSessionForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewForm && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Session Review</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowReviewForm(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleReviewSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Rating</label>
                      <select
                        className="form-select"
                        value={reviewData.rating}
                        onChange={(e) => setReviewData({ ...reviewData, rating: parseInt(e.target.value) })}
                      >
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Very Good</option>
                        <option value="3">3 - Good</option>
                        <option value="2">2 - Fair</option>
                        <option value="1">1 - Poor</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Game</label>
                      <select
                        className="form-select"
                        value={reviewData.gameData.gameName || ''}
                        onChange={(e) => setReviewData({ 
                          ...reviewData, 
                          gameData: {...reviewData.gameData, gameName: e.target.value} 
                        })}
                      >
                        <option value="">Select a game</option>
                        <option value="bubble_game">Bubble Pop Game</option>
                        <option value="memory_match">Memory Match</option>
                        <option value="reaction_test">Reaction Test</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Session Notes</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={reviewData.notes}
                      onChange={(e) => setReviewData({ ...reviewData, notes: e.target.value })}
                      required
                    ></textarea>
                  </div>
                  
                  <div className="card mb-3">
                    <div className="card-header">
                      <h6 className="mb-0">Game Analytics</h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6 mb-2">
                          <label className="form-label">Score</label>
                          <input
                            type="number"
                            className="form-control"
                            value={gameAnalytics.score}
                            onChange={(e) => setGameAnalytics({...gameAnalytics, score: parseInt(e.target.value)})}
                          />
                        </div>
                        <div className="col-md-6 mb-2">
                          <label className="form-label">Total Movements</label>
                          <input
                            type="number"
                            className="form-control"
                            value={gameAnalytics.movements}
                            onChange={(e) => setGameAnalytics({...gameAnalytics, movements: parseInt(e.target.value)})}
                          />
                        </div>
                        <div className="col-md-6 mb-2">
                          <label className="form-label">Steps Covered</label>
                          <input
                            type="number"
                            className="form-control"
                            value={gameAnalytics.steps}
                            onChange={(e) => setGameAnalytics({...gameAnalytics, steps: parseInt(e.target.value)})}
                          />
                        </div>
                        <div className="col-md-6 mb-2">
                          <label className="form-label">Hand Movements</label>
                          <input
                            type="number"
                            className="form-control"
                            value={gameAnalytics.handMovements}
                            onChange={(e) => setGameAnalytics({...gameAnalytics, handMovements: parseInt(e.target.value)})}
                          />
                        </div>
                        <div className="col-md-6 mb-2">
                          <label className="form-label">Leg Movements</label>
                          <input
                            type="number"
                            className="form-control"
                            value={gameAnalytics.legMovements}
                            onChange={(e) => setGameAnalytics({...gameAnalytics, legMovements: parseInt(e.target.value)})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowReviewForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleReviewSubmit}
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Session Details - {selectedSession.sessionId}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedSession(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Date:</strong> {new Date(selectedSession.date).toLocaleString()}</p>
                    <p><strong>Status:</strong> {selectedSession.status}</p>
                    <p><strong>Game:</strong> {selectedSession.gameData?.gameName || 'Unknown'}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Rating:</strong> {selectedSession.rating || 'N/A'}/5</p>
                    <p><strong>Review:</strong> {selectedSession.review || 'No review'}</p>
                  </div>
                </div>
                
                {selectedSession.gameData?.analytics && (
                  <div className="mt-3">
                    <h6>Game Analytics</h6>
                    <div className="row">
                      <div className="col-md-6">
                        <p><strong>Score:</strong> {selectedSession.gameData.analytics.score}</p>
                        <p><strong>Movements:</strong> {selectedSession.gameData.analytics.movements}</p>
                        <p><strong>Steps:</strong> {selectedSession.gameData.analytics.steps}</p>
                      </div>
                      <div className="col-md-6">
                        <p><strong>Hand Movements:</strong> {selectedSession.gameData.analytics.handMovements}</p>
                        <p><strong>Leg Movements:</strong> {selectedSession.gameData.analytics.legMovements}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedSession(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;
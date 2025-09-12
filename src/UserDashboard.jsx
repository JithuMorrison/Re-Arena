import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const UserDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [team, setTeam] = useState([]);
  const [userCode, setUserCode] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if user code is passed via location state
    const codeFromLocation = location.state?.userCode;
    if (codeFromLocation) {
      setUserCode(codeFromLocation);
      handleUserCodeSubmit(null, codeFromLocation);
    }
  }, [location]);

  const handleUserCodeSubmit = async (e, code = null) => {
    if (e) e.preventDefault();
    const userCodeToUse = code || userCode;
    if (!userCodeToUse) return;

    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/user-by-code?userCode=${userCodeToUse}`
      );
      const data = await response.json();
      if (response.ok) {
        setUserData(data.user);
        fetchSessions(data.user._id);
        fetchTeam(data.user);
      } else {
        alert('User not found');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/sessions?userId=${userId}&userType=patient`
      );
      const data = await response.json();
      if (response.ok) {
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchTeam = async (user) => {
    try {
      const teamMembers = [];
      
      // Fetch therapist
      if (user.therapistId) {
        const response = await fetch(`http://localhost:5000/api/user/${user.therapistId}`);
        const data = await response.json();
        if (response.ok && data.user) {
          teamMembers.push({
            name: data.user.name,
            role: 'Therapist',
            avatar: data.user.name
          });
        }
      }
      
      // Fetch instructor
      if (user.instructorId) {
        const response = await fetch(`http://localhost:5000/api/user/${user.instructorId}`);
        const data = await response.json();
        if (response.ok && data.user) {
          teamMembers.push({
            name: data.user.name,
            role: 'Instructor',
            avatar: data.user.name
          });
        }
      }
      
      // Add default team members if needed
      if (teamMembers.length === 0) {
        teamMembers.push(
          { name: 'Dr. Sarah Johnson', role: 'Therapist', avatar: 'Therapist+User' },
          { name: 'Mark Wilson', role: 'Instructor', avatar: 'Instructor+User' }
        );
      }
      
      setTeam(teamMembers);
    } catch (error) {
      console.error('Error fetching team:', error);
    }
  };

  if (!userData) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body text-center py-5">
                <h3 className="mb-4">Enter Your User Code</h3>
                <form onSubmit={handleUserCodeSubmit}>
                  <div className="input-group mb-3">
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="Enter your user code"
                      value={userCode}
                      onChange={(e) => setUserCode(e.target.value)}
                      required
                    />
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      ) : (
                        'Load Dashboard'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-primary text-white py-4">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-0">User Dashboard</h2>
              <p className="mb-0">Welcome back, {userData.name}!</p>
            </div>
            <div>
              <span className="badge bg-light text-dark p-2">
                User Code: {userData.userCode}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-4">
        {/* Stats */}
        <div className="row mb-4">
          <div className="col-md-3 mb-3">
            <div className="card stat-card">
              <div className="card-body text-center">
                <h2 className="card-title">{sessions.length}</h2>
                <p className="card-text">Total Sessions</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card stat-card">
              <div className="card-body text-center">
                <h2 className="card-title">
                  {sessions.length > 0 
                    ? (sessions.reduce((sum, session) => sum + (session.rating || 0), 0) / sessions.length).toFixed(1)
                    : '0.0'
                  }
                </h2>
                <p className="card-text">Average Rating</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card stat-card">
              <div className="card-body text-center">
                <h2 className="card-title">
                  {sessions.filter(s => s.gameData).length}
                </h2>
                <p className="card-text">Games Completed</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card stat-card">
              <div className="card-body text-center">
                <h2 className="card-title">
                  {sessions.length > 0
                    ? Math.floor((new Date() - new Date(sessions[0].date)) / (1000 * 60 * 60 * 24))
                    : 0
                  }
                </h2>
                <p className="card-text">Days Since Last Session</p>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Progress */}
          <div className="col-md-8 mb-4">
            <div className="card">
              <div className="card-header bg-white">
                <h5 className="mb-0">My Progress</h5>
              </div>
              <div className="card-body">
                <div className="mb-4">
                  <p className="mb-1">Communication Skills</p>
                  <div className="progress mb-3" style={{ height: '12px' }}>
                    <div 
                      className="progress-bar bg-success" 
                      style={{ width: '75%' }}
                    ></div>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="mb-1">Motor Skills</p>
                  <div className="progress mb-3" style={{ height: '12px' }}>
                    <div 
                      className="progress-bar bg-info" 
                      style={{ width: '60%' }}
                    ></div>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="mb-1">Cognitive Abilities</p>
                  <div className="progress mb-3" style={{ height: '12px' }}>
                    <div 
                      className="progress-bar bg-warning" 
                      style={{ width: '45%' }}
                    ></div>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="mb-1">Social Interaction</p>
                  <div className="progress mb-3" style={{ height: '12px' }}>
                    <div 
                      className="progress-bar bg-danger" 
                      style={{ width: '30%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Team */}
          <div className="col-md-4 mb-4">
            <div className="card">
              <div className="card-header bg-white">
                <h5 className="mb-0">My Team</h5>
              </div>
              <div className="card-body">
                {team.map((member, index) => (
                  <div key={index} className="d-flex align-items-center mb-3">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${member.avatar}&background=random`}
                      alt={member.name}
                      className="rounded-circle me-3"
                      width="50"
                    />
                    <div>
                      <h6 className="mb-0">{member.name}</h6>
                      <p className="text-muted small mb-0">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Session Reviews */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-white">
                <h5 className="mb-0">Session History</h5>
              </div>
              <div className="card-body">
                {sessions.length === 0 ? (
                  <p className="text-center">No sessions found.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Game</th>
                          <th>Score</th>
                          <th>Rating</th>
                          <th>Review</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessions.map(session => (
                          <tr key={session._id}>
                            <td>{new Date(session.date).toLocaleDateString()}</td>
                            <td>{session.gameData?.gameName || 'Unknown'}</td>
                            <td>{session.gameData?.score || 'N/A'}</td>
                            <td>
                              <span className={`badge ${session.rating >= 4 ? 'bg-success' : session.rating >= 3 ? 'bg-warning' : 'bg-danger'}`}>
                                {session.rating || 'N/A'}/5
                              </span>
                            </td>
                            <td>{session.review || 'No review'}</td>
                            <td>
                              <span className={`badge ${session.status === 'active' ? 'bg-primary' : 'bg-success'}`}>
                                {session.status || 'unknown'}
                              </span>
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

        {/* Detailed Session Reviews */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-white">
                <h5 className="mb-0">Detailed Session Reviews</h5>
              </div>
              <div className="card-body">
                {sessions.length === 0 ? (
                  <p className="text-center">No session reviews found.</p>
                ) : (
                  sessions.map(session => (
                    <div key={session._id} className="session-review p-4 mb-3 border rounded">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="mb-0">
                          Session on {new Date(session.date).toLocaleDateString()} - {session.gameData?.gameName || 'Unknown Game'}
                        </h5>
                        <span className={`badge p-2 ${session.rating >= 4 ? 'bg-success' : session.rating >= 3 ? 'bg-primary' : 'bg-warning'}`}>
                          Rating: {session.rating}/5
                        </span>
                      </div>
                      
                      {session.gameData?.analytics && (
                        <div className="row mb-3">
                          <div className="col-md-6">
                            <p className="mb-1"><strong>Score:</strong> {session.gameData.analytics.score}</p>
                            <p className="mb-1"><strong>Total Movements:</strong> {session.gameData.analytics.movements}</p>
                            <p className="mb-1"><strong>Steps Covered:</strong> {session.gameData.analytics.steps}</p>
                          </div>
                          <div className="col-md-6">
                            <p className="mb-1"><strong>Hand Movements:</strong> {session.gameData.analytics.handMovements}</p>
                            <p className="mb-1"><strong>Leg Movements:</strong> {session.gameData.analytics.legMovements}</p>
                          </div>
                        </div>
                      )}
                      
                      <p className="mb-0"><strong>Review Notes:</strong> {session.review || 'No review notes available'}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
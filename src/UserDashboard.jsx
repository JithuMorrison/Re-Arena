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
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="card border-0 shadow-lg rounded-4">
                <div className="card-body p-5 text-center">
                  <div className="mb-4">
                    <div className="avatar-circle bg-primary bg-gradient mx-auto mb-3">
                      <i className="bi bi-person-circle text-white fs-1"></i>
                    </div>
                    <h2 className="fw-bold mb-2">Welcome to Your Dashboard</h2>
                    <p className="text-muted mb-4">
                      Enter your access code to view your therapy progress and session history
                    </p>
                  </div>
                  
                  <form onSubmit={handleUserCodeSubmit}>
                    <div className="input-group input-group-lg mb-4">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bi bi-ticket-perforated text-primary"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control form-control-lg border-start-0 py-3"
                        placeholder="Enter your access code (e.g., ABCD-1234)"
                        value={userCode}
                        onChange={(e) => setUserCode(e.target.value)}
                        required
                      />
                    </div>
                    
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-lg w-100 py-3 d-flex align-items-center justify-content-center"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                          Loading Dashboard...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-box-arrow-in-right me-2"></i>
                          Access Dashboard
                        </>
                      )}
                    </button>
                  </form>
                  
                  <div className="mt-4">
                    <small className="text-muted">
                      <i className="bi bi-info-circle me-1"></i>
                      Get your access code from your therapist
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light" style={{marginTop:'80px'}}>
      {/* Header */}
      <div className="header-section bg-gradient-primary text-white py-4 shadow-sm">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-1">Welcome, {userData.name}!</h2>
              <p className="mb-0 opacity-75">Track your therapy progress and session history</p>
            </div>
            <div className="text-end">
              <div className="user-code-badge bg-white text-dark px-3 py-2 rounded-3 shadow-sm">
                <i className="bi bi-key me-2"></i>
                <span className="fw-medium">Access Code: {userData.userCode}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-4">
        {/* Stats Cards */}
        <div className="row g-4 mb-4">
          <div className="col-md-3 col-sm-6">
            <div className="stat-card card border-0 shadow-sm h-100 hover-lift">
              <div className="card-body p-4">
                <div className="d-flex align-items-center">
                  <div className="stat-icon-wrapper bg-primary bg-opacity-10 rounded-circle me-3" style={{paddingTop: '5px', paddingLeft: '15px'}}>
                    <i className="bi bi-calendar-check text-primary fs-3"></i>
                  </div>
                  <div>
                    <h2 className="display-6 fw-bold mb-0">{sessions.length}</h2>
                    <p className="text-muted mb-0">Total Sessions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-3 col-sm-6">
            <div className="stat-card card border-0 shadow-sm h-100 hover-lift">
              <div className="card-body p-4">
                <div className="d-flex align-items-center">
                  <div className="stat-icon-wrapper bg-success bg-opacity-10 rounded-circle me-3" style={{paddingTop: '5px', paddingLeft: '15px'}}>
                    <i className="bi bi-star-fill text-success fs-3"></i>
                  </div>
                  <div>
                    <h2 className="display-6 fw-bold mb-0">
                      {sessions.length > 0 
                        ? (sessions.reduce((sum, session) => sum + (session.rating || 0), 0) / sessions.length).toFixed(1)
                        : '0.0'
                      }
                    </h2>
                    <p className="text-muted mb-0">Average Rating</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-3 col-sm-6">
            <div className="stat-card card border-0 shadow-sm h-100 hover-lift">
              <div className="card-body p-4">
                <div className="d-flex align-items-center">
                  <div className="stat-icon-wrapper bg-info bg-opacity-10 rounded-circle me-3" style={{paddingTop: '5px', paddingLeft: '15px'}}>
                    <i className="bi bi-controller text-info fs-3"></i>
                  </div>
                  <div>
                    <h2 className="display-6 fw-bold mb-0">
                      {sessions.filter(s => s.gameData).length}
                    </h2>
                    <p className="text-muted mb-0">Games Completed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-3 col-sm-6">
            <div className="stat-card card border-0 shadow-sm h-100 hover-lift">
              <div className="card-body p-4">
                <div className="d-flex align-items-center">
                  <div className="stat-icon-wrapper bg-warning bg-opacity-10 rounded-circle me-3" style={{paddingTop: '5px', paddingLeft: '15px'}}>
                    <i className="bi bi-clock-history text-warning fs-3"></i>
                  </div>
                  <div>
                    <h2 className="display-6 fw-bold mb-0">
                      {sessions.length > 0
                        ? Math.floor((new Date() - new Date(sessions[0].date)) / (1000 * 60 * 60 * 24))
                        : 0
                      }
                    </h2>
                    <p className="text-muted mb-0">Days Since Last Session</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Progress Section */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white border-bottom-0 pb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold mb-0">
                    <i className="bi bi-graph-up me-2"></i>
                    Progress Overview
                  </h5>
                  <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-1">
                    Weekly Summary
                  </span>
                </div>
              </div>
              <div className="card-body p-4">
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-medium">Communication Skills</span>
                    <span className="fw-bold text-primary">75%</span>
                  </div>
                  <div className="progress mb-3" style={{ height: '10px' }}>
                    <div 
                      className="progress-bar bg-primary" 
                      role="progressbar" 
                      style={{ width: '75%' }}
                    ></div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-medium">Motor Skills</span>
                    <span className="fw-bold text-info">60%</span>
                  </div>
                  <div className="progress mb-3" style={{ height: '10px' }}>
                    <div 
                      className="progress-bar bg-info" 
                      role="progressbar" 
                      style={{ width: '60%' }}
                    ></div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-medium">Cognitive Abilities</span>
                    <span className="fw-bold text-warning">45%</span>
                  </div>
                  <div className="progress mb-3" style={{ height: '10px' }}>
                    <div 
                      className="progress-bar bg-warning" 
                      role="progressbar" 
                      style={{ width: '45%' }}
                    ></div>
                  </div>
                </div>
                
                <div className="mb-0">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-medium">Social Interaction</span>
                    <span className="fw-bold text-success">30%</span>
                  </div>
                  <div className="progress" style={{ height: '10px' }}>
                    <div 
                      className="progress-bar bg-success" 
                      role="progressbar" 
                      style={{ width: '30%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white border-bottom-0 pb-3">
                <h5 className="fw-bold mb-0">
                  <i className="bi bi-people-fill me-2"></i>
                  My Care Team
                </h5>
              </div>
              <div className="card-body p-4">
                {team.map((member, index) => (
                  <div 
                    key={index} 
                    className="team-member-card p-3 mb-3 border rounded-3 d-flex align-items-center"
                  >
                    <div className="avatar-wrapper me-3">
                      <div className="avatar-circle bg-gradient-primary text-white">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="fw-bold mb-1">{member.name}</h6>
                      <div className="d-flex align-items-center">
                        <span className={`badge ${member.role === 'Therapist' ? 'bg-primary' : 'bg-success'} bg-opacity-10 ${member.role === 'Therapist' ? 'text-primary' : 'text-success'} px-2 py-1 me-2`}>
                          {member.role}
                        </span>
                        <small className="text-muted">
                          <i className="bi bi-person-check me-1"></i>
                          Assigned Professional
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Session History */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom-0 pb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold mb-0">
                    <i className="bi bi-clock-history me-2"></i>
                    Session History
                  </h5>
                  <span className="badge bg-light text-dark px-3 py-1">
                    {sessions.length} sessions
                  </span>
                </div>
              </div>
              <div className="card-body p-0">
                {sessions.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="mb-3">
                      <i className="bi bi-calendar-x text-muted fs-1"></i>
                    </div>
                    <h5 className="text-muted mb-2">No sessions found</h5>
                    <p className="text-muted mb-0">Your session history will appear here</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="border-0 ps-4">Date</th>
                          <th className="border-0">Game</th>
                          <th className="border-0">Score</th>
                          <th className="border-0">Rating</th>
                          <th className="border-0">Review</th>
                          <th className="border-0 pe-4">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessions.map(session => (
                          <tr key={session._id}>
                            <td className="ps-4">
                              <div className="d-flex flex-column">
                                <span className="fw-medium">{new Date(session.date).toLocaleDateString()}</span>
                                <small className="text-muted">
                                  {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </small>
                              </div>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <i className="bi bi-controller text-primary me-2"></i>
                                <span>{session.gameData?.gameName || 'Unknown Game'}</span>
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark px-3 py-2">
                                {session.gameData?.score || 'N/A'}
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
                                <span className={`fw-bold ${session.rating >= 4 ? 'text-success' : session.rating >= 3 ? 'text-warning' : 'text-danger'}`}>
                                  {session.rating || 'N/A'}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span className="text-truncate d-inline-block" style={{ maxWidth: '200px' }}>
                                {session.review || 'No review'}
                              </span>
                            </td>
                            <td className="pe-4">
                              <span className={`badge ${session.status === 'active' ? 'bg-primary' : 'bg-success'} px-3 py-2`}>
                                <i className={`bi ${session.status === 'active' ? 'bi-play-circle' : 'bi-check-circle'} me-1`}></i>
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
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom-0 pb-3">
                <h5 className="fw-bold mb-0">
                  <i className="bi bi-journal-text me-2"></i>
                  Session Details
                </h5>
              </div>
              <div className="card-body p-4">
                {sessions.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted">No session details available</p>
                  </div>
                ) : (
                  <div className="row g-4">
                    {sessions.map(session => (
                      <div key={session._id} className="col-lg-6">
                        <div className="session-detail-card p-4 border rounded-4 h-100">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                              <h6 className="fw-bold mb-1">
                                {session.gameData?.gameName || 'Unknown Game'}
                              </h6>
                              <p className="text-muted small mb-0">
                                <i className="bi bi-calendar me-1"></i>
                                {new Date(session.date).toLocaleDateString()} at {' '}
                                {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <div className="text-end">
                              <div className={`rating-badge ${session.rating >= 4 ? 'bg-success' : session.rating >= 3 ? 'bg-primary' : 'bg-warning'} text-white px-3 py-2 rounded-3`}>
                                <span className="fw-bold">{session.rating || 'N/A'}/5</span>
                              </div>
                            </div>
                          </div>
                          
                          {session.gameData?.analytics && (
                            <div className="analytics-grid mb-3">
                              <div className="row g-2">
                                <div className="col-6">
                                  <div className="p-3 bg-light rounded-3 text-center">
                                    <div className="fw-bold text-primary fs-4 mb-1">
                                      {session.gameData.analytics.score || '0'}
                                    </div>
                                    <div className="small text-muted">Score</div>
                                  </div>
                                </div>
                                <div className="col-6">
                                  <div className="p-3 bg-light rounded-3 text-center">
                                    <div className="fw-bold text-info fs-4 mb-1">
                                      {session.gameData.analytics.movements || '0'}
                                    </div>
                                    <div className="small text-muted">Movements</div>
                                  </div>
                                </div>
                                <div className="col-6">
                                  <div className="p-3 bg-light rounded-3 text-center">
                                    <div className="fw-bold text-success fs-4 mb-1">
                                      {session.gameData.analytics.steps || '0'}
                                    </div>
                                    <div className="small text-muted">Steps Covered</div>
                                  </div>
                                </div>
                                <div className="col-6">
                                  <div className="p-3 bg-light rounded-3 text-center">
                                    <div className="fw-bold text-warning fs-4 mb-1">
                                      {session.gameData.analytics.handMovements || '0'}
                                    </div>
                                    <div className="small text-muted">Hand Movements</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div className="review-section">
                            <h6 className="fw-bold mb-2">Review Notes</h6>
                            <div className="p-3 bg-light rounded-3">
                              <p className="mb-0">{session.review || 'No review notes available for this session.'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS Styles */}
      <style jsx>{`
        .header-section {
          background: linear-gradient(135deg, #4e73df 0%, #224abe 100%);
        }
        
        .bg-gradient-primary {
          background: linear-gradient(135deg, #4e73df 0%, #224abe 100%);
        }
        
        .avatar-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
        
        .stat-card {
          transition: all 0.3s ease;
          border-radius: 12px;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.1) !important;
        }
        
        .stat-icon-wrapper {
          width: 56px;
          height: 56px;
        }
        
        .team-member-card {
          transition: all 0.3s ease;
          background: #f8f9fa;
        }
        
        .team-member-card:hover {
          background: white;
          border-color: #4e73df;
          transform: translateX(5px);
        }
        
        .session-detail-card {
          transition: all 0.3s ease;
          background: white;
          border: 1px solid #e9ecef;
        }
        
        .session-detail-card:hover {
          box-shadow: 0 5px 20px rgba(0,0,0,0.1);
          transform: translateY(-3px);
        }
        
        .rating-stars {
          display: flex;
          gap: 2px;
        }
        
        .rating-stars i {
          font-size: 0.9rem;
        }
        
        .analytics-grid .bg-light {
          transition: all 0.3s ease;
        }
        
        .analytics-grid .bg-light:hover {
          background: #f1f3f9 !important;
          transform: scale(1.05);
        }
        
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.1) !important;
        }
        
        .opacity-75 {
          opacity: 0.75;
        }
        
        .user-code-badge {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
        }
        
        .min-vh-100 {
          min-height: 100vh;
        }
        
        .rounded-4 {
          border-radius: 20px;
        }
        
        .border-bottom-0 {
          border-bottom: none;
        }
        
        /* Table styles */
        .table > :not(caption) > * > * {
          padding: 1rem 0.75rem;
        }
        
        .table-hover tbody tr:hover {
          background-color: rgba(78, 115, 223, 0.05);
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .stat-card .d-flex {
            flex-direction: column;
            text-align: center;
          }
          
          .stat-icon-wrapper {
            margin: 0 auto 1rem auto;
          }
          
          .team-member-card {
            flex-direction: column;
            text-align: center;
          }
          
          .avatar-wrapper {
            margin: 0 auto 1rem auto;
          }
        }
      `}</style>
      
      {/* Add Bootstrap Icons */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css"></link>
    </div>
  );
};

export default UserDashboard;
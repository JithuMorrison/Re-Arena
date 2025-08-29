// src/pages/UserDashboard.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const UserDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [team, setTeam] = useState([]);
  const location = useLocation();
  const userCode = location.state?.userCode;

  useEffect(() => {
    if (userCode) {
      fetchUserData();
      fetchSessions();
      fetchTeam();
    }
  }, [userCode]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/user-by-code?userCode=${userCode}`
      );
      const data = await response.json();
      if (response.ok) {
        setUserData(data.user);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/sessions?userCode=${userCode}&userType=patient`
      );
      const data = await response.json();
      if (response.ok) {
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchTeam = async () => {
    // This would typically come from your backend
    const mockTeam = [
      { name: 'Dr. Sarah Johnson', role: 'Therapist', avatar: 'Therapist+User' },
      { name: 'Mark Wilson', role: 'Instructor', avatar: 'Instructor+User' },
      { name: 'Amy Rodriguez', role: 'Therapy Assistant', avatar: 'Assistant+User' }
    ];
    setTeam(mockTeam);
  };

  if (!userData) {
    return (
      <div className="container text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading user data...</p>
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
                    ? (sessions.reduce((sum, session) => sum + session.rating, 0) / sessions.length).toFixed(1)
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
                <h5 className="mb-0">Recent Session Reviews</h5>
              </div>
              <div className="card-body">
                {sessions.length === 0 ? (
                  <p className="text-center">No sessions found.</p>
                ) : (
                  sessions.map(session => (
                    <div key={session._id} className="session-review p-4 mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="mb-0">Session #{sessions.indexOf(session) + 1}</h5>
                        <span className={`badge p-2 ${session.rating >= 4 ? 'bg-success' : session.rating >= 3 ? 'bg-primary' : 'bg-warning'}`}>
                          Rating: {session.rating}/5
                        </span>
                      </div>
                      <p className="mb-1"><strong>Date:</strong> {new Date(session.date).toLocaleDateString()}</p>
                      <p className="mb-0"><strong>Notes:</strong> {session.review}</p>
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
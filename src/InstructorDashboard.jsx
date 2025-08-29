// src/pages/InstructorDashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const InstructorDashboard = () => {
  const { currentUser } = useAuth();
  const [userCode, setUserCode] = useState('');
  const [userData, setUserData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    notes: '',
    gameData: {}
  });

  useEffect(() => {
    if (currentUser) {
      fetchSessions();
    }
  }, [currentUser]);

  const fetchSessions = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/sessions?userId=${currentUser._id}&userType=instructor`
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

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instructorId: currentUser._id,
          patientId: userData._id,
          review: reviewData.notes,
          rating: reviewData.rating,
          gameData: reviewData.gameData
        }),
      });
      
      if (response.ok) {
        alert('Session review submitted successfully');
        setShowReviewForm(false);
        setReviewData({ rating: 5, notes: '', gameData: {} });
        fetchSessions();
      } else {
        alert('Error submitting review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
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

        {/* Main Content */}
        <div className="col-md-9 col-lg-10 p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Instructor Dashboard</h2>
            <button 
              className="btn btn-success"
              onClick={() => setShowReviewForm(true)}
              disabled={!userData}
            >
              <i className="bi bi-plus-circle me-1"></i> Add Session Review
            </button>
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

      {/* Review Modal */}
      {showReviewForm && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog">
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
                  <div className="mb-3">
                    <label className="form-label">Rating</label>
                    <select
                      className="form-select"
                      value={reviewData.rating}
                      onChange={(e) => setReviewData({...reviewData, rating: parseInt(e.target.value)})}
                    >
                      <option value="5">5 - Excellent</option>
                      <option value="4">4 - Very Good</option>
                      <option value="3">3 - Good</option>
                      <option value="2">2 - Fair</option>
                      <option value="1">1 - Poor</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Session Notes</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={reviewData.notes}
                      onChange={(e) => setReviewData({...reviewData, notes: e.target.value})}
                      required
                    ></textarea>
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
    </div>
  );
};

export default InstructorDashboard;
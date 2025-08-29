// src/pages/Home.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Home = () => {
  const [userCode, setUserCode] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleUserCodeSubmit = (e) => {
    e.preventDefault();
    if (userCode) {
      navigate('/user', { state: { userCode } });
    }
  };

  const handleTherapistLogin = () => {
    navigate('/login', { state: { userType: 'therapist' } });
  };

  const handleInstructorLogin = () => {
    navigate('/login', { state: { userType: 'instructor' } });
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-primary text-white py-5 text-center">
        <div className="container">
          <h1 className="display-4 fw-bold">TherapyConnect Dashboard</h1>
          <p className="lead">A comprehensive platform for therapists, instructors, and clients</p>
        </div>
      </div>
      
      <div className="container py-5">
        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-body text-center p-4">
                <i className="bi bi-person-check-fill display-1 text-primary mb-3"></i>
                <h3 className="card-title">For Therapists</h3>
                <p className="card-text">
                  Manage your clients, track progress, and create session reviews with our comprehensive dashboard.
                </p>
                {currentUser ? (
                  currentUser.userType === 'therapist' ? (
                    <button 
                      className="btn btn-primary mt-3"
                      onClick={() => navigate('/therapist')}
                    >
                      Go to Dashboard
                    </button>
                  ) : (
                    <button className="btn btn-outline-primary mt-3" disabled>
                      Therapist Account Required
                    </button>
                  )
                ) : (
                  <button 
                    className="btn btn-primary mt-3"
                    onClick={handleTherapistLogin}
                  >
                    Therapist Login
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-body text-center p-4">
                <i className="bi bi-people-fill display-1 text-success mb-3"></i>
                <h3 className="card-title">For Instructors</h3>
                <p className="card-text">
                  Access user information, submit session reviews, and monitor client progress.
                </p>
                {currentUser ? (
                  currentUser.userType === 'instructor' ? (
                    <button 
                      className="btn btn-success mt-3"
                      onClick={() => navigate('/instructor')}
                    >
                      Go to Dashboard
                    </button>
                  ) : (
                    <button className="btn btn-outline-success mt-3" disabled>
                      Instructor Account Required
                    </button>
                  )
                ) : (
                  <button 
                    className="btn btn-success mt-3"
                    onClick={handleInstructorLogin}
                  >
                    Instructor Login
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* User Code Access Section */}
        <div className="row mt-5">
          <div className="col-12">
            <div className="card">
              <div className="card-body p-4 text-center">
                <h2 className="card-title mb-4">Access Your Dashboard</h2>
                <p className="card-text mb-4">
                  Enter your user code to view your progress and session history
                </p>
                <div className="row justify-content-center">
                  <div className="col-md-8">
                    <form onSubmit={handleUserCodeSubmit}>
                      <div className="input-group input-group-lg">
                        <input 
                          type="text" 
                          className="form-control user-code-input" 
                          placeholder="Enter User Code" 
                          value={userCode}
                          onChange={(e) => setUserCode(e.target.value)}
                          required
                        />
                        <button 
                          className="btn btn-primary" 
                          type="submit"
                        >
                          Go
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
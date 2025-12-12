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
    if (userCode.trim()) {
      navigate('/user', { state: { userCode: userCode.trim() } });
    }
  };

  const handleTherapistLogin = () => {
    navigate('/login', { state: { userType: 'therapist' } });
  };

  const handleInstructorLogin = () => {
    navigate('/login', { state: { userType: 'instructor' } });
  };

  const handleGoToDashboard = () => {
    if (currentUser) {
      navigate(currentUser.userType === 'therapist' ? '/therapist' : '/instructor');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="home-page" style={{paddingTop: '80px'}}>
      {/* Hero Section */}
      <div className="hero-section position-relative overflow-hidden">
        <div className="container">
          <div className="row align-items-center min-vh-70 py-5">
            <div className="col-lg-7 mb-5 mb-lg-0">
              <div className="hero-content">
                <h1 className="display-4 fw-bold text-white mb-4">
                  <span className="gradient-text">TherapyConnect</span> Dashboard
                </h1>
                <p className="lead text-white-80 mb-4">
                  A comprehensive platform connecting therapists, instructors, and clients for seamless rehabilitation management
                </p>
                <div className="d-flex flex-wrap gap-3">
                  <button 
                    className="btn btn-light btn-lg px-4 d-flex align-items-center"
                    onClick={handleGoToDashboard}
                  >
                    <i className="bi bi-speedometer2 me-2"></i>
                    {currentUser ? 'Go to Dashboard' : 'View Dashboard'}
                  </button>
                  
                  <button 
                    className="btn btn-outline-light btn-lg px-4 d-flex align-items-center"
                    onClick={() => document.getElementById('user-access-section').scrollIntoView({ behavior: 'smooth' })}
                  >
                    <i className="bi bi-code-square me-2"></i>
                    Enter Access Code
                  </button>
                </div>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="hero-illustration position-relative">
                <div className="floating-card card border-0 shadow-lg" style={{ zIndex: 0 }}>
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="icon-wrapper bg-primary bg-opacity-10 rounded-circle me-3" style={{paddingLeft:'10px', paddingTop: '2px'}}>
                        <i className="bi bi-clipboard-data text-primary fs-3"></i>
                      </div>
                      <div>
                        <h5 className="mb-0">Progress Overview</h5>
                        <small className="text-muted">Weekly summary</small>
                      </div>
                    </div>
                    <div className="progress mb-4" style={{ height: '8px' }}>
                      <div className="progress-bar bg-primary" style={{ width: '75%' }}></div>
                    </div>
                    <div className="stats-grid">
                      <div className="stat-item text-center">
                        <div className="stat-value text-primary">28</div>
                        <div className="stat-label text-muted small">Active Patients</div>
                      </div>
                      <div className="stat-item text-center">
                        <div className="stat-value text-success">95%</div>
                        <div className="stat-label text-muted small">Completion Rate</div>
                      </div>
                      <div className="stat-item text-center">
                        <div className="stat-value text-info">48</div>
                        <div className="stat-label text-muted small">Sessions This Week</div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating Elements - Positioned to avoid text overlap */}
                <div className="floating-element floating-1" style={{ top: '10%', right: '25%' }}>
                  <i className="bi bi-heart-pulse text-danger"></i>
                </div>
                <div className="floating-element floating-2" style={{ bottom: '50%', left: '0%' }}>
                  <i className="bi bi-star-fill text-warning"></i>
                </div>
                <div className="floating-element floating-3" style={{ top: '30%', right: '5%' }}>
                  <i className="bi bi-activity text-success"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Background Elements */}
        <div className="hero-bg-element hero-bg-1"></div>
        <div className="hero-bg-element hero-bg-2"></div>
        <div className="hero-bg-element hero-bg-3"></div>
      </div>

      {/* Features Section */}
      <div className="container py-5 my-5">
        <div className="text-center mb-5">
          <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill mb-3">
            <i className="bi bi-stars me-2"></i>
            Platform Features
          </span>
          <h2 className="display-6 fw-bold mb-3">Comprehensive Care Management</h2>
          <p className="text-muted lead">Everything you need for effective therapy management in one place</p>
        </div>

        <div className="row g-4">
          <div className="col-md-4">
            <div className="feature-card card border-0 shadow-sm h-100 hover-lift">
              <div className="card-body p-4">
                <div className="feature-icon-wrapper mb-4">
                  <div className="icon-circle bg-primary bg-opacity-10">
                    <i className="bi bi-person-heart text-primary fs-2"></i>
                  </div>
                </div>
                <h4 className="fw-bold mb-3">Patient Management</h4>
                <p className="text-muted mb-4">
                  Easily manage patient profiles, track progress, and schedule therapy sessions with our intuitive dashboard.
                </p>
                <ul className="list-unstyled text-muted">
                  <li className="mb-2">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    Patient progress tracking
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    Session scheduling
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    Medical record management
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="feature-card card border-0 shadow-sm h-100 hover-lift">
              <div className="card-body p-4">
                <div className="feature-icon-wrapper mb-4">
                  <div className="icon-circle bg-success bg-opacity-10">
                    <i className="bi bi-graph-up-arrow text-success fs-2"></i>
                  </div>
                </div>
                <h4 className="fw-bold mb-3">Progress Analytics</h4>
                <p className="text-muted mb-4">
                  Detailed analytics and reporting tools to monitor patient progress and treatment effectiveness.
                </p>
                <ul className="list-unstyled text-muted">
                  <li className="mb-2">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    Real-time progress tracking
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    Customizable reports
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    Data visualization
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="feature-card card border-0 shadow-sm h-100 hover-lift">
              <div className="card-body p-4">
                <div className="feature-icon-wrapper mb-4">
                  <div className="icon-circle bg-info bg-opacity-10">
                    <i className="bi bi-calendar-check text-info fs-2"></i>
                  </div>
                </div>
                <h4 className="fw-bold mb-3">Session Management</h4>
                <p className="text-muted mb-4">
                  Efficiently schedule, track, and manage therapy sessions for all your patients in one centralized system.
                </p>
                <ul className="list-unstyled text-muted">
                  <li className="mb-2">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    Session based training
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    Report Generation
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    Progress tracking
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Roles Section */}
      <div className="bg-light py-5 my-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-6 fw-bold mb-3">Choose Your Role</h2>
            <p className="text-muted lead">Access the platform based on your role in the therapy process</p>
          </div>

          <div className="row g-4 justify-content-center">
            {/* Therapist Card */}
            <div className="col-lg-5">
              <div className={`role-card card border-0 h-100 ${currentUser?.userType === 'therapist' ? 'active-role shadow-lg' : 'shadow-sm'}`}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-start mb-4">
                    <div className="role-icon-wrapper me-4">
                      <div className="icon-circle bg-primary">
                        <i className="bi bi-person-check text-white fs-3"></i>
                      </div>
                    </div>
                    <div>
                      <h3 className="fw-bold mb-2">Therapist</h3>
                      <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-1">
                        Professional Access
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-muted mb-4">
                    Full access to patient management, progress tracking, report generation, and session planning tools.
                  </p>
                  
                  <ul className="list-unstyled text-muted mb-4">
                    <li className="mb-3">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-check-circle-fill text-primary me-3 fs-5"></i>
                        <span>Manage multiple patients</span>
                      </div>
                    </li>
                    <li className="mb-3">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-check-circle-fill text-primary me-3 fs-5"></i>
                        <span>Create treatment plans</span>
                      </div>
                    </li>
                    <li className="mb-3">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-check-circle-fill text-primary me-3 fs-5"></i>
                        <span>Generate progress reports</span>
                      </div>
                    </li>
                    <li className="mb-3">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-check-circle-fill text-primary me-3 fs-5"></i>
                        <span>Assign exercises & games</span>
                      </div>
                    </li>
                  </ul>

                  <div className="mt-4">
                    {currentUser ? (
                      currentUser.userType === 'therapist' ? (
                        <button 
                          className="btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center"
                          onClick={() => navigate('/therapist')}
                        >
                          <i className="bi bi-speedometer2 me-2"></i>
                          Go to Dashboard
                        </button>
                      ) : (
                        <button 
                          className="btn btn-outline-primary btn-lg w-100"
                          onClick={handleTherapistLogin}
                        >
                          <i className="bi bi-person-check me-2"></i>
                          Therapist Login
                        </button>
                      )
                    ) : (
                      <button 
                        className="btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center"
                        onClick={handleTherapistLogin}
                      >
                        <i className="bi bi-person-check me-2"></i>
                        Therapist Login
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Instructor Card */}
            <div className="col-lg-5">
              <div className={`role-card card border-0 h-100 ${currentUser?.userType === 'instructor' ? 'active-role shadow-lg' : 'shadow-sm'}`}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-start mb-4">
                    <div className="role-icon-wrapper me-4">
                      <div className="icon-circle bg-success">
                        <i className="bi bi-people text-white fs-3"></i>
                      </div>
                    </div>
                    <div>
                      <h3 className="fw-bold mb-2">Instructor</h3>
                      <span className="badge bg-success bg-opacity-10 text-success px-3 py-1">
                        Session Management
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-muted mb-4">
                    Access assigned patients, conduct therapy sessions, and provide session reviews and feedback.
                  </p>
                  
                  <ul className="list-unstyled text-muted mb-4">
                    <li className="mb-3">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-check-circle-fill text-success me-3 fs-5"></i>
                        <span>View assigned patients</span>
                      </div>
                    </li>
                    <li className="mb-3">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-check-circle-fill text-success me-3 fs-5"></i>
                        <span>Conduct therapy sessions</span>
                      </div>
                    </li>
                    <li className="mb-3">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-check-circle-fill text-success me-3 fs-5"></i>
                        <span>Submit session reviews</span>
                      </div>
                    </li>
                    <li className="mb-3">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-check-circle-fill text-success me-3 fs-5"></i>
                        <span>Monitor patient progress</span>
                      </div>
                    </li>
                  </ul>

                  <div className="mt-4">
                    {currentUser ? (
                      currentUser.userType === 'instructor' ? (
                        <button 
                          className="btn btn-success btn-lg w-100 d-flex align-items-center justify-content-center"
                          onClick={() => navigate('/instructor')}
                        >
                          <i className="bi bi-speedometer2 me-2"></i>
                          Go to Dashboard
                        </button>
                      ) : (
                        <button 
                          className="btn btn-outline-success btn-lg w-100"
                          onClick={handleInstructorLogin}
                        >
                          <i className="bi bi-people me-2"></i>
                          Instructor Login
                        </button>
                      )
                    ) : (
                      <button 
                        className="btn btn-success btn-lg w-100 d-flex align-items-center justify-content-center"
                        onClick={handleInstructorLogin}
                      >
                        <i className="bi bi-people me-2"></i>
                        Instructor Login
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Access Section */}
      <div id="user-access-section" className="container py-5 my-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="access-card card border-0 shadow-lg">
              <div className="card-body p-5">
                <div className="text-center mb-5">
                  <div className="access-icon-wrapper mb-4">
                    <div className="icon-circle bg-warning bg-opacity-10 mx-auto">
                      <i className="bi bi-person-circle text-warning fs-1"></i>
                    </div>
                  </div>
                  <h2 className="fw-bold mb-3">Patient Access</h2>
                  <p className="text-muted lead mb-0">
                    Enter your access code to view your personalized therapy progress and session history
                  </p>
                </div>

                <form onSubmit={handleUserCodeSubmit}>
                  <div className="input-group input-group-lg mb-4">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-ticket-perforated text-primary"></i>
                    </span>
                    <input 
                      type="text" 
                      className="form-control border-start-0 border-end-0 py-3 px-3" 
                      placeholder="Enter your access code (e.g., ABCD-1234)" 
                      value={userCode}
                      onChange={(e) => setUserCode(e.target.value)}
                      required
                    />
                    <button 
                      className="btn btn-warning btn-lg px-4 d-flex align-items-center" 
                      type="submit"
                    >
                      <i className="bi bi-arrow-right-circle me-2"></i>
                      View Progress
                    </button>
                  </div>
                  
                  <div className="text-center">
                    <small className="text-muted d-block mb-2">
                      <i className="bi bi-info-circle me-1"></i>
                      Get your access code from your therapist
                    </small>
                  </div>
                </form>

                <div className="row mt-5 pt-4 border-top">
                  <div className="col-md-4 text-center mb-3">
                    <div className="text-primary">
                      <i className="bi bi-calendar-check fs-2 mb-2"></i>
                      <h6 className="fw-bold mb-1">Session History</h6>
                      <small className="text-muted">View past sessions</small>
                    </div>
                  </div>
                  <div className="col-md-4 text-center mb-3">
                    <div className="text-success">
                      <i className="bi bi-graph-up fs-2 mb-2"></i>
                      <h6 className="fw-bold mb-1">Progress Tracking</h6>
                      <small className="text-muted">Monitor improvements</small>
                    </div>
                  </div>
                  <div className="col-md-4 text-center mb-3">
                    <div className="text-info">
                      <i className="bi bi-journal-text fs-2 mb-2"></i>
                      <h6 className="fw-bold mb-1">Exercise Plans</h6>
                      <small className="text-muted">View assigned exercises</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS Styles */}
      <style jsx>{`
        .home-page {
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        }
        
        .hero-section {
          background: linear-gradient(135deg, #4e73df 0%, #224abe 100%);
          position: relative;
          overflow: hidden;
        }
        
        .hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
        }
        
        .gradient-text {
          background: linear-gradient(45deg, #fff, #e3f2fd);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .min-vh-70 {
          min-height: 70vh;
        }
        
        .text-white-80 {
          color: rgba(255, 255, 255, 0.8);
        }
        
        .floating-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          animation: float 6s ease-in-out infinite;
          position: relative;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        .floating-element {
          position: absolute;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(5px);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
          animation: floatElement 8s ease-in-out infinite;
        }
        
        .floating-element i {
          font-size: 1.5rem;
        }
        
        /* Fixed positions for floating elements to avoid text overlap */
        .hero-illustration {
          position: relative;
          min-height: 300px;
        }
        
        .floating-1 {
          width: 60px;
          height: 60px;
          animation-delay: 0s;
        }
        
        .floating-2 {
          width: 40px;
          height: 40px;
          animation-delay: 2s;
        }
        
        .floating-3 {
          width: 50px;
          height: 50px;
          animation-delay: 4s;
        }
        
        @keyframes floatElement {
          0%, 100% { 
            transform: translate(0, 0) rotate(0deg); 
          }
          33% { 
            transform: translate(10px, -15px) rotate(120deg); 
          }
          66% { 
            transform: translate(-5px, 5px) rotate(240deg); 
          }
        }
        
        .icon-wrapper {
          width: 48px;
          height: 48px;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        
        .stat-value {
          font-size: 1.5rem;
          font-weight: bold;
        }
        
        .feature-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .feature-card:hover {
          transform: translateY(-10px);
        }
        
        .icon-circle {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .role-card {
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }
        
        .role-card:hover {
          transform: translateY(-5px);
          border-color: #dee2e6;
        }
        
        .active-role {
          border: 2px solid #4e73df !important;
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        }
        
        .access-card {
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
          border-radius: 20px;
        }
        
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.1) !important;
        }
        
        .hero-bg-element {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          animation: pulse 4s ease-in-out infinite;
          z-index: 0;
        }
        
        .hero-bg-1 {
          width: 300px;
          height: 300px;
          top: -150px;
          right: -150px;
          animation-delay: 0s;
        }
        
        .hero-bg-2 {
          width: 200px;
          height: 200px;
          bottom: -100px;
          left: -100px;
          animation-delay: 1s;
        }
        
        .hero-bg-3 {
          width: 150px;
          height: 150px;
          top: 30%;
          left: 5%;
          animation-delay: 2s;
        }
        
        @keyframes pulse {
          0%, 100% { 
            opacity: 0.1; 
            transform: scale(1); 
          }
          50% { 
            opacity: 0.15; 
            transform: scale(1.05); 
          }
        }
        
        /* Ensure text readability over animations */
        .hero-content,
        .floating-card {
          position: relative;
          z-index: 2;
        }
      `}</style>
      
      {/* Add Bootstrap Icons */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css"></link>
    </div>
  );
};

export default Home;
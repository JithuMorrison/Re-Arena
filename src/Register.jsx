// src/pages/Register.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Register = () => {
  const [userData, setUserData] = useState({
    userType: 'therapist',
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (userData.password !== userData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (userData.password.length < 6) {
      return setError('Password should be at least 6 characters');
    }

    setIsLoading(true);

    try {
      const result = await register(userData);
      if (result.success) {
        alert(`Registration successful! Your user code is: ${result.data.userCode}`);
        navigate('/login');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to create an account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <style jsx>{`
        .register-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }
        
        .register-page::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
        }
        
        .register-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          width: 100%;
          max-width: 500px;
          overflow: hidden;
        }
        
        .register-header {
          background: linear-gradient(135deg, #4e73df 0%, #224abe 100%);
          padding: 2.5rem 2rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .register-header::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          right: -50%;
          bottom: -50%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 20px 20px;
          opacity: 0.1;
          animation: float 20s linear infinite;
        }
        
        @keyframes float {
          0% { transform: translate(0, 0); }
          100% { transform: translate(20px, 20px); }
        }
        
        .logo-wrapper1 {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem auto;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }
        
        .logo-icon1 {
          font-size: 2.5rem;
          color: white;
        }
        
        .register-body {
          padding: 2.5rem 2rem;
        }
        
        .form-control-custom {
          background: #f8f9fa;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          padding: 1rem 1.25rem;
          font-size: 1rem;
          transition: all 0.3s ease;
        }
        
        .form-control-custom:focus {
          background: white;
          border-color: #4e73df;
          box-shadow: 0 0 0 0.25rem rgba(78, 115, 223, 0.25);
          transform: translateY(-1px);
        }
        
        .form-label {
          font-weight: 500;
          color: #495057;
          margin-bottom: 0.5rem;
        }
        
        .register-btn {
          background: linear-gradient(135deg, #1cc88a 0%, #13855c 100%);
          border: none;
          border-radius: 12px;
          padding: 1rem;
          font-weight: 600;
          font-size: 1.1rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .register-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(28, 200, 138, 0.3);
        }
        
        .register-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none !important;
        }
        
        .user-type-selector {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .user-type-option {
          flex: 1;
          text-align: center;
          padding: 1.5rem;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          background: white;
        }
        
        .user-type-option:hover {
          transform: translateY(-3px);
          border-color: #4e73df;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .user-type-option.selected {
          border-color: #4e73df;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          box-shadow: 0 5px 15px rgba(78, 115, 223, 0.15);
        }
        
        .user-type-option.selected.therapist {
          border-color: #4e73df;
          background: linear-gradient(135deg, rgba(78, 115, 223, 0.1) 0%, rgba(34, 74, 190, 0.1) 100%);
        }
        
        .user-type-option.selected.instructor {
          border-color: #1cc88a;
          background: linear-gradient(135deg, rgba(28, 200, 138, 0.1) 0%, rgba(19, 133, 92, 0.1) 100%);
        }
        
        .user-type-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem auto;
          font-size: 1.5rem;
        }
        
        .therapist-icon {
          background: rgba(78, 115, 223, 0.1);
          color: #4e73df;
        }
        
        .instructor-icon {
          background: rgba(28, 200, 138, 0.1);
          color: #1cc88a;
        }
        
        .error-alert {
          background: rgba(220, 53, 69, 0.1);
          border: 1px solid rgba(220, 53, 69, 0.2);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          animation: slideDown 0.3s ease;
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .password-wrapper {
          position: relative;
        }
        
        .toggle-password {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6c757d;
          cursor: pointer;
          transition: color 0.3s ease;
          padding: 0.5rem;
        }
        
        .toggle-password:hover {
          color: #4e73df;
        }
        
        .login-link {
          color: #4e73df;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
        }
        
        .login-link:hover {
          color: #224abe;
          transform: translateX(5px);
        }
        
        .form-check-input:checked {
          background-color: #4e73df;
          border-color: #4e73df;
        }
        
        .floating-element {
          position: absolute;
          width: 60px;
          height: 60px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(5px);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: floatElement 6s ease-in-out infinite;
          z-index: 0;
        }
        
        .floating-element i {
          font-size: 1.5rem;
          color: white;
        }
        
        .floating-1 {
          top: 20%;
          left: 10%;
          animation-delay: 0s;
        }
        
        .floating-2 {
          bottom: 20%;
          right: 10%;
          animation-delay: 2s;
        }
        
        .floating-3 {
          top: 50%;
          right: 20%;
          animation-delay: 4s;
        }
        
        @keyframes floatElement {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(20px, -20px); }
          66% { transform: translate(-15px, 10px); }
        }
        
        .password-strength {
          margin-top: 0.5rem;
        }
        
        .password-strength-meter {
          height: 4px;
          background: #e9ecef;
          border-radius: 2px;
          overflow: hidden;
          margin-top: 0.25rem;
        }
        
        .password-strength-bar {
          height: 100%;
          transition: width 0.3s ease;
        }
        
        .password-requirements {
          font-size: 0.8rem;
          color: #6c757d;
          margin-top: 0.5rem;
        }
        
        /* Responsive */
        @media (max-width: 576px) {
          .register-page {
            padding: 1rem;
          }
          
          .register-card {
            max-width: 100%;
          }
          
          .register-body {
            padding: 2rem 1.5rem;
          }
          
          .user-type-selector {
            flex-direction: column;
          }
        }
      `}</style>

      {/* Floating Elements */}
      <div className="floating-element floating-1">
        <i className="bi bi-person-plus"></i>
      </div>
      <div className="floating-element floating-2">
        <i className="bi bi-shield-check"></i>
      </div>
      <div className="floating-element floating-3">
        <i className="bi bi-stars"></i>
      </div>

      <div className="register-card" style={{marginTop: '150px'}}>
        <div className="register-header">
          <div className="logo-wrapper1">
            <i className="bi bi-heart-pulse-fill logo-icon1"></i>
          </div>
          <h1 className="text-white mb-2">Join TherapyConnect</h1>
          <p className="text-white-80 mb-0">Create your professional account</p>
        </div>
        
        <div className="register-body">
          {error && (
            <div className="error-alert">
              <div className="d-flex align-items-center">
                <i className="bi bi-exclamation-triangle-fill text-danger me-2"></i>
                <span className="text-danger fw-medium">{error}</span>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label fw-medium mb-3">Select Your Role</label>
              <div className="user-type-selector">
                <div 
                  className={`user-type-option ${userData.userType === 'therapist' ? 'selected therapist' : ''}`}
                  onClick={() => setUserData(prev => ({...prev, userType: 'therapist'}))}
                >
                  <div className="user-type-icon therapist-icon">
                    <i className="bi bi-person-check"></i>
                  </div>
                  <h6 className="fw-bold mb-1">Therapist</h6>
                  <p className="text-muted small mb-0">Manage patients & sessions</p>
                </div>
                <div 
                  className={`user-type-option ${userData.userType === 'instructor' ? 'selected instructor' : ''}`}
                  onClick={() => setUserData(prev => ({...prev, userType: 'instructor'}))}
                >
                  <div className="user-type-icon instructor-icon">
                    <i className="bi bi-people"></i>
                  </div>
                  <h6 className="fw-bold mb-1">Instructor</h6>
                  <p className="text-muted small mb-0">Conduct therapy sessions</p>
                </div>
              </div>
            </div>
            
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                <i className="bi bi-person me-2"></i>
                Full Name
              </label>
              <input
                type="text"
                className="form-control form-control-custom"
                id="name"
                name="name"
                placeholder="Enter your full name"
                value={userData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                <i className="bi bi-envelope me-2"></i>
                Email Address
              </label>
              <input
                type="email"
                className="form-control form-control-custom"
                id="email"
                name="email"
                placeholder="Enter your email address"
                value={userData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="mb-3 password-wrapper">
              <label htmlFor="password" className="form-label">
                <i className="bi bi-lock me-2"></i>
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control form-control-custom"
                id="password"
                name="password"
                placeholder="Create a strong password"
                value={userData.password}
                onChange={handleChange}
                required
              />
              <button 
                type="button" 
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
              
              {userData.password && (
                <div className="password-strength">
                  <div className="password-strength-meter">
                    <div 
                      className="password-strength-bar"
                      style={{
                        width: `${Math.min(100, userData.password.length * 20)}%`,
                        background: userData.password.length >= 6 ? '#1cc88a' : '#e74a3b'
                      }}
                    ></div>
                  </div>
                  <div className="password-requirements">
                    {userData.password.length < 6 ? (
                      <span className="text-danger">Password should be at least 6 characters</span>
                    ) : (
                      <span className="text-success">Password strength: Good</span>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mb-4 password-wrapper">
              <label htmlFor="confirmPassword" className="form-label">
                <i className="bi bi-shield-lock me-2"></i>
                Confirm Password
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="form-control form-control-custom"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={userData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button 
                type="button" 
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
              
              {userData.confirmPassword && userData.password !== userData.confirmPassword && (
                <div className="password-requirements">
                  <span className="text-danger">Passwords do not match</span>
                </div>
              )}
            </div>
            
            <button 
              type="submit" 
              className="btn btn-success w-100 register-btn mb-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Creating Account...
                </>
              ) : (
                <>
                  <i className="bi bi-person-plus me-2"></i>
                  Create Account
                </>
              )}
            </button>
            
            <div className="text-center">
              <p className="text-muted mb-2">
                Already have an account?
              </p>
              <Link to="/login" className="login-link" id="goToLogin">
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Sign in to your account
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Add Bootstrap Icons */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css"></link>
    </div>
  );
};

export default Register;
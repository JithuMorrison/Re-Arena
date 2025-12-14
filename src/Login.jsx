// src/pages/Login.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const userType = location.state?.userType || '';

  useEffect(() => {
    if (currentUser) {
      navigate(currentUser.userType === 'therapist' ? '/therapist' : '/instructor');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate(result.data.userType === 'therapist' ? '/therapist' : '/instructor');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to log in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <style jsx>{`
        .login-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }
        
        .login-page::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
        }
        
        .login-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          width: 100%;
          max-width: 450px;
          overflow: hidden;
        }
        
        .login-header {
          background: linear-gradient(135deg, #4e73df 0%, #224abe 100%);
          padding: 2.5rem 2rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .login-header::before {
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
        
        .login-body {
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
        
        .login-btn {
          background: linear-gradient(135deg, #4e73df 0%, #224abe 100%);
          border: none;
          border-radius: 12px;
          padding: 1rem;
          font-weight: 600;
          font-size: 1.1rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(78, 115, 223, 0.3);
        }
        
        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none !important;
        }
        
        .login-btn::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          right: -50%;
          bottom: -50%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent);
          transform: rotate(30deg);
          animation: shimmer 3s infinite;
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(30deg); }
          100% { transform: translateX(100%) rotate(30deg); }
        }
        
        .remember-checkbox {
          display: flex;
          align-items: center;
          cursor: pointer;
        }
        
        .remember-checkbox input {
          width: 18px;
          height: 18px;
          margin-right: 10px;
          cursor: pointer;
        }
        
        .remember-checkbox label {
          cursor: pointer;
          user-select: none;
        }
        
        .register-link {
          color: #4e73df;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
        }
        
        .register-link:hover {
          color: #224abe;
          transform: translateX(5px);
        }
        
        .user-type-badge {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 0.75rem 1.5rem;
          display: inline-flex;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .user-type-badge i {
          margin-right: 8px;
          font-size: 1.2rem;
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
          top: 70%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6c757d;
          cursor: pointer;
          transition: color 0.3s ease;
        }
        
        .toggle-password:hover {
          color: #4e73df;
        }
        
        .forgot-password {
          color: #6c757d;
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.3s ease;
          display: inline-block;
          margin-top: 0.5rem;
        }
        
        .forgot-password:hover {
          color: #4e73df;
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
        
        /* Responsive */
        @media (max-width: 576px) {
          .login-page {
            padding: 1rem;
          }
          
          .login-card {
            max-width: 100%;
          }
          
          .login-body {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>

      {/* Floating Elements */}
      <div className="floating-element floating-1">
        <i className="bi bi-heart-pulse"></i>
      </div>
      <div className="floating-element floating-2">
        <i className="bi bi-people-fill"></i>
      </div>
      <div className="floating-element floating-3">
        <i className="bi bi-shield-check"></i>
      </div>

      <div className="login-card" style={{marginTop: '100px'}}>
        <div className="login-header">
          <div className="logo-wrapper1">
            <i className="bi bi-heart-pulse-fill logo-icon1"></i>
          </div>
          <h1 className="text-white mb-2">Welcome Back</h1>
          <p className="text-white-80 mb-0">Sign in to continue to TherapyConnect</p>
        </div>
        
        <div className="login-body">
          {userType && (
            <div className="user-type-badge text-white">
              <i className={`bi ${userType === 'therapist' ? 'bi-person-check' : 'bi-people'}`}></i>
              {userType === 'therapist' 
                ? 'Therapist Portal Login' 
                : 'Instructor Portal Login'
              }
            </div>
          )}
          
          {error && (
            <div className="error-alert">
              <div className="d-flex align-items-center">
                <i className="bi bi-exclamation-triangle-fill text-danger me-2"></i>
                <span className="text-danger fw-medium">{error}</span>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                <i className="bi bi-envelope me-2"></i>
                Email Address
              </label>
              <input
                type="email"
                className="form-control form-control-custom"
                id="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-3 password-wrapper">
              <label htmlFor="password" className="form-label">
                <i className="bi bi-lock me-2"></i>
                Password
              </label>
              <input
                type="password"
                className="form-control form-control-custom"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="toggle-password"
                onClick={(e) => {
                  const input = e.target.previousElementSibling;
                  input.type = input.type === 'password' ? 'text' : 'password';
                  e.target.querySelector('i').className = input.type === 'password' ? 'bi bi-eye' : 'bi bi-eye-slash';
                }}
              >
                <i className="bi bi-eye"></i>
              </button>
            </div>
            
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="remember-checkbox">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="rememberMe" className="text-muted">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="forgot-password">
                Forgot password?
              </Link>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary w-100 login-btn mb-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Signing in...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Sign In
                </>
              )}
            </button>
            
            <div className="text-center">
              <p className="text-muted mb-2">
                Don't have an account?
              </p>
              <Link to="/register" className="register-link" id="goToRegister">
                <i className="bi bi-person-plus me-2"></i>
                Create new account
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

export default Login;
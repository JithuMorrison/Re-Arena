// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const getUserRoleBadge = () => {
    if (!currentUser) return null;
    
    const roleColors = {
      therapist: {
        bg: 'primary',
        text: 'white',
        label: 'Therapist',
        icon: 'bi-person-check'
      },
      instructor: {
        bg: 'success',
        text: 'white',
        label: 'Instructor',
        icon: 'bi-people'
      },
      admin: {
        bg: 'danger',
        text: 'white',
        label: 'Admin',
        icon: 'bi-shield'
      }
    };
    
    const role = currentUser.userType || 'user';
    const roleConfig = roleColors[role] || { 
      bg: 'secondary', 
      text: 'white', 
      label: 'User',
      icon: 'bi-person'
    };
    
    return (
      <span className={`badge bg-${roleConfig.bg} bg-gradient rounded-pill ms-2 d-inline-flex align-items-center`}>
        <i className={`${roleConfig.icon} me-1 small`}></i>
        {roleConfig.label}
      </span>
    );
  };

  const getDashboardPath = () => {
    if (!currentUser) return '/';
    switch (currentUser.userType) {
      case 'therapist':
        return '/therapist';
      case 'instructor':
        return '/instructor';
      case 'admin':
        return '/admin';
      default:
        return '/dashboard';
    }
  };

  const getDashboardIcon = () => {
    if (!currentUser) return 'bi-speedometer2';
    switch (currentUser.userType) {
      case 'therapist':
        return 'bi-clipboard-pulse';
      case 'instructor':
        return 'bi-person-video';
      case 'admin':
        return 'bi-shield-check';
      default:
        return 'bi-speedometer2';
    }
  };

  const handleNavLinkClick = () => {
    setMobileMenuOpen(false);
  };

  // Desktop Navigation
  const DesktopNavLinks = () => (
    <>
      <li className="nav-item">
        <Link 
          className={`nav-link ${isActive('/')}`} 
          to="/"
          onClick={handleNavLinkClick}
        >
          <div className="d-flex align-items-center">
            <i className="bi bi-house-door-fill me-2"></i>
            <span>Home</span>
          </div>
        </Link>
      </li>

      {currentUser ? (
        <>
          <li className="nav-item">
            <Link 
              className={`nav-link ${isActive(getDashboardPath())}`}
              to={getDashboardPath()}
              onClick={handleNavLinkClick}
            >
              <div className="d-flex align-items-center">
                <i className={`bi ${getDashboardIcon()} me-2`}></i>
                <span>Dashboard</span>
              </div>
            </Link>
          </li>
          
          <li className="nav-item user-info-desktop ms-2">
            <div className="d-flex align-items-center">
              <div className="avatar-sm bg-primary bg-gradient rounded-circle d-flex align-items-center justify-content-center me-2">
                {currentUser.avatar ? (
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.name}
                    className="rounded-circle w-100 h-100"
                  />
                ) : (
                  <i className="bi bi-person-fill text-white"></i>
                )}
              </div>
              <div className="d-flex flex-column text-start">
                <span className="color-change fw-medium text-truncate" style={{ maxWidth: '120px', color: 'white' }}>
                  {currentUser.name}
                </span>
                <small className="text-muted text-truncate" style={{ maxWidth: '120px' }}>
                  {currentUser.email}
                </small>
              </div>
            </div>
          </li>
          
          <li className="nav-item ms-2">
            <button 
              className="btn btn-outline-light btn-logout d-flex align-items-center"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right me-2"></i>
              <span className="d-none d-md-inline">Logout</span>
            </button>
          </li>
        </>
      ) : (
        <>
          <li className="nav-item ms-2">
            <Link 
              className={`nav-link btn-login ${isActive('/login')}`}
              to="/login"
              onClick={handleNavLinkClick}
            >
              <div className="d-flex align-items-center">
                <i className="bi bi-box-arrow-in-right me-2"></i>
                <span>Login</span>
              </div>
            </Link>
          </li>
          
          <li className="nav-item ms-2">
            <Link 
              className={`nav-link btn-register ${isActive('/register')}`}
              to="/register"
              onClick={handleNavLinkClick}
            >
              <div className="d-flex align-items-center">
                <i className="bi bi-person-plus me-2"></i>
                <span>Register</span>
              </div>
            </Link>
          </li>
        </>
      )}
    </>
  );

  // Mobile Navigation
  const MobileNavLinks = () => (
    <>
      <li className="nav-item">
        <Link 
          className={`nav-link ${isActive('/')} d-flex align-items-center py-3`} 
          to="/"
          onClick={handleNavLinkClick}
        >
          <i className="bi bi-house-door-fill me-3 fs-5"></i>
          <span>Home</span>
        </Link>
      </li>

      {currentUser ? (
        <>
          <li className="nav-item">
            <Link 
              className={`nav-link ${isActive(getDashboardPath())} d-flex align-items-center py-3`}
              to={getDashboardPath()}
              onClick={handleNavLinkClick}
            >
              <i className={`bi ${getDashboardIcon()} me-3 fs-5`}></i>
              <span>Dashboard</span>
            </Link>
          </li>

          <li className="nav-item mt-4 pt-3 border-top border-light">
            <div className="d-grid gap-2">
              <button 
                className="btn btn-danger btn-lg d-flex align-items-center justify-content-center py-3"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right me-3"></i>
                <span>Logout</span>
              </button>
            </div>
          </li>
        </>
      ) : (
        <>
          <li className="nav-item">
            <Link 
              className="btn btn-primary btn-lg w-100 mb-3 d-flex align-items-center justify-content-center py-3"
              to="/login"
              onClick={handleNavLinkClick}
            >
              <i className="bi bi-box-arrow-in-right me-3"></i>
              <span>Login</span>
            </Link>
          </li>
          
          <li className="nav-item">
            <Link 
              className="btn btn-outline-light btn-lg w-100 d-flex align-items-center justify-content-center py-3"
              to="/register"
              onClick={handleNavLinkClick}
            >
              <i className="bi bi-person-plus me-3"></i>
              <span>Register</span>
            </Link>
          </li>
        </>
      )}
    </>
  );

  return (
    <>
      <nav className={`navbar navbar-expand-lg fixed-top ${isScrolled ? 'navbar-scrolled' : 'navbar-transparent'}`}>
        <div className="container">
          <Link 
            className="navbar-brand d-flex align-items-center" 
            to="/"
            onClick={handleNavLinkClick}
          >
            <div className="logo-wrapper me-2">
              <i className="bi bi-heart-pulse-fill logo-icon"></i>
            </div>
            <div className="d-flex flex-column">
              <span className="brand-text">TherapyConnect</span>
              <small className="brand-subtitle">Rehabilitation Platform</small>
            </div>
            {currentUser && getUserRoleBadge()}
          </Link>

          {/* Desktop Menu */}
          <div className="d-none d-lg-flex">
            <ul className="navbar-nav align-items-center">
              <DesktopNavLinks />
            </ul>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="navbar-toggler d-lg-none hamburger-menu" 
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu d-lg-none ${mobileMenuOpen ? 'show' : ''}`}>
          <div className="mobile-menu-header">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <Link 
                className="navbar-brand d-flex align-items-center text-white" 
                to="/"
                onClick={handleNavLinkClick}
              >
                <div className="logo-wrapper me-2">
                  <i className="bi bi-heart-pulse-fill logo-icon"></i>
                </div>
                <div className="d-flex flex-column">
                  <span className="brand-text">TherapyConnect</span>
                  <small className="brand-subtitle">Rehabilitation Platform</small>
                </div>
              </Link>
              <button 
                className="btn-close-menu"
                onClick={handleNavLinkClick}
                aria-label="Close menu"
              >
                <i className="bi bi-x-lg fs-4 text-white"></i>
              </button>
            </div>
            
            {currentUser && (
              <div className="user-info-card mb-4 p-3">
                <div className="d-flex align-items-center">
                  <div className="avatar-lg bg-primary bg-gradient rounded-circle d-flex align-items-center justify-content-center me-3">
                    {currentUser.avatar ? (
                      <img 
                        src={currentUser.avatar} 
                        alt={currentUser.name}
                        className="rounded-circle w-100 h-100"
                      />
                    ) : (
                      <i className="bi bi-person-fill text-white fs-4"></i>
                    )}
                  </div>
                  <div className="d-flex flex-column">
                    <span className="fw-bold text-white mb-1">{currentUser.name}</span>
                    <small className="text-white-80 mb-2">{currentUser.email}</small>
                    {getUserRoleBadge()}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <ul className="nav flex-column mobile-nav-links">
            <MobileNavLinks />
          </ul>
          
          <div className="mobile-menu-footer mt-4 pt-3 border-top border-light">
            <div className="d-flex justify-content-center">
              <small className="text-white-50">
                © {new Date().getFullYear()} TherapyConnect. All rights reserved.
              </small>
            </div>
          </div>
        </div>
      </nav>

      <style jsx>{`
        .navbar {
          padding: 0.8rem 0;
          transition: all 0.3s ease;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 1030;
        }
        
        .navbar-transparent {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%);
          backdrop-filter: blur(10px);
        }
        
        .navbar-scrolled {
          background: rgba(255, 255, 255, 0.98) !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        .navbar-scrolled .navbar-brand,
        .navbar-scrolled .nav-link,
        .navbar-scrolled .brand-subtitle,
        .navbar-scrolled .brand-text,
        .navbar-scrolled .color-change,
        .navbar-scrolled .hamburger-menu .hamburger-line {
          color: #2d3748 !important;
        }
        
        .navbar-scrolled .logo-icon {
          color: #4e73df !important;
        }
        
        .navbar-scrolled .user-info-desktop .text-muted {
          color: #6c757d !important;
        }
        
        .navbar-scrolled .btn-login {
          border: 2px solid #4e73df;
          color: #4e73df !important;
          background: transparent;
        }
        
        .navbar-scrolled .btn-login:hover {
          background: #4e73df;
          color: white !important;
        }
        
        .navbar-scrolled .btn-register {
          background: linear-gradient(135deg, #d7dff7ff 0%, #c1cff9ff 100%);
          color: white !important;
          border: none;
        }
        
        .navbar-scrolled .btn-register:hover {
          background: linear-gradient(135deg, #224abe 0%, #4e73df 100%);
        }
        
        .navbar-brand {
          padding: 0.5rem 0;
          text-decoration: none;
        }
        
        .logo-wrapper {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        
        .navbar-scrolled .logo-wrapper {
          background: rgba(78, 115, 223, 0.1);
        }
        
        .logo-icon {
          font-size: 1.5rem;
          color: white;
          transition: color 0.3s ease;
        }
        
        .brand-text {
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
          line-height: 1.2;
          transition: color 0.3s ease;
        }
        
        .brand-subtitle {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 500;
          letter-spacing: 0.5px;
          transition: color 0.3s ease;
        }
        
        .nav-link {
          color: rgba(255, 255, 255, 0.9) !important;
          font-weight: 500;
          padding: 0.5rem 1rem !important;
          margin: 0 0.2rem;
          border-radius: 8px;
          transition: all 0.2s ease;
          position: relative;
          cursor: pointer;
          text-decoration: none;
        }
        
        .nav-link:hover {
          color: white !important;
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-1px);
        }
        
        .nav-link.active {
          color: white !important;
          background: rgba(255, 255, 255, 0.15);
        }
        
        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          height: 3px;
          background: white;
          border-radius: 100px;
        }
        
        .navbar-scrolled .nav-link.active::after {
          background: #4e73df;
        }
        
        .navbar-scrolled .nav-link {
          color: #495057 !important;
        }
        
        .navbar-scrolled .nav-link:hover {
          color: #4e73df !important;
          background: rgba(78, 115, 223, 0.1);
        }
        
        .navbar-scrolled .nav-link.active {
          color: #4e73df !important;
          background: rgba(78, 115, 223, 0.15);
        }
        
        .btn-login {
          border: 2px solid rgba(255, 255, 255, 0.3);
          padding: 0.5rem 1.5rem !important;
          color: white !important;
        }
        
        .btn-login:hover {
          border-color: white;
          background: rgba(255, 255, 255, 0.1);
        }
        
        .btn-register {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.5rem 1.5rem !important;
          color: white !important;
        }
        
        .btn-register:hover {
          background: white;
          color: #4e73df !important;
        }
        
        .user-info-desktop {
          padding: 0.25rem 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          margin-left: 1rem;
        }
        
        .navbar-scrolled .user-info-desktop {
          background: rgba(78, 115, 223, 0.1);
        }
        
        .avatar-sm {
          width: 36px;
          height: 36px;
        }
        
        .avatar-lg {
          width: 60px;
          height: 60px;
        }
        
        .btn-logout {
          padding: 0.5rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.2s ease;
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          background: transparent;
        }
        
        .btn-logout:hover {
          background: rgba(220, 53, 69, 0.1);
          border-color: #ed8a94ff;
          color: #ed8a94ff;
        }
        
        .navbar-scrolled .btn-logout {
          border: 2px solid #dc3545;
          color: #dc3545;
        }
        
        .navbar-scrolled .btn-logout:hover {
          background: #dc3545;
          color: white;
        }
        
        /* Mobile Menu */
        .mobile-menu {
          position: fixed;
          top: 0;
          right: -100%;
          width: 320px;
          height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 1.5rem;
          transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1050;
          overflow-y: auto;
          box-shadow: -5px 0 30px rgba(0, 0, 0, 0.1);
        }
        
        .mobile-menu.show {
          right: 0;
        }
        
        .mobile-menu::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
        }
        
        .mobile-menu-header {
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .user-info-card {
          background: rgba(255, 255, 255, 0.1);
          padding: 1rem;
          border-radius: 12px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .mobile-nav-links {
          padding-top: 1rem;
        }
        
        .mobile-nav-links .nav-link {
          color: rgba(255, 255, 255, 0.9) !important;
          padding: 1rem 0 !important;
          border-radius: 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .mobile-nav-links .nav-link:hover {
          background: transparent;
          color: white !important;
          padding-left: 0.5rem;
        }
        
        .mobile-nav-links .nav-link.active {
          background: transparent;
          color: white !important;
          border-left: 3px solid white;
          padding-left: 0.5rem;
        }
        
        .text-white-80 {
          color: rgba(255, 255, 255, 0.8);
        }
        
        .text-white-50 {
          color: rgba(255, 255, 255, 0.5);
        }
        
        /* Custom Hamburger Menu */
        .hamburger-menu {
          border: none;
          padding: 0.5rem;
          background: transparent;
          width: 40px;
          height: 40px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
        }
        
        .hamburger-menu:focus {
          box-shadow: none;
          outline: none;
        }
        
        .hamburger-line {
          width: 24px;
          height: 2px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 2px;
          transition: all 0.3s ease;
        }
        
        .navbar-scrolled .hamburger-line {
          background: #2d3748;
        }
        
        .hamburger-menu:hover .hamburger-line {
          background: white;
        }
        
        .navbar-scrolled .hamburger-menu:hover .hamburger-line {
          background: #4e73df;
        }
        
        .btn-close-menu {
          background: transparent;
          border: none;
          color: white;
          padding: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .btn-close-menu:hover {
          transform: rotate(90deg);
        }
        
        /* Overlay for mobile menu */
        .mobile-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(3px);
          z-index: 1049;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        }
        
        .mobile-menu-overlay.show {
          opacity: 1;
          visibility: visible;
        }
        
        /* Animation for mobile menu */
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        
        .mobile-menu.show {
          animation: slideIn 0.3s ease;
        }
        
        /* Enhanced badge styling */
        .badge.bg-gradient {
          background: linear-gradient(135deg, var(--bs-primary) 0%, var(--bs-primary-dark) 100%);
          padding: 0.35em 0.65em;
          font-size: 0.75em;
        }
        
        .badge.bg-primary.bg-gradient {
          --bs-primary: #4e73df;
          --bs-primary-dark: #224abe;
        }
        
        .badge.bg-success.bg-gradient {
          --bs-primary: #1cc88a;
          --bs-primary-dark: #13855c;
        }
        
        .badge.bg-danger.bg-gradient {
          --bs-primary: #e74a3b;
          --bs-primary-dark: #be2617;
        }
        
        /* Responsive adjustments */
        @media (max-width: 992px) {
          .container {
            padding-right: 1rem;
            padding-left: 1rem;
          }
          
          .navbar-brand {
            max-width: calc(100% - 50px);
          }
        }
      `}</style>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="mobile-menu-overlay show" 
          onClick={handleNavLinkClick}
        />
      )}
      
      {/* Add Bootstrap Icons */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css"></link>
    </>
  );
};

export default Navbar;
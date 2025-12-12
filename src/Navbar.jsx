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
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
    setDropdownOpen(false);
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

  const handleDropdownToggle = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleNavLinkClick = () => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  // Desktop Navigation
  const DesktopNavLinks = () => (
    <>
      <li className="nav-item">
        <Link 
          className={`nav-link ${isActive('/')}`} 
          to="/"
          onClick={() => setDropdownOpen(false)}
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
              className={`nav-link ${isActive(currentUser.userType === 'therapist' ? '/therapist' : '/instructor')}`}
              to={currentUser.userType === 'therapist' ? '/therapist' : '/instructor'}
              onClick={() => setDropdownOpen(false)}
            >
              <div className="d-flex align-items-center">
                <i className="bi bi-speedometer2 me-2"></i>
                <span>Dashboard</span>
              </div>
            </Link>
          </li>
          
          <li className="nav-item dropdown" onMouseEnter={() => setDropdownOpen(true)} onMouseLeave={() => setDropdownOpen(false)}>
            <button 
              className="nav-link dropdown-toggle d-flex align-items-center bg-transparent border-0"
              onClick={handleDropdownToggle}
              id="userDropdown"
            >
              <div className="avatar-sm bg-primary bg-gradient rounded-circle d-flex align-items-center justify-content-center me-2">
                <i className="bi bi-person-fill text-white"></i>
              </div>
              <div className="d-flex flex-column text-start">
                <span className="fw-medium">{currentUser.name}</span>
                <small className="text-muted">{currentUser.email}</small>
              </div>
              <i className={`bi bi-chevron-down ms-2 small transition-all ${dropdownOpen ? 'rotate-180' : ''}`}></i>
            </button>
            
            <div className={`dropdown-menu dropdown-menu-end shadow border-0 mt-2 ${dropdownOpen ? 'show' : ''}`}>
              <div className="dropdown-header">
                <div className="d-flex align-items-center">
                  <div className="avatar-md bg-primary bg-gradient rounded-circle d-flex align-items-center justify-content-center me-3">
                    <i className="bi bi-person-fill text-white fs-4"></i>
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold">{currentUser.name}</h6>
                    <small className="text-muted">{currentUser.email}</small>
                  </div>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <Link className="dropdown-item" to="#" onClick={handleNavLinkClick}>
                <i className="bi bi-person-circle me-2"></i>
                Profile
              </Link>
              <Link className="dropdown-item" to="#" onClick={handleNavLinkClick}>
                <i className="bi bi-gear me-2"></i>
                Settings
              </Link>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item text-danger d-flex align-items-center" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2"></i>
                Logout
              </button>
            </div>
          </li>
        </>
      ) : (
        <>
          <li className="nav-item">
            <Link 
              className={`nav-link ${isActive('/login')} btn-login`}
              to="/login"
            >
              <i className="bi bi-box-arrow-in-right me-2"></i>
              Login
            </Link>
          </li>
          <li className="nav-item ms-2">
            <Link 
              className={`nav-link btn-register ${isActive('/register')}`}
              to="/register"
            >
              <i className="bi bi-person-plus me-2"></i>
              Register
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
          className={`nav-link ${isActive('/')} d-flex align-items-center`} 
          to="/"
          onClick={handleNavLinkClick}
        >
          <i className="bi bi-house-door-fill me-3 fs-5"></i>
          <span>Home</span>
        </Link>
      </li>

      {currentUser && (
        <li className="nav-item">
          <Link 
            className={`nav-link ${isActive(currentUser.userType === 'therapist' ? '/therapist' : '/instructor')} d-flex align-items-center`}
            to={currentUser.userType === 'therapist' ? '/therapist' : '/instructor'}
            onClick={handleNavLinkClick}
          >
            <i className="bi bi-speedometer2 me-3 fs-5"></i>
            <span>Dashboard</span>
          </Link>
        </li>
      )}

      {currentUser ? (
        <>
          <li className="nav-item">
            <Link 
              className="nav-link d-flex align-items-center"
              to="/profile"
              onClick={handleNavLinkClick}
            >
              <i className="bi bi-person-circle me-3 fs-5"></i>
              <span>Profile</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              className="nav-link d-flex align-items-center"
              to="/settings"
              onClick={handleNavLinkClick}
            >
              <i className="bi bi-gear me-3 fs-5"></i>
              <span>Settings</span>
            </Link>
          </li>
          <li className="nav-item mt-4">
            <div className="d-grid gap-2">
              <button 
                className="btn btn-danger btn-lg d-flex align-items-center justify-content-center"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right me-2"></i>
                Logout
              </button>
              <button 
                className="btn btn-outline-light btn-lg"
                onClick={handleNavLinkClick}
              >
                Close Menu
              </button>
            </div>
          </li>
        </>
      ) : (
        <>
          <li className="nav-item">
            <Link 
              className="btn btn-primary btn-lg w-100 mb-3 d-flex align-items-center justify-content-center"
              to="/login"
              onClick={handleNavLinkClick}
            >
              <i className="bi bi-box-arrow-in-right me-2"></i>
              Login
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              className="btn btn-outline-light btn-lg w-100 d-flex align-items-center justify-content-center"
              to="/register"
              onClick={handleNavLinkClick}
            >
              <i className="bi bi-person-plus me-2"></i>
              Register
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
            onClick={() => {
              setMobileMenuOpen(false);
              setDropdownOpen(false);
            }}
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
            className="navbar-toggler d-lg-none" 
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
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
                className="btn-close btn-close-white"
                onClick={handleNavLinkClick}
                aria-label="Close menu"
              ></button>
            </div>
            
            {currentUser && (
              <div className="user-info-card mb-4">
                <div className="d-flex align-items-center">
                  <div className="avatar-lg bg-primary bg-gradient rounded-circle d-flex align-items-center justify-content-center me-3">
                    <i className="bi bi-person-fill text-white fs-4"></i>
                  </div>
                  <div className="d-flex flex-column">
                    <span className="fw-bold text-white">{currentUser.name}</span>
                    <small className="text-white-80">{currentUser.email}</small>
                    {getUserRoleBadge()}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <ul className="nav flex-column mobile-nav-links">
            <MobileNavLinks />
          </ul>
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
        .navbar-scrolled .navbar-toggler-icon {
          color: #2d3748 !important;
        }
        
        .navbar-scrolled .logo-icon {
          color: #4e73df !important;
        }
        
        .navbar-scrolled .nav-link.dropdown-toggle {
          color: #2d3748 !important;
        }
        
        .navbar-scrolled .dropdown-toggle .text-muted {
          color: #6c757d !important;
        }
        
        .navbar-scrolled .btn-login {
          border: 2px solid #4e73df;
          color: #4e73df !important;
        }
        
        .navbar-scrolled .btn-register {
          background: linear-gradient(135deg, #4e73df 0%, #224abe 100%);
          color: white !important;
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
          width: 4px;
          height: 4px;
          background: white;
          border-radius: 50%;
        }
        
        .navbar-scrolled .nav-link.active::after {
          background: #4e73df;
        }
        
        .btn-login {
          border: 2px solid rgba(255, 255, 255, 0.3);
          padding: 0.5rem 1.5rem !important;
        }
        
        .btn-login:hover {
          border-color: white;
          background: transparent;
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
        
        .avatar-sm {
          width: 36px;
          height: 36px;
        }
        
        .avatar-md {
          width: 48px;
          height: 48px;
        }
        
        .avatar-lg {
          width: 60px;
          height: 60px;
        }
        
        .dropdown-menu {
          border: none;
          border-radius: 12px;
          min-width: 240px;
          padding: 0;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          animation: fadeIn 0.2s ease;
        }
        
        .dropdown-header {
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 12px 12px 0 0;
        }
        
        .dropdown-item {
          padding: 0.75rem 1.25rem;
          font-weight: 500;
          transition: all 0.2s ease;
          color: #495057;
          text-decoration: none;
          display: block;
          cursor: pointer;
        }
        
        .dropdown-item:hover {
          background: #f8f9fa;
          padding-left: 1.5rem;
          color: #0d6efd;
        }
        
        .dropdown-item.text-danger:hover {
          color: #dc3545 !important;
        }
        
        .dropdown-divider {
          margin: 0;
        }
        
        .transition-all {
          transition: all 0.3s ease;
        }
        
        .rotate-180 {
          transform: rotate(180deg);
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
          transition: right 0.3s ease;
          z-index: 1050;
          overflow-y: auto;
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
          padding-top: 1.5rem;
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
        
        .text-white-80 {
          color: rgba(255, 255, 255, 0.8);
        }
        
        .navbar-toggler {
          border: none;
          padding: 0.5rem;
          background: transparent;
        }
        
        .navbar-toggler:focus {
          box-shadow: none;
          outline: none;
        }
        
        .navbar-toggler-icon {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%28255, 255, 255, 0.9%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
          transition: background-image 0.3s ease;
        }
        
        .navbar-scrolled .navbar-toggler-icon {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%280, 0, 0, 0.9%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
        }
        
        /* Overlay for mobile menu */
        .mobile-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1049;
          display: none;
        }
        
        .mobile-menu-overlay.show {
          display: block;
        }
        
        /* Animation for dropdown */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Ensure dropdown is visible */
        .dropdown-menu.show {
          display: block !important;
          animation: fadeIn 0.2s ease;
        }
        
        /* Logout button in desktop */
        .nav-item .btn-logout {
          background: transparent;
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 0.5rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.2s ease;
          margin-left: 0.5rem;
        }
        
        .nav-item .btn-logout:hover {
          background: rgba(255, 0, 0, 0.1);
          border-color: #dc3545;
          color: #dc3545;
        }
        
        .navbar-scrolled .nav-item .btn-logout {
          border: 2px solid #dc3545;
          color: #dc3545;
        }
        
        .navbar-scrolled .nav-item .btn-logout:hover {
          background: #dc3545;
          color: white;
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
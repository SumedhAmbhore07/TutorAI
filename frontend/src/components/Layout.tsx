import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import AuthModal from './AuthModal';
import { useState } from 'react';

const Layout = () => {
  const { currentUser, userData, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-logo">

            <i className="fas fa-graduation-cap"></i>
            <span>TutorAI</span>
          </Link>

          <button 
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>

          <div className={`navbar-nav ${isMobileMenuOpen ? 'active' : ''}`}>

            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              <i className="fas fa-home"></i>
              <span>Home</span>
            </Link>
            <Link to="/courses" className={`nav-link ${isActive('/courses') ? 'active' : ''}`}>
              <i className="fas fa-book"></i>
              <span>Courses</span>
            </Link>
            <Link to="/tutor" className={`nav-link ${isActive('/tutor') ? 'active' : ''}`}>
              <i className="fas fa-robot"></i>
              <span>AI Tutor</span>
            </Link>
            
            {currentUser && (
              <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>
                <i className="fas fa-user"></i>
                <span>Profile</span>
              </Link>
            )}
          </div>

          <div className="navbar-actions">
            <button className="theme-toggle" onClick={toggleTheme}>

              <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>

            {currentUser ? (
              <div className="user-info">
                <img 
                  src={userData?.photoURL || 'https://via.placeholder.com/40'} 
                  alt="Profile" 
                  className="user-avatar"
                />
                <span className="user-name">{userData?.displayName || userData?.email}</span>
                <button className="btn btn-secondary" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i>
                </button>
              </div>
            ) : (
              <button className="btn btn-primary" onClick={() => setIsAuthModalOpen(true)}>
                <i className="fas fa-sign-in-alt"></i>
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <h3><i className="fas fa-graduation-cap"></i> TutorAI</h3>
              <p>AI-Driven Smart Learning Platform</p>
              <div className="social-links">
                <a href="#"><i className="fab fa-twitter"></i></a>
                <a href="#"><i className="fab fa-github"></i></a>
                <a href="#"><i className="fab fa-linkedin"></i></a>
              </div>
            </div>
            <div className="footer-links">
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/courses">Courses</Link></li>
                <li><Link to="/tutor">AI Tutor</Link></li>
                <li><Link to="/profile">Profile</Link></li>
              </ul>
            </div>
            <div className="footer-links">
              <h4>Resources</h4>
              <ul>
                <li><a href="#">Documentation</a></li>
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
              </ul>
            </div>
            <div className="footer-links">
              <h4>Connect</h4>
              <ul>
                <li><a href="#">Twitter</a></li>
                <li><a href="#">GitHub</a></li>
                <li><a href="#">LinkedIn</a></li>
                <li><a href="#">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 TutorAI. All rights reserved.</p>
          </div>
        </div>
      </footer>


      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export default Layout;

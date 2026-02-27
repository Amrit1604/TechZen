import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Navbar.css';

interface NavbarProps {
  showAuthButtons?: boolean;
  isHomePage?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ showAuthButtons = false, isHomePage = false }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="nav-header">
      <div className="nav-container">
        {isHomePage ? (
          <nav className="nav-links" style={{ marginLeft: '-90px' }}>
            <div className="logo">
              <Link to="/home">
                <img src="/img-vid/logo.jpeg" alt="logo" style={{ width: '100px', borderRadius: '50%' }} />
              </Link>
            </div>

            <button className="nav-btn" onClick={() => navigate('/news')}>
              Tech News
            </button>
            <button className="nav-btn" onClick={() => navigate('/gadgets')}>
              Gadgets
            </button>
            <button className="nav-btn" onClick={() => navigate('/ai')}>
              AI Updates
            </button>
            <button className="nav-btn" onClick={() => navigate('/blogs')}>
              Blog
            </button>
            <button className="nav-btn" onClick={() => navigate('/selling')}>
              Sell/Buy
            </button>
            <button className="nav-btn" onClick={() => navigate('/customer')}>
              Tech Service
            </button>

            {/* User Profile */}
            {isAuthenticated && user && (
              <div className="user-profile">
                <div id="username-display">
                  <div className="user-avatar">{user.username.charAt(0).toUpperCase()}</div>
                  <span>{user.username}</span>
                  <i className="fas fa-user-astronaut"></i>
                </div>
              </div>
            )}

            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </nav>
        ) : (
          <>
            <Link to={isAuthenticated ? '/home' : '/'} className="logo">
              TechZen
            </Link>
            <nav className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
              <Link to="/AboutUs">ABOUT US</Link>
              <Link to="/ContactUs">CONTACT US</Link>
              <Link to="/blogs">BLOG</Link>
              {showAuthButtons && (
                <Link to="/login">
                  <button className="loginbtn">LOGIN/SIGNUP</button>
                </Link>
              )}
              {isAuthenticated && (
                <>
                  {user && (
                    <div className="user-profile">
                      <div id="username-display">
                        <i className="fas fa-user-circle"></i>
                        <span>{user.username}</span>
                      </div>
                    </div>
                  )}
                  <button className="logout-btn" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              )}
            </nav>
          </>
        )}

        <button
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          title="Menu"
        >
          <i className="fas fa-bars"></i>
        </button>
      </div>
    </header>
  );
};

export default Navbar;

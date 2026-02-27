import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Login.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  
  // Login form state
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginErrors, setLoginErrors] = useState({ username: '', password: '' });
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  
  // Signup form state
  const [signupData, setSignupData] = useState({ username: '', email: '', password: '' });
  const [signupErrors, setSignupErrors] = useState({ username: '', email: '', password: '' });
  const [isSignupLoading, setIsSignupLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  // Password visibility
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);

    let strength = 0;
    if (minLength) strength++;
    if (hasUpper) strength++;
    if (hasLower) strength++;
    if (hasNumber) strength++;
    if (hasSpecial) strength++;

    return {
      isValid: minLength && hasUpper && hasLower && hasNumber,
      strength: (strength / 5) * 100
    };
  };

  const handleSignupPasswordChange = (password: string) => {
    const { strength } = validatePassword(password);
    setPasswordStrength(strength);
    setSignupData({ ...signupData, password });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErrors({ username: '', password: '' });

    if (!loginData.username || !loginData.password) {
      setLoginErrors({
        username: !loginData.username ? 'Username is required' : '',
        password: !loginData.password ? 'Password is required' : ''
      });
      return;
    }

    setIsLoginLoading(true);

    try {
      await login(loginData);
      navigate('/home');
    } catch (error: any) {
      setLoginErrors({
        username: '',
        password: error.response?.data?.error || 'Invalid credentials'
      });
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupErrors({ username: '', email: '', password: '' });

    // Validate all fields
    const errors: any = {};
    if (!signupData.username) errors.username = 'Username is required';
    if (!signupData.email) errors.email = 'Email is required';
    else if (!validateEmail(signupData.email)) errors.email = 'Invalid email format';
    if (!signupData.password) errors.password = 'Password is required';
    else if (!validatePassword(signupData.password).isValid) {
      errors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';
    }

    if (Object.keys(errors).length > 0) {
      setSignupErrors(errors);
      return;
    }

    setIsSignupLoading(true);

    try {
      await signup(signupData);
      alert('Account created successfully! Please login.');
      setIsRightPanelActive(false);
      setSignupData({ username: '', email: '', password: '' });
    } catch (error: any) {
      if (error.response?.status === 409) {
        setSignupErrors({ ...signupErrors, username: 'Username already exists' });
      } else {
        alert(error.response?.data?.error || 'Signup failed');
      }
    } finally {
      setIsSignupLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background Video */}
      <div className="background-video">
        <video autoPlay muted loop>
          <source src="/img-vid/logbacknew.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Header */}
      <header className="header">
        <a href="/" className="logo">
          <img src="/img-vid/logo.jpeg" alt="TECHZEN" />
        </a>
      </header>

      {/* Main Container */}
      <div className={`container ${isRightPanelActive ? 'right-panel-active' : ''}`}>
        {/* Sign Up Container */}
        <div className="form-container sign-up-container">
          <form id="signupForm" onSubmit={handleSignupSubmit}>
            <h1>Create Account</h1>

            <div className="form-group">
              <input
                type="text"
                placeholder="Username"
                value={signupData.username}
                onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                required
              />
              {signupErrors.username && (
                <div className="error-message" style={{ display: 'block' }}>
                  {signupErrors.username}
                </div>
              )}
            </div>

            <div className="form-group">
              <input
                type="email"
                placeholder="Email"
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                required
              />
              {signupErrors.email && (
                <div className="error-message" style={{ display: 'block' }}>
                  {signupErrors.email}
                </div>
              )}
            </div>

            <div className="form-group password-container">
              <input
                type={showSignupPassword ? 'text' : 'password'}
                placeholder="Password"
                value={signupData.password}
                onChange={(e) => handleSignupPasswordChange(e.target.value)}
                required
              />
              <i
                className={`fas ${showSignupPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                onClick={() => setShowSignupPassword(!showSignupPassword)}
              />
              <div className="password-strength">
                <div
                  className="password-strength-bar"
                  style={{
                    width: `${passwordStrength}%`,
                    backgroundColor:
                      passwordStrength < 40 ? '#ff4444' : passwordStrength < 80 ? '#ffd700' : '#00c851'
                  }}
                />
              </div>
              {signupErrors.password && (
                <div className="error-message" style={{ display: 'block' }}>
                  {signupErrors.password}
                </div>
              )}
            </div>

            {isSignupLoading && <div className="spinner" />}
            <button type="submit" disabled={isSignupLoading}>
              {isSignupLoading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </form>
        </div>

        {/* Sign In Container */}
        <div className="form-container sign-in-container">
          <form id="loginForm" onSubmit={handleLoginSubmit}>
            <h1>Sign in</h1>

            <div className="form-group">
              <input
                type="text"
                placeholder="Username"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                required
              />
              {loginErrors.username && (
                <div className="error-message" style={{ display: 'block' }}>
                  {loginErrors.username}
                </div>
              )}
            </div>

            <div className="form-group password-container">
              <input
                type={showLoginPassword ? 'text' : 'password'}
                placeholder="Password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
              />
              <i
                className={`fas ${showLoginPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                onClick={() => setShowLoginPassword(!showLoginPassword)}
              />
              {loginErrors.password && (
                <div className="error-message" style={{ display: 'block' }}>
                  {loginErrors.password}
                </div>
              )}
            </div>

            <div className="remember-me">
              <input type="checkbox" id="rememberMe" />
              <label htmlFor="rememberMe">Remember me</label>
            </div>

            {isLoginLoading && <div className="spinner" />}
            <button type="submit" disabled={isLoginLoading}>
              {isLoginLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Overlay Container */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Welcome Back!</h1>
              <p>To keep connected with us please login with your personal info</p>
              <button className="ghost" onClick={() => setIsRightPanelActive(false)}>
                Sign In
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>Hello, Friend!</h1>
              <p>Enter your personal details and start your journey with us</p>
              <button className="ghost" onClick={() => setIsRightPanelActive(true)}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

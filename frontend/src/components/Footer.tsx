import React from 'react';
import '../styles/Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>TechZen</h3>
          <p>Your daily source for the latest in technology, innovation, and digital transformation.</p>
          <div className="social-links">
            <a href="#" className="social-link">
              <img src="/img-vid/facebook.png" alt="Facebook" />
            </a>
            <a href="#" className="social-link">
              <img src="/img-vid/twitter.png" alt="Twitter" />
            </a>
            <a href="#" className="social-link">
              <img src="/img-vid/linkedin.png" alt="LinkedIn" />
            </a>
            <a href="#" className="social-link">
              <img src="/img-vid/instagram.png" alt="Instagram" />
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li>
              <a href="/AboutUs">About Us</a>
            </li>
            <li>
              <a href="/ContactUs">Contact</a>
            </li>
            <li>
              <a href="#">Privacy Policy</a>
            </li>
            <li>
              <a href="#">Terms of Service</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Newsletter</h3>
          <p>Stay updated with our latest tech news</p>
          <form className="newsletter-form">
            <input type="email" placeholder="Enter your email" />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 TechZen. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

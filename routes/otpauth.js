const express = require('express');
const router = express.Router();
const { readUsers, writeUsers } = require('../utils/userUtils');
const { createSession, deleteSession } = require('../utils/sessionManager');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Path for storing OTPs
const otpStorePath = path.join(__dirname, '../data/otp_store.json');

// Helper function to read OTP store
function readOtpStore() {
  try {
    if (fs.existsSync(otpStorePath)) {
      const data = fs.readFileSync(otpStorePath, 'utf8');
      return JSON.parse(data);
    }
    return {};
  } catch (err) {
    console.error('Error reading OTP store:', err);
    return {};
  }
}

// Helper function to write OTP store
function writeOtpStore(store) {
  try {
    // Ensure the directory exists
    const dir = path.dirname(otpStorePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(otpStorePath, JSON.stringify(store, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing OTP store:', err);
    return false;
  }
}

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Generate a random 5-digit OTP
function generateOTP() {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

// Signup route
router.post('/signup', (req, res) => {
  try {
    const { username, email, password } = req.body;
    const users = readUsers();

    if (users[username]) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    users[username] = { email, password };
    writeUsers(users);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login route
router.post('/login', (req, res) => {
  try {
    console.log('Login attempt:', req.body);
    const { username, password } = req.body;
    const users = readUsers();
    
    console.log('Users database:', users);
    console.log('User exists?', !!users[username]);
    
    if (!users[username] || users[username].password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const sessionId = createSession({ username });
    
    res.cookie('sessionId', sessionId, { httpOnly: true, path: '/' });
    res.status(200).json({ redirect: '/home' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  const sessionId = req.cookies.sessionId;
  
  deleteSession(sessionId);
  res.clearCookie('sessionId');
  res.status(200).json({ success: true });
});

// Get current user
router.get('/user', (req, res) => {
  const sessionId = req.cookies.sessionId;
  console.log('API User request - Session ID:', sessionId);
  
  const { sessions } = require('../utils/sessionManager');  // Fix this path
  console.log('Available sessions:', Array.from(sessions.keys()));
  
  if (sessionId && sessions.has(sessionId)) {
    const sessionData = sessions.get(sessionId);
    console.log('API user request - session data:', sessionData);
    res.status(200).json({ 
      username: sessionData.username || 'User',
      id: sessionId
    });
  } else {
    console.log('API user request - no valid session');
    res.status(401).json({ error: 'Not logged in' });
  }
});

// FORGOT PASSWORD FUNCTIONALITY

// Route for initiating password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Find user with the provided email
    const users = readUsers();
    
    // Since your users are stored as an object keyed by username, we need to find by email differently
    let foundUser = null;
    let foundUsername = null;
    
    Object.entries(users).forEach(([username, user]) => {
      if (user.email === email) {
        foundUser = user;
        foundUsername = username;
      }
    });
    
    if (!foundUser) {
      // For security, don't reveal if email exists or not
      console.log('No user found with email:', email);
      return res.status(200).json({ message: 'If your email is registered, you will receive a reset code shortly' });
    }
    
    console.log(`User found for reset: ${foundUsername}`);
    
    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + (2 * 60 * 1000); // 2 minutes from now
    
    // Store OTP
    const otpStore = readOtpStore();
    otpStore[email] = {
      otp,
      expiresAt,
      username: foundUsername // Store username for later use
    };
    writeOtpStore(otpStore);
    
    console.log(`OTP generated for ${email}: ${otp}, expires at: ${new Date(expiresAt).toLocaleTimeString()}`);
    
    // Send email with OTP
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Verification Code - TECHZEN',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #3498db; text-align: center;">Password Reset Request</h2>
          <p>We received a request to reset your password. Please use the following verification code to continue:</p>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 32px; letter-spacing: 5px; font-weight: bold; margin: 20px 0; border-radius: 5px;">
            ${otp}
          </div>
          <p>This code will expire in 2 minutes.</p>
          <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
          <p style="color: #777; font-size: 12px; text-align: center; margin-top: 30px;">This is an automated message, please do not reply.</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`Reset email sent to ${email}`);
    
    res.status(200).json({ message: 'Verification code sent' });
  } catch (error) {
    console.error('Error in forgot-password:', error);
    res.status(500).json({ error: 'Failed to send verification code' });
  }
});

// Route for verifying OTP
router.post('/verify-otp', (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }
    
    const otpStore = readOtpStore();
    const otpData = otpStore[email];
    
    console.log(`Verifying OTP for ${email}: expected=${otpData?.otp}, provided=${otp}`);
    
    // Check if OTP exists and is valid
    if (!otpData || otpData.otp !== otp) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }
    
    // Check if OTP has expired
    if (Date.now() > otpData.expiresAt) {
      delete otpStore[email];
      writeOtpStore(otpStore);
      console.log(`OTP expired for ${email}`);
      return res.status(400).json({ error: 'Verification code has expired' });
    }
    
    // Mark OTP as verified (but don't delete it yet - we'll need it for the reset step)
    otpData.verified = true;
    writeOtpStore(otpStore);
    console.log(`OTP verified for ${email}`);
    
    res.status(200).json({ message: 'Verification successful' });
  } catch (error) {
    console.error('Error in verify-otp:', error);
    res.status(500).json({ error: 'Failed to verify code' });
  }
});

// Route for resetting password
router.post('/reset-password', (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Check if OTP was verified
    const otpStore = readOtpStore();
    const otpData = otpStore[email];
    
    if (!otpData || !otpData.verified) {
      return res.status(400).json({ error: 'Unauthorized password reset attempt' });
    }
    
    // Get username from stored OTP data
    const username = otpData.username;
    if (!username) {
      return res.status(400).json({ error: 'Invalid reset attempt' });
    }
    
    // Update user's password
    const users = readUsers();
    
    if (!users[username]) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update password
    users[username].password = password;
    
    if (!writeUsers(users)) {
      return res.status(500).json({ error: 'Failed to update password' });
    }
    
    console.log(`Password reset successful for user: ${username}`);
    
    // Clean up OTP store
    delete otpStore[email];
    writeOtpStore(otpStore);
    
    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error in reset-password:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

module.exports = router;
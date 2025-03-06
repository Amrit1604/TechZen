const express = require('express');
const router = express.Router();
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// In-memory session store - in production, use a database or Redis
const sessions = new Map();

// Helper functions for user data with your existing structure
function getUsersData() {
    const userDataPath = path.join(__dirname, '..', 'users.json');
    try {
        if (fs.existsSync(userDataPath)) {
            const data = fs.readFileSync(userDataPath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error reading users data:', error);
    }
    return { _lastCheck: new Date().toISOString() };
}

function saveUsersData(users) {
    const userDataPath = path.join(__dirname, '..', 'users.json');
    try {
        // Update the timestamp whenever we save
        users._lastCheck = new Date().toISOString();
        fs.writeFileSync(userDataPath, JSON.stringify(users, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving users data:', error);
        return false;
    }
}

router.post('/login', (req, res) => {
    console.log('Raw login request body:', req.body);
    
    try {
        // Extract credentials from request body
        const { username, email, password } = req.body;
        const identifier = username || email;
        
        console.log('Login attempt with identifier:', identifier);

        // Validate required fields
        if (!identifier || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username/email and password are required'
            });
        }

        const users = getUsersData();
        let foundUser = null;
        let foundUsername = null;

        // Check if identifier matches a username
        if (users[identifier] && users[identifier].password === password) {
            foundUser = users[identifier];
            foundUsername = identifier;
        } else {
            // Check if identifier matches an email
            for (const user in users) {
                if (user !== '_lastCheck' && 
                    users[user] && 
                    users[user].email === identifier && 
                    users[user].password === password) {
                    foundUser = users[user];
                    foundUsername = user;
                    break;
                }
            }
        }

        if (!foundUser) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Create session
        const sessionId = crypto.randomBytes(16).toString('hex');
        sessions.set(sessionId, { 
            username: foundUsername, 
            email: foundUser.email 
        });

        // Set cookie and return success
        res.cookie('sessionId', sessionId, { httpOnly: true });
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            user: { 
                username: foundUsername, 
                email: foundUser.email 
            }
        });
    } catch (error) {
        console.error('Server error during login:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

router.post('/signup', (req, res) => {
    console.log('Raw signup request body:', req.body);
    
    try {
        // Extract user details from request body
        const { username, email, password } = req.body;
        
        console.log('Extracted signup fields:', {
            username: username || 'MISSING',
            email: email || 'MISSING',
            password: password ? 'PROVIDED' : 'MISSING'
        });

        // Validate required fields
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required'
            });
        }

        const users = getUsersData();
        
        // Check if username already exists
        if (users[username]) {
            return res.status(409).json({
                success: false,
                error: 'Username already exists'
            });
        }
        
        // Check if email is already in use
        for (const user in users) {
            if (user !== '_lastCheck' && users[user] && users[user].email === email) {
                return res.status(409).json({
                    success: false,
                    error: 'Email already in use'
                });
            }
        }

        // Create new user
        users[username] = {
            email,
            password,
            createdAt: new Date().toISOString()
        };
        
        const saved = saveUsersData(users);
        if (!saved) {
            return res.status(500).json({
                success: false,
                error: 'Failed to save user data'
            });
        }

        // Create session
        const sessionId = crypto.randomBytes(16).toString('hex');
        sessions.set(sessionId, { username, email });

        // Set cookie and return success
        res.cookie('sessionId', sessionId, { httpOnly: true });
        return res.status(200).json({
            success: true,
            message: 'Signup successful',
            user: { username, email }
        });
    } catch (error) {
        console.error('Server error during signup:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});



// Logout endpoint
router.get('/logout', (req, res) => {
    const sessionId = req.cookies.sessionId;
    if (sessionId) {
        sessions.delete(sessionId);
        res.clearCookie('sessionId');
    }
    return res.json({ 
        success: true, 
        message: 'Logged out successfully' 
    });
});

// Session validation middleware
function validateSession(req, res, next) {
    const sessionId = req.cookies.sessionId;
    if (!sessionId || !sessions.has(sessionId)) {
        return res.status(401).json({ 
            success: false, 
            error: 'Unauthorized' 
        });
    }
    req.session = sessions.get(sessionId);
    next();
}

// Get current user info
router.get('/me', validateSession, (req, res) => {
    const { username, email } = req.session;
    const users = getUsersData();
    
    if (!users[username]) {
        return res.status(404).json({ 
            success: false, 
            error: 'User not found' 
        });
    }
    
    res.json({
        success: true,
        user: {
            username,
            email
        }
    });
});

module.exports = { router, sessions, validateSession };
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const socketIO = require('socket.io');
const fs = require('fs');
const path = require('path');
const setupCustomerSockets = require('./customer.js');
const sellRouter = require('./sell.js');

// Import our new route modules
const aiRoutes = require('./routes/ai');
const { router, sessions } = require('./routes/auth');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Middleware setup (correct order is important)
app.use(express.json());  // Make sure this is added
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
    store: new FileStore({
        path: './sessions',
        ttl: 86400
    })
}));

// Request logger middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Static File Serving - Moved this BEFORE the route definitions to ensure static files are served properly
app.use(express.static(__dirname));

// Make sure uploads directory is served statically
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Mount the routers
app.use('/api', sellRouter);
app.use('/api/auth', router);
app.use('/api', aiRoutes);

// Utility Functions
function saveUserData(userData) {
    const filePath = path.join(__dirname, 'userdata.json');
    let existingData = [];
    
    if (fs.existsSync(filePath)) {
        try {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            existingData = JSON.parse(fileContent);
        } catch (error) {
            console.error('Error reading existing data:', error);
        }
    }

    const newData = {
        ...userData,
        timestamp: new Date().toISOString()
    };
    existingData.push(newData);

    try {
        fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
        console.log('User data saved successfully');
    } catch (error) {
        console.error('Error saving user data:', error);
    }
}

// Routes
const routes = {
    '/': 'index.html',
    '/login': 'login.html',
    '/ContactUs': 'ContactUs.html',
    '/home': 'home.html',
    '/ai': 'ai.html',
    '/news': 'news.html',
    '/gadgets': 'gadget.html',
    '/subscribe': 'subscribe.html',
    '/blogs': 'blog.html',
    '/customer': 'customer.html',
    '/admin': 'admin1604.html',
    '/chatbot': 'chatbot.html',
    '/about': 'AboutUs.html',
    '/selling': 'selling.html',
};

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Ensure users.json exists
const usersFilePath = path.join(__dirname, 'users.json'); // Fixed path
if (!fs.existsSync(usersFilePath)) {
    try {
        fs.writeFileSync(usersFilePath, JSON.stringify({ _lastCheck: new Date().toISOString() }, null, 2));
        console.log('Created empty users.json file');
    } catch (error) {
        console.error('Error creating users.json file:', error);
    }
}

// Middleware to check authentication for protected routes
// Fixed to use sessions from auth.js
const protectedRoutes = ['/home', '/ai', '/news', '/gadgets', '/subscribe', '/customer', '/chatbot'];
app.use((req, res, next) => {
    if (protectedRoutes.includes(req.path)) {
        const sessionId = req.cookies.sessionId;
        console.log(`Route ${req.path} access attempted with sessionId: ${sessionId}`);
        
        if (sessionId) {
            console.log(`Session exists: ${sessions.has(sessionId)}`);
        } else {
            console.log("No sessionId provided");
        }
        
        if (!sessionId || !sessions.has(sessionId)) {
            console.log("Redirecting to login");
            return res.redirect('/login');
        }
    }
    next();
});

// Maintain compatibility with old login endpoint
app.post('/login', (req, res) => {
    console.log('Legacy /login endpoint called, forwarding to /api/auth/login');
    // Fixed the forwarding mechanism
    req.url = '/api/auth/login';
    app._router.handle(req, res);
});

// Add a logout endpoint for convenience
app.get('/logout', (req, res) => {
    console.log('Legacy /logout endpoint called');
    const sessionId = req.cookies.sessionId;
    if (sessionId) {
        sessions.delete(sessionId);
        res.clearCookie('sessionId');
    }
    res.redirect('/login');
});

// Maintain compatibility with old chatbot endpoint
app.post('/chatbot', (req, res) => {
    console.log('Legacy /chatbot endpoint called, forwarding to /api/chatbot');
    req.url = '/api/chatbot';
    app._router.handle(req, res);
});

// Catch-all route for static files
app.get('*', (req, res) => {
    const route = routes[req.path];
    if (route) {
        res.sendFile(path.join(__dirname, route));
    } else {
        res.status(404).send('Not Found');
    }
});

setupCustomerSockets(io);

// Start Server
const PORT = process.env.PORT || 8081;
server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

// Import middleware
const { 
  requestLogger, 
  setupBodyParsers, 
  setupCookieParser, 
  setupStaticFiles 
} = require('./middleware/appMiddleware');

// Import authentication middleware
const { isAuthenticated } = require('./middleware/authMiddleware');

// Import routes
const authRouter = require('./routes/auth');
const apiRouter = require('./routes/api');
const aiRoutes = require('./routes/ai');

const { router: viewRouter, publicRoutes, protectedRoutes } = require('./routes/views');
const sellRouter = require('./routes/sell');

// Import socket handler
const setupCustomerSockets = require('./sockets/customer');

// Import error handlers
const { notFoundHandler, errorHandler } = require('./middleware/errorHandlers');

// Setup Express application
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// CORS configuration for React frontend
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8081'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Apply middleware (in correct order)
setupBodyParsers(app);
setupCookieParser(app);
setupStaticFiles(app);
requestLogger(app);

// Public routes (no authentication required)
app.use('/', publicRoutes);

// Authentication routes
app.use('/api/auth', authRouter);

// Legacy auth endpoints for backward compatibility
app.post('/login', (req, res, next) => {
  authRouter.handle(req, res, next);
});

app.post('/signup', (req, res, next) => {
  authRouter.handle(req, res, next);
});

// API routes
app.use('/api', apiRouter);
app.use('/api/sell', sellRouter);

// ChatBot route

app.use('/', aiRoutes);

// Protected view routes
const protectedPaths = ['/home', '/ai', '/news', '/gadgets', '/blogs', '/customer', '/chatbot', '/selling', '/selling2'];
protectedPaths.forEach(path => {
  app.get(path, isAuthenticated, (req, res, next) => {
    protectedRoutes.handle(req, res, next);
  });
});

// User API route
app.get('/api/user', (req, res, next) => {
  req.url = '/user';
  authRouter.handle(req, res, next);
});


// Socket setup
setupCustomerSockets(io);

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 8081;
server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

module.exports = { app, server };

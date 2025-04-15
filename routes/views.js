// routes/views.js

const express = require('express');
const router = express.Router();
const path = require('path');

// Route definitions
const routes = {
  '/': 'public/html/index.html',
  '/login': 'public/html/login.html',
  '/ContactUs': 'public/html/ContactUs.html',
  '/home': 'public/html/home.html',
  '/ai': 'public/html/ai.html',
  '/news': 'public/html/news.html',
  '/gadgets': 'public/html/gadget.html',
  '/blogs': 'public/html/blog.html',
  '/customer': 'public/html/customer.html',
  '/admin': 'public/html/admin1604.html',
  '/chatbot': 'public/html/chatbot.html',
  '/AboutUs': 'public/html/AboutUs.html',
  '/selling': 'public/html/selling.html',
  '/selling2': 'public/html/selling2.html',
};

// Handle all defined routes
Object.entries(routes).forEach(([route, file]) => {
  router.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, '..', file));
  });
});

// Public routes - no auth required
const publicRoutes = express.Router();

// Add specific public routes if needed
publicRoutes.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public/html/index.html'));
});

publicRoutes.get('/ContactUs', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public/html/ContactUs.html'));
});

publicRoutes.get('/AboutUs', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public/html/AboutUs.html'));
});

publicRoutes.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public/html/login.html'));
}
);


// Protected routes - auth required
const protectedRoutes = express.Router();

// Add protected routes
protectedRoutes.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public/html/home.html'));
});

protectedRoutes.get('/ai', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public/html/ai.html'));
});

protectedRoutes.get('/news', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public/html/news.html'));
});

protectedRoutes.get('/gadgets', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public/html/gadget.html'));
});

protectedRoutes.get('/blogs', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public/html/blog.html'));
});

protectedRoutes.get('/customer', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public/html/customer.html'));
});

protectedRoutes.get('/chatbot', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public/html/chatbot.html'));
});

protectedRoutes.get('/selling', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public/html/selling.html'));
});

protectedRoutes.get('/selling2', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public/html/selling2.html'));
});

protectedRoutes.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public/html/admin1604.html'));
});



module.exports = {
  router,
  publicRoutes,
  protectedRoutes
};

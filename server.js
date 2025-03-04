const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const fs = require('fs');


require('dotenv').config();  // Add this line to load .env variables
const API_KEY = process.env.API_KEY;

const USERS_FILE = path.join(__dirname, 'users.json');
if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify({}));
}


const sessions = new Map();

const app = express();





function readUsers() {
    try {
        return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    } catch (error) {
        console.error('Error reading users file:', error);
        return {};
    }
}

function writeUsers(users) {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    } catch (error) {
        console.error('Error writing users file:', error);
    }
}

function parseCookies(cookieHeader) {
    const cookies = {};
    if (cookieHeader) {
        cookieHeader.split(';').forEach(cookie => {
            const [name, value] = cookie.split('=');
            cookies[name.trim()] = value;
        });
    }
    return cookies;
}

function generateSessionId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.mp4': 'video/mp4',
    '.ico': 'image/x-icon',
};

const routes = {
    '/': 'index.html',
    '/login': 'login.html',
    '/ContactUs' : 'ContactUs.html',
    '/home': 'home.html',
    '/ai': 'ai.html',
    '/news': 'news.html',
    '/gadgets': 'gadgets.html',
    '/subscribe': 'subscribe.html',
    '/blogs': 'blogs.html',
    '/customer': 'customer.html',
};

const server = http.createServer((req, res) => {
    if (req.method === 'GET') {
        const cookies = parseCookies(req.headers.cookie);
        const sessionId = cookies.sessionId;

        if (['/home', '/ai', '/news', '/gadgets', '/subscribe' ,'/customer', '/blogs' ].includes(req.url)) {
            if (!sessionId || !sessions.has(sessionId)) {
                res.writeHead(302, { 'Location': '/login' });
                res.end();
                return;
            }
        }




        const filePath = routes[req.url] || req.url.substring(1);
        fs.readFile(path.join(__dirname, filePath), (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('File not found');
                return;
            }
            const ext = path.extname(filePath);
            res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
            res.end(data);
        });
        return;
    }




    
    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            if (req.url === '/signup') {
                try {
                    const { username, email, password } = JSON.parse(body);
                    const users = readUsers();

                    if (users[username]) {
                        res.writeHead(409, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Username already exists' }));
                        return;
                    }

                    users[username] = { email, password };
                    writeUsers(users);

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true }));
                } catch (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Server error' }));
                }
                return;
            }

            if (req.url === '/login') {
                try {
                    const { username, password } = JSON.parse(body);
                    const users = readUsers();

                    if (!users[username] || users[username].password !== password) {
                        res.writeHead(401, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Invalid credentials' }));
                        return;
                    }

                    const sessionId = generateSessionId();
                    sessions.set(sessionId, username);

                    res.writeHead(200, {
                        'Set-Cookie': `sessionId=${sessionId}; Path=/; HttpOnly`,
                        'Content-Type': 'application/json'
                    });
                    res.end(JSON.stringify({ redirect: '/home' }));
                } catch (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Server error' }));
                }
                return;
            }

            if (req.url === '/logout') {
                try {
                    const cookies = parseCookies(req.headers.cookie);
                    const sessionId = cookies.sessionId;
                    
                    if (sessionId) {
                        sessions.delete(sessionId);
                    }
            
                    res.writeHead(200, {
                        'Set-Cookie': 'sessionId=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
                        'Content-Type': 'application/json'
                    });
                    res.end(JSON.stringify({ success: true }));
                } catch (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Server error' }));
                }
                return;
            }
        });
        return;
    }

    // Example of handling a request from the client to your server, which forwards the request to the external API
server.on('request', (req, res) => {
    if (req.method === 'POST' && req.url === '/chatbot') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const requestBody = JSON.parse(body);

                // Make the API request server-side using the API key
                const response = await fetch('https://api.example.com/chatbot', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${API_KEY}`, // Add the API key here
                    },
                    body: JSON.stringify(requestBody),
                });

                const data = await response.json();

                // Send the data back to the client
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Server error' }));
            }
        });
    }
});

    res.writeHead(404);
    res.end('Not found');
});





// CUSTOMER SERVICE ----------------------- 


const io = socketIO(server);  // <-- Then pass the server to socket.io



// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'customer.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Store active chats and admin sessions
const activeSessions = new Map();
const adminSessions = new Map();
const chatHistory = new Map();

// Function to save user data to JSON file
function saveUserData(userData) {
    const filePath = path.join(__dirname, 'userdata.json');
    let existingData = [];
    
    // Read existing data if file exists
    if (fs.existsSync(filePath)) {
        try {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            existingData = JSON.parse(fileContent);
        } catch (error) {
            console.error('Error reading existing data:', error);
        }
    }

    // Add new user data with timestamp
    const newData = {
        ...userData,
        timestamp: new Date().toISOString()
    };
    existingData.push(newData);

    // Write back to file
    try {
        fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
        console.log('User data saved successfully');
    } catch (error) {
        console.error('Error saving user data:', error);
    }
}

// Handle admin connections
io.of('/admin').on('connection', (socket) => {
    console.log('Admin connected');

    socket.on('adminLogin', (data) => {
        console.log('Admin login attempt:', data);
        // Store admin session
        adminSessions.set(socket.id, {
            adminId: data.adminId,
            socket: socket
        });
        
        socket.emit('adminAuthSuccess');
        
        // Send current customer list
        const customerList = Array.from(activeSessions.values()).map(session => ({
            id: session.customerId,
            username: session.username,
            email: session.email,
            issue: session.issue,
            status: session.status
        }));
        console.log('Sending customer list:', customerList);
        socket.emit('customerList', customerList);
    });

    socket.on('joinCustomerChat', (data) => {
        console.log('Admin joining customer chat:', data);
        const session = activeSessions.get(data.customerId);
        if (session) {
            socket.join(data.customerId);
            const history = chatHistory.get(data.customerId) || [];
            socket.emit('chatHistory', { messages: history });
        }
    });

    socket.on('adminMessage', (data) => {
        console.log('Admin message:', data);
        const session = activeSessions.get(data.customerId);
        if (session) {
            const messageData = {
                type: 'admin',
                message: data.message,
                timestamp: new Date().toISOString()
            };
            
            // Store in chat history
            const history = chatHistory.get(data.customerId) || [];
            history.push(messageData);
            chatHistory.set(data.customerId, history);
            
            // Send to customer
            io.to(data.customerId).emit('adminMessage', messageData);
        }
    });

    socket.on('disconnect', () => {
        console.log('Admin disconnected');
        adminSessions.delete(socket.id);
    });
});

// Customer socket handlers
io.on('connection', (socket) => {
    console.log('Customer connected');

    socket.on('startCustomerChat', (data) => {
        console.log('New customer chat:', data);
        const customerId = socket.id;
        if (!data.username || !data.email || !data.issue) {
            console.error('Invalid data from customer:', data);
            socket.emit('errorMessage', 'Invalid data provided.');
            return;
        }
        
        // Save user data to JSON file
        saveUserData({
            customerId,
            username: data.username,
            email: data.email,
            issue: data.issue
        });

        // Store session info
        activeSessions.set(customerId, {
            customerId,
            username: data.username,
            email: data.email,
            issue: data.issue,
            status: 'waiting',
            socket: socket
        });
        
        // Join customer to their room
        socket.join(customerId);
        
        // Initialize chat history
        chatHistory.set(customerId, []);
        
        // Update all admins
        io.of('/admin').emit('customerList', Array.from(activeSessions.values()).map(session => ({
            id: session.customerId,
            username: session.username,
            email: session.email,
            issue: session.issue,
            status: session.status
        })));
        
        socket.emit('chatStatus', 'Connected to support. Please wait for an agent.');
    });

    socket.on('customerMessage', (data) => {
        console.log('Customer message:', data);
        const customerId = socket.id;
        const session = activeSessions.get(customerId);
        
        if (session) {
            const messageData = {
                type: 'customer',
                customerId,
                username: data.username,
                message: data.message,
                timestamp: new Date().toISOString()
            };
            
            // Store in chat history
            const history = chatHistory.get(customerId) || [];
            history.push(messageData);
            chatHistory.set(customerId, history);
            
            // Send to admins
            io.of('/admin').emit('customerMessage', messageData);
        }
    });

    socket.on('disconnect', () => {
        console.log('Customer disconnected');
        const customerId = socket.id;
        
        // Clean up
        activeSessions.delete(customerId);
        chatHistory.delete(customerId);
        
        // Update admins
        io.of('/admin').emit('customerList', Array.from(activeSessions.values()).map(session => ({
            id: session.customerId,
            username: session.username,
            email: session.email,
            issue: session.issue,
            status: session.status
        })));
    });

    // Add these event handlers to your server.js

// In the customer socket handlers section:
socket.on('issueResolved', (data) => {
    const customerId = socket.id;
    const session = activeSessions.get(customerId);
    
    if (session) {
        // Update session status
        session.status = 'resolved';
        activeSessions.set(customerId, session);
        
        // Notify admin
        io.of('/admin').emit('chatResolved', {
            customerId,
            username: data.username,
            status: 'resolved'
        });
        
        // Add to chat history
        const history = chatHistory.get(customerId) || [];
        history.push({
            type: 'system',
            message: 'Customer marked issue as resolved',
            timestamp: new Date().toISOString()
        });
        chatHistory.set(customerId, history);
    }
});

socket.on('issueUnresolved', (data) => {
    const customerId = socket.id;
    const session = activeSessions.get(customerId);
    
    if (session) {
        session.status = 'unresolved';
        activeSessions.set(customerId, session);
        
        io.of('/admin').emit('chatUnresolved', {
            customerId,
            username: data.username,
            status: 'unresolved'
        });
        
        const history = chatHistory.get(customerId) || [];
        history.push({
            type: 'system',
            message: 'Customer marked issue as unresolved',
            timestamp: new Date().toISOString()
        });
        chatHistory.set(customerId, history);
    }
});

socket.on('endCustomerChat', (data) => {
    const customerId = socket.id;
    const session = activeSessions.get(customerId);
    
    if (session) {
        // Notify admin
        io.of('/admin').emit('customerEndedChat', {
            customerId,
            username: data.username,
            status: data.status
        });
        
        // Add to chat history
        const history = chatHistory.get(customerId) || [];
        history.push({
            type: 'system',
            message: `Chat ended by customer (${data.status})`,
            timestamp: new Date().toISOString()
        });
        
        // Clean up if resolved
        if (data.status === 'resolved') {
            activeSessions.delete(customerId);
            chatHistory.delete(customerId);
            
            // Update admin customer list
            io.of('/admin').emit('customerList', Array.from(activeSessions.values()).map(session => ({
                id: session.customerId,
                username: session.username,
                email: session.email,
                issue: session.issue,
                status: session.status
            })));
        }
    }
});

});

const PORT = process.env.PORT || 8081;  
server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

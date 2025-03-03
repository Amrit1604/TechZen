const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'customer.html'));
});

app.get('/admin1604', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin1604.html'));
});

// Store active chats and admin1604 sessions
const activeSessions = new Map();
const admin1604Sessions = new Map();
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

// Handle admin1604 connections
io.of('/admin1604').on('connection', (socket) => {
    console.log('admin1604 connected');

    socket.on('admin1604Login', (data) => {
        console.log('admin1604 login attempt:', data);
        // Store admin1604 session
        admin1604Sessions.set(socket.id, {
            admin1604Id: data.admin1604Id,
            socket: socket
        });
        
        socket.emit('admin1604AuthSuccess');
        
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
        console.log('admin1604 joining customer chat:', data);
        const session = activeSessions.get(data.customerId);
        if (session) {
            socket.join(data.customerId);
            const history = chatHistory.get(data.customerId) || [];
            socket.emit('chatHistory', { messages: history });
        }
    });

    socket.on('admin1604Message', (data) => {
        console.log('admin1604 message:', data);
        const session = activeSessions.get(data.customerId);
        if (session) {
            const messageData = {
                type: 'admin1604',
                message: data.message,
                timestamp: new Date().toISOString()
            };
            
            // Store in chat history
            const history = chatHistory.get(data.customerId) || [];
            history.push(messageData);
            chatHistory.set(data.customerId, history);
            
            // Send to customer
            io.to(data.customerId).emit('admin1604Message', messageData);
        }
    });

    socket.on('disconnect', () => {
        console.log('admin1604 disconnected');
        admin1604Sessions.delete(socket.id);
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
        
        // Update all admin1604s
        io.of('/admin1604').emit('customerList', Array.from(activeSessions.values()).map(session => ({
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
            
            // Send to admin1604s
            io.of('/admin1604').emit('customerMessage', messageData);
        }
    });

    socket.on('disconnect', () => {
        console.log('Customer disconnected');
        const customerId = socket.id;
        
        // Clean up
        activeSessions.delete(customerId);
        chatHistory.delete(customerId);
        
        // Update admin1604s
        io.of('/admin1604').emit('customerList', Array.from(activeSessions.values()).map(session => ({
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
        
        // Notify admin1604
        io.of('/admin1604').emit('chatResolved', {
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
        
        io.of('/admin1604').emit('chatUnresolved', {
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
        // Notify admin1604
        io.of('/admin1604').emit('customerEndedChat', {
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
            
            // Update admin1604 customer list
            io.of('/admin1604').emit('customerList', Array.from(activeSessions.values()).map(session => ({
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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
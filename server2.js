const http = require('http');
const fs = require('fs');
const path = require('path');
require('dotenv').config();  // Add this line to load .env variables
const API_KEY = process.env.API_KEY;

const USERS_FILE = path.join(__dirname, 'users.json');
if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify({}));
}

const sessions = new Map();





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
    '/home': 'home.html',
    '/ai': 'ai.html',
    '/news': 'news.html',
    '/gadgets': 'gadgets.html',
    '/subscribe': 'subscribe.html',
};

const server = http.createServer((req, res) => {
    if (req.method === 'GET') {
        const cookies = parseCookies(req.headers.cookie);
        const sessionId = cookies.sessionId;

        if (['/home', '/ai', '/news', '/gadgets', '/subscribe'].includes(req.url)) {
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

const PORT = process.env.PORT || 3000;  // Use PORT from environment variables or default to 3000
server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

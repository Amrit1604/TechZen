// utils/sessionManager.js

const fs = require('fs');
const path = require('path');

const SESSION_FILE = path.join(__dirname, '..', 'data', 'sessions.json');

// Load sessions from disk on startup
function loadSessions() {
  try {
    if (fs.existsSync(SESSION_FILE)) {
      const data = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
      return new Map(Object.entries(data));
    }
  } catch (err) {
    console.error('Error loading sessions:', err.message);
  }
  return new Map();
}

// Save sessions to disk
function saveSessions() {
  try {
    const dir = path.dirname(SESSION_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const obj = Object.fromEntries(sessions);
    fs.writeFileSync(SESSION_FILE, JSON.stringify(obj, null, 2));
  } catch (err) {
    console.error('Error saving sessions:', err.message);
  }
}

const sessions = loadSessions();

function generateSessionId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function createSession(userData) {
  const sessionId = generateSessionId();
  sessions.set(sessionId, userData);
  saveSessions();
  console.log('Session created:', sessionId);
  return sessionId;
}

function getSession(sessionId) {
  return sessions.get(sessionId);
}

function deleteSession(sessionId) {
  if (sessionId) {
    sessions.delete(sessionId);
    saveSessions();
    return true;
  }
  return false;
}

module.exports = {
  sessions,
  generateSessionId,
  createSession,
  getSession,
  deleteSession
};

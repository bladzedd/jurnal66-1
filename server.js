import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.resolve(__dirname, 'classroom_data.json');

// Middleware parsing JSON body
app.use(express.json());

// CORS & Headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Helper read/write classroom state
const readState = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading classroom_data.json', e);
  }
  return null;
};

const writeState = (state) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing classroom_data.json', e);
  }
};

// 1. GET /api/sync
app.get('/api/sync', (req, res) => {
  const state = readState();
  res.json({ success: true, state: state || {} });
});

// 2. POST /api/sync
app.post('/api/sync', (req, res) => {
  try {
    const incoming = req.body || {};
    const existing = readState() || {};

    // Smart merge for registeredUsers (master roster of users across all devices on VPS)
    let mergedUsers = existing.registeredUsers || [];
    if (Array.isArray(incoming.registeredUsers)) {
      const userMap = new Map();
      (existing.registeredUsers || []).forEach(u => { if (u && u.id) userMap.set(u.id, u); });
      incoming.registeredUsers.forEach(u => {
        if (u && u.id) {
          const old = userMap.get(u.id);
          userMap.set(u.id, { ...old, ...u, lastUsedAt: Math.max(old?.lastUsedAt || 0, u.lastUsedAt || 0) });
        }
      });
      mergedUsers = Array.from(userMap.values());
    }

    const merged = {
      ...existing,
      ...incoming,
      ...(mergedUsers.length > 0 ? { registeredUsers: mergedUsers } : {}),
      updatedAt: new Date().toISOString()
    };
    writeState(merged);
    res.json({ success: true, state: merged });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 2b. GET /api/users - Quick inspect of all users registered on this VPS
app.get('/api/users', (req, res) => {
  const state = readState() || {};
  res.json({
    success: true,
    total: (state.registeredUsers || []).length,
    users: state.registeredUsers || []
  });
});

// 3. POST /api/reset
app.post('/api/reset', (req, res) => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      fs.unlinkSync(DATA_FILE);
    }
  } catch (e) {}
  res.json({ success: true, message: 'Classroom reset' });
});

// Serve static frontend files from Vite build output (dist/)
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback all other GET routes to index.html (SPA routing)
app.use((req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Production server running on http://0.0.0.0:${PORT}`);
});

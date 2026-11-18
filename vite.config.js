import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function classroomSyncPlugin() {
  const DATA_FILE = path.resolve(__dirname, 'classroom_data.json');

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

  const apiMiddleware = (req, res, next) => {
    const url = req.url || '';
    if (!url.startsWith('/api/')) {
      return next();
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      return res.end();
    }

    // 1. GET /api/sync
    if (url.startsWith('/api/sync') && req.method === 'GET') {
      const state = readState();
      return res.end(JSON.stringify({ success: true, state: state || {} }));
    }

    // 2. POST /api/sync
    if (url.startsWith('/api/sync') && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const incoming = JSON.parse(body || '{}');
          const existing = readState() || {};

          // Smart merge for registeredUsers (master roster of users across devices)
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
          return res.end(JSON.stringify({ success: true, state: merged }));
        } catch (err) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }

    // 3. POST /api/reset
    if (url.startsWith('/api/reset') && req.method === 'POST') {
      try {
        if (fs.existsSync(DATA_FILE)) fs.unlinkSync(DATA_FILE);
      } catch {}
      return res.end(JSON.stringify({ success: true, message: 'Classroom reset' }));
    }

    next();
  };

  return {
    name: 'classroom-sync-server',
    configureServer(server) {
      server.middlewares.use(apiMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(apiMiddleware);
    }
  };
}

export default defineConfig({
  plugins: [react(), classroomSyncPlugin()],
  server: {
    host: '0.0.0.0', // Allow other phones on Wi-Fi to connect!
    port: 3000,
    open: false
  },
  preview: {
    host: '0.0.0.0', // Allow other phones on Wi-Fi to connect!
    port: 4173
  }
});

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
      const state = readState() || {};
      if (Array.isArray(state.teams)) {
        state.teams = state.teams.filter(t => t && t.id !== 'team-default' && t.name !== 'Biro Redaksi Garuda');
      }
      if (Array.isArray(state.registeredUsers)) {
        state.registeredUsers = state.registeredUsers.filter(u => u && u.teamId !== 'team-default' && u.teamName !== 'Biro Redaksi Garuda');
      }
      return res.end(JSON.stringify({ success: true, state }));
    }

    // 2. POST /api/sync
    if (url.startsWith('/api/sync') && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const incoming = JSON.parse(body || '{}');
          const existing = readState() || {};

          let currentTeams = (existing.teams || []).filter(t => t && t.id !== 'team-default' && t.name !== 'Biro Redaksi Garuda');
          let currentUsers = (existing.registeredUsers || []).filter(u => u && u.teamId !== 'team-default' && u.teamName !== 'Biro Redaksi Garuda');

          if (incoming.deleteTeamId) {
            currentTeams = currentTeams.filter(t => t.id !== incoming.deleteTeamId);
            currentUsers = currentUsers.filter(u => u.teamId !== incoming.deleteTeamId);
          }

          if (incoming.isFullRosterSync && Array.isArray(incoming.teams)) {
            currentTeams = incoming.teams.filter(t => t && t.id !== 'team-default' && t.name !== 'Biro Redaksi Garuda');
          } else if (Array.isArray(incoming.teams)) {
            const teamMap = new Map();
            currentTeams.forEach(t => teamMap.set(t.id, t));
            incoming.teams.forEach(t => {
              if (t && t.id && t.id !== 'team-default' && t.name !== 'Biro Redaksi Garuda') {
                const old = teamMap.get(t.id);
                teamMap.set(t.id, { ...old, ...t });
              }
            });
            currentTeams = Array.from(teamMap.values());
          }

          if (Array.isArray(incoming.registeredUsers)) {
            const userMap = new Map();
            currentUsers.forEach(u => userMap.set(u.id, u));
            incoming.registeredUsers.forEach(u => {
              if (u && u.id && u.teamId !== 'team-default' && u.teamName !== 'Biro Redaksi Garuda') {
                const old = userMap.get(u.id);
                userMap.set(u.id, { ...old, ...u, lastUsedAt: Math.max(old?.lastUsedAt || 0, u.lastUsedAt || 0) });
              }
            });
            currentUsers = Array.from(userMap.values());
          }

          const merged = {
            ...existing,
            ...incoming,
            teams: currentTeams,
            registeredUsers: currentUsers,
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

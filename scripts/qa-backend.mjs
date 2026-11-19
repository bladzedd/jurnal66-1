import http from 'http';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_PORT = 3099;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

// Helper HTTP fetch wrapper
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  let data = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }
  return { status: res.status, headers: res.headers, data };
}

async function runBackendQA() {
  console.log("==================================================================");
  console.log("🚀 STARTING BACKEND QA TEST SUITE (Express API & State Sync)");
  console.log("==================================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, detail = "") {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} - ${detail}`);
      failed++;
    }
  }

  // Backup existing classroom_data.json if it exists
  const DATA_FILE = path.resolve(__dirname, '..', 'classroom_data.json');
  let backupData = null;
  if (fs.existsSync(DATA_FILE)) {
    backupData = fs.readFileSync(DATA_FILE, 'utf-8');
  }

  // Start server process on TEST_PORT
  const serverProcess = spawn('node', ['server.js'], {
    env: { ...process.env, PORT: String(TEST_PORT) },
    cwd: path.resolve(__dirname, '..'),
    stdio: 'pipe'
  });

  serverProcess.stdout.on('data', (d) => {
    // console.log(`[server stdout]: ${d.toString().trim()}`);
  });
  serverProcess.stderr.on('data', (d) => {
    console.error(`[server stderr]: ${d.toString().trim()}`);
  });

  // Wait for server to boot
  await new Promise(r => setTimeout(r, 1200));

  try {
    // 1. Test Static Files & SPA Routing
    console.log("\n--- TEST GROUP 1: Static Files & SPA Routing ---");
    const rootRes = await request('/');
    assert(rootRes.status === 200, "GET / serves static index.html", `Got status ${rootRes.status}`);
    assert(typeof rootRes.data === 'string' && rootRes.data.includes('<html'), "GET / contains valid HTML document");

    const spaRes = await request('/any-arbitrary-subroute');
    assert(spaRes.status === 200, "SPA Routing: fallback route serves index.html", `Got status ${spaRes.status}`);

    // 2. Test CORS & Preflight
    console.log("\n--- TEST GROUP 2: CORS & Preflight Headers ---");
    const optRes = await request('/api/sync', { method: 'OPTIONS' });
    assert(optRes.status === 204, "OPTIONS /api/sync returns 204 No Content");
    assert(optRes.headers.get('access-control-allow-origin') === '*', "CORS header Access-Control-Allow-Origin is *");
    assert(optRes.headers.get('access-control-allow-methods')?.includes('POST'), "CORS allows POST method");

    // 3. Test POST /api/reset
    console.log("\n--- TEST GROUP 3: Reset Endpoint ---");
    const resetRes = await request('/api/reset', { method: 'POST' });
    assert(resetRes.status === 200 && resetRes.data.success === true, "POST /api/reset returns success: true");

    // 4. Test GET /api/sync after reset
    console.log("\n--- TEST GROUP 4: GET /api/sync Baseline ---");
    const syncInit = await request('/api/sync');
    assert(syncInit.status === 200, "GET /api/sync status is 200");
    assert(syncInit.data.success === true, "GET /api/sync success flag is true");
    assert(syncInit.data.state !== null, "GET /api/sync returns state object");

    // 5. Test POST /api/sync: Create Team and Register Users
    console.log("\n--- TEST GROUP 5: POST /api/sync Team Creation & User Registration ---");
    const mockTeam1 = {
      id: "team-qa-1",
      name: "Biro QA Sinar Harapan",
      leaderCode: "QALD1",
      memberCode: "QAMB1",
      coins: 100,
      activeShield: false,
      activeDebuffs: [],
      members: [
        { name: "Dewi Sartika", role: "Pemimpin Redaksi", isLeader: true, classInfo: "8A" },
        { name: "Andi Wijaya", role: "Wartawan Liputan", isLeader: false, classInfo: "8A" }
      ]
    };

    const mockUsers = [
      { id: "user-1", name: "Dewi Sartika", teamId: "team-qa-1", teamName: "Biro QA Sinar Harapan", role: "Pemimpin Redaksi", isLeader: true, classInfo: "8A", lastUsedAt: Date.now() },
      { id: "user-2", name: "Andi Wijaya", teamId: "team-qa-1", teamName: "Biro QA Sinar Harapan", role: "Wartawan Liputan", isLeader: false, classInfo: "8A", lastUsedAt: Date.now() }
    ];

    const postSyncRes = await request('/api/sync', {
      method: 'POST',
      body: JSON.stringify({
        teams: [mockTeam1],
        registeredUsers: mockUsers,
        classroomStage: 0,
        globalTimer: { isRunning: true, remainingSeconds: 1200 },
        screenFreeze: { isFrozen: false, reason: "" }
      })
    });

    assert(postSyncRes.status === 200 && postSyncRes.data.success === true, "POST /api/sync accepts valid payload");
    const savedState = postSyncRes.data.state;
    assert(savedState.teams.length === 1 && savedState.teams[0].id === "team-qa-1", "State contains created team 'team-qa-1'");
    assert(savedState.classroomStage === 0, "Classroom stage correctly saved as 0 (Pre-Session Lobby)");
    assert(savedState.registeredUsers.length === 2, "Registered users correctly saved (2 users)");

    // 6. Test GET /api/users
    console.log("\n--- TEST GROUP 6: GET /api/users Master Roster ---");
    const usersRes = await request('/api/users');
    assert(usersRes.status === 200, "GET /api/users status is 200");
    assert(usersRes.data.total === 2, "GET /api/users total matches registered users (2)");
    assert(usersRes.data.users.some(u => u.name === "Dewi Sartika"), "User roster includes 'Dewi Sartika'");

    // 7. Test Partial Team Updates (Coin deduction & Stage progression)
    console.log("\n--- TEST GROUP 7: Incremental Team Updates ---");
    const updateRes = await request('/api/sync', {
      method: 'POST',
      body: JSON.stringify({
        teams: [{
          id: "team-qa-1",
          coins: 70, // Spent 30 coins on shield
          activeShield: true,
          completedStages: [1],
          stageScores: { 1: 100 }
        }],
        classroomStage: 1
      })
    });

    const updatedState = updateRes.data.state;
    const teamAfterUpdate = updatedState.teams.find(t => t.id === "team-qa-1");
    assert(teamAfterUpdate.coins === 70, "Team coins decremented to 70");
    assert(teamAfterUpdate.activeShield === true, "Team activeShield set to true");
    assert(teamAfterUpdate.name === "Biro QA Sinar Harapan", "Original team name preserved across partial update");
    assert(updatedState.classroomStage === 1, "Classroom stage updated to 1");

    // 8. Test deleteTeamId
    console.log("\n--- TEST GROUP 8: Delete Team Handling ---");
    const deleteRes = await request('/api/sync', {
      method: 'POST',
      body: JSON.stringify({
        deleteTeamId: "team-qa-1"
      })
    });

    const stateAfterDelete = deleteRes.data.state;
    assert(!stateAfterDelete.teams.some(t => t.id === "team-qa-1"), "Team 'team-qa-1' successfully removed");
    assert(!stateAfterDelete.registeredUsers.some(u => u.teamId === "team-qa-1"), "Associated users purged upon team deletion");

    // 9. Test Malformed JSON Handling
    console.log("\n--- TEST GROUP 9: Robustness & Malformed Payload Handling ---");
    const badRes = await fetch(`${BASE_URL}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"invalid_json: unclosed_bracket'
    });
    assert(badRes.status >= 400, "Server safely returns 4xx on malformed JSON body");

    // 10. Test Sanitization of Mock Dummy Teams
    console.log("\n--- TEST GROUP 10: Mock Dummy Team Sanitization ---");
    await request('/api/sync', {
      method: 'POST',
      body: JSON.stringify({
        teams: [
          { id: "team-default", name: "Biro Redaksi Garuda" },
          { id: "team-legit-2", name: "Biro Siswa Merdeka", leaderCode: "MDK12", memberCode: "MDK34" }
        ],
        registeredUsers: [
          { id: "u-dummy", teamId: "team-default", teamName: "Biro Redaksi Garuda", name: "Dummy" },
          { id: "u-legit", teamId: "team-legit-2", teamName: "Biro Siswa Merdeka", name: "Budi" }
        ]
      })
    });

    const sanitizedRes = await request('/api/sync');
    const sanitizedTeams = sanitizedRes.data.state.teams;
    const sanitizedUsers = sanitizedRes.data.state.registeredUsers;
    assert(!sanitizedTeams.some(t => t.id === "team-default"), "team-default safely filtered out from state.teams");
    assert(!sanitizedUsers.some(u => u.teamId === "team-default"), "Mock users filtered out from state.registeredUsers");
    assert(sanitizedTeams.some(t => t.id === "team-legit-2"), "Legitimate team 'team-legit-2' preserved");

  } finally {
    // Kill test server process
    serverProcess.kill();

    // Restore backup classroom_data.json if needed
    if (backupData !== null) {
      fs.writeFileSync(DATA_FILE, backupData, 'utf-8');
    } else {
      try { fs.unlinkSync(DATA_FILE); } catch {}
    }
  }

  console.log("\n==================================================================");
  console.log(`📊 BACKEND QA RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runBackendQA().catch(err => {
  console.error("Backend QA failed with error:", err);
  process.exit(1);
});

const TEAMS_STORAGE_KEY = "redaksi_siswa_teams_v5";
const ACTIVE_TEAM_KEY = "redaksi_siswa_active_team_id_v5";
const CLASSROOM_STAGE_KEY = "redaksi_classroom_stage_v5";
const PRESS_WAR_LOGS_KEY = "redaksi_siswa_war_logs_v5";
const CURRENT_USER_KEY = "redaksi_siswa_current_user_v5";
const GLOBAL_TIMER_KEY = "redaksi_siswa_global_timer_v5";
const SCREEN_FREEZE_KEY = "redaksi_siswa_screen_freeze_v5";
const APP_INITIALIZED_KEY = "redaksi_siswa_initialized_v5";
const ACTIVE_MODULE_KEY = "redaksi_siswa_active_module_v5";

export const defaultTeam = {
  id: "team-default",
  name: "Biro Redaksi Garuda",
  leaderName: "Ahmad Fadilah",
  leaderClass: "8-A",
  leaderCode: "1X88H",
  memberCode: "UD19J",
  members: [
    { name: "Ahmad Fadilah", classInfo: "8-A", role: "Pemimpin Redaksi (Ketua Kelompok)", isLeader: true },
    { name: "Siti Nurhaliza", classInfo: "9-B", role: "Wartawan Investigasi Fakta (5W+1H)", isLeader: false },
    { name: "Budi Santoso", classInfo: "7-C", role: "Redaktur Struktur & Piramida", isLeader: false }
  ],
  avatar: "mascot-1",
  coins: 100,
  inventory: [], // [{ instanceId, cardId, name, emoji, category, targetType }]
  activeShield: false,
  activeDebuffs: [], // ["card_fake_distractor", "card_scramble_clues", "card_deadline_panic"]
  completedStages: [], // [1, 2, 3]
  scores: {},
  stageTimes: {}, // { stage_1: 180, ... }
  stageTimers: {}, // { stage_1: { durationSeconds, isPaused, startedAt } }
  badges: [],
  points: 0,
  createdAt: new Date().toISOString()
};

// Session current user (admin, leader, or member)
export const getCurrentUser = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY) || sessionStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
};

export const setCurrentUser = (user) => {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
      sessionStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch {
    // ignore
  }
};

// Active Module persistence for resilience across refresh / mobile reload
export const getActiveModule = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(ACTIVE_MODULE_KEY) || localStorage.getItem(ACTIVE_MODULE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setActiveModuleInStorage = (moduleData) => {
  if (typeof window === "undefined") return;
  try {
    if (moduleData) {
      sessionStorage.setItem(ACTIVE_MODULE_KEY, JSON.stringify(moduleData));
      localStorage.setItem(ACTIVE_MODULE_KEY, JSON.stringify(moduleData));
    } else {
      sessionStorage.removeItem(ACTIVE_MODULE_KEY);
      localStorage.removeItem(ACTIVE_MODULE_KEY);
    }
  } catch {
    // ignore
  }
};

// Classroom Global Stage Sync (1 = 5W+1H, 2 = Struktur Berita, 3 = Menulis Berita)
export const getClassroomStage = () => {
  if (typeof window === "undefined") return 1;
  try {
    const raw = localStorage.getItem(CLASSROOM_STAGE_KEY);
    return raw ? parseInt(raw, 10) : 1;
  } catch (err) {
    return 1;
  }
};

export const setClassroomStage = (stageNum) => {
  if (typeof window === "undefined") return;
  const num = Math.min(3, Math.max(1, stageNum));
  localStorage.setItem(CLASSROOM_STAGE_KEY, num.toString());
  pushStateToServer({ classroomStage: num });
  addPressWarLog(`GURU / REDAKSI: Tahap ${num} resmi dibuka untuk seluruh kelompok di kelas!`, "neutral");
};

export const advanceClassroomStage = () => {
  const current = getClassroomStage();
  if (current < 3) {
    setClassroomStage(current + 1);
    return current + 1;
  }
  return current;
};

// --- MULTI-DEVICE CLASSROOM SERVER SYNC ENGINE ---
export const pushStateToServer = async (partialState) => {
  if (typeof window === "undefined") return;
  try {
    await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partialState)
    });
  } catch (e) {
    // offline or local-only mode
  }
};

export const applyServerState = (serverState) => {
  if (!serverState || typeof window === "undefined") return;

  // 1. Teams
  if (Array.isArray(serverState.teams) && serverState.teams.length > 0) {
    try {
      const rawLocal = localStorage.getItem(TEAMS_STORAGE_KEY);
      const localTeams = rawLocal ? JSON.parse(rawLocal) : [];
      const mergedMap = new Map();
      
      // Server teams have highest authority
      for (const st of serverState.teams) {
        if (st && st.id) mergedMap.set(st.id, st);
      }
      // Keep any local teams that aren't on server yet
      for (const lt of localTeams) {
        if (lt && lt.id && !mergedMap.has(lt.id)) {
          mergedMap.set(lt.id, lt);
        }
      }
      const merged = Array.from(mergedMap.values());
      localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(merged));
    } catch (e) {
      console.warn("Failed merging teams from server", e);
    }
  }

  // 2. Classroom Stage
  if (serverState.classroomStage !== undefined) {
    localStorage.setItem(CLASSROOM_STAGE_KEY, String(serverState.classroomStage));
  }

  // 3. Screen Freeze
  if (serverState.screenFreeze !== undefined) {
    localStorage.setItem(SCREEN_FREEZE_KEY, JSON.stringify(serverState.screenFreeze));
  }

  // 4. Global Timer
  if (serverState.globalTimer !== undefined) {
    localStorage.setItem(GLOBAL_TIMER_KEY, JSON.stringify(serverState.globalTimer));
  }

  // 5. Press War Logs
  if (Array.isArray(serverState.pressWarLogs) && serverState.pressWarLogs.length > 0) {
    localStorage.setItem(PRESS_WAR_LOGS_KEY, JSON.stringify(serverState.pressWarLogs));
  }

  // 6. Active Classroom Case
  if (serverState.activeCaseId) {
    localStorage.setItem(ACTIVE_CLASSROOM_CASE_KEY, serverState.activeCaseId);
  }
};

export const syncWithServerNow = async () => {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch('/api/sync', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.success && data.state) {
      applyServerState(data.state);
      return data.state;
    }
  } catch (e) {
    // offline
  }
  return null;
};

// Automatic polling across devices every 1.5 seconds
if (typeof window !== "undefined") {
  syncWithServerNow();
  setInterval(() => {
    syncWithServerNow();
  }, 1500);
}

export const getAllTeams = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TEAMS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Failed to read teams", err);
    return [];
  }
};

export const saveAllTeams = (teams) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(teams));
    pushStateToServer({ teams });
  } catch (err) {
    console.error("Failed to save teams", err);
  }
};

export const getTeamById = (teamId) => {
  if (!teamId) return null;
  const teams = getAllTeams();
  return teams.find(t => t.id === teamId) || null;
};

export const getActiveTeam = () => {
  if (typeof window === "undefined") return null;
  try {
    const activeId = localStorage.getItem(ACTIVE_TEAM_KEY) || sessionStorage.getItem(ACTIVE_TEAM_KEY);
    if (!activeId) return null;
    const teams = getAllTeams();
    return teams.find(t => t.id === activeId) || null;
  } catch (err) {
    console.error("Failed to get active team", err);
    return null;
  }
};

export const setActiveTeam = (teamId) => {
  if (typeof window === "undefined") return;
  try {
    if (teamId) {
      localStorage.setItem(ACTIVE_TEAM_KEY, teamId);
      sessionStorage.setItem(ACTIVE_TEAM_KEY, teamId);
    } else {
      localStorage.removeItem(ACTIVE_TEAM_KEY);
      sessionStorage.removeItem(ACTIVE_TEAM_KEY);
    }
  } catch {
    // ignore
  }
};

// Generate 5-character alphanumeric combination (e.g. 1X88H, UD19J)
export const generate5CharCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ123456789";
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const generateTeamCodes = () => {
  const leaderCode = generate5CharCode();
  let memberCode = generate5CharCode();
  while (memberCode === leaderCode) {
    memberCode = generate5CharCode();
  }
  return { leaderCode, memberCode };
};

export const findTeamByLeaderCode = (code) => {
  if (!code) return null;
  const clean = code.trim().toUpperCase();
  const teams = getAllTeams();
  return teams.find(t => (t.leaderCode || "").toUpperCase() === clean) || null;
};

export const findTeamByMemberCode = (code) => {
  if (!code) return null;
  const clean = code.trim().toUpperCase();
  const teams = getAllTeams();
  return teams.find(t => (t.memberCode || "").toUpperCase() === clean) || null;
};

// Unified Single Code Lookup: Finds team and determines whether it's Leader or Member
export const findTeamByAnyCode = (code) => {
  if (!code) return null;
  const clean = code.trim().toUpperCase();
  const cleanNoDash = clean.replace(/[\s\-_]/g, "");
  const teams = getAllTeams();
  
  // 1. Check if matches Leader Code
  const leaderMatch = teams.find(t => {
    const lCode = (t.leaderCode || "").toUpperCase();
    const lCodeNoDash = lCode.replace(/[\s\-_]/g, "");
    return lCode === clean || lCodeNoDash === cleanNoDash;
  });
  if (leaderMatch) {
    return { type: "leader", team: leaderMatch };
  }

  // 2. Check if matches Member Code
  const memberMatch = teams.find(t => {
    const mCode = (t.memberCode || "").toUpperCase();
    const mCodeNoDash = mCode.replace(/[\s\-_]/g, "");
    return mCode === clean || mCodeNoDash === cleanNoDash;
  });
  if (memberMatch) {
    return { type: "member", team: memberMatch };
  }

  // 3. Fallback / Universal Bureau Codes (e.g. TIM1..TIM10, BIRO1..BIRO10, KEL1..KEL10, KODE1..KODE10)
  if (/^(TIM|BIRO|KEL|GROUP|KODE)\s*[-_]?\s*([0-9A-Z]+)$/i.test(clean)) {
    const slotNum = cleanNoDash.replace(/[^0-9]/g, "") || "1";
    const autoTeam = {
      id: `team_auto_${cleanNoDash}`,
      name: `Biro Kelompok #${slotNum}`,
      leaderName: "",
      leaderClass: "",
      leaderCode: clean,
      memberCode: `${clean}M`,
      isPendingSetup: true,
      avatar: "mascot-1",
      members: [],
      coins: 100,
      inventory: [],
      activeShield: false,
      activeDebuffs: [],
      completedStages: [],
      scores: {},
      stageTimes: {},
      stageTimers: {},
      badges: [],
      points: 0,
      createdAt: new Date().toISOString()
    };
    registerOrUpdateTeam(autoTeam);
    return { type: "leader", team: autoTeam };
  }

  return null;
};

// Async version that queries server if not found in local memory
export const findTeamByAnyCodeAsync = async (code) => {
  let match = findTeamByAnyCode(code);
  if (match) return match;

  // Query server sync if not in local storage!
  await syncWithServerNow();
  return findTeamByAnyCode(code);
};

// Admin Fast Minting of Unassigned Group Slot (Admin only gives code, student fills identity)
export const createUnassignedSlotByAdmin = (customLeaderCode, customMemberCode) => {
  const codes = generateTeamCodes();
  const leaderCode = customLeaderCode?.trim().toUpperCase() || codes.leaderCode;
  const memberCode = customMemberCode?.trim().toUpperCase() || codes.memberCode;
  const currentTeams = getAllTeams();
  const slotIndex = currentTeams.length + 1;
  const name = `Biro Kelompok #${slotIndex}`;

  const newTeam = {
    id: "team_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    name,
    leaderName: "",
    leaderClass: "",
    leaderCode,
    memberCode,
    isPendingSetup: true,
    avatar: "mascot-1",
    members: [],
    coins: 100,
    inventory: [],
    activeShield: false,
    activeDebuffs: [],
    completedStages: [],
    scores: {},
    stageTimes: {},
    stageTimers: {},
    badges: [],
    points: 0,
    createdAt: new Date().toISOString()
  };

  const updated = registerOrUpdateTeam(newTeam);
  addPressWarLog(`ADMIN/GURU: Kode Mandat Ketua '${leaderCode}' resmi diterbitkan!`, "neutral");
  return updated;
};

// Admin Batch Minting of Group Slots (e.g. 3 or 5 slots at once)
export const createBatchUnassignedSlotsByAdmin = (count = 3) => {
  const created = [];
  for (let i = 0; i < count; i++) {
    created.push(createUnassignedSlotByAdmin());
  }
  return created;
};

// Activate / Finalize Pending Team Slot by Ketua
export const activatePendingTeam = (teamId, { name, leaderName, leaderClass, avatar }) => {
  const teams = getAllTeams();
  const team = teams.find(t => t.id === teamId);
  if (!team) return { success: false, message: "Biro tidak ditemukan!" };

  const cleanLeader = (leaderName || "").trim();
  const cleanClass = (leaderClass || "").trim();
  const cleanName = (name || "").trim() || (cleanLeader ? `Biro ${cleanLeader}` : team.name);

  if (!cleanLeader) {
    return { success: false, message: "Nama lengkap Ketua (Pemred) wajib diisi!" };
  }
  if (!cleanClass) {
    return { success: false, message: "Kelas Ketua wajib diisi (contoh: 8A atau 9B)!" };
  }

  const leaderMember = {
    name: cleanLeader,
    classInfo: cleanClass,
    role: "Pemimpin Redaksi (Ketua Kelompok)",
    isLeader: true
  };

  const updatedTeam = {
    ...team,
    name: cleanName,
    leaderName: cleanLeader,
    leaderClass: cleanClass,
    avatar: avatar || team.avatar || "mascot-1",
    isPendingSetup: false,
    members: [leaderMember, ...(team.members || []).filter(m => !m.isLeader)]
  };

  registerOrUpdateTeam(updatedTeam, true);
  setActiveTeam(updatedTeam.id);

  const leaderUser = {
    role: "leader",
    name: cleanLeader,
    classInfo: cleanClass,
    memberRole: "Pemimpin Redaksi (Ketua Kelompok)",
    teamId: updatedTeam.id
  };
  setCurrentUser(leaderUser);

  addPressWarLog(`BIRO RESMI DIAKTIFKAN: '${updatedTeam.name}' dipimpin oleh ${cleanLeader} (${cleanClass})! [Kode Anggota: ${updatedTeam.memberCode}]`, "cooperation");
  return { success: true, team: updatedTeam, user: leaderUser };
};

export const createTeamByAdmin = ({ name, leaderName, leaderClass, avatar, customLeaderCode, customMemberCode }) => {
  const codes = generateTeamCodes(name);
  const leaderCode = customLeaderCode?.trim().toUpperCase() || codes.leaderCode;
  const memberCode = customMemberCode?.trim().toUpperCase() || codes.memberCode;

  const newTeam = {
    id: "team_" + Date.now(),
    name: name.trim(),
    leaderName: leaderName.trim(),
    leaderClass: leaderClass.trim(),
    leaderCode,
    memberCode,
    avatar: avatar || "mascot-1",
    members: [
      { 
        name: leaderName.trim(), 
        classInfo: leaderClass.trim(), 
        role: "Pemimpin Redaksi (Ketua Kelompok)",
        isLeader: true 
      }
    ],
    coins: 100,
    inventory: [],
    activeShield: false,
    activeDebuffs: [],
    completedStages: [],
    scores: {},
    stageTimes: {},
    stageTimers: {},
    badges: [],
    points: 0,
    createdAt: new Date().toISOString()
  };

  const updated = registerOrUpdateTeam(newTeam);
  addPressWarLog(`ADMIN/GURU: Biro '${newTeam.name}' resmi dibentuk! Mandat Ketua: ${leaderName} (${leaderClass}) [Kode Ketua: ${leaderCode} | Kode Anggota: ${memberCode}].`, "neutral");
  return updated;
};

export const joinTeamAsMember = (teamId, { name, classInfo, role }) => {
  const teams = getAllTeams();
  const team = teams.find(t => t.id === teamId);
  if (!team) return { success: false, message: "Biro Kelompok tidak ditemukan!" };

  const cleanName = name.trim();
  const cleanClass = classInfo.trim();
  const cleanRole = role || "Wartawan Liputan Lapangan";

  let updatedMembers = [...(team.members || [])];
  const existingIdx = updatedMembers.findIndex(m => (typeof m === "string" ? m : m.name).toLowerCase() === cleanName.toLowerCase());

  if (existingIdx === -1) {
    updatedMembers.push({
      name: cleanName,
      classInfo: cleanClass,
      role: cleanRole,
      isLeader: false
    });
  } else {
    updatedMembers[existingIdx] = {
      name: cleanName,
      classInfo: cleanClass,
      role: cleanRole,
      isLeader: false
    };
  }

  const updatedTeam = {
    ...team,
    members: updatedMembers
  };

  registerOrUpdateTeam(updatedTeam);
  setActiveTeam(updatedTeam.id);

  const userObj = {
    role: "member",
    name: cleanName,
    classInfo: cleanClass,
    memberRole: cleanRole,
    teamId: updatedTeam.id
  };
  setCurrentUser(userObj);

  addPressWarLog(`${cleanName} (${cleanClass}) bergabung ke ${team.name} sebagai ${cleanRole}!`, "cooperation");
  return { success: true, team: updatedTeam, user: userObj };
};

export const isStageCompleted = (team, stageNumOrId) => {
  if (!team || !Array.isArray(team.completedStages)) return false;
  const num = Number(stageNumOrId);
  const str = String(stageNumOrId);
  const stageIds = ["stage-1-5w1h", "stage-2-pyramid", "stage-3-writenews"];
  const mappedId = !isNaN(num) && num >= 1 && num <= 3 ? stageIds[num - 1] : null;

  return team.completedStages.some(s => {
    return s === num || s === str || (mappedId && s === mappedId) || (typeof s === "string" && s.endsWith(`-${num}`));
  });
};

export const registerOrUpdateTeam = (teamData, setActive = false) => {
  const teams = getAllTeams();
  const existingIdx = teams.findIndex(t => t.id === teamData.id);

  let updatedTeam = { ...teamData };
  if (!updatedTeam.id) {
    updatedTeam.id = "team_" + Date.now();
  }
  if (!updatedTeam.leaderCode || !updatedTeam.memberCode) {
    const codes = generateTeamCodes(updatedTeam.name);
    if (!updatedTeam.leaderCode) updatedTeam.leaderCode = codes.leaderCode;
    if (!updatedTeam.memberCode) updatedTeam.memberCode = codes.memberCode;
  }
  if (typeof updatedTeam.coins !== "number") {
    updatedTeam.coins = 100;
  }
  if (!Array.isArray(updatedTeam.inventory)) {
    updatedTeam.inventory = [];
  }
  if (!Array.isArray(updatedTeam.activeDebuffs)) {
    updatedTeam.activeDebuffs = [];
  }
  if (!Array.isArray(updatedTeam.completedStages)) {
    updatedTeam.completedStages = [];
  }

  let newTeams;
  if (existingIdx >= 0) {
    newTeams = [...teams];
    newTeams[existingIdx] = updatedTeam;
  } else {
    newTeams = [...teams, updatedTeam];
  }

  saveAllTeams(newTeams);
  const activeId = typeof window !== "undefined" ? localStorage.getItem(ACTIVE_TEAM_KEY) : null;
  if (setActive || (activeId && activeId === updatedTeam.id)) {
    setActiveTeam(updatedTeam.id);
  }
  return updatedTeam;
};

// --- GROUP STAGE TIME TRACKING (STOPWATCH & AUTO-PAUSE) ---
export const formatDuration = (sec) => {
  if (typeof sec !== "number" || isNaN(sec)) return "00:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
};

export const getTeamStageTimer = (team, stageNumber) => {
  if (!team) return { seconds: 0, formatted: "00:00", isRunning: false, isPaused: false, isCompleted: false };

  // 1. If stage is already completed -> Locked & PAUSED!
  const finalTime = team.stageTimes?.[`stage_${stageNumber}`];
  if (typeof finalTime === "number" || isStageCompleted(team, stageNumber)) {
    const sec = typeof finalTime === "number" ? finalTime : 0;
    return {
      seconds: sec,
      formatted: formatDuration(sec),
      isRunning: false,
      isPaused: true,
      isCompleted: true
    };
  }

  // 2. If stage timer exists
  const timer = team.stageTimers?.[`stage_${stageNumber}`];
  if (timer) {
    if (timer.isPaused) {
      const sec = timer.durationSeconds || timer.accumulatedSeconds || 0;
      return {
        seconds: sec,
        formatted: formatDuration(sec),
        isRunning: false,
        isPaused: true,
        isCompleted: false
      };
    }

    if (timer.startedAt) {
      const elapsed = Math.round((Date.now() - timer.startedAt) / 1000) + (timer.accumulatedSeconds || 0);
      const sec = Math.max(0, elapsed);
      return {
        seconds: sec,
        formatted: formatDuration(sec),
        isRunning: true,
        isPaused: false,
        isCompleted: false
      };
    }
  }

  // 3. Not started yet
  return {
    seconds: 0,
    formatted: "00:00",
    isRunning: false,
    isPaused: false,
    isCompleted: false
  };
};

export const startOrResumeTeamStageTimer = (teamId, stageNumber) => {
  if (!teamId || !stageNumber) return null;
  const teams = getAllTeams();
  const team = teams.find(t => t.id === teamId);
  if (!team) return null;

  // If already completed this stage, keep paused final time
  if (isStageCompleted(team, stageNumber)) return team;

  const currentTimer = team.stageTimers?.[`stage_${stageNumber}`];
  if (currentTimer && !currentTimer.isPaused && currentTimer.startedAt) {
    // Already running, no need to reset start time
    return team;
  }

  const accumulated = currentTimer ? (currentTimer.accumulatedSeconds || 0) : 0;

  const updatedTeam = {
    ...team,
    stageTimers: {
      ...(team.stageTimers || {}),
      [`stage_${stageNumber}`]: {
        startedAt: Date.now(),
        accumulatedSeconds: accumulated,
        isPaused: false
      }
    }
  };

  registerOrUpdateTeam(updatedTeam, true);
  return updatedTeam;
};

export const pauseTeamStageTimer = (teamId, stageNumber) => {
  if (!teamId || !stageNumber) return null;
  const teams = getAllTeams();
  const team = teams.find(t => t.id === teamId);
  if (!team) return null;

  // If completed, already paused
  if (isStageCompleted(team, stageNumber)) return team;

  const currentTimer = team.stageTimers?.[`stage_${stageNumber}`];
  if (!currentTimer || currentTimer.isPaused) return team;

  const elapsed = currentTimer.startedAt 
    ? Math.round((Date.now() - currentTimer.startedAt) / 1000) + (currentTimer.accumulatedSeconds || 0)
    : (currentTimer.accumulatedSeconds || 0);

  const updatedTeam = {
    ...team,
    stageTimers: {
      ...(team.stageTimers || {}),
      [`stage_${stageNumber}`]: {
        startedAt: null,
        accumulatedSeconds: elapsed,
        durationSeconds: elapsed,
        isPaused: true
      }
    }
  };

  registerOrUpdateTeam(updatedTeam, true);
  return updatedTeam;
};

// When a team finishes a stage (Auto-Pauses timer and locks duration)
export const recordTeamStageCompletion = (stageNumber, score, badgeName, durationSeconds = null) => {
  const activeTeam = getActiveTeam();
  if (!activeTeam) return null;

  const alreadyCompleted = isStageCompleted(activeTeam, stageNumber);
  const completedStages = alreadyCompleted 
    ? activeTeam.completedStages 
    : [...activeTeam.completedStages, stageNumber];

  const badges = (!alreadyCompleted && badgeName)
    ? [...activeTeam.badges, badgeName]
    : activeTeam.badges;

  const earnedCoins = alreadyCompleted ? 50 : 250;
  const points = (activeTeam.points || 0) + (alreadyCompleted ? 20 : 100);
  const coins = (activeTeam.coins || 0) + earnedCoins;

  const scores = {
    ...activeTeam.scores,
    [`stage_${stageNumber}`]: Math.max(score, activeTeam.scores[`stage_${stageNumber}`] || 0)
  };

  // Calculate or lock completion duration
  const existingTimer = activeTeam.stageTimers?.[`stage_${stageNumber}`];
  let finalDuration = durationSeconds;
  if (typeof finalDuration !== "number") {
    if (existingTimer) {
      const elapsed = existingTimer.startedAt 
        ? Math.round((Date.now() - existingTimer.startedAt) / 1000) + (existingTimer.accumulatedSeconds || 0)
        : (existingTimer.accumulatedSeconds || existingTimer.durationSeconds || 0);
      finalDuration = Math.max(1, elapsed);
    } else {
      finalDuration = activeTeam.stageTimes?.[`stage_${stageNumber}`] || 120;
    }
  }

  const stageTimes = {
    ...(activeTeam.stageTimes || {}),
    [`stage_${stageNumber}`]: finalDuration
  };

  const stageTimers = {
    ...(activeTeam.stageTimers || {}),
    [`stage_${stageNumber}`]: {
      durationSeconds: finalDuration,
      isPaused: true,
      completedAt: new Date().toISOString()
    }
  };

  const updatedTeam = {
    ...activeTeam,
    completedStages,
    badges,
    points,
    coins,
    scores,
    stageTimes,
    stageTimers,
    activeShield: false, // Reset perisai ketika tuntas materi
    activeDebuffs: [] // Selesai stage membersihkan debuff
  };

  addPressWarLog(`${activeTeam.name} berhasil menuntaskan Tahap ${stageNumber} dalam ${formatDuration(finalDuration)} (Timer Di-pause)! Memperoleh +${earnedCoins} Koin.`, "success");
  registerOrUpdateTeam(updatedTeam, true);

  // Check if ALL registered teams have finished this stage!
  const allTeams = getAllTeams();
  const currentStage = getClassroomStage();
  if (currentStage === stageNumber && allTeams.length > 0) {
    const allDone = allTeams.every(t => t.id === activeTeam.id ? true : isStageCompleted(t, stageNumber));
    if (allDone && currentStage < 3) {
      // Auto advance to next stage!
      advanceClassroomStage();
      addPressWarLog(`Seluruh kelompok telah menyelesaikan Tahap ${stageNumber}! Melangkah bersama ke Tahap berikutnya!`, "neutral");
    }
  }

  return updatedTeam;
};

// Press Shop Purchases (No money stealing, power-ups and debuffs only)
export const buyShopCard = (teamId, card) => {
  const teams = getAllTeams();
  const team = teams.find(t => t.id === teamId);
  if (!team) return { success: false, message: "Tim tidak ditemukan" };

  if ((team.coins || 0) < card.price) {
    return { success: false, message: "Koin Redaksi tidak cukup untuk membeli kartu ini!" };
  }

  const updatedCoins = team.coins - card.price;
  const newItem = {
    instanceId: "item_" + Date.now(),
    cardId: card.id,
    name: card.name,
    emoji: card.emoji,
    category: card.category,
    summary: card.summary,
    targetType: card.targetType
  };

  const updatedTeam = {
    ...team,
    coins: updatedCoins,
    inventory: [...(team.inventory || []), newItem]
  };

  registerOrUpdateTeam(updatedTeam);
  addPressWarLog(`${team.name} membeli kartu '${card.name}' seharga ${card.price} Koin.`, "neutral");
  return { success: true, team: updatedTeam };
};

// Use Action Card: Power-Up or Debuff (Without reducing other teams' money)
export const useActionCard = (sourceTeamId, itemInstanceId, targetTeamId) => {
  const teams = getAllTeams();
  const sourceTeam = teams.find(t => t.id === sourceTeamId);
  if (!sourceTeam) return { success: false, message: "Tim pengirim tidak ditemukan" };

  const itemIdx = (sourceTeam.inventory || []).findIndex(i => i.instanceId === itemInstanceId);
  if (itemIdx === -1) return { success: false, message: "Kartu tidak ada di inventaris tim!" };

  const item = sourceTeam.inventory[itemIdx];
  const newInventory = sourceTeam.inventory.filter((_, idx) => idx !== itemIdx);

  // 1. Power-Up: Perisai Penjernih Fakta
  if (item.cardId === "card_shield") {
    const updatedSource = {
      ...sourceTeam,
      inventory: newInventory,
      activeShield: true,
      activeDebuffs: [] // Bersihkan semua debuff yang menempel!
    };
    registerOrUpdateTeam(updatedSource);
    addPressWarLog(`${sourceTeam.name} mengaktifkan 'Perisai Penjernih Fakta'! Semua debuff terhapus dan kebal gangguan!`, "defense");
    return { success: true, message: "Perisai aktif! Debuff terhapus dan tim kalian kebal gangguan pada stage ini.", team: updatedSource };
  }

  // 2. Power-Up: Lensa Eliminator / Bocoran Kunci
  if (item.cardId === "card_lens" || item.cardId === "card_editor_hint") {
    const updatedSource = {
      ...sourceTeam,
      inventory: newInventory,
      activePowerup: item.cardId
    };
    registerOrUpdateTeam(updatedSource);
    addPressWarLog(`${sourceTeam.name} mengaktifkan '${item.name}' untuk membantu penyelesaian tugas!`, "cooperation");
    return { success: true, message: `Bantuan aktif: '${item.name}' siap digunakan di lembar tugas!`, team: updatedSource, usedItem: item };
  }

  // 3. Debuff ke Tim Lawan (Injeksi opsi palsu, acak tatanan, atau deadline panic)
  const targetTeam = teams.find(t => t.id === targetTeamId);
  if (!targetTeam) return { success: false, message: "Pilih kelompok rival yang ingin dijadikan target!" };

  // Jika target memiliki perisai, tangkis serangan!
  if (targetTeam.activeShield) {
    const updatedTarget = { ...targetTeam, activeShield: false }; // Perisai pecah setelah menyerap serangan
    registerOrUpdateTeam(updatedTarget);
    const updatedSource = { ...sourceTeam, inventory: newInventory };
    registerOrUpdateTeam(updatedSource);

    addPressWarLog(`Serangan '${item.name}' dari ${sourceTeam.name} DITANGKIS oleh Perisai ${targetTeam.name}!`, "defense");
    return { success: true, message: `Serangan gagal! ${targetTeam.name} memiliki Perisai yang menangkis debuff-mu!`, team: updatedSource };
  }

  // Terapkan debuff ke tim lawan
  const targetDebuffs = [...(targetTeam.activeDebuffs || []), item.cardId];
  const updatedTarget = { ...targetTeam, activeDebuffs: targetDebuffs };
  registerOrUpdateTeam(updatedTarget);

  const updatedSource = { ...sourceTeam, inventory: newInventory };
  registerOrUpdateTeam(updatedSource);

  addPressWarLog(`${sourceTeam.name} mengirim debuff '${item.name}' ke meja kerja ${targetTeam.name}!`, "sabotage");
  return { success: true, message: `Debuff '${item.name}' berhasil diluncurkan ke meja ${targetTeam.name}!`, team: updatedSource };
};

// Transfer Koin Antar-Kelompok (Murni bantuan)
export const transferTeamCoins = (sourceTeamId, targetTeamId, amount) => {
  const teams = getAllTeams();
  const source = teams.find(t => t.id === sourceTeamId);
  const target = teams.find(t => t.id === targetTeamId);

  if (!source || !target) return { success: false, message: "Tim tidak ditemukan!" };
  if (source.id === target.id) return { success: false, message: "Tidak bisa mentransfer ke tim sendiri!" };

  const parsedAmount = parseInt(amount, 10);
  if (isNaN(parsedAmount) || parsedAmount <= 0) return { success: false, message: "Jumlah koin tidak valid!" };
  if ((source.coins || 0) < parsedAmount) return { success: false, message: "Koin kas timmu tidak cukup!" };

  const updatedSource = { ...source, coins: source.coins - parsedAmount };
  const updatedTarget = { ...target, coins: (target.coins || 0) + parsedAmount };

  registerOrUpdateTeam(updatedTarget);
  const finalSource = registerOrUpdateTeam(updatedSource);

  addPressWarLog(`${source.name} mentransfer bantuan ${parsedAmount} Koin Redaksi ke ${target.name}!`, "cooperation");
  return { success: true, message: `Berhasil mentransfer ${parsedAmount} koin ke ${target.name}!`, team: finalSource };
};

export const getPressWarLogs = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PRESS_WAR_LOGS_KEY);
    return raw ? JSON.parse(raw) : [
      { id: "log-0", text: "Kelas Jurnalistik Dimulai. Semua kelompok berada di Tahap 1 (5W+1H)!", type: "neutral", time: "Baru saja" }
    ];
  } catch (err) {
    return [];
  }
};

export const addPressWarLog = (text, type = "neutral") => {
  if (typeof window === "undefined") return;
  try {
    const cleanText = (text || "").replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA00}-\u{1FAFF}]/gu, '').trim();
    const current = getPressWarLogs();
    const newLog = {
      id: "log_" + Date.now(),
      text: cleanText,
      type,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const updated = [newLog, ...current.slice(0, 19)];
    localStorage.setItem(PRESS_WAR_LOGS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to add war log", err);
  }
};

export const logoutTeam = () => {
  setActiveTeam(null);
  setCurrentUser(null);
};

export const resetClassroomProgress = () => {
  setClassroomStage(1);
  const teams = getAllTeams();
  const resetTeams = teams.map(t => ({
    ...t,
    coins: 100,
    inventory: [],
    activeShield: false,
    activeDebuffs: [],
    completedStages: [],
    scores: {},
    stageTimes: {},
    stageTimers: {},
    badges: [],
    points: 0
  }));
  saveAllTeams(resetTeams);
  return resetTeams;
};

export const initDefaultTeamIfNeeded = () => {
  if (typeof window === "undefined") return;
  try {
    const isInit = localStorage.getItem(APP_INITIALIZED_KEY);
    if (!isInit) {
      const existing = getAllTeams();
      if (existing.length === 0) {
        registerOrUpdateTeam(defaultTeam);
      }
      localStorage.setItem(APP_INITIALIZED_KEY, "true");
    }

    // Auto-migrate starting teams from 500 to 100 if unstarted
    const migrationCoinsKey = "jurnal66_coins_100_migrated_v2";
    if (!localStorage.getItem(migrationCoinsKey)) {
      const existing = getAllTeams();
      let changed = false;
      const updated = existing.map(t => {
        if (t.coins === 500 && (t.completedStages || []).length === 0 && (t.inventory || []).length === 0) {
          changed = true;
          return { ...t, coins: 100 };
        }
        return t;
      });
      if (changed) {
        saveAllTeams(updated);
        const activeId = localStorage.getItem(ACTIVE_TEAM_KEY);
        const active = updated.find(t => t.id === activeId);
        if (active) {
          localStorage.setItem("jurnal66_current_team", JSON.stringify(active));
          localStorage.setItem("redaksi_siswa_current_team", JSON.stringify(active));
        }
      }
      localStorage.setItem(migrationCoinsKey, "true");
    }
  } catch {
    // ignore
  }
};

// --- COMPREHENSIVE ADMIN AUTHORITIES ---

// Admin / Ketua Delete or Disband a team
export const adminDeleteTeam = (teamId) => {
  const teams = getAllTeams();
  const team = teams.find(t => t.id === teamId);
  const filtered = teams.filter(t => t.id !== teamId);
  saveAllTeams(filtered);
  const activeId = localStorage.getItem(ACTIVE_TEAM_KEY);
  if (activeId === teamId) {
    setActiveTeam(null);
    setCurrentUser(null);
  }
  if (team) {
    addPressWarLog(`Biro '${team.name}' telah resmi dibubarkan.`, "neutral");
  }
  return filtered;
};

export const disbandTeam = adminDeleteTeam;

// Admin Regenerate 5-character codes for a team
export const adminRegenerateCodes = (teamId) => {
  const teams = getAllTeams();
  const team = teams.find(t => t.id === teamId);
  if (!team) return null;
  const newCodes = generateTeamCodes();
  const updatedTeam = {
    ...team,
    leaderCode: newCodes.leaderCode,
    memberCode: newCodes.memberCode
  };
  registerOrUpdateTeam(updatedTeam);
  addPressWarLog(`GURU: Kode 5-karakter baru diterbitkan untuk ${team.name} (Ketua: ${newCodes.leaderCode} | Anggota: ${newCodes.memberCode}).`, "neutral");
  return updatedTeam;
};

// Admin Adjust Coins (Grant stipend or penalize)
export const adminAdjustCoins = (teamId, amountDelta, reason = "Penyesuaian Anggaran Guru") => {
  const teams = getAllTeams();
  const team = teams.find(t => t.id === teamId);
  if (!team) return null;
  const newCoins = Math.max(0, (team.coins || 0) + amountDelta);
  const updatedTeam = {
    ...team,
    coins: newCoins
  };
  registerOrUpdateTeam(updatedTeam);
  const sign = amountDelta >= 0 ? `+${amountDelta}` : `${amountDelta}`;
  addPressWarLog(`GURU: ${sign} Koin Redaksi untuk ${team.name} (${reason}). Kas saat ini: ${newCoins} Koin.`, amountDelta >= 0 ? "cooperation" : "sabotage");
  return updatedTeam;
};

// Admin Update Team Details (Name, Leader Name, Leader Class, Leader Code, Member Code)
export const adminUpdateTeamDetails = (teamId, { name, leaderName, leaderClass, leaderCode, memberCode, assignedVariationIndex }) => {
  const teams = getAllTeams();
  const team = teams.find(t => t.id === teamId);
  if (!team) return null;

  const oldName = team.name;
  const newName = name?.trim() || team.name;
  const newLeaderName = leaderName !== undefined ? leaderName.trim() : team.leaderName;
  const newLeaderClass = leaderClass !== undefined ? leaderClass.trim() : team.leaderClass;
  const newLeaderCode = leaderCode !== undefined && leaderCode.trim() ? leaderCode.trim().toUpperCase() : team.leaderCode;
  const newMemberCode = memberCode !== undefined && memberCode.trim() ? memberCode.trim().toUpperCase() : team.memberCode;
  const newVarIndex = assignedVariationIndex !== undefined && assignedVariationIndex !== null ? parseInt(assignedVariationIndex, 10) : team.assignedVariationIndex;

  let updatedMembers = [...(team.members || [])];

  // If leaderName changed, ensure member list reflects it
  if (newLeaderName && newLeaderName !== team.leaderName) {
    let leaderFound = false;
    updatedMembers = updatedMembers.map((m, idx) => {
      const isLeader = typeof m === "string" ? idx === 0 : m.isLeader;
      if (isLeader) {
        leaderFound = true;
        return {
          ...(typeof m === "string" ? { name: m, classInfo: newLeaderClass || "-" } : m),
          name: newLeaderName,
          classInfo: newLeaderClass || (typeof m === "string" ? "-" : m.classInfo),
          isLeader: true
        };
      }
      return m;
    });

    if (!leaderFound && updatedMembers.length > 0) {
      const m0 = updatedMembers[0];
      updatedMembers[0] = {
        ...(typeof m0 === "string" ? { name: m0, classInfo: newLeaderClass || "-" } : m0),
        name: newLeaderName,
        classInfo: newLeaderClass || (typeof m0 === "string" ? "-" : m0.classInfo),
        isLeader: true
      };
    } else if (!leaderFound && updatedMembers.length === 0 && newLeaderName) {
      updatedMembers.push({
        name: newLeaderName,
        classInfo: newLeaderClass || "-",
        role: "Pemimpin Redaksi",
        isLeader: true
      });
    }
  } else if (newLeaderClass && newLeaderClass !== team.leaderClass) {
    // If only class changed for leader
    updatedMembers = updatedMembers.map((m, idx) => {
      const isLeader = typeof m === "string" ? idx === 0 : m.isLeader;
      if (isLeader) {
        return {
          ...(typeof m === "string" ? { name: m, role: "Pemimpin Redaksi" } : m),
          classInfo: newLeaderClass
        };
      }
      return m;
    });
  }

  const shouldActivate = team.isPendingSetup && newName && newLeaderName;

  const updatedTeam = {
    ...team,
    name: newName,
    leaderName: newLeaderName,
    leaderClass: newLeaderClass,
    leaderCode: newLeaderCode,
    memberCode: newMemberCode,
    assignedVariationIndex: newVarIndex !== undefined ? newVarIndex : team.assignedVariationIndex,
    isPendingSetup: shouldActivate ? false : team.isPendingSetup,
    members: updatedMembers
  };

  registerOrUpdateTeam(updatedTeam);

  // Sync activeTeam and currentUser if this team is active
  const activeTeam = getActiveTeam();
  if (activeTeam && activeTeam.id === teamId) {
    safeSetItem(ACTIVE_TEAM_KEY, JSON.stringify(updatedTeam));
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.isLeader) {
      setCurrentUser({
        ...currentUser,
        name: newLeaderName || currentUser.name,
        classInfo: newLeaderClass || currentUser.classInfo
      });
    }
  }

  addPressWarLog(`GURU: Data biro '${oldName}' diperbarui menjadi '${newName}' (Ketua: ${newLeaderName || '-'}, Kelas: ${newLeaderClass || '-'}).`, "neutral");
  return updatedTeam;
};

// Admin Update Member Details (Name, Class, Role, isLeader)
export const adminUpdateMemberDetails = (teamId, memberIndexOrOldName, { name, classInfo, role, isLeader }) => {
  const teams = getAllTeams();
  const team = teams.find(t => t.id === teamId);
  if (!team) return null;

  const newName = name?.trim();
  const newClass = classInfo?.trim() || "-";
  const newRole = role || "Wartawan Liputan";

  let oldTargetName = typeof memberIndexOrOldName === "string" ? memberIndexOrOldName : "";

  let updatedMembers = (team.members || []).map((m, idx) => {
    const mName = typeof m === "string" ? m : m.name;
    const isTarget = typeof memberIndexOrOldName === "number" 
      ? idx === memberIndexOrOldName 
      : mName.toLowerCase() === memberIndexOrOldName.toLowerCase();

    if (isTarget) {
      if (!oldTargetName) oldTargetName = mName;
      return {
        name: newName || mName,
        classInfo: newClass,
        role: newRole,
        isLeader: isLeader !== undefined ? isLeader : (typeof m === "string" ? idx === 0 : !!m.isLeader)
      };
    }

    if (isLeader) {
      // Demote others if promoting this target
      return {
        ...(typeof m === "string" ? { name: m, classInfo: "-", role: "Wartawan Liputan" } : m),
        isLeader: false
      };
    }

    return typeof m === "string" ? { name: m, classInfo: "-", role: "Wartawan Liputan", isLeader: idx === 0 } : m;
  });

  const finalTargetName = newName || oldTargetName;
  const wasLeader = team.leaderName && oldTargetName && team.leaderName.toLowerCase() === oldTargetName.toLowerCase();
  let updatedLeaderName = team.leaderName;
  let updatedLeaderClass = team.leaderClass;

  if (isLeader || wasLeader) {
    updatedLeaderName = finalTargetName;
    updatedLeaderClass = newClass;
  }

  const updatedTeam = {
    ...team,
    leaderName: updatedLeaderName,
    leaderClass: updatedLeaderClass,
    members: updatedMembers
  };

  registerOrUpdateTeam(updatedTeam);

  // Sync activeTeam and currentUser if active
  const activeTeam = getActiveTeam();
  if (activeTeam && activeTeam.id === teamId) {
    safeSetItem(ACTIVE_TEAM_KEY, JSON.stringify(updatedTeam));
    const currentUser = getCurrentUser();
    if (currentUser && oldTargetName && currentUser.name?.toLowerCase() === oldTargetName.toLowerCase()) {
      setCurrentUser({
        ...currentUser,
        name: finalTargetName,
        classInfo: newClass,
        role: newRole,
        isLeader: isLeader !== undefined ? isLeader : currentUser.isLeader
      });
    }
  }

  addPressWarLog(`GURU: Anggota '${oldTargetName}' di ${team.name} diperbarui menjadi '${finalTargetName}' (${newClass}) - ${newRole}${isLeader ? " [KETUA]" : ""}.`, "neutral");
  return updatedTeam;
};

// Admin Update Member Role or designate leader
export const adminUpdateMemberRole = (teamId, memberName, newRole, isLeader = false) => {
  const teams = getAllTeams();
  const team = teams.find(t => t.id === teamId);
  if (!team) return null;
  const updatedMembers = (team.members || []).map(m => {
    const mName = typeof m === "string" ? m : m.name;
    if (mName.toLowerCase() === memberName.toLowerCase()) {
      return {
        ...(typeof m === "string" ? { name: m, classInfo: "-" } : m),
        role: newRole,
        isLeader: isLeader || false
      };
    }
    if (isLeader) {
      return {
        ...(typeof m === "string" ? { name: m, classInfo: "-" } : m),
        isLeader: false
      };
    }
    return m;
  });

  const updatedTeam = {
    ...team,
    leaderName: isLeader ? memberName : team.leaderName,
    members: updatedMembers
  };
  registerOrUpdateTeam(updatedTeam);
  addPressWarLog(`GURU: Peran redaksi ${memberName} di ${team.name} diubah menjadi '${newRole}'.`, "neutral");
  return updatedTeam;
};

// Admin Remove a member from a team
export const adminRemoveMember = (teamId, memberName) => {
  const teams = getAllTeams();
  const team = teams.find(t => t.id === teamId);
  if (!team) return null;
  const updatedMembers = (team.members || []).filter(m => {
    const mName = typeof m === "string" ? m : m.name;
    return mName.toLowerCase() !== memberName.toLowerCase();
  });

  let newLeaderName = team.leaderName;
  let newLeaderClass = team.leaderClass;
  if (team.leaderName && team.leaderName.toLowerCase() === memberName.toLowerCase()) {
    if (updatedMembers.length > 0) {
      const first = updatedMembers[0];
      newLeaderName = typeof first === "string" ? first : first.name;
      newLeaderClass = typeof first === "string" ? "-" : (first.classInfo || "-");
      updatedMembers[0] = {
        ...(typeof first === "string" ? { name: first, classInfo: "-", role: "Pemimpin Redaksi" } : first),
        isLeader: true
      };
    } else {
      newLeaderName = "";
      newLeaderClass = "";
    }
  }

  const updatedTeam = {
    ...team,
    leaderName: newLeaderName,
    leaderClass: newLeaderClass,
    members: updatedMembers
  };
  registerOrUpdateTeam(updatedTeam);

  // Also sync activeTeam and currentUser if this member was active
  const activeTeam = getActiveTeam();
  if (activeTeam && activeTeam.id === teamId) {
    safeSetItem(ACTIVE_TEAM_KEY, JSON.stringify(updatedTeam));
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.name?.toLowerCase() === memberName.toLowerCase()) {
      safeRemoveItem(CURRENT_USER_KEY);
      safeRemoveItem(ACTIVE_TEAM_KEY);
    }
  }

  addPressWarLog(`GURU: ${memberName} dikeluarkan dari biro ${team.name}.`, "neutral");
  return updatedTeam;
};

// Admin Set Stage Override for a specific team
export const adminSetTeamStage = (teamId, stageNum) => {
  const teams = getAllTeams();
  const team = teams.find(t => t.id === teamId);
  if (!team) return null;
  let completed = [];
  for (let s = 1; s < stageNum; s++) {
    completed.push(s);
  }
  const updatedTeam = {
    ...team,
    completedStages: completed
  };
  registerOrUpdateTeam(updatedTeam);
  addPressWarLog(`GURU: Progres materi ${team.name} disesuaikan ke Tahap ${Math.min(3, stageNum)}.`, "neutral");
  return updatedTeam;
};

// Admin Clear Debuffs for a team
export const adminClearDebuffs = (teamId) => {
  const teams = getAllTeams();
  const team = teams.find(t => t.id === teamId);
  if (!team) return null;
  const updatedTeam = {
    ...team,
    activeDebuffs: [],
    activeShield: true
  };
  registerOrUpdateTeam(updatedTeam);
  addPressWarLog(`GURU: Pemutihan sanksi & debuff untuk ${team.name}! Diberikan Perisai Hak Jawab.`, "defense");
  return updatedTeam;
};

// Admin Save Teacher Feedback Notes per team
export const adminSaveTeamNotes = (teamId, notes) => {
  const teams = getAllTeams();
  const team = teams.find(t => t.id === teamId);
  if (!team) return null;
  const updatedTeam = {
    ...team,
    teacherNotes: notes
  };
  registerOrUpdateTeam(updatedTeam);
  return updatedTeam;
};

// Admin Send Global Priority Broadcast
export const adminBroadcastAlert = (message, priority = "info") => {
  const prefix = priority === "breaking" ? "BREAKING NEWS GURU" : priority === "urgent" ? "PERINGATAN GURU" : "PENGUMUMAN GURU";
  addPressWarLog(`${prefix}: ${message}`, priority === "urgent" || priority === "breaking" ? "sabotage" : "neutral");
};

// Global Exam / Session Timer
export const getGlobalTimer = () => {
  if (typeof window === "undefined") return { isRunning: false, remainingSeconds: 0, durationMinutes: 30 };
  try {
    const raw = localStorage.getItem(GLOBAL_TIMER_KEY);
    if (!raw) return { isRunning: false, remainingSeconds: 0, durationMinutes: 30 };
    const parsed = JSON.parse(raw);
    if (!parsed.isRunning) return parsed;
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((parsed.endTime - now) / 1000));
    return {
      ...parsed,
      remainingSeconds: remaining,
      isExpired: remaining <= 0
    };
  } catch {
    return { isRunning: false, remainingSeconds: 0, durationMinutes: 30 };
  }
};

export const startGlobalTimer = (durationMinutes = 30) => {
  const now = Date.now();
  const endTime = now + durationMinutes * 60 * 1000;
  const state = {
    isRunning: true,
    durationMinutes,
    startTime: now,
    endTime,
    remainingSeconds: durationMinutes * 60
  };
  try {
    localStorage.setItem(GLOBAL_TIMER_KEY, JSON.stringify(state));
    pushStateToServer({ globalTimer: state });
  } catch {
    // ignore
  }
  addPressWarLog(`GURU: Timer Sesi Redaksi dimulai! Alokasi waktu: ${durationMinutes} Menit.`, "neutral");
  return state;
};

export const stopGlobalTimer = () => {
  const state = { isRunning: false, remainingSeconds: 0, durationMinutes: 30 };
  try {
    localStorage.setItem(GLOBAL_TIMER_KEY, JSON.stringify(state));
    pushStateToServer({ globalTimer: state });
  } catch {
    // ignore
  }
  addPressWarLog(`GURU: Timer Sesi Redaksi dihentikan/direset oleh Guru Pengampu.`, "neutral");
  return state;
};

export const addGlobalTimerMinutes = (extraMinutes = 5) => {
  const current = getGlobalTimer();
  const now = Date.now();
  const baseEnd = current.isRunning && current.endTime > now ? current.endTime : now;
  const newEndTime = baseEnd + extraMinutes * 60 * 1000;
  const updated = {
    isRunning: true,
    durationMinutes: (current.durationMinutes || 0) + extraMinutes,
    endTime: newEndTime,
    remainingSeconds: Math.max(0, Math.floor((newEndTime - now) / 1000))
  };
  try {
    localStorage.setItem(GLOBAL_TIMER_KEY, JSON.stringify(updated));
    pushStateToServer({ globalTimer: updated });
  } catch {
    // ignore
  }
  addPressWarLog(`GURU: Perpanjangan waktu liputan +${extraMinutes} Menit diberikan untuk seluruh tim!`, "defense");
  return updated;
};

// Global Screen Freeze / Focus Mode ("Pena Diturunkan!")
export const getScreenFreeze = () => {
  if (typeof window === "undefined") return { isFrozen: false, reason: "" };
  try {
    const raw = localStorage.getItem(SCREEN_FREEZE_KEY);
    return raw ? JSON.parse(raw) : { isFrozen: false, reason: "" };
  } catch {
    return { isFrozen: false, reason: "" };
  }
};

export const setScreenFreeze = (isFrozen, reason = "Perhatian ke Dewan Guru di Depan Kelas!") => {
  const state = {
    isFrozen,
    reason,
    timestamp: Date.now()
  };
  try {
    localStorage.setItem(SCREEN_FREEZE_KEY, JSON.stringify(state));
    pushStateToServer({ screenFreeze: state });
  } catch {
    // ignore
  }
  if (isFrozen) {
    addPressWarLog(`GURU: MODE PERHATIAN DIAKTIFKAN - Seluruh siswa harap perhatikan instruksi Guru di depan kelas!`, "sabotage");
  } else {
    addPressWarLog(`GURU: Mode Perhatian selesai. Silakan lanjutkan simulasi penulisan berita!`, "cooperation");
  }
  return state;
};

// Qualitative Rubric Grading for Journalism
export const adminSaveRubricGrade = (teamId, rubricData) => {
  const teams = getAllTeams();
  const team = teams.find(t => t.id === teamId);
  if (!team) return null;

  const factAccuracy = Math.min(100, Math.max(0, Number(rubricData.factAccuracy) || 80));
  const pyramidStructure = Math.min(100, Math.max(0, Number(rubricData.pyramidStructure) || 80));
  const journalismLanguage = Math.min(100, Math.max(0, Number(rubricData.journalismLanguage) || 80));
  const average = Math.round((factAccuracy + pyramidStructure + journalismLanguage) / 3);

  const updatedTeam = {
    ...team,
    rubricScores: {
      factAccuracy,
      pyramidStructure,
      journalismLanguage,
      total: average,
      gradedAt: new Date().toISOString()
    },
    teacherNotes: rubricData.notes !== undefined ? rubricData.notes : (team.teacherNotes || "")
  };

  registerOrUpdateTeam(updatedTeam);
  addPressWarLog(`GURU: Penilaian Rubrik Jurnalistik untuk ${team.name} telah diunggah (Rata-rata: ${average}/100).`, "neutral");
  return updatedTeam;
};

// Gradebook CSV Export
export const generateGradebookCSV = () => {
  const teams = getAllTeams();
  const headers = [
    "No",
    "Nama Biro Redaksi",
    "Kode Mandat Ketua",
    "Kode Anggota Tim",
    "Pemimpin Redaksi (Ketua)",
    "Kelas Ketua",
    "Jumlah Anggota",
    "Daftar Anggota & Peran",
    "Tahap 1 (5W+1H)",
    "Waktu Tahap 1",
    "Tahap 2 (Piramida)",
    "Waktu Tahap 2",
    "Tahap 3 (Menulis Berita)",
    "Waktu Tahap 3",
    "Total Waktu Pengerjaan",
    "Total Koin Kas",
    "Rubrik Akurasi Fakta",
    "Rubrik Struktur",
    "Rubrik Bahasa",
    "Rata-Rata Rubrik Guru",
    "Catatan Evaluasi Guru"
  ];

  const escapeCSV = (val) => {
    if (val === undefined || val === null) return '""';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = teams.map((team, idx) => {
    const memberStr = (team.members || [])
      .map(m => typeof m === "string" ? m : `${m.name} [${m.role || "Wartawan"}] (${m.classInfo || "-"})`)
      .join("; ");

    const s1 = isStageCompleted(team, 1) ? (team.scores?.stage_1 || 100) : (team.scores?.stage_1 || "Belum");
    const s2 = isStageCompleted(team, 2) ? (team.scores?.stage_2 || 100) : (team.scores?.stage_2 || "Belum");
    const s3 = isStageCompleted(team, 3) ? (team.scores?.stage_3 || 100) : (team.scores?.stage_3 || "Belum");

    const t1 = team.stageTimes?.stage_1 ? formatDuration(team.stageTimes.stage_1) : (isStageCompleted(team, 1) ? "Selesai" : "Belum");
    const t2 = team.stageTimes?.stage_2 ? formatDuration(team.stageTimes.stage_2) : (isStageCompleted(team, 2) ? "Selesai" : "Belum");
    const t3 = team.stageTimes?.stage_3 ? formatDuration(team.stageTimes.stage_3) : (isStageCompleted(team, 3) ? "Selesai" : "Belum");
    const totalSec = (team.stageTimes?.stage_1 || 0) + (team.stageTimes?.stage_2 || 0) + (team.stageTimes?.stage_3 || 0);
    const totalTimeStr = totalSec > 0 ? formatDuration(totalSec) : "-";

    const r = team.rubricScores || {};

    return [
      idx + 1,
      escapeCSV(team.name),
      escapeCSV(team.leaderCode || "-"),
      escapeCSV(team.memberCode || "-"),
      escapeCSV(team.leaderName || "-"),
      escapeCSV(team.leaderClass || "-"),
      team.members?.length || 0,
      escapeCSV(memberStr),
      escapeCSV(s1),
      escapeCSV(t1),
      escapeCSV(s2),
      escapeCSV(t2),
      escapeCSV(s3),
      escapeCSV(t3),
      escapeCSV(totalTimeStr),
      team.coins || 0,
      r.factAccuracy ?? "-",
      r.pyramidStructure ?? "-",
      r.journalismLanguage ?? "-",
      r.total ?? "-",
      escapeCSV(team.teacherNotes || "-")
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\r\n");
};

// =========================================================================
// INTERACTIVE WITNESS INTERVIEWS & POCKET PRESS NOTEBOOK ENGINE
// =========================================================================
export const ACTIVE_CLASSROOM_CASE_KEY = "redaksi_classroom_active_case_v5";
export const CUSTOM_CASES_KEY = "redaksi_classroom_custom_cases_v5";

export const DEFAULT_SCHOOL_CASES = [
  {
    id: "case_lab_projector",
    title: "Misteri Rusaknya Proyektor Lab Komputer Jelang Gladi ANBK",
    category: "Investigasi Fasilitas & Sarana",
    location: "Laboratorium Komputer Lt. 2",
    date: "Selasa Pagi, 07.15 WIB",
    summary: "Sehari sebelum gladi Asesmen Nasional Berbasis Komputer (ANBK), proyektor utama Lab Komputer ditemukan pecah kacanya dan lempengan plafon ambrol di lantai. Pihak sekolah bergerak cepat agar jadwal simulasi tidak tertunda.",
    headlineHint: "Kucing Liar Jebol Plafon Lab Komputer, Gladi ANBK Tetap Berjalan Tepat Waktu",
    icon: "computer",
    witnesses: [
      {
        id: "witness_satpam",
        name: "Pak Joko Susilo",
        role: "Kepala Keamanan & Satpam Sekolah",
        avatar: "security",
        personality: "Tegas, disiplin tinggi, tersinggung jika dituduh lalai saat tugas malam namun sangat kooperatif jika ditanya secara sopan dan teratur.",
        initialTrust: 75,
        questions: [
          {
            id: "q1",
            text: "Selamat pagi Pak Joko. Bagaimana pantauan pos satpam saat patroli malam tadi di sekitar koridor Lab Komputer?",
            answer: "Selamat pagi dik. Sekitar jam 19.30 malam saat saya kontrol keliling di koridor barat, saya melihat ada bayangan melompat di ventilasi atas lab. Rupanya ada kucing liar menerobos masuk mengejar tikus di atas plafon gipsum lab!",
            trustDelta: 15,
            revealsFact: "Jam 19.30 malam seekor kucing liar menerobos ventilasi mengejar tikus di atas plafon gipsum lab komputer.",
            isScoop: false
          },
          {
            id: "q2",
            text: "Apakah ada pintu atau jendela laboratorium yang mengalami kerusakan akibat dibobol paksa dari luar?",
            answer: "Sama sekali tidak ada gembok yang rusak! Kunci pintu masih utuh dan jendela terkunci rapat berteralis besi. Kerusakan murni berasal dari dalam ruangan akibat plafon ambrol.",
            trustDelta: 15,
            revealsFact: "Pintu dan teralis jendela lab komputer terkunci rapat tanpa tanda pembobolan gembok dari luar.",
            isScoop: true,
            scoopQuote: "\"Tidak ada tanda pembobolan gembok dari luar. Pintu dan jendela lab terkunci rapat berteralis besi saat patroli malam,\" tegas Pak Joko, Satpam Sekolah."
          },
          {
            id: "q3",
            text: "Bapak pasti tertidur pulas ya di pos jaga sampai ada fasilitas sekolah yang rusak begini?",
            answer: "Jaga sopan santunmu, anak muda! Saya berkeliling setiap 30 menit sesuai buku mutasi piket dinas! Wawancara ini saya hentikan jika bicaramu menuduh tanpa bukti!",
            trustDelta: -35,
            revealsFact: null,
            isScoop: false
          }
        ]
      },
      {
        id: "witness_guru_tik",
        name: "Ibu Ratna Paramitha, S.Kom",
        role: "Guru Pembina TIK & Penanggung Jawab Lab",
        avatar: "teacher",
        personality: "Cemas namun berorientasi solusi cepat, fokus penuh pada keselamatan siswa dan kelancaran gladi bersih ANBK besok pagi.",
        initialTrust: 80,
        questions: [
          {
            id: "q1",
            text: "Bu Ratna, bagaimana kronologi saat Ibu pertama kali membuka lab dan menemukan proyektor di lantai?",
            answer: "Pagi jam 06.30 saat saya membuka pintu lab, serpihan lempengan gipsum plafon sudah berhamburan tepat di atas meja proyektor. Ternyata proyektor tertimpa gipsum yang jebol dari langit-langit, bukan dibanting atau disabotase seseorang!",
            trustDelta: 10,
            revealsFact: "Proyektor rusak akibat tertimpa lempengan gipsum plafon yang ambrol dari langit-langit pada malam hari.",
            isScoop: false
          },
          {
            id: "q2",
            text: "Apakah kerusakan fasilitas ini akan membatalkan gladi bersih Asesmen Nasional (ANBK) besok pagi?",
            answer: "Alhamdulillah tidak batal! Dinas Pendidikan sudah mengirimkan proyektor pengganti jam 08.00 pagi tadi, dan teknisi sudah selesai memasangnya. Gladi bersih ANBK besok dipastikan berjalan tepat waktu!",
            trustDelta: 15,
            revealsFact: "Gladi bersih ANBK tetap berjalan tepat waktu karena proyektor cadangan dari Dinas Pendidikan telah terpasang rapi.",
            isScoop: true,
            scoopQuote: "\"Gladi bersih ANBK dipastikan berjalan tepat waktu tanpa penundaan karena proyektor cadangan dari Dinas Pendidikan telah terpasang rapi pagi ini,\" jelas Ibu Ratna, Pembina Lab TIK."
          },
          {
            id: "q3",
            text: "Kenapa pihak guru begitu ceroboh membiarkan plafon lab yang rapuh tanpa diperiksa sejak minggu lalu?",
            answer: "Laporan perbaikan plafon sudah diajukan resmi ke bagian sarpras bulan lalu, namun masih antre teknisi. Jangan asal bicara ceroboh tanpa memahami prosedur pemeliharaan sekolah!",
            trustDelta: -25,
            revealsFact: null,
            isScoop: false
          }
        ]
      },
      {
        id: "witness_siswa_kevin",
        name: "Kevin Pratama",
        role: "Siswa Kelas 9 & Pengguna Terakhir Lab",
        avatar: "student",
        personality: "Gelisah dan takut dicap perusak fasilitas oleh teman sekelas, namun bersedia berbicara jujur jika didekati dengan ramah.",
        initialTrust: 70,
        questions: [
          {
            id: "q1",
            text: "Hai Kevin, santai ya. Kami hanya ingin mengonfirmasi apa saja aktivitas di lab kemarin sore?",
            answer: "Terima kasih sudah ramah... Kemarin sore sampai jam 16.00 saya cuma latihan simulasi mengetik ANBK bersama 2 rekan OSIS lainnya. Waktu kami pulang, proyektor masih tergantung rapi di langit-langit lab.",
            trustDelta: 15,
            revealsFact: "Kevin dan rekan OSIS meninggalkan lab pukul 16.00 sore dalam keadaan proyektor masih utuh tergantung.",
            isScoop: false
          },
          {
            id: "q2",
            text: "Kepada siapa kunci lab kamu serahkan setelah selesai latihan kemarin sore?",
            answer: "Kuncinya langsung saya titipkan ke meja piket guru dan dicatat oleh guru piket Pak Deni jam 16.05 sore. Ada buku ekspedisi tanda terimanya kok, jadi saya tidak ada di lab saat malam hari!",
            trustDelta: 15,
            revealsFact: "Kunci lab diserahkan resmi ke meja guru piket pukul 16.05 sore dan tercatat di buku ekspedisi.",
            isScoop: true,
            scoopQuote: "\"Kunci lab sudah saya serahkan resmi ke meja guru piket pukul 16.05 sore dan tercatat di buku ekspedisi bersama dua saksi teman OSIS,\" ujar Kevin Pratama, siswa pengguna lab terakhir."
          },
          {
            id: "q3",
            text: "Ngaku saja Kevin, kamu kan yang sengaja menarik kabelnya sampai jatuh karena kesal komputermu lemot?",
            answer: "Tuduhanmu jahat sekali! Aku nggak mau diwawancarai lagi sama tim kalian! Aku mau lapor ke wali kelas sekarang juga!",
            trustDelta: -40,
            revealsFact: null,
            isScoop: false
          }
        ]
      }
    ]
  },
  {
    id: "case_larangan_hp",
    title: "Polemik Aturan Baru Larangan Membawa Gawai Saat Jam Istirahat",
    category: "Kebijakan & Kehidupan Sekolah",
    location: "Kantin & Selasar Mading Sekolah",
    date: "Kamis Siang, 10.30 WIB",
    summary: "Aturan baru larangan menyalakan HP selama jam sekolah memicu perdebatan sengit antara pihak kesiswaan dan perwakilan organisasi siswa. Siswa beradu argumen antara interaksi sosial tatap muka versus kebutuhan koordinasi digital.",
    headlineHint: "Aturan Gawai Diperketat, OSIS Usulkan Solusi Loker Digital Khusus",
    icon: "phone",
    witnesses: [
      {
        id: "witness_kesiswaan",
        name: "Ibu Dra. Nurulita",
        role: "Wakil Kepala Sekolah Bidang Kesiswaan",
        avatar: "principal",
        personality: "Disiplin, berwibawa, berpegang pada data evaluasi perilaku siswa.",
        initialTrust: 80,
        questions: [
          {
            id: "q1",
            text: "Ibu Nurul, apa latar belakang dan temuan utama yang mendasari terbitnya larangan HP saat jam istirahat?",
            answer: "Hasil observasi kami menunjukkan interaksi tatap muka antar siswa merosot 40%. Selain itu, guru BK mencatat 3 kasus perselisihan akibat gim online dan perundungan siber di medsos saat jam istirahat.",
            trustDelta: 15,
            revealsFact: "Interaksi sosial siswa turun 40% dan terjadi perundungan medsos yang mendasari pengetatan aturan gawai.",
            isScoop: false
          },
          {
            id: "q2",
            text: "Bagaimana solusi bagi siswa yang memiliki keperluan komunikasi darurat dengan orang tua?",
            answer: "Sekolah sudah menyediakan saluran telepon darurat bebas pulsa di meja piket dan pos satpam. Selain itu, komite sekolah sedang mengkaji loker gawai terpadu per kelas.",
            trustDelta: 15,
            revealsFact: "Telepon darurat bebas pulsa disiagakan di pos satpam dan ruang piket sekolah untuk komunikasi orang tua.",
            isScoop: true,
            scoopQuote: "\"Sekolah menyediakan saluran telepon darurat bebas pulsa di pos jaga dan ruang piket, serta komite menyiapkan loker gawai terpadu per kelas,\" tegas Ibu Dra. Nurulita, Wakasek Kesiswaan."
          },
          {
            id: "q3",
            text: "Apakah pihak sekolah ingin membuat murid-murid ketinggalan zaman dan gaptek di era teknologi?",
            answer: "Pertanyaan yang sangat tidak mendidik! Pembatasan ini demi kesehatan mental dan fokus belajar anak, bukan anti-kemajuan zaman!",
            trustDelta: -30,
            revealsFact: null,
            isScoop: false
          }
        ]
      },
      {
        id: "witness_osis",
        name: "Rizky Pratama",
        role: "Ketua OSIS SMP/SMA",
        avatar: "student",
        personality: "Kritis, diplomatik, memperjuangkan aspirasi siswa dengan argumentasi santun.",
        initialTrust: 75,
        questions: [
          {
            id: "q1",
            text: "Rizky, apa kendala terbesar yang dihadapi teman-teman siswa dengan larangan HP total ini?",
            answer: "Banyak rekan kepanitiaan mading, literasi, dan ekstrakurikuler kesulitan koordinasi jadwal serta mendesain poster kegiatan yang biasanya dikerjakan bersama saat istirahat.",
            trustDelta: 10,
            revealsFact: "Kepanitiaan ekstrakurikuler dan mading terkendala koordinasi desain akibat larangan total HP.",
            isScoop: false
          },
          {
            id: "q2",
            text: "Solusi konstruktif apa yang diajukan pengurus OSIS dalam audiensi bersama kepala sekolah?",
            answer: "Kami mengusulkan kompromi sistem 'Zona Loker Digital Kelas'. HP hanya boleh dibuka 15 menit menjelang bel pulang sekolah khusus untuk konfirmasi penjemputan dan koordinasi tugas kelompok.",
            trustDelta: 15,
            revealsFact: "OSIS mengusulkan Zona Loker Digital Kelas dengan akses gawai 15 menit sebelum pulang untuk konfirmasi jemputan.",
            isScoop: true,
            scoopQuote: "\"Kami mengusulkan kompromi sistem Zona Loker Digital Kelas, di mana gawai hanya boleh diakses 15 menit menjelang kepulangan untuk koordinasi tugas dan jemputan,\" ungkap Rizky Pratama, Ketua OSIS."
          },
          {
            id: "q3",
            text: "Kenapa OSIS lembek sekali tidak berani memimpin aksi boikot pelajaran agar didengar guru?",
            answer: "Kami adalah organisasi intelek pelajar, bukan provokator! Menyelesaikan masalah dengan mogok belajar justru merugikan masa depan kita sendiri!",
            trustDelta: -35,
            revealsFact: null,
            isScoop: false
          }
        ]
      },
      {
        id: "witness_siswi_siti",
        name: "Siti Aisyah",
        role: "Siswi Kelas 8 & Pegiat Mading Sekolah",
        avatar: "student",
        personality: "Objektif, suka mengamati dinamika teman-teman di sekitar perpustakaan dan lapangan.",
        initialTrust: 75,
        questions: [
          {
            id: "q1",
            text: "Siti, apa suasana berbeda yang kamu amati di area selasar kelas setelah aturan ini diberlakukan?",
            answer: "Kantin dan perpustakaan sekarang jauh lebih hidup. Teman-teman kembali bermain catur di selasar, membaca majalah dinding, dan mengobrol akrab tanpa terpaku pada layar masing-masing.",
            trustDelta: 15,
            revealsFact: "Selasar kelas dan perpustakaan menjadi lebih ramai dengan interaksi obrolan serta permainan catur siswa.",
            isScoop: false
          },
          {
            id: "q2",
            text: "Apakah kamu merasa aturan ini justru meningkatkan kebersamaan siswa secara nyata?",
            answer: "Iya, jujur kami merasa lebih dekat. Biasanya di meja kantin semua diam menatap HP, sekarang kami tertawa bareng mendiskusikan tugas dan proyek liputan sekolah.",
            trustDelta: 15,
            revealsFact: "Kebersamaan dan tawa siswa di meja kantin meningkat pesat sejak pembatasan layar gawai diterapkan.",
            isScoop: true,
            scoopQuote: "\"Suasana kantin dan teras mading kini jauh lebih hangat dan hidup karena kami kembali mengobrol langsung tanpa sibuk menatap layar masing-masing,\" tutur Siti Aisyah, siswi kelas 8."
          },
          {
            id: "q3",
            text: "Pasti kamu senang ya teman-temanmu nggak bisa pamer HP mahal mereka lagi?",
            answer: "Tolong jangan bawa-bawa rasa iri dan suuzan dalam wawancara jurnalistik! Ini murni soal suasana belajar kita!",
            trustDelta: -30,
            revealsFact: null,
            isScoop: false
          }
        ]
      }
    ]
  },
  {
    id: "case_kantin_sehat",
    title: "Investigasi Mutu Sanitasi & Jajanan Pujasera Sekolah",
    category: "Kesehatan & Sanitasi Lingkungan",
    location: "Pujasera Kantin Belakang & Ruang UKS",
    date: "Senin Siang, 13.00 WIB",
    summary: "Tiga siswa dilarikan ke ruang UKS akibat mengeluh kram perut setelah menyantap cilok pedas. Dewan Pers Siswa melakukan penelusuran berimbang antara higienitas pedagang, diagnosis medis UKS, dan pola cuci tangan murid.",
    headlineHint: "Tiga Siswa Keluhkan Mulas, Kantin Sekolah Musnahkan Saus Tanpa Label Resmi",
    icon: "canteen",
    witnesses: [
      {
        id: "witness_pedagang",
        name: "Mang Ujang",
        role: "Pengelola Kedai Cilok Kantin Belakang",
        avatar: "canteen",
        personality: "Pekerja keras, cemas usahanya disegel, namun berani mengakui kekhilafan bahan demi keselamatan anak-anak.",
        initialTrust: 70,
        questions: [
          {
            id: "q1",
            text: "Mang Ujang, bagaimana proses pembuatan cilok dan air yang digunakan untuk merebus adonan hari ini?",
            answer: "Demi Allah dik, adonan cilok saya buat subuh tadi memakai tepung segar dan air galon matang berlabel resmi. Dandang rebusan selalu tertutup rapat di atas kompor gas.",
            trustDelta: 15,
            revealsFact: "Cilok diolah dari tepung segar dan direbus menggunakan air galon matang berlabel resmi.",
            isScoop: false
          },
          {
            id: "q2",
            text: "Bagaimana dengan botol saus sambal yang digunakan siswa saat jam istirahat pertama tadi?",
            answer: "Saya akui ada satu botol saus sambal titipan distributor luar yang belum tertera izin edar resmi BPOM. Mulai siang ini semua saus kemasan plastik itu langsung saya buang dan musnahkan demi keselamatan anak-anak!",
            trustDelta: 20,
            revealsFact: "Ditemukan satu botol saus sambal titipan distributor luar tanpa izin edar resmi BPOM yang langsung dimusnahkan pedagang.",
            isScoop: true,
            scoopQuote: "\"Saya mengakui ada satu botol saus sambal titipan distributor luar tanpa izin BPOM. Mulai siang ini semua saus tersebut langsung saya musnahkan demi keselamatan siswa,\" tegas Mang Ujang, pedagang kantin."
          },
          {
            id: "q3",
            text: "Mang Ujang sengaja ya memakai bahan pengawet mayat berbahaya biar ciloknya tahan seminggu?",
            answer: "Astagfirullah! Fitnahmu kejam sekali! Saya jualan halal mencari nafkah anak sekolah, bukan racun! Jangan bicara sembarangan!",
            trustDelta: -45,
            revealsFact: null,
            isScoop: false
          }
        ]
      },
      {
        id: "witness_dokter_uks",
        name: "dr. Farida Hanum",
        role: "Dokter Pembina UKS & Puskesmas Kecamatan",
        avatar: "doctor",
        personality: "Tenang, ilmiah, mengedepankan diagnosa berbasis bukti laboratorium dan edukasi sanitasi.",
        initialTrust: 80,
        questions: [
          {
            id: "q1",
            text: "Dokter Farida, bagaimana kondisi klinis terkini dari 3 siswa yang sempat dirawat di ruang UKS?",
            answer: "Ketiga anak hanya mengalami kram usus ringan dan mual, bukan keracunan zat kimia berbahaya. Setelah kami berikan larutan oralit dan istirahat 30 menit, kondisinya sudah segar dan bisa pulang ke rumah masing-masing.",
            trustDelta: 15,
            revealsFact: "Ketiga siswa mengalami kram usus ringan dan pulih stabil setelah diberikan larutan oralit di UKS.",
            isScoop: false
          },
          {
            id: "q2",
            text: "Berdasarkan evaluasi medis, apa pemicu utama keluhan sakit perut pada para siswa tersebut?",
            answer: "Pemicunya adalah kombinasi botol saus yang kurang tertutup rapat dengan kebiasaan siswa yang lupa mencuci tangan memakai sabun setelah berolahraga di tanah becek.",
            trustDelta: 15,
            revealsFact: "Keluhan dipicu kombinasi botol saus terbuka dan kebiasaan siswa tidak cuci tangan sabun usai berolahraga.",
            isScoop: true,
            scoopQuote: "\"Keluhan dipicu kontaminasi bakteri ringan akibat botol saus terbuka serta kebiasaan siswa tidak mencuci tangan dengan sabun setelah berolahraga di tanah becek,\" jelas dr. Farida Hanum, Dokter Pembina UKS."
          },
          {
            id: "q3",
            text: "Pihak UKS lamban sekali ya menangani siswa sakit sampai kasus ini heboh di grup WhatsApp wali murid?",
            answer: "Kami menangani pasien dalam waktu 3 menit sejak diantar guru! Tolong jangan menyebarkan narasi provokatif yang tidak berdasar fakta!",
            trustDelta: -30,
            revealsFact: null,
            isScoop: false
          }
        ]
      },
      {
        id: "witness_korban_dika",
        name: "Dika Ardian",
        role: "Siswa Kelas 7 yang Dirawat di UKS",
        avatar: "student",
        personality: "Jujur, pemalu, mengakui kelalaian pribadinya saat ditanya dengan empati.",
        initialTrust: 75,
        questions: [
          {
            id: "q1",
            text: "Dika, apa yang kamu rasakan sebelum dan sesudah menyantap jajanan di kantin tadi siang?",
            answer: "Waktu jam istirahat pertama saya lapar sekali setelah jam olahraga lari keliling lapangan. Sekitar 15 menit setelah makan cilok pedas, perut saya mulai terasa melilit kencang.",
            trustDelta: 10,
            revealsFact: "Dika merasakan mual dan perut melilit 15 menit setelah memakan cilok pedas usai pelajaran olahraga.",
            isScoop: false
          },
          {
            id: "q2",
            text: "Apakah kamu sempat mencuci tangan memakai sabun sebelum mengambil makanan di kantin?",
            answer: "Saya jujur mengaku salah... Tadi saya terburu-buru bel masuk berbunyi dan cuma membilas tangan dengan air keran tanpa sabun sehabis memegang bola tanah di lapangan becek.",
            trustDelta: 15,
            revealsFact: "Dika mengakui terburu-buru dan hanya membilas tangan tanpa sabun setelah bermain di lapangan tanah.",
            isScoop: true,
            scoopQuote: "\"Saya jujur mengaku salah karena terburu-buru bel masuk dan hanya membilas tangan tanpa sabun sehabis memegang bola di lapangan tanah becek,\" aku Dika Ardian, siswa kelas 7."
          },
          {
            id: "q3",
            text: "Kamu cuma pura-pura mual kan biar dapat surat izin pulang cepat dan bolos ujian Matematika?",
            answer: "Perutku beneran sakit melilit sampai lemas! Jahat banget kamu nuduh pura-pura sakit!",
            trustDelta: -40,
            revealsFact: null,
            isScoop: false
          }
        ]
      }
    ]
  },
  {
    id: "case_olympiad_trophy",
    title: "Misteri Hilangnya Piala Bergilir Olimpiade Sains dari Lemari Kaca Aula",
    category: "Investigasi Keamanan & Fasilitas",
    location: "Aula Pertemuan Utama Lantai 1",
    date: "Senin Pagi, 07.30 WIB",
    summary: "Lemari kaca pajangan piala di depan aula ditemukan dalam keadaan tidak terkunci dan piala bergilir emas Olimpiade Sains Nasional raib pada Senin pagi, memicu kecemasan siswa menjelang upacara penyerahan apresiasi.",
    headlineHint: "Bukan Dicuri, Piala Bergilir Olimpiade Sains Ternyata Dibawa Pengrajin untuk Gravir Nama Juara Baru",
    icon: "trophy",
    witnesses: [
      {
        id: "witness_pak_mahmud",
        name: "Pak Mahmud",
        role: "Petugas Kebersihan Aula Utama",
        avatar: "cleaning",
        personality: "Rajin, polos, berbicara apa adanya sesuai jadwal tugas pagi di aula.",
        initialTrust: 75,
        questions: [
          {
            id: "q1",
            text: "Pak Mahmud, jam berapa Bapak mulai membersihkan aula dan melihat lemari piala terbuka?",
            answer: "Saya mulai menyapu jam 05.45 pagi dik. Waktu saya mengepel dekat pintu aula, lemari kaca itu memang sudah tidak digembok dan rak atas tempat piala olimpiade tampak kosong melompong.",
            trustDelta: 15,
            revealsFact: "Pukul 05.45 pagi saat aula mulai dibersihkan, lemari kaca piala sudah tidak digembok dan rak atas kosong.",
            isScoop: false
          },
          {
            id: "q2",
            text: "Apakah ada kaca lemari yang pecah atau jejak congkelan paksa pada engsel pintu lemari?",
            answer: "Engsel dan kaca lemari masih mulus tanpa ada goresan atau pecahan kaca sama sekali! Kuncinya seperti dibuka rapi menggunakan anak kunci aslinya.",
            trustDelta: 15,
            revealsFact: "Pintu lemari kaca tidak mengalami kerusakan paksa dan tampak dibuka menggunakan anak kunci asli.",
            isScoop: true,
            scoopQuote: "\"Lemari kaca tidak rusak atau dicongkel sama sekali. Pintu dibuka rapi memakai anak kunci aslinya sebelum jam enam pagi,\" ungkap Pak Mahmud, Petugas Kebersihan Aula."
          },
          {
            id: "q3",
            text: "Bapak sengaja ya mencuri piala emas itu buat dijual ke pasar loak?",
            answer: "Astagfirullahaladzim! Saya puluhan tahun menjaga amanah di sekolah ini, jangan sembarangan menuduh orang tua seperti saya!",
            trustDelta: -45,
            revealsFact: null,
            isScoop: false
          }
        ]
      },
      {
        id: "witness_bu_diana",
        name: "Ibu Diana Savitri M.Pd",
        role: "Guru Pembimbing Tim Olimpiade Sains",
        avatar: "science",
        personality: "Sangat peduli prestasi siswa, cemas piala rusak karena memiliki nilai sejarah sekolah bertahun-tahun.",
        initialTrust: 80,
        questions: [
          {
            id: "q1",
            text: "Bu Diana, bagaimana riwayat penyerahan piala bergilir tersebut sebelum dipajang di lemari kaca?",
            answer: "Piala itu diserahkan oleh panitia kementerian bulan lalu. Kemarin sore jam 16.00 saya sendiri yang memastikan piala tersimpan di lemari aula sebelum pintu ruangan dikunci satpam.",
            trustDelta: 10,
            revealsFact: "Piala masih tersimpan utuh di lemari kaca aula pada Minggu sore pukul 16.00 WIB.",
            isScoop: false
          },
          {
            id: "q2",
            text: "Apakah Ibu sudah memeriksa ke bagian sarana prasarana sekolah mengenai kemungkinan pemindahan inventaris?",
            answer: "Nah! Jam 07.45 tadi Wakasek Sarpras baru memberi tahu bahwa piala emas itu pagi-pagi jam 06.00 diambil oleh pengrajin resmi langganan dinas untuk diukirkan gravir nama tim juara baru di plakatnya menjelang upacara dies natalis!",
            trustDelta: 20,
            revealsFact: "Piala bergilir diambil resmi oleh pengrajin atas mandat Wakasek Sarpras untuk gravir ukir nama juara baru.",
            isScoop: true,
            scoopQuote: "\"Piala bergilir tidak hilang dicuri, melainkan diambil resmi oleh pengrajin atas izin Wakasek Sarpras untuk proses gravir ukir nama pemenang,\" jelas Ibu Diana, Pembimbing Olimpiade Sains."
          },
          {
            id: "q3",
            text: "Ibu Diana pasti lalai ya lupa mengunci gembok lemari kaca aula kemarin sore?",
            answer: "Saya memegang catatan serah terima kunci piket dinas! Jangan berspekulasi sembarangan tanpa menelusuri alur logistik sekolah!",
            trustDelta: -30,
            revealsFact: null,
            isScoop: false
          }
        ]
      },
      {
        id: "witness_siswa_rizky",
        name: "Rizky Firmansyah",
        role: "Ketua Tim Peraih Emas Olimpiade Sains",
        avatar: "student",
        personality: "Bangga, santun, awalnya kaget mendengar desas-desus piala hilang namun lega setelah tahu kebenarannya.",
        initialTrust: 80,
        questions: [
          {
            id: "q1",
            text: "Rizky, apa tanggapanmu saat pertama kali mendengar rumor bahwa piala emas tim kalian hilang?",
            answer: "Awalnya kami sekeluarga dan tim sempat panik dan sedih sekali karena itu piala perjuangan kami selama enam bulan belajar intensif siang dan malam.",
            trustDelta: 10,
            revealsFact: "Tim siswa olimpiade sempat panik dan cemas saat mendengar kabar desas-desus piala raib.",
            isScoop: false
          },
          {
            id: "q2",
            text: "Kapan tim kalian dijadwalkan menerima kembali piala yang sedang digravir tersebut?",
            answer: "Pihak sekolah menjadwalkan piala yang sudah diukir nama tim kami akan diserahkan secara resmi di panggung utama upacara bendera hari Senin pekan depan bersama piagam penghargaan!",
            trustDelta: 15,
            revealsFact: "Piala yang sudah digravir akan diserahkan resmi di panggung upacara Senin pekan depan.",
            isScoop: true,
            scoopQuote: "\"Kami lega piala emas kebanggaan sekolah sedang diukir rapi dan akan diserahkan di panggung upacara bendera pekan depan,\" tutur Rizky Firmansyah, Ketua Tim Sains."
          },
          {
            id: "q3",
            text: "Kamu sendiri kan yang bawa pulang piala emas itu diam-diam buat pamer ke tetangga rumah?",
            answer: "Astaga, tuduhanmu tidak sopan sekali! Kami selalu mengikuti aturan resmi sekolah dan tidak pernah membawa piala keluar tanpa izin pembina!",
            trustDelta: -35,
            revealsFact: null,
            isScoop: false
          }
        ]
      }
    ]
  },
  {
    id: "case_ambassador_election",
    title: "Dugaan Pelanggaran Netralitas Pemilihan Duta Pelajar Sekolah",
    category: "Investigasi Demokrasi & Etika Digital",
    location: "Pusat Server & Ruang OSIS Lantai 2",
    date: "Rabu Siang, 14.00 WIB",
    summary: "Hasil sementara pemungutan suara daring Duta Pelajar mengalami lonjakan 200 suara dalam 5 menit untuk salah satu kandidat, memicu dugaan manipulasi bot siber atau keberpihakan panitia.",
    headlineHint: "Bukan Serangan Bot, Lonjakan Suara Duta Pelajar Terjadi Akibat Pembagian Akses Wi-Fi Bersama di Kantin Sekolah",
    icon: "voting",
    witnesses: [
      {
        id: "witness_pak_teguh",
        name: "Pak Teguh Santoso S.Pd",
        role: "Ketua Dewan Pembina Pemilihan Duta Pelajar",
        avatar: "teacher",
        personality: "Adil, mengedepankan asas kejujuran pemilu pelajar, terbuka terhadap audit teknis.",
        initialTrust: 80,
        questions: [
          {
            id: "q1",
            text: "Pak Teguh, bagaimana kronologi saat panitia mendapati lonjakan suara mendadak pada jam 13.30 tadi?",
            answer: "Pada pukul 13.30 tepat saat jam istirahat kedua berakhir, sistem dasbor mencatat ada 215 suara masuk ke kandidat Nomor 2 hanya dalam rentang waktu 4 menit, sehingga memicu lampu kuning peringatan audit internal.",
            trustDelta: 10,
            revealsFact: "Tercatat 215 suara masuk ke kandidat Nomor 2 dalam tempo 4 menit saat jam istirahat kedua berakhir.",
            isScoop: false
          },
          {
            id: "q2",
            text: "Apakah panitia langsung mendiskualifikasi kandidat bersangkutan atas dugaan kecurangan tersebut?",
            answer: "Prinsip pemilu yang adil adalah praduga tak bersalah! Kami langsung membekukan sistem selama 15 menit untuk meminta audit log teknis kepada tim jaringan sekolah sebelum mengambil kesimpulan.",
            trustDelta: 15,
            revealsFact: "Panitia tidak gegabah mendiskualifikasi dan membekukan sistem 15 menit untuk audit log jaringan.",
            isScoop: true,
            scoopQuote: "\"Kami mengedepankan asas praduga tak bersalah. Sistem dibekukan 15 menit demi audit forensik log jaringan yang objektif,\" tegas Pak Teguh Santoso, Pembina Pemilihan."
          },
          {
            id: "q3",
            text: "Bapak pasti sudah menerima suap dari tim sukses kandidat Nomor 2 ya?",
            answer: "Fitnahmu sungguh keterlaluan! Kami mendidik integritas generasi bangsa, bukan ajang korupsi! Wawancara ini saya akhiri jika bicaramu tanpa etika!",
            trustDelta: -45,
            revealsFact: null,
            isScoop: false
          }
        ]
      },
      {
        id: "witness_doni_it",
        name: "Doni Prasetyo",
        role: "Koordinator IT & Pengembang Portal Voting",
        avatar: "it",
        personality: "Tenang, berbasis data log, ahli menganalisis lalu lintas jaringan internet sekolah.",
        initialTrust: 80,
        questions: [
          {
            id: "q1",
            text: "Doni, apa temuan hasil audit forensik terhadap 215 suara yang masuk secara kilat tersebut?",
            answer: "Setelah kami periksa log request server, seluruh 215 pemilih login menggunakan akun email siswa terverifikasi (@sekolah.sch.id) yang valid dengan NISN asli dan tidak ada akun ganda atau fiktif sama sekali!",
            trustDelta: 15,
            revealsFact: "Seluruh 215 pemilih terverifikasi menggunakan akun email resmi sekolah dengan NISN aktif tanpa bot.",
            isScoop: false
          },
          {
            id: "q2",
            text: "Lalu mengapa ratusan suara tersebut memiliki alamat IP (Internet Protocol) yang persis sama?",
            answer: "Ternyata saat jam istirahat tadi ada kampanye orasi di kantin, dan ratusan siswa serentak voting menggunakan router Wi-Fi kantin sekolah yang sama! Karena satu jaringan Wi-Fi bersama, alamat IP keluarannya terbaca identik!",
            trustDelta: 20,
            revealsFact: "Alamat IP terbaca identik karena ratusan siswa melakukan voting serentak melalui satu Wi-Fi kantin sekolah usai orasi.",
            isScoop: true,
            scoopQuote: "\"Bukan serangan bot ilegal. Alamat IP terbaca sama karena ratusan siswa serentak memilih lewat titik Wi-Fi kantin bersama usai orasi,\" jelas Doni Prasetyo, Koordinator IT Voting."
          },
          {
            id: "q3",
            text: "Doni sengaja bikin program voting abal-abal biar website sekolah mudah diretas ya?",
            answer: "Portal voting ini dilengkapi enkripsi SSL dan otentikasi OAuth Google Workspace resmi! Jangan meremehkan kerja keras tim teknologi!",
            trustDelta: -30,
            revealsFact: null,
            isScoop: false
          }
        ]
      },
      {
        id: "witness_salsabila",
        name: "Salsabila Anindya",
        role: "Kandidat Nomor Urut 2 Duta Pelajar",
        avatar: "student",
        personality: "Santun, berprestasi, transparan, terkejut namanya dituduh berbuat curang di media sosial.",
        initialTrust: 75,
        questions: [
          {
            id: "q1",
            text: "Salsabila, apa yang kamu lakukan bersama tim pendukung saat jam istirahat kedua tadi?",
            answer: "Kami mengadakan sosialisasi program literasi lingkungan di panggung pujasera kantin dan membagikan stiker berisi kode QR tautan portal resmi sekolah agar teman-teman menggunakan hak suaranya.",
            trustDelta: 10,
            revealsFact: "Salsabila menggelar orasi literasi lingkungan di kantin dan membagikan stiker kode QR portal resmi.",
            isScoop: false
          },
          {
            id: "q2",
            text: "Apakah timmu meminta atau memaksa teman-teman untuk memilih kamu saat itu juga?",
            answer: "Sama sekali tidak ada paksaan! Kami hanya mengajak mereka memanfaatkan hak pilih, dan kami siap menerima apa pun hasil audit independen dewan juri demi menjaga kehormatan pemilu.",
            trustDelta: 15,
            revealsFact: "Kandidat mengajak siswa menggunakan hak suara secara sukarela dan siap patuh pada hasil audit dewan juri.",
            isScoop: true,
            scoopQuote: "\"Kami tidak pernah memaksakan pilihan. Seluruh proses terbuka dan kami siap mematuhi hasil audit juri demi integritas sekolah,\" tutur Salsabila Anindya, Finalis Duta Pelajar."
          },
          {
            id: "q3",
            text: "Kamu menyuap ratusan siswa dengan traktiran bakso gratis ya biar menang voting?",
            answer: "Demi Allah saya tidak pernah membagikan uang atau traktiran! Itu tuduhan keji tanpa dasar yang sangat menyakiti hati saya!",
            trustDelta: -40,
            revealsFact: null,
            isScoop: false
          }
        ]
      }
    ]
  }
];

// 5 VARIATIONS CURRICULUM BEATS
export const VARIATION_BEATS = [
  { index: 0, title: "Desk 1: Hukum & Tata Kelola Digital", caseSummary: "Kebocoran Ujian • Face AI • Lab Komputer" },
  { index: 1, title: "Desk 2: Kesehatan, Pangan & Warisan Budaya", caseSummary: "Keracunan BPOM • Cagar Budaya • Larangan Gawai" },
  { index: 2, title: "Desk 3: Lingkungan, Konservasi & Kebijakan", caseSummary: "Kucing Hutan BKSDA • Jam Masuk 06.00 • Pujasera Kantin" },
  { index: 3, title: "Desk 4: Energi Terbarukan & Sains Terapan", caseSummary: "Panel Surya Korsleting • Reaktor Biogas • Piala Bergilir" },
  { index: 4, title: "Desk 5: Keamanan Siber & Demokrasi Pelajar", caseSummary: "Peretasan Medsos OSIS • E-Sports • Duta Pelajar" }
];

export const getTeamVariationIndex = (team) => {
  if (!team) return 0;
  if (team.assignedVariationIndex !== undefined && team.assignedVariationIndex !== null) {
    const val = parseInt(team.assignedVariationIndex, 10);
    if (!isNaN(val) && val >= 0) return val % 5;
  }
  const teams = getAllTeams();
  const idx = teams.findIndex(t => t.id === team.id);
  if (idx >= 0) return idx % 5;
  let hash = 0;
  const str = team.id || team.name || "";
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 5;
};

// 1. Get all available cases (built-in + teacher custom)
export const getAllSchoolCases = () => {
  if (typeof window === "undefined") return DEFAULT_SCHOOL_CASES;
  try {
    const customRaw = localStorage.getItem(CUSTOM_CASES_KEY);
    const customList = customRaw ? JSON.parse(customRaw) : [];
    return [...DEFAULT_SCHOOL_CASES, ...customList];
  } catch {
    return DEFAULT_SCHOOL_CASES;
  }
};

// Get specific school case for team based on variation
export const getTeamClassroomCase = (team) => {
  const allCases = getAllSchoolCases();
  if (!team) return allCases[0];
  const varIdx = getTeamVariationIndex(team);
  return allCases[varIdx % allCases.length] || allCases[0];
};

// 2. Active classroom case (supports optional team context)
export const getActiveClassroomCase = (team) => {
  const allCases = getAllSchoolCases();
  if (typeof window === "undefined") return allCases[0];
  try {
    const activeId = localStorage.getItem(ACTIVE_CLASSROOM_CASE_KEY);
    if (activeId) {
      const match = allCases.find(c => c.id === activeId);
      if (match) return match;
    }
    if (team) {
      return getTeamClassroomCase(team);
    }
    return allCases[0];
  } catch {
    return allCases[0];
  }
};

export const setActiveClassroomCase = (caseId) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACTIVE_CLASSROOM_CASE_KEY, caseId);
    const allCases = getAllSchoolCases();
    const targetCase = allCases.find(c => c.id === caseId);
    if (targetCase) {
      addPressWarLog(`GURU: Kasus Liputan Investigasi Sekolah diaktifkan: '${targetCase.title}'. Seluruh biro siap mewawancarai narasumber!`, "breaking");
    }
  } catch {
    // ignore
  }
};

// 3. Custom cases management
export const saveCustomSchoolCase = (caseData) => {
  if (typeof window === "undefined") return null;
  try {
    const customRaw = localStorage.getItem(CUSTOM_CASES_KEY);
    const currentList = customRaw ? JSON.parse(customRaw) : [];
    const newCase = {
      ...caseData,
      id: caseData.id || `custom_case_${Date.now()}`,
      isCustom: true,
      createdAt: new Date().toISOString()
    };
    const filtered = currentList.filter(c => c.id !== newCase.id);
    const updated = [...filtered, newCase];
    localStorage.setItem(CUSTOM_CASES_KEY, JSON.stringify(updated));
    addPressWarLog(`GURU: Kasus Liputan Lokal Baru berhasil diterbitkan: '${newCase.title}'.`, "important");
    return newCase;
  } catch {
    return null;
  }
};

export const deleteCustomSchoolCase = (caseId) => {
  if (typeof window === "undefined") return;
  try {
    const customRaw = localStorage.getItem(CUSTOM_CASES_KEY);
    const currentList = customRaw ? JSON.parse(customRaw) : [];
    const updated = currentList.filter(c => c.id !== caseId);
    localStorage.setItem(CUSTOM_CASES_KEY, JSON.stringify(updated));
    if (getActiveClassroomCase()?.id === caseId) {
      setActiveClassroomCase(DEFAULT_SCHOOL_CASES[0].id);
    }
  } catch {
    // ignore
  }
};

// 4. Team Pocket Notes & Interview Progress
export const getTeamPocketNotes = (teamId) => {
  const team = getTeamById(teamId);
  return team?.pocketNotes || [];
};

export const getTeamInterviewProgress = (teamId, caseId) => {
  const team = getTeamById(teamId);
  if (!team || !team.interviewProgress) return {};
  return team.interviewProgress[caseId] || {};
};

// Record an interview question asked by the team
export const recordInterviewInteraction = (teamId, caseId, witnessId, questionId) => {
  const team = getTeamById(teamId);
  if (!team) return null;

  const allCases = getAllSchoolCases();
  const currentCase = allCases.find(c => c.id === caseId);
  if (!currentCase) return team;

  const witness = currentCase.witnesses?.find(w => w.id === witnessId);
  if (!witness) return team;

  const question = witness.questions?.find(q => q.id === questionId);
  if (!question) return team;

  // Retrieve existing interview progress
  const teamProgress = team.interviewProgress || {};
  const caseProgress = teamProgress[caseId] || { witnesses: {} };
  const witnessProgress = caseProgress.witnesses[witnessId] || {
    trust: witness.initialTrust || 75,
    questionsAsked: [],
    isNoComment: false
  };

  // If already asked, return existing state
  const alreadyAsked = witnessProgress.questionsAsked.includes(questionId);
  const newQuestionsAsked = alreadyAsked 
    ? witnessProgress.questionsAsked 
    : [...witnessProgress.questionsAsked, questionId];

  // Calculate new trust score (0 - 100)
  const currentTrust = witnessProgress.trust ?? (witness.initialTrust || 75);
  const newTrust = Math.min(100, Math.max(0, currentTrust + question.trustDelta));
  const isNoComment = newTrust < 30;

  // Update pocket notes if question reveals fact
  const existingNotes = team.pocketNotes || [];
  let updatedNotes = [...existingNotes];
  let gainedCoins = 0;

  if (question.revealsFact && !alreadyAsked) {
    const existingFact = existingNotes.find(n => n.caseId === caseId && n.witnessId === witnessId && n.fact === question.revealsFact);
    if (!existingFact) {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      updatedNotes.push({
        id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        caseId,
        caseTitle: currentCase.title,
        witnessId,
        witnessName: witness.name,
        witnessRole: witness.role,
        witnessAvatar: witness.avatar,
        fact: question.revealsFact,
        isScoop: !!question.isScoop,
        scoopQuote: question.scoopQuote || null,
        timestamp: nowStr
      });

      // Bonus coins reward for critical journalism
      gainedCoins = question.isScoop ? 100 : 50;
      addPressWarLog(
        `⭐ BIRO '${team.name}' mengantongi ${question.isScoop ? 'KUTIPAN EKSKLUSIF (SCOOP)' : 'Fakta Kunci'} dari ${witness.name}! (+${gainedCoins} Koin)`,
        question.isScoop ? "breaking" : "neutral"
      );
    }
  }

  // Check if team interviewed all witnesses in this case (cover both sides badge)
  const allWitnessIds = currentCase.witnesses.map(w => w.id);
  const updatedWitnessesMap = {
    ...caseProgress.witnesses,
    [witnessId]: {
      trust: newTrust,
      questionsAsked: newQuestionsAsked,
      isNoComment
    }
  };

  const interviewedCount = allWitnessIds.filter(id => {
    return (updatedWitnessesMap[id]?.questionsAsked?.length || 0) > 0;
  }).length;

  const existingBadges = team.badges || [];
  let updatedBadges = [...existingBadges];
  if (interviewedCount >= allWitnessIds.length && !existingBadges.includes("Investigator Paripurna (Cover Both Sides)")) {
    updatedBadges.push("Investigator Paripurna (Cover Both Sides)");
    gainedCoins += 150;
    addPressWarLog(`REPUTASI EMAS: Biro '${team.name}' berhasil mewawancarai seluruh narasumber (Cover Both Sides)! (+150 Koin)`, "important");
  }

  const updatedTeam = {
    ...team,
    coins: (team.coins || 0) + gainedCoins,
    pocketNotes: updatedNotes,
    badges: updatedBadges,
    interviewProgress: {
      ...teamProgress,
      [caseId]: {
        ...caseProgress,
        witnesses: updatedWitnessesMap,
        lastInteractedAt: new Date().toISOString()
      }
    }
  };

  registerOrUpdateTeam(updatedTeam);
  return {
    team: updatedTeam,
    question,
    newTrust,
    isNoComment,
    gainedCoins,
    revealedFact: question.revealsFact
  };
};

// Reset / Clear team interview notes for a case
export const clearTeamPocketNotes = (teamId, caseId) => {
  const team = getTeamById(teamId);
  if (!team) return null;

  const updatedNotes = (team.pocketNotes || []).filter(n => n.caseId !== caseId);
  const teamProgress = { ...(team.interviewProgress || {}) };
  delete teamProgress[caseId];

  const updatedTeam = {
    ...team,
    pocketNotes: updatedNotes,
    interviewProgress: teamProgress
  };

  registerOrUpdateTeam(updatedTeam);
  return updatedTeam;
};


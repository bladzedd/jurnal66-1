import React, { useState, useEffect } from 'react';
import { 
  Trophy, Shield, Users, Key, Plus, RefreshCw, Trash2, Coins, Megaphone, 
  CheckCircle2, ArrowRight, Printer, AlertTriangle, Sparkles, BookOpen, 
  ArrowLeft, Edit3, ShieldAlert, FileText, Award, UserCheck, Eye, EyeOff, LogOut,
  Clock, Pause, Play, Download, Copy, Tv, Check, Flame, Crown, X, Pencil, MessageSquare,
  Share2, Scale, ShieldCheck, Lightbulb, RotateCcw, Lock
} from 'lucide-react';
import { sound } from '../utils/sound';
import { 
  getAllTeams, 
  createTeamByAdmin, 
  getClassroomStage, 
  setClassroomStage, 
  resetClassroomProgress,
  resetClassroomExercise,
  getClassroomLeaderboard,
  getTeamTotalDuration,
  getTeamFinalScore,
  registerOrUpdateTeam,
  adminDeleteTeam,
  adminRegenerateCodes,
  adminAdjustCoins,
  adminUpdateMemberRole,
  adminRemoveMember,
  adminUpdateTeamDetails,
  adminUpdateMemberDetails,
  adminSetTeamStage,
  adminClearDebuffs,
  adminSaveTeamNotes,
  adminBroadcastAlert,
  getPressWarLogs,
  getGlobalTimer,
  startGlobalTimer,
  stopGlobalTimer,
  addGlobalTimerMinutes,
  getScreenFreeze,
  setScreenFreeze,
  adminSaveRubricGrade,
  generateGradebookCSV,
  isStageCompleted,
  createUnassignedSlotByAdmin,
  createBatchUnassignedSlotsByAdmin,
  getAllSchoolCases,
  getActiveClassroomCase,
  setActiveClassroomCase,
  saveCustomSchoolCase,
  deleteCustomSchoolCase,
  clearTeamPocketNotes,
  getTeamVariationIndex,
  VARIATION_BEATS,
  getTeamStageTimer,
  formatDuration,
  syncWithServerNow,
  getAllClassroomUsers
} from '../utils/storage';
import { editorialRoles } from './GroupLoginScreen';
import { journalismStages } from '../data/journalismData';
import { WitnessAvatar } from './ui/ProfessionalIcon';
import TeacherAnswerKeysView from './TeacherAnswerKeysView';

export default function AdminDashboard({ onExitAdmin, onBackToDashboard }) {
  const handleExit = () => {
    if (typeof onExitAdmin === "function") onExitAdmin();
    if (typeof onBackToDashboard === "function") onBackToDashboard();
  };

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('redaksi_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(null);
  const [showPin, setShowPin] = useState(false);

  const [activeTab, setActiveTab] = useState("teams"); // "teams" | "stages" | "economy" | "broadcast" | "grades"
  const [tick, setTick] = useState(0);

  // New Group Form State
  const [teamName, setTeamName] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [leaderClass, setLeaderClass] = useState("");
  const [customLeaderCode, setCustomLeaderCode] = useState("");
  const [customMemberCode, setCustomMemberCode] = useState("");

  // Broadcast Form State
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [broadcastPriority, setBroadcastPriority] = useState("info"); // "info" | "urgent" | "breaking"

  // Quick Member Add to Existing Team State
  const [addMemberTeamId, setAddMemberTeamId] = useState(null);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberClass, setNewMemberClass] = useState("");
  const [newMemberRole, setNewMemberRole] = useState(editorialRoles[0].title);

  // Edit Team Details (Nama Kelompok, Nama Ketua, Kelas, Kode)
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [editTeamName, setEditTeamName] = useState("");
  const [editTeamLeaderName, setEditTeamLeaderName] = useState("");
  const [editTeamLeaderClass, setEditTeamLeaderClass] = useState("");
  const [editTeamLeaderCode, setEditTeamLeaderCode] = useState("");
  const [editTeamMemberCode, setEditTeamMemberCode] = useState("");
  const [editTeamVariationIndex, setEditTeamVariationIndex] = useState(0);

  // Edit Member Details (Nama Siswa, Kelas, Peran, Ketua)
  const [editingMemberKey, setEditingMemberKey] = useState(null); // `${teamId}-${idx}`
  const [editMemberName, setEditMemberName] = useState("");
  const [editMemberClass, setEditMemberClass] = useState("");
  const [editMemberRole, setEditMemberRole] = useState(editorialRoles[0].title);
  const [editMemberIsLeader, setEditMemberIsLeader] = useState(false);

  // Feedback Banner & Copy Code Toast
  const [feedback, setFeedback] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [teamToDisband, setTeamToDisband] = useState(null);

  // Super-Admin Powers States: Timer, Screen Freeze, Projector Mode, Reset Exercise
  const [timerState, setTimerState] = useState(() => getGlobalTimer());
  const [freezeState, setFreezeState] = useState(() => getScreenFreeze());
  const [isProjectorMode, setIsProjectorMode] = useState(false);
  const [freezePromptInput, setFreezePromptInput] = useState("Pena Diturunkan! Perhatikan penjelasan Guru Pengampu di depan kelas.");
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Rubric Edit States per team: { [teamId]: { factAccuracy, pyramidStructure, journalismLanguage, notes } }
  const [rubricInputs, setRubricInputs] = useState({});

  // Case & Witness Management States
  const [isCreatingCase, setIsCreatingCase] = useState(false);
  const [newCaseTitle, setNewCaseTitle] = useState("");
  const [newCaseCategory, setNewCaseCategory] = useState("Investigasi Sekolah");
  const [newCaseLocation, setNewCaseLocation] = useState("");
  const [newCaseSummary, setNewCaseSummary] = useState("");
  const [newCaseWitnessName, setNewCaseWitnessName] = useState("");
  const [newCaseWitnessRole, setNewCaseWitnessRole] = useState("");
  const [newCaseWitnessAvatar, setNewCaseWitnessAvatar] = useState("");
  const [newCaseQ1Text, setNewCaseQ1Text] = useState("");
  const [newCaseQ1Answer, setNewCaseQ1Answer] = useState("");
  const [newCaseQ1Fact, setNewCaseQ1Fact] = useState("");
  const [newCaseQ2Text, setNewCaseQ2Text] = useState("");
  const [newCaseQ2Answer, setNewCaseQ2Answer] = useState("");

  const allCases = getAllSchoolCases();
  const activeClassCase = getActiveClassroomCase();

  const handleSelectClassCase = (caseId) => {
    sound.playStamp();
    setActiveClassroomCase(caseId);
    setFeedback({ type: "success", text: "Kasus Liputan Kelas Berhasil Diaktifkan untuk Seluruh Biro Siswa!" });
    refresh();
  };

  const handleCreateCustomCase = (e) => {
    e.preventDefault();
    if (!newCaseTitle.trim() || !newCaseWitnessName.trim() || !newCaseQ1Text.trim()) {
      sound.playError();
      setFeedback({ type: "error", text: "Lengkapi minimal Judul Kasus, Nama Saksi, dan Pertanyaan!" });
      return;
    }
    sound.playStamp();
    const created = saveCustomSchoolCase({
      title: newCaseTitle.trim(),
      category: newCaseCategory.trim() || "Investigasi Sekolah",
      location: newCaseLocation.trim() || "Lingkungan Sekolah",
      date: new Date().toLocaleDateString([], { weekday: 'long', hour: '2-digit', minute: '2-digit' }),
      summary: newCaseSummary.trim() || "Kasus liputan lokal yang dirancang khusus oleh Guru Pengampu.",
      icon: "FileText",
      witnesses: [
        {
          id: `witness_${Date.now()}`,
          name: newCaseWitnessName.trim(),
          role: newCaseWitnessRole.trim() || "Saksi Kunci",
          avatar: newCaseWitnessAvatar || "witness",
          personality: "Kooperatif jika ditanya dengan sopan.",
          initialTrust: 75,
          questions: [
            {
              id: "q1",
              text: newCaseQ1Text.trim(),
              answer: newCaseQ1Answer.trim() || "Saya siap memberikan keterangan sesuai fakta yang saya lihat.",
              trustDelta: 15,
              revealsFact: newCaseQ1Fact.trim() || "Keterangan saksi telah dicatat resmi.",
              isScoop: false
            },
            ...(newCaseQ2Text.trim() ? [{
              id: "q2",
              text: newCaseQ2Text.trim(),
              answer: newCaseQ2Answer.trim(),
              trustDelta: 15,
              revealsFact: newCaseQ2Answer.trim(),
              isScoop: true,
              scoopQuote: `"${newCaseQ2Answer.trim()}" tegas ${newCaseWitnessName.trim()}.`
            }] : [])
          ]
        }
      ]
    });

    if (created) {
      setActiveClassroomCase(created.id);
      setFeedback({ type: "success", text: `Kasus Baru '${created.title}' berhasil diterbitkan dan langsung diaktifkan untuk kelas!` });
      setIsCreatingCase(false);
      setNewCaseTitle("");
      setNewCaseLocation("");
      setNewCaseSummary("");
      setNewCaseWitnessName("");
      setNewCaseWitnessRole("");
      setNewCaseQ1Text("");
      setNewCaseQ1Answer("");
      setNewCaseQ1Fact("");
      setNewCaseQ2Text("");
      setNewCaseQ2Answer("");
      refresh();
    }
  };

  const handleClearTeamInterview = (teamId) => {
    sound.playClick();
    clearTeamPocketNotes(teamId, activeClassCase.id);
    setFeedback({ type: "success", text: "Catatan saku dan sesi wawancara biro ini berhasil direset." });
    refresh();
  };

  useEffect(() => {
    let tickCount = 0;
    const handleRemoteSync = () => {
      setTick(t => t + 1);
    };

    window.addEventListener("classroom-sync", handleRemoteSync);
    window.addEventListener("storage", handleRemoteSync);

    const timerInterval = setInterval(() => {
      setTimerState(getGlobalTimer());
      setFreezeState(getScreenFreeze());
      setTick(t => t + 1);
      tickCount++;
      if (tickCount % 2 === 0) {
        syncWithServerNow();
      }
    }, 1000);

    return () => {
      window.removeEventListener("classroom-sync", handleRemoteSync);
      window.removeEventListener("storage", handleRemoteSync);
      clearInterval(timerInterval);
    };
  }, []);

  const teams = getAllTeams();
  const currentStage = getClassroomStage();
  const logs = getPressWarLogs();

  const totalMembers = teams.reduce((acc, t) => acc + (t.members?.length || 0), 0);
  const totalCoins = teams.reduce((acc, t) => acc + (t.coins || 0), 0);
  const activeWorkingCount = teams.filter(t => [1, 2, 3].some(stg => getTeamStageTimer(t, stg).isRunning)).length;
  const allClassroomUsers = getAllClassroomUsers();
  const stage1DoneCount = teams.filter(t => isStageCompleted(t, 1)).length;
  const stage2DoneCount = teams.filter(t => isStageCompleted(t, 2)).length;
  const stage3DoneCount = teams.filter(t => isStageCompleted(t, 3)).length;

  const refresh = () => setTick(t => t + 1);

  // Format Timer MM:SS
  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Copy code helper
  const handleCopy = (text, label) => {
    sound.playClick();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
    setCopiedCode(text);
    setFeedback({ type: "success", text: `${label} (${text}) berhasil disalin ke clipboard!` });
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Copy direct auto-login link helper
  const handleCopyLink = (code, label) => {
    sound.playClick();
    const link = `${window.location.origin}/?code=${encodeURIComponent(code)}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(link);
    }
    setCopiedCode(code + "_link");
    setFeedback({ 
      type: "success", 
      text: `Tautan Masuk ${label} berhasil disalin! Bagikan ke WhatsApp siswa: ${link}` 
    });
    setTimeout(() => setCopiedCode(null), 3000);
  };

  // PIN Verification Handlers
  const handlePinSubmit = (e) => {
    e.preventDefault();
    sound.playClick();
    const cleanPin = pinInput.trim();
    if (cleanPin === "040498") {
      sound.playSuccess();
      try {
        sessionStorage.setItem('redaksi_admin_auth', 'true');
      } catch {
        // ignore
      }
      setIsAuthenticated(true);
      setPinError(null);
    } else {
      sound.playError();
      setPinError("PIN Admin salah. Silakan periksa kembali PIN Anda.");
    }
  };

  const handleAdminLogout = () => {
    sound.playClick();
    try {
      sessionStorage.removeItem('redaksi_admin_auth');
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    handleExit();
  };

  // PIN Gatekeeper Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-paper flex flex-col justify-between p-4">
        <div className="max-w-md mx-auto w-full pt-10 sm:pt-16 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 bg-paper-2/70 border border-rule px-3 py-1 rounded-full text-xs font-body text-ink-muted shadow-sm">
              <span className="w-2 h-2 rounded-full bg-accent-orange animate-pulse motion-reduce:animate-none"></span>
              <span className="text-ink font-medium">Gerbang Otoritas Dewan Redaksi & Guru</span>
            </div>
            <h1 className="font-display font-medium text-3xl sm:text-4xl text-ink tracking-tight">
              Pusat Komando
            </h1>
            <p className="font-body text-xs sm:text-sm text-ink-muted max-w-sm mx-auto leading-relaxed">
              Halaman khusus Guru Pengampu untuk mengatur biro, mengacak kode 5-karakter, orkestrasi kurikulum, dan rekap nilai.
            </p>
          </div>

          <div className="glass p-6 sm:p-8 space-y-5 shadow-card border border-rule">
            <div className="border-b border-rule/60 pb-3 flex items-center justify-between">
              <span className="font-body text-xs font-medium text-ink flex items-center gap-2">
                <Key className="w-4 h-4 text-accent-orange" />
                <span>Otentikasi Guru (PIN Keamanan)</span>
              </span>
              <span className="font-body text-[10px] bg-accent/15 text-accent border border-accent/30 rounded-full px-2.5 py-0.5 font-semibold">
                Hak Akses Penuh
              </span>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <label className="font-body text-xs font-medium text-ink-2 block mb-1.5">
                  Masukkan PIN Guru:
                </label>
                <div className="relative">
                  <input
                    type={showPin ? "text" : "password"}
                    placeholder="Masukkan 6-Digit PIN Admin"
                    maxLength={15}
                    value={pinInput}
                    onChange={(e) => { setPinInput(e.target.value); setPinError(null); }}
                    className="w-full p-3 text-center font-mono font-bold text-lg sm:text-xl tracking-normal pr-12 rounded-xl border border-rule bg-paper text-ink"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-ink-muted hover:text-ink transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                    title={showPin ? "Sembunyikan PIN" : "Tampilkan PIN"}
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {pinError && (
                <div className="p-3 bg-accent-red/15 border border-accent-red/30 rounded-xl text-xs font-body text-accent-red flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-accent-red shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}

              <button
                type="submit"
                className="neo-btn p-3.5 bg-accent text-accent-ink hover:bg-accent-hi font-body font-semibold text-sm rounded-full w-full flex items-center justify-center gap-2 transition-colors shadow-lg min-h-[44px] whitespace-nowrap"
              >
                <span>Buka Pusat Komando</span>
                <ArrowRight className="w-4 h-4 text-accent-ink shrink-0" />
              </button>
            </form>

            <div className="pt-2 border-t border-rule/50 flex justify-center">
              <button
                onClick={() => { sound.playClick(); handleExit(); }}
                className="text-xs font-body text-ink-muted hover:text-ink underline inline-flex items-center gap-1.5 transition-colors min-h-[40px]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Halaman Siswa</span>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center font-body text-xs text-ink-muted/70 py-4">
          Jurnal66 Task • Sistem Manajemen Kelas & Multiplayer Terintegrasi
        </div>
      </div>
    );
  }

  // 1. Generate Leader Code (Single or Custom)
  const handleGenerateLeaderCode = (e) => {
    if (e) e.preventDefault();
    sound.playStamp();
    const created = createUnassignedSlotByAdmin(
      customLeaderCode.trim().toUpperCase() || undefined,
      customMemberCode.trim().toUpperCase() || undefined
    );
    setFeedback({ 
      type: "success", 
      text: `Kode Mandat Ketua '${created.leaderCode}' sukses diterbitkan! Berikan kode ini kepada siswa Ketua Kelompok.` 
    });
    setCustomLeaderCode("");
    setCustomMemberCode("");
    refresh();
  };

  // 1B. Batch Generate Leader Codes (e.g. 3 or 5 groups at once)
  const handleBatchGenerateLeaderCodes = (count) => {
    sound.playStamp();
    const createdList = createBatchUnassignedSlotsByAdmin(count);
    const codesStr = createdList.map(t => t.leaderCode).join(", ");
    setFeedback({ 
      type: "success", 
      text: `${count} Kode Mandat Ketua Berhasil Diterbitkan: ${codesStr}. Berikan kepada para Ketua Kelompok!` 
    });
    refresh();
  };

  // 2. Global Stage Handler
  const handleSetGlobalStage = (num) => {
    sound.playStamp();
    setClassroomStage(num);
    if (num === 0) {
      setFeedback({ 
        type: "info", 
        text: "Sesi kelas dikembalikan ke Ruang Persiapan (Tahap 0). Seluruh siswa ditahan di lobi pra-sesi agar tidak curi start." 
      });
    } else {
      setFeedback({ 
        type: "success", 
        text: `Tahap ${num} (${journalismStages[num - 1]?.title}) resmi dibuka serentak untuk seluruh kelas!` 
      });
    }
    refresh();
  };

  // 2b. Reset Exercise Handler
  const handleResetExercise = async (keepTeams) => {
    sound.playStamp();
    setIsResetting(true);
    try {
      await resetClassroomExercise(keepTeams);
      setIsResetModalOpen(false);
      setFeedback({ 
        type: "success", 
        text: keepTeams 
          ? "Progres latihan kelas berhasil di-reset! Seluruh biro kini kembali ke Ruang Persiapan (Tahap 0) dengan data bersih." 
          : "Seluruh data biro dan siswa berhasil dihapus. Meja guru kembali ke kondisi awal." 
      });
      refresh();
    } catch (err) {
      setFeedback({ type: "error", text: "Gagal mereset latihan: " + err.message });
    } finally {
      setIsResetting(false);
    }
  };

  // 3. Adjust Coins Handler
  const handleCoinDelta = (teamId, delta, reason) => {
    sound.playClick();
    const updated = adminAdjustCoins(teamId, delta, reason);
    if (updated) {
      sound.playSuccess();
      setFeedback({ type: "success", text: `Saldo ${updated.name} berhasil disesuaikan (${delta >= 0 ? `+${delta}` : delta} Koin). Total: ${updated.coins} Koin.` });
      refresh();
    }
  };

  // 4. Regenerate Codes Handler
  const handleRegenerateCodes = (teamId) => {
    sound.playStamp();
    const updated = adminRegenerateCodes(teamId);
    if (updated) {
      setFeedback({ type: "success", text: `Kode 5-karakter baru diterbitkan untuk ${updated.name}: Ketua [${updated.leaderCode}] | Anggota [${updated.memberCode}]` });
      refresh();
    }
  };

  // 5. Delete Team Handler (Using custom in-app modal instead of browser window.confirm)
  const handleDeleteTeam = (team) => {
    sound.playClick();
    setTeamToDisband(team);
  };

  const confirmDisbandTeam = () => {
    if (!teamToDisband) return;
    sound.playStamp();
    adminDeleteTeam(teamToDisband.id);
    setFeedback({ type: "success", text: `Biro '${teamToDisband.name}' berhasil dibubarkan!` });
    setTeamToDisband(null);
    refresh();
  };

  // 6. Quick Member Add Handler
  const handleAddMemberToTeam = (teamId) => {
    if (!newMemberName.trim() || !newMemberClass.trim()) {
      sound.playError();
      return;
    }
    sound.playStamp();
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    const updatedMembers = [
      ...(team.members || []),
      {
        name: newMemberName.trim(),
        classInfo: newMemberClass.trim(),
        role: newMemberRole,
        isLeader: false
      }
    ];

    registerOrUpdateTeam({ ...team, members: updatedMembers });
    setFeedback({ type: "success", text: `${newMemberName.trim()} (${newMemberClass.trim()}) berhasil ditambahkan ke ${team.name}!` });
    setNewMemberName("");
    setNewMemberClass("");
    setAddMemberTeamId(null);
    refresh();
  };

  // 6B. Save Team Details (Ubah Nama Kelompok, Ketua, Kelas, Kode)
  const handleSaveTeamDetails = (teamId) => {
    if (!editTeamName.trim()) {
      sound.playError();
      setFeedback({ type: "error", text: "Nama Kelompok / Biro tidak boleh kosong!" });
      return;
    }
    sound.playStamp();
    const updated = adminUpdateTeamDetails(teamId, {
      name: editTeamName.trim(),
      leaderName: editTeamLeaderName.trim(),
      leaderClass: editTeamLeaderClass.trim(),
      leaderCode: editTeamLeaderCode.trim().toUpperCase() || undefined,
      memberCode: editTeamMemberCode.trim().toUpperCase() || undefined,
      assignedVariationIndex: parseInt(editTeamVariationIndex, 10)
    });
    if (updated) {
      setFeedback({
        type: "success",
        text: `Data biro '${updated.name}' berhasil diperbarui!`
      });
      setEditingTeamId(null);
      refresh();
    }
  };

  // 6C. Save Member Details (Ubah Nama Anggota, Kelas, Peran, Status Ketua)
  const handleSaveMemberDetails = (teamId, memberIndex) => {
    if (!editMemberName.trim()) {
      sound.playError();
      setFeedback({ type: "error", text: "Nama Anggota tidak boleh kosong!" });
      return;
    }
    sound.playStamp();
    const updated = adminUpdateMemberDetails(teamId, memberIndex, {
      name: editMemberName.trim(),
      classInfo: editMemberClass.trim() || "-",
      role: editMemberRole,
      isLeader: editMemberIsLeader
    });
    if (updated) {
      setFeedback({
        type: "success",
        text: `Data anggota '${editMemberName.trim()}' di ${updated.name} berhasil diperbarui!`
      });
      setEditingMemberKey(null);
      refresh();
    }
  };

  // 7. Remove Member Handler
  const handleRemoveMember = (teamId, memberName) => {
    sound.playClick();
    adminRemoveMember(teamId, memberName);
    setFeedback({ type: "success", text: `${memberName} dikeluarkan dari biro.` });
    refresh();
  };

  // 8. Reassign Role Handler
  const handleRoleChange = (teamId, memberName, newRole, isLeader = false) => {
    sound.playClick();
    adminUpdateMemberRole(teamId, memberName, newRole, isLeader);
    setFeedback({ type: "success", text: `Peran ${memberName} diubah menjadi '${newRole}'.` });
    refresh();
  };

  // 9. Stage Override Handler
  const handleTeamStageOverride = (teamId, stageNum) => {
    sound.playStamp();
    adminSetTeamStage(teamId, stageNum);
    setFeedback({ type: "success", text: `Progres biro disesuaikan ke Tahap ${stageNum}.` });
    refresh();
  };

  // 10. Clear Debuffs Handler
  const handleClearDebuffs = (teamId) => {
    sound.playSuccess();
    const updated = adminClearDebuffs(teamId);
    setFeedback({ type: "success", text: `Pemutihan sukses! Seluruh sanksi/debuff pada ${updated.name} dihapus dan diberikan Perisai Hak Jawab.` });
    refresh();
  };

  // 11. Broadcast Alert Handler
  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastMsg.trim()) return;
    sound.playStamp();
    adminBroadcastAlert(broadcastMsg.trim(), broadcastPriority);
    setFeedback({ type: "success", text: "Siaran darurat berhasil dikirim ke layar seluruh biro!" });
    setBroadcastMsg("");
    refresh();
  };

  // 12. Save Rubric Grade Handler
  const handleSaveRubric = (teamId) => {
    sound.playStamp();
    const currentInput = rubricInputs[teamId] || {};
    const team = teams.find(t => t.id === teamId);
    const existingRubric = team?.rubricScores || {};

    const factAccuracy = currentInput.factAccuracy !== undefined ? currentInput.factAccuracy : (existingRubric.factAccuracy || 80);
    const pyramidStructure = currentInput.pyramidStructure !== undefined ? currentInput.pyramidStructure : (existingRubric.pyramidStructure || 80);
    const journalismLanguage = currentInput.journalismLanguage !== undefined ? currentInput.journalismLanguage : (existingRubric.journalismLanguage || 80);
    const notes = currentInput.notes !== undefined ? currentInput.notes : (team?.teacherNotes || "");

    const updated = adminSaveRubricGrade(teamId, {
      factAccuracy,
      pyramidStructure,
      journalismLanguage,
      notes
    });

    if (updated) {
      setFeedback({ type: "success", text: `Nilai Rubrik Jurnalistik untuk ${updated.name} berhasil disimpan! Rata-rata: ${updated.rubricScores?.total}/100.` });
      refresh();
    }
  };

  // 13. Download Gradebook CSV Handler
  const handleDownloadCSV = () => {
    sound.playStamp();
    const csvData = generateGradebookCSV();
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `rekap-nilai-jurnalistik-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setFeedback({ type: "success", text: "File Rekap Nilai CSV berhasil diunduh ke perangkat Anda!" });
  };

  // 14. Screen Freeze Toggle Handler
  const handleToggleFreeze = () => {
    sound.playStamp();
    const nextState = !freezeState.isFrozen;
    const updated = setScreenFreeze(nextState, freezePromptInput);
    setFreezeState(updated);
    setFeedback({ 
      type: "success", 
      text: nextState ? "Layar seluruh siswa DIKUNCI (Mode Perhatian Guru Aktif)!" : "Layar siswa DIBUKA KEMBALI!" 
    });
    refresh();
  };

  // 15. Global Timer Handlers
  const handleStartTimer = (mins) => {
    sound.playStamp();
    const updated = startGlobalTimer(mins);
    setTimerState(updated);
    setFeedback({ type: "success", text: `Timer Ujian Jurnalistik dimulai: ${mins} Menit!` });
    refresh();
  };

  const handleStopTimer = () => {
    sound.playClick();
    const updated = stopGlobalTimer();
    setTimerState(updated);
    setFeedback({ type: "success", text: "Timer sesi redaksi dihentikan." });
    refresh();
  };

  const handleAddMinutes = (mins) => {
    sound.playClick();
    const updated = addGlobalTimerMinutes(mins);
    setTimerState(updated);
    setFeedback({ type: "success", text: `Perpanjangan waktu +${mins} menit berhasil ditambahkan ke seluruh layar siswa!` });
    refresh();
  };

  // PROJECTOR MODE (Papan Skor Smartboard Layar Penuh)
  if (isProjectorMode) {
    const sortedLeaderboard = getClassroomLeaderboard(teams);

    return (
      <div className="min-h-screen bg-paper text-ink p-4 sm:p-8 flex flex-col justify-between">
        <div className="max-w-7xl mx-auto w-full space-y-6">
          {/* Projector Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-rule pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-accent-green animate-pulse motion-reduce:animate-none"></span>
                <span className="font-body text-xs text-accent font-semibold">
                  Dewan pers pendidikan siswa • Papan skor proyektor smartboard
                </span>
              </div>
              <h1 className="font-display font-medium text-3xl sm:text-5xl text-ink tracking-tight mt-1">
                Klasemen Redaksi & Penilaian Waktu Kelas
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {timerState.isRunning && (
                <div className="bg-accent-orange/15 border border-accent-orange/30 text-accent-orange px-4 py-2 rounded-2xl flex items-center gap-2 font-mono text-lg font-bold shadow-sm">
                  <Clock className="w-5 h-5 animate-spin motion-reduce:animate-none" />
                  <span>Sisa: {formatTimer(timerState.remainingSeconds)}</span>
                </div>
              )}
              <button
                onClick={() => { sound.playClick(); setIsProjectorMode(false); }}
                className="rounded-full bg-paper-2 hover:bg-paper-3 border border-rule px-4 py-2 text-xs font-body font-semibold text-ink transition-colors shadow-sm min-h-[44px]"
              >
                Keluar Mode Proyektor
              </button>
            </div>
          </div>

          {/* Leaderboard Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedLeaderboard.map((item) => {
              const t = item.team;
              const isFirst = item.rank === 1;

              return (
                <div 
                  key={item.id}
                  className={`glass p-5 rounded-2xl border transition-colors shadow-card space-y-3 ${
                    isFirst ? "border-accent ring-2 ring-accent/30 bg-accent/5" : "border-rule"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-9 h-9 rounded-xl font-display font-bold text-sm flex items-center justify-center ${
                        isFirst ? "bg-accent text-accent-ink" : "bg-paper-2 text-ink border border-rule"
                      }`}>
                        #{item.rank}
                      </span>
                      <div>
                        <h3 className="font-display font-medium text-lg text-ink truncate max-w-[180px]">
                          {item.name}
                        </h3>
                        <span className="font-body text-xs text-ink-muted">
                          Ketua: {item.leaderName} ({item.leaderClass})
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-display font-bold text-xl text-accent block">
                        {item.finalScore} <span className="text-xs text-ink-muted font-normal">/ 100</span>
                      </span>
                      <span className="font-body text-xs text-accent-orange font-semibold inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Total: {item.formattedTotalDuration}</span>
                      </span>
                    </div>
                  </div>

                  {/* Stage Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-body text-ink-muted">
                      <span>Progres Jurnalistik:</span>
                      <span className="font-semibold text-ink">{item.completedCount}/3 Tahap Selesai</span>
                    </div>
                    <div className="w-full bg-paper-2 rounded-full h-2 overflow-hidden border border-rule">
                      <div className="bg-accent h-full w-full rounded-full origin-left transition-transform duration-500" style={{ transform: `scaleX(${item.completedCount / 3})` }}></div>
                    </div>
                  </div>

                  {/* Stage Working Times (Live / Paused) */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1 text-[11px] font-body">
                    {[1, 2, 3].map((stg) => {
                      const timer = getTeamStageTimer(t, stg);
                      const isDone = isStageCompleted(t, stg);
                      return (
                        <div 
                          key={stg} 
                          className={`p-1.5 rounded-lg border flex flex-col items-center justify-center text-center ${
                            isDone 
                              ? "bg-accent-green/10 border-accent-green/30 text-accent-green" 
                              : timer.isRunning 
                              ? "bg-accent/15 border-accent text-accent animate-pulse motion-reduce:animate-none" 
                              : "bg-paper-2 border-rule text-ink-muted"
                          }`}
                        >
                          <span className="text-[10px] font-body font-semibold text-ink-muted">Tahap {stg}</span>
                          <span className="font-semibold flex items-center gap-1">
                            {isDone ? (
                              <>
                                <Pause className="w-2.5 h-2.5 fill-current" />
                                <span>{formatDuration(timer.seconds)}</span>
                              </>
                            ) : timer.isRunning ? (
                              <>
                                <Play className="w-2.5 h-2.5 fill-current" />
                                <span>{formatDuration(timer.seconds)}</span>
                              </>
                            ) : (
                              <span>-</span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Predicate */}
                  <div className="pt-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border ${item.badgeColor}`}>
                      <Award className="w-3 h-3" /> {item.predicate}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live News Ticker at bottom */}
        <div className="mt-8 border-t border-rule pt-4 flex items-center gap-3 overflow-hidden">
          <span className="bg-accent text-accent-ink font-body text-xs font-semibold px-3 py-1 rounded-full shrink-0">
            RADAR PERS LIVE
          </span>
          <div className="overflow-hidden flex-1 relative font-body text-xs text-ink-2">
            <div className="animate-ticker motion-reduce:animate-none">
              {logs.map((l, i) => (
                <span key={i} className="mr-8 font-medium">
                  {l.text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- LEADERBOARD & FINAL ASSESSMENT COMPONENT ---
  const renderLeaderboardSection = () => {
    const leaderboard = getClassroomLeaderboard(teams);

    return (
      <div className="glass p-5 sm:p-6 rounded-2xl border border-rule shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-rule/60 pb-3.5">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent-yellow inline shrink-0" />
              <h3 className="font-display font-medium text-xl text-ink">
                Papan Peringkat & Penilaian Akhir (Leaderboard Siapa yang Duluan)
              </h3>
            </div>
            <p className="font-body text-xs text-ink-muted mt-0.5">
              Diurutkan berdasarkan kelulusan tahap (3/3), waktu total pengerjaan tercepat (siapa yang duluan tuntas), dan akurasi skor akhir.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCSV}
              className="rounded-full bg-accent text-accent-ink hover:bg-accent-hi text-xs font-body font-semibold gap-1.5 px-3.5 py-2 inline-flex items-center shadow-sm min-h-[40px]"
              title="Unduh Rekap Spreadsheet CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="rounded-full bg-paper-2 hover:bg-paper-3 border border-rule text-ink text-xs font-body font-medium gap-1.5 px-3 py-2 inline-flex items-center shadow-sm min-h-[40px]"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>
          </div>
        </div>

        {leaderboard.length === 0 ? (
          <div className="text-center py-8 text-ink-muted font-body text-sm">
            Belum ada biro terdaftar. Terbitkan kode mandat ketua untuk memulai kelas!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-body">
              <thead>
                <tr className="border-b border-rule/60 text-ink-muted font-medium text-[10px]">
                  <th className="py-3 px-3">Peringkat</th>
                  <th className="py-3 px-3">Biro Redaksi</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-2 text-center">T1 (5W1H)</th>
                  <th className="py-3 px-2 text-center">T2 (Piramida)</th>
                  <th className="py-3 px-2 text-center">T3 (Menulis)</th>
                  <th className="py-3 px-3 text-center font-bold text-accent">Waktu Total</th>
                  <th className="py-3 px-3 text-center">Skor Akhir</th>
                  <th className="py-3 px-3 text-left">Predikat Jurnalistik</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule/40 font-body">
                {leaderboard.map((item) => {
                  const isTop1 = item.rank === 1;
                  const rankIcon = item.rank === 1 ? "#1" : item.rank === 2 ? "#2" : item.rank === 3 ? "#3" : `#${item.rank}`;

                  return (
                    <tr 
                      key={item.id} 
                      className={`transition-colors ${
                        isTop1 ? "bg-accent/10 hover:bg-accent/15" : "hover:bg-paper-2/50"
                      }`}
                    >
                      {/* Peringkat */}
                      <td className="py-3 px-3 whitespace-nowrap font-display font-bold text-sm">
                        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-xl text-xs ${
                          item.rank === 1 ? "bg-accent-yellow/20 text-accent-yellow border border-accent-yellow/40 font-bold" :
                          item.rank === 2 ? "bg-paper-3 text-ink border border-rule font-semibold" :
                          item.rank === 3 ? "bg-accent-orange/20 text-accent-orange border border-accent-orange/30 font-semibold" :
                          "text-ink-muted"
                        }`}>
                          {rankIcon}
                        </span>
                      </td>

                      {/* Biro Redaksi */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-display font-medium text-sm text-ink">{item.name}</div>
                        <div className="text-[11px] text-ink-muted">
                          Ketua: <strong>{item.leaderName}</strong> ({item.leaderClass}) • {item.memberCount} Siswa
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {item.isAllCompleted ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-accent-green/20 text-accent-green border border-accent-green/40 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Lulus (3/3)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-accent-orange/15 text-accent-orange border border-accent-orange/30 px-2 py-0.5 rounded-full">
                            <span>Tahap #{item.completedCount + 1}</span>
                            <span className="text-ink-muted">({item.completedCount}/3)</span>
                          </span>
                        )}
                      </td>

                      {/* Durasi T1 */}
                      <td className="py-3 px-2 text-center font-mono whitespace-nowrap text-[11px]">
                        <span className={item.completedStages.includes(1) ? "text-accent-green font-semibold" : "text-ink-muted"}>
                          {item.formattedT1}
                        </span>
                      </td>

                      {/* Durasi T2 */}
                      <td className="py-3 px-2 text-center font-mono whitespace-nowrap text-[11px]">
                        <span className={item.completedStages.includes(2) ? "text-accent-green font-semibold" : "text-ink-muted"}>
                          {item.formattedT2}
                        </span>
                      </td>

                      {/* Durasi T3 */}
                      <td className="py-3 px-2 text-center font-mono whitespace-nowrap text-[11px]">
                        <span className={item.completedStages.includes(3) ? "text-accent-green font-semibold" : "text-ink-muted"}>
                          {item.formattedT3}
                        </span>
                      </td>

                      {/* Waktu Total Kerja (Penentu Siapa yang Duluan) */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-mono text-xs font-bold bg-accent/15 text-accent border border-accent/30 px-2.5 py-1 rounded-xl shadow-2xs">
                          <Clock className="w-3 h-3" />
                          <span>{item.formattedTotalDuration}</span>
                        </span>
                      </td>

                      {/* Skor Akhir */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className="font-display font-bold text-base text-ink">
                          {item.finalScore}
                        </span>
                        <span className="text-[10px] text-ink-muted font-normal"> / 100</span>
                      </td>

                      {/* Predikat Jurnalistik */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                          <Award className="w-3 h-3" />
                          <span>{item.predicate}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-paper text-ink pb-12">
      {/* Top Admin Masthead Banner */}
      <header className="backdrop-blur-xl bg-paper/90 border-b border-rule sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-accent/20 border border-accent/40 text-accent flex items-center justify-center font-display font-semibold text-lg shadow-sm">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-medium text-base sm:text-lg tracking-tight text-ink">
                  Dewan Pers Pendidikan • Meja Guru
                </span>
                <span className="bg-accent-orange/15 text-accent-orange border border-accent-orange/30 rounded-full text-[10px] font-body font-semibold px-2 py-0.2">
                  Otoritas Penuh
                </span>
              </div>
              <p className="font-body text-xs text-ink-muted">
                Pusat Kendali Kurikulum Jurnalistik, Kode 5-Karakter, dan Manajemen Kelompok
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Projector Mode Trigger */}
            <button
              onClick={() => { sound.playClick(); setIsProjectorMode(true); }}
              className="rounded-full bg-accent text-accent-ink hover:bg-accent-hi text-xs font-body font-semibold gap-1.5 px-3.5 py-2 shadow-sm inline-flex items-center min-h-[42px]"
              title="Tampilkan Mode Layar Penuh untuk Proyektor Smartboard di Depan Kelas"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Papan Skor Proyektor</span>
            </button>

            <button
              onClick={() => { sound.playClick(); setActiveTab("solutions"); }}
              className={`rounded-full text-xs font-body font-semibold gap-1.5 px-3.5 py-2 shadow-sm inline-flex items-center min-h-[42px] transition-colors ${
                activeTab === "solutions"
                  ? "bg-accent-yellow text-paper font-bold shadow-md"
                  : "bg-accent-yellow/20 hover:bg-accent-yellow/30 text-accent-yellow border border-accent-yellow/40"
              }`}
              title="Buka Kunci Jawaban Lengkap Tahap 1, 2, 3 & Saksi Wawancara"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Kunci Jawaban</span>
            </button>

            {/* Reset Exercise Trigger */}
            <button
              onClick={() => { sound.playClick(); setIsResetModalOpen(true); }}
              className="rounded-full bg-accent-red/20 hover:bg-accent-red hover:text-white text-accent-red border border-accent-red/40 text-xs font-body font-semibold gap-1.5 px-3.5 py-2 shadow-sm inline-flex items-center min-h-[42px] transition-colors"
              title="Reset Progres Latihan Kelas untuk Mengulang Simulasi"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Latihan</span>
            </button>

            <button
              onClick={() => { sound.playClick(); window.print(); }}
              className="rounded-full bg-paper-2/70 hover:bg-paper-2 border border-rule text-xs font-body font-medium text-ink gap-1.5 px-3.5 py-2 shadow-sm inline-flex items-center min-h-[42px]"
              title="Cetak lembar kode & rekap biro untuk guru"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak Rekap</span>
            </button>

            <button
              onClick={() => { sound.playClick(); handleExit(); }}
              className="rounded-full bg-paper-2 hover:bg-paper-3 text-ink border border-rule text-xs font-body font-semibold gap-1.5 px-3.5 py-2 shadow-sm inline-flex items-center min-h-[42px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ke Siswa</span>
            </button>

            <button
              onClick={handleAdminLogout}
              className="rounded-full bg-accent-red/15 hover:bg-accent-red hover:text-paper text-accent-red border border-accent-red/30 text-xs font-body font-medium gap-1.5 px-3 py-2 shadow-sm inline-flex items-center min-h-[42px]"
              title="Kunci / Logout dari Meja Guru"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Kunci</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-6 space-y-6">
        {/* Quick Stats Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="glass p-4 rounded-xl border border-rule shadow-card">
            <span className="font-body text-xs text-ink-muted block font-medium">Total biro aktif</span>
            <span className="font-display font-medium text-2xl text-ink tracking-tight mt-1 block">{teams.length} Kelompok</span>
          </div>
          <div className="glass p-4 rounded-xl border border-rule shadow-card">
            <span className="font-body text-xs text-ink-muted block font-medium">Total siswa terdaftar</span>
            <span className="font-display font-medium text-2xl text-accent-orange tracking-tight mt-1 block">{totalMembers} Siswa</span>
          </div>
          <div className="glass p-4 rounded-xl border border-rule shadow-card">
            <span className="font-body text-xs text-ink-muted block font-medium">Tahap kelas aktif</span>
            <span className="font-display font-medium text-2xl text-accent-green tracking-tight mt-1 block">
              {currentStage === 0 ? "Pra-Sesi" : `Tahap #${currentStage}`}
            </span>
          </div>
          <div className="glass p-4 rounded-xl border border-rule shadow-card">
            <span className="font-body text-xs text-ink-muted block font-medium">Tim sedang kerja</span>
            <span className="font-display font-medium text-xl text-accent tracking-tight mt-1 flex items-center gap-1.5">
              <Clock className={`w-5 h-5 ${activeWorkingCount > 0 ? "text-accent animate-spin motion-reduce:animate-none" : "text-ink-muted"}`} />
              <span>{activeWorkingCount} Biro Berjalan</span>
            </span>
          </div>
          <div className="glass p-4 rounded-xl border border-rule shadow-card">
            <span className="font-body text-xs text-ink-muted block font-medium">Total koin kas kelas</span>
            <span className="font-display font-medium text-2xl text-accent tracking-tight mt-1 flex items-center gap-1.5">
              <Coins className="w-6 h-6 text-accent-orange" />
              <span>{totalCoins}</span>
            </span>
          </div>
        </div>

        {/* CLASSROOM STAGE PACING ORCHESTRATION BAR */}
        <div className="glass p-4 sm:p-5 rounded-2xl border border-rule shadow-card flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                currentStage === 0 
                  ? "bg-accent-orange animate-pulse" 
                  : "bg-accent-green animate-pulse"
              }`}></span>
              <strong className="font-display font-semibold text-sm sm:text-base text-ink">
                Orkestrasi Pacing Sesi:
              </strong>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                currentStage === 0
                  ? "bg-accent-orange/15 text-accent-orange border-accent-orange/30"
                  : "bg-accent/15 text-accent border border-accent/30"
              }`}>
                {currentStage === 0 
                  ? "Ruang Persiapan (Tahap 0)" 
                  : `Tahap ${currentStage}: ${journalismStages[currentStage - 1]?.title || "Materi"}`}
              </span>
            </div>
            <p className="font-body text-xs text-ink-muted">
              {currentStage === 0 && "Seluruh biro ditahan di ruang persiapan agar tidak curi start. Klik Buka Tahap 1 ketika kelas siap."}
              {currentStage === 1 && `Tahap 1 berlangsung. ${stage1DoneCount} dari ${teams.length} biro selesai & menunggu di Ruang Tunggu.`}
              {currentStage === 2 && `Tahap 2 berlangsung. ${stage2DoneCount} dari ${teams.length} biro selesai & menunggu di Ruang Tunggu.`}
              {currentStage === 3 && `Tahap 3 berlangsung. ${stage3DoneCount} dari ${teams.length} biro selesai menerbitkan naskah berita.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Quick Next Stage Step Action Button */}
            {currentStage === 0 && (
              <button
                onClick={() => handleSetGlobalStage(1)}
                className="rounded-full bg-accent hover:bg-accent-hi text-accent-ink font-body font-semibold text-xs px-4 py-2 transition-colors shadow-sm inline-flex items-center gap-1.5 min-h-[38px] active:scale-95 focus-visible:outline-2 focus-visible:outline-accent"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Buka Tahap 1 Serentak</span>
              </button>
            )}
            {currentStage === 1 && (
              <button
                onClick={() => handleSetGlobalStage(2)}
                className="rounded-full bg-accent hover:bg-accent-hi text-accent-ink font-body font-semibold text-xs px-4 py-2 transition-colors shadow-sm inline-flex items-center gap-1.5 min-h-[38px] active:scale-95 focus-visible:outline-2 focus-visible:outline-accent"
              >
                <span>Buka Tahap 2 Serentak ({stage1DoneCount}/{teams.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {currentStage === 2 && (
              <button
                onClick={() => handleSetGlobalStage(3)}
                className="rounded-full bg-accent hover:bg-accent-hi text-accent-ink font-body font-semibold text-xs px-4 py-2 transition-colors shadow-sm inline-flex items-center gap-1.5 min-h-[38px] active:scale-95 focus-visible:outline-2 focus-visible:outline-accent"
              >
                <span>Buka Tahap 3 Serentak ({stage2DoneCount}/{teams.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {currentStage === 3 && (
              <button
                onClick={() => setActiveTab("leaderboard")}
                className="rounded-full bg-accent-orange hover:bg-accent-orange/90 text-white font-body font-semibold text-xs px-4 py-2 transition-colors shadow-sm inline-flex items-center gap-1.5 min-h-[38px] active:scale-95 focus-visible:outline-2 focus-visible:outline-accent"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Lihat Rekap Nilai ({stage3DoneCount}/{teams.length})</span>
              </button>
            )}

            {/* Quick Step Selectors (0, 1, 2, 3) */}
            <div className="inline-flex rounded-full bg-paper-2 border border-rule p-0.5 gap-0.5">
              <button
                onClick={() => handleSetGlobalStage(0)}
                title="Tahan semua biro di Lobi Pra-Sesi (Tahap 0)"
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors min-h-[32px] ${
                  currentStage === 0 
                    ? "bg-accent-orange text-white" 
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                Persiapan (0)
              </button>
              <button
                onClick={() => handleSetGlobalStage(1)}
                title="Buka Tahap 1: 5W+1H"
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors min-h-[32px] ${
                  currentStage === 1 
                    ? "bg-accent text-accent-ink" 
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                Tahap 1
              </button>
              <button
                onClick={() => handleSetGlobalStage(2)}
                title="Buka Tahap 2: Piramida Terbalik"
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors min-h-[32px] ${
                  currentStage === 2 
                    ? "bg-accent text-accent-ink" 
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                Tahap 2
              </button>
              <button
                onClick={() => handleSetGlobalStage(3)}
                title="Buka Tahap 3: Menulis Berita Utuh"
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors min-h-[32px] ${
                  currentStage === 3 
                    ? "bg-accent text-accent-ink" 
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                Tahap 3
              </button>
            </div>
          </div>
        </div>

        {/* TEACHER COMMAND TOOLBAR: TIMER & SCREEN FREEZE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Exam Session Countdown Timer */}
          <div className="glass p-5 rounded-2xl border border-rule shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent-orange" />
                <span className="font-display font-medium text-sm text-ink">
                  Timer Sesi Penulisan Berita
                </span>
              </div>
              <span className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded-full ${
                timerState.isRunning 
                  ? "bg-accent-green/20 text-accent-green border border-accent-green/30" 
                  : "bg-paper-2 text-ink-muted border border-rule"
              }`}>
                {timerState.isRunning ? `BERJALAN: ${formatTimer(timerState.remainingSeconds)}` : "Tidak aktif"}
              </span>
            </div>

            <p className="font-body text-xs text-ink-2 leading-relaxed">
              Atur alokasi waktu penyelesaian (minimal 30 menit). Waktu tersisa akan disiarkan langsung ke seluruh header siswa.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => handleStartTimer(30)}
                className="rounded-full bg-accent/20 hover:bg-accent hover:text-accent-ink text-accent border border-accent/30 text-xs font-body font-semibold px-3.5 py-2 transition-colors shadow-sm min-h-[40px]"
              >
                Mulai 30 Menit
              </button>
              <button
                onClick={() => handleStartTimer(45)}
                className="rounded-full bg-accent/20 hover:bg-accent hover:text-accent-ink text-accent border border-accent/30 text-xs font-body font-semibold px-3.5 py-2 transition-colors shadow-sm min-h-[40px]"
              >
                Mulai 45 Menit
              </button>
              <button
                onClick={() => handleAddMinutes(5)}
                disabled={!timerState.isRunning}
                className="rounded-full bg-accent-orange/20 hover:bg-accent-orange hover:text-white text-accent-orange border border-accent-orange/30 text-xs font-body font-semibold px-3.5 py-2 transition-colors shadow-sm disabled:opacity-40 min-h-[40px]"
              >
                +5 Menit
              </button>
              <button
                onClick={handleStopTimer}
                disabled={!timerState.isRunning}
                className="rounded-full bg-paper-2 hover:bg-paper-3 border border-rule text-xs font-body font-medium text-ink px-3.5 py-2 transition-colors shadow-sm disabled:opacity-40 min-h-[40px]"
              >
                Hentikan Timer
              </button>
            </div>
          </div>

          {/* Card 2: Screen Freeze / Focus Mode ("Pena Diturunkan!") */}
          <div className={`glass p-5 rounded-2xl border transition-colors shadow-card space-y-3 ${
            freezeState.isFrozen ? "border-accent-red/60 bg-accent-red/5" : "border-rule"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className={`w-4 h-4 ${freezeState.isFrozen ? "text-accent-red animate-pulse motion-reduce:animate-none" : "text-accent"}`} />
                <span className="font-display font-medium text-sm text-ink">
                  Mode Perhatian Guru (Kunci Layar)
                </span>
              </div>
              <span className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded-full ${
                freezeState.isFrozen 
                  ? "bg-accent-red/20 text-accent-red border border-accent-red/30 animate-pulse motion-reduce:animate-none" 
                  : "bg-paper-2 text-ink-muted border border-rule"
              }`}>
                {freezeState.isFrozen ? "Layar dikunci" : "Bebas aktif"}
              </span>
            </div>

            <p className="font-body text-xs text-ink-2 leading-relaxed">
              Jeda seketika seluruh layar siswa ketika Anda ingin memberikan penjelasan penting atau instruksi di depan kelas.
            </p>

            <div className="pt-1 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Pesan instruksi guru..."
                value={freezePromptInput}
                onChange={(e) => setFreezePromptInput(e.target.value)}
                className="w-full p-2.5 text-base sm:text-xs font-body font-medium rounded-xl border border-rule bg-paper-2/60"
              />
              <button
                onClick={handleToggleFreeze}
                className={`rounded-full px-5 py-2.5 text-xs font-body font-semibold whitespace-nowrap transition-colors shadow-sm min-h-[44px] ${
                  freezeState.isFrozen
                    ? "bg-accent-green text-white hover:bg-accent-green/90"
                    : "bg-accent-red text-white hover:bg-accent-red/90"
                }`}
              >
                {freezeState.isFrozen ? "Buka Kembali Layar Siswa" : "Kunci Seluruh Layar Siswa"}
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`p-3.5 border rounded-xl font-body text-xs font-medium flex items-center justify-between gap-2 shadow-sm ${
            feedback.type === "success" 
              ? "bg-accent-green/15 border-accent-green/30 text-accent-green" 
              : "bg-accent-red/15 border-accent-red/30 text-accent-red"
          }`}>
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 shrink-0" />
              <span>{feedback.text}</span>
            </div>
            <button 
              onClick={() => setFeedback(null)} 
              className="rounded-full bg-paper-2 hover:bg-paper-3 border border-rule/60 px-3 py-1.5 text-ink text-xs font-semibold shrink-0 min-h-[38px] min-w-[48px]"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Tab Navigation Menu (Dusk Segmented Glass Control) */}
        <div className="flex p-1 bg-paper-2/50 border border-rule rounded-2xl shadow-card backdrop-blur-md overflow-x-auto gap-1 no-scrollbar touch-pan-x w-full">
          <button
            onClick={() => { sound.playClick(); setActiveTab("leaderboard"); }}
            className={`p-2.5 px-3 sm:px-4 rounded-xl flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors min-h-[44px] ${
              activeTab === "leaderboard" 
                ? "bg-accent text-accent-ink font-semibold shadow-sm" 
                : "text-ink-muted hover:text-ink hover:bg-paper-2/40"
            }`}
          >
            <Award className="w-4 h-4 shrink-0 text-accent-yellow" />
            <span className="text-xs sm:text-sm font-semibold">Papan Peringkat & Penilaian</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveTab("teams"); }}
            className={`p-2.5 px-3 sm:px-4 rounded-xl flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors min-h-[44px] ${
              activeTab === "teams" 
                ? "bg-accent text-accent-ink font-semibold shadow-sm" 
                : "text-ink-muted hover:text-ink hover:bg-paper-2/40"
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span className="text-xs sm:text-sm hidden sm:inline">1. Biro & Kode 5-Karakter ({teams.length})</span>
            <span className="text-xs sm:hidden font-medium">1. Biro ({teams.length})</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveTab("stages"); }}
            className={`p-2.5 px-3 sm:px-4 rounded-xl flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors min-h-[44px] ${
              activeTab === "stages" 
                ? "bg-accent text-accent-ink font-semibold shadow-sm" 
                : "text-ink-muted hover:text-ink hover:bg-paper-2/40"
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span className="text-xs sm:text-sm hidden sm:inline">2. Orkestrasi Tahap & Kurikulum</span>
            <span className="text-xs sm:hidden font-medium">2. Tahap</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveTab("economy"); }}
            className={`p-2.5 px-3 sm:px-4 rounded-xl flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors min-h-[44px] ${
              activeTab === "economy" 
                ? "bg-accent text-accent-ink font-semibold shadow-sm" 
                : "text-ink-muted hover:text-ink hover:bg-paper-2/40"
            }`}
          >
            <Coins className="w-4 h-4 shrink-0" />
            <span className="text-xs sm:text-sm hidden sm:inline">3. Bank Kas & Intervensi Sabotase</span>
            <span className="text-xs sm:hidden font-medium">3. Kas & Kartu</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveTab("broadcast"); }}
            className={`p-2.5 px-3 sm:px-4 rounded-xl flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors min-h-[44px] ${
              activeTab === "broadcast" 
                ? "bg-accent text-accent-ink font-semibold shadow-sm" 
                : "text-ink-muted hover:text-ink hover:bg-paper-2/40"
            }`}
          >
            <Megaphone className="w-4 h-4 shrink-0" />
            <span className="text-xs sm:text-sm hidden sm:inline">4. Siaran Darurat & Radar Berita ({logs.length})</span>
            <span className="text-xs sm:hidden font-medium">4. Siaran ({logs.length})</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveTab("grades"); }}
            className={`p-2.5 px-3 sm:px-4 rounded-xl flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors min-h-[44px] ${
              activeTab === "grades" 
                ? "bg-accent text-accent-ink font-semibold shadow-sm" 
                : "text-ink-muted hover:text-ink hover:bg-paper-2/40"
            }`}
          >
            <Award className="w-4 h-4 shrink-0" />
            <span className="text-xs sm:text-sm hidden sm:inline">5. Rekap Nilai & Rubrik Jurnalistik</span>
            <span className="text-xs sm:hidden font-medium">5. Nilai & Rubrik</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveTab("cases"); }}
            className={`p-2.5 px-3 sm:px-4 rounded-xl flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors min-h-[44px] ${
              activeTab === "cases" 
                ? "bg-accent text-accent-ink font-semibold shadow-sm" 
                : "text-ink-muted hover:text-ink hover:bg-paper-2/40"
            }`}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span className="text-xs sm:text-sm hidden sm:inline">6. Kasus & Liputan Wawancara</span>
            <span className="text-xs sm:hidden font-medium">6. Kasus & Saksi</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveTab("solutions"); }}
            className={`p-2.5 px-3 sm:px-4 rounded-xl flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors min-h-[44px] ${
              activeTab === "solutions" 
                ? "bg-accent text-accent-ink font-semibold shadow-sm" 
                : "text-ink-muted hover:text-ink hover:bg-paper-2/40"
            }`}
          >
            <Key className="w-4 h-4 shrink-0 text-accent-yellow" />
            <span className="text-xs sm:text-sm hidden sm:inline">7. Kunci Jawaban & Rubrik Solusi</span>
            <span className="text-xs sm:hidden font-medium">7. Kunci Jawaban</span>
          </button>
        </div>

        {/* TAB 0: PAPAN PERINGKAT & EVALUASI AKHIR */}
        {activeTab === "leaderboard" && (
          <div className="space-y-6">
            {renderLeaderboardSection()}
          </div>
        )}

        {/* TAB 1: MANAJEMEN BIRO & KODE 5-KARAKTER */}
        {activeTab === "teams" && (
          <div className="space-y-6">
            {/* Generate Leader Codes Card (Admin only provides code, student fills identity) */}
            <div className="glass p-5 sm:p-6 rounded-2xl border border-rule shadow-card space-y-4">
              <div className="border-b border-rule/60 pb-3 flex flex-wrap justify-between items-center gap-2">
                <div>
                  <h3 className="font-display font-medium text-lg text-ink flex items-center gap-2">
                    <Key className="w-5 h-5 text-accent-orange" />
                    <span>Terbitkan Kode Mandat Ketua (5-Karakter)</span>
                  </h3>
                  <p className="font-body text-xs text-ink-muted mt-0.5">
                    Guru hanya memberikan kode 5-karakter. Identitas biro (Nama Biro, Nama Siswa Ketua, dan Kelas) akan diisi langsung oleh siswa.
                  </p>
                </div>
                <span className="font-body text-xs bg-accent-orange/15 text-accent-orange border border-accent-orange/30 px-3 py-1 rounded-full font-medium">
                  Sistem Mandat Siswa
                </span>
              </div>

              {/* Quick Batch Minting Buttons */}
              <div className="space-y-3">
                <span className="font-body text-xs font-semibold text-ink-2 block">
                  Pilih Jumlah Kode Ketua yang Ingin Diterbitkan:
                </span>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleGenerateLeaderCode()}
                    className="rounded-full bg-accent text-accent-ink hover:bg-accent-hi text-xs font-body font-semibold px-4 py-2.5 inline-flex items-center gap-1.5 transition-colors shadow-md min-h-[44px]"
                    title="Terbitkan 1 kode ketua baru secara instan"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Terbitkan 1 Kode Ketua</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleBatchGenerateLeaderCodes(3)}
                    className="rounded-full bg-paper-2 hover:bg-paper-3 border border-rule text-xs font-body font-medium text-ink px-4 py-2.5 inline-flex items-center gap-1.5 transition-colors shadow-sm min-h-[44px]"
                    title="Terbitkan 3 kode ketua sekaligus untuk 3 kelompok"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-accent-orange" />
                    <span>+ 3 Kode Sekaligus</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleBatchGenerateLeaderCodes(5)}
                    className="rounded-full bg-paper-2 hover:bg-paper-3 border border-rule text-xs font-body font-medium text-ink px-4 py-2.5 inline-flex items-center gap-1.5 transition-colors shadow-sm min-h-[44px]"
                    title="Terbitkan 5 kode ketua sekaligus untuk 5 kelompok"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-accent-orange" />
                    <span>+ 5 Kode Sekaligus</span>
                  </button>
                </div>

                {/* Optional Custom Code Input */}
                <form onSubmit={handleGenerateLeaderCode} className="pt-2 border-t border-rule/50 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Ketik kode khusus ketua (cth: TIM01 atau KEL1)"
                      maxLength={12}
                      value={customLeaderCode}
                      onChange={(e) => setCustomLeaderCode(e.target.value)}
                      className="w-full p-2.5 font-mono text-base sm:text-xs font-bold tracking-normal rounded-xl border border-rule bg-paper-2/60 text-ink"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-full bg-accent text-accent-ink hover:bg-accent-hi text-xs font-body font-semibold px-4 py-2.5 transition-colors min-h-[44px] shrink-0 shadow-sm"
                  >
                    Terbitkan Kode Khusus
                  </button>
                </form>
              </div>
            </div>

            {/* Biro List Cards */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-display font-medium text-xl text-ink">
                  Daftar Kode & Biro Terdaftar ({teams.length}):
                </h3>
                <span className="font-body text-xs text-ink-muted">
                  Biro dapat diacak kodenya atau dibubarkan
                </span>
              </div>

              {teams.map((t) => (
                <div key={t.id} className="glass p-5 rounded-2xl border border-rule shadow-card space-y-4">
                  {/* Biro Header */}
                  <div className="flex flex-wrap justify-between items-center gap-2 border-b border-rule/60 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-medium text-xl text-ink">
                          {t.name}
                        </h4>
                        {t.isPendingSetup ? (
                          <span className="font-body text-xs bg-accent-orange/15 text-accent-orange border border-accent-orange/30 px-2.5 py-0.5 rounded-full font-semibold animate-pulse motion-reduce:animate-none inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Menunggu Diisi Ketua</span>
                          </span>
                        ) : (
                          <span className="font-body text-xs bg-accent-green/15 text-accent-green border border-accent-green/30 px-2.5 py-0.5 rounded-full font-semibold inline-flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>{t.members?.length || 0} Siswa Terdaftar</span>
                          </span>
                        )}
                        <span className="font-body text-xs bg-accent/15 text-accent border border-accent/30 px-2.5 py-0.5 rounded-full font-semibold inline-flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>{VARIATION_BEATS[getTeamVariationIndex(t)]?.title || `Variasi #${getTeamVariationIndex(t) + 1}`}</span>
                        </span>
                      </div>
                      <p className="font-body text-xs text-ink-2 mt-0.5">
                        {t.isPendingSetup ? (
                          <span className="text-accent-orange font-medium">
                            Kode telah terbit: serahkan kode ketua kepada siswa untuk melengkapi identitas biro.
                          </span>
                        ) : (
                          <span>
                            <span>Ketua: <strong>{t.leaderName || t.members?.[0]?.name}</strong> ({t.leaderClass || t.members?.[0]?.classInfo})</span>
                            <span className="mx-1.5 opacity-40">|</span>
                            <span>Kas: <strong>{t.coins || 0} Koin</strong></span>
                            <span className="mx-1.5 opacity-40">|</span>
                            <span>Total Pengerjaan: <strong className="text-accent">{formatDuration((t.stageTimes?.stage_1 || 0) + (t.stageTimes?.stage_2 || 0) + (t.stageTimes?.stage_3 || 0))}</strong></span>
                          </span>
                        )}
                      </p>

                      {/* Live Working Timer & Stages Bar */}
                      {!t.isPendingSetup && (
                        <div className="flex items-center gap-2 flex-wrap pt-2 mt-1 border-t border-rule/50">
                          <span className="text-[11px] font-semibold text-ink-muted font-medium">Durasi per Tahap:</span>
                          {[1, 2, 3].map(stg => {
                            const timer = getTeamStageTimer(t, stg);
                            const isDone = isStageCompleted(t, stg);
                            return (
                              <span 
                                key={stg} 
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                                  isDone 
                                    ? "bg-accent-green/15 text-accent-green border border-accent-green/30" 
                                    : timer.isRunning 
                                    ? "bg-accent/20 text-accent border border-accent/40 animate-pulse motion-reduce:animate-none" 
                                    : "bg-paper-2 border border-rule text-ink-muted"
                                }`}
                              >
                                {isDone ? (
                                  <Pause className="w-3 h-3 fill-current" />
                                ) : timer.isRunning ? (
                                  <Play className="w-3 h-3 fill-current text-accent" />
                                ) : (
                                  <Clock className="w-3 h-3 text-ink-muted" />
                                )}
                                <span>T{stg}: <span className="font-mono">{isDone ? `${formatDuration(timer.seconds)} (Selesai)` : timer.isRunning ? `${formatDuration(timer.seconds)} (Berjalan)` : "-"}</span></span>
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          sound.playClick();
                          if (editingTeamId === t.id) {
                            setEditingTeamId(null);
                          } else {
                            setEditingTeamId(t.id);
                            setEditTeamName(t.name);
                            setEditTeamLeaderName(t.leaderName || t.members?.[0]?.name || "");
                            setEditTeamLeaderClass(t.leaderClass || t.members?.[0]?.classInfo || "");
                            setEditTeamLeaderCode(t.leaderCode || "");
                            setEditTeamMemberCode(t.memberCode || "");
                            setEditTeamVariationIndex(t.assignedVariationIndex !== undefined ? t.assignedVariationIndex : getTeamVariationIndex(t));
                          }
                        }}
                        className={`rounded-full border text-xs font-body font-medium gap-1 px-3.5 py-2 inline-flex items-center min-h-[40px] transition-colors ${
                          editingTeamId === t.id 
                            ? "bg-accent text-accent-ink border-accent font-semibold shadow" 
                            : "bg-paper-2 hover:bg-paper-3 border-rule text-ink"
                        }`}
                        title="Ubah nama biro kelompok, ketua, kelas, dan kode"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{editingTeamId === t.id ? "Tutup Form" : "Ubah Biro & Kode"}</span>
                      </button>

                      <button
                        onClick={() => handleRegenerateCodes(t.id)}
                        className="rounded-full bg-paper-2 hover:bg-paper-3 border border-rule text-xs font-body font-medium text-ink gap-1 px-3.5 py-2 inline-flex items-center min-h-[40px]"
                        title="Acak sepasang kode baru"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Acak Kode Baru</span>
                      </button>

                      <button
                        onClick={() => handleDeleteTeam(t)}
                        className="rounded-full bg-accent-red/15 hover:bg-accent-red hover:text-white border border-accent-red/30 text-xs font-body font-medium text-accent-red gap-1 px-3.5 py-2 inline-flex items-center min-h-[40px]"
                        title={t.isPendingSetup ? "Hapus slot kode ini" : "Bubarkan biro ini"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{t.isPendingSetup ? "Hapus Slot" : "Bubarkan"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Inline Team Edit Form (Nama Kelompok, Ketua, Kelas, Kode, Topik Variasi) */}
                  {editingTeamId === t.id && (
                    <div className="p-4 bg-accent/10 border border-accent/30 rounded-2xl space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between border-b border-accent/20 pb-2">
                        <span className="font-display font-medium text-sm text-ink flex items-center gap-1.5">
                          <Edit3 className="w-4 h-4 text-accent" />
                          <span>Ubah Nama, Identitas & Kode Ruang Redaksi</span>
                        </span>
                        <span className="text-[11px] font-body text-ink-muted bg-paper-2 px-2 py-0.5 rounded-full border border-rule">
                          ID: {t.id}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-ink-2 block mb-1">
                            1. Nama Kelompok / Biro:
                          </label>
                          <input
                            type="text"
                            value={editTeamName}
                            onChange={(e) => setEditTeamName(e.target.value)}
                            className="w-full p-2.5 text-base sm:text-xs font-semibold rounded-xl border border-rule bg-paper text-ink"
                            placeholder="cth: Biro Investigasi Rajawali"
                            autoFocus
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-ink-2 block mb-1">
                            2. Nama Siswa Ketua (Pemred):
                          </label>
                          <input
                            type="text"
                            value={editTeamLeaderName}
                            onChange={(e) => setEditTeamLeaderName(e.target.value)}
                            className="w-full p-2.5 text-base sm:text-xs font-medium rounded-xl border border-rule bg-paper text-ink"
                            placeholder="Nama Ketua"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-ink-2 block mb-1">
                            3. Kelas:
                          </label>
                          <input
                            type="text"
                            value={editTeamLeaderClass}
                            onChange={(e) => setEditTeamLeaderClass(e.target.value)}
                            className="w-full p-2.5 text-base sm:text-xs font-medium rounded-xl border border-rule bg-paper text-ink"
                            placeholder="cth: 9A"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-ink-2 block mb-1">
                            4. Kode Mandat Ketua:
                          </label>
                          <input
                            type="text"
                            value={editTeamLeaderCode}
                            onChange={(e) => setEditTeamLeaderCode(e.target.value)}
                            className="w-full p-2.5 text-base sm:text-xs font-mono font-bold tracking-normal rounded-xl border border-rule bg-paper text-accent-orange"
                            placeholder="cth: RJWL1"
                            maxLength={12}
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-ink-2 block mb-1">
                            5. Kode Anggota:
                          </label>
                          <input
                            type="text"
                            value={editTeamMemberCode}
                            onChange={(e) => setEditTeamMemberCode(e.target.value)}
                            className="w-full p-2.5 text-base sm:text-xs font-mono font-bold tracking-normal rounded-xl border border-rule bg-paper text-accent-green"
                            placeholder="cth: RJWL2"
                            maxLength={12}
                          />
                        </div>
                        <div className="sm:col-span-2 lg:col-span-1">
                          <label className="text-[11px] font-semibold text-ink-2 block mb-1">
                            6. Penugasan Topik Berita:
                          </label>
                          <select
                            value={editTeamVariationIndex}
                            onChange={(e) => setEditTeamVariationIndex(parseInt(e.target.value, 10))}
                            className="w-full p-2.5 text-base sm:text-xs font-semibold rounded-xl border border-rule bg-paper text-accent"
                          >
                            {VARIATION_BEATS.map((beat) => (
                              <option key={beat.index} value={beat.index}>
                                #{beat.index + 1}: {beat.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingTeamId(null)}
                          className="rounded-full bg-paper-2 hover:bg-paper-3 border border-rule text-xs font-medium px-4 py-2 text-ink transition-colors min-h-[42px]"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveTeamDetails(t.id)}
                          className="rounded-full bg-accent text-accent-ink hover:bg-accent-hi text-xs font-semibold px-5 py-2 shadow inline-flex items-center gap-1.5 transition-colors min-h-[42px]"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Simpan Perubahan Biro & Kode</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 5-Character Codes Showcase with One-Click Copy & Direct WhatsApp Link */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                    <div className={`glass p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ${
                      t.isPendingSetup ? "border-accent-orange/40 bg-accent-orange/5" : "border-rule"
                    }`}>
                      <div>
                        <span className="text-[10px] text-ink-muted block font-semibold flex items-center gap-1">
                          <Crown className="w-3.5 h-3.5 text-accent-orange" />
                          <span>Kode ketua (berikan ke siswa ketua):</span>
                        </span>
                        <span className="text-xl sm:text-2xl font-bold text-accent-orange tracking-widest select-all">
                          {t.leaderCode || "1X88H"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleCopy(t.leaderCode || "1X88H", `Kode Ketua ${t.name}`)}
                          className="rounded-full bg-paper-2 hover:bg-paper-3 border border-rule p-2 px-3 text-xs text-ink inline-flex items-center gap-1 min-h-[40px] shadow-sm transition-colors"
                          title="Salin Kode Ketua"
                        >
                          {copiedCode === (t.leaderCode || "1X88H") ? <Check className="w-3.5 h-3.5 text-accent-green" /> : <Copy className="w-3.5 h-3.5" />}
                          <span className="text-[11px] font-sans font-medium">Salin</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(t.leaderCode || "1X88H", `Ketua (${t.name})`)}
                          className="rounded-full bg-accent/15 hover:bg-accent/25 border border-accent/30 p-2 px-3 text-xs text-accent inline-flex items-center gap-1 min-h-[40px] shadow-sm transition-colors font-semibold"
                          title="Salin Tautan Masuk Otomatis (bisa langsung dikirim ke WhatsApp)"
                        >
                          {copiedCode === ((t.leaderCode || "1X88H") + "_link") ? <Check className="w-3.5 h-3.5 text-accent-green" /> : <Share2 className="w-3.5 h-3.5" />}
                          <span className="text-[11px] font-sans font-medium">Bagi Link</span>
                        </button>
                      </div>
                    </div>

                    <div className="glass p-3.5 rounded-xl border border-rule flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-ink-muted block font-semibold flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-accent" />
                          <span>Kode anggota (5 karakter):</span>
                        </span>
                        <span className="text-xl sm:text-2xl font-bold text-accent-green tracking-widest select-all">
                          {t.memberCode || "UD19J"}
                        </span>
                        {t.isPendingSetup && (
                          <span className="text-[10px] text-ink-muted font-sans block mt-0.5">
                            (Aktif setelah Ketua mengisi identitas di web)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleCopy(t.memberCode || "UD19J", `Kode Anggota ${t.name}`)}
                          className="rounded-full bg-paper-2 hover:bg-paper-3 border border-rule p-2 px-3 text-xs text-ink inline-flex items-center gap-1 min-h-[40px] shadow-sm transition-colors"
                          title="Salin Kode Anggota"
                        >
                          {copiedCode === (t.memberCode || "UD19J") ? <Check className="w-3.5 h-3.5 text-accent-green" /> : <Copy className="w-3.5 h-3.5" />}
                          <span className="text-[11px] font-sans font-medium">Salin</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(t.memberCode || "UD19J", `Anggota (${t.name})`)}
                          className="rounded-full bg-accent-green/15 hover:bg-accent-green/25 border border-accent-green/30 p-2 px-3 text-xs text-accent-green inline-flex items-center gap-1 min-h-[40px] shadow-sm transition-colors font-semibold"
                          title="Salin Tautan Masuk Otomatis untuk Anggota"
                        >
                          {copiedCode === ((t.memberCode || "UD19J") + "_link") ? <Check className="w-3.5 h-3.5 text-accent-green" /> : <Share2 className="w-3.5 h-3.5" />}
                          <span className="text-[11px] font-sans font-medium">Bagi Link</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Members Table */}
                  <div className="border border-rule rounded-xl overflow-hidden glass">
                    <div className="bg-paper-2/80 p-2.5 font-body text-xs font-semibold text-ink flex justify-between items-center border-b border-rule">
                      <span>Daftar Anggota Redaksi Terdaftar:</span>
                      <button
                        onClick={() => setAddMemberTeamId(addMemberTeamId === t.id ? null : t.id)}
                        className="rounded-full bg-accent text-accent-ink px-3 py-1.5 text-xs font-semibold hover:bg-accent-hi inline-flex items-center gap-1 min-h-[36px]"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ Tambah Siswa</span>
                      </button>
                    </div>

                    {/* Mobile Table Scroll Hint */}
                    <span className="sm:hidden text-[10px] text-ink-muted italic block px-2.5 pt-1.5 pb-1 border-b border-rule/40 bg-paper-2/30">
                      Geser tabel ke samping untuk melihat detail & opsi ubah
                    </span>

                    {/* Quick Add Form Dropdown */}
                    {addMemberTeamId === t.id && (
                      <div className="p-3 bg-accent/10 border-b border-rule flex flex-wrap gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Nama Siswa"
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                          className="p-2 text-base sm:text-xs font-medium w-full sm:w-40 rounded-lg border border-rule bg-paper"
                        />
                        <input
                          type="text"
                          placeholder="Kelas (cth: 8A)"
                          value={newMemberClass}
                          onChange={(e) => setNewMemberClass(e.target.value)}
                          className="p-2 text-base sm:text-xs font-mono font-medium w-28 sm:w-24 rounded-lg border border-rule bg-paper"
                        />
                        <select
                          value={newMemberRole}
                          onChange={(e) => setNewMemberRole(e.target.value)}
                          className="p-2 text-base sm:text-xs font-body font-medium rounded-lg border border-rule bg-paper flex-1"
                        >
                          {editorialRoles.map(r => (
                            <option key={r.id} value={r.title}>{r.title}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleAddMemberToTeam(t.id)}
                          className="rounded-full bg-accent text-accent-ink px-4 py-2 text-xs font-semibold hover:bg-accent-hi min-h-[40px]"
                        >
                          Simpan Siswa
                        </button>
                      </div>
                    )}

                    {(!t.members || t.members.length === 0) ? (
                      <div className="p-4 text-center font-body text-xs text-ink-muted">
                        Belum ada anggota terdaftar di biro ini. Klik{" "}
                        <button 
                          type="button"
                          className="text-accent font-semibold underline" 
                          onClick={() => setAddMemberTeamId(t.id)}
                        >
                          + Tambah Siswa
                        </button>{" "}
                        untuk memasukkan manual, atau berikan Kode Ketua / Anggota kepada siswa.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left font-body text-xs">
                          <thead className="bg-paper-2/40 border-b border-rule text-[11px] text-ink-muted font-medium">
                            <tr>
                              <th className="p-2.5 text-center">No</th>
                              <th className="p-2.5">Nama Siswa</th>
                              <th className="p-2.5">Kelas</th>
                              <th className="p-2.5">Peran Redaksi Spesialis</th>
                              <th className="p-2.5">Jabatan</th>
                              <th className="p-2.5 text-right">Aksi Guru</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-rule/60">
                            {t.members?.map((m, idx) => {
                              const name = typeof m === "string" ? m : m.name;
                              const cls = typeof m === "string" ? "-" : (m.classInfo || "-");
                              const role = typeof m === "string" ? "Wartawan Liputan" : (m.role || "Wartawan Liputan");
                              const isLeader = typeof m === "string" ? idx === 0 : !!m.isLeader;
                              const isEditingRow = editingMemberKey === `${t.id}-${idx}`;

                              if (isEditingRow) {
                                return (
                                  <tr key={idx} className="bg-accent/15 border-y-2 border-accent/40 animate-in fade-in duration-150">
                                    <td className="p-2.5 font-mono text-center font-bold text-accent">{idx + 1}</td>
                                    <td className="p-2.5">
                                      <input
                                        type="text"
                                        value={editMemberName}
                                        onChange={(e) => setEditMemberName(e.target.value)}
                                        className="w-full min-w-[130px] p-2 text-base sm:text-xs font-semibold rounded-lg border border-rule bg-paper text-ink"
                                        placeholder="Nama Siswa"
                                        autoFocus
                                        required
                                      />
                                    </td>
                                    <td className="p-2.5">
                                      <input
                                        type="text"
                                        value={editMemberClass}
                                        onChange={(e) => setEditMemberClass(e.target.value)}
                                        className="w-20 p-2 text-base sm:text-xs font-mono font-medium rounded-lg border border-rule bg-paper text-ink"
                                        placeholder="Kelas"
                                      />
                                    </td>
                                    <td className="p-2.5">
                                      <select
                                        value={editMemberRole}
                                        onChange={(e) => setEditMemberRole(e.target.value)}
                                        className="p-2 text-base sm:text-xs font-body font-medium rounded-lg border border-rule bg-paper text-ink min-w-[140px]"
                                      >
                                        {editorialRoles.map(r => (
                                          <option key={r.id} value={r.title}>{r.title}</option>
                                        ))}
                                      </select>
                                    </td>
                                    <td className="p-2.5">
                                      <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-medium text-ink select-none min-h-[38px]">
                                        <input
                                          type="checkbox"
                                          checked={editMemberIsLeader}
                                          onChange={(e) => setEditMemberIsLeader(e.target.checked)}
                                          className="rounded text-accent focus:ring-accent w-4 h-4"
                                        />
                                        <span className="inline-flex items-center gap-1">
                                          <Crown className="w-3 h-3 text-accent-orange" />
                                          <span>Ketua</span>
                                        </span>
                                      </label>
                                    </td>
                                    <td className="p-2.5 text-right">
                                      <div className="flex items-center justify-end gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => handleSaveMemberDetails(t.id, idx)}
                                          className="rounded-full bg-accent text-accent-ink hover:bg-accent-hi px-3.5 py-1.5 text-xs font-semibold inline-flex items-center gap-1 shadow-sm transition-colors min-h-[38px]"
                                          title="Simpan perubahan anggota"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                          <span>Simpan</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setEditingMemberKey(null)}
                                          className="rounded-full bg-paper-2 hover:bg-paper-3 border border-rule px-3 py-1.5 text-xs font-medium text-ink transition-colors min-h-[38px]"
                                          title="Batal"
                                        >
                                          Batal
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              }

                              return (
                                <tr key={idx} className={isLeader ? "bg-accent/10 font-semibold" : "hover:bg-paper-2/50"}>
                                  <td className="p-2.5 text-center font-mono text-ink-muted">{idx + 1}</td>
                                  <td className="p-2.5 font-medium text-ink">
                                    <div className="flex items-center gap-1.5">
                                      <span>{name}</span>
                                      {isLeader && <Crown className="w-3.5 h-3.5 text-accent-orange inline shrink-0" />}
                                    </div>
                                  </td>
                                  <td className="p-2.5 font-mono">{cls}</td>
                                  <td className="p-2.5">
                                    <select
                                      value={role}
                                      onChange={(e) => handleRoleChange(t.id, name, e.target.value, isLeader)}
                                      className="p-1.5 text-xs font-body rounded border border-rule bg-paper-2/60 text-ink"
                                    >
                                      {editorialRoles.map(r => (
                                        <option key={r.id} value={r.title}>{r.title}</option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="p-2.5">
                                    {isLeader ? (
                                      <span className="bg-accent-orange/20 border border-accent-orange/30 text-accent-orange px-2.5 py-1 rounded-full text-[10px] font-semibold inline-flex items-center gap-1">
                                        <Crown className="w-3 h-3" />
                                        <span>Ketua (Pemred)</span>
                                      </span>
                                    ) : (
                                      <button
                                        onClick={() => handleRoleChange(t.id, name, role, true)}
                                        className="text-xs text-ink-muted hover:text-accent underline text-[11px] inline-flex items-center min-h-[36px] py-1"
                                        title="Angkat siswa ini sebagai Ketua Kelompok"
                                      >
                                        Jadikan Ketua
                                      </button>
                                    )}
                                  </td>
                                  <td className="p-2.5 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          sound.playClick();
                                          setEditingMemberKey(`${t.id}-${idx}`);
                                          setEditMemberName(name);
                                          setEditMemberClass(cls === "-" ? "" : cls);
                                          setEditMemberRole(role);
                                          setEditMemberIsLeader(!!isLeader);
                                        }}
                                        className="text-accent hover:underline text-xs font-medium inline-flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-accent/10 min-h-[36px]"
                                        title="Ubah nama, kelas, atau jabatan siswa"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                        <span>Ubah</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveMember(t.id, name)}
                                        className="text-accent-red hover:underline text-xs font-medium inline-flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-accent-red/10 min-h-[36px]"
                                        title="Keluarkan anggota dari biro"
                                      >
                                        Keluarkan
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Master Roster of Registered Classroom Users on VPS */}
            <div className="glass p-5 sm:p-6 rounded-2xl border border-rule shadow-card space-y-4">
              <div className="flex flex-wrap justify-between items-center gap-2 border-b border-rule/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-accent/20 border border-accent/30 text-accent flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-display font-medium text-base sm:text-lg text-ink">
                      Daftar Seluruh Pengguna & Siswa Terdaftar (Server VPS)
                    </h3>
                    <p className="font-body text-xs text-ink-muted">
                      Seluruh identitas siswa yang terdaftar tersimpan di server VPS ({allClassroomUsers.length} Siswa)
                    </p>
                  </div>
                </div>
                <span className="font-body text-xs bg-accent-green/20 text-accent-green border border-accent-green/30 rounded-full px-3 py-1 font-semibold">
                  {allClassroomUsers.length} Siswa di Server
                </span>
              </div>

              {allClassroomUsers.length === 0 ? (
                <div className="p-4 text-center font-body text-xs text-ink-muted">
                  Belum ada siswa yang mendaftar atau bergabung ke biro.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-body text-xs">
                    <thead className="bg-paper-2/60 border-b border-rule text-[11px] text-ink-muted font-medium">
                      <tr>
                        <th className="p-2.5 text-center">No</th>
                        <th className="p-2.5">Nama Lengkap Siswa</th>
                        <th className="p-2.5">Kelas</th>
                        <th className="p-2.5">Biro Redaksi</th>
                        <th className="p-2.5">Peran Spesialis</th>
                        <th className="p-2.5 text-center">Jabatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rule/50">
                      {allClassroomUsers.map((u, uIdx) => (
                        <tr key={u.id || uIdx} className="hover:bg-paper-2/40 transition-colors">
                          <td className="p-2.5 text-center text-ink-muted font-mono">{uIdx + 1}</td>
                          <td className="p-2.5 font-semibold text-ink">{u.name}</td>
                          <td className="p-2.5 font-mono text-ink-muted">{u.classInfo || "-"}</td>
                          <td className="p-2.5 text-accent font-medium">{u.teamName}</td>
                          <td className="p-2.5 text-ink-2">{u.role}</td>
                          <td className="p-2.5 text-center">
                            {u.isLeader ? (
                              <span className="bg-accent-orange/20 text-accent-orange border border-accent-orange/30 text-[10px] px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                                <Crown className="w-3 h-3" />
                                <span>Ketua</span>
                              </span>
                            ) : (
                              <span className="bg-paper-2 text-ink-muted border border-rule text-[10px] px-2 py-0.5 rounded-full font-medium">
                                Anggota
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ORKESTRASI TAHAP & KURIKULUM */}
        {activeTab === "stages" && (
          <div className="space-y-6">
            <div className="glass p-5 sm:p-6 rounded-2xl border border-rule shadow-card space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rule pb-4">
                <div>
                  <h3 className="font-display font-medium text-xl text-ink">
                    Sinkronisasi & Orkestrasi Pacing Sesi Kelas:
                  </h3>
                  <p className="font-body text-xs text-ink-2 leading-relaxed mt-1">
                    Atur tahap materi yang dibuka serentak. Seluruh biro akan saling menunggu di Lobi atau Ruang Tunggu Redaksi hingga Guru membuka tahap berikutnya secara serempak.
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className="font-body text-xs text-ink-muted">Tahap Aktif:</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    currentStage === 0 
                      ? "bg-accent-orange/15 text-accent-orange border-accent-orange/30" 
                      : "bg-accent/15 text-accent border border-accent/30"
                  }`}>
                    {currentStage === 0 ? "Ruang Persiapan (0)" : `Tahap ${currentStage}`}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Tahap 0: Ruang Persiapan */}
                <div 
                  className={`p-4 rounded-2xl border flex flex-col justify-between transition-colors ${
                    currentStage === 0
                      ? "bg-accent-orange/10 border-accent-orange shadow-md ring-1 ring-accent-orange/30"
                      : "bg-paper-2/70 border-rule hover:border-rule-hover"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        currentStage === 0
                          ? "bg-accent-orange/20 text-accent-orange border-accent-orange/40"
                          : "bg-paper-3 text-ink-muted border-rule"
                      }`}>
                        {currentStage === 0 ? "Aktif: Terkunci" : "Tahap 0"}
                      </span>
                      <Lock className={`w-4 h-4 ${currentStage === 0 ? "text-accent-orange" : "text-ink-muted"}`} />
                    </div>
                    <h4 className="font-display font-medium text-base text-ink">
                      Ruang Persiapan (Lobi Pra-Sesi)
                    </h4>
                    <p className="font-body text-xs text-ink-muted leading-relaxed">
                      Kunci seluruh penugasan sebelum sesi kelas dimulai. Siswa hanya dapat melihat nama biro, anggota, & kode masuk.
                    </p>
                  </div>
                  <div className="pt-4 mt-2 border-t border-rule/50 space-y-2">
                    <div className="text-[11px] font-body text-ink-muted">
                      Status: {currentStage === 0 ? "Seluruh kelas tertahan di lobi" : "Lobi selesai dilewati"}
                    </div>
                    <button
                      onClick={() => handleSetGlobalStage(0)}
                      className={`w-full py-2.5 px-3 rounded-full text-xs font-semibold transition-colors min-h-[44px] flex items-center justify-center gap-1.5 ${
                        currentStage === 0
                          ? "bg-accent-orange text-white shadow-sm font-bold"
                          : "bg-paper-3 border border-rule hover:bg-paper-2 text-ink"
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{currentStage === 0 ? "Sedang Mengunci Sesi" : "Kunci ke Persiapan (0)"}</span>
                    </button>
                  </div>
                </div>

                {/* Tahap 1: Unsur 5W+1H */}
                <div 
                  className={`p-4 rounded-2xl border flex flex-col justify-between transition-colors ${
                    currentStage === 1
                      ? "bg-accent/10 border-accent shadow-md ring-1 ring-accent/30"
                      : "bg-paper-2/70 border-rule hover:border-rule-hover"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        currentStage === 1
                          ? "bg-accent/20 text-accent border-accent/40"
                          : "bg-paper-3 text-ink-muted border-rule"
                      }`}>
                        {currentStage === 1 ? "Aktif Serentak" : "Tahap 1"}
                      </span>
                      <BookOpen className={`w-4 h-4 ${currentStage === 1 ? "text-accent" : "text-ink-muted"}`} />
                    </div>
                    <h4 className="font-display font-medium text-base text-ink">
                      Tahap 1: Unsur 5W+1H
                    </h4>
                    <p className="font-body text-xs text-ink-muted leading-relaxed">
                      Verifikasi 6 elemen berita pokok dari naskah wawancara saksi kasus redaksi sekolah.
                    </p>
                  </div>
                  <div className="pt-4 mt-2 border-t border-rule/50 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-body text-ink-muted">
                      <span>Progres selesai:</span>
                      <span className="font-bold text-ink"><span className="font-mono">{stage1DoneCount}/{teams.length}</span> biro</span>
                    </div>
                    <button
                      onClick={() => handleSetGlobalStage(1)}
                      className={`w-full py-2.5 px-3 rounded-full text-xs font-semibold transition-colors min-h-[44px] flex items-center justify-center gap-1.5 ${
                        currentStage === 1
                          ? "bg-accent text-accent-ink shadow-sm font-bold"
                          : "bg-paper-3 border border-rule hover:bg-paper-2 text-ink"
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{currentStage === 1 ? "Sedang Berlangsung" : "Buka Tahap 1 Serentak"}</span>
                    </button>
                  </div>
                </div>

                {/* Tahap 2: Piramida Terbalik */}
                <div 
                  className={`p-4 rounded-2xl border flex flex-col justify-between transition-colors ${
                    currentStage === 2
                      ? "bg-accent/10 border-accent shadow-md ring-1 ring-accent/30"
                      : "bg-paper-2/70 border-rule hover:border-rule-hover"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        currentStage === 2
                          ? "bg-accent/20 text-accent border-accent/40"
                          : "bg-paper-3 text-ink-muted border-rule"
                      }`}>
                        {currentStage === 2 ? "Aktif Serentak" : "Tahap 2"}
                      </span>
                      <FileText className={`w-4 h-4 ${currentStage === 2 ? "text-accent" : "text-ink-muted"}`} />
                    </div>
                    <h4 className="font-display font-medium text-base text-ink">
                      Tahap 2: Piramida Terbalik
                    </h4>
                    <p className="font-body text-xs text-ink-muted leading-relaxed">
                      Menyusun struktur naskah straight news: Judul, Lead (Kepala), Body (Tubuh), & Ekor.
                    </p>
                  </div>
                  <div className="pt-4 mt-2 border-t border-rule/50 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-body text-ink-muted">
                      <span>Progres selesai:</span>
                      <span className="font-bold text-ink"><span className="font-mono">{stage2DoneCount}/{teams.length}</span> biro</span>
                    </div>
                    <button
                      onClick={() => handleSetGlobalStage(2)}
                      className={`w-full py-2.5 px-3 rounded-full text-xs font-semibold transition-colors min-h-[44px] flex items-center justify-center gap-1.5 ${
                        currentStage === 2
                          ? "bg-accent text-accent-ink shadow-sm font-bold"
                          : "bg-paper-3 border border-rule hover:bg-paper-2 text-ink"
                      }`}
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>{currentStage === 2 ? "Sedang Berlangsung" : "Buka Tahap 2 Serentak"}</span>
                    </button>
                  </div>
                </div>

                {/* Tahap 3: Menulis Berita Utuh */}
                <div 
                  className={`p-4 rounded-2xl border flex flex-col justify-between transition-colors ${
                    currentStage === 3
                      ? "bg-accent/10 border-accent shadow-md ring-1 ring-accent/30"
                      : "bg-paper-2/70 border-rule hover:border-rule-hover"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        currentStage === 3
                          ? "bg-accent/20 text-accent border-accent/40"
                          : "bg-paper-3 text-ink-muted border-rule"
                      }`}>
                        {currentStage === 3 ? "Aktif Serentak" : "Tahap 3"}
                      </span>
                      <Award className={`w-4 h-4 ${currentStage === 3 ? "text-accent" : "text-ink-muted"}`} />
                    </div>
                    <h4 className="font-display font-medium text-base text-ink">
                      Tahap 3: Menulis Berita Utuh
                    </h4>
                    <p className="font-body text-xs text-ink-muted leading-relaxed">
                      Penyusunan naskah final liputan redaksi sekolah dan penerbitan ke meja juri kelas.
                    </p>
                  </div>
                  <div className="pt-4 mt-2 border-t border-rule/50 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-body text-ink-muted">
                      <span>Progres selesai:</span>
                      <span className="font-bold text-ink"><span className="font-mono">{stage3DoneCount}/{teams.length}</span> biro</span>
                    </div>
                    <button
                      onClick={() => handleSetGlobalStage(3)}
                      className={`w-full py-2.5 px-3 rounded-full text-xs font-semibold transition-colors min-h-[44px] flex items-center justify-center gap-1.5 ${
                        currentStage === 3
                          ? "bg-accent text-accent-ink shadow-sm font-bold"
                          : "bg-paper-3 border border-rule hover:bg-paper-2 text-ink"
                      }`}
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>{currentStage === 3 ? "Sedang Berlangsung" : "Buka Tahap 3 Serentak"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Per-Biro Stage Override Controls */}
            <div className="glass p-5 sm:p-6 rounded-2xl border border-rule shadow-card space-y-4">
              <h3 className="font-display font-medium text-xl text-ink">
                Kendali Override Tahap Per-Biro (Remedial / Akselerasi):
              </h3>
              <p className="font-body text-xs text-ink-2 leading-relaxed">
                Guru dapat memajukan atau mengulang tahap untuk biro tertentu secara individual tanpa mempengaruhi biro lainnya di kelas.
              </p>

              <div className="space-y-3">
                {teams.map((t) => {
                  const completed = t.completedStages || [];
                  return (
                    <div key={t.id} className="p-3.5 rounded-xl border border-rule glass flex flex-wrap justify-between items-center gap-2">
                      <div>
                        <span className="font-display font-medium text-sm text-ink">
                          {t.name}
                        </span>
                        <div className="font-body text-xs text-ink-muted flex items-center gap-2 flex-wrap mt-0.5">
                          <span>Ketua: <strong>{t.leaderName || t.members?.[0]?.name}</strong></span>
                          <span className="opacity-40">|</span>
                          <span>Tuntas: <strong>{completed.length}/3 Tahap</strong></span>
                          <span className="opacity-40">|</span>
                          <span className="inline-flex items-center gap-1 font-body text-[11px] bg-paper-2 border border-rule px-2 py-0.5 rounded">
                            <Clock className="w-3 h-3 text-accent" />
                            <span>T1: <span className="font-mono">{formatDuration(t.stageTimes?.stage_1 || 0)}</span></span>
                          </span>
                          <span className="inline-flex items-center gap-1 font-body text-[11px] bg-paper-2 border border-rule px-2 py-0.5 rounded">
                            <Clock className="w-3 h-3 text-accent" />
                            <span>T2: <span className="font-mono">{formatDuration(t.stageTimes?.stage_2 || 0)}</span></span>
                          </span>
                          <span className="inline-flex items-center gap-1 font-body text-[11px] bg-paper-2 border border-rule px-2 py-0.5 rounded">
                            <Clock className="w-3 h-3 text-accent" />
                            <span>T3: <span className="font-mono">{formatDuration(t.stageTimes?.stage_3 || 0)}</span></span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => handleTeamStageOverride(t.id, 1)}
                          className="rounded-full bg-paper-2 hover:bg-paper-3 border border-rule px-3.5 py-1.5 text-xs font-body text-ink min-h-[36px]"
                        >
                          Set Tahap 1
                        </button>
                        <button
                          onClick={() => handleTeamStageOverride(t.id, 2)}
                          className="rounded-full bg-paper-2 hover:bg-paper-3 border border-rule px-3.5 py-1.5 text-xs font-body text-ink min-h-[36px]"
                        >
                          Set Tahap 2
                        </button>
                        <button
                          onClick={() => handleTeamStageOverride(t.id, 3)}
                          className="rounded-full bg-paper-2 hover:bg-paper-3 border border-rule px-3.5 py-1.5 text-xs font-body text-ink min-h-[36px]"
                        >
                          Set Tahap 3
                        </button>
                        <button
                          onClick={() => handleTeamStageOverride(t.id, 4)}
                          className="rounded-full bg-accent-green text-white hover:bg-accent-green/90 px-3.5 py-1.5 text-xs font-body font-semibold min-h-[36px]"
                          title="Tandai Lulus Paripurna"
                        >
                          Luluskan
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BANK KAS & INTERVENSI SABOTASE */}
        {activeTab === "economy" && (
          <div className="space-y-6">
            <div className="glass p-5 sm:p-6 rounded-2xl border border-rule shadow-card space-y-4">
              <h3 className="font-display font-medium text-xl text-ink">
                Bank Kas Redaksi & Manajemen Power-Up/Debuff:
              </h3>
              <p className="font-body text-xs text-ink-2 leading-relaxed">
                Guru berhak memberikan hibah dana liputan, menjatuhkan denda etik, atau melakukan pemutihan debuff yang menyerang meja siswa.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teams.map((t) => (
                  <div key={t.id} className="glass p-4 rounded-2xl border border-rule space-y-3 shadow-sm">
                    <div className="flex justify-between items-start border-b border-rule pb-2">
                      <div>
                        <h4 className="font-display font-medium text-base text-ink">{t.name}</h4>
                        <span className="font-body text-xs text-accent-orange font-semibold inline-flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5" />
                          <span>Saldo Kas: {t.coins || 0} Koin</span>
                        </span>
                      </div>
                      {t.activeShield ? (
                        <span className="font-body text-[10px] bg-accent-green/20 text-accent-green border border-accent-green/30 px-2 py-0.5 rounded-full font-semibold inline-flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Perisai aktif</span>
                        </span>
                      ) : t.activeDebuffs?.length > 0 ? (
                        <span className="font-body text-[10px] bg-accent-red/20 text-accent-red border border-accent-red/30 px-2 py-0.5 rounded-full font-semibold animate-pulse motion-reduce:animate-none inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{t.activeDebuffs.length} Debuff menyerang</span>
                        </span>
                      ) : (
                        <span className="font-body text-[10px] bg-paper-2 text-ink-muted px-2 py-0.5 rounded-full font-medium border border-rule">
                          NORMAL
                        </span>
                      )}
                    </div>

                    {/* Adjust Coins Buttons */}
                    <div>
                      <span className="font-body text-[11px] text-ink-muted block mb-1 font-medium">
                        Sesuaikan Anggaran Liputan (Hibah / Denda):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => handleCoinDelta(t.id, 100, "Apresiasi Keaktifan Diskusi")}
                          className="rounded-full bg-paper-2 hover:bg-paper-3 border border-rule text-xs font-body font-medium text-ink px-3.5 py-1.5 min-h-[36px]"
                        >
                          +100 Koin
                        </button>
                        <button
                          onClick={() => handleCoinDelta(t.id, 250, "Hibah Dana Liputan Investigasi Khusus")}
                          className="rounded-full bg-accent/20 hover:bg-accent hover:text-accent-ink text-accent border border-accent/30 text-xs font-body font-semibold px-3.5 py-1.5 min-h-[36px]"
                        >
                          +250 Koin
                        </button>
                        <button
                          onClick={() => handleCoinDelta(t.id, -100, "Denda Pelanggaran Kode Etik / Gaduh")}
                          className="rounded-full bg-accent-red/15 hover:bg-accent-red hover:text-white border border-accent-red/30 text-xs font-body font-medium text-accent-red px-3.5 py-1.5 min-h-[36px]"
                        >
                          -100 Koin
                        </button>
                      </div>
                    </div>

                    {/* Clear Debuff Action */}
                    <div className="pt-2 border-t border-rule flex justify-between items-center">
                      <span className="font-body text-xs text-ink-muted">
                        Debuff: {t.activeDebuffs?.length || 0} aktif
                      </span>
                      <button
                        onClick={() => handleClearDebuffs(t.id)}
                        className="rounded-full bg-accent-green/20 hover:bg-accent-green hover:text-white text-accent-green border border-accent-green/30 text-xs font-body font-semibold px-3.5 py-1.5 transition-colors min-h-[36px] inline-flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Pemutihan & Beri Perisai</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SIARAN DARURAT & RADAR BERITA */}
        {activeTab === "broadcast" && (
          <div className="space-y-6">
            {/* Broadcast Sender Form */}
            <div className="glass p-5 sm:p-6 rounded-2xl border border-rule shadow-card space-y-4">
              <h3 className="font-display font-medium text-xl text-ink flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-accent-orange" />
                <span>Kirim Siaran Darurat ke Seluruh Layar Siswa:</span>
              </h3>

              <form onSubmit={handleSendBroadcast} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      placeholder="Ketik pengumuman guru / breaking news / instruksi liputan..."
                      value={broadcastMsg}
                      onChange={(e) => setBroadcastMsg(e.target.value)}
                      className="w-full p-2.5 text-base sm:text-sm font-medium rounded-xl border border-rule bg-paper"
                      required
                    />
                  </div>
                  <div>
                    <select
                      value={broadcastPriority}
                      onChange={(e) => setBroadcastPriority(e.target.value)}
                      className="w-full p-2.5 text-base sm:text-xs font-body font-semibold rounded-xl border border-rule bg-paper min-h-[44px]"
                    >
                      <option value="info">Pengumuman Biasa</option>
                      <option value="urgent">Peringatan Penting</option>
                      <option value="breaking">Breaking News Darurat</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="neo-btn p-3 bg-accent text-accent-ink hover:bg-accent-hi font-body font-semibold text-xs sm:text-sm rounded-full w-full justify-center shadow-lg transition-colors min-h-[44px] inline-flex items-center gap-2"
                >
                  <span>Siarkan Sekarang ke Seluruh Biro Redaksi</span>
                  <ArrowRight className="w-4 h-4 text-accent-ink" />
                </button>
              </form>
            </div>

            {/* Live Press War & Activity Audit Log */}
            <div className="glass p-5 rounded-2xl border border-rule shadow-card space-y-3">
              <h3 className="font-display font-medium text-lg text-ink">
                Radar Kawat Berita & Log Aktivitas Seluruh Kelas ({logs.length}):
              </h3>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {logs.map((log) => (
                  <div 
                    key={log.id} 
                    className="p-3 rounded-xl border border-rule glass font-body text-xs flex items-center justify-between gap-2 shadow-xs"
                  >
                    <span className="font-medium text-ink-2 leading-relaxed">{log.text}</span>
                    <span className="text-[10px] text-ink-muted shrink-0 font-mono">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: REKAPITULASI NILAI & RUBRIK JURNALISTIK GURU */}
        {activeTab === "grades" && (
          <div className="space-y-6">
            {/* Top Ranked Leaderboard */}
            {renderLeaderboardSection()}

            <div className="glass p-5 sm:p-6 rounded-2xl border border-rule shadow-card space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-rule/60 pb-3.5">
                <div>
                  <h3 className="font-display font-medium text-xl text-ink">
                    Rubrik Penilaian Jurnalistik Individual:
                  </h3>
                  <p className="font-body text-xs text-ink-muted mt-0.5">
                    Input penilaian kualitatif (akurasi fakta, piramida terbalik, bahasa jurnalistik) dan catatan bimbingan untuk setiap biro.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadCSV}
                    className="rounded-full bg-accent text-accent-ink hover:bg-accent-hi text-xs font-body font-semibold gap-1.5 px-4 py-2 inline-flex items-center shadow-sm min-h-[42px]"
                    title="Unduh format spreadsheet CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Rekap Nilai CSV</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="rounded-full bg-paper-2 hover:bg-paper-3 border border-rule text-ink text-xs font-body font-medium gap-1.5 px-3.5 py-2 inline-flex items-center shadow-sm min-h-[42px]"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Lembar</span>
                  </button>
                </div>
              </div>

              {/* Comprehensive Gradebook & Rubric Editor Table */}
              <div className="space-y-4">
                {teams.map((t) => {
                  const s1 = isStageCompleted(t, 1) ? (t.scores?.stage_1 || 100) : (t.scores?.stage_1 || "-");
                  const s2 = isStageCompleted(t, 2) ? (t.scores?.stage_2 || 100) : (t.scores?.stage_2 || "-");
                  const s3 = isStageCompleted(t, 3) ? (t.scores?.stage_3 || 100) : (t.scores?.stage_3 || "-");

                  const rubric = t.rubricScores || {};
                  const inputState = rubricInputs[t.id] || {};

                  const currentFact = inputState.factAccuracy !== undefined ? inputState.factAccuracy : (rubric.factAccuracy || 85);
                  const currentPyramid = inputState.pyramidStructure !== undefined ? inputState.pyramidStructure : (rubric.pyramidStructure || 85);
                  const currentLang = inputState.journalismLanguage !== undefined ? inputState.journalismLanguage : (rubric.journalismLanguage || 85);
                  const currentNotes = inputState.notes !== undefined ? inputState.notes : (t.teacherNotes || "");

                  const calculatedAvg = Math.round((Number(currentFact) + Number(currentPyramid) + Number(currentLang)) / 3);

                  return (
                    <div key={t.id} className="glass p-4 sm:p-5 rounded-2xl border border-rule space-y-3.5 shadow-sm">
                      <div className="flex flex-wrap justify-between items-center gap-2 border-b border-rule/60 pb-2.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-display font-medium text-lg text-ink">{t.name}</h4>
                            <span className="font-body text-xs text-accent-orange font-semibold inline-flex items-center gap-1">
                              <Coins className="w-3.5 h-3.5" />
                              <span>Kas: {t.coins || 0} Koin</span>
                            </span>
                          </div>
                          <span className="font-body text-xs text-ink-muted">
                            Ketua: <strong>{t.leaderName || t.members?.[0]?.name}</strong> ({t.leaderClass || "-"}) • Anggota: {t.members?.length || 0} Siswa
                          </span>
                        </div>

                        {/* Scores & Working Times Pills */}
                        <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
                          <span className="bg-paper-2 border border-rule px-2.5 py-1 rounded-lg">
                            5W1H: <strong className="text-ink">{s1}</strong> <span className="text-ink-muted text-[10px]">({formatDuration(t.stageTimes?.stage_1 || 0)})</span>
                          </span>
                          <span className="bg-paper-2 border border-rule px-2.5 py-1 rounded-lg">
                            Piramida: <strong className="text-ink">{s2}</strong> <span className="text-ink-muted text-[10px]">({formatDuration(t.stageTimes?.stage_2 || 0)})</span>
                          </span>
                          <span className="bg-paper-2 border border-rule px-2.5 py-1 rounded-lg">
                            Menulis: <strong className="text-ink">{s3}</strong> <span className="text-ink-muted text-[10px]">({formatDuration(t.stageTimes?.stage_3 || 0)})</span>
                          </span>
                          <span className="bg-accent/15 text-accent border border-accent/30 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Total: {formatDuration((t.stageTimes?.stage_1 || 0) + (t.stageTimes?.stage_2 || 0) + (t.stageTimes?.stage_3 || 0))}</span>
                          </span>
                        </div>
                      </div>

                      {/* Qualitative Rubric Grading Inputs (Akurasi, Struktur, Bahasa) */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                        <div>
                          <label className="font-body text-[11px] text-ink-muted block mb-1">
                            Akurasi Fakta 5W+1H (1-100):
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={currentFact}
                            onChange={(e) => setRubricInputs({
                              ...rubricInputs,
                              [t.id]: { ...inputState, factAccuracy: Number(e.target.value) }
                            })}
                            className="w-full p-2 text-base sm:text-xs font-mono font-bold rounded-lg border border-rule bg-paper"
                          />
                        </div>

                        <div>
                          <label className="font-body text-[11px] text-ink-muted block mb-1">
                            Struktur Piramida (1-100):
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={currentPyramid}
                            onChange={(e) => setRubricInputs({
                              ...rubricInputs,
                              [t.id]: { ...inputState, pyramidStructure: Number(e.target.value) }
                            })}
                            className="w-full p-2 text-base sm:text-xs font-mono font-bold rounded-lg border border-rule bg-paper"
                          />
                        </div>

                        <div>
                          <label className="font-body text-[11px] text-ink-muted block mb-1">
                            Kaidah Bahasa & EYD (1-100):
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={currentLang}
                            onChange={(e) => setRubricInputs({
                              ...rubricInputs,
                              [t.id]: { ...inputState, journalismLanguage: Number(e.target.value) }
                            })}
                            className="w-full p-2 text-base sm:text-xs font-mono font-bold rounded-lg border border-rule bg-paper"
                          />
                        </div>

                        <div className="flex flex-col justify-end">
                          <span className="font-body text-[11px] text-ink-muted block mb-1">
                            Rata-Rata Rubrik:
                          </span>
                          <div className="font-display font-medium text-lg text-accent py-1">
                            {calculatedAvg}/100
                          </div>
                        </div>
                      </div>

                      {/* Notes & Save Button */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center pt-1">
                        <div className="sm:col-span-3">
                          <input
                            type="text"
                            placeholder="Catatan evaluasi guru untuk tim ini..."
                            value={currentNotes}
                            onChange={(e) => setRubricInputs({
                              ...rubricInputs,
                              [t.id]: { ...inputState, notes: e.target.value }
                            })}
                            className="w-full p-2.5 text-base sm:text-xs font-body font-medium rounded-xl border border-rule bg-paper"
                          />
                        </div>
                        <div>
                          <button
                            onClick={() => handleSaveRubric(t.id)}
                            className="rounded-full bg-accent text-accent-ink hover:bg-accent-hi text-xs font-body font-semibold px-4 py-2.5 w-full shadow-sm min-h-[42px]"
                          >
                            Simpan Rubrik
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: KASUS LIPUTAN & WAWANCARA NARASUMBER */}
        {activeTab === "cases" && (
          <div className="space-y-6">
            {/* 1. Classroom Active Case Selector */}
            <div className="glass p-5 sm:p-6 rounded-2xl border border-rule shadow-card space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-rule/60 pb-3">
                <div>
                  <h3 className="font-display font-medium text-xl text-ink flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-accent-orange" />
                    <span>Kasus Investigasi & Liputan Aktif Kelas:</span>
                  </h3>
                  <p className="font-body text-xs text-ink-muted mt-0.5">
                    Pilih skenario kasus sekolah yang saat ini harus diinvestigasi oleh seluruh biro di kelas.
                  </p>
                </div>

                <button
                  onClick={() => setIsCreatingCase(!isCreatingCase)}
                  className="rounded-full bg-accent text-accent-ink hover:bg-accent-hi text-xs font-semibold px-4 py-2 inline-flex items-center gap-1.5 transition-colors shadow-sm min-h-[40px]"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isCreatingCase ? "Tutup Form Kasus" : "+ Buat Kasus Kustom"}</span>
                </button>
              </div>

              {/* Case Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {allCases.map((c) => {
                  const isActive = c.id === activeClassCase.id;

                  return (
                    <div 
                      key={c.id} 
                      className={`glass p-4 rounded-2xl border transition-colors shadow-sm flex flex-col justify-between space-y-3 ${
                        isActive 
                          ? "border-accent ring-2 ring-accent/30 bg-accent/5" 
                          : "border-rule hover:border-rule/80"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="w-9 h-9 rounded-xl bg-accent-orange/15 border border-accent-orange/30 flex items-center justify-center shrink-0 text-accent-orange">
                            <FileText className="w-5 h-5" />
                          </div>
                          {isActive ? (
                            <span className="bg-accent-green/20 text-accent-green border border-accent-green/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>Aktif di kelas</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-ink-muted bg-paper-2 border border-rule px-2 py-0.5 rounded-full font-mono">
                              {c.isCustom ? "Kustom Guru" : "Standar"}
                            </span>
                          )}
                        </div>

                        <div>
                          <span className="text-[10px] text-accent font-semibold block font-medium">
                            {c.category}
                          </span>
                          <h4 className="font-display font-medium text-base text-ink line-clamp-2 mt-0.5">
                            {c.title}
                          </h4>
                        </div>

                        <p className="font-body text-xs text-ink-2 line-clamp-3 leading-relaxed">
                          {c.summary}
                        </p>

                        <div className="pt-2 border-t border-rule/50 flex flex-wrap gap-1.5">
                          {c.witnesses?.map((w, idx) => (
                            <span key={idx} className="bg-paper-2 text-[10px] text-ink-muted border border-rule px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                              <WitnessAvatar witnessId={w.id} role={w.role} avatar={w.avatar} className="w-4 h-4 rounded-xs shrink-0" iconClassName="w-2.5 h-2.5" />
                              <span className="truncate max-w-[80px]">{w.name}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-rule/60">
                        {isActive ? (
                          <div className="text-center font-body text-xs font-semibold text-accent-green py-2 bg-accent-green/10 rounded-xl border border-accent-green/20 inline-flex items-center justify-center w-full gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Kasus Sedang Dikerjakan Siswa</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleSelectClassCase(c.id)}
                            className="w-full rounded-full bg-paper-2 hover:bg-paper-3 border border-rule text-xs font-body font-semibold text-ink py-2 transition-colors shadow-xs min-h-[40px] flex items-center justify-center gap-1.5"
                          >
                            <span>Aktifkan untuk Kelas</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Form Custom Case Guru */}
              {isCreatingCase && (
                <form onSubmit={handleCreateCustomCase} className="p-5 bg-accent/10 border border-accent/30 rounded-2xl space-y-4 animate-in fade-in duration-200">
                  <div className="border-b border-accent/20 pb-2 flex items-center justify-between">
                    <span className="font-display font-medium text-base text-ink flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-accent" />
                      <span>Buat Kasus Investigasi & Saksi Baru Khusus Sekolah</span>
                    </span>
                    <button type="button" onClick={() => setIsCreatingCase(false)} className="text-xs text-ink-muted underline">
                      Batal
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-semibold text-ink-2 block mb-1">
                        1. Judul Kasus Liputan:
                      </label>
                      <input
                        type="text"
                        value={newCaseTitle}
                        onChange={(e) => setNewCaseTitle(e.target.value)}
                        placeholder="cth: Misteri Hilangnya Buku Langka di Perpustakaan"
                        className="w-full p-2.5 text-base sm:text-xs font-semibold rounded-xl border border-rule bg-paper"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-ink-2 block mb-1">
                        2. Lokasi Kejadian:
                      </label>
                      <input
                        type="text"
                        value={newCaseLocation}
                        onChange={(e) => setNewCaseLocation(e.target.value)}
                        placeholder="cth: Ruang Arsip Lt. 1"
                        className="w-full p-2.5 text-base sm:text-xs font-medium rounded-xl border border-rule bg-paper"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-ink-2 block mb-1">
                      Ringkasan Kasus untuk Siswa:
                    </label>
                    <textarea
                      value={newCaseSummary}
                      onChange={(e) => setNewCaseSummary(e.target.value)}
                      placeholder="Jelaskan secara singkat peristiwa yang terjadi agar siswa termotivasi mencari fakta..."
                      className="w-full p-2.5 text-base sm:text-xs font-medium rounded-xl border border-rule bg-paper h-20"
                    />
                  </div>

                  {/* Witness Details */}
                  <div className="p-4 bg-paper/60 border border-rule rounded-xl space-y-3">
                    <span className="font-display font-medium text-xs text-accent block">
                      Profil Saksi Kunci:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-medium text-ink-muted block mb-1">Nama Saksi:</label>
                        <input
                          type="text"
                          value={newCaseWitnessName}
                          onChange={(e) => setNewCaseWitnessName(e.target.value)}
                          placeholder="cth: Pak Budi"
                          className="w-full p-2 text-base sm:text-xs font-semibold rounded-lg border border-rule bg-paper"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-ink-muted block mb-1">Jabatan / Peran:</label>
                        <input
                          type="text"
                          value={newCaseWitnessRole}
                          onChange={(e) => setNewCaseWitnessRole(e.target.value)}
                          placeholder="cth: Penjaga Perpustakaan"
                          className="w-full p-2 text-base sm:text-xs font-medium rounded-lg border border-rule bg-paper"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-ink-muted block mb-1">Kategori Saksi:</label>
                        <input
                          type="text"
                          value={newCaseWitnessAvatar}
                          onChange={(e) => setNewCaseWitnessAvatar(e.target.value)}
                          placeholder="cth: Staf Sekolah"
                          className="w-full p-2 text-base sm:text-xs font-mono rounded-lg border border-rule bg-paper text-center"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-rule/50">
                      <div>
                        <label className="text-[11px] font-medium text-ink-muted block mb-1">Pertanyaan 1 (Fakta Biasa):</label>
                        <input
                          type="text"
                          value={newCaseQ1Text}
                          onChange={(e) => setNewCaseQ1Text(e.target.value)}
                          placeholder="cth: Pak, jam berapa perpustakaan ditutup kemarin?"
                          className="w-full p-2 text-base sm:text-xs rounded-lg border border-rule bg-paper"
                          required
                        />
                        <input
                          type="text"
                          value={newCaseQ1Answer}
                          onChange={(e) => setNewCaseQ1Answer(e.target.value)}
                          placeholder="Jawaban Saksi: Kemarin tutup tepat jam 16.00 WIB."
                          className="w-full p-2 text-base sm:text-xs rounded-lg border border-rule bg-paper mt-1"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-ink-muted block mb-1">Pertanyaan 2 (Kutipan Eksklusif / Scoop Emas):</label>
                        <input
                          type="text"
                          value={newCaseQ2Text}
                          onChange={(e) => setNewCaseQ2Text(e.target.value)}
                          placeholder="cth: Apakah ada pengunjung yang mencurigakan sore kemarin?"
                          className="w-full p-2 text-base sm:text-xs rounded-lg border border-rule bg-paper"
                        />
                        <input
                          type="text"
                          value={newCaseQ2Answer}
                          onChange={(e) => setNewCaseQ2Answer(e.target.value)}
                          placeholder="Jawaban Scoop: Bukunya bukan hilang, tapi sedang dipinjam kepala sekolah!"
                          className="w-full p-2 text-base sm:text-xs rounded-lg border border-rule bg-paper mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsCreatingCase(false)}
                      className="rounded-full bg-paper-2 hover:bg-paper-3 border border-rule text-xs font-medium px-4 py-2 text-ink min-h-[42px]"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="rounded-full bg-accent text-accent-ink hover:bg-accent-hi text-xs font-semibold px-5 py-2 shadow min-h-[42px]"
                    >
                      Terbitkan & Aktifkan Kasus Ini
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* 2. Live Monitor of Teams' Interview Progress */}
            <div className="glass p-5 rounded-2xl border border-rule shadow-card space-y-4">
              <div className="flex flex-wrap justify-between items-center gap-2 border-b border-rule/60 pb-3">
                <div>
                  <h3 className="font-display font-medium text-lg text-ink">
                    Radar Investigasi & Kemajuan Wawancara Biro:
                  </h3>
                  <p className="font-body text-xs text-ink-muted mt-0.5">
                    Pantau secara langsung biro mana saja yang sudah mengumpulkan kutipan resmi atau saksi mana yang no-comment.
                  </p>
                </div>
                <span className="font-body text-xs bg-paper-2 text-ink-muted border border-rule px-3 py-1 rounded-full">
                  Total {teams.length} Biro Terpantau
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-body text-xs">
                  <thead className="bg-paper-2/40 border-b border-rule text-[11px] text-ink-muted font-medium">
                    <tr>
                      <th className="p-3 text-center">No</th>
                      <th className="p-3">Nama Biro & Pemred</th>
                      <th className="p-3">Saksi Terwawancarai</th>
                      <th className="p-3">Fakta di Buku Saku</th>
                      <th className="p-3">Status Scoop Emas</th>
                      <th className="p-3 text-right">Aksi Meja Guru</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rule/60">
                    {teams.map((t, idx) => {
                      const caseProg = t.interviewProgress?.[activeClassCase.id] || {};
                      const witnesses = activeClassCase.witnesses || [];
                      const interviewedCount = witnesses.filter(w => (caseProg.witnesses?.[w.id]?.questionsAsked?.length || 0) > 0).length;
                      const notes = (t.pocketNotes || []).filter(n => n.caseId === activeClassCase.id);
                      const scoops = notes.filter(n => n.isScoop);
                      const hasNoComment = witnesses.some(w => caseProg.witnesses?.[w.id]?.isNoComment);

                      return (
                        <tr key={t.id} className="hover:bg-paper-2/40">
                          <td className="p-3 text-center font-mono text-ink-muted">{idx + 1}</td>
                          <td className="p-3">
                            <span className="font-medium text-ink block">{t.name}</span>
                            <span className="text-[11px] text-ink-muted">Ketua: {t.leaderName || t.members?.[0]?.name}</span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-accent">
                                {interviewedCount}/{witnesses.length}
                              </span>
                              <span className="text-ink-muted text-[11px]">Saksi</span>
                              {interviewedCount >= witnesses.length && (
                                <span className="text-[10px] bg-accent-green/20 text-accent-green px-1.5 py-0.2 rounded font-semibold">
                                  Lengkap!
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="font-body text-xs font-semibold text-ink">
                              {notes.length} Catatan
                            </span>
                          </td>
                          <td className="p-3">
                            {scoops.length > 0 ? (
                              <span className="bg-accent-orange/20 text-accent-orange border border-accent-orange/30 text-[10px] px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                <span>{scoops.length} Scoop Emas</span>
                              </span>
                            ) : (
                              <span className="text-ink-muted text-[11px] italic">Belum Ada</span>
                            )}
                            {hasNoComment && (
                              <span className="ml-1 text-[10px] bg-accent-red/20 text-accent-red px-1.5 py-0.2 rounded font-semibold">
                                Saksi No Comment
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleClearTeamInterview(t.id)}
                              className="text-xs text-ink-muted hover:text-accent-red underline inline-flex items-center gap-1 min-h-[36px]"
                              title="Reset catatan saku dan sesi wawancara biro ini"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Reset Sesi</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: KUNCI JAWABAN & RUBRIK SOLUSI */}
        {activeTab === "solutions" && (
          <TeacherAnswerKeysView teams={teams} />
        )}
      </main>

      {/* Disband Team Confirmation Modal (Dusk Style) */}
      {teamToDisband && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass p-6 sm:p-7 rounded-3xl border border-accent-red/40 max-w-md w-full space-y-4 shadow-card text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-accent-red/20 text-accent-red border border-accent-red/40 flex items-center justify-center mx-auto text-2xl shadow-sm">
              <Trash2 className="w-7 h-7" />
            </div>
            
            <div className="space-y-1">
              <h3 className="font-display font-medium text-xl text-ink">
                Bubarkan Biro Ini?
              </h3>
              <p className="font-body text-sm font-semibold text-accent-red">
                "{teamToDisband.name}"
              </p>
            </div>

            <p className="font-body text-xs text-ink-2 leading-relaxed bg-paper-2/50 border border-rule/70 p-3 rounded-xl">
              Tindakan ini akan <strong>menghapus biro secara permanen</strong> beserta seluruh {teamToDisband.members?.length || 0} anggota, kode 5-karakter ({teamToDisband.leaderCode}/{teamToDisband.memberCode}), kas ({teamToDisband.coins || 0} koin), dan rekap nilainya.
            </p>

            <div className="flex gap-2.5 justify-center pt-2">
              <button
                type="button"
                onClick={() => setTeamToDisband(null)}
                className="rounded-full bg-paper-2 hover:bg-paper-3 border border-rule px-5 py-2.5 text-xs font-body font-medium text-ink transition-colors min-h-[42px] flex-1"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => confirmDisbandTeam()}
                className="rounded-full bg-accent-red text-white hover:bg-accent-red/90 px-5 py-2.5 text-xs font-body font-semibold transition-colors shadow-md min-h-[42px] flex-1"
              >
                Ya, Bubarkan Biro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Reset Latihan Kelas */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass p-6 sm:p-7 rounded-3xl border border-accent-orange/40 max-w-lg w-full space-y-4 shadow-card text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-accent-orange/20 text-accent-orange border border-accent-orange/40 flex items-center justify-center mx-auto text-2xl shadow-sm">
              <RotateCcw className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="font-display font-medium text-xl sm:text-2xl text-ink">
                Reset Latihan Simulasi Redaksi
              </h3>
              <p className="font-body text-xs text-ink-muted">
                Pilih mode di bawah untuk mengulang sesi latihan bagi seluruh kelas:
              </p>
            </div>

            <div className="space-y-3 text-left pt-1">
              {/* Option A: Recommended - Reset Progress, Keep Teams */}
              <button
                type="button"
                disabled={isResetting}
                onClick={() => handleResetExercise(true)}
                className="w-full p-4 rounded-2xl border border-accent/40 bg-accent/10 hover:bg-accent/20 text-left transition-colors group flex items-start gap-3 shadow-xs"
              >
                <div className="w-9 h-9 rounded-xl bg-accent/20 text-accent border border-accent/40 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-semibold text-sm text-ink">
                      Ulang Latihan dari Tahap 1 (Biro & Kode Tetap Aktif)
                    </span>
                    <span className="bg-accent text-accent-ink text-[9px] font-bold px-1.5 py-0.2 rounded font-medium">
                      Direkomendasikan
                    </span>
                  </div>
                  <p className="font-body text-xs text-ink-muted mt-1 leading-relaxed">
                    Seluruh progres materi (Tahap 1, 2, 3), timer pengerjaan, skor jawaban, dan kas koin di-reset kembali ke awal. <strong>Tim, nama siswa, dan kode 5-karakter tetap tersimpan</strong> sehingga siswa langsung kembali ke Tahap 1 tanpa perlu login ulang.
                  </p>
                </div>
              </button>

              {/* Option B: Danger - Total Wipe */}
              <button
                type="button"
                disabled={isResetting}
                onClick={() => handleResetExercise(false)}
                className="w-full p-4 rounded-2xl border border-accent-red/30 bg-accent-red/5 hover:bg-accent-red/15 text-left transition-colors group flex items-start gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-accent-red/20 text-accent-red border border-accent-red/40 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-display font-semibold text-sm text-accent-red block">
                    Reset Total (Hapus Semua Biro & Siswa)
                  </span>
                  <p className="font-body text-xs text-ink-muted mt-1 leading-relaxed">
                    Menghapus seluruh kelompok dan akun siswa dari server untuk memulai kelas baru dari nol.
                  </p>
                </div>
              </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                disabled={isResetting}
                onClick={() => setIsResetModalOpen(false)}
                className="rounded-full bg-paper-2 hover:bg-paper-3 border border-rule px-6 py-2.5 text-xs font-body font-medium text-ink transition-colors min-h-[42px] w-full"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

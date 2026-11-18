import React, { useState } from 'react';
import { 
  X, Shield, Users, Plus, CheckCircle2, Key, RefreshCw, 
  Sparkles, Award, ArrowRight, Trash2, Coins, Megaphone 
} from 'lucide-react';
import { sound } from '../utils/sound';
import { 
  getAllTeams, 
  createTeamByAdmin, 
  getClassroomStage, 
  setClassroomStage, 
  resetClassroomProgress,
  registerOrUpdateTeam,
  addPressWarLog
} from '../utils/storage';

export default function TeacherAdminModal({ onClose, onClassUpdated }) {
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);

  // New Group Form State
  const [teamName, setTeamName] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [leaderClass, setLeaderClass] = useState("");
  const [customLeaderCode, setCustomLeaderCode] = useState("");
  const [customMemberCode, setCustomMemberCode] = useState("");
  const [announcementText, setAnnouncementText] = useState("");
  const [feedback, setFeedback] = useState(null);

  const teams = getAllTeams();
  const currentStage = getClassroomStage();

  const handleLoginPin = (e) => {
    e.preventDefault();
    sound.playClick();
    if (pin.trim() === "GURU2026" || pin.trim() === "admin" || pin.trim() === "guru") {
      sound.playSuccess();
      setIsAuthenticated(true);
      setAuthError(null);
    } else {
      sound.playError();
      setAuthError("PIN Guru tidak cocok! (Default: GURU2026)");
    }
  };

  const handleCreateTeam = (e) => {
    e.preventDefault();
    if (!teamName.trim() || !leaderName.trim() || !leaderClass.trim()) {
      sound.playError();
      setFeedback({ type: "error", text: "Nama Biro, Nama Ketua, dan Kelas Ketua wajib diisi!" });
      return;
    }

    sound.playStamp();
    const created = createTeamByAdmin({
      name: teamName.trim(),
      leaderName: leaderName.trim(),
      leaderClass: leaderClass.trim(),
      customLeaderCode: customLeaderCode.trim() || undefined,
      customMemberCode: customMemberCode.trim() || undefined
    });

    setFeedback({ 
      type: "success", 
      text: `Biro '${created.name}' sukses dibuat! Berikan Kode Ketua '${created.leaderCode}' ke ${created.leaderName}.` 
    });

    setTeamName("");
    setLeaderName("");
    setLeaderClass("");
    setCustomLeaderCode("");
    setCustomMemberCode("");
    if (onClassUpdated) onClassUpdated();
  };

  const handleAdvanceStage = (stageNum) => {
    sound.playStamp();
    setClassroomStage(stageNum);
    setFeedback({ type: "success", text: `Tahap ${stageNum} kini resmi dibuka untuk seluruh kelas!` });
    if (onClassUpdated) onClassUpdated();
  };

  const handleSendAnnouncement = (e) => {
    e.preventDefault();
    if (!announcementText.trim()) return;
    sound.playStamp();
    addPressWarLog(`PENGUMUMAN GURU: ${announcementText.trim()}`, "neutral");
    setAnnouncementText("");
    setFeedback({ type: "success", text: "Pengumuman berhasil disiarkan ke papan warta seluruh kelompok!" });
    if (onClassUpdated) onClassUpdated();
  };

  const handleGiveBonusCoins = (team) => {
    sound.playClick();
    const updated = {
      ...team,
      coins: (team.coins || 0) + 150
    };
    registerOrUpdateTeam(updated);
    sound.playSuccess();
    addPressWarLog(`GURU memberikan apresiasi keaktifan +150 Koin Kas kepada ${team.name}!`, "cooperation");
    setFeedback({ type: "success", text: `+150 Koin Kas diberikan ke ${team.name}!` });
    if (onClassUpdated) onClassUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-paper border-[3px] border-ink shadow-neo-lg w-full max-w-3xl my-auto relative max-h-[94vh] flex flex-col">
        {/* Top Header */}
        <div className="bg-ink text-paper px-4 py-3 flex items-center justify-between border-b-[3px] border-ink shrink-0">
          <div className="flex items-center gap-2 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider">
            <Shield className="w-5 h-5 text-accent-yellow shrink-0" />
            <span>MEJA GURU & PUSAT KENDALI KELOMPOK (ADMIN)</span>
          </div>
          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="text-paper hover:text-accent-orange p-1"
            aria-label="Tutup Panel Guru"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isAuthenticated ? (
          /* PIN LOGIN SCREEN */
          <div className="p-6 sm:p-8 flex-1 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="w-16 h-16 bg-accent-yellow border-[3px] border-ink shadow-neo flex items-center justify-center text-2xl font-extrabold">
              <Key className="w-8 h-8 text-ink" />
            </div>

            <div className="space-y-1">
              <h3 className="font-display font-extrabold text-2xl uppercase text-ink">
                Otorisasi Guru Penanggung Jawab
              </h3>
              <p className="font-mono text-xs text-ink-muted max-w-sm">
                Masukkan PIN Guru untuk membuat biro kelompok, menentukan ketua, dan membagikan kode penugasan.
              </p>
            </div>

            {authError && (
              <div className="p-2.5 bg-accent-red/20 border-[2px] border-accent-red text-xs font-mono font-bold text-accent-red">
                {authError}
              </div>
            )}

            <form onSubmit={handleLoginPin} className="space-y-3 w-full max-w-xs">
              <input
                type="password"
                placeholder="PIN Guru (cth: GURU2026)"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full border-[2.5px] border-ink bg-paper-card p-2.5 text-center font-mono font-extrabold text-base focus:outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="neo-btn p-3 bg-accent-yellow hover:bg-yellow-300 font-display font-bold text-sm uppercase w-full shadow-neo"
              >
                BUKA MEJA GURU
              </button>
            </form>

            <button
              onClick={() => { setPin("GURU2026"); }}
              className="text-xs font-mono text-ink-muted underline hover:text-ink pt-2"
            >
              (Gunakan PIN Default Kelas: GURU2026)
            </button>
          </div>
        ) : (
          /* AUTHENTICATED TEACHER DASHBOARD */
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
            {feedback && (
              <div className={`p-3 border-[2px] border-ink font-mono text-xs font-bold flex items-center justify-between shadow-neo-sm ${
                feedback.type === "success" ? "bg-accent-green text-paper" : "bg-accent-red text-paper"
              }`}>
                <span>{feedback.text}</span>
                <button onClick={() => setFeedback(null)} className="underline ml-2">Tutup</button>
              </div>
            )}

            {/* Stage Synchronizer Controls */}
            <div className="neo-box p-4 bg-accent-yellow space-y-3">
              <div className="flex flex-wrap justify-between items-center gap-2 border-b-[2px] border-ink pb-2">
                <span className="font-display font-bold text-sm uppercase text-ink flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent-orange" />
                  <span>Kendali Tahap Belajar Serentak Seluruh Kelas:</span>
                </span>
                <span className="font-mono text-xs font-bold bg-ink text-paper px-2 py-0.5">
                  SAAT INI: TAHAP {currentStage}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => handleAdvanceStage(1)}
                  className={`neo-btn p-2.5 text-xs font-bold ${currentStage === 1 ? "bg-ink text-paper" : "bg-paper-card hover:bg-paper-2"}`}
                >
                  Buka Tahap 1 (5W+1H)
                </button>
                <button
                  onClick={() => handleAdvanceStage(2)}
                  className={`neo-btn p-2.5 text-xs font-bold ${currentStage === 2 ? "bg-ink text-paper" : "bg-paper-card hover:bg-paper-2"}`}
                >
                  Buka Tahap 2 (Piramida)
                </button>
                <button
                  onClick={() => handleAdvanceStage(3)}
                  className={`neo-btn p-2.5 text-xs font-bold ${currentStage === 3 ? "bg-ink text-paper" : "bg-paper-card hover:bg-paper-2"}`}
                >
                  Buka Tahap 3 (Berita Utuh)
                </button>
              </div>
            </div>

            {/* Create New Team & Assign Leader Form */}
            <div className="neo-box p-4 sm:p-5 bg-paper-card space-y-4">
              <div className="border-b-[2px] border-ink pb-2 flex justify-between items-center">
                <h4 className="font-display font-bold text-base uppercase text-ink flex items-center gap-2">
                  <Plus className="w-4 h-4 text-accent-orange" />
                  <span>Bentuk Biro Baru & Tunjuk Ketua (Generate Kode):</span>
                </h4>
                <span className="font-mono text-[10px] bg-accent-orange text-paper px-2 py-0.5 font-bold">
                  OTORISASI GURU
                </span>
              </div>

              <form onSubmit={handleCreateTeam} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-mono text-[11px] font-bold text-ink block mb-1 uppercase">
                      1. Nama Biro Kelompok:
                    </label>
                    <input
                      type="text"
                      placeholder="cth: Biro Rajawali"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="w-full border-[2px] border-ink bg-paper p-2 text-xs font-bold focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-mono text-[11px] font-bold text-ink block mb-1 uppercase">
                      2. Nama Siswa Ketua (Pemred):
                    </label>
                    <input
                      type="text"
                      placeholder="cth: Budi Santoso"
                      value={leaderName}
                      onChange={(e) => setLeaderName(e.target.value)}
                      className="w-full border-[2px] border-ink bg-paper p-2 text-xs font-bold focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-mono text-[11px] font-bold text-ink block mb-1 uppercase">
                      3. Kelas Ketua:
                    </label>
                    <input
                      type="text"
                      placeholder="cth: 8-A atau 9-B"
                      value={leaderClass}
                      onChange={(e) => setLeaderClass(e.target.value)}
                      className="w-full border-[2px] border-ink bg-paper p-2 text-xs font-bold focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="font-mono text-[10px] text-ink-muted block mb-0.5">
                      Kode Ketua (5 Kombinasi Huruf & Angka, cth: 1X88H):
                    </label>
                    <input
                      type="text"
                      placeholder="cth: 1X88H"
                      maxLength={5}
                      value={customLeaderCode}
                      onChange={(e) => setCustomLeaderCode(e.target.value.toUpperCase())}
                      className="w-full border border-ink/40 bg-paper p-1.5 text-xs font-mono font-bold tracking-widest uppercase focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[10px] text-ink-muted block mb-0.5">
                      Kode Anggota (5 Kombinasi Huruf & Angka, cth: UD19J):
                    </label>
                    <input
                      type="text"
                      placeholder="cth: UD19J"
                      maxLength={5}
                      value={customMemberCode}
                      onChange={(e) => setCustomMemberCode(e.target.value.toUpperCase())}
                      className="w-full border border-ink/40 bg-paper p-1.5 text-xs font-mono font-bold tracking-widest uppercase focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="neo-btn p-3 bg-ink text-paper hover:bg-neutral-800 font-display font-bold text-xs uppercase w-full shadow-neo"
                >
                  TERBITKAN MANDAT KETUA & KODE ANGGOTA
                </button>
              </form>
            </div>

            {/* Broadcast Announcement */}
            <div className="p-3 bg-paper border-[2px] border-ink flex flex-col sm:flex-row items-center gap-2">
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-accent-orange shrink-0">
                <Megaphone className="w-4 h-4" />
                <span>Siaran Guru:</span>
              </div>
              <input
                type="text"
                placeholder="Ketik instruksi guru untuk disiarkan ke papan pengumuman semua kelompok..."
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                className="flex-1 border-[1.5px] border-ink bg-paper-card p-1.5 text-xs font-body focus:outline-none w-full"
              />
              <button
                onClick={handleSendAnnouncement}
                className="neo-btn neo-btn-sm bg-accent-yellow hover:bg-yellow-300 text-xs font-bold px-3 py-1.5 shrink-0 w-full sm:w-auto"
              >
                Kirim Siaran
              </button>
            </div>

            {/* Active Teams & Codes Directory */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-display font-bold text-sm uppercase text-ink">
                  Daftar Biro & Kode Mandat Aktif ({teams.length} Kelompok):
                </h4>
                <span className="font-mono text-xs text-ink-muted">
                  Bocoran Guru
                </span>
              </div>

              <div className="space-y-3">
                {teams.map((t) => (
                  <div key={t.id} className="neo-box p-3.5 bg-paper-card space-y-2">
                    <div className="flex flex-wrap justify-between items-center gap-2 border-b border-ink/20 pb-2">
                      <div>
                        <span className="font-display font-bold text-base text-ink uppercase">
                          {t.name}
                        </span>
                        <span className="font-mono text-xs text-ink-muted ml-2">
                          Kas: <strong>{t.coins || 0} Koin</strong> • Tahap {t.completedStages?.length || 0}/3
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleGiveBonusCoins(t)}
                          className="neo-btn neo-btn-sm bg-accent-yellow hover:bg-yellow-300 text-[10px] font-bold px-2 py-1 gap-1"
                          title="Beri bonus apresiasi keaktifan"
                        >
                          <Coins className="w-3 h-3 text-ink" />
                          <span>+150 Koin</span>
                        </button>
                      </div>
                    </div>

                    {/* Codes Pill Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                      <div className="p-2.5 bg-accent-yellow/20 border border-ink flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-ink-muted uppercase block font-bold">KODE KETUA (5 KARAKTER):</span>
                          <strong className="text-accent-orange text-base tracking-widest font-black select-all">{t.leaderCode || "1X88H"}</strong>
                        </div>
                        <span className="text-[10px] bg-ink text-paper px-1.5 py-0.5 font-bold">
                          {t.leaderName || t.members?.[0]?.name} ({t.leaderClass || t.members?.[0]?.classInfo})
                        </span>
                      </div>

                      <div className="p-2.5 bg-accent-green/20 border border-ink flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-ink-muted uppercase block font-bold">KODE ANGGOTA (5 KARAKTER):</span>
                          <strong className="text-accent-green text-base tracking-widest font-black select-all">{t.memberCode || "UD19J"}</strong>
                        </div>
                        <span className="text-[10px] bg-paper text-ink border border-ink px-1.5 py-0.5 font-bold">
                          {t.members?.length || 0} Anggota
                        </span>
                      </div>
                    </div>

                    {/* Members Roster with Roles */}
                    <div className="pt-1">
                      <span className="font-mono text-[10px] text-ink-muted uppercase block mb-1">
                        Anggota yang sudah bergabung ({t.members?.length || 0}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {t.members?.map((m, i) => {
                          const name = typeof m === "string" ? m : m.name;
                          const cls = typeof m === "string" ? "" : m.classInfo;
                          const role = typeof m === "string" ? "Wartawan" : (m.role || "Wartawan");
                          const isLead = typeof m === "string" ? i === 0 : m.isLeader;

                          return (
                            <span 
                              key={i} 
                              className={`font-mono text-[11px] px-2 py-0.5 border border-ink inline-flex items-center gap-1 ${
                                isLead ? "bg-accent-yellow font-bold" : "bg-paper"
                              }`}
                            >
                              <span>{isLead ? "[Ketua] " : ""}{name} ({cls})</span>
                              <span className="text-[9px] text-ink-muted italic">[{role}]</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

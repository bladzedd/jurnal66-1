import React, { useState, useEffect } from 'react';
import { 
  Key, Shield, ArrowRight, CheckCircle2, UserCheck, 
  HelpCircle, PenTool, Crown, Sparkles, ArrowLeft, Loader2,
  AlertTriangle, Users, Search, Layers, Scale, Trash2, Clock, User
} from 'lucide-react';
import { sound } from '../utils/sound';
import { 
  findTeamByAnyCode, 
  findTeamByAnyCodeAsync,
  joinTeamAsMember, 
  activatePendingTeam, 
  setActiveTeam, 
  setCurrentUser, 
  initDefaultTeamIfNeeded,
  getSavedUsers,
  removeSavedUser,
  loginAsSavedUser
} from '../utils/storage';

export const editorialRoles = [
  {
    id: "role_investigator",
    title: "Wartawan Penyelidik Lapangan",
    specialty: "Spesialis 5W+1H & Olah TKP",
    icon: Search,
    desc: "Membedah barang bukti, mengecek saksi, dan memvalidasi unsur pokok fakta."
  },
  {
    id: "role_pyramid",
    title: "Redaktur Struktur & Hierarki",
    specialty: "Spesialis Piramida Terbalik",
    icon: Layers,
    desc: "Menata urutan berita dari informasi paling penting di atas hingga rincian pelengkap."
  },
  {
    id: "role_sources",
    title: "Penyelidik Narasumber & Verifikator",
    specialty: "Spesialis Cover Both Sides",
    icon: Scale,
    desc: "Memastikan berita berimbang dan tidak sepihak antara narasumber yang berkonflik."
  },
  {
    id: "role_copy_editor",
    title: "Korektor Bahasa (Copy Editor)",
    specialty: "Spesialis Kata Baku & Anti-Opini",
    icon: PenTool,
    desc: "Menyaring opini subjektif, membuang kata berlebihan, dan menjaga akurasi judul."
  }
];

export default function GroupLoginScreen({ onLoginSuccess, onOpenAdmin }) {
  // Ensure default bootstrap only on cold initial start
  initDefaultTeamIfNeeded();

  // Primary Code State
  const [codeInput, setCodeInput] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Read URL query parameter if student clicks shared WhatsApp link (?code=1X88H or ?k=1X88H)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlCode = params.get('code') || params.get('k') || params.get('c') || params.get('kode');
      if (urlCode && urlCode.trim()) {
        setCodeInput(urlCode.trim().toUpperCase());
      }
    }
  }, []);

  // Intermediate Step after Code Match
  const [matchedData, setMatchedData] = useState(null); // { type: "leader" | "member", team }

  // Step 2A: Setup Form for Unassigned Leader Slots
  const [setupBiroName, setSetupBiroName] = useState("");
  const [setupLeaderName, setSetupLeaderName] = useState("");
  const [setupLeaderClass, setSetupLeaderClass] = useState("");

  // Step 2B: Member Identification Form
  const [memberName, setMemberName] = useState("");
  const [memberClass, setMemberClass] = useState("");
  const [selectedRole, setSelectedRole] = useState(editorialRoles[0].title);

  // Saved Users / Profiles on this Device
  const [savedUsers, setSavedUsers] = useState(() => getSavedUsers());

  useEffect(() => {
    const handleSync = () => {
      setSavedUsers(getSavedUsers());
    };
    window.addEventListener("classroom-sync", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("classroom-sync", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  // 1-Click Quick Login as Saved User
  const handleQuickLogin = (profileId) => {
    sound.playClick();
    setErrorMsg(null);
    const res = loginAsSavedUser(profileId);
    if (res.success) {
      sound.playSuccess();
      onLoginSuccess(res.team);
    } else {
      sound.playError();
      setErrorMsg(res.message);
      setSavedUsers(getSavedUsers());
    }
  };

  // Remove / Forget Saved User on this Device
  const handleRemoveSaved = (profileId, e) => {
    if (e) e.stopPropagation();
    sound.playClick();
    removeSavedUser(profileId);
    setSavedUsers(getSavedUsers());
  };

  // Quick Select an Existing Member from the Team Roster
  const handleSelectExistingMember = (m) => {
    sound.playClick();
    const cleanName = typeof m === "string" ? m : m.name;
    const cleanClass = typeof m === "string" ? "" : (m.classInfo || "");
    const cleanRole = typeof m === "string" ? editorialRoles[0].title : (m.role || editorialRoles[0].title);
    
    setMemberName(cleanName);
    if (cleanClass) setMemberClass(cleanClass);
    if (cleanRole) setSelectedRole(cleanRole);

    const res = joinTeamAsMember(matchedData.team.id, {
      name: cleanName,
      classInfo: cleanClass || "Kelas",
      role: cleanRole
    });

    if (res.success) {
      sound.playSuccess();
      onLoginSuccess(res.team);
    } else {
      setErrorMsg(res.message);
      sound.playError();
    }
  };

  // 1. Submit Code (Group Code or Direct Teacher PIN)
  const handleSubmitCode = async (e) => {
    if (e) e.preventDefault();
    sound.playClick();
    setErrorMsg(null);
    const cleanCode = codeInput.trim().toUpperCase();

    // Direct Teacher / Admin Access through the main single input!
    if (cleanCode === "040498" || cleanCode === "GURU2026") {
      sound.playSuccess();
      try {
        sessionStorage.setItem('redaksi_admin_auth', 'true');
      } catch {}
      if (onOpenAdmin) onOpenAdmin();
      return;
    }

    if (!cleanCode || cleanCode.length < 2) {
      setErrorMsg("Masukkan kode ruang redaksi secara lengkap!");
      sound.playError();
      return;
    }

    setIsVerifying(true);
    let match = null;
    try {
      match = await findTeamByAnyCodeAsync(cleanCode);
    } catch (err) {
      console.error("Gagal verifikasi kode ruang redaksi:", err);
    } finally {
      setIsVerifying(false);
    }

    if (!match) {
      setErrorMsg(`Kode '${cleanCode}' tidak ditemukan. Pastikan kode diberikan oleh Guru (untuk Ketua) atau oleh Ketua biromu (untuk Anggota).`);
      sound.playError();
      return;
    }

    // A. Matched as LEADER
    if (match.type === "leader") {
      // If the slot is pending setup by Ketua (identitas diisi oleh peserta/ketua)
      if (match.team.isPendingSetup) {
        sound.playSuccess();
        setMatchedData(match);
        setSetupBiroName(match.team.name && !match.team.name.startsWith("Biro Kelompok #") ? match.team.name : "");
        setSetupLeaderName(match.team.leaderName || "");
        setSetupLeaderClass(match.team.leaderClass || "");
        return;
      }

      // Already activated leader: direct login to Dashboard
      sound.playSuccess();
      sound.playStamp();
      setActiveTeam(match.team.id);
      const leaderUser = {
        role: "leader",
        name: match.team.leaderName || match.team.members?.[0]?.name || "Pemimpin Redaksi",
        classInfo: match.team.leaderClass || match.team.members?.[0]?.classInfo || "-",
        memberRole: "Pemimpin Redaksi (Ketua Kelompok)",
        teamId: match.team.id
      };
      setCurrentUser(leaderUser);
      onLoginSuccess(match.team);
      return;
    }

    // B. Matched as MEMBER
    if (match.type === "member") {
      if (match.team.isPendingSetup) {
        setErrorMsg(`Biro '${match.team.name}' belum diaktifkan oleh Ketua! Minta Ketua Kelompokmu untuk memasukkan Kode Ketua terlebih dahulu.`);
        sound.playError();
        return;
      }

      sound.playSuccess();
      setMatchedData(match);
      return;
    }
  };

  // 2. Finalize Pending Leader Bureau Setup (identitas diisi oleh peserta)
  const handleSetupLeaderSubmit = (e) => {
    e.preventDefault();
    if (!setupLeaderName.trim() || !setupLeaderClass.trim()) {
      setErrorMsg("Nama Lengkap Ketua dan Kelas wajib diisi!");
      sound.playError();
      return;
    }

    sound.playStamp();
    const finalBiroName = setupBiroName.trim() || `Biro ${setupLeaderName.trim()}`;
    const res = activatePendingTeam(matchedData.team.id, {
      name: finalBiroName,
      leaderName: setupLeaderName.trim(),
      leaderClass: setupLeaderClass.trim()
    });

    if (res.success) {
      sound.playSuccess();
      onLoginSuccess(res.team);
    } else {
      setErrorMsg(res.message);
      sound.playError();
    }
  };

  // 3. Finalize Member Registration
  const handleMemberJoinSubmit = (e) => {
    e.preventDefault();
    if (!memberName.trim() || !memberClass.trim()) {
      setErrorMsg("Nama Lengkap dan Kelas wajib diisi!");
      sound.playError();
      return;
    }

    sound.playStamp();
    const res = joinTeamAsMember(matchedData.team.id, {
      name: memberName.trim(),
      classInfo: memberClass.trim(),
      role: selectedRole
    });

    if (res.success) {
      sound.playSuccess();
      onLoginSuccess(res.team);
    } else {
      setErrorMsg(res.message);
      sound.playError();
    }
  };

  const handleResetCode = () => {
    sound.playClick();
    setMatchedData(null);
    setErrorMsg(null);
    setCodeInput("");
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col justify-between p-3 sm:p-5 selection:bg-accent-yellow selection:text-ink">
      <div className="max-w-md mx-auto w-full pt-4 sm:pt-8 space-y-5">
        {/* Top Masthead Meta */}
        <div className="flex justify-between items-center text-xs font-body text-ink-muted">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse shadow-[0_0_8px_var(--color-accent-green)]"></span>
            <span className="text-[11px] sm:text-xs">Portal Jurnal66 Task</span>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              if (onOpenAdmin) onOpenAdmin();
            }}
            className="rounded-full bg-accent-orange/15 hover:bg-accent-orange/25 border border-accent-orange/30 text-accent-orange text-xs font-body font-semibold gap-1.5 px-3.5 py-1.5 transition-all shadow-sm flex items-center min-h-[36px]"
            title="Buka Pusat Komando Dewan Redaksi / Meja Guru"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Meja Guru (Admin)</span>
          </button>
        </div>

        {/* Hero Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-accent/20 border border-accent/40 text-accent flex items-center justify-center font-display font-bold text-xl mx-auto shadow-md">
            J66
          </div>
          <h1 className="font-display font-medium text-3xl sm:text-4xl text-ink tracking-tight">
            Jurnal66 Task
          </h1>
          <p className="font-body text-xs sm:text-sm text-ink-muted max-w-sm mx-auto leading-relaxed">
            Simulasi Menulis Berita Straight News Berbasis Tim. Masukkan 1 kode untuk langsung masuk ke ruang liputan.
          </p>
        </div>

        {/* Error Alert Banner */}
        {errorMsg && (
          <div className="p-3.5 border border-accent-red/35 bg-accent-red/15 rounded-2xl font-body text-xs text-accent-red flex items-start gap-2.5 animate-in fade-in duration-200 shadow-sm">
            <AlertTriangle className="w-4 h-4 shrink-0 text-accent-red mt-0.5" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SAVED USERS / PROFIL TERSIMPAN DI PERANGKAT INI */}
        {/* ========================================================================= */}
        {!matchedData && savedUsers.length > 0 && (
          <div className="glass p-5 sm:p-6 space-y-3.5 shadow-card border border-accent/40 rounded-3xl animate-in fade-in duration-200 bg-gradient-to-br from-paper-2/80 via-paper-2/50 to-accent/5">
            <div className="flex items-center justify-between border-b border-rule/60 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-accent/20 border border-accent/30 text-accent flex items-center justify-center shadow-xs">
                  <UserCheck className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <h3 className="font-display font-medium text-sm sm:text-base text-ink">
                    Akun & Sesi Tersimpan
                  </h3>
                  <p className="font-body text-[11px] text-ink-muted">
                    Lanjutkan aktivitas redaksi tanpa perlu mengetik ulang kode:
                  </p>
                </div>
              </div>
              <span className="font-mono text-[10px] bg-accent/15 text-accent border border-accent/30 rounded-full px-2 py-0.5 font-bold shrink-0">
                {savedUsers.length} Profil
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar">
              {savedUsers.map((su) => (
                <div
                  key={su.id}
                  className="p-3 rounded-2xl border border-rule hover:border-accent/60 bg-paper-2/70 hover:bg-paper-2 transition-all flex items-center justify-between gap-2.5 shadow-xs group"
                >
                  <div 
                    onClick={() => handleQuickLogin(su.id)}
                    className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                  >
                    <div className="w-9 h-9 rounded-full bg-accent/15 border border-accent/30 text-accent flex items-center justify-center shrink-0 font-display font-bold text-sm shadow-xs">
                      {su.isLeader ? <Crown className="w-4 h-4 text-accent-orange" /> : <PenTool className="w-4 h-4 text-accent" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-display font-medium text-xs sm:text-sm text-ink truncate">
                          {su.name}
                        </span>
                        {su.classInfo && (
                          <span className="bg-paper-3 border border-rule text-[10px] px-1.5 py-0.2 rounded font-mono text-ink-muted shrink-0">
                            {su.classInfo}
                          </span>
                        )}
                        {su.isLeader && (
                          <span className="bg-accent-orange/20 text-accent-orange border border-accent-orange/30 text-[9px] px-1.5 py-0.2 rounded font-bold shrink-0">
                            Ketua
                          </span>
                        )}
                      </div>
                      <span className="font-body text-[11px] text-ink-muted truncate block">
                        {su.teamName ? `${su.teamName} • ` : ""}{su.memberRole || su.role}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleQuickLogin(su.id)}
                      className="rounded-full bg-accent text-accent-ink hover:bg-accent-hi text-xs font-semibold px-3 py-1.5 inline-flex items-center gap-1 transition-all shadow-sm min-h-[36px]"
                    >
                      <span>Masuk</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveSaved(su.id, e)}
                      className="w-8 h-8 rounded-full hover:bg-accent-red/15 hover:text-accent-red text-ink-muted flex items-center justify-center transition-colors min-h-[32px] min-w-[32px]"
                      title="Lupakan / Hapus akun tersimpan ini dari perangkat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-1 text-center font-body text-[10px] text-ink-muted">
              Profil di atas otomatis tersimpan di browser ini agar kamu bisa langsung lanjut mengerjakan tugas kapan saja.
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 1: SINGLE 1-CODE INPUT (PRIMARY ULTRA-CLEAN LANDING PAGE) */}
        {/* ========================================================================= */}
        {!matchedData && (
          <div className="glass p-6 sm:p-8 space-y-5 shadow-card border border-rule rounded-3xl animate-in fade-in duration-200">
            <div className="border-b border-rule/60 pb-3.5 flex items-center justify-between">
              <div>
                <h2 className="font-display font-medium text-lg text-ink flex items-center gap-2">
                  <Shield className="w-4 h-4 text-accent" />
                  <span>{savedUsers.length > 0 ? "Atau Masuk dengan Kode Baru" : "Masukkan Kode Kelompok"}</span>
                </h2>
                <p className="font-body text-xs text-ink-muted mt-0.5">
                  Kode biro pers atau PIN Guru Pengampu
                </p>
              </div>
              <span className="font-mono text-xs bg-accent/15 text-accent border border-accent/30 rounded-full px-2.5 py-0.5 font-bold">
                KODE MASUK
              </span>
            </div>

            <form onSubmit={handleSubmitCode} className="space-y-4">
              <div>
                <label className="font-body text-xs font-semibold text-ink-2 block mb-2">
                  Kode Ruang Redaksi (Ketua atau Anggota):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Contoh: 1X88H atau UD19J"
                    maxLength={15}
                    value={codeInput}
                    onChange={(e) => {
                      setCodeInput(e.target.value);
                      setErrorMsg(null);
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pasted = (e.clipboardData || window.clipboardData)?.getData('text') || "";
                      setCodeInput(pasted.trim().toUpperCase());
                      setErrorMsg(null);
                    }}
                    className="w-full p-4 font-mono font-bold text-2xl sm:text-3xl tracking-widest text-center uppercase rounded-2xl border border-rule bg-paper-2/60 text-ink focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all shadow-inner"
                    autoFocus
                    required
                  />
                </div>
                <div className="mt-2.5 space-y-1 text-center font-body text-[11px] text-ink-muted">
                  <p className="flex items-center justify-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span><strong>Untuk Siswa:</strong> Masukkan kode dari Guru (untuk Ketua) atau dari Ketua (untuk Anggota).</span>
                  </p>
                  <p className="text-[10px] text-ink-muted/80 flex items-center justify-center gap-1.5">
                    <Crown className="w-3 h-3 text-accent-orange shrink-0" />
                    <span><strong>Untuk Guru:</strong> Masuk ke <em>Meja Guru</em> melalui tombol di kanan atas dengan PIN keamanan.</span>
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="neo-btn p-3.5 bg-accent text-accent-ink hover:bg-accent-hi font-body font-semibold text-sm rounded-full w-full flex items-center justify-center gap-2 transition-all shadow-lg min-h-[46px] disabled:opacity-60"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-accent-ink" />
                    <span>Memverifikasi Kode...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Ruang Redaksi</span>
                    <ArrowRight className="w-4 h-4 text-accent-ink" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 border-t border-rule/50 text-center font-body text-[11px] text-ink-muted/80">
              Belum punya kelompok? Mintalah kode kelompok resmi kepada Guru Pengampu.
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2A: LEADER ACTIVATION FORM (FOR UNASSIGNED LEADER SLOTS) */}
        {/* ========================================================================= */}
        {matchedData && matchedData.type === "leader" && (
          <div className="glass p-6 sm:p-8 space-y-4 shadow-card border border-accent/40 rounded-3xl animate-in fade-in zoom-in-95 duration-200">
            <div className="border-b border-rule/60 pb-3 flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-accent/20 text-accent border border-accent/30 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full mb-1">
                  <Crown className="w-3 h-3" />
                  <span>KODE MANDAT KETUA TERVERIFIKASI</span>
                </div>
                <h3 className="font-display font-medium text-xl text-ink">
                  Daftarkan Biro Kelompokmu
                </h3>
              </div>
            </div>

            <form onSubmit={handleSetupLeaderSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-body text-xs font-semibold text-ink-2 block mb-1">
                    1. Nama Lengkap Ketua (Pemred):
                  </label>
                  <input
                    type="text"
                    placeholder="Nama lengkap kamu"
                    value={setupLeaderName}
                    onChange={(e) => setSetupLeaderName(e.target.value)}
                    className="w-full p-3 text-base sm:text-sm font-medium"
                    autoFocus
                    required
                  />
                </div>

                <div>
                  <label className="font-body text-xs font-semibold text-ink-2 block mb-1">
                    2. Kelas:
                  </label>
                  <input
                    type="text"
                    placeholder="cth: 8A atau 9B"
                    value={setupLeaderClass}
                    onChange={(e) => setSetupLeaderClass(e.target.value)}
                    className="w-full p-3 text-base sm:text-sm font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-body text-xs font-semibold text-ink-2 block mb-1">
                  3. Nama Biro Kelompok (opsional):
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Biro Investigasi Rajawali"
                  value={setupBiroName}
                  onChange={(e) => setSetupBiroName(e.target.value)}
                  className="w-full p-3 text-base sm:text-sm font-medium"
                />
                <span className="font-body text-[11px] text-ink-muted block mt-1">
                  *Bila dikosongkan, nama biro akan otomatis disesuaikan dengan namamu.
                </span>
              </div>

              <div className="p-3 bg-accent/10 border border-accent/25 rounded-xl font-body text-[11px] text-ink-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent shrink-0" />
                <span>Begitu biro aktif, kode anggota untuk rekan timmu akan langsung muncul di mejamu!</span>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  className="neo-btn p-3.5 bg-accent text-accent-ink hover:bg-accent-hi font-body font-semibold text-sm rounded-full w-full flex items-center justify-center gap-2 transition-all shadow-lg min-h-[46px]"
                >
                  <span>Aktifkan Biro & Buka Meja Redaksi</span>
                  <ArrowRight className="w-4 h-4 text-accent-ink" />
                </button>

                <button
                  type="button"
                  onClick={handleResetCode}
                  className="rounded-full bg-paper-2 hover:bg-paper-3 border border-rule text-xs font-body font-medium text-ink-muted hover:text-ink text-center py-2.5 px-4 inline-flex items-center justify-center gap-1.5 transition-all min-h-[44px]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Ganti / Masukkan Kode Lain</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2B: MEMBER IDENTIFICATION FORM (JOINING AN EXISTING BIRO) */}
        {/* ========================================================================= */}
        {matchedData && matchedData.type === "member" && (
          <div className="glass p-6 sm:p-8 space-y-4 shadow-card border border-rule rounded-3xl animate-in fade-in zoom-in-95 duration-200">
            <div className="border-b border-rule/60 pb-3 flex items-start justify-between gap-2">
              <div>
                <span className="font-mono text-[10px] bg-accent-green/15 text-accent-green border border-accent-green/30 px-2 py-0.5 rounded-full font-bold uppercase inline-block mb-1">
                  KODE ANGGOTA COCOK
                </span>
                <h3 className="font-display font-medium text-xl text-ink">
                  {matchedData.team.name}
                </h3>
                <p className="font-body text-xs text-ink-muted mt-0.5">
                  Ketua Biro: <strong>{matchedData.team.leaderName || matchedData.team.members?.[0]?.name}</strong> ({matchedData.team.leaderClass || matchedData.team.members?.[0]?.classInfo})
                </p>
              </div>
            </div>

            {/* Quick Select for Returning Members of this Team */}
            {matchedData.team.members?.filter(m => !m.isLeader).length > 0 && (
              <div className="p-3.5 bg-accent/10 border border-accent/25 rounded-2xl space-y-2">
                <span className="font-body text-xs font-semibold text-accent flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Pernah daftar di biro ini sebelumnya? Klik nama kamu untuk langsung masuk:</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {matchedData.team.members.filter(m => !m.isLeader).map((m, idx) => {
                    const mName = typeof m === "string" ? m : m.name;
                    const mRole = typeof m === "string" ? "Wartawan" : (m.role || "Wartawan");
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectExistingMember(m)}
                        className="rounded-full bg-paper-2/90 hover:bg-accent hover:text-accent-ink border border-rule px-3 py-1.5 text-xs font-body font-medium transition-all inline-flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                      >
                        <PenTool className="w-3 h-3 text-accent" />
                        <span className="font-semibold">{mName}</span>
                        <span className="text-[10px] opacity-75">({mRole})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <form onSubmit={handleMemberJoinSubmit} className="space-y-3.5">
              <div className="text-xs font-semibold text-ink-2">
                {matchedData.team.members?.filter(m => !m.isLeader).length > 0 ? "Atau daftar sebagai anggota baru di biro ini:" : "Daftar sebagai anggota di biro ini:"}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-body text-xs font-semibold text-ink-2 block mb-1">
                    Nama Lengkap Siswa:
                  </label>
                  <input
                    type="text"
                    placeholder="Nama kamu"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    className="w-full p-3 text-base sm:text-sm font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="font-body text-xs font-semibold text-ink-2 block mb-1">
                    Kelas:
                  </label>
                  <input
                    type="text"
                    placeholder="cth: 8A atau 9B"
                    value={memberClass}
                    onChange={(e) => setMemberClass(e.target.value)}
                    className="w-full p-3 text-base sm:text-sm font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-body text-xs font-semibold text-ink-2 block mb-1.5">
                  Pilih Peran Redaksi di Kelompok Ini:
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {editorialRoles.map((r) => {
                    const isSelected = selectedRole === r.title;
                    const IconComp = r.icon || PenTool;
                    return (
                      <div
                        key={r.id}
                        onClick={() => { sound.playClick(); setSelectedRole(r.title); }}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2.5 min-h-[44px] ${
                          isSelected 
                            ? "bg-accent/15 border-accent/40 shadow-sm" 
                            : "bg-paper-2/50 border-rule hover:border-rule/80 hover:bg-paper-2"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                          isSelected ? "bg-accent text-accent-ink border-accent/50" : "bg-paper text-ink-muted border-rule"
                        }`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-display font-medium text-xs text-ink">{r.title}</span>
                            <span className="text-[10px] text-accent font-semibold">{r.specialty}</span>
                          </div>
                          <p className="font-body text-[11px] text-ink-muted mt-0.5 leading-tight">{r.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  className="neo-btn p-3.5 bg-accent text-accent-ink hover:bg-accent-hi font-body font-semibold text-sm rounded-full w-full flex items-center justify-center gap-2 transition-all shadow-lg min-h-[46px]"
                >
                  <span>Bergabung ke Meja Redaksi</span>
                  <ArrowRight className="w-4 h-4 text-accent-ink" />
                </button>

                <button
                  type="button"
                  onClick={handleResetCode}
                  className="rounded-full bg-paper-2 hover:bg-paper-3 border border-rule text-xs font-body font-medium text-ink-muted hover:text-ink text-center py-2.5 px-4 inline-flex items-center justify-center gap-1.5 transition-all min-h-[44px]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Bukan biromu? Masukkan Kode Lain</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer info banner */}
        <div className="glass p-3.5 rounded-2xl border border-rule/60 text-center font-body text-xs text-ink-muted/80 space-y-1">
          <div className="font-semibold text-ink-2">Privasi & Kode Redaksi</div>
          <p className="text-[11px] leading-relaxed">
            Data kelompok dan kode akses terlindungi. Hanya siswa yang memiliki kode valid dari Guru atau Ketua yang dapat mengakses meja kerja biro.
          </p>
        </div>
      </div>

      <div className="text-center font-body text-xs text-ink-muted/60 py-2">
        Jurnal66 Task • Platform Edukasi Jurnalistik Digital
      </div>
    </div>
  );
}
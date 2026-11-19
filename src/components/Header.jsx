import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Users, UserCheck, LogOut, ShoppingBag, Shield, ShieldCheck, AlertTriangle, Key, Clock, Coins, Crown, PenTool, Newspaper } from 'lucide-react';
import { sound } from '../utils/sound';
import { getCurrentUser, getPressWarLogs, getGlobalTimer } from '../utils/storage';

export default function Header({ 
  team, 
  onOpenPressCard, 
  onOpenShop,
  onBackToHome, 
  onLogoutTeam,
  onOpenTeacherModal
}) {
  const [muted, setMuted] = useState(sound.isMuted());
  const currentUser = getCurrentUser();
  const [timerState, setTimerState] = useState(() => getGlobalTimer());

  useEffect(() => {
    const intv = setInterval(() => {
      setTimerState(getGlobalTimer());
    }, 1000);
    return () => clearInterval(intv);
  }, []);

  const toggleSound = () => {
    const next = !muted;
    sound.setMuted(next);
    setMuted(next);
    if (!next) sound.playClick();
  };

  const completedCount = team?.completedStages?.length || 0;
  const rankLevel = Math.min(4, Math.floor(completedCount / 2) + 1);

  const liveLogs = getPressWarLogs();
  const tickerItems = liveLogs.length > 0 
    ? liveLogs.slice(0, 8).map(l => l.text)
    : [
        "Anggaran Liputan: Kelola koin kas biro dengan bijak atau beli kartu strategi di Toko Peralatan!",
        "Siklus Straight News: Kolaborasi dengan tim lain atau manfaatkan strategi pers!",
        "Pasang Perisai Hak Jawab untuk melindungi kas biro dari sabotase tim lawan!",
        "Jurnal66 Task: Verifikasi fakta 5W+1H sebelum menerbitkan naskah berita!"
      ];

  return (
    <header className="bg-paper/95 border-b border-rule sticky top-0 z-40 max-w-full overflow-hidden shadow-xs">
      {/* Top Meta Bar */}
      <div className="bg-paper-2/70 border-b border-rule/50 py-1.5 px-3 sm:px-4 flex justify-between items-center text-xs font-body tracking-tight text-ink-muted">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-block w-2 h-2 rounded-full bg-accent-green shrink-0 shadow-[0_0_8px_var(--color-accent-green)]"></span>
          <span className="truncate">Biro: <strong className="text-ink font-semibold">{team?.name || "Tim Redaksi"}</strong></span>
          <span className="bg-accent/15 text-accent border border-accent/30 rounded-full px-2 py-0.5 text-[11px] font-body font-medium hidden xs:inline shrink-0">
            Kode: <span className="font-mono font-bold">{team?.memberCode || "UD19J"}</span>
          </span>
          {team?.activeShield && (
            <span className="bg-accent-green/15 text-accent-green border border-accent-green/30 rounded-full px-2 py-0.5 text-[10px] font-medium hidden sm:inline-flex items-center gap-1 shrink-0">
              <ShieldCheck className="w-3 h-3 text-accent-green" />
              <span>Perisai aktif</span>
            </span>
          )}
          {team?.activeDebuffs?.length > 0 && (
            <span className="bg-accent-red/15 text-accent-red border border-accent-red/30 rounded-full px-2 py-0.5 text-[10px] font-medium animate-pulse motion-reduce:animate-none hidden sm:inline-flex items-center gap-1 shrink-0">
              <AlertTriangle className="w-3 h-3 text-accent-red" />
              <span>Sabotase ({team.activeDebuffs.length})</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-2">
          {timerState.isRunning && (
            <div 
              className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold flex items-center gap-1.5 shrink-0 ${
                timerState.remainingSeconds <= 300
                  ? "bg-accent-red/20 text-accent-red border border-accent-red/40 animate-pulse motion-reduce:animate-none"
                  : "bg-accent-orange/15 text-accent-orange border border-accent-orange/30"
              }`}
              title="Sisa Waktu Sesi / Ujian Jurnalistik"
            >
              <Clock className="w-3.5 h-3.5 animate-spin motion-reduce:animate-none" />
              <span>{Math.floor(timerState.remainingSeconds / 60)}:{(timerState.remainingSeconds % 60).toString().padStart(2, '0')}</span>
            </div>
          )}
          {onOpenTeacherModal && (
            <button
              onClick={() => { sound.playClick(); onOpenTeacherModal(); }}
              className="text-accent hover:text-accent-hi text-xs font-semibold inline-flex items-center gap-1 transition-colors min-h-[38px] px-2.5 py-1 rounded-full bg-accent/10 border border-accent/25 hover:bg-accent/20 focus-visible:outline-2 focus-visible:outline-accent"
              title="Panel Guru"
              aria-label="Panel Meja Guru"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Meja Guru</span>
            </button>
          )}
          <span className="hidden sm:inline text-xs text-ink-muted">Tim: {team?.members?.length || 0} Siswa</span>
          <span className="bg-paper-3/90 border border-rule px-2 py-0.5 rounded-full text-[11px] font-medium text-ink">
            Tahap {Math.min(3, completedCount + 1)}/3
          </span>
        </div>
      </div>

      {/* Main Masthead Banner */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3.5 flex items-center justify-between gap-2.5 sm:gap-4">
        {/* Brand / Logo */}
        <div 
          onClick={() => { sound.playClick(); onBackToHome(); }}
          className="cursor-pointer flex items-center gap-2.5 sm:gap-3.5 group min-w-0"
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-accent/20 border border-accent/40 text-accent flex items-center justify-center font-display font-semibold text-sm sm:text-base tracking-tight shadow-sm group-hover:bg-accent group-hover:text-accent-ink transition-colors shrink-0">
            J66
          </div>
          <div className="min-w-0">
            <h1 className="font-display font-medium text-xl sm:text-2xl tracking-tight leading-none text-ink truncate">
              Jurnal66 Task
            </h1>
            <div className="font-body text-xs text-ink-muted leading-tight mt-1 truncate max-w-[150px] sm:max-w-none flex items-center gap-1.5">
              <span>Biro: <strong className="text-ink-2 font-medium">{team?.name}</strong></span>
              {currentUser && (
                <span className="bg-paper-3/80 border border-rule px-1.5 py-0.5 rounded text-[10px] text-ink font-medium shrink-0 inline-flex items-center gap-1">
                  {currentUser.role === "leader" ? (
                    <>
                      <Crown className="w-3 h-3 text-accent-orange" />
                      <span>Ketua</span>
                    </>
                  ) : (
                    <>
                      <PenTool className="w-2.5 h-2.5 text-accent" />
                      <span>{currentUser.name}</span>
                    </>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Currency / Shop Button */}
          <button
            onClick={() => { sound.playClick(); onOpenShop(); }}
            title="Buka Toko Peralatan & Pasar Strategi Pers"
            aria-label="Toko Peralatan & Koin"
            className="rounded-full bg-accent-orange/15 border border-accent-orange/30 text-accent-orange hover:bg-accent-orange/25 px-2.5 sm:px-3 py-1.5 text-xs font-body font-semibold flex items-center gap-1.5 transition-colors shadow-sm min-h-[42px]"
          >
            <Coins className="w-3.5 h-3.5 shrink-0 text-accent-orange" />
            <span>{team?.coins || 0}</span>
            <span className="hidden xs:inline">Koin</span>
            <ShoppingBag className="w-3.5 h-3.5 ml-0.5" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={muted ? "Nyalakan Efek Suara" : "Matikan Efek Suara"}
            className="w-10 h-10 sm:w-10 sm:h-10 rounded-full border border-rule bg-paper-2/60 hover:bg-paper-2 text-ink flex items-center justify-center transition-colors min-h-[42px] min-w-[42px]"
            aria-label="Toggle Sound"
          >
            {muted ? <VolumeX className="w-4 h-4 text-ink-muted" /> : <Volume2 className="w-4 h-4 text-ink" />}
          </button>

          {/* Press Card Button */}
          <button
            onClick={() => { sound.playClick(); onOpenPressCard(); }}
            className="rounded-full bg-paper-2/70 hover:bg-paper-2 border border-rule px-2.5 sm:px-3 py-1.5 text-xs font-body text-ink flex items-center gap-1.5 transition-colors shadow-sm min-h-[42px]"
            title="Kartu Biro Pers"
            aria-label="Kartu Pers"
          >
            <UserCheck className="w-3.5 h-3.5 text-accent" />
            <span className="hidden xs:inline">Kartu</span>
            <span className="bg-accent/20 text-accent text-[10px] px-1.5 py-0.2 rounded-full font-semibold">
              Lv.{rankLevel}
            </span>
          </button>

          {/* Switch / Logout Team */}
          <button
            onClick={() => { sound.playClick(); onLogoutTeam(); }}
            title="Ganti Pengguna / Profil Biro"
            className="rounded-full bg-paper-2/70 hover:bg-paper-2 border border-rule p-2 sm:px-3 sm:py-1.5 text-xs font-body text-ink-muted hover:text-ink flex items-center justify-center gap-1 transition-colors shadow-sm min-h-[42px] min-w-[42px]"
          >
            <LogOut className="w-3.5 h-3.5 text-accent-red" />
            <span className="hidden lg:inline">Ganti Pengguna</span>
          </button>
        </div>
      </div>

      {/* Ticker Bar (Kawat Berita Redaksi) */}
      <div className="bg-paper-3/40 border-t border-rule/60 py-1.5 px-3 text-xs font-body text-ink-muted flex items-center overflow-hidden max-w-full">
        <div className="rounded-full bg-accent-orange/15 border border-accent-orange/30 text-accent-orange px-2.5 py-0.5 text-[10px] font-semibold mr-2 shrink-0">
          Kawat Berita
        </div>
        <div className="ticker-wrapper flex-1">
          <div className="animate-ticker text-ink-2">
            {tickerItems.map((item, idx) => (
              <span key={idx} className="mr-8">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, Users, ArrowRight, ShoppingBag, ShieldAlert, Sparkles, Pause, Play, Radio, Lock } from 'lucide-react';
import { sound } from '../utils/sound';
import { getAllTeams, isStageCompleted, getTeamStageTimer, formatDuration } from '../utils/storage';
import { journalismStages } from '../data/journalismData';

export default function StageWaitingRoom({ team, currentStage, onOpenShop, onStageAdvanced }) {
  const [, setTick] = useState(0);

  // Live tick interval so running timers of other teams update every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const allTeams = getAllTeams();
  const currentTeam = allTeams.find(t => t.id === team.id) || team;
  const currentTeamTimer = getTeamStageTimer(currentTeam, currentStage);
  const stageData = journalismStages.find(s => s.number === currentStage) || journalismStages[0];
  const nextStageData = journalismStages.find(s => s.number === currentStage + 1);

  const completedCount = allTeams.filter(t => isStageCompleted(t, currentStage)).length;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* Waiting Room Hero Banner */}
      <section className="glass p-6 sm:p-8 rounded-2xl border border-rule text-center space-y-3 sm:space-y-4 shadow-card">
        <div className="neo-stamp bg-accent-green/20 text-accent-green border-accent-green/40 text-xs sm:text-sm font-semibold mx-auto">
          Tahap #{currentStage} Tuntas & Terkunci!
        </div>

        <h2 className="font-display font-medium text-2xl sm:text-4xl text-ink tracking-tight break-words">
          Kerja Hebat, {currentTeam.name}!
        </h2>

        {/* Paused Working Time Banner for Current Group */}
        <div className="p-3.5 sm:p-4 bg-accent-green/15 border border-accent-green/40 rounded-2xl max-w-lg mx-auto flex items-center justify-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-accent-green/25 text-accent-green flex items-center justify-center shrink-0 shadow-2xs">
            <Pause className="w-5 h-5 fill-current" />
          </div>
          <div className="text-left">
            <span className="text-[10px] sm:text-[11px] font-bold text-accent-green uppercase tracking-wider block">
              WAKTU KERJA BIRO RESMI DI-PAUSE:
            </span>
            <span className="font-mono text-base sm:text-lg font-bold text-ink flex items-center gap-2 flex-wrap">
              <span className="text-accent-green">{currentTeamTimer.formatted}</span>
              <span className="text-xs font-normal text-ink-muted">(Waktu jeda tunggu TIDAK dihitung)</span>
            </span>
          </div>
        </div>

        <p className="font-body text-xs sm:text-base text-ink-2 max-w-xl mx-auto leading-relaxed">
          Biro kalian sudah berhasil menyelesaikan <strong>{stageData.title}</strong>! Stopwatch kerja biro otomatis <strong>di-pause</strong> agar adil. Tahap berikutnya akan dibuka serentak oleh Guru Pengampu dari Meja Guru.
        </p>

        {/* Live Status Indicator */}
        <div className="p-3 bg-accent/15 border border-accent/30 rounded-xl inline-flex items-center gap-2.5 shadow-sm text-xs font-body text-ink text-left">
          <Clock className="w-4 h-4 text-accent-orange animate-spin shrink-0" />
          <span>
            <strong>Progres Kelas:</strong> {completedCount} dari {allTeams.length} kelompok telah menyelesaikan Tahap {currentStage}
          </span>
        </div>
      </section>

      {/* Classroom Teams Roster (Who is done & paused vs who is still working) */}
      <section className="glass p-5 rounded-2xl border border-rule shadow-card space-y-3.5">
        <div className="border-b border-rule/60 pb-2.5 flex justify-between items-center gap-2">
          <h3 className="font-display font-medium text-sm sm:text-base text-ink flex items-center gap-2">
            <Users className="w-4 h-4 text-accent-orange shrink-0" />
            <span>Waktu Kerja & Status Kelompok Lain:</span>
          </h3>
          <span className="font-body text-xs text-ink-muted shrink-0 font-mono">Tahap {currentStage}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {allTeams.map((t) => {
            const isDone = isStageCompleted(t, currentStage);
            const isCurrentTeam = t.id === currentTeam.id;
            const tTimer = getTeamStageTimer(t, currentStage);

            return (
              <div
                key={t.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-2.5 transition-all ${
                  isCurrentTeam 
                    ? "bg-accent/15 border-accent/40 shadow-sm" 
                    : "bg-paper-2/40 border-rule/80 hover:bg-paper-2/70"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-medium text-sm text-ink">
                      {t.name}
                    </span>
                    {isCurrentTeam && (
                      <span className="bg-accent/20 text-accent border border-accent/30 text-[9px] px-1.5 py-0.2 rounded font-semibold">
                        Tim Kamu
                      </span>
                    )}
                  </div>
                  <span className="font-body text-xs text-ink-muted mt-0.5 block">
                    {t.members?.length || 0} Siswa • Kas: {t.coins || 0} Koin
                  </span>
                </div>

                <div className="text-right shrink-0">
                  {isDone ? (
                    <span className="font-body text-[11px] font-semibold bg-accent-green/20 text-accent-green px-2.5 py-1 rounded-full border border-accent-green/30 inline-flex items-center gap-1.5 shadow-2xs">
                      <Pause className="w-3 h-3 fill-current" />
                      <span>{tTimer.formatted} (Beres / Pause)</span>
                    </span>
                  ) : (
                    <span className="font-body text-[11px] font-medium bg-accent-orange/15 text-accent-orange px-2.5 py-1 rounded-full border border-accent-orange/30 inline-flex items-center gap-1.5 shadow-2xs">
                      <Play className="w-3 h-3 fill-current animate-pulse text-accent-orange" />
                      <span>{tTimer.formatted} (Lagi Ngerjain)</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Activities While Waiting */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Shop Shortcut */}
        <div className="glass p-5 rounded-2xl border border-rule flex flex-col justify-between shadow-card">
          <div>
            <div className="flex items-center gap-2 font-body text-xs font-semibold text-accent-orange mb-1">
              <ShoppingBag className="w-4 h-4" />
              <span>Santai Dulu Sambil Siapin Taktik</span>
            </div>
            <h4 className="font-display font-medium text-base text-ink">
              Toko Peralatan & Pasar Strategi
            </h4>
            <p className="font-body text-xs text-ink-2 mt-1 leading-relaxed">
              Pake Koin Redaksi kalian buat beli <strong>Perisai</strong> atau kirim <strong>Debuff Opsi Mengecoh</strong> ke meja kelompok lawan biar makin seru!
            </p>
          </div>
          <div className="mt-4">
            <button
              onClick={() => { sound.playClick(); onOpenShop(); }}
              className="neo-btn bg-accent-orange/15 hover:bg-accent-orange/25 border border-accent-orange/30 text-accent-orange text-xs font-semibold w-full py-2.5 rounded-full transition-all min-h-[44px]"
            >
              Belanja di Toko Redaksi
            </button>
          </div>
        </div>

        {/* Live Classroom Status & Waiting for Teacher */}
        <div className="glass p-5 rounded-2xl border border-rule flex flex-col justify-between shadow-card">
          <div>
            <div className="flex items-center gap-2 font-body text-xs font-semibold text-accent mb-1">
              <Radio className="w-4 h-4 text-accent animate-pulse" />
              <span>Status Otorisasi Kelas Terpusat</span>
            </div>
            <h4 className="font-display font-medium text-base text-ink flex items-center gap-2">
              <Lock className="w-4 h-4 text-ink-muted" />
              <span>Menunggu Pembukaan Tahap Berikutnya</span>
            </h4>
            <p className="font-body text-xs text-ink-muted mt-1 leading-relaxed">
              Guru Pengampu akan membuka materi <strong>{nextStageData?.title || "Tahap Berikutnya"}</strong> secara serentak dari Meja Guru. Begitu dibuka, layar seluruh kelompok akan otomatis berganti secara real-time!
            </p>
          </div>
          <div className="mt-4 p-3 bg-paper-2/60 border border-rule/70 rounded-xl text-center">
            <span className="font-body text-xs text-accent font-medium inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
              <span>Menunggu komando Guru Pengampu di depan kelas...</span>
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

import React, { useState } from 'react';
import { 
  CheckCircle2, Lock, ArrowRight, Award, Newspaper, 
  HelpCircle, Eye, ShoppingBag, Shield, AlertTriangle, Users, Sparkles, Trash2, Copy, Check,
  MessageSquare, BookOpen, Coins, Megaphone, Lightbulb, PenTool, Crown, Radio, Clock
} from 'lucide-react';
import { journalismStages } from '../data/journalismData';
import { getCurrentUser, getClassroomStage, isStageCompleted, getActiveClassroomCase } from '../utils/storage';
import { sound } from '../utils/sound';
import StageWaitingRoom from './StageWaitingRoom';
import { WitnessAvatar, CoinBadge } from './ui/ProfessionalIcon';

export default function Dashboard({ 
  team, 
  onSelectModule, 
  onOpenPressCard, 
  onOpenShop,
  onOpenInterview,
  onOpenPocketNotes,
  onStageAdvanced,
  onDisbandTeam 
}) {
  const [confirmDisband, setConfirmDisband] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const currentUser = getCurrentUser();

  const handleCopyMemberCode = () => {
    sound.playClick();
    const code = team?.memberCode || "UD19J";
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };
  const completedStages = team?.completedStages || [];
  const currentClassStage = getClassroomStage(); // Global stage from Admin/Guru

  // Rank determination
  const rankLevels = [
    { min: 0, title: "Wartawan Magang (Intern)", badgeText: "Level 1" },
    { min: 1, title: "Wartawan Lapangan (Junior)", badgeText: "Level 2" },
    { min: 2, title: "Redaktur Madya (Senior)", badgeText: "Level 3" },
    { min: 3, title: "Pemimpin Redaksi (Chief Editor)", badgeText: "Level 4" }
  ];
  const currentRank = rankLevels[Math.min(3, completedStages.length)];
  const progressPct = Math.round((completedStages.length / 3) * 100);

  // Single Active Stage
  const activeStageIndex = Math.min(2, currentClassStage - 1);
  const activeStageData = journalismStages[activeStageIndex];
  const isCurrentStageCompleted = isStageCompleted(team, activeStageData.number);
  const isAllGraduated = completedStages.length >= 3;

  // If team has completed the active stage but the teacher hasn't opened the next stage yet
  if (isCurrentStageCompleted && !isAllGraduated && completedStages.length >= currentClassStage) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <StageWaitingRoom 
          team={team} 
          currentStage={currentClassStage}
          onOpenShop={onOpenShop}
          onStageAdvanced={onStageAdvanced}
        />
      </div>
    );
  }

  const hasFakeDistractor = team?.activeDebuffs?.includes("card_fake_distractor");
  const hasScrambleDebuff = team?.activeDebuffs?.includes("card_scramble_clues");
  const hasDeadlineDebuff = team?.activeDebuffs?.includes("card_deadline_panic");

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Team Welcome Banner with Smoked Glass Hero */}
      <section className="glass p-5 sm:p-7 relative overflow-hidden space-y-4 shadow-card border border-rule">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-rule/60 pb-4">
          <div className="min-w-0 w-full sm:w-auto">
            <div className="inline-flex items-center gap-2 bg-paper-2/80 border border-rule px-2.5 py-0.5 rounded-full text-xs font-body text-ink-muted mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
              <span>Meja Biro Redaksi Kelompok</span>
              {currentUser && (
                <span className="bg-accent/20 text-accent px-2 py-0.5 rounded-full font-semibold text-[10px] inline-flex items-center">
                  {currentUser.role === "leader" ? (
                    <>
                      <Crown className="w-3 h-3 text-accent-orange inline mr-1" />
                      <span>Ketua Biro</span>
                    </>
                  ) : (
                    <>
                      <PenTool className="w-3 h-3 text-accent inline mr-1" />
                      <span>Anggota</span>
                    </>
                  )}
                </span>
              )}
            </div>
            <h2 className="font-display font-medium text-2xl sm:text-4xl text-ink tracking-tight break-words">
              {team?.name}
            </h2>
            <p className="font-body text-xs text-ink-muted mt-1">
              Pangkat: <span className="text-accent font-semibold">{currentRank.title}</span> ({currentRank.badgeText})
            </p>
          </div>

          {/* Currency Treasury & Shop Shortcut */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => { sound.playClick(); onOpenShop(); }}
              className="rounded-full bg-accent-orange/15 hover:bg-accent-orange/25 border border-accent-orange/30 text-accent-orange px-4 py-2 text-xs font-body font-semibold flex items-center gap-1.5 transition-all shadow-sm flex-1 sm:flex-none justify-center min-h-[42px]"
            >
              <Coins className="w-3.5 h-3.5" />
              <span><strong>{team?.coins || 0}</strong> Koin</span>
              <span className="bg-accent-orange/20 text-accent-orange text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1">Toko</span>
            </button>

            <button
              onClick={() => { sound.playClick(); onOpenPressCard(); }}
              className="rounded-full bg-paper-2/70 hover:bg-paper-2 border border-rule px-4 py-2 text-xs font-body text-ink font-medium shrink-0 transition-all shadow-sm min-h-[42px]"
            >
              Kartu Pers
            </button>

            {onDisbandTeam && (
              <button
                onClick={() => { sound.playClick(); setConfirmDisband(true); }}
                className="rounded-full bg-accent-red/10 hover:bg-accent-red hover:text-white border border-accent-red/25 px-3.5 py-2 text-xs font-body text-accent-red font-medium shrink-0 transition-all shadow-sm inline-flex items-center gap-1 min-h-[42px]"
                title="Bubarkan biro ini"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bubarkan</span>
              </button>
            )}
          </div>
        </div>

        {/* Member Invite Code Banner (Spotlighted for Ketua & Team) */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-accent/10 via-paper-2/70 to-paper-2 border border-accent/30 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-accent/15 border border-accent/25 flex items-center justify-center shrink-0 text-accent">
              <Megaphone className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="font-body text-[11px] uppercase tracking-wider text-accent font-semibold block">
                Kode Khusus Anggota Kelompokmu:
              </span>
              <div className="flex flex-wrap items-center gap-2 pt-1.5">
                <span className="font-mono font-bold text-2xl sm:text-3xl tracking-widest text-ink bg-paper-3/90 px-3.5 py-1.5 rounded-xl border border-rule select-all shadow-sm">
                  {team?.memberCode || "UD19J"}
                </span>

                <button
                  onClick={handleCopyMemberCode}
                  className="rounded-full bg-accent text-accent-ink hover:bg-accent-hi text-xs font-body font-semibold px-4 py-2 inline-flex items-center gap-1.5 transition-all shadow-sm min-h-[44px]"
                  title="Salin kode anggota untuk dibagikan ke teman kelompok"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-accent-green" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? "Tersalin!" : "Salin Kode"}</span>
                </button>
              </div>
            </div>
          </div>
          <div className="font-body text-xs text-ink-2 bg-paper-3/60 border border-rule/60 p-3 rounded-xl sm:max-w-xs leading-relaxed flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-accent-orange shrink-0 mt-0.5" />
            <span><strong>Instruksi Ketua:</strong> Bagikan kode ini kepada rekan tim di kelas. Anggota cukup membuka web dan memasukkan kode di atas pada halaman utama.</span>
          </div>
        </div>

        {/* Active Buffs / Debuffs Alerts */}
        {team?.activeShield && (
          <div className="p-3 bg-accent-green/15 border border-accent-green/30 rounded-xl text-xs font-body text-accent-green flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent-green shrink-0" />
            <span><strong>Perisai Penjernih Aktif:</strong> Biro kalian kebal dari segala debuff kelompok lawan di tahap ini!</span>
          </div>
        )}

        {hasFakeDistractor && (
          <div className="p-3 bg-accent-red/15 border border-accent-red/30 rounded-xl text-xs font-body text-accent-red flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-accent-red shrink-0" />
            <span><strong>Debuff Aktif:</strong> Tim rival menyusupkan opsi jawaban palsu ke layar kalian! Bedah fakta dengan ekstra teliti!</span>
          </div>
        )}

        {hasScrambleDebuff && (
          <div className="p-3 bg-accent-orange/15 border border-accent-orange/30 rounded-xl text-xs font-body text-accent-orange flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-accent-orange shrink-0" />
            <span><strong>Debuff Aktif:</strong> Meja liputan terkena Kabut Tinta Redaksi! Susunan petunjuk teracak!</span>
          </div>
        )}

        {hasDeadlineDebuff && (
          <div className="p-3 bg-accent/15 border border-accent/30 rounded-xl text-xs font-body text-accent flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent shrink-0" />
            <span><strong>Tekanan Deadline:</strong> Jam redaksi berdetak kencang! Kerjakan tugas bersama tim secara taktis!</span>
          </div>
        )}

        {/* Team Members Roster with Roles */}
        <div>
          <span className="font-body text-xs text-ink-muted font-medium mb-2 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-accent" />
            Anggota & Pembagian Peran Liputan ({team?.members?.length || 0} Siswa):
          </span>
          <div className="flex flex-wrap gap-2">
            {team?.members?.map((m, idx) => {
              const name = typeof m === "string" ? m : m.name;
              const classTag = typeof m === "string" ? null : m.classInfo;
              const roleTitle = typeof m === "string" ? (idx === 0 ? "Pemimpin Redaksi" : "Wartawan") : (m.role || "Wartawan");
              const isLeader = typeof m === "string" ? idx === 0 : m.isLeader;

              return (
                <div
                  key={idx}
                  className={`inline-flex items-center gap-1.5 font-body text-xs rounded-lg px-2.5 py-1 font-medium border ${
                    isLeader 
                      ? "bg-accent/15 border-accent/35 text-ink" 
                      : "bg-paper-2/60 border-rule text-ink-2"
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    {isLeader ? (
                      <Crown className="w-3 h-3 text-accent-orange shrink-0" />
                    ) : (
                      <PenTool className="w-3 h-3 text-accent shrink-0" />
                    )}
                    <span>{idx + 1}. {name}</span>
                  </span>
                  {classTag && (
                    <span className="bg-paper-3 border border-rule/60 text-ink-muted text-[10px] px-1.5 py-0.2 rounded">
                      {classTag}
                    </span>
                  )}
                  <span className="text-[10px] text-ink-muted border-l border-rule/50 pl-1.5">
                    {roleTitle}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Offline Discussion Prompt */}
        <div className="p-3.5 bg-paper-2/40 border border-rule/80 rounded-xl text-xs text-ink space-y-1">
          <div className="flex items-center gap-1.5 font-body text-xs font-semibold text-accent-orange">
            <Users className="w-3.5 h-3.5 text-accent-orange shrink-0" />
            <span>Konsensus Offline Meja Redaksi:</span>
          </div>
          <p className="font-body text-xs text-ink-muted leading-relaxed">
            Sebelum memutuskan jawaban di web, seluruh anggota (Wartawan 5W+1H, Redaktur Piramida, Penyelidik Narasumber, & Copy Editor) wajib <strong>berdiskusi tatap muka secara langsung</strong> memeriksa bukti. Keputusan final diambil atas kesepakatan bersama!
          </p>
        </div>

        {/* Classroom Sync Progress */}
        <div className="pt-2 border-t border-rule/60 flex items-center gap-3">
          <div className="flex-1 bg-paper-3/80 border border-rule h-2 rounded-full overflow-hidden">
            <div 
              className="bg-accent h-full rounded-full transition-all duration-300 shadow-[0_0_8px_var(--color-accent)]"
              style={{ width: `${Math.max(8, progressPct)}%` }}
            />
          </div>
          <span className="font-body text-xs font-medium text-ink-muted shrink-0">
            Tahap {currentClassStage} / 3 Siklus Dasar ({progressPct}%)
          </span>
        </div>
      </section>

      {/* Interactive Witness Interview & Pocket Notes Showcase */}
      {(() => {
        const activeCase = getActiveClassroomCase(team);
        const caseProgress = team?.interviewProgress?.[activeCase?.id] || {};
        const witnesses = activeCase?.witnesses || [];
        const interviewedCount = witnesses.filter(w => (caseProgress.witnesses?.[w.id]?.questionsAsked?.length || 0) > 0).length;
        const pocketNotes = (team?.pocketNotes || []).filter(n => n.caseId === activeCase?.id);
        const scoopsCount = pocketNotes.filter(n => n.isScoop).length;

        return (
          <section className="glass p-5 sm:p-6 rounded-2xl border border-accent/30 space-y-3.5 shadow-card bg-gradient-to-br from-paper-2/70 via-paper-2/40 to-accent/5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-rule/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-accent-orange/15 border border-accent-orange/30 text-accent-orange flex items-center justify-center shadow-sm shrink-0">
                  <Radio className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold bg-accent-orange/20 text-accent-orange border border-accent-orange/30 px-2 py-0.2 rounded-full uppercase">
                      LIPUTAN KHUSUS KELAS
                    </span>
                    <span className="text-[11px] font-body text-ink-muted">
                      {interviewedCount}/{witnesses.length} Saksi Terwawancarai
                    </span>
                  </div>
                  <h3 className="font-display font-medium text-base sm:text-lg text-ink mt-0.5">
                    {activeCase?.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {onOpenPocketNotes && (
                  <button
                    onClick={() => { sound.playClick(); onOpenPocketNotes(); }}
                    className="rounded-full bg-paper-2 hover:bg-paper-3 border border-rule text-ink text-xs font-body font-semibold px-4 py-2 inline-flex items-center gap-1.5 transition-all shadow-sm min-h-[42px] flex-1 sm:flex-none justify-center"
                    title="Buka Catatan Saku Hasil Wawancara"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-accent-orange" />
                    <span>Buku Saku ({pocketNotes.length})</span>
                  </button>
                )}

                {onOpenInterview && (
                  <button
                    onClick={() => { sound.playClick(); onOpenInterview(); }}
                    className="rounded-full bg-accent text-accent-ink hover:bg-accent-hi text-xs font-body font-semibold px-4 py-2 inline-flex items-center gap-1.5 transition-all shadow-md min-h-[42px] flex-1 sm:flex-none justify-center"
                    title="Mulai Wawancara Saksi Mata"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Wawancara Saksi</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Summary of Witnesses Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {witnesses.map(w => {
                const wProg = caseProgress.witnesses?.[w.id];
                const hasInterviewed = (wProg?.questionsAsked?.length || 0) > 0;
                const hasScoop = pocketNotes.some(n => n.witnessId === w.id && n.isScoop);

                return (
                  <div 
                    key={w.id}
                    onClick={() => { sound.playClick(); if (onOpenInterview) onOpenInterview(); }}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                      hasInterviewed 
                        ? "bg-accent/10 border-accent/30" 
                        : "bg-paper-2/40 border-rule hover:bg-paper-2/70"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <WitnessAvatar witnessId={w.id} role={w.role} avatar={w.avatar} className="w-9 h-9 rounded-xl" iconClassName="w-4 h-4" />
                      <div className="min-w-0">
                        <span className="font-display font-medium text-xs text-ink truncate block">
                          {w.name}
                        </span>
                        <span className="font-body text-[10px] text-ink-muted truncate block">
                          {w.role}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      {hasScoop ? (
                        <span className="bg-accent-orange/20 text-accent-orange text-[10px] px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>SCOOP</span>
                        </span>
                      ) : hasInterviewed ? (
                        <span className="bg-accent-green/20 text-accent-green text-[10px] px-2 py-0.5 rounded-full font-semibold inline-flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Terdata</span>
                        </span>
                      ) : (
                        <span className="bg-paper-2 text-ink-muted text-[10px] px-2 py-0.5 rounded-full border border-rule">
                          Belum
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="font-body text-[11px] text-ink-muted flex items-start gap-1.5 pt-1">
              <Lightbulb className="w-3.5 h-3.5 text-accent-orange shrink-0 mt-0.5" />
              <span>Wawancarai seluruh saksi untuk mengantongi fakta emas (<em>cover both sides</em>) yang akan memperkuat naskah berita kalian di Tahap 3!</span>
            </div>
          </section>
        );
      })()}

      {/* Main Single Active Stage */}
      {!isAllGraduated ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-accent-green animate-pulse shadow-[0_0_6px_var(--color-accent-green)]"></span>
              <span className="font-body text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Berkas Tugas Aktif Kelas (Serentak)
              </span>
            </div>
            <span className="font-body text-xs text-ink-muted font-medium">
              Tahap {activeStageData.number} dari 3
            </span>
          </div>

          {/* Active Mission Card */}
          <div className="glass p-5 sm:p-8 relative shadow-card border border-rule">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-3 sm:mb-4">
              <span className="font-body text-xs font-semibold bg-accent/15 text-accent border border-accent/30 rounded-full px-3 py-1">
                Tahap #{activeStageData.number} • Dibuka Bersama
              </span>
              <div className="flex gap-2">
                <span className="font-body text-xs font-medium rounded-full bg-paper-2/70 border border-rule px-3 py-1 text-ink-2">
                  Lencana: {activeStageData.badge}
                </span>
                <span className="font-body text-xs font-semibold rounded-full bg-accent-orange/15 text-accent-orange border border-accent-orange/30 px-3 py-1 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5" />
                  <span>+250</span>
                </span>
              </div>
            </div>

            <h3 className="font-display font-medium text-2xl sm:text-4xl text-ink tracking-tight leading-tight">
              {activeStageData.title}
            </h3>
            <p className="font-body text-xs sm:text-sm text-accent-orange font-semibold mt-1">
              {activeStageData.subtitle}
            </p>

            <div className="mt-4 p-4 bg-paper-2/50 border border-rule/80 rounded-xl font-body text-xs sm:text-base text-ink-2 leading-relaxed">
              {activeStageData.summary}
            </div>

            <div className="mt-4 p-3 bg-accent/10 border border-accent/25 rounded-xl font-body text-xs text-ink-2 flex items-start gap-2">
              <Users className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <div>
                <strong>Instruksi Diskusi Tim:</strong> Kerjakan bersama tim. Gunakan <strong>Koin</strong> di Toko jika butuh <em>Power-Up</em> atau kirim <em>Debuff</em> ke rival!
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-rule/60 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              <button
                onClick={() => { sound.playClick(); onOpenShop(); }}
                className="text-xs font-body text-accent-orange hover:bg-accent-orange/10 border border-transparent hover:border-accent-orange/30 rounded-full px-3 py-2 font-medium flex items-center justify-center sm:justify-start gap-1.5 transition-all min-h-[42px]"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Buka Toko Power-Up & Debuff Rival</span>
              </button>

              <button
                onClick={() => { sound.playClick(); onSelectModule(activeStageData); }}
                className="neo-btn p-3.5 sm:p-4 px-7 sm:px-9 bg-accent text-accent-ink hover:bg-accent-hi font-body font-semibold text-sm sm:text-base rounded-full gap-2 w-full sm:w-auto justify-center shadow-lg transition-all min-h-[48px]"
              >
                <span>Kerjakan Tahap Ini</span>
                <ArrowRight className="w-4 h-4 text-accent-ink" />
              </button>
            </div>
          </div>

          <div className="p-3.5 bg-paper-2/40 border border-rule/60 rounded-xl font-body text-xs text-ink-muted flex items-center justify-center gap-2 text-center">
            <Lock className="w-4 h-4 text-ink-muted shrink-0" />
            <span>
              Sistem Saling Menunggu: Begitu tim selesai, tim akan menunggu di Ruang Tunggu Redaksi sampai tahap berikutnya dibuka serentak untuk semua kelompok!
            </span>
          </div>
        </section>
      ) : (
        /* Grand Victory Card (All 3 Stages Finished) */
        <section className="glass p-8 text-center space-y-4 shadow-card border border-accent-green/30">
          <div className="neo-stamp bg-accent-green/20 text-accent-green border-accent-green/40 text-sm font-semibold mx-auto">
            Lulus Akademi Jurnalistik!
          </div>
          <h3 className="font-display font-medium text-3xl sm:text-5xl text-ink tracking-tight">
            Selamat, {team?.name}!
          </h3>
          <p className="font-body text-base max-w-lg mx-auto leading-relaxed text-ink-2">
            Kelompok kalian telah menuntaskan seluruh 3 pilar dasar jurnalistik: <strong>5W+1H</strong>, <strong>Struktur Piramida Terbalik</strong>, dan <strong>Menulis Berita Utuh</strong>. Kalian resmi menyandang predikat Pemimpin Redaksi!
          </p>
          <div className="pt-2">
            <button
              onClick={() => { sound.playClick(); onOpenPressCard(); }}
              className="neo-btn p-3.5 px-7 bg-accent text-accent-ink hover:bg-accent-hi font-body font-semibold text-sm rounded-full gap-2 transition-all shadow-lg"
            >
              <span>Buka & Cetak Kartu Biro Pers Kelompok</span>
              <Award className="w-4 h-4 text-accent-ink" />
            </button>
          </div>
        </section>
      )}

      {/* Confirmation Modal to Disband Bureau (Dusk Modern-Minimal) */}
      {confirmDisband && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass p-6 sm:p-7 rounded-3xl border border-accent-red/40 max-w-md w-full space-y-4 shadow-card text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-accent-red/20 text-accent-red border border-accent-red/40 flex items-center justify-center mx-auto text-2xl shadow-sm">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="font-display font-medium text-xl text-ink">
                Bubarkan Biro Ini?
              </h3>
              <p className="font-body text-sm font-semibold text-accent-red">
                "{team?.name}"
              </p>
            </div>

            <p className="font-body text-xs text-ink-2 leading-relaxed bg-paper-2/50 border border-rule/70 p-3 rounded-xl">
              Yakin ingin membubarkan biro ini? Seluruh data anggota, riwayat liputan materi straight news, kas ({team?.coins || 0} koin), dan kode akses akan <strong>dihapus permanen</strong>.
            </p>

            <div className="flex gap-2.5 justify-center pt-2">
              <button
                type="button"
                onClick={() => setConfirmDisband(false)}
                className="rounded-full bg-paper-2 hover:bg-paper-3 border border-rule px-5 py-2.5 text-xs font-body font-medium text-ink transition-all min-h-[42px] flex-1"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playStamp();
                  setConfirmDisband(false);
                  if (onDisbandTeam) {
                    onDisbandTeam(team.id);
                  }
                }}
                className="rounded-full bg-accent-red text-white hover:bg-accent-red/90 px-5 py-2.5 text-xs font-body font-semibold transition-all shadow-md min-h-[42px] flex-1"
              >
                Ya, Bubarkan Biro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

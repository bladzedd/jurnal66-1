import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, ArrowUp, ArrowDown, CheckCircle2, RotateCcw, ArrowRight, 
  HelpCircle, Layers, Users, AlertTriangle, Sparkles, Clock, Pause, Play 
} from 'lucide-react';
import { sound } from '../utils/sound';
import { 
  getTeamVariationIndex, 
  VARIATION_BEATS, 
  startOrResumeTeamStageTimer, 
  pauseTeamStageTimer, 
  getTeamStageTimer, 
  formatDuration 
} from '../utils/storage';

export default function GamePyramid({ moduleData, team, onComplete, onBack }) {
  const cases = moduleData.cases;
  const assignedVarIdx = getTeamVariationIndex(team);

  const [currentCaseIdx, setCurrentCaseIdx] = useState(() => {
    try {
      const saved = sessionStorage.getItem("redaksi_game2_case_v5");
      const parsed = saved !== null ? parseInt(saved, 10) : null;
      if (parsed !== null && !isNaN(parsed) && parsed < (cases?.length || 5)) {
        return parsed;
      }
      return assignedVarIdx % (cases?.length || 5);
    } catch {
      return assignedVarIdx % (cases?.length || 5);
    }
  });
  const activeCase = cases[currentCaseIdx] || cases[0];

  const [elapsedSeconds, setElapsedSeconds] = useState(() => {
    const t = getTeamStageTimer(team, 2);
    return t.seconds;
  });

  useEffect(() => {
    if (team?.id) {
      startOrResumeTeamStageTimer(team.id, 2);
    }
    const interval = setInterval(() => {
      const t = getTeamStageTimer(team, 2);
      setElapsedSeconds(t.seconds);
    }, 1000);
    return () => clearInterval(interval);
  }, [team?.id]);

  useEffect(() => {
    try {
      sessionStorage.setItem("redaksi_game2_case_v5", String(currentCaseIdx));
    } catch {}
  }, [currentCaseIdx]);

  const handleCleanComplete = (num, score, badge) => {
    try { sessionStorage.removeItem("redaksi_game2_case_v5"); } catch {}
    if (team?.id) {
      pauseTeamStageTimer(team.id, 2);
    }
    onComplete(num, score, badge, elapsedSeconds);
  };

  const handleCleanBack = () => {
    try { sessionStorage.removeItem("redaksi_game2_case_v5"); } catch {}
    if (team?.id) {
      pauseTeamStageTimer(team.id, 2);
    }
    onBack();
  };

  const hasScrambleDebuff = team?.activeDebuffs?.includes("card_scramble_clues");

  const shuffleBlocks = (rawBlocks) => {
    const arr = [...rawBlocks];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    // Prevent accidental pre-solved order
    if (arr.every((b, idx) => b.level === idx + 1) && arr.length > 1) {
      [arr[0], arr[1]] = [arr[1], arr[0]];
    }
    return arr;
  };

  const [blocks, setBlocks] = useState(() => shuffleBlocks(activeCase.blocks));
  const [isCaseSuccess, setIsCaseSuccess] = useState(false);
  const [isAllSuccess, setIsAllSuccess] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Update blocks when changing case
  useEffect(() => {
    setBlocks(shuffleBlocks(activeCase.blocks));
    setIsCaseSuccess(false);
    setFeedback(null);
  }, [currentCaseIdx, activeCase]);

  const moveUp = (index) => {
    if (index === 0) return;
    sound.playClick();
    const updated = [...blocks];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setBlocks(updated);
    setIsCaseSuccess(false);
    setFeedback(null);
  };

  const moveDown = (index) => {
    if (index === blocks.length - 1) return;
    sound.playClick();
    const updated = [...blocks];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setBlocks(updated);
    setIsCaseSuccess(false);
    setFeedback(null);
  };

  const handleValidate = () => {
    sound.playClick();
    const isCorrect = blocks.every((b, idx) => b.level === idx + 1);

    if (isCorrect) {
      sound.playSuccess();
      sound.playStamp();
      setIsCaseSuccess(true);
      setFeedback("Sempurna! Susunan Piramida Terbalik kasus ini tepat dan berurutan dari tingkat 1 hingga 5.");

      if (currentCaseIdx === cases.length - 1) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        setIsAllSuccess(true);
      }
    } else {
      sound.playError();
      setFeedback("Susunan piramida belum tepat! Ingat: Urutkan dari Headline di puncak -> Lead (Teras 5W1H) -> Kronologi Tubuh -> Kutipan Resmi -> Ekor Berita di bagian terbawah.");
    }
  };

  const handleNextCase = () => {
    sound.playClick();
    setCurrentCaseIdx((prev) => (prev + 1) % cases.length);
  };

  const handleReset = () => {
    sound.playClick();
    setBlocks(shuffleBlocks(activeCase.blocks));
    setIsCaseSuccess(false);
    setFeedback(null);
  };

  const pyramidWidths = [
    "w-full", 
    "w-full sm:w-11/12", 
    "w-full sm:w-10/12", 
    "w-full sm:w-9/12", 
    "w-full sm:w-8/12"
  ];

  const levelTargetRoles = [
    "Puncak: Posisi Headline (Judul Berita Utama)",
    "Teras: Posisi Lead 5W+1H (Paling Penting & Berdampak)",
    "Tubuh 1: Posisi Kronologi Data Teknis & Bukti Lapangan",
    "Tubuh 2: Posisi Kutipan Sikap Narasumber Otoritas",
    "Ekor: Posisi Informasi Tambahan / Riwayat Masa Lalu"
  ];

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-rule pb-3.5 gap-2">
        <button
          onClick={() => { sound.playClick(); handleCleanBack(); }}
          className="rounded-full bg-paper-2/70 hover:bg-paper-2 border border-rule gap-1.5 px-3.5 py-1.5 text-xs font-body font-medium text-ink inline-flex items-center transition-all shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Kembali ke Meja Redaksi</span>
          <span className="sm:hidden">Kembali</span>
        </button>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-paper-2 border border-rule font-mono text-xs font-semibold text-ink shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-accent animate-spin" />
            <span>Waktu: {formatDuration(elapsedSeconds)}</span>
          </div>
          <span className="font-body text-xs font-semibold bg-accent-orange/15 text-accent-orange border border-accent-orange/30 rounded-full px-3 py-1">
            Kasus {currentCaseIdx + 1} dari {cases.length}
          </span>
          <span className="font-body text-[11px] font-semibold bg-accent/15 text-accent border border-accent/30 rounded-full px-2.5 py-0.5 hidden sm:inline">
            {VARIATION_BEATS[assignedVarIdx]?.title || `Variasi #${assignedVarIdx + 1}`}
          </span>
        </div>
      </div>

      {/* Debuff Alert */}
      {hasScrambleDebuff && (
        <div className="p-3 bg-accent-red/15 border border-accent-red/30 rounded-xl font-body text-xs text-accent-red flex items-center gap-2 shadow-sm">
          <AlertTriangle className="w-4 h-4 text-accent-red shrink-0" />
          <span><strong>Debuff Aktif dari Rival:</strong> Meja redaksi terkena Kabut Tinta! Urutan balok teracak!</span>
        </div>
      )}

      {/* Briefing Box */}
      <div className="glass p-5 sm:p-7 rounded-2xl border border-rule space-y-2.5 shadow-card">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 font-body text-xs font-semibold text-accent-orange uppercase">
            <Layers className="w-4 h-4" />
            <span>Tugas Penataan Piramida Berita #{currentCaseIdx + 1}</span>
            {currentCaseIdx === (assignedVarIdx % cases.length) && (
              <span className="bg-accent/20 text-accent text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-accent/30 tracking-normal capitalize inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Penugasan Utama Biro Anda</span>
              </span>
            )}
          </div>
          <span className="font-body text-[11px] bg-paper-2 border border-rule px-2.5 py-0.5 rounded-full text-ink-muted font-medium truncate max-w-[140px] sm:max-w-none">
            Biro: {team?.name}
          </span>
        </div>

        <h3 className="font-display font-medium text-xl sm:text-2xl text-ink leading-snug break-words">
          "{activeCase.topic}"
        </h3>
        <p className="font-body text-xs sm:text-sm text-ink-2 leading-relaxed">
          Gunakan tombol panah <strong>[NAIK]</strong> dan <strong>[TURUN]</strong> untuk mengatur urutan 5 balok berita di bawah agar membentuk susunan piramida terbalik yang tepat dari informasi paling krusial di atas hingga rincian pelengkap!
        </p>
      </div>

      {feedback && (
        <div className={`p-3.5 border rounded-xl text-xs font-body font-medium flex items-center justify-between shadow-sm ${
          isCaseSuccess ? "bg-accent-green/15 border-accent-green/30 text-accent-green" : "bg-accent-orange/15 border-accent-orange/30 text-accent-orange"
        }`}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="underline ml-2">Tutup</button>
        </div>
      )}

      {/* Offline Discussion Prompt */}
      <div className="p-3.5 bg-paper-2/40 border border-rule/80 rounded-xl font-body text-xs text-ink flex items-start gap-2.5 shadow-sm">
        <Users className="w-4 h-4 text-accent shrink-0 mt-0.5" />
        <div>
          <strong className="text-accent font-semibold">Debat Meja Redaksi (Tatap Muka):</strong> <em>Redaktur Struktur & Hierarki</em> memimpin diskusi: "Mengapa informasi paling krusial harus di Lead dan bukan di Ekor?" Sepakati urutan balok piramida bersama tim sebelum menguji susunan!
        </div>
      </div>

      {/* Pyramid Stack Layout */}
      <div className="flex flex-col items-center gap-2.5 sm:gap-3 py-1 sm:py-2">
        {blocks.map((block, idx) => {
          return (
            <div
              key={block.id}
              className={`${pyramidWidths[idx] || "w-full"} transition-all duration-200`}
            >
              <div className={`glass p-3.5 sm:p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 shadow-sm ${
                isCaseSuccess 
                  ? "bg-accent-green/15 border-accent-green/40 shadow-sm" 
                  : "border-rule/80 hover:border-rule"
              }`}>
                {/* Block Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                    <span className="font-mono text-[10px] font-bold bg-accent/20 text-accent border border-accent/30 px-2 py-0.5 rounded">
                      TINGKAT #{idx + 1}
                    </span>
                    <span className="font-body text-xs font-semibold text-accent-orange">
                      {levelTargetRoles[idx]}
                    </span>
                    {isCaseSuccess && (
                      <span className="font-body text-[10px] bg-accent-green/20 text-accent-green border border-accent-green/30 px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1 animate-in fade-in">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{block.name} (Cocok)</span>
                      </span>
                    )}
                  </div>
                  <p className="font-body text-xs sm:text-sm text-ink font-medium break-words leading-relaxed">
                    "{block.text}"
                  </p>
                </div>

                {/* Move Controls */}
                <div className="flex sm:flex-col gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0 || isCaseSuccess}
                    className="w-11 h-11 sm:w-10 sm:h-10 min-w-[44px] min-h-[44px] rounded-xl bg-paper-2 border border-rule hover:bg-paper-3 text-ink flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed shadow-xs active:scale-95 transition-all"
                    title="Pindahkan ke atas"
                    aria-label="Pindahkan ke atas"
                  >
                    <ArrowUp className="w-5 h-5 text-ink" />
                  </button>
                  <button
                    onClick={() => moveDown(idx)}
                    disabled={idx === blocks.length - 1 || isCaseSuccess}
                    className="w-11 h-11 sm:w-10 sm:h-10 min-w-[44px] min-h-[44px] rounded-xl bg-paper-2 border border-rule hover:bg-paper-3 text-ink flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed shadow-xs active:scale-95 transition-all"
                    title="Pindahkan ke bawah"
                    aria-label="Pindahkan ke bawah"
                  >
                    <ArrowDown className="w-5 h-5 text-ink" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2.5 sm:gap-3 pt-2">
        <button
          onClick={handleReset}
          className="rounded-full bg-paper-2/70 hover:bg-paper-2 border border-rule gap-1.5 px-4 py-2.5 text-xs font-body font-medium text-ink inline-flex items-center justify-center transition-all shadow-sm min-h-[44px]"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Acak Ulang</span>
        </button>

        {!isCaseSuccess ? (
          <button
            onClick={handleValidate}
            className="neo-btn p-3 px-6 bg-accent text-accent-ink hover:bg-accent-hi font-body font-semibold text-xs sm:text-sm rounded-full gap-2 justify-center shadow-lg transition-all min-h-[44px]"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Uji Kebenaran Piramida</span>
          </button>
        ) : (
          <div className="w-full space-y-4">
            <div className="glass p-6 sm:p-7 rounded-2xl border border-accent-green/40 text-center space-y-3.5 shadow-card w-full animate-in fade-in">
              <div className="flex items-center justify-center gap-2">
                <span className="neo-stamp bg-accent-green/20 text-accent-green border-accent-green/40 text-xs font-semibold">
                  Kasus #{currentCaseIdx + 1} Terstruktur Tuntas!
                </span>
                {currentCaseIdx === (assignedVarIdx % cases.length) && (
                  <span className="font-body text-[11px] bg-accent/20 text-accent border border-accent/40 rounded-full px-2.5 py-0.5 font-bold">
                    ⭐ Tugas Pokok Biro Anda
                  </span>
                )}
              </div>
              <h4 className="font-display font-medium text-2xl sm:text-3xl text-ink">
                Hierarki Piramida Terbalik Valid, Biro {team?.name}!
              </h4>
              <div className="p-2 bg-accent-green/15 border border-accent-green/35 rounded-xl inline-flex items-center gap-2 text-xs font-semibold text-accent-green">
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Waktu Pengerjaan Anda: {formatDuration(elapsedSeconds)} (Di-pause)</span>
              </div>
              <p className="font-body text-xs sm:text-sm max-w-lg mx-auto text-ink-2 leading-relaxed">
                Kalian telah membuktikan kejelian membaca anatomi naskah jurnalistik dari Headline di puncak hingga Ekor di dasar berita.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row justify-center gap-2">
                <button
                  onClick={() => {
                    sound.playStamp();
                    handleCleanComplete(moduleData.number, 100, moduleData.badge || "Arsitek Struktur");
                  }}
                  className="neo-btn bg-accent text-accent-ink hover:bg-accent-hi font-body font-semibold px-7 py-3 text-sm rounded-full shadow-lg transition-all min-h-[44px] inline-flex items-center gap-2"
                >
                  <span>Klaim Lencana & Masuk Ruang Tunggu Redaksi</span>
                  <ArrowRight className="w-4 h-4 text-accent-ink" />
                </button>
                <button
                  onClick={handleNextCase}
                  className="rounded-full bg-paper-2 hover:bg-paper-3 border border-rule text-xs font-medium text-ink px-4 py-2 inline-flex items-center justify-center gap-1.5 transition-all min-h-[44px]"
                >
                  <span>Jelajahi Kasus Piramida Lainnya ({((currentCaseIdx + 1) % cases.length) + 1}/{cases.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

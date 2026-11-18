import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, CheckCircle2, RotateCcw, ArrowRight, 
  HelpCircle, Sparkles, BookOpen, Clock, AlertTriangle, Users, FileText,
  Pause, Play 
} from 'lucide-react';
import { journalismStages } from '../data/journalismData';
import { sound } from '../utils/sound';
import { 
  getTeamVariationIndex, 
  VARIATION_BEATS, 
  startOrResumeTeamStageTimer, 
  pauseTeamStageTimer, 
  getTeamStageTimer, 
  formatDuration 
} from '../utils/storage';

export default function Game5W1H({ moduleData, team, onComplete, onBack }) {
  const cases = moduleData?.cases || journalismStages[0].cases;
  const assignedVarIdx = getTeamVariationIndex(team);

  const [currentCaseIdx, setCurrentCaseIdx] = useState(() => {
    try {
      const saved = sessionStorage.getItem("redaksi_game1_case_v5");
      const parsed = saved !== null ? parseInt(saved, 10) : null;
      if (parsed !== null && !isNaN(parsed) && parsed < (cases?.length || 5)) {
        return parsed;
      }
      return assignedVarIdx % (cases?.length || 5);
    } catch {
      return assignedVarIdx % (cases?.length || 5);
    }
  });
  const [assignments, setAssignments] = useState({}); // { what: clueObj, who: clueObj, ... }
  const [selectedClue, setSelectedClue] = useState(null);
  const [isCaseFinished, setIsCaseFinished] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const [elapsedSeconds, setElapsedSeconds] = useState(() => {
    const t = getTeamStageTimer(team?.id || team, 1);
    return t.seconds;
  });

  useEffect(() => {
    if (team?.id) {
      startOrResumeTeamStageTimer(team.id, 1);
      const init = getTeamStageTimer(team.id, 1);
      setElapsedSeconds(init.seconds);
    }
    const interval = setInterval(() => {
      if (team?.id) {
        const t = getTeamStageTimer(team.id, 1);
        setElapsedSeconds(t.seconds);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [team?.id]);

  useEffect(() => {
    try {
      sessionStorage.setItem("redaksi_game1_case_v5", String(currentCaseIdx));
    } catch {
      // ignore
    }
  }, [currentCaseIdx]);

  const handleCleanComplete = (stageNum, score, badge) => {
    try { sessionStorage.removeItem("redaksi_game1_case_v5"); } catch {}
    if (team?.id) {
      pauseTeamStageTimer(team.id, 1);
    }
    onComplete(stageNum, score, badge, elapsedSeconds);
  };

  const handleCleanBack = () => {
    try { sessionStorage.removeItem("redaksi_game1_case_v5"); } catch {}
    if (team?.id) {
      pauseTeamStageTimer(team.id, 1);
    }
    onBack();
  };

  const activeCase = cases[currentCaseIdx] || cases[0];

  const hasFakeDistractor = team?.activeDebuffs?.includes("card_fake_distractor");
  const hasScrambleDebuff = team?.activeDebuffs?.includes("card_scramble_clues");

  const elementsList = [
    { key: "what", title: "WHAT", desc: "Peristiwa apa yang terjadi?", role: "Wartawan TKP" },
    { key: "who", title: "WHO", desc: "Siapa yang terlibat / pelaku?", role: "Penyidik Saksi" },
    { key: "where", title: "WHERE", desc: "Di mana lokasi kejadian?", role: "Wartawan Lapangan" },
    { key: "when", title: "WHEN", desc: "Kapan waktu kejadiannya?", role: "Redaktur Waktu" },
    { key: "why", title: "WHY", desc: "Mengapa peristiwa itu bisa terjadi?", role: "Investigator Latar" },
    { key: "how", title: "HOW", desc: "Bagaimana kronologi kejadiannya?", role: "Kronolog Fakta" }
  ];

  // Distractor clue generator
  const distractorClue = {
    id: `fake_${activeCase.id}`,
    text: "Ada rumor di grup chat warga bahwa pelaku punya ilmu menghilang (Hoaks)",
    element: "fake_hoax",
    isDistractor: true,
    distractorType: "Hoaks Rival",
    distractorReason: "Informasi tersebut adalah desas-desus tanpa sumber valid hasil gangguan tim lawan!"
  };

  // Helper shuffle array
  const shuffleArray = (arr) => {
    const res = [...arr];
    for (let i = res.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [res[i], res[j]] = [res[j], res[i]];
    }
    return res;
  };

  const [cluesPool, setCluesPool] = useState(() => {
    let list = [...activeCase.clues];
    if (activeCase.distractors && Array.isArray(activeCase.distractors)) {
      list = [...list, ...activeCase.distractors];
    }
    if (hasFakeDistractor) list = [...list, distractorClue];
    return shuffleArray(list);
  });

  useEffect(() => {
    let list = [...activeCase.clues];
    if (activeCase.distractors && Array.isArray(activeCase.distractors)) {
      list = [...list, ...activeCase.distractors];
    }
    if (hasFakeDistractor) list = [...list, distractorClue];
    setCluesPool(shuffleArray(list));
    setAssignments({});
    setSelectedClue(null);
    setIsCaseFinished(false);
    setFeedbackMsg(null);
  }, [currentCaseIdx, activeCase, hasFakeDistractor]);

  // Handle clue selection
  const handleSelectClue = (clue) => {
    sound.playClick();
    if (selectedClue && selectedClue.id === clue.id) {
      setSelectedClue(null);
    } else {
      setSelectedClue(clue);
    }
  };

  // Handle slot assignment
  const handleAssignToSlot = (elementKey) => {
    if (!selectedClue) return;

    sound.playClick();

    // Check if clue is hoaks or distractor
    if (selectedClue.element === "fake_hoax" || selectedClue.isDistractor) {
      sound.playError();
      const typeLabel = selectedClue.distractorType || "Pengecoh Non-Faktual";
      const reason = selectedClue.distractorReason || "Bukan fakta pokok berita 5W+1H!";
      setFeedbackMsg(`Pengecoh Terdeteksi [${typeLabel}]: "${selectedClue.text}" — ${reason}`);
      setSelectedClue(null);
      return;
    }

    const nextAssignments = { ...assignments, [elementKey]: selectedClue };
    setAssignments(nextAssignments);
    setSelectedClue(null);

    // Check if all 6 elements are filled
    const filledCount = Object.keys(nextAssignments).length;
    if (filledCount === 6) {
      evaluateCase(nextAssignments);
    }
  };

  const handleRemoveFromSlot = (elementKey) => {
    sound.playClick();
    const next = { ...assignments };
    delete next[elementKey];
    setAssignments(next);
    setIsCaseFinished(false);
  };

  const evaluateCase = (finalAssignments) => {
    let correctCount = 0;
    elementsList.forEach((el) => {
      if (finalAssignments[el.key] && finalAssignments[el.key].element === el.key) {
        correctCount += 1;
      }
    });

    if (correctCount === 6) {
      sound.playSuccess();
      sound.playStamp();
      setIsCaseFinished(true);
      setFeedbackMsg(`Keren banget! Semua 6 unsur 5W+1H pada Kasus #${currentCaseIdx + 1} udah tepat dan valid. Mantap!`);

      if (currentCaseIdx === cases.length - 1) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      }
    } else {
      sound.playError();
      setFeedbackMsg(`Ups, masih ada ${6 - correctCount} unsur yang ketuker nih! Yuk cek lagi bareng temen-temen se-tim!`);
    }
  };

  const handleNextCase = () => {
    sound.playStamp();
    setCurrentCaseIdx((prev) => (prev + 1) % cases.length);
    setAssignments({});
    setSelectedClue(null);
    setIsCaseFinished(false);
    setFeedbackMsg(null);
  };

  const handleResetCurrentCase = () => {
    sound.playClick();
    setAssignments({});
    setSelectedClue(null);
    setIsCaseFinished(false);
    setFeedbackMsg(null);
    setCluesPool(prev => shuffleArray(prev));
  };

  const assignedClueIds = Object.values(assignments).map(c => c.id);
  const availableClues = cluesPool.filter(c => !assignedClueIds.includes(c.id));

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
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

          <span className="font-body text-xs font-semibold bg-accent/15 text-accent border border-accent/30 rounded-full px-3 py-1">
            Kasus {currentCaseIdx + 1} dari {cases.length}
          </span>
          <span className="font-body text-[11px] font-semibold bg-accent-orange/15 text-accent-orange border border-accent-orange/30 rounded-full px-2.5 py-0.5 hidden sm:inline">
            {VARIATION_BEATS[assignedVarIdx]?.title || `Variasi #${assignedVarIdx + 1}`}
          </span>
        </div>
      </div>

      {/* Debuff Alert */}
      {hasFakeDistractor && (
        <div className="p-3 bg-accent-red/15 border border-accent-red/30 rounded-xl font-body text-xs text-accent-red flex items-center gap-2 shadow-sm">
          <AlertTriangle className="w-4 h-4 text-accent-red shrink-0" />
          <span><strong>Debuff Aktif dari Rival:</strong> Hati-hati! Ada potongan rumor palsu yang disusupkan lawan ke kumpulan fakta!</span>
        </div>
      )}

      {/* Case Briefing Box */}
      <div className="glass p-5 sm:p-7 rounded-2xl border border-rule space-y-3 shadow-card">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 font-body text-xs font-semibold text-accent-orange uppercase">
            <HelpCircle className="w-4 h-4" />
            <span>Berkas Investigasi #{currentCaseIdx + 1}</span>
            {currentCaseIdx === (assignedVarIdx % cases.length) && (
              <span className="bg-accent/20 text-accent text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-accent/30 tracking-normal capitalize inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Penugasan Utama Biro Anda</span>
              </span>
            )}
          </div>
          <span className="font-body text-[11px] bg-paper-2 border border-rule px-2.5 py-0.5 rounded-full text-ink-muted font-medium">
            Biro: {team?.name}
          </span>
        </div>

        <h3 className="font-display font-medium text-xl sm:text-2xl text-ink leading-snug">
          "{activeCase.topic}"
        </h3>

        <div className="p-4 bg-paper-2/50 border border-rule/80 rounded-xl font-body text-xs sm:text-sm text-ink-2 font-normal leading-relaxed italic">
          "{activeCase.reportText}"
        </div>

        <p className="font-body text-xs text-ink-muted">
          <strong>Cara Main:</strong> Klik potongan fakta di bawah, terus pasang ke kotak 5W+1H yang paling pas ya!
        </p>
      </div>

      {feedbackMsg && (
        <div className={`p-3.5 border rounded-xl text-xs font-body font-medium flex items-center justify-between shadow-sm ${
          isCaseFinished 
            ? "bg-accent-green/15 border-accent-green/30 text-accent-green" 
            : "bg-accent-orange/15 border-accent-orange/30 text-accent-orange"
        }`}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="underline ml-2">Tutup</button>
        </div>
      )}

      {/* Offline Team Discussion Prompt */}
      <div className="p-3.5 bg-paper-2/40 border border-rule/80 rounded-xl font-body text-xs text-ink flex items-start gap-2.5 shadow-sm">
        <Users className="w-4 h-4 text-accent shrink-0 mt-0.5" />
        <div>
          <strong className="text-accent font-semibold">Diskusi Bareng Tim:</strong> Bacain temuan fakta ini ke temen-temen se-tim secara santai. Saring mana fakta asli dan mana yang cuma gosip sebelum dipasang!
        </div>
      </div>

      {/* 5W+1H Slots */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
        {elementsList.map((elem) => {
          const assigned = assignments[elem.key];
          const isCorrect = assigned && assigned.element === elem.key;

          return (
            <div
              key={elem.key}
              data-slot={elem.key}
              onClick={() => handleAssignToSlot(elem.key)}
              className={`p-4 rounded-xl border transition-all duration-150 relative cursor-pointer ${
                assigned
                  ? isCorrect && isCaseFinished
                    ? "bg-accent-green/15 border-accent-green/40 shadow-sm"
                    : "glass border-rule shadow-sm"
                  : selectedClue
                    ? "bg-accent/10 border-accent/40 border-dashed hover:bg-accent/15"
                    : "glass border-rule/80 hover:border-rule"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5 gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-accent/20 text-accent border border-accent/30 px-2 py-0.5 rounded">
                    {elem.title}
                  </span>
                  <span className="font-body text-[10px] bg-paper-2 text-ink-muted border border-rule px-1.5 py-0.2 rounded hidden xs:inline">
                    {elem.role}
                  </span>
                </div>
                <span className="font-body text-[11px] text-ink-muted truncate">
                  {elem.desc}
                </span>
              </div>

              <div className="min-h-[48px] mt-2 flex items-center">
                {assigned ? (
                  <div className="w-full flex items-center justify-between gap-2 bg-paper-2/60 border border-rule rounded-lg p-2.5">
                    <span className="font-body text-xs sm:text-sm font-medium text-ink">
                      {assigned.text}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromSlot(elem.key);
                      }}
                      className="text-accent-red font-body text-xs hover:underline shrink-0 font-medium px-2 py-1 rounded bg-accent-red/10 border border-accent-red/20 min-h-[36px]"
                    >
                      [Lepas]
                    </button>
                  </div>
                ) : (
                  <div className="text-xs font-body text-ink-muted italic w-full text-center py-2.5 border border-dashed border-rule/60 rounded-lg min-h-[44px] flex items-center justify-center">
                    {selectedClue ? "Ketuk di sini untuk memasukkan fakta terpilih" : "Kotak masih kosong"}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Clues Pool */}
      <div className="glass p-5 rounded-2xl border border-rule shadow-card space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-body text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Potongan Fakta Tersedia ({availableClues.length} tersisa):
          </span>
          <button
            onClick={handleResetCurrentCase}
            className="text-xs font-body font-medium text-accent-orange hover:text-accent-orange/80 flex items-center gap-1.5 transition-colors min-h-[40px] px-3 py-1.5 rounded-full bg-accent-orange/10 border border-accent-orange/20"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Kasus Ini</span>
          </button>
        </div>

        {isCaseFinished && availableClues.length > 0 && (
          <div className="p-3 bg-accent-green/10 border border-accent-green/25 rounded-xl font-body text-xs text-accent-green flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-accent-green" />
            <span>Kalian berhasil memetakan 6 fakta inti dan menyisihkan {availableClues.length} potongan pengecoh (opini/rumor non-faktual)!</span>
          </div>
        )}

        {availableClues.length > 0 ? (
          <div className="flex flex-wrap gap-2.5">
            {availableClues.map((clue) => {
              const isSelected = selectedClue && selectedClue.id === clue.id;
              return (
                <button
                  key={clue.id}
                  onClick={() => handleSelectClue(clue)}
                  className={`text-left p-3 px-3.5 rounded-xl border text-xs sm:text-sm transition-all min-h-[44px] ${
                    isSelected
                      ? "bg-accent text-accent-ink border-accent font-semibold shadow-md ring-2 ring-accent"
                      : "bg-paper-2/60 border-rule text-ink-2 hover:bg-paper-2 hover:border-rule/80 font-medium"
                  }`}
                >
                  <span className="inline-flex items-start gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                    <span>{clue.text}</span>
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-3 font-body text-xs text-ink-muted">
            Semua potongan fakta kasus ini telah dipetakan ke kotak 5W+1H!
          </div>
        )}
      </div>

      {/* Case Completion / Next Step Callout */}
      {isCaseFinished && (
        <div className="glass p-6 sm:p-7 rounded-2xl border border-accent-green/40 shadow-card space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="neo-stamp bg-accent-green/20 text-accent-green border-accent-green/40 text-xs font-semibold">
                  Kasus #{currentCaseIdx + 1} Terverifikasi Tuntas!
                </span>
                {currentCaseIdx === (assignedVarIdx % cases.length) && (
                  <span className="font-body text-[11px] bg-accent/20 text-accent border border-accent/40 rounded-full px-2.5 py-0.5 font-bold inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Tugas Pokok Biro Anda</span>
                  </span>
                )}
              </div>
              <h4 className="font-display font-medium text-xl sm:text-2xl text-ink mt-1.5">
                Investigasi 5W+1H Valid & Bebas Distraksi!
              </h4>
              <div className="p-2 bg-accent-green/15 border border-accent-green/30 rounded-xl inline-flex items-center gap-2 text-xs font-semibold text-accent-green mt-1">
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Waktu Pengerjaan Anda: {formatDuration(elapsedSeconds)} (Di-pause)</span>
              </div>
              <p className="font-body text-xs sm:text-sm text-ink-muted mt-1">
                Biro <strong>{team?.name}</strong> berhasil membuktikan keenam unsur pokok berita tanpa terkecoh rumor hoaks.
              </p>
            </div>
            <button
              onClick={() => {
                sound.playStamp();
                handleCleanComplete(1, 100, moduleData?.badge || "Master 5W+1H");
              }}
              className="neo-btn bg-accent text-accent-ink hover:bg-accent-hi font-body font-semibold px-7 py-3 text-sm rounded-full shadow-lg transition-all min-h-[44px] shrink-0 w-full sm:w-auto justify-center inline-flex items-center gap-2"
            >
              <span>Klaim Lencana & Masuk Ruang Tunggu</span>
              <ArrowRight className="w-4 h-4 text-accent-ink" />
            </button>
          </div>

          <div className="pt-3 border-t border-rule/60 flex flex-wrap items-center justify-between gap-2 text-xs font-body text-ink-muted">
            <span>Ingin menguji kemampuan pada berkas investigasi variasi lainnya?</span>
            <button
              onClick={handleNextCase}
              className="rounded-full bg-paper-2 hover:bg-paper-3 border border-rule text-xs font-medium text-ink px-4 py-2 inline-flex items-center gap-1.5 transition-all min-h-[38px]"
            >
              <span>Jelajahi Kasus Lainnya ({((currentCaseIdx + 1) % cases.length) + 1}/{cases.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

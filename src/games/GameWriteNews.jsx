import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, CheckCircle2, XCircle, ArrowRight, RotateCcw, Lightbulb, Zap, Shield, PenTool, 
  Award, HelpCircle, BookOpen, Sparkles, Users, FileText, Scale, Search, Crown, ShieldAlert, AlertTriangle,
  Clock, Pause, Play
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

export default function GameWriteNews({ moduleData, team, onComplete, onBack, onOpenPocketNotes, onUpdateTeam }) {
  const assignedVarIdx = getTeamVariationIndex(team);
  const currentVariation = moduleData?.variations?.[assignedVarIdx % (moduleData?.variations?.length || 1)] || null;
  const challenges = currentVariation?.challenges || moduleData.challenges;
  const pocketNotes = team?.pocketNotes || [];
  const scoopNotes = pocketNotes.filter(n => n.isScoop && n.scoopQuote);

  const [currentStepIdx, setCurrentStepIdx] = useState(() => {
    try {
      const saved = sessionStorage.getItem("redaksi_game3_step_v5");
      const parsed = saved !== null ? parseInt(saved, 10) : 0;
      return !isNaN(parsed) && parsed < (challenges?.length || 5) ? parsed : 0;
    } catch {
      return 0;
    }
  });

  const [elapsedSeconds, setElapsedSeconds] = useState(() => {
    const t = getTeamStageTimer(team?.id || team, 3);
    return t.seconds;
  });

  useEffect(() => {
    if (team?.id) {
      startOrResumeTeamStageTimer(team.id, 3);
      const init = getTeamStageTimer(team.id, 3);
      setElapsedSeconds(init.seconds);
    }
    const interval = setInterval(() => {
      if (team?.id) {
        const t = getTeamStageTimer(team.id, 3);
        setElapsedSeconds(t.seconds);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [team?.id]);

  useEffect(() => {
    try {
      sessionStorage.setItem("redaksi_game3_step_v5", String(currentStepIdx));
    } catch {}
  }, [currentStepIdx]);

  const handleCleanComplete = (num, score, badge) => {
    try { sessionStorage.removeItem("redaksi_game3_step_v5"); } catch {}
    if (team?.id) {
      pauseTeamStageTimer(team.id, 3);
    }
    onComplete(num, score, badge, elapsedSeconds);
  };

  const handleCleanBack = () => {
    try { sessionStorage.removeItem("redaksi_game3_step_v5"); } catch {}
    if (team?.id) {
      pauseTeamStageTimer(team.id, 3);
    }
    onBack();
  };

  const [selectedOpt, setSelectedOpt] = useState(null);
  const [stepAnswers, setStepAnswers] = useState({});
  const [eliminatedOptions, setEliminatedOptions] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const currentCh = challenges[currentStepIdx];

  // Check if team has debuff "card_fake_distractor" (injeksi opsi palsu dari tim lawan!)
  const hasFakeDistractor = team?.activeDebuffs?.includes("card_fake_distractor");
  
  // Combine normal options with debuff distractors or pocket note scoops if unlocked!
  const availableOptions = React.useMemo(() => {
    let opts = [...currentCh.options];
    if (hasFakeDistractor && currentCh.debuffOptions) {
      opts = [...opts, ...currentCh.debuffOptions];
    }

    // Step 2: Narasumber & Fakta Berimbang (Inject exclusive scoop quotes gathered from interview!)
    if (currentStepIdx === 1 && scoopNotes.length > 0) {
      const bestScoop = scoopNotes[0];
      const scoopOption = {
        text: bestScoop.scoopQuote,
        isCorrect: true,
        isScoop: true,
        witnessName: bestScoop.witnessName,
        explanation: `⭐ KUTIPAN EKSKLUSIF (SCOOP) TERVERIFIKASI DARI ${bestScoop.witnessName.toUpperCase()}! Naskah memenuhi standar 100% fakta berimbang (cover both sides). (+100 Koin Kas)`
      };
      const wrongOpts = opts.filter(o => !o.isCorrect);
      opts = [scoopOption, ...wrongOpts];
    }

    return opts;
  }, [currentCh, hasFakeDistractor, currentStepIdx, scoopNotes]);

  const handleSelect = (opt) => {
    sound.playClick();
    setSelectedOpt(opt);
    const isCorrect = opt.isCorrect;
    if (isCorrect) {
      if (opt.isScoop) {
        sound.playStamp();
        confetti({ particleCount: 50, spread: 45, origin: { y: 0.7 } });
        if (onUpdateTeam && team) {
          onUpdateTeam({
            ...team,
            coins: (team.coins || 0) + 100
          });
        }
      } else {
        sound.playSuccess();
      }
    } else {
      sound.playError();
    }

    setStepAnswers({
      ...stepAnswers,
      [currentCh.id]: { opt, isCorrect }
    });
  };

  const handleUseLens = () => {
    sound.playClick();
    const wrongOpts = availableOptions.filter(o => !o.isCorrect && !eliminatedOptions.includes(o.text));
    if (wrongOpts.length > 0) {
      sound.playStamp();
      const toEliminate = wrongOpts[0].text;
      setEliminatedOptions([...eliminatedOptions, toEliminate]);
    }
  };

  const handleNext = () => {
    sound.playClick();
    setSelectedOpt(null);
    setShowHint(false);

    if (currentStepIdx < challenges.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
    } else {
      let correct = 0;
      challenges.forEach((c) => {
        if (stepAnswers[c.id]?.isCorrect) correct += 1;
      });
      const calculatedScore = Math.round((correct / challenges.length) * 100);
      setFinalScore(calculatedScore);
      setIsFinished(true);
      if (calculatedScore >= 65) {
        sound.playStamp();
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      } else {
        sound.playError();
      }
    }
  };

  const handleRestart = () => {
    sound.playClick();
    setCurrentStepIdx(0);
    setSelectedOpt(null);
    setStepAnswers({});
    setEliminatedOptions([]);
    setShowHint(false);
    setIsFinished(false);
    setFinalScore(0);
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-rule pb-3.5 gap-2">
        <button
          onClick={() => { sound.playClick(); handleCleanBack(); }}
          className="rounded-full bg-paper-2/70 hover:bg-paper-2 border border-rule gap-1.5 px-3.5 py-2 text-xs font-body font-medium text-ink inline-flex items-center transition-all shadow-sm min-h-[40px]"
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

          {onOpenPocketNotes && (
            <button
              onClick={() => { sound.playClick(); onOpenPocketNotes(); }}
              className="rounded-full bg-accent-orange/15 hover:bg-accent-orange/25 border border-accent-orange/30 text-accent-orange px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1 min-h-[38px] transition-all shadow-sm"
              title="Buka Catatan Saku Hasil Wawancara"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Buku Saku ({pocketNotes.length})</span>
              <span className="sm:hidden">{pocketNotes.length}</span>
            </button>
          )}

          <span className="font-body text-xs font-semibold bg-accent-green/15 text-accent-green border border-accent-green/30 rounded-full px-3 py-1.5 min-h-[32px] flex items-center">
            Tahap 3 • {VARIATION_BEATS[assignedVarIdx]?.title || "Menulis Berita"}
          </span>
          <span className="font-body text-xs text-ink-muted hidden md:inline">
            Estimasi: ~12-15 Menit
          </span>
        </div>
      </div>

      {!isFinished ? (
        <div className="space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between font-body text-xs text-ink-muted">
            <span>Langkah {currentStepIdx + 1} dari {challenges.length}</span>
            <span>Skor: <strong className="text-accent">{Object.values(stepAnswers).filter(a => a.isCorrect).length} Benar</strong></span>
          </div>

          {/* Active Debuff Alert Banner */}
          {hasFakeDistractor && (
            <div className="p-3 bg-accent-red/15 border border-accent-red/30 rounded-xl font-body text-xs text-accent-red flex items-center gap-2 shadow-sm">
              <AlertTriangle className="w-4 h-4 text-accent-red shrink-0" />
              <span><strong>Debuff Aktif dari Rival:</strong> Meja kalian disusupi Opsi Palsu Ekstra! Hati-hati memilih!</span>
            </div>
          )}

          {/* Challenge Exhibit Box */}
          <div className="glass p-5 sm:p-7 rounded-2xl border border-rule space-y-3.5 shadow-card">
            {currentVariation && (
              <div className="font-body text-xs font-semibold text-accent-orange border-b border-rule/50 pb-2 flex items-center justify-between flex-wrap gap-2">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-accent-orange" />
                  <span>{currentVariation.topic}</span>
                </span>
                <span className="font-body text-[11px] bg-paper-2 border border-rule text-ink-muted px-2 py-0.5 rounded-full font-medium">
                  Biro: {team?.name}
                </span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold bg-accent/20 text-accent border border-accent/30 px-2.5 py-0.5 rounded">
                  {currentCh.stepTitle}
                </span>
                <span className="font-body text-[11px] bg-paper-2 border border-rule text-ink-muted px-2.5 py-0.5 rounded-full font-medium inline-flex items-center">
                  {currentStepIdx === 0 && (
                    <>
                      <PenTool className="w-3 h-3 text-accent inline mr-1" />
                      <span>Fokus: Spesialis Lead</span>
                    </>
                  )}
                  {currentStepIdx === 1 && (
                    <>
                      <Scale className="w-3 h-3 text-accent inline mr-1" />
                      <span>Fokus: Penyelidik Narasumber</span>
                    </>
                  )}
                  {currentStepIdx === 2 && (
                    <>
                      <Search className="w-3 h-3 text-accent inline mr-1" />
                      <span>Fokus: Copy Editor</span>
                    </>
                  )}
                  {currentStepIdx === 3 && (
                    <>
                      <Crown className="w-3 h-3 text-accent-orange inline mr-1" />
                      <span>Fokus: Pemimpin Redaksi (Headline)</span>
                    </>
                  )}
                  {currentStepIdx === 4 && (
                    <>
                      <ShieldAlert className="w-3 h-3 text-accent inline mr-1" />
                      <span>Fokus: Dewan Pers & Kode Etik Jurnalistik</span>
                    </>
                  )}
                </span>
              </div>

              <button
                onClick={handleUseLens}
                className="text-xs font-body font-medium bg-accent-orange/15 border border-accent-orange/30 text-accent-orange px-3 py-1.5 rounded-full hover:bg-accent-orange/25 inline-flex items-center gap-1.5 transition-all shadow-sm min-h-[38px]"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Lensa Eliminasi</span>
              </button>
            </div>

            <div className="p-3 bg-paper-2/40 border border-rule/80 rounded-xl font-body text-xs text-ink flex items-start gap-2 shadow-sm">
              <Users className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <div>
                <strong className="text-accent font-semibold">Diskusi Santai Bareng Tim:</strong> Bacain konteks fakta di bawah ke temen-temen se-tim ya. Rembukan bareng buat milih opsi kalimat yang paling netral, padat fakta, dan bebas dari opini pribadi!
              </div>
            </div>

            <div className="p-3.5 bg-paper-2/60 border border-rule rounded-xl font-body text-xs sm:text-sm text-ink-2 leading-relaxed">
              <strong className="text-ink">Konteks & Fakta Lapangan:</strong> {currentCh.context}
            </div>

            <p className="font-display font-medium text-base sm:text-lg text-ink">
              {currentCh.prompt}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {availableOptions.map((opt, idx) => {
              const isSelected = selectedOpt === opt;
              const isCorrect = opt.isCorrect;
              const isEliminated = eliminatedOptions.includes(opt.text);

              if (isEliminated) {
                return (
                  <div key={idx} className="p-3 border border-dashed border-rule/60 bg-paper-2/30 rounded-xl font-body text-xs text-ink-muted line-through opacity-40">
                    [DIELIMINASI]: {opt.text}
                  </div>
                );
              }

              return (
                <div key={idx} className="space-y-2">
                  <button
                    onClick={() => !selectedOpt && handleSelect(opt)}
                    disabled={!!selectedOpt}
                    className={`w-full text-left p-4 rounded-xl border font-body text-xs sm:text-sm transition-all min-h-[44px] ${
                      isSelected
                        ? isCorrect
                          ? "bg-accent-green/20 border-accent-green text-ink shadow-sm"
                          : "bg-accent-red/20 border-accent-red text-ink shadow-sm"
                        : selectedOpt
                          ? "opacity-50 cursor-not-allowed glass border-rule"
                          : "glass border-rule/80 hover:border-rule cursor-pointer"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="font-mono text-xs font-bold bg-accent/20 text-accent border border-accent/30 px-2 py-0.5 rounded shrink-0">
                        Opsi #{String.fromCharCode(65 + idx)}
                      </span>
                      <span className="font-medium text-ink-2 leading-relaxed">"{opt.text}"</span>
                    </div>
                  </button>

                  {/* Feedback Explanation */}
                  {isSelected && (
                    <div className={`p-3.5 rounded-xl border text-xs font-body font-medium ${
                      isCorrect 
                        ? "bg-accent-green/15 border-accent-green/30 text-accent-green" 
                        : "bg-accent-orange/15 border-accent-orange/30 text-accent-orange"
                    }`}>
                      <div className="flex items-start gap-1.5">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{opt.explanation}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Next Button */}
          {selectedOpt && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNext}
                className="neo-btn p-3 px-6 bg-accent text-accent-ink hover:bg-accent-hi font-body font-semibold text-xs sm:text-sm rounded-full gap-2 w-full sm:w-auto justify-center shadow-lg transition-all min-h-[44px]"
              >
                <span>{currentStepIdx < challenges.length - 1 ? "Langkah Berikutnya" : "Selesaikan Penulisan Berita"}</span>
                <ArrowRight className="w-4 h-4 text-accent-ink" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Results Card */
        <div className="glass p-6 sm:p-9 rounded-2xl border border-rule text-center space-y-4 shadow-card">
          {finalScore >= 65 ? (
            <>
              <div className="neo-stamp bg-accent-green/20 text-accent-green border-accent-green/40 text-xs sm:text-sm font-semibold mx-auto">
                Naskah Berita Siap Terbit! (Skor: {finalScore}/100)
              </div>
              <h3 className="font-display font-medium text-2xl sm:text-4xl text-ink">
                Selamat, {team?.name}!
              </h3>
              <div className="p-2.5 bg-accent-green/15 border border-accent-green/35 rounded-xl inline-flex items-center gap-2 text-xs font-semibold text-accent-green">
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Waktu Pengerjaan Anda: {formatDuration(elapsedSeconds)} (Di-pause)</span>
              </div>
              <p className="font-body text-xs sm:text-base text-ink-2 max-w-lg mx-auto leading-relaxed">
                Kalian berhasil merakit naskah straight news berkualitas tinggi: teras berita padat 5W+1H, kutipan narasumber berimbang (cover both sides), bersih dari opini subjektif wartawan, dan judul utama yang memikat tanpa clickbait!
              </p>
              <div className="pt-3">
                <button
                  onClick={() => {
                    sound.playStamp();
                    handleCleanComplete(moduleData.number, finalScore, moduleData.badge);
                  }}
                  className="neo-btn bg-accent text-accent-ink hover:bg-accent-hi font-body font-semibold px-8 py-3.5 text-sm rounded-full shadow-lg transition-all min-h-[44px] inline-flex items-center gap-2"
                >
                  <span>Klaim Lencana & Masuk Ruang Tunggu Redaksi</span>
                  <ArrowRight className="w-4 h-4 text-accent-ink" />
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="neo-stamp bg-accent-orange/20 text-accent-orange border-accent-orange/40 text-xs sm:text-sm font-semibold mx-auto">
                Skor Belum Mencukupi: {finalScore}/100 (Minimal 65)
              </div>
              <h3 className="font-display font-medium text-2xl sm:text-3xl text-ink">
                Perbaiki Naskah Redaksi
              </h3>
              <p className="font-body text-xs sm:text-base text-ink-2 max-w-lg mx-auto leading-relaxed">
                Naskah kalian masih memuat beberapa kekeliruan struktur atau opini non-jurnalistik. Diskusikan kembali bersama tim dan ulangi tahapan ini untuk meraih skor kelulusan minimal 65!
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
                <button
                  onClick={handleRestart}
                  className="rounded-full bg-paper-2 hover:bg-paper-3 border border-rule text-xs font-body font-medium text-ink px-5 py-2.5 inline-flex items-center justify-center gap-1.5 transition-all shadow-sm min-h-[44px]"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Ulangi Tahap Ini</span>
                </button>
                <button
                  onClick={() => { sound.playClick(); handleCleanBack(); }}
                  className="rounded-full bg-accent text-accent-ink hover:bg-accent-hi text-xs font-body font-semibold px-5 py-2.5 inline-flex items-center justify-center gap-1.5 transition-all shadow-sm min-h-[44px]"
                >
                  <span>Kembali ke Meja Redaksi</span>
                  <ArrowRight className="w-4 h-4 text-accent-ink" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

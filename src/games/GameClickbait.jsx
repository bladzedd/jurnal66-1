import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, Zap, CheckCircle2, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { sound } from '../utils/sound';

export default function GameClickbait({ moduleData, onComplete, onBack }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isFinished, setIsFinished] = useState(false);

  const challenges = moduleData.challenges;
  const currentCh = challenges[currentIdx];

  const handleChoose = (opt) => {
    sound.playClick();
    setSelectedOpt(opt);
    const isCorrect = opt.isBest;
    if (isCorrect) {
      sound.playSuccess();
    } else {
      sound.playError();
    }

    setAnswers({
      ...answers,
      [currentCh.id]: { opt, isCorrect }
    });
  };

  const handleNext = () => {
    sound.playClick();
    setSelectedOpt(null);
    if (currentIdx < challenges.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      let correct = 0;
      challenges.forEach((c) => {
        if (answers[c.id]?.isCorrect) correct += 1;
      });
      const finalScore = Math.round((correct / challenges.length) * 100);
      setIsFinished(true);
      if (finalScore >= 65) {
        sound.playStamp();
        confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
        onComplete(moduleData.id, finalScore, moduleData.badge);
      }
    }
  };

  const handleRestart = () => {
    sound.playClick();
    setCurrentIdx(0);
    setSelectedOpt(null);
    setAnswers({});
    setIsFinished(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b-[3px] border-ink pb-3">
        <button
          onClick={() => { sound.playClick(); onBack(); }}
          className="neo-btn neo-btn-sm bg-paper-card hover:bg-paper-2 gap-1.5 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>KEMBALI KE RUANG REDAKSI</span>
        </button>

        <div className="font-mono text-xs font-bold bg-accent-yellow border-[2px] border-ink px-3 py-1 shadow-neo-sm">
          MISI #05: BUSTER CLICKBAIT
        </div>
      </div>

      {!isFinished ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between font-mono text-xs text-ink-muted">
            <span>TANTANGAN {currentIdx + 1} DARI {challenges.length}</span>
            <span>MEMPERBAIKI JUDUL BUMBASTIS</span>
          </div>

          {/* Bad Headline Exhibit */}
          <div className="neo-box p-6 bg-paper-card">
            <div className="flex items-center gap-2 mb-2 font-mono text-xs font-bold text-accent-red uppercase">
              <Zap className="w-4 h-4" />
              <span>JUDUL CLICKBAIT YANG HARUS DIPERBAIKI:</span>
            </div>
            
            {/* The Clickbait Banner */}
            <div className="p-4 bg-accent-red/10 border-[3px] border-accent-red text-accent-red font-display font-extrabold text-lg sm:text-xl uppercase tracking-tight">
              "{currentCh.badHeadline}"
            </div>

            {/* Context Facts */}
            <div className="mt-4 p-3 bg-paper border-[2px] border-ink font-body text-xs sm:text-sm text-ink-2">
              <strong>Fakta Lapangan Sesungguhnya:</strong> {currentCh.context}
            </div>

            <p className="font-mono text-xs text-ink-muted mt-3">
              Pilih draf judul revisi yang paling akurat, elegan, dan informatif di bawah:
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentCh.options.map((opt, idx) => {
              const isSelected = selectedOpt === opt;
              const isCorrect = opt.isBest;

              return (
                <div key={idx}>
                  <button
                    onClick={() => !selectedOpt && handleChoose(opt)}
                    disabled={!!selectedOpt}
                    className={`w-full text-left p-4 border-[3px] border-ink font-body text-xs sm:text-sm font-semibold transition-all ${
                      isSelected
                        ? isCorrect
                          ? "bg-accent-green/20 shadow-neo translate-x-1 translate-y-1"
                          : "bg-accent-red/20 shadow-neo translate-x-1 translate-y-1"
                        : selectedOpt
                          ? "opacity-50 cursor-not-allowed bg-paper-card"
                          : "bg-paper-card hover:bg-paper-2 shadow-neo cursor-pointer"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="font-mono font-bold bg-ink text-paper text-xs px-2 py-0.5 shrink-0">
                        REVISI #{idx + 1}
                      </span>
                      <span>"{opt.text}"</span>
                    </div>
                  </button>

                  {/* Feedback */}
                  {isSelected && (
                    <div className={`mt-2 p-3 border-[2px] border-ink font-mono text-xs font-bold ${
                      isCorrect ? "bg-accent-green text-paper" : "bg-accent-yellow text-ink"
                    }`}>
                      <strong>Evaluasi:</strong> {opt.critique}
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
                className="neo-btn p-3 px-6 bg-ink text-paper hover:bg-neutral-800 font-display font-bold text-sm gap-2"
              >
                <span>{currentIdx < challenges.length - 1 ? "LANJUT KE TANTANGAN BERIKUTNYA" : "LIHAT EVALUASI REDAKSI"}</span>
                <ArrowRight className="w-4 h-4 text-accent-yellow" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Results Card */
        <div className="neo-box p-6 sm:p-8 bg-paper-card text-center space-y-4">
          <div className="neo-stamp bg-accent-yellow text-ink border-ink text-lg font-extrabold mx-auto">
            CLICKBAIT BERHASIL DITUMPAS
          </div>
          <h3 className="font-display font-extrabold text-3xl uppercase">
            Gelar Editor Judul Handal Diraih!
          </h3>

          <p className="font-body text-sm sm:text-base text-ink font-medium max-w-md mx-auto leading-relaxed">
            Judul berita yang baik adalah etalase kejujuran. Terima kasih telah menjaga kehormatan jurnalisme dengan menyajikan judul yang memikat tanpa menipu!
          </p>

          <div className="flex justify-center gap-3 pt-4">
            <button
              onClick={handleRestart}
              className="neo-btn neo-btn-md bg-paper-card hover:bg-paper-2 text-xs font-bold gap-1"
            >
              <RotateCcw className="w-4 h-4" />
              <span>ULANGI TANTANGAN</span>
            </button>

            <button
              onClick={() => { sound.playClick(); onBack(); }}
              className="neo-btn neo-btn-md bg-ink text-paper hover:bg-neutral-800 text-xs font-bold gap-1"
            >
              <span>KEMBALI KE MEJA REDAKSI</span>
              <ArrowRight className="w-4 h-4 text-accent-yellow" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, ShieldAlert, CheckCircle2, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { sound } from '../utils/sound';

export default function GameEthics({ moduleData, onComplete, onBack }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isFinished, setIsFinished] = useState(false);

  const cases = moduleData.cases;
  const currentCase = cases[currentIdx];

  const handleSelectOption = (opt) => {
    sound.playClick();
    setSelectedOption(opt);
    const isCorrect = opt.verdict === "correct";
    if (isCorrect) {
      sound.playSuccess();
    } else {
      sound.playError();
    }

    setAnswers({
      ...answers,
      [currentCase.id]: { opt, isCorrect }
    });
  };

  const handleNext = () => {
    sound.playClick();
    setSelectedOption(null);
    if (currentIdx < cases.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      let correct = 0;
      cases.forEach((c) => {
        if (answers[c.id]?.isCorrect) correct += 1;
      });
      const finalScore = Math.round((correct / cases.length) * 100);
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
    setSelectedOption(null);
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

        <div className="font-mono text-xs font-bold bg-accent-green text-paper border-[2px] border-ink px-3 py-1 shadow-neo-sm">
          MISI #04: DILEMA ETIKA REDAKTUR
        </div>
      </div>

      {!isFinished ? (
        <div className="space-y-6">
          {/* Progress Tracker */}
          <div className="flex items-center justify-between font-mono text-xs text-ink-muted">
            <span>KASUS REDAKSI {currentIdx + 1} DARI {cases.length}</span>
            <span>DILEMA KODE ETIK JURNALISTIK</span>
          </div>

          {/* Case Card */}
          <div className="neo-box p-6 bg-paper-card">
            <div className="flex items-center gap-2 mb-2 font-mono text-xs font-bold text-accent-orange uppercase">
              <ShieldAlert className="w-4 h-4" />
              <span>BERKAS MEJA REDAKTUR</span>
            </div>
            <h3 className="font-display font-extrabold text-xl sm:text-2xl text-ink leading-snug">
              {currentCase.title}
            </h3>

            <div className="mt-3 p-4 bg-paper border-[2px] border-ink font-body text-xs sm:text-sm text-ink-2 leading-relaxed font-semibold">
              {currentCase.situation}
            </div>

            <p className="font-mono text-xs font-bold text-ink mt-3">
              {currentCase.question}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentCase.options.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              const isCorrect = opt.verdict === "correct";

              return (
                <div key={idx}>
                  <button
                    onClick={() => !selectedOption && handleSelectOption(opt)}
                    disabled={!!selectedOption}
                    className={`w-full text-left p-4 border-[3px] border-ink font-body text-xs sm:text-sm font-semibold transition-all ${
                      isSelected
                        ? isCorrect
                          ? "bg-accent-green/20 shadow-neo translate-x-1 translate-y-1"
                          : "bg-accent-red/20 shadow-neo translate-x-1 translate-y-1"
                        : selectedOption
                          ? "opacity-50 cursor-not-allowed bg-paper-card"
                          : "bg-paper-card hover:bg-paper-2 shadow-neo cursor-pointer"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="font-mono font-bold bg-ink text-paper text-xs px-2 py-0.5 shrink-0">
                        OPSI #{String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt.text}</span>
                    </div>
                  </button>

                  {/* Feedback Explanation */}
                  {isSelected && (
                    <div className={`mt-2 p-3 border-[2px] border-ink font-mono text-xs font-bold ${
                      isCorrect ? "bg-accent-green text-paper" : "bg-accent-yellow text-ink"
                    }`}>
                      <strong>Ulasan Etika:</strong> {opt.feedback}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Next Button */}
          {selectedOption && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNext}
                className="neo-btn p-3 px-6 bg-ink text-paper hover:bg-neutral-800 font-display font-bold text-sm gap-2"
              >
                <span>{currentIdx < cases.length - 1 ? "LANJUT KE KASUS BERIKUTNYA" : "LIHAT KEPUTUSAN AKHIR"}</span>
                <ArrowRight className="w-4 h-4 text-accent-yellow" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Final Verdict Results */
        <div className="neo-box p-6 sm:p-8 bg-paper-card text-center space-y-4">
          <div className="neo-stamp bg-accent-green text-paper border-ink text-lg font-extrabold mx-auto">
            SIDANG ETIKA SELESAI
          </div>
          <h3 className="font-display font-extrabold text-3xl uppercase">
            Integritas Meja Redaksimu Teruji
          </h3>

          <p className="font-body text-sm sm:text-base text-ink font-medium max-w-md mx-auto leading-relaxed">
            Menjadi jurnalis bukan sekadar siapa yang paling cepat menyebarkan kabar, melainkan siapa yang berani menjaga martabat, kejujuran fakta, dan perlindungan privasi sesama manusia.
          </p>

          <div className="flex justify-center gap-3 pt-4">
            <button
              onClick={handleRestart}
              className="neo-btn neo-btn-md bg-paper-card hover:bg-paper-2 text-xs font-bold gap-1"
            >
              <RotateCcw className="w-4 h-4" />
              <span>ULANGI KASUS</span>
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

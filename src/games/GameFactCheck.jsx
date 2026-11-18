import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';
import { sound } from '../utils/sound';

export default function GameFactCheck({ moduleData, onComplete, onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const questions = moduleData.questions;
  const currentQ = questions[currentIndex];

  const handleAnswer = (choice) => {
    sound.playClick();
    const isCorrect = choice === currentQ.type;
    if (isCorrect) {
      sound.playSuccess();
    } else {
      sound.playError();
    }

    setUserAnswers({
      ...userAnswers,
      [currentQ.id]: { choice, isCorrect }
    });
    setShowExplanation(true);
  };

  const handleNext = () => {
    sound.playClick();
    setShowExplanation(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Calculate final score
      let correct = 0;
      questions.forEach((q) => {
        if (userAnswers[q.id]?.isCorrect) correct += 1;
      });
      const finalScore = Math.round((correct / questions.length) * 100);
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
    setCurrentIndex(0);
    setUserAnswers({});
    setShowExplanation(false);
    setIsFinished(false);
  };

  const currentResult = userAnswers[currentQ?.id];

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

        <div className="font-mono text-xs font-bold bg-accent-cyan border-[2px] border-ink px-3 py-1 shadow-neo-sm">
          MISI #02: PATROLI FAKTA VS OPINI
        </div>
      </div>

      {!isFinished ? (
        <div className="space-y-6">
          {/* Progress Tracker */}
          <div className="flex items-center justify-between font-mono text-xs text-ink-muted">
            <span>PERNYATAAN {currentIndex + 1} DARI {questions.length}</span>
            <span>SKOR SEMENTARA: {Object.values(userAnswers).filter(a => a.isCorrect).length} BENAR</span>
          </div>

          {/* Statement Flashcard (Neo-Brutalist News Feed) */}
          <div className="neo-box p-6 bg-paper-card min-h-[220px] flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs font-bold bg-ink text-paper px-2 py-0.5 uppercase mb-3 inline-block">
                LINTAS BERITA #{currentIndex + 1}
              </span>
              <p className="font-display font-bold text-xl sm:text-2xl text-ink leading-snug mt-2">
                "{currentQ.statement}"
              </p>
            </div>

            {/* Educational Explanation Box */}
            {showExplanation && (
              <div className={`mt-4 p-4 border-[2px] border-ink ${
                currentResult.isCorrect ? "bg-accent-green/20" : "bg-accent-red/20"
              }`}>
                <div className="flex items-center gap-2 font-display font-bold text-sm uppercase">
                  {currentResult.isCorrect ? (
                    <span className="text-accent-green flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> KEPUTUSAN TEPAT!
                    </span>
                  ) : (
                    <span className="text-accent-red flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> KEPUTUSAN KURANG TEPAT
                    </span>
                  )}
                </div>
                <p className="font-body text-xs sm:text-sm text-ink-2 mt-1 font-medium">
                  {currentQ.explanation}
                </p>
              </div>
            )}
          </div>

          {/* Action Choice Buttons */}
          {!showExplanation ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleAnswer("fact")}
                className="neo-btn p-4 bg-accent-green text-paper hover:bg-emerald-600 font-display font-extrabold text-base uppercase gap-2"
              >
                <span>[ FAKTA ]</span>
              </button>

              <button
                onClick={() => handleAnswer("opinion")}
                className="neo-btn p-4 bg-accent-yellow text-ink hover:bg-yellow-300 font-display font-extrabold text-base uppercase gap-2"
              >
                <span>[ OPINI ]</span>
              </button>

              <button
                onClick={() => handleAnswer("hoax")}
                className="neo-btn p-4 bg-accent-red text-paper hover:bg-red-600 font-display font-extrabold text-base uppercase gap-2"
              >
                <span>[ HOAKS ]</span>
              </button>
            </div>
          ) : (
            <div className="flex justify-end">
              <button
                onClick={handleNext}
                className="neo-btn p-3 px-6 bg-ink text-paper hover:bg-neutral-800 font-display font-bold text-sm gap-2"
              >
                <span>{currentIndex < questions.length - 1 ? "LANJUT KE KASUS BERIKUTNYA" : "LIHAT HASIL AKHIR"}</span>
                <ArrowRight className="w-4 h-4 text-accent-yellow" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Results Card */
        <div className="neo-box p-6 sm:p-8 bg-paper-card text-center space-y-4">
          <div className="neo-stamp bg-accent-yellow text-ink border-ink text-lg font-extrabold mx-auto">
            PATROLI SELESAI
          </div>
          <h3 className="font-display font-extrabold text-3xl uppercase">
            Hasil Penilaian Fact Checker
          </h3>

          <div className="w-24 h-24 mx-auto border-[3px] border-ink bg-paper flex items-center justify-center font-display font-extrabold text-4xl shadow-neo">
            {Math.round((Object.values(userAnswers).filter(a => a.isCorrect).length / questions.length) * 100)}%
          </div>

          <p className="font-body text-sm sm:text-base text-ink font-medium max-w-md mx-auto">
            Kamu menjawab {Object.values(userAnswers).filter(a => a.isCorrect).length} dari {questions.length} berita dengan tepat! Kemampuan membedakan fakta, opini, dan hoaks adalah bekal utama jurnalis berintegritas.
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-3">
            <button
              onClick={handleRestart}
              className="neo-btn neo-btn-md bg-paper-card hover:bg-paper-2 text-xs font-bold gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>ULANGI PATROLI</span>
            </button>

            <button
              onClick={() => { sound.playClick(); onBack(); }}
              className="neo-btn neo-btn-md bg-ink text-paper hover:bg-neutral-800 text-xs font-bold gap-1.5"
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

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, MessageSquare, CheckCircle2, User, Send, ArrowRight, RotateCcw } from 'lucide-react';
import { sound } from '../utils/sound';

export default function GameInterview({ moduleData, onComplete, onBack }) {
  const scenario = moduleData.scenario;
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [chatHistory, setChatHistory] = useState([
    { sender: "interviewee", name: scenario.interviewee, text: scenario.initialDialogue }
  ]);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [totalScore, setTotalScore] = useState(0);

  const currentStep = scenario.steps[currentStepIdx];

  const handlePickQuestion = (opt) => {
    sound.playTypewriter();
    setSelectedOpt(opt);

    // Append student's chosen question to chat
    const updatedChat = [
      ...chatHistory,
      { sender: "reporter", name: "Kamu (Wartawan Muda)", text: opt.text }
    ];

    setTimeout(() => {
      sound.playClick();
      // Append interviewee response
      setChatHistory([
        ...updatedChat,
        { sender: "interviewee", name: scenario.interviewee, text: opt.response, feedback: opt.feedback, score: opt.score }
      ]);
    }, 450);
  };

  const handleNextStep = () => {
    sound.playClick();
    const newScore = totalScore + (selectedOpt?.score || 0);
    setTotalScore(newScore);
    setSelectedOpt(null);

    if (currentStepIdx < scenario.steps.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
    } else {
      // Completed all steps
      setIsFinished(true);
      const finalScore = Math.round((newScore / (scenario.steps.length * 2)) * 100);
      if (finalScore >= 50) {
        sound.playStamp();
        confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
        onComplete(moduleData.id, finalScore, moduleData.badge);
      }
    }
  };

  const handleRestart = () => {
    sound.playClick();
    setCurrentStepIdx(0);
    setChatHistory([
      { sender: "interviewee", name: scenario.interviewee, text: scenario.initialDialogue }
    ]);
    setSelectedOpt(null);
    setIsFinished(false);
    setTotalScore(0);
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

        <div className="font-mono text-xs font-bold bg-accent-cyan border-[2px] border-ink px-3 py-1 shadow-neo-sm">
          MISI #06: WAWANCARA INVESTIGASI
        </div>
      </div>

      {/* Case Briefing */}
      <div className="neo-box p-4 bg-paper-card">
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-accent-orange uppercase mb-1">
          <MessageSquare className="w-4 h-4" />
          <span>LIPUTAN KHUSUS LAPANGAN</span>
        </div>
        <h3 className="font-display font-extrabold text-lg sm:text-xl text-ink">
          Topik: {scenario.topic}
        </h3>
        <p className="font-mono text-xs text-ink-muted mt-1">
          Narasumber: <strong>{scenario.interviewee}</strong>
        </p>
      </div>

      {!isFinished ? (
        <div className="space-y-4">
          {/* Chat Messenger Container */}
          <div className="neo-box p-4 bg-paper min-h-[300px] max-h-[420px] overflow-y-auto space-y-4">
            {chatHistory.map((msg, idx) => {
              const isReporter = msg.sender === "reporter";
              return (
                <div
                  key={idx}
                  className={`flex flex-col ${isReporter ? "items-end" : "items-start"}`}
                >
                  <span className="font-mono text-[10px] text-ink-muted mb-0.5">
                    {msg.name}
                  </span>
                  <div
                    className={`max-w-[85%] p-3.5 border-[2.5px] border-ink shadow-neo-sm text-xs sm:text-sm font-body font-semibold ${
                      isReporter
                        ? "bg-accent-yellow text-ink rounded-tl-lg rounded-bl-lg rounded-br-lg"
                        : "bg-paper-card text-ink rounded-tr-lg rounded-bl-lg rounded-br-lg"
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Feedback note if present */}
                  {msg.feedback && (
                    <div className={`mt-1.5 max-w-[85%] p-2 border-[1.5px] border-ink text-[11px] font-mono font-bold ${
                      msg.score > 0 ? "bg-accent-green/20 text-ink" : "bg-accent-red/20 text-accent-red"
                    }`}>
                      Evaluasi Jurnalistik: {msg.feedback}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Choice Dialogue */}
          {!selectedOpt ? (
            <div className="space-y-2">
              <span className="font-mono text-xs font-bold text-ink block">
                {currentStep.leadIn}
              </span>
              <div className="space-y-2">
                {currentStep.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePickQuestion(opt)}
                    className="w-full text-left p-3.5 border-[2.5px] border-ink bg-paper-card hover:bg-paper-2 shadow-neo font-body text-xs sm:text-sm font-semibold flex items-start gap-2.5 cursor-pointer active:translate-x-1 active:translate-y-1"
                  >
                    <span className="font-mono font-bold bg-ink text-paper text-xs px-2 py-0.5 shrink-0">
                      TANYA #{idx + 1}
                    </span>
                    <span>"{opt.text}"</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNextStep}
                className="neo-btn p-3 px-6 bg-ink text-paper hover:bg-neutral-800 font-display font-bold text-sm gap-2"
              >
                <span>{currentStepIdx < scenario.steps.length - 1 ? "LANJUT KE PERTANYAAN BERIKUTNYA" : "RANGKUM HASIL LIPUTAN"}</span>
                <ArrowRight className="w-4 h-4 text-accent-yellow" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Results Card */
        <div className="neo-box p-6 sm:p-8 bg-paper-card text-center space-y-4">
          <div className="neo-stamp bg-accent-cyan text-ink border-ink text-lg font-extrabold mx-auto">
            BERKAS INVESTIGASI LENGKAP
          </div>
          <h3 className="font-display font-extrabold text-3xl uppercase">
            Fakta Berhasil Diungkap Secara Terhormat
          </h3>

          <p className="font-body text-sm sm:text-base text-ink font-medium max-w-md mx-auto leading-relaxed">
            Berkat pendekatan wawancara yang objektif dan tidak menuduh, narasumber bersedia mengungkap fakta sebenarnya: masalah bermula dari lonjakan daya stand kuliner liar dan kini telah tertangani. Berita kamu berbobot, akurat, dan adil!
          </p>

          <div className="flex justify-center gap-3 pt-4">
            <button
              onClick={handleRestart}
              className="neo-btn neo-btn-md bg-paper-card hover:bg-paper-2 text-xs font-bold gap-1"
            >
              <RotateCcw className="w-4 h-4" />
              <span>ULANGI WAWANCARA</span>
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

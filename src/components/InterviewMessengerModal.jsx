import React, { useState, useEffect, useRef } from 'react';
import { 
  X, MessageSquare, Sparkles, AlertTriangle, CheckCircle2, 
  Send, User, Award, Shield, BookOpen, Clock, Heart, Frown, ThumbsUp, Radio, ArrowRight
} from 'lucide-react';
import { sound } from '../utils/sound';
import { 
  getActiveClassroomCase, 
  recordInterviewInteraction, 
  getTeamInterviewProgress, 
  getTeamPocketNotes 
} from '../utils/storage';
import { WitnessAvatar } from './ui/ProfessionalIcon';

export default function InterviewMessengerModal({ team, onClose, onOpenPocketNotes, onUpdateTeam }) {
  const currentCase = getActiveClassroomCase(team);
  const witnesses = currentCase?.witnesses || [];
  
  const [selectedWitnessId, setSelectedWitnessId] = useState(() => witnesses[0]?.id || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const chatScrollRef = useRef(null);

  const selectedWitness = witnesses.find(w => w.id === selectedWitnessId) || witnesses[0];
  const caseProgress = team?.interviewProgress?.[currentCase.id] || { witnesses: {} };
  const witnessProgress = caseProgress.witnesses?.[selectedWitness?.id] || {
    trust: selectedWitness?.initialTrust || 75,
    questionsAsked: [],
    isNoComment: false
  };

  const trustScore = witnessProgress.trust ?? (selectedWitness?.initialTrust || 75);
  const isNoComment = witnessProgress.isNoComment || trustScore < 30;
  const questionsAsked = witnessProgress.questionsAsked || [];

  const teamNotes = team?.pocketNotes || [];
  const caseNotes = teamNotes.filter(n => n.caseId === currentCase?.id);

  // Auto scroll chat to bottom when question asked or witness switched
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [selectedWitnessId, questionsAsked.length]);

  const handleAskQuestion = (questionId) => {
    if (isSubmitting || questionsAsked.includes(questionId) || isNoComment) return;

    sound.playClick();
    setIsSubmitting(true);

    setTimeout(() => {
      const result = recordInterviewInteraction(team.id, currentCase.id, selectedWitness.id, questionId);
      if (result && result.team) {
        if (result.question?.isScoop) {
          sound.playStamp();
        } else if (result.question?.trustDelta < 0) {
          sound.playError();
        } else {
          sound.playSuccess();
        }
        if (onUpdateTeam) onUpdateTeam(result.team);
      }
      setIsSubmitting(false);
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4">
      <div className="glass max-w-2xl w-full h-[95vh] sm:h-[88vh] rounded-3xl border border-rule shadow-card flex flex-col justify-between overflow-hidden animate-in fade-in zoom-in-95 duration-200 motion-reduce:animate-none">
        
        {/* Top Header */}
        <div className="p-3.5 sm:p-4 border-b border-rule bg-paper-2/70 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-accent-orange/15 border border-accent-orange/30 flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5 text-accent-orange" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="bg-accent-orange/15 text-accent-orange border border-accent-orange/30 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  Ruang Liputan Narasumber
                </span>
                <span className="font-mono text-[11px] text-ink-muted hidden xs:inline">
                  {currentCase?.category || "Investigasi Sekolah"}
                </span>
              </div>
              <h3 className="font-display font-medium text-sm sm:text-base text-ink truncate mt-0.5">
                {currentCase?.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenPocketNotes && (
              <button
                onClick={() => { sound.playClick(); onOpenPocketNotes(); }}
                className="rounded-full bg-accent-orange/15 hover:bg-accent-orange/25 border border-accent-orange/30 text-accent-orange px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5 min-h-[38px] transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-hidden"
                title="Buka Catatan Saku"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Buku Saku ({caseNotes.length})</span>
                <span className="sm:hidden">{caseNotes.length}</span>
              </button>
            )}

            <button
              onClick={() => { sound.playClick(); onClose(); }}
              className="w-10 h-10 min-h-[40px] min-w-[40px] rounded-full bg-paper-2 hover:bg-paper-3 border border-rule flex items-center justify-center text-ink transition-colors"
              title="Tutup Ruang Wawancara"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Witness Switcher Ribbon */}
        <div className="bg-paper-2/40 border-b border-rule/60 p-2 overflow-x-auto no-scrollbar touch-pan-x flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-body text-ink-muted font-medium px-2 shrink-0 hidden sm:inline">
            Pilih Saksi:
          </span>
          {witnesses.map((w) => {
            const isSelected = w.id === selectedWitness.id;
            const wProg = caseProgress.witnesses?.[w.id];
            const wTrust = wProg?.trust ?? w.initialTrust;
            const wQuestionsCount = wProg?.questionsAsked?.length || 0;
            const wHasScoop = teamNotes.some(n => n.caseId === currentCase?.id && n.witnessId === w.id && n.isScoop);

            return (
              <button
                key={w.id}
                onClick={() => { sound.playClick(); setSelectedWitnessId(w.id); }}
                className={`p-2 px-3 rounded-2xl border transition-colors flex items-center gap-2 shrink-0 min-h-[44px] ${
                  isSelected 
                    ? "bg-accent text-accent-ink border-accent font-semibold shadow-sm" 
                    : "glass border-rule hover:border-rule/80 text-ink"
                }`}
              >
                <WitnessAvatar 
                  witnessId={w.id} 
                  role={w.role} 
                  avatar={w.avatar} 
                  className="w-8 h-8 rounded-full shrink-0 border border-rule/80" 
                  iconClassName="w-4 h-4" 
                />
                <div className="text-left">
                  <div className="text-xs truncate max-w-[130px] font-medium leading-tight">
                    {w.name}
                  </div>
                  <div className={`text-[10px] flex items-center gap-1 ${isSelected ? "text-accent-ink/80" : "text-ink-muted"}`}>
                    <span>Kepercayaan: {wTrust}%</span>
                    {wHasScoop && <Sparkles className="w-3 h-3 text-accent-orange shrink-0" title="Kutipan Scoop Berhasil Didapat" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Witness Info Bar & Trust Meter */}
        <div className="px-4 py-2.5 bg-paper-3/30 border-b border-rule/50 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs font-body">
          <div className="flex items-center gap-2.5">
            <WitnessAvatar 
              witnessId={selectedWitness.id} 
              role={selectedWitness.role} 
              avatar={selectedWitness.avatar} 
              className="w-9 h-9 rounded-full shrink-0 border border-rule/80 shadow-xs" 
              iconClassName="w-4 h-4" 
            />
            <div>
              <span className="font-semibold text-ink text-sm sm:text-base">{selectedWitness.name}</span>
              <span className="text-ink-muted text-xs ml-1.5 hidden xs:inline">({selectedWitness.role})</span>
            </div>
          </div>

          {/* Trust Meter Progress Bar */}
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-[11px] text-ink-muted hidden sm:inline">Kepercayaan Saksi:</span>
            <div className="w-24 sm:w-32 bg-paper-2 rounded-full h-2.5 overflow-hidden border border-rule">
              <div 
                className={`h-full w-full rounded-full origin-left transition-transform duration-300 ${
                  trustScore >= 70 ? "bg-accent-green" : trustScore >= 40 ? "bg-accent-orange" : "bg-accent-red"
                }`}
                style={{ transform: `scaleX(${Math.max(0.05, trustScore / 100)})` }}
              ></div>
            </div>
            <span className={`font-mono text-xs font-bold ${
              trustScore >= 70 ? "text-accent-green" : trustScore >= 40 ? "text-accent-orange" : "text-accent-red"
            }`}>
              {trustScore}%
            </span>
          </div>
        </div>

        {/* Chat Conversation Scroll Area */}
        <div 
          ref={chatScrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar bg-paper/50"
        >
          {/* Witness Intro Greeting Card */}
          <div className="flex items-start gap-2.5 max-w-[90%] sm:max-w-[80%]">
            <WitnessAvatar 
              witnessId={selectedWitness.id} 
              role={selectedWitness.role} 
              avatar={selectedWitness.avatar} 
              className="w-9 h-9 rounded-full shrink-0 mt-1 border border-rule/80 shadow-xs" 
              iconClassName="w-4 h-4" 
            />
            <div className="glass p-3.5 rounded-2xl rounded-tl-xs border border-rule space-y-1.5 shadow-sm">
              <span className="font-display font-medium text-xs text-ink-muted block">
                {selectedWitness.name} ({selectedWitness.role})
              </span>
              <p className="font-body text-xs sm:text-sm text-ink-2 leading-relaxed">
                "Halo tim redaksi. Saya {selectedWitness.name}. Silakan tanyakan hal-hal yang berkaitan dengan kejadian ini secara sopan dan teratur. {selectedWitness.personality}"
              </p>
            </div>
          </div>

          {/* Dialogue History */}
          {selectedWitness.questions?.map((q) => {
            const hasAsked = questionsAsked.includes(q.id);
            if (!hasAsked) return null;

            return (
              <React.Fragment key={q.id}>
                {/* Student Question Bubble (Right) */}
                <div className="flex justify-end">
                  <div className="bg-accent text-accent-ink p-3.5 rounded-2xl rounded-tr-xs max-w-[88%] sm:max-w-[78%] shadow-sm space-y-1">
                    <span className="font-body text-[10px] text-accent-ink/75 block font-semibold">
                      Pertanyaan Wartawan Biro:
                    </span>
                    <p className="font-body text-xs sm:text-sm font-medium leading-relaxed">
                      "{q.text}"
                    </p>
                  </div>
                </div>

                {/* Witness Response Bubble (Left) */}
                <div className="flex items-start gap-2.5 max-w-[90%] sm:max-w-[80%]">
                  <WitnessAvatar 
                    witnessId={selectedWitness.id} 
                    role={selectedWitness.role} 
                    avatar={selectedWitness.avatar} 
                    className="w-9 h-9 rounded-full shrink-0 mt-1 border border-rule/80 shadow-xs" 
                    iconClassName="w-4 h-4" 
                  />
                  <div className="glass p-3.5 rounded-2xl rounded-tl-xs border border-rule space-y-2 shadow-sm">
                    <span className="font-display font-medium text-xs text-ink-muted block">
                      {selectedWitness.name}
                    </span>
                    <p className="font-body text-xs sm:text-sm text-ink-2 leading-relaxed">
                      "{q.answer}"
                    </p>

                    {/* Gold Scoop / Fact Box */}
                    {q.revealsFact && (
                      <div className="p-3 rounded-xl bg-accent-orange/15 border border-accent-orange/30 text-ink space-y-1 shadow-xs animate-in fade-in duration-200">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-accent-orange">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{q.isScoop ? "KUTIPAN EKSKLUSIF (SCOOP) TERCATAT!" : "FAKTA KUNCI TERCATAT KE BUKU SAKU"}</span>
                        </div>
                        <p className="font-body text-xs text-ink-2 italic leading-relaxed">
                          "{q.isScoop && q.scoopQuote ? q.scoopQuote : q.revealsFact}"
                        </p>
                      </div>
                    )}

                    {/* Warning if trust was lost */}
                    {q.trustDelta < 0 && (
                      <div className="p-2.5 rounded-xl bg-accent-red/15 border border-accent-red/30 text-accent-red text-xs font-body font-medium flex items-center gap-1.5">
                        <Frown className="w-4 h-4 shrink-0" />
                        <span>Aduh, pertanyaannya agak menuduh nih! Kepercayaan saksi jadi berkurang ({q.trustDelta}%).</span>
                      </div>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })}

          {/* No Comment State Warning if trust collapsed */}
          {isNoComment && (
            <div className="p-3.5 rounded-2xl bg-accent-red/15 border border-accent-red/40 text-accent-red font-body text-xs text-center space-y-1 shadow-sm">
              <span className="font-bold flex items-center justify-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>NARASUMBER MENOLAK MENJAWAB (NO COMMENT)</span>
              </span>
              <p className="text-ink-2">
                "{selectedWitness.name} agak tersinggung karena pertanyaannya terkesan menuduh. Beliau gamau jawab lagi nih ke biro kalian. Coba ajak ngobrol saksi lain ya!"
              </p>
            </div>
          )}
        </div>

        {/* Bottom Question Choices Sheet */}
        <div className="p-3.5 sm:p-4 border-t border-rule bg-paper-2/70 space-y-2.5 shrink-0">
          <div className="flex justify-between items-center text-xs font-body text-ink-muted">
            <span className="font-semibold text-ink-2">Pilih Pertanyaan Wartawan:</span>
            <span>
              {questionsAsked.length} dari {selectedWitness.questions?.length || 0} Pertanyaan Diajukan
            </span>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar">
            {selectedWitness.questions?.map((q, idx) => {
              const hasAsked = questionsAsked.includes(q.id);

              return (
                <button
                  key={q.id}
                  onClick={() => handleAskQuestion(q.id)}
                  disabled={hasAsked || isNoComment || isSubmitting}
                  className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm font-body transition-colors flex items-start justify-between gap-2 min-h-[44px] ${
                    hasAsked 
                      ? "bg-paper-2/30 border-rule/50 text-ink-muted opacity-60 cursor-not-allowed" 
                      : isNoComment 
                        ? "opacity-40 cursor-not-allowed bg-paper-2/20 border-rule" 
                        : "glass hover:bg-paper-2 border-rule hover:border-accent text-ink cursor-pointer active:scale-[0.99]"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="font-mono text-xs font-bold bg-accent/20 text-accent border border-accent/30 px-2 py-0.5 rounded shrink-0 mt-0.5">
                      #{idx + 1}
                    </span>
                    <span className="font-medium text-ink leading-relaxed">
                      "{q.text}"
                    </span>
                  </div>

                  {hasAsked ? (
                    <span className="text-[11px] text-accent-green font-semibold shrink-0 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Sudah Ditanyakan</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-accent font-semibold shrink-0 hidden sm:inline flex items-center gap-1">
                      <span>Tanyakan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

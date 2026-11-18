import React, { useState } from 'react';
import { 
  Key, CheckCircle2, XCircle, AlertTriangle, FileText, BookOpen, 
  Layers, PenTool, MessageSquare, Printer, Copy, Check, ChevronDown, 
  ChevronUp, Lightbulb, Sparkles, Users, Award, ArrowRight, Scale, ShieldCheck
} from 'lucide-react';
import { journalismStages } from '../data/journalismData';
import { getAllSchoolCases } from '../utils/storage';
import { WitnessAvatar } from './ui/ProfessionalIcon';
import { sound } from '../utils/sound';

const DESK_NAMES = [
  { id: 0, code: "Desk 1", name: "Hukum & Tata Kelola Digital", color: "blue" },
  { id: 1, code: "Desk 2", name: "Kesehatan, Pangan & Warisan Budaya", color: "rose" },
  { id: 2, code: "Desk 3", name: "Lingkungan, Konservasi Alam & Kebijakan", color: "emerald" },
  { id: 3, code: "Desk 4", name: "Energi Terbarukan, Sains Terapan & Fasilitas", color: "amber" },
  { id: 4, code: "Desk 5", name: "Keamanan Siber & Demokrasi Pelajar", color: "cyan" },
];

export default function TeacherAnswerKeysView({ teams = [] }) {
  const [selectedStage, setSelectedStage] = useState(1); // 1: 5W1H, 2: Pyramid, 3: WriteNews, 4: Interviews
  const [selectedDesk, setSelectedDesk] = useState(0); // 0 to 4
  const [copiedText, setCopiedText] = useState(false);
  const [expandedSections, setExpandedSections] = useState({ distractors: true, explanations: true });

  const schoolCases = getAllSchoolCases();

  // Find teams assigned to the selected desk
  const assignedTeams = teams.filter(t => {
    const idx = typeof t.assignedVariationIndex === 'number' 
      ? t.assignedVariationIndex 
      : 0;
    return idx === selectedDesk;
  });

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopySummary = () => {
    sound.playClick();
    let text = `=== KUNCI JAWABAN GURU: JURNAL66 TASK ===\n`;
    text += `Meja Desk: ${DESK_NAMES[selectedDesk].code} - ${DESK_NAMES[selectedDesk].name}\n\n`;

    if (selectedStage === 1) {
      const c = journalismStages[0].cases[selectedDesk];
      text += `[TAHAP 1: EKSTRAKSI 5W+1H]\n`;
      text += `Kasus: ${c.topic}\n\n`;
      c.clues.forEach(clue => {
        text += `* ${clue.element.toUpperCase()}: ${clue.text}\n`;
      });
      text += `\nPengecoh (Salah):\n`;
      c.distractors.forEach(d => {
        text += `- ${d.text} (${d.distractorType})\n`;
      });
    } else if (selectedStage === 2) {
      const c = journalismStages[1].cases[selectedDesk];
      text += `[TAHAP 2: PIRAMIDA TERBALIK]\n`;
      text += `Kasus: ${c.topic}\n\n`;
      const sorted = [...c.blocks].sort((a, b) => a.level - b.level);
      sorted.forEach(b => {
        text += `Tingkat ${b.level} [${b.name}]: ${b.text}\n`;
      });
    } else if (selectedStage === 3) {
      const v = journalismStages[2].variations[selectedDesk];
      text += `[TAHAP 3: MENULIS BERITA STRAIGHT NEWS]\n`;
      text += `Topik: ${v.topic}\n\n`;
      v.challenges.forEach((ch, idx) => {
        const correct = ch.options.find(o => o.isCorrect || o.isBest || o.verdict === 'correct');
        text += `${ch.stepTitle}\n`;
        text += `-> Kunci Jawaban: ${correct?.text}\n`;
        text += `-> Alasan: ${correct?.explanation}\n\n`;
      });
    } else if (selectedStage === 4) {
      const sc = schoolCases[selectedDesk] || schoolCases[0];
      text += `[WAWANCARA SAKSI & KUTIPAN EMAS (SCOOP)]\n`;
      text += `Kasus: ${sc.title}\n`;
      text += `Lokasi: ${sc.location} | Waktu: ${sc.date}\n\n`;
      sc.witnesses.forEach((w, wIdx) => {
        text += `Saksi ${wIdx + 1}: ${w.name} (${w.role})\n`;
        const scoopQ = w.questions.find(q => q.isScoop);
        if (scoopQ) {
          text += `  Pertanyaan Kunci: "${scoopQ.text}"\n`;
          text += `  Kutipan Emas: ${scoopQ.scoopQuote}\n`;
        }
      });
    }

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Banner & Actions */}
      <div className="glass p-5 sm:p-6 rounded-2xl border border-rule shadow-card space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-rule/60 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-accent-yellow/20 border border-accent-yellow/40 flex items-center justify-center shrink-0 text-accent-yellow shadow-sm">
              <Key className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display font-medium text-xl sm:text-2xl text-ink">
                  Kunci Jawaban Guru & Panduan Redaksi Senior
                </h3>
                <span className="bg-accent-yellow/20 text-accent-yellow border border-accent-yellow/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Pegangan Resmi Pengampu
                </span>
              </div>
              <p className="font-body text-xs sm:text-sm text-ink-muted mt-1 leading-relaxed">
                Pedoman solusi komprehensif seluruh 5 variasi desk untuk memandu jalannya musyawarah kelompok, memeriksa akurasi liputan siswa, dan memastikan standar etika jurnalistik terpenuhi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
            <button
              onClick={handleCopySummary}
              className="rounded-full bg-paper-2 hover:bg-paper-3 border border-rule text-xs font-body font-semibold text-ink px-3.5 py-2 inline-flex items-center gap-1.5 transition-all shadow-xs min-h-[40px]"
              title="Salin ringkasan kunci jawaban ini ke clipboard"
            >
              {copiedText ? <Check className="w-4 h-4 text-accent-green" /> : <Copy className="w-4 h-4 text-ink-muted" />}
              <span>{copiedText ? "Tersalin ke Clipboard!" : "Salin Kunci"}</span>
            </button>

            <button
              onClick={() => { sound.playClick(); window.print(); }}
              className="rounded-full bg-accent text-accent-ink hover:bg-accent-hi text-xs font-body font-semibold px-4 py-2 inline-flex items-center gap-1.5 transition-all shadow-sm min-h-[40px]"
              title="Cetak lembar pegangan kunci jawaban untuk guru di kelas"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Kunci</span>
            </button>
          </div>
        </div>

        {/* 2. Stage Filter Navigation */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block">
            PILIH MATERI TAHAP LIPUTAN:
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { id: 1, label: "Tahap 1: 5W + 1H", sub: "Ekstraksi Fakta Pokok", icon: FileText },
              { id: 2, label: "Tahap 2: Piramida Terbalik", sub: "Struktur Hirarki Berita", icon: Layers },
              { id: 3, label: "Tahap 3: Menulis Berita", sub: "5 Langkah Siap Terbit", icon: PenTool },
              { id: 4, label: "Wawancara Saksi", sub: "Kutipan Emas (Scoop)", icon: MessageSquare },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = selectedStage === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { sound.playClick(); setSelectedStage(tab.id); }}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                    isActive
                      ? "bg-accent text-accent-ink border-accent font-semibold shadow-sm"
                      : "bg-paper-2/60 hover:bg-paper-2 border-rule text-ink hover:border-rule/80"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isActive ? "bg-accent-ink/20 text-accent-ink" : "bg-paper border border-rule text-accent"
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="text-xs sm:text-sm font-display block leading-tight truncate">{tab.label}</span>
                    <span className={`text-[10px] block truncate ${isActive ? "text-accent-ink/80" : "text-ink-muted"}`}>{tab.sub}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Desk Variation Selector */}
        <div className="space-y-2 pt-2 border-t border-rule/50">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block">
              PILIH MEJA DESK REDAKSI (VARIASI TUGAS KELOMPOK):
            </label>
            {assignedTeams.length > 0 && (
              <span className="text-[11px] font-mono text-accent-green bg-accent-green/10 border border-accent-green/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>Dikerjakan oleh: {assignedTeams.map(t => t.name).join(", ")}</span>
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {DESK_NAMES.map(d => {
              const isActive = selectedDesk === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => { sound.playClick(); setSelectedDesk(d.id); }}
                  className={`px-3 py-2 rounded-xl text-xs font-body font-semibold border transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-accent text-accent-ink border-accent shadow-xs"
                      : "bg-paper-2/60 hover:bg-paper-2 border-rule text-ink"
                  }`}
                >
                  <span>{d.code}: {d.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. CONTENT DISPLAY PER STAGE */}

      {/* STAGE 1: 5W + 1H */}
      {selectedStage === 1 && (() => {
        const c = journalismStages[0].cases[selectedDesk];
        if (!c) return null;

        return (
          <div className="space-y-5">
            {/* Case Overview */}
            <div className="glass p-5 rounded-2xl border border-rule shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-accent-orange text-xs font-semibold uppercase tracking-wider">
                <FileText className="w-4 h-4" />
                <span>Naskah Kasus Investigasi: {c.topic}</span>
              </div>
              <div className="p-4 rounded-xl bg-paper-2/70 border border-rule/80 font-serif text-xs sm:text-sm text-ink leading-relaxed">
                "{c.reportText}"
              </div>
            </div>

            {/* 5W+1H Solution Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-display font-medium text-base text-ink flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent-green" />
                  <span>Kunci 6 Unsur Pokok Berita (5W + 1H):</span>
                </h4>
                <span className="text-xs text-ink-muted">Setiap elemen bernilai poin penuh saat ditempatkan tepat</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {c.clues.map((clue, idx) => (
                  <div key={idx} className="glass p-4 rounded-2xl border border-accent-green/30 bg-accent-green/5 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-accent-green/20 text-accent-green border border-accent-green/30 font-mono text-[11px] font-bold">
                        {clue.element.toUpperCase()}
                      </span>
                      <span className="text-[11px] text-ink-muted font-medium">Unsur #{idx + 1}</span>
                    </div>
                    <div className="text-[11px] font-body text-ink-muted font-semibold">
                      {clue.label}
                    </div>
                    <p className="font-body text-xs sm:text-sm text-ink font-medium leading-snug">
                      "{clue.text}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Distractor Trap Analysis */}
            <div className="glass p-5 rounded-2xl border border-accent-red/30 bg-accent-red/5 space-y-3 shadow-xs">
              <div 
                className="flex items-center justify-between cursor-pointer select-none"
                onClick={() => toggleSection('distractors')}
              >
                <div className="flex items-center gap-2 text-accent-red font-display font-medium text-base">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>Analisis Jebakan Pengecoh (Distractors) yang Harus Disaring Siswa:</span>
                </div>
                <button type="button" className="text-ink-muted hover:text-ink">
                  {expandedSections.distractors ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>

              {expandedSections.distractors && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  {c.distractors.map((dist, dIdx) => (
                    <div key={dIdx} className="p-3.5 rounded-xl bg-paper border border-rule space-y-2 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent-red/15 text-accent-red border border-accent-red/25 uppercase font-mono">
                          Pengecoh #{dIdx + 1}
                        </span>
                        <XCircle className="w-4 h-4 text-accent-red shrink-0" />
                      </div>
                      <div className="text-[11px] font-semibold text-accent-red">
                        {dist.distractorType}
                      </div>
                      <p className="font-body text-xs text-ink-2 line-through leading-snug">
                        "{dist.text}"
                      </p>
                      <div className="pt-2 border-t border-rule/60 text-[11px] text-ink-muted font-body leading-relaxed">
                        <strong>Mengapa Salah:</strong> {dist.distractorReason}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* STAGE 2: INVERTED PYRAMID */}
      {selectedStage === 2 && (() => {
        const c = journalismStages[1].cases[selectedDesk];
        if (!c) return null;
        const sortedBlocks = [...c.blocks].sort((a, b) => a.level - b.level);

        return (
          <div className="space-y-5">
            {/* Case Overview */}
            <div className="glass p-5 rounded-2xl border border-rule shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-accent text-xs font-semibold uppercase tracking-wider">
                <Layers className="w-4 h-4" />
                <span>Kasus Struktur Piramida Terbalik: {c.topic}</span>
              </div>
              <p className="font-body text-xs text-ink-muted leading-relaxed">
                Struktur piramida terbalik menyusun fakta dari yang paling krusial di bagian teratas hingga detail pelengkap di bagian paling bawah. Siswa harus mengurutkan 5 balok berikut secara tepat:
              </p>
            </div>

            {/* Inverted Pyramid Visual Hierarchy */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-display font-medium text-base text-ink flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent-green" />
                  <span>Kunci Urutan Balok Berita (Tingkat 1 s.d. Tingkat 5):</span>
                </h4>
                <span className="text-xs text-ink-muted font-mono">Paling Penting ➔ Detail Pelengkap</span>
              </div>

              <div className="space-y-3">
                {sortedBlocks.map((block) => {
                  const widthPercent = [100, 93, 86, 79, 72][block.level - 1] || 80;

                  return (
                    <div 
                      key={block.id}
                      style={{ width: `${widthPercent}%` }}
                      className="mx-auto glass p-4 rounded-2xl border border-accent/40 bg-accent/5 shadow-xs space-y-2 transition-all hover:scale-[1.01]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30 font-mono text-[11px] font-bold">
                          LEVEL #{block.level}: {block.name}
                        </span>
                        <span className="text-[11px] text-accent-green font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Urutan Ke-{block.level}</span>
                        </span>
                      </div>

                      <p className="font-body text-xs sm:text-sm text-ink font-medium leading-relaxed">
                        "{block.text}"
                      </p>

                      <div className="pt-2 border-t border-rule/50 flex items-center gap-1.5 text-[11px] text-ink-muted font-body">
                        <Lightbulb className="w-3.5 h-3.5 text-accent-yellow shrink-0" />
                        <span><strong>Petunjuk Guru:</strong> {block.hint}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* STAGE 3: WRITE NEWS */}
      {selectedStage === 3 && (() => {
        const v = journalismStages[2].variations[selectedDesk];
        if (!v) return null;

        return (
          <div className="space-y-5">
            {/* Case Overview */}
            <div className="glass p-5 rounded-2xl border border-rule shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-accent-orange text-xs font-semibold uppercase tracking-wider">
                <PenTool className="w-4 h-4" />
                <span>Naskah Proyek Berita: {v.topic}</span>
              </div>
              <p className="font-body text-xs text-ink-muted leading-relaxed">
                Di tahap akhir ini, biro redaksi diuji dalam 5 langkah kritis jurnalistik. Setiap langkah memiliki 1 opsi emas yang memenuhi etika dan standar pers:
              </p>
            </div>

            {/* 5 Steps Breakdown */}
            <div className="space-y-4">
              {v.challenges.map((ch, idx) => {
                const correctOpt = ch.options.find(o => o.isCorrect || o.isBest || o.verdict === 'correct');
                const wrongOpts = ch.options.filter(o => o !== correctOpt);

                return (
                  <div key={idx} className="glass p-5 rounded-2xl border border-rule space-y-3 shadow-xs">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-rule/60 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-accent text-accent-ink font-mono text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <h4 className="font-display font-medium text-base text-ink">
                          {ch.stepTitle}
                        </h4>
                      </div>
                      <span className="text-[11px] text-ink-muted font-mono bg-paper-2 border border-rule px-2 py-0.5 rounded-full">
                        Langkah {idx + 1} dari 5
                      </span>
                    </div>

                    <div className="text-xs text-ink-muted italic font-body">
                      {ch.context}
                    </div>

                    {/* Correct Option Container */}
                    <div className="p-4 rounded-xl bg-accent-green/10 border border-accent-green/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-accent-green/20 text-accent-green border border-accent-green/30 font-mono text-[11px] font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>KUNCI JAWABAN BENAR:</span>
                        </span>
                        <span className="text-xs font-semibold text-accent-green">+100 Poin Standar Pers</span>
                      </div>

                      <p className="font-body text-xs sm:text-sm text-ink font-semibold leading-relaxed">
                        "{correctOpt?.text}"
                      </p>

                      <div className="pt-2 border-t border-accent-green/20 text-[11px] text-accent-green font-body leading-relaxed flex items-start gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span><strong>Alasan / Analisis Redaksi:</strong> {correctOpt?.explanation}</span>
                      </div>
                    </div>

                    {/* Wrong Options Brief */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block">
                        Opsi-opsi yang Harus Ditolak Siswa:
                      </span>
                      <div className="space-y-1.5">
                        {wrongOpts.map((wOpt, wIdx) => (
                          <div key={wIdx} className="p-2.5 rounded-lg bg-paper-2 border border-rule text-xs text-ink-2 flex items-start gap-2">
                            <XCircle className="w-3.5 h-3.5 text-accent-red shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <span className="line-through block text-ink-muted">"{wOpt.text}"</span>
                              {wOpt.explanation && (
                                <span className="text-[11px] text-accent-red/90 block">Kelemahan: {wOpt.explanation}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* STAGE 4: INTERVIEWS & SCOOPS */}
      {selectedStage === 4 && (() => {
        const sc = schoolCases[selectedDesk] || schoolCases[0];

        return (
          <div className="space-y-5">
            {/* School Case Overview */}
            <div className="glass p-5 rounded-2xl border border-rule shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-accent text-xs font-semibold uppercase tracking-wider">
                <MessageSquare className="w-4 h-4" />
                <span>Kasus Wawancara Sekolah: {sc.title}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-ink-muted">
                <div className="p-2.5 rounded-xl bg-paper-2 border border-rule">
                  <span className="block font-semibold text-ink">Lokasi:</span>
                  {sc.location}
                </div>
                <div className="p-2.5 rounded-xl bg-paper-2 border border-rule">
                  <span className="block font-semibold text-ink">Waktu:</span>
                  {sc.date}
                </div>
                <div className="p-2.5 rounded-xl bg-paper-2 border border-rule">
                  <span className="block font-semibold text-ink">Arah Berita (Headline Target):</span>
                  "{sc.headlineHint}"
                </div>
              </div>
              <p className="font-body text-xs text-ink leading-relaxed">
                {sc.summary}
              </p>
            </div>

            {/* Witnesses & Golden Scoops Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-display font-medium text-base text-ink flex items-center gap-2">
                  <Award className="w-5 h-5 text-accent-yellow" />
                  <span>Kunci Pertanyaan Narasumber & Fakta Emas (+50 Koin per Scoop):</span>
                </h4>
                <span className="text-xs text-ink-muted">Siswa wajib menjaga kepercayaan saksi di atas batas minimal</span>
              </div>

              <div className="space-y-4">
                {sc.witnesses.map((w, wIdx) => {
                  const scoopQuestion = w.questions.find(q => q.isScoop);
                  const trapQuestion = w.questions.find(q => q.trustDelta < 0);

                  return (
                    <div key={wIdx} className="glass p-5 rounded-2xl border border-rule space-y-3 shadow-xs">
                      <div className="flex items-center justify-between border-b border-rule/60 pb-3">
                        <div className="flex items-center gap-2.5">
                          <WitnessAvatar witnessId={w.id} role={w.role} avatar={w.avatar} className="w-8 h-8 rounded-xl" iconClassName="w-4 h-4" />
                          <div>
                            <h5 className="font-display font-medium text-sm sm:text-base text-ink">
                              {w.name}
                            </h5>
                            <span className="font-body text-xs text-ink-muted block">{w.role}</span>
                          </div>
                        </div>

                        <span className="text-[11px] text-accent font-mono bg-accent/10 border border-accent/20 px-2.5 py-0.5 rounded-full">
                          Trust Awal: {w.initialTrust}%
                        </span>
                      </div>

                      <div className="text-xs text-ink-muted italic font-body">
                        <strong>Watak / Karakter Saksi:</strong> {w.personality}
                      </div>

                      {/* Golden Scoop Box */}
                      {scoopQuestion && (
                        <div className="p-4 rounded-xl bg-accent-yellow/10 border border-accent-yellow/30 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-full bg-accent-yellow/20 text-accent-yellow border border-accent-yellow/30 font-mono text-[10px] font-bold flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>PERTANYAAN PEMBUKA FAKTA EMAS (SCOOP):</span>
                            </span>
                            <span className="text-xs font-semibold text-accent-yellow">+{scoopQuestion.trustDelta}% Trust & +50 Koin</span>
                          </div>

                          <p className="font-body text-xs sm:text-sm text-ink font-semibold">
                            "{scoopQuestion.text}"
                          </p>

                          <div className="pt-2 border-t border-accent-yellow/20 space-y-1">
                            <span className="text-[11px] font-semibold text-accent-yellow block uppercase tracking-wider">
                              Kutipan Resmi Siap Salin ke Buku Saku Wartawan:
                            </span>
                            <p className="font-serif text-xs sm:text-sm text-ink bg-paper p-3 rounded-lg border border-rule italic">
                              {scoopQuestion.scoopQuote}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Trap Question Warning */}
                      {trapQuestion && (
                        <div className="p-3 rounded-xl bg-accent-red/10 border border-accent-red/20 text-xs space-y-1">
                          <div className="flex items-center gap-1.5 text-accent-red font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>Jebakan Pertanyaan Menghakimi (Hindari!):</span>
                          </div>
                          <p className="text-ink-2 line-through">
                            "{trapQuestion.text}"
                          </p>
                          <span className="text-[11px] text-accent-red block">
                            Dampak: Saksi tersinggung ({trapQuestion.trustDelta}% Trust) dan menolak wawancara jika trust habis.
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

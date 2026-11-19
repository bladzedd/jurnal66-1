import React from 'react';
import { BookOpen, X, Sparkles, CheckCircle2, User, Award, Shield, FileText } from 'lucide-react';
import { sound } from '../utils/sound';
import { WitnessAvatar } from './ui/ProfessionalIcon';

export default function PocketNotebookDrawer({ team, isOpen, onClose, onOpenInterview }) {
  if (!isOpen) return null;

  const notes = team?.pocketNotes || [];
  const totalScoops = notes.filter(n => n.isScoop).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex justify-end animate-in fade-in duration-200 motion-reduce:animate-none">
      <div 
        className="w-full max-w-md bg-paper border-l border-rule shadow-2xl h-full flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-250 motion-reduce:animate-none"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-rule bg-paper-2/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-accent-orange/20 border border-accent-orange/40 text-accent-orange flex items-center justify-center shadow-sm">
              <BookOpen className="w-5 h-5 text-accent-orange" />
            </div>
            <div>
              <h3 className="font-display font-medium text-lg text-ink flex items-center gap-1.5">
                <span>Buku Catatan Wartawan</span>
              </h3>
              <span className="font-body text-xs text-ink-muted">
                {notes.length} Fakta Terkumpul • {totalScoops} Kutipan Eksklusif (Scoop)
              </span>
            </div>
          </div>

          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="w-10 h-10 min-h-[40px] min-w-[40px] rounded-full bg-paper-2 hover:bg-paper-3 border border-rule flex items-center justify-center text-ink transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-hidden"
            title="Tutup Catatan Saku"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notes Content List */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-3.5 no-scrollbar">
          {notes.length === 0 ? (
            <div className="p-8 text-center glass rounded-2xl border border-dashed border-rule/80 space-y-3 my-6">
              <div className="w-12 h-12 rounded-2xl bg-paper-2 border border-rule flex items-center justify-center mx-auto text-ink-muted">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="font-display font-medium text-base text-ink">Buku Catatan Masih Kosong</h4>
              <p className="font-body text-xs text-ink-muted leading-relaxed max-w-xs mx-auto">
                Biro kalian belum ngobrol sama saksi nih. Yuk temui saksi-saksi di Ruang Wawancara buat ngumpulin fakta penting sama kutipan berita!
              </p>
              {onOpenInterview && (
                <button
                  onClick={() => { sound.playClick(); onClose(); onOpenInterview(); }}
                  className="rounded-full bg-accent text-accent-ink font-semibold text-xs px-4 py-2.5 shadow min-h-[42px] inline-flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-hidden"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Buka Ruang Wawancara Sekarang</span>
                </button>
              )}
            </div>
          ) : (
            notes.map((note, idx) => (
              <div 
                key={note.id || idx}
                className={`p-4 rounded-2xl border transition-colors shadow-card space-y-2.5 ${
                  note.isScoop 
                    ? "bg-accent-orange/10 border-accent-orange/40 ring-1 ring-accent-orange/20" 
                    : "glass border-rule"
                }`}
              >
                <div className="flex items-center justify-between border-b border-rule/50 pb-2">
                  <div className="flex items-center gap-2.5">
                    <WitnessAvatar 
                      witnessId={note.witnessId} 
                      role={note.witnessRole} 
                      avatar={note.witnessAvatar} 
                      className="w-9 h-9 rounded-full shrink-0 border border-rule/80 shadow-xs" 
                      iconClassName="w-4 h-4" 
                    />
                    <div>
                      <h5 className="font-display font-medium text-sm text-ink">{note.witnessName}</h5>
                      <span className="font-body text-[11px] text-ink-muted">{note.witnessRole}</span>
                    </div>
                  </div>

                  {note.isScoop ? (
                    <span className="bg-accent-orange/20 text-accent-orange border border-accent-orange/30 text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>SCOOP!</span>
                    </span>
                  ) : (
                    <span className="bg-paper-2 border border-rule text-ink-muted text-[10px] px-2 py-0.5 rounded-full font-mono">
                      {note.timestamp || "Tercatat"}
                    </span>
                  )}
                </div>

                <div className="font-body text-xs sm:text-sm text-ink-2 leading-relaxed">
                  <p className="italic">
                    "{note.isScoop && note.scoopQuote ? note.scoopQuote : note.fact}"
                  </p>
                </div>

                {note.isScoop && (
                  <div className="pt-1 border-t border-accent-orange/20 flex items-center gap-1.5 text-[11px] font-body text-accent-orange font-medium">
                    <Award className="w-3.5 h-3.5" />
                    <span>Bakal otomatis ngebuka opsi akurat 100% pas nulis berita di Tahap 3!</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-rule bg-paper-2/40 space-y-2">
          {onOpenInterview && (
            <button
              onClick={() => { sound.playClick(); onClose(); onOpenInterview(); }}
              className="w-full rounded-full bg-accent text-accent-ink hover:bg-accent-hi font-body font-semibold text-xs sm:text-sm py-3 transition-colors shadow min-h-[44px] flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-hidden"
            >
              <Sparkles className="w-4 h-4" />
              <span>Wawancarai Saksi Lain di Ruang Wawancara</span>
            </button>
          )}

          <div className="text-center font-body text-[11px] text-ink-muted">
            Kutipan di buku saku ini siap dipake pas ngerjain naskah berita Tahap 3 nanti ya!
          </div>
        </div>
      </div>
    </div>
  );
}

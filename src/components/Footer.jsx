import React, { useState } from 'react';
import { RotateCcw, ShieldCheck, Heart, AlertTriangle } from 'lucide-react';
import { sound } from '../utils/sound';

export default function Footer({ onResetProgress }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirmReset = () => {
    sound.playStamp();
    setShowConfirm(false);
    onResetProgress();
  };

  return (
    <footer className="border-t border-rule bg-paper-2/40 py-8 mt-12 text-xs font-body text-ink-muted">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <div className="font-display font-medium text-base tracking-tight text-ink">
            Jurnal66 Task: Platform Pembelajaran Jurnalistik Digital
          </div>
          <p className="text-ink-muted text-xs mt-1">
            Materi pembelajaran dasar jurnalistik & anti-hoaks berbasis kolaborasi tim.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => { sound.playClick(); setShowConfirm(true); }}
            className="text-ink-muted hover:text-accent-red font-medium flex items-center gap-1.5 cursor-pointer transition-colors min-h-[40px] px-3.5 py-2 rounded-full border border-rule/70 hover:border-accent-red/30 bg-paper-2/50 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-hidden"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Progres Latihan</span>
          </button>

          <span className="text-rule hidden sm:inline">|</span>

          <span className="bg-accent/15 text-accent border border-accent/30 rounded-full px-3 py-1 font-medium text-[11px] shadow-sm">
            Tema: Dusk Modern-Minimal
          </span>
        </div>
      </div>

      {/* Dusk Confirmation Modal for Reset */}
      {showConfirm && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass p-6 rounded-3xl border border-accent-orange/40 max-w-sm w-full space-y-4 shadow-card text-center animate-in fade-in zoom-in-95 duration-200 motion-reduce:animate-none">
            <div className="w-12 h-12 rounded-2xl bg-accent-orange/20 text-accent-orange border border-accent-orange/40 flex items-center justify-center mx-auto text-xl shadow-sm">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-display font-medium text-lg text-ink">
                Ulangi Progres Latihan?
              </h3>
              <p className="font-body text-xs text-ink-muted">
                Tindakan ini akan mengembalikan seluruh tahap simulasi redaksi ke awal.
              </p>
            </div>

            <div className="flex gap-2.5 justify-center pt-2">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="rounded-full bg-paper-2 hover:bg-paper-3 border border-rule px-4 py-2 text-xs font-body font-medium text-ink transition-colors min-h-[44px] flex-1"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="rounded-full bg-accent-orange text-white hover:bg-accent-orange/90 px-4 py-2 text-xs font-body font-semibold transition-colors shadow-md min-h-[44px] flex-1"
              >
                Ya, Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}

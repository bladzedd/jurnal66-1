import React from 'react';
import { ShieldCheck, Newspaper } from 'lucide-react';

export default function Footer() {
  return (
    <footer 
      style={{ backgroundColor: 'var(--color-paper-2)' }}
      className="border-t border-rule bg-paper-2 py-8 mt-12 text-xs font-body text-ink-muted"
    >
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <div className="font-display font-medium text-base tracking-tight text-ink flex items-center justify-center md:justify-start gap-2">
            <Newspaper className="w-4 h-4 text-accent shrink-0" />
            <span>Jurnal66 Task: Platform Pembelajaran Jurnalistik Digital</span>
          </div>
          <p className="text-ink-muted text-xs mt-1">
            Materi pembelajaran dasar jurnalistik & anti-hoaks berbasis kolaborasi tim.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <span className="bg-paper-3 text-ink-muted border border-rule rounded-full px-3 py-1 font-medium text-[11px] shadow-xs inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-accent-green" />
            <span>Ruang Redaksi Siswa Terverifikasi</span>
          </span>

          <span className="text-rule hidden sm:inline">|</span>

          <span className="bg-accent/15 text-accent border border-accent/30 rounded-full px-3 py-1 font-medium text-[11px] shadow-sm">
            Jurnal66 1.1 (Straight News)
          </span>
        </div>
      </div>
    </footer>
  );
}

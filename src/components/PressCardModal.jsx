import React, { useState } from 'react';
import { X, Award, CheckCircle2, Printer, Edit2, Shield, Users, Trash2, Crown } from 'lucide-react';
import { sound } from '../utils/sound';
import { ranks } from '../data/journalismData';
import { MascotIcon } from './ui/ProfessionalIcon';

const mascots = [
  { id: "mascot-1", label: "Investigasi" },
  { id: "mascot-2", label: "Reporter" },
  { id: "mascot-3", label: "Cetak & Lead" },
  { id: "mascot-4", label: "Breaking News" },
  { id: "mascot-5", label: "Cek Fakta" },
  { id: "mascot-6", label: "Dewan Etik" },
];

export default function PressCardModal({ team, onSaveTeam, onDisbandTeam, onClose }) {
  const [editing, setEditing] = useState(false);
  const [confirmDisband, setConfirmDisband] = useState(false);
  const [teamName, setTeamName] = useState(team?.name || "Tim Redaksi Jurnal66");
  const [selectedMascot, setSelectedMascot] = useState(team?.avatar || "mascot-1");

  // Stringified members for easy editing
  const [membersRaw, setMembersRaw] = useState(
    (team?.members || [])
      .map(m => typeof m === "string" ? m : `${m.name} (${m.classInfo || "-"})`)
      .join(", ")
  );

  const completedCount = team?.completedStages?.length || 0;
  const currentRank = ranks.slice().reverse().find(r => completedCount >= r.minScore) || ranks[0];

  const handleSave = (e) => {
    e.preventDefault();
    sound.playStamp();

    const prevMembers = team?.members || [];
    const parsedMembers = membersRaw
      .split(/[,;\n]/)
      .map(item => item.trim())
      .filter(Boolean)
      .map((item, idx) => {
        // Parse format "Nama (Kelas)" or just "Nama"
        const match = item.match(/^(.+?)\s*\((.+?)\)$/);
        const name = match ? match[1].trim() : item;
        const classInfo = match ? match[2].trim() : "Lintas Kelas";
        const existing = prevMembers.find(m => (typeof m === "string" ? m : m.name).toLowerCase() === name.toLowerCase());
        return {
          name,
          classInfo,
          role: existing?.role || (idx === 0 ? "Pemimpin Redaksi (Ketua Kelompok)" : "Wartawan Redaksi"),
          isLeader: existing ? !!existing.isLeader : idx === 0
        };
      });

    onSaveTeam({
      ...team,
      name: teamName.trim(),
      members: parsedMembers.length > 0 ? parsedMembers : team.members,
      avatar: selectedMascot
    });
    setEditing(false);
  };

  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  const currentMascotObj = mascots.find(m => m.id === (editing ? selectedMascot : team?.avatar)) || mascots[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="glass border border-rule w-full max-w-xl my-auto relative max-h-[94vh] flex flex-col rounded-3xl shadow-card overflow-hidden">
        {/* Modal Top Bar */}
        <div className="bg-paper-2/70 border-b border-rule px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-wider text-ink min-w-0">
            <Shield className="w-4 h-4 text-accent shrink-0" />
            <span className="truncate">Kartu Biro Pers Resmi</span>
          </div>
          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="w-10 h-10 rounded-full bg-paper-3/60 hover:bg-paper-3 text-ink flex items-center justify-center shrink-0 ml-2 transition-all min-h-[40px] min-w-[40px]"
            aria-label="Tutup Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* Group Press Card Physical Object */}
          <div className="glass p-5 sm:p-6 rounded-2xl border border-rule shadow-card relative overflow-hidden bg-gradient-to-br from-paper-card via-paper to-paper-2">
            {/* Lanyard Hole Clip */}
            <div className="w-14 h-3.5 bg-paper-3 border border-rule mx-auto -mt-6 mb-4 rounded-b-md flex items-center justify-center shadow-inner">
              <div className="w-6 h-1 bg-ink/30 rounded-full"></div>
            </div>

            {/* Press Pass Header */}
            <div className="border-b border-rule pb-3.5 mb-4 flex justify-between items-start gap-2">
              <div>
                <span className="font-mono text-[10px] tracking-widest text-ink-muted uppercase block">
                  JURNAL66 TASK • DEWAN PERS PENDIDIKAN
                </span>
                <h3 className="font-display font-medium text-xl sm:text-2xl text-ink tracking-tight">
                  KARTU BIRO PERS
                </h3>
              </div>
              <div className="text-right shrink-0">
                <span className="font-mono text-xs font-bold bg-accent/15 text-accent border border-accent/30 px-2.5 py-1 rounded-full inline-block">
                  {currentRank.badgeText}
                </span>
              </div>
            </div>

            {/* Press Pass Body */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
              {/* Photo Box / Mascot */}
              <div className="sm:col-span-1 flex flex-col items-center">
                <div className="w-24 h-28 border border-rule bg-accent/10 rounded-2xl shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                  <MascotIcon id={currentMascotObj.id} className="w-12 h-12 text-accent" />
                  <div className="absolute bottom-0 inset-x-0 bg-accent text-accent-ink text-[9px] font-mono font-bold text-center py-0.5">
                    BIRO RESMI
                  </div>
                </div>
                <span className="font-body text-xs text-ink-muted mt-1.5 font-medium text-center">
                  {currentMascotObj.label}
                </span>
              </div>

              {/* Data Fields */}
              <div className="sm:col-span-2 space-y-2.5">
                <div>
                  <span className="font-body text-[11px] text-ink-muted uppercase block">Nama Biro Kelompok:</span>
                  <div className="font-display font-medium text-lg sm:text-xl text-ink border-b border-dashed border-rule pb-1">
                    {team?.name}
                  </div>
                </div>

                {/* Team Members List (Name & Individual Class) */}
                <div>
                  <span className="font-body text-[11px] text-ink-muted uppercase block mb-1">
                    Susunan Anggota Biro:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {team?.members?.map((m, i) => {
                      const name = typeof m === "string" ? m : m.name;
                      const cls = typeof m === "string" ? null : m.classInfo;
                      const role = typeof m === "string" ? null : m.role;
                      const isLeader = typeof m === "string" ? i === 0 : m.isLeader;
                      return (
                        <div key={i} className="font-body text-xs bg-paper-2 border border-rule px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5 shadow-xs">
                          <span className="font-medium text-ink inline-flex items-center gap-1">
                            {isLeader && <Crown className="w-3 h-3 text-accent-orange" />}
                            <span>{name}</span>
                          </span>
                          {cls && <span className="bg-accent/15 text-accent text-[10px] font-mono px-1.5 py-0.2 rounded">{cls}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 font-body text-xs">
                  <div>
                    <span className="text-[10px] text-ink-muted block uppercase">Pangkat Redaksi:</span>
                    <span className="font-semibold text-ink">{currentRank.title}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-muted block uppercase">Progres Materi:</span>
                    <span className="font-semibold text-accent">{completedCount} / 3 Tahap Tuntas</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Badges Earned Section */}
            <div className="mt-4 pt-3.5 border-t border-rule">
              <span className="font-body text-[11px] uppercase tracking-wider text-ink-muted block mb-2">
                Lencana Siklus Berita Diraih:
              </span>
              <div className="flex flex-wrap gap-2">
                {team?.badges?.length > 0 ? (
                  team.badges.map((b, idx) => (
                    <span
                      key={idx}
                      className="font-body text-xs bg-accent-green/15 text-accent-green border border-accent-green/30 px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1.5 shadow-sm"
                    >
                      <Award className="w-3.5 h-3.5" />
                      {b}
                    </span>
                  ))
                ) : (
                  <span className="font-body text-xs text-ink-muted italic">
                    Belum ada lencana. Tuntaskan setiap materi investigasi straight news untuk membuka lencana!
                  </span>
                )}
              </div>
            </div>

            {/* Barcode & Stamp Footer */}
            <div className="mt-4 pt-3 border-t border-rule flex justify-between items-end text-xs font-mono text-ink-muted">
              <div>
                <div className="tracking-widest font-bold">||||| | |||| ||| |||||||</div>
                <div className="text-[10px]">ID: BIRO-PERS-{Math.abs((team?.name?.length || 5) * 883 + 1201)}</div>
              </div>
              <div className="neo-stamp bg-accent-green/15 text-accent-green border-accent-green/30 text-[10px] font-semibold">
                TERVERIFIKASI RESMI
              </div>
            </div>
          </div>

          {/* Edit Form Drawer */}
          {editing ? (
            <form onSubmit={handleSave} className="glass p-4 sm:p-5 rounded-2xl border border-rule space-y-3 shadow-card">
              <h4 className="font-display font-medium text-sm text-ink">Sunting Data Biro Kelompok</h4>
              
              <div>
                <label className="font-body text-xs text-ink-2 block mb-1">Nama Kelompok:</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  maxLength={35}
                  className="w-full p-2.5 text-xs sm:text-sm font-medium"
                  required
                />
              </div>

              <div>
                <label className="font-body text-xs text-ink-2 block mb-1">
                  Nama Anggota & Kelas (format: Nama (Kelas), pisahkan dengan koma):
                </label>
                <input
                  type="text"
                  value={membersRaw}
                  placeholder="Contoh: Ahmad (8A), Siti (9B), Budi (7C)"
                  onChange={(e) => setMembersRaw(e.target.value)}
                  className="w-full p-2.5 text-xs font-medium"
                  required
                />
                <span className="font-body text-[11px] text-ink-muted block mt-1">
                  Tulis nama diikuti tanda kurung kelas, contoh: <code>Rian (8A), Zahra (9B)</code>
                </span>
              </div>

              <div>
                <label className="font-body text-xs text-ink-2 block mb-1">
                  Pilih Lambang / Ikon Biro Pers:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {mascots.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => { sound.playClick(); setSelectedMascot(m.id); }}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                        selectedMascot === m.id 
                          ? "bg-accent/20 border-accent text-accent font-semibold" 
                          : "bg-paper-2 border-rule text-ink-muted hover:border-rule/80"
                      }`}
                    >
                      <MascotIcon id={m.id} className="w-6 h-6" />
                      <span className="text-[10px] truncate max-w-full">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="neo-btn p-2.5 px-4 bg-accent text-accent-ink hover:bg-accent-hi text-xs font-body font-semibold rounded-full shadow-sm min-h-[40px]"
                >
                  Simpan Perubahan
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded-full bg-paper-2 hover:bg-paper-3 border border-rule px-4 py-2 text-xs font-body font-medium text-ink min-h-[40px]"
                >
                  Batal
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-wrap gap-2.5 justify-between items-center pt-2">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { sound.playClick(); setEditing(true); }}
                  className="rounded-full bg-paper-2/70 hover:bg-paper-2 border border-rule text-xs font-body font-medium text-ink px-4 py-2.5 inline-flex items-center gap-1.5 transition-all shadow-sm min-h-[44px]"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Ubah Anggota / Kelas</span>
                </button>

                {onDisbandTeam && (
                  <button
                    onClick={() => { sound.playClick(); setConfirmDisband(true); }}
                    className="rounded-full bg-accent-red/10 hover:bg-accent-red hover:text-white border border-accent-red/30 text-xs font-body font-medium text-accent-red px-4 py-2.5 inline-flex items-center gap-1.5 transition-all shadow-sm min-h-[44px]"
                    title="Bubarkan biro ini secara permanen"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Bubarkan Biro</span>
                  </button>
                )}
              </div>

              <button
                onClick={handlePrint}
                className="rounded-full bg-accent text-accent-ink hover:bg-accent-hi text-xs font-body font-semibold px-5 py-2.5 inline-flex items-center gap-1.5 transition-all shadow-sm min-h-[44px]"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Kartu Biro Pers</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal to Disband Bureau (Dusk Modern-Minimal) */}
      {confirmDisband && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass p-6 sm:p-7 rounded-3xl border border-accent-red/40 max-w-md w-full space-y-4 shadow-card text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-accent-red/20 text-accent-red border border-accent-red/40 flex items-center justify-center mx-auto text-2xl shadow-sm">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="font-display font-medium text-xl text-ink">
                Bubarkan Biro Ini?
              </h3>
              <p className="font-body text-sm font-semibold text-accent-red">
                "{team?.name}"
              </p>
            </div>

            <p className="font-body text-xs text-ink-2 leading-relaxed bg-paper-2/50 border border-rule/70 p-3 rounded-xl">
              Yakin ingin membubarkan biro ini? Seluruh data anggota, riwayat liputan materi straight news, kas ({team?.coins || 0} koin), dan kode akses akan <strong>dihapus permanen</strong>.
            </p>

            <div className="flex gap-2.5 justify-center pt-2">
              <button
                type="button"
                onClick={() => setConfirmDisband(false)}
                className="rounded-full bg-paper-2 hover:bg-paper-3 border border-rule px-5 py-2.5 text-xs font-body font-medium text-ink transition-all min-h-[42px] flex-1"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playStamp();
                  setConfirmDisband(false);
                  if (onDisbandTeam) {
                    onDisbandTeam(team.id);
                  }
                }}
                className="rounded-full bg-accent-red text-white hover:bg-accent-red/90 px-5 py-2.5 text-xs font-body font-semibold transition-all shadow-md min-h-[42px] flex-1"
              >
                Ya, Bubarkan Biro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

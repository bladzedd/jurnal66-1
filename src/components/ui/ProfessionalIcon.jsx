import React, { useState } from 'react';
import { 
  ShieldCheck, GraduationCap, User, Stethoscope, Store, 
  Sparkles, Cpu, Award, Search, Mic, Newspaper, Zap, 
  CheckCheck, Scale, Coins, Crown, PenTool, Bookmark, 
  Megaphone, AlertTriangle, CheckCircle2, XCircle, Info,
  Layers, Users, Clock, ShieldAlert, BookOpen, Flame
} from 'lucide-react';

export const WITNESS_PHOTOS = {
  // Case 1: Gawai di Sekolah
  "witness_wakasek": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80", // Ibu Dra. Nurulita (Wakasek)
  "witness_osis": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=160&auto=format&fit=crop&q=80", // Rizky Pratama (Ketua OSIS)
  "witness_aisyah": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&auto=format&fit=crop&q=80", // Siti Aisyah (Siswi Mading)

  // Case 2: Kantin & UKS
  "witness_pedagang": "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=160&auto=format&fit=crop&q=80", // Mang Ujang (Pedagang Kantin)
  "witness_dokter_uks": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=160&auto=format&fit=crop&q=80", // dr. Farida Hanum (Dokter UKS)
  "witness_korban_dika": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&auto=format&fit=crop&q=80", // Dika Ardian (Siswa)

  // Case 3: Piala Bergilir
  "witness_pak_mahmud": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80", // Pak Mahmud (Kebersihan Aula)
  "witness_pembina_sains": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80", // Bu Ratna (Pembina)
  "witness_satpam": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=160&auto=format&fit=crop&q=80", // Pak Joko Santoso (Satpam)

  // Case 4: Voting Duta Pelajar & IT
  "witness_doni_it": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80", // Doni Prasetyo (Koordinator IT)
  "witness_salsabila": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80" // Salsabila Anindya (Kandidat Duta)
};

const getPhotoByRole = (text) => {
  if (text.includes("dokter") || text.includes("uks") || text.includes("medis") || text.includes("kesehatan")) {
    return "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=160&auto=format&fit=crop&q=80";
  }
  if (text.includes("guru") || text.includes("kepala") || text.includes("wakasek") || text.includes("pembina")) {
    return "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80";
  }
  if (text.includes("kantin") || text.includes("pedagang") || text.includes("warung") || text.includes("cilok") || text.includes("ujang")) {
    return "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=160&auto=format&fit=crop&q=80";
  }
  if (text.includes("satpam") || text.includes("keamanan") || text.includes("security")) {
    return "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=160&auto=format&fit=crop&q=80";
  }
  if (text.includes("it") || text.includes("komputer") || text.includes("voting") || text.includes("siber")) {
    return "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80";
  }
  if (text.includes("kebersihan") || text.includes("aula") || text.includes("mahmud")) {
    return "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80";
  }
  if (text.includes("duta") || text.includes("siswi") || text.includes("mading") || text.includes("aisyah")) {
    return "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&auto=format&fit=crop&q=80";
  }
  if (text.includes("osis") || text.includes("siswa") || text.includes("ketua")) {
    return "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=160&auto=format&fit=crop&q=80";
  }
  return "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80";
};

/**
 * Returns a photo avatar for witnesses with graceful fallback to professional Lucide icons.
 */
export function WitnessAvatar({ witnessId = "", role = "", avatar = "", className = "", iconClassName = "", size = 20 }) {
  const [hasError, setHasError] = useState(false);
  const text = `${witnessId} ${role} ${avatar}`.toLowerCase();
  const photoUrl = WITNESS_PHOTOS[witnessId] || getPhotoByRole(text);

  if (photoUrl && !hasError) {
    const finalClass = className || "w-9 h-9 rounded-xl";
    return (
      <div className={`relative shrink-0 overflow-hidden border border-rule/80 bg-paper-2 shadow-xs group ${finalClass}`}>
        <img
          src={photoUrl}
          alt={role || "Saksi Liputan"}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  let IconComponent = User;
  let bgClass = "bg-accent/15 text-accent border-accent/30";

  if (text.includes("satpam") || text.includes("keamanan") || text.includes("security") || text.includes("\u{1F46E}")) {
    IconComponent = ShieldCheck;
    bgClass = "bg-blue-500/15 text-blue-400 border-blue-500/30";
  } else if (text.includes("dokter") || text.includes("uks") || text.includes("medis") || text.includes("kesehatan") || text.includes("\u2695")) {
    IconComponent = Stethoscope;
    bgClass = "bg-rose-500/15 text-rose-400 border-rose-500/30";
  } else if (text.includes("guru") || text.includes("pembina") || text.includes("kepala") || text.includes("principal") || text.includes("\u{1F3EB}")) {
    IconComponent = GraduationCap;
    bgClass = "bg-amber-500/15 text-amber-400 border-amber-500/30";
  } else if (text.includes("it") || text.includes("komputer") || text.includes("voting") || text.includes("siber") || text.includes("\u{1F4BB}")) {
    IconComponent = Cpu;
    bgClass = "bg-cyan-500/15 text-cyan-400 border-cyan-500/30";
  } else if (text.includes("kantin") || text.includes("pedagang") || text.includes("warung") || text.includes("cilok") || text.includes("ujang") || text.includes("canteen")) {
    IconComponent = Store;
    bgClass = "bg-orange-500/15 text-orange-400 border-orange-500/30";
  } else if (text.includes("kebersihan") || text.includes("aula") || text.includes("mahmud") || text.includes("cleaning") || text.includes("\u{1F9F9}")) {
    IconComponent = Sparkles;
    bgClass = "bg-purple-500/15 text-purple-400 border-purple-500/30";
  } else if (text.includes("duta") || text.includes("finalis") || text.includes("juara") || text.includes("piala") || text.includes("trophy") || text.includes("\u{1F3C6}")) {
    IconComponent = Award;
    bgClass = "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
  } else if (text.includes("sains") || text.includes("peneliti") || text.includes("lab") || text.includes("biologi") || text.includes("science")) {
    IconComponent = BookOpen;
    bgClass = "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  } else {
    IconComponent = User;
    bgClass = "bg-accent/15 text-accent border-accent/30";
  }

  const wrapperClass = iconClassName ? className : "";
  const finalIconClass = iconClassName || className || "w-5 h-5";

  return (
    <div className={`rounded-xl border flex items-center justify-center p-1.5 shrink-0 shadow-sm ${bgClass} ${wrapperClass}`}>
      <IconComponent className={finalIconClass} size={size} />
    </div>
  );
}

/**
 * Returns a vector icon for Press Card Mascots.
 */
export function MascotIcon({ id, className = "w-6 h-6", size = 24 }) {
  switch (id) {
    case "mascot-1":
      return <Search className={`${className} text-accent`} size={size} />;
    case "mascot-2":
      return <Mic className={`${className} text-accent-orange`} size={size} />;
    case "mascot-3":
      return <Newspaper className={`${className} text-accent-green`} size={size} />;
    case "mascot-4":
      return <Flame className={`${className} text-rose-400`} size={size} />;
    case "mascot-5":
      return <CheckCheck className={`${className} text-cyan-400`} size={size} />;
    case "mascot-6":
      return <Scale className={`${className} text-purple-400`} size={size} />;
    default:
      return <Newspaper className={`${className} text-accent`} size={size} />;
  }
}

/**
 * Coin / Currency badge with clean Lucide Coins icon.
 */
export function CoinBadge({ amount = 0, className = "text-accent-orange" }) {
  return (
    <span className={`inline-flex items-center gap-1 font-semibold ${className}`}>
      <Coins className="w-3.5 h-3.5 shrink-0" />
      <span>{amount}</span>
    </span>
  );
}

/**
 * Strip raw unicode emojis from text logs for ultra-clean UI.
 */
export function stripEmojis(str = "") {
  if (typeof str !== "string") return str;
  return str
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

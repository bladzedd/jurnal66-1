import React from 'react';
import { 
  ShieldCheck, GraduationCap, User, Stethoscope, Store, 
  Sparkles, Cpu, Award, Search, Mic, Newspaper, Zap, 
  CheckCheck, Scale, Coins, Crown, PenTool, Bookmark, 
  Megaphone, AlertTriangle, CheckCircle2, XCircle, Info,
  Layers, Users, Clock, ShieldAlert, BookOpen, Flame
} from 'lucide-react';

/**
 * Returns a professional Lucide icon for witnesses based on their ID, role, or avatar key.
 */
export function WitnessAvatar({ witnessId, role = "", avatar = "", className = "", iconClassName = "", size = 20 }) {
  const text = `${witnessId} ${role} ${avatar}`.toLowerCase();

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

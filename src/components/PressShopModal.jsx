import React, { useState } from 'react';
import { 
  X, ShoppingBag, Shield, Zap, Send, ArrowRight, 
  HelpCircle, AlertTriangle, Users, Coins, History, CheckCircle2,
  Search, Lightbulb, Shuffle, Clock, Briefcase, ArrowRightLeft, Radio, Megaphone, Target
} from 'lucide-react';
import { sound } from '../utils/sound';
import { pressCardsCatalog } from '../data/pressShopData';
import { 
  getAllTeams, 
  buyShopCard, 
  useActionCard, 
  transferTeamCoins, 
  getPressWarLogs 
} from '../utils/storage';
import { stripEmojis } from './ui/ProfessionalIcon';

function renderCardIcon(cardId, className = "w-6 h-6") {
  switch (cardId) {
    case "card_lens":
      return <Search className={`${className} text-accent`} />;
    case "card_editor_hint":
      return <Lightbulb className={`${className} text-accent-yellow`} />;
    case "card_shield":
      return <Shield className={`${className} text-accent-green`} />;
    case "card_fake_distractor":
      return <Zap className={`${className} text-accent-red`} />;
    case "card_scramble_clues":
      return <Shuffle className={`${className} text-accent-orange`} />;
    case "card_deadline_panic":
      return <Clock className={`${className} text-accent-red`} />;
    default:
      return <ShoppingBag className={`${className} text-accent`} />;
  }
}

export default function PressShopModal({ team, onUpdateTeam, onClose }) {
  const [activeTab, setActiveTab] = useState("buy"); // "buy" | "inventory" | "transfer" | "logs"
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [targetTeamId, setTargetTeamId] = useState("");
  const [transferAmount, setTransferAmount] = useState(100);

  const allTeams = getAllTeams();
  const otherTeams = allTeams.filter(t => t.id !== team.id);
  const logs = getPressWarLogs();

  const handleBuy = (card) => {
    sound.playClick();
    const res = buyShopCard(team.id, card);
    if (res.success) {
      sound.playStamp();
      onUpdateTeam(res.team);
      setFeedbackMsg({ type: "success", text: `Berhasil membeli '${card.name}'! Kartu tersimpan di tab Inventaris.` });
    } else {
      sound.playError();
      setFeedbackMsg({ type: "error", text: res.message });
    }
  };

  const handleUseItem = (item) => {
    sound.playClick();
    if (item.targetType === "rival" && !targetTeamId) {
      sound.playError();
      setFeedbackMsg({ type: "error", text: "Pilih kelompok rival yang ingin kamu jadikan target sabotase!" });
      return;
    }

    const res = useActionCard(team.id, item.instanceId, targetTeamId);
    if (res.success) {
      sound.playStamp();
      onUpdateTeam(res.team);
      setFeedbackMsg({ type: "success", text: res.message });
    } else {
      sound.playError();
      setFeedbackMsg({ type: "error", text: res.message });
    }
  };

  const handleTransfer = (e) => {
    e.preventDefault();
    sound.playClick();
    if (!targetTeamId) {
      sound.playError();
      setFeedbackMsg({ type: "error", text: "Pilih kelompok penerima transfer koin!" });
      return;
    }

    const res = transferTeamCoins(team.id, targetTeamId, transferAmount);
    if (res.success) {
      sound.playSuccess();
      onUpdateTeam(res.team);
      setFeedbackMsg({ type: "success", text: res.message });
    } else {
      sound.playError();
      setFeedbackMsg({ type: "error", text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-paper border border-rule w-full max-w-2xl my-auto relative max-h-[92vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="bg-paper-2/70 border-b border-rule px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 font-body text-xs font-semibold text-ink min-w-0">
            <ShoppingBag className="w-4 h-4 text-accent-orange shrink-0" />
            <span className="truncate">Toko Peralatan & Bursa Strategi Pers</span>
          </div>
          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="w-10 h-10 rounded-full bg-paper-3/60 hover:bg-paper-3 text-ink flex items-center justify-center shrink-0 ml-2 transition-colors min-h-[40px] min-w-[40px] focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-hidden"
            aria-label="Tutup Toko"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Treasury Status Ribbon */}
        <div className="bg-paper-2/40 border-b border-rule px-4 py-2.5 flex flex-wrap justify-between items-center gap-2 font-body text-xs shrink-0">
          <div className="flex items-center gap-2 text-ink min-w-0">
            <span className="truncate">Biro: <strong className="font-semibold text-ink">{team.name}</strong></span>
            {team.activeShield && (
              <span className="bg-accent-green/15 text-accent-green border border-accent-green/30 px-2 py-0.5 rounded-full text-[10px] font-medium inline-flex items-center gap-1 shrink-0">
                <Shield className="w-3 h-3" /> Perisai
              </span>
            )}
            {team.activeDebuffs?.length > 0 && (
              <span className="bg-accent-red/15 text-accent-red border border-accent-red/30 px-2 py-0.5 rounded-full text-[10px] font-medium animate-pulse motion-reduce:animate-none shrink-0 inline-flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Sabotase ({team.activeDebuffs.length})</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 bg-accent-orange/15 border border-accent-orange/30 text-accent-orange rounded-full px-3 py-1.5 font-semibold text-xs shrink-0">
            <Coins className="w-3.5 h-3.5" />
            <span>Kas:</span>
            <span>{team.coins || 0} Koin</span>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-rule bg-paper-2/30 p-1.5 gap-1.5 font-body text-xs font-medium overflow-x-auto shrink-0 no-scrollbar touch-pan-x">
          <button
            onClick={() => { sound.playClick(); setActiveTab("buy"); setFeedbackMsg(null); }}
            className={`py-2 px-3.5 rounded-full flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors min-h-[40px] ${
              activeTab === "buy" ? "bg-accent text-accent-ink font-semibold shadow-sm" : "hover:bg-paper-2 text-ink-muted hover:text-ink"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Beli Alat</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveTab("inventory"); setFeedbackMsg(null); }}
            className={`py-2 px-3.5 rounded-full flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors min-h-[40px] ${
              activeTab === "inventory" ? "bg-accent text-accent-ink font-semibold shadow-sm" : "hover:bg-paper-2 text-ink-muted hover:text-ink"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Tas ({team.inventory?.length || 0})</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveTab("transfer"); setFeedbackMsg(null); }}
            className={`py-2 px-3.5 rounded-full flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors min-h-[40px] ${
              activeTab === "transfer" ? "bg-accent text-accent-ink font-semibold shadow-sm" : "hover:bg-paper-2 text-ink-muted hover:text-ink"
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Transfer Koin</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveTab("logs"); setFeedbackMsg(null); }}
            className={`py-2 px-3.5 rounded-full flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors min-h-[40px] ${
              activeTab === "logs" ? "bg-accent text-accent-ink font-semibold shadow-sm" : "hover:bg-paper-2 text-ink-muted hover:text-ink"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Kawat Radar ({logs.length})</span>
          </button>
        </div>

        {/* Notifications Bar */}
        {feedbackMsg && (
          <div className={`p-3 border-b text-xs font-body font-medium flex items-center justify-between shrink-0 ${
            feedbackMsg.type === "success" 
              ? "bg-accent-green/15 border-accent-green/30 text-accent-green" 
              : "bg-accent-red/15 border-accent-red/30 text-accent-red"
          }`}>
            <div className="flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5 shrink-0" />
              <span>{feedbackMsg.text}</span>
            </div>
            <button onClick={() => setFeedbackMsg(null)} className="underline ml-2">Tutup</button>
          </div>
        )}

        {/* Tab Content */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto">
          {/* TAB 1: BUY CARDS */}
          {activeTab === "buy" && (
            <div className="space-y-4">
              <p className="font-body text-xs text-ink-muted">
                Beli kartu strategi redaksi untuk membantu tim menyelesaikan tugas investigasi, atau luncurkan power-up debuff ke kelompok rival!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pressCardsCatalog.map((card) => {
                  const canAfford = (team.coins || 0) >= card.price;
                  const isSabotage = card.category === "sabotage";

                  return (
                    <div 
                      key={card.id}
                      className={`glass p-4 rounded-2xl border flex flex-col justify-between transition-colors ${
                        isSabotage 
                          ? "border-accent-red/30 hover:border-accent-red/60" 
                          : "border-rule hover:border-accent/40"
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div className="w-10 h-10 rounded-xl bg-paper-2 border border-rule flex items-center justify-center shadow-xs">
                            {renderCardIcon(card.id)}
                          </div>
                          <span className="font-body text-xs font-semibold bg-accent-orange/15 text-accent-orange border border-accent-orange/30 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                            <Coins className="w-3 h-3" />
                            <span>{card.price} Koin</span>
                          </span>
                        </div>
                        <h4 className="font-display font-medium text-sm text-ink">
                          {card.name}
                        </h4>
                        <span className="font-body text-[11px] font-semibold text-accent-orange block mt-0.5">
                          {card.summary}
                        </span>
                        <p className="font-body text-xs text-ink-2 mt-1.5 leading-relaxed">
                          {card.description}
                        </p>
                      </div>

                      <div className="mt-3.5 pt-2.5 border-t border-rule/60 flex justify-between items-center">
                        <span className="font-body text-[10px] text-ink-muted">
                          {card.targetType === "self" ? (
                            <span className="inline-flex items-center gap-1 text-accent-green">
                              <Shield className="w-3 h-3" />
                              <span>Biro Sendiri</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-accent-red">
                              <Target className="w-3 h-3" />
                              <span>Target Rival</span>
                            </span>
                          )}
                        </span>

                        <button
                          onClick={() => handleBuy(card)}
                          disabled={!canAfford}
                          className={`rounded-full px-3.5 py-1.5 text-xs font-body font-semibold transition-colors min-h-[36px] ${
                            canAfford 
                              ? isSabotage 
                                ? "bg-accent-red/20 text-accent-red border border-accent-red/40 hover:bg-accent-red/30" 
                                : "bg-accent text-accent-ink hover:bg-accent-hi"
                              : "bg-paper-2 text-ink-muted cursor-not-allowed opacity-50 border border-rule"
                          }`}
                        >
                          {canAfford ? "Beli Kartu" : "Koin Kurang"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: INVENTORY & USE CARDS */}
          {activeTab === "inventory" && (
            <div className="space-y-4">
              <p className="font-body text-xs text-ink-muted">
                Kartu yang sudah dibeli oleh biromu. Aktifkan perisai pertahanan atau pilih kelompok lawan untuk disabotase!
              </p>

              {team.inventory?.length > 0 ? (
                <div className="space-y-3">
                  {/* Rival Target Selector if team has sabotage cards */}
                  {team.inventory.some(i => i.targetType === "rival") && (
                    <div className="glass p-3.5 rounded-2xl border border-accent-red/40 bg-accent-red/5 space-y-2">
                      <label className="font-body text-xs font-semibold text-ink block flex items-center gap-1.5">
                        <Target className="w-4 h-4 text-accent-red" />
                        <span>Pilih Kelompok Rival untuk Diserang:</span>
                      </label>
                      <select
                        value={targetTeamId}
                        onChange={(e) => setTargetTeamId(e.target.value)}
                        className="w-full p-2.5 text-xs font-body font-medium"
                      >
                        <option value="">-- Pilih Kelompok Sasaran --</option>
                        {otherTeams.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} (Kas: {t.coins || 0} Koin)
                          </option>
                        ))}
                      </select>
                      {otherTeams.length === 0 && (
                        <span className="font-body text-[11px] text-accent-red block">
                          *Belum ada kelompok lain yang terdaftar di kelas. Guru atau murid lain dapat mendaftarkan kelompok baru di menu masuk!
                        </span>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {team.inventory.map((item) => {
                      const isSabotage = item.targetType === "rival";

                      return (
                        <div
                          key={item.instanceId}
                          className="glass p-3.5 rounded-2xl border border-rule flex flex-col justify-between shadow-sm"
                        >
                          <div>
                            <div className="flex items-center gap-2.5 mb-1.5">
                              <div className="w-9 h-9 rounded-xl bg-paper-2 border border-rule flex items-center justify-center shadow-xs shrink-0">
                                {renderCardIcon(item.cardId || item.id, "w-5 h-5")}
                              </div>
                              <div className="truncate">
                                <h4 className="font-display font-medium text-xs sm:text-sm text-ink truncate">{item.name}</h4>
                                <span className="font-body text-[11px] text-accent-orange font-medium block">{item.summary}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-rule/60 flex justify-end">
                            <button
                              onClick={() => handleUseItem(item)}
                              className={`rounded-full px-4 py-1.5 text-xs font-body font-semibold transition-colors min-h-[36px] ${
                                isSabotage
                                  ? "bg-accent-red text-white hover:bg-accent-red/90 shadow-sm"
                                  : "bg-accent-green text-white hover:bg-accent-green/90 shadow-sm"
                              }`}
                            >
                              <span>{isSabotage ? "Luncurkan Sabotase" : "Gunakan Sekarang"}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 font-body text-xs text-ink-muted border border-dashed border-rule rounded-2xl p-6 glass">
                  Inventaris tim masih kosong. Buka tab <strong>[Beli Alat]</strong> untuk memperkuat biromu!
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TRANSFER COINS */}
          {activeTab === "transfer" && (
            <div className="space-y-4">
              <p className="font-body text-xs text-ink-muted">
                Dukung kelompok mitra atau lakukan barter bantuan informasi dengan mentransfer Koin Redaksi!
              </p>

              <form onSubmit={handleTransfer} className="glass p-4 sm:p-5 rounded-2xl border border-rule space-y-3.5 shadow-card">
                <div>
                  <label className="font-body text-xs font-semibold text-ink block mb-1">
                    Pilih Kelompok Penerima Transfer:
                  </label>
                  <select
                    value={targetTeamId}
                    onChange={(e) => setTargetTeamId(e.target.value)}
                    className="w-full p-2.5 text-xs font-body font-medium"
                    required
                  >
                    <option value="">-- Pilih Kelompok Penerima --</option>
                    {otherTeams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} (Kas saat ini: {t.coins || 0} Koin)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-body text-xs font-semibold text-ink block mb-1">
                    Jumlah Koin Ditransfer (Maks: {team.coins || 0} Koin):
                  </label>
                  <input
                    type="number"
                    min="10"
                    max={team.coins || 0}
                    step="10"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full p-2.5 text-sm font-body font-semibold"
                    required
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={(team.coins || 0) < 10 || otherTeams.length === 0}
                    className="neo-btn p-3 px-6 bg-accent text-accent-ink hover:bg-accent-hi font-body font-semibold text-xs sm:text-sm rounded-full gap-2 w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                  >
                    <Send className="w-4 h-4 text-accent-ink" />
                    <span>Kirim Transfer Koin Pers</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: PRESS WAR LIVE LOGS */}
          {activeTab === "logs" && (
            <div className="space-y-3">
              <p className="font-body text-xs text-ink-muted">
                Kawat berita radar pers: memantau aktivitas transaksi, aliansi, dan dinamika kompetisi antar-biro redaksi secara langsung!
              </p>

              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {logs.map((log) => {
                  let badgeClass = "bg-paper-2/40 border-rule/70 text-ink-2";
                  if (log.type === "sabotage") badgeClass = "bg-accent-red/10 border-accent-red/30 text-accent-red";
                  if (log.type === "defense") badgeClass = "bg-accent/10 border-accent/30 text-accent";
                  if (log.type === "cooperation") badgeClass = "bg-accent-green/10 border-accent-green/30 text-accent-green";

                  return (
                    <div
                      key={log.id}
                      className={`p-3 rounded-xl border font-body text-xs flex justify-between items-start gap-2 shadow-xs ${badgeClass}`}
                    >
                      <span className="font-medium leading-relaxed">{log.text}</span>
                      <span className="text-[10px] text-ink-muted shrink-0 font-mono mt-0.5">{log.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

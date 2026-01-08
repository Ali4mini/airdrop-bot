import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../store/gameStore";
import { useTelegram } from "../hooks/useTelegram";
import { api } from "../api/client";
import type { UpgradeType } from "../types";
import { useUIStore } from "../store/uiStore";

// --- CONFIGURATION FOR MINING CARDS ---
// Since the backend doesn't store card levels (yet), we treat these as
// repeatable "Assets" you can buy multiple times to stack profit.
const MINING_CARDS = [
  {
    id: "fan",
    title: "Cooling Fan",
    description: "Basic air flow",
    profit: 50,
    cost: 500,
    icon: "💨",
  },
  {
    id: "gpu",
    title: "GTX 1060",
    description: "Entry level mining",
    profit: 250,
    cost: 2000,
    icon: "📼",
  },
  {
    id: "rig",
    title: "Mining Rig",
    description: "Serious hardware",
    profit: 1000,
    cost: 10000,
    icon: "🖥️",
  },
  {
    id: "server",
    title: "Data Center",
    description: "Industrial scale",
    profit: 5000,
    cost: 45000,
    icon: "🏢",
  },
  {
    id: "ai",
    title: "Quantum AI",
    description: "Future tech",
    profit: 20000,
    cost: 200000,
    icon: "🤖",
  },
];

type Tab = "boosters" | "mining";

export const Boost = ({ onBack }: { onBack: () => void }) => {
  const {
    points,
    multitapLevel,
    energyLimitLevel,
    rechargeSpeedLevel,
    setGameState,
  } = useGameStore();

  const { user } = useTelegram();
  const { showNotification } = useUIStore();

  const [activeTab, setActiveTab] = useState<Tab>("boosters");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // --- 1. HANDLE TAP UPGRADES ---
  const calculateBoostCost = (type: UpgradeType, level: number) => {
    switch (type) {
      case "multitap":
        return 1000 * level ** 2;
      case "energy_limit":
        return 500 * level ** 1.5;
      case "recharge_speed":
        return 2000 * level ** 2.5;
      default:
        return 9999999;
    }
  };

  const handleBoostUpgrade = async (
    type: UpgradeType,
    currentLevel: number,
  ) => {
    if (!user || processingId) return;
    const cost = calculateBoostCost(type, currentLevel);
    if (points < cost) {
      showNotification("Not enough points!", "error");
      return;
    }

    setProcessingId(type);
    try {
      const newState = await api.buyUpgrade(user.id, type);
      setGameState(newState);
      showNotification("Boost Upgraded!", "success");
      haptic("success");
    } catch (error) {
      showNotification("Failed to upgrade.", "error");
      haptic("error");
    } finally {
      setProcessingId(null);
    }
  };

  // --- 2. HANDLE MINING CARDS ---
  const handleBuyCard = async (card: (typeof MINING_CARDS)[0]) => {
    if (!user || processingId) return;
    if (points < card.cost) {
      showNotification(`Need ${card.cost.toLocaleString()} coins!`, "error");
      haptic("error");
      return;
    }

    setProcessingId(card.id);
    try {
      // Call the endpoint we created earlier
      const newState = await api.buyMiningUpgrade(
        user.id,
        card.cost,
        card.profit,
      );
      setGameState(newState);
      showNotification(`Bought ${card.title}!`, "success");
      haptic("success");
    } catch (error) {
      showNotification("Transaction failed.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const haptic = (type: "success" | "error" | "light") => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred(type as any);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: "100%" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed inset-0 z-50 flex flex-col bg-[#0F0F0F] overflow-hidden"
    >
      {/* HEADER WITH BALANCE */}
      <div className="pt-6 pb-6 px-6 bg-gradient-to-b from-black/80 to-transparent z-10">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl active:scale-95 transition-all text-white/70 hover:text-white"
          >
            ✕
          </button>
          <h1 className="text-xl font-bold text-white tracking-wide">Market</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        <div className="text-center">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">
            Total Balance
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl">🦄</span>
            <span className="text-4xl font-black text-white tracking-tighter drop-shadow-lg">
              {Math.floor(points).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="px-6 mb-4">
        <div className="bg-white/5 p-1 rounded-2xl flex relative overflow-hidden">
          {/* Animated Background Pill */}
          <motion.div
            className="absolute top-1 bottom-1 bg-white/10 rounded-xl shadow-lg"
            initial={false}
            animate={{
              left: activeTab === "boosters" ? "4px" : "50%",
              width: "calc(50% - 4px)",
              x: activeTab === "mining" ? "0%" : "0%",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />

          <button
            onClick={() => setActiveTab("boosters")}
            className={`flex-1 py-3 relative z-10 text-sm font-bold text-center transition-colors ${activeTab === "boosters" ? "text-white" : "text-gray-500"}`}
          >
            Boosters
          </button>
          <button
            onClick={() => setActiveTab("mining")}
            className={`flex-1 py-3 relative z-10 text-sm font-bold text-center transition-colors ${activeTab === "mining" ? "text-white" : "text-gray-500"}`}
          >
            Mining Cards
          </button>
        </div>
      </div>

      {/* SCROLLABLE LIST */}
      <div className="flex-1 overflow-y-auto px-6 pb-20 space-y-3">
        <AnimatePresence mode="wait">
          {activeTab === "boosters" ? (
            <motion.div
              key="boosters"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              <UpgradeCard
                id="multitap"
                icon="👆"
                title="Multitap"
                description="Increase points per tap"
                meta={`Lvl ${multitapLevel}`}
                cost={Math.floor(calculateBoostCost("multitap", multitapLevel))}
                userBalance={points}
                onBuy={() => handleBoostUpgrade("multitap", multitapLevel)}
                isLoading={processingId === "multitap"}
              />
              <UpgradeCard
                id="energy_limit"
                icon="🔋"
                title="Energy Limit"
                description="+500 Max Energy"
                meta={`Lvl ${energyLimitLevel}`}
                cost={Math.floor(
                  calculateBoostCost("energy_limit", energyLimitLevel),
                )}
                userBalance={points}
                onBuy={() =>
                  handleBoostUpgrade("energy_limit", energyLimitLevel)
                }
                isLoading={processingId === "energy_limit"}
              />
              <UpgradeCard
                id="recharge_speed"
                icon="⚡"
                title="Recharge Speed"
                description="+1 Energy per second"
                meta={`Lvl ${rechargeSpeedLevel}`}
                cost={Math.floor(
                  calculateBoostCost("recharge_speed", rechargeSpeedLevel),
                )}
                userBalance={points}
                onBuy={() =>
                  handleBoostUpgrade("recharge_speed", rechargeSpeedLevel)
                }
                isLoading={processingId === "recharge_speed"}
              />
            </motion.div>
          ) : (
            <motion.div
              key="mining"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-3"
            >
              {/* Render Mining Cards */}
              {MINING_CARDS.map((card) => (
                <UpgradeCard
                  key={card.id}
                  id={card.id}
                  icon={card.icon}
                  title={card.title}
                  description={card.description}
                  // GREEN Text for Profit
                  meta={
                    <span className="text-green-400 font-bold">
                      +{card.profit}/hr
                    </span>
                  }
                  cost={card.cost}
                  userBalance={points}
                  onBuy={() => handleBuyCard(card)}
                  isLoading={processingId === card.id}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// --- GENERIC UPGRADE CARD COMPONENT ---
interface UpgradeCardProps {
  id: string;
  icon: string;
  title: string;
  description: string;
  meta: React.ReactNode; // Changed from 'level' number to Node so we can pass strings/components
  cost: number;
  userBalance: number;
  onBuy: () => void;
  isLoading: boolean;
}

const UpgradeCard = ({
  icon,
  title,
  description,
  meta,
  cost,
  userBalance,
  onBuy,
  isLoading,
}: UpgradeCardProps) => {
  const canAfford = userBalance >= cost;

  return (
    <button
      onClick={onBuy}
      disabled={!canAfford || isLoading}
      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 group
        ${
          canAfford
            ? "bg-white/5 border-white/10 active:scale-[0.98] active:bg-white/10 hover:border-yellow-500/30 shadow-lg hover:shadow-yellow-500/10"
            : "bg-white/5 border-white/5 opacity-50 cursor-not-allowed grayscale"
        }
      `}
    >
      <div className="flex items-center gap-4">
        {/* Icon Box */}
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl shadow-inner border border-white/5 ${canAfford ? "bg-black/40" : "bg-black/20"}`}
        >
          {icon}
        </div>

        {/* Text Info */}
        <div className="text-left">
          <h3 className="text-white font-bold text-base leading-tight">
            {title}
          </h3>
          <div className="text-[11px] text-gray-400 font-medium mt-1 flex items-center gap-2">
            <span>{description}</span>
            <span className="text-white/20">•</span>
            {/* Meta is now flexible (Lvl 5 OR +100/hr) */}
            <span className="text-yellow-500">{meta}</span>
          </div>
        </div>
      </div>

      {/* Price / Button */}
      <div className="flex flex-col items-end gap-1 min-w-[80px]">
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
        ) : (
          <div
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border w-full
            ${
              canAfford
                ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-500"
                : "bg-white/5 border-white/10 text-gray-500"
            }
          `}
          >
            <span className="text-[10px]">🦄</span>
            <span className="text-xs font-black">
              {/* K/M Formatting */}
              {cost >= 1000000
                ? (cost / 1000000).toFixed(1) + "M"
                : cost >= 1000
                  ? (cost / 1000).toFixed(1) + "k"
                  : cost}
            </span>
          </div>
        )}
      </div>
    </button>
  );
};

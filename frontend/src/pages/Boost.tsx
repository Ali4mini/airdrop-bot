import { useState } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../store/gameStore";
import { useTelegram } from "../hooks/useTelegram";
import { api } from "../api/client";
import type { UpgradeType } from "../types"; // Ensure this is defined in types/index.ts
import { useUIStore } from "../store/uiStore";

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
  const [processingId, setProcessingId] = useState<string | null>(null);

  // --- PRICING FORMULA (MUST MATCH BACKEND) ---
  const calculateCost = (type: UpgradeType, level: number) => {
    switch (type) {
      case "multitap":
        return 1000 * level ** 2;
      case "energy_limit":
        return 500 * level ** 1.5; // Using 1.5 allows cheaper early upgrades
      case "recharge_speed":
        return 2000 * level ** 2.5; // Expensive because it's powerful
      default:
        return 9999999;
    }
  };

  const handleUpgrade = async (type: UpgradeType, currentLevel: number) => {
    if (!user || processingId) return;

    const cost = calculateCost(type, currentLevel);
    if (points < cost) {
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred("error");
      }
      showNotification("Not enough points! Keep tapping.", "error");
      return;
    }

    setProcessingId(type);

    try {
      // 1. Call Backend
      const newState = await api.buyUpgrade(user.id, type);

      // 2. Update Store
      setGameState(newState);

      // 3. Success Feedback
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");
      }
      showNotification("Upgrade Successful! Level Up.", "success");
    } catch (error) {
      console.error("Upgrade failed:", error);
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred("error");
      }
      showNotification("Connection Failed. Try again.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: "100%" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed inset-0 z-50 flex flex-col p-6 bg-black/80 backdrop-blur-xl overflow-y-auto"
    >
      {/* HEADER */}
      <div className="flex items-center mb-8 pt-4">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl active:scale-95 transition-transform"
        >
          <span className="text-white text-xl">✕</span>
        </button>
        <h1 className="text-2xl font-bold text-white ml-4">Boosters</h1>
      </div>

      {/* BALANCE CARD */}
      <div className="text-center mb-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg py-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50" />
        <p className="text-gray-400 text-xs uppercase tracking-[0.2em] mb-2 font-bold">
          Available Balance
        </p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-4xl filter drop-shadow-lg">🦄</span>
          <span className="text-5xl font-black text-white drop-shadow-md tracking-tighter">
            {Math.floor(points).toLocaleString()}
          </span>
        </div>
      </div>

      {/* UPGRADES LIST */}
      <div className="space-y-4 pb-12">
        <h2 className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] px-2 mb-2">
          Improvements
        </h2>

        {/* 1. MULTITAP */}
        <UpgradeCard
          id="multitap"
          icon="👆"
          title="Multitap"
          description="Increase points per tap"
          level={multitapLevel}
          cost={Math.floor(calculateCost("multitap", multitapLevel))}
          userBalance={points}
          onBuy={() => handleUpgrade("multitap", multitapLevel)}
          isLoading={processingId === "multitap"}
        />

        {/* 2. ENERGY LIMIT */}
        <UpgradeCard
          id="energy_limit"
          icon="🔋"
          title="Energy Limit"
          description="+500 Max Energy"
          level={energyLimitLevel}
          cost={Math.floor(calculateCost("energy_limit", energyLimitLevel))}
          userBalance={points}
          onBuy={() => handleUpgrade("energy_limit", energyLimitLevel)}
          isLoading={processingId === "energy_limit"}
        />

        {/* 3. RECHARGE SPEED */}
        <UpgradeCard
          id="recharge_speed"
          icon="⚡"
          title="Recharging Speed"
          description="+1 Energy per second"
          level={rechargeSpeedLevel}
          cost={Math.floor(calculateCost("recharge_speed", rechargeSpeedLevel))}
          userBalance={points}
          onBuy={() => handleUpgrade("recharge_speed", rechargeSpeedLevel)}
          isLoading={processingId === "recharge_speed"}
        />
      </div>
    </motion.div>
  );
};

// --- SUB-COMPONENT ---
interface UpgradeCardProps {
  id: string;
  icon: string;
  title: string;
  description: string;
  level: number;
  cost: number;
  userBalance: number;
  onBuy: () => void;
  isLoading: boolean;
}

const UpgradeCard = ({
  icon,
  title,
  description,
  level,
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
            ? "bg-white/5 border-white/10 active:scale-[0.98] active:bg-white/10 hover:border-yellow-500/30"
            : "bg-white/5 border-white/5 opacity-50 cursor-not-allowed grayscale"
        }
      `}
    >
      <div className="flex items-center gap-4">
        {/* Icon Box */}
        <div className="w-14 h-14 bg-black/40 rounded-xl flex items-center justify-center text-3xl border border-white/5 shadow-inner">
          {icon}
        </div>

        {/* Text Info */}
        <div className="text-left">
          <h3 className="text-white font-bold text-base leading-tight">
            {title}
          </h3>
          <p className="text-[11px] text-gray-400 font-medium mt-1">
            {description} <span className="text-white/30">•</span>{" "}
            <span className="text-yellow-500">Lvl {level}</span>
          </p>
        </div>
      </div>

      {/* Price / Button */}
      <div className="flex flex-col items-end gap-1">
        {isLoading ? (
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border 
              ${canAfford ? "bg-yellow-500/20 border-yellow-500/30" : "bg-white/5 border-white/10"}
            `}
            >
              <span className="text-xs">🦄</span>
              <span
                className={`text-xs font-black ${canAfford ? "text-white" : "text-gray-500"}`}
              >
                {/* Format large numbers (e.g. 1.5k) */}
                {cost >= 1000 ? (cost / 1000).toFixed(1) + "k" : cost}
              </span>
            </div>
          </>
        )}
      </div>
    </button>
  );
};

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useGameStore } from "../store/gameStore";
import { useTelegram } from "../hooks/useTelegram";
import { api } from "../api/client";
import { Coin } from "../components/Coin";
import { Boost } from "./Boost";
import { ModernTicker } from "../components/ModernTicker";

export const Home = () => {
  const [currentView, setCurrentView] = useState<"game" | "boost">("game");
  const balanceControls = useAnimation();
  const { user, expand, hapticFeedback } = useTelegram();

  const {
    points,
    energy,
    maxEnergy,
    incrementPoints,
    decrementEnergy,
    restoreEnergy,
    setGameState,
    tapValue,
    energyRegen,
    levelName,
    progress,
    profitPerHour,
    tickPassivePoints,
  } = useGameStore();

  const unsyncedTaps = useRef(0);
  const lastTapRef = useRef<number>(0);
  const energyRef = useRef(energy);
  const tapValueRef = useRef(tapValue);

  useEffect(() => {
    energyRef.current = energy;
  }, [energy]);
  useEffect(() => {
    tapValueRef.current = tapValue;
  }, [tapValue]);

  // --- CRITICAL: EXPAND ONLY ONCE ON MOUNT ---
  useEffect(() => {
    expand();
    // Also disable vertical swipes to prevent "pull to close" glitches
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.disableVerticalSwipes();
    }
  }, [expand]);

  useEffect(() => {
    if (user?.id) {
      api
        .login(user)
        .then((data) => setGameState(data.gameState))
        .catch(console.error);
    }
  }, [user?.id, setGameState]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const tapsToSend = unsyncedTaps.current;
      if (user?.id && tapsToSend > 0) {
        try {
          const serverState = await api.syncTaps(user.id, tapsToSend);
          unsyncedTaps.current -= tapsToSend;
          if (Date.now() - lastTapRef.current > 2000) {
            setGameState(serverState);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [user?.id, setGameState]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (energyRef.current < maxEnergy) restoreEnergy(energyRegen);
    }, 1000);
    return () => clearInterval(timer);
  }, [restoreEnergy, energyRegen, maxEnergy]);

  useEffect(() => {
    if (profitPerHour === 0) return;
    const interval = setInterval(() => tickPassivePoints(), 1000);
    return () => clearInterval(interval);
  }, [profitPerHour, tickPassivePoints]);

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 40) return;
    lastTapRef.current = now;

    if (energyRef.current < tapValueRef.current) return;

    incrementPoints();
    decrementEnergy();
    unsyncedTaps.current += 1;

    // Trigger haptic feedback via the hook
    hapticFeedback("light");

    balanceControls.start({
      scale: [1, 1.02, 1],
      transition: { duration: 0.1 },
    });
  }, [incrementPoints, decrementEnergy, balanceControls, hapticFeedback]);

  const formatProfit = (num: number) => {
    if (num >= 1000000) return `+${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `+${(num / 1000).toFixed(1)}k`;
    return `+${num}`;
  };

  return (
    <div className="h-full w-full flex flex-col items-center relative overflow-hidden text-white select-none touch-none">
      <AnimatePresence mode="wait">
        {currentView === "game" ? (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex flex-col items-center z-10"
          >
            {/* Header */}
            <div
              className="w-full flex flex-col items-center shrink-0 z-20 px-4 pt-4 pb-2"
              style={{ paddingTop: "calc(12px + env(safe-area-inset-top))" }}
            >
              <div className="grid grid-cols-3 gap-2 w-full max-w-sm mb-4">
                <StatBox
                  label="Profit/Hr"
                  value={formatProfit(profitPerHour)}
                  isProfit
                />
                <div className="bg-black/30 backdrop-blur-md rounded-xl p-2 border border-white/10 flex flex-col items-center justify-between shadow-xl w-full">
                  <span className="text-[9px] text-gray-400 uppercase font-bold tracking-widest">
                    League
                  </span>
                  <span className="text-sm font-black text-yellow-500 truncate max-w-full">
                    {levelName}
                  </span>
                  <div className="w-full h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-yellow-500"
                      style={{
                        width: `${progress}%`,
                        transition: "width 0.5s",
                      }}
                    />
                  </div>
                </div>
                <StatBox
                  label="Recharge"
                  value={`+${energyRegen}/s`}
                  isEnergy
                />
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-yellow-500/80 uppercase tracking-widest mb-1">
                  Total Balance
                </span>
                <div className="flex items-center gap-3">
                  <img
                    src="/assets/1770311369-removebg-preview.png"
                    className="w-10 h-10 object-contain"
                    alt="Coin"
                  />
                  <motion.div
                    animate={balanceControls}
                    className="text-4xl font-black"
                  >
                    <ModernTicker value={points} />
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Middle Section (Coin) */}
            <div className="flex-1 w-full min-h-0 flex items-center justify-center z-10 p-4">
              <div
                className="relative"
                style={{
                  width: "min(80vw, 42vh)",
                  height: "min(80vw, 42vh)",
                  maxWidth: "340px",
                  maxHeight: "340px",
                }}
              >
                <Coin onTap={handleTap} tapValue={tapValue} />
              </div>
            </div>

            {/* Footer */}
            <div
              className="w-full max-w-sm px-6 mt-auto shrink-0 z-20"
              style={{
                paddingBottom: "calc(20px + env(safe-area-inset-bottom))",
              }}
            >
              <div className="flex justify-between items-end mb-3">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    Energy
                  </span>
                  <span className="text-sm font-bold flex items-center gap-1">
                    <span className="text-yellow-500">⚡</span>
                    {Math.floor(energy)} / {maxEnergy}
                  </span>
                </div>
                <button
                  onClick={() => setCurrentView("boost")}
                  className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 active:scale-95 transition-all shadow-lg"
                >
                  <span className="text-xs font-bold uppercase tracking-tight">
                    🚀 Boost
                  </span>
                </button>
              </div>

              <div className="w-full h-3 bg-black/40 rounded-full border border-white/10 overflow-hidden relative">
                <div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-yellow-600 to-yellow-300 w-full origin-left"
                  style={{
                    transform: `scaleX(${Math.max(0, Math.min(1, energy / maxEnergy))})`,
                    transition: "transform 0.1s linear",
                    willChange: "transform",
                  }}
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <Boost key="boost" onBack={() => setCurrentView("game")} />
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper for Stats
const StatBox = ({ label, value, isEnergy, isProfit }: any) => (
  <div className="bg-black/30 backdrop-blur-md rounded-xl p-2 border border-white/10 flex flex-col items-center shadow-xl w-full">
    <span className="text-[9px] text-gray-400 uppercase font-bold tracking-widest text-center">
      {label}
    </span>
    <span
      className={`text-sm font-black flex items-center gap-1 ${isProfit ? "text-green-400" : "text-white"}`}
    >
      {isEnergy && <span className="text-yellow-500 text-[10px]">⚡</span>}
      {value}
    </span>
  </div>
);

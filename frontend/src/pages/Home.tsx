import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../store/gameStore";
import { useTelegram } from "../hooks/useTelegram";
import { api } from "../api/client";
import { Coin } from "../components/Coin";
import { Boost } from "./Boost";

export const Home = () => {
  const [currentView, setCurrentView] = useState<"game" | "boost">("game");
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
  } = useGameStore();

  const { user } = useTelegram();
  const [clicks, setClicks] = useState<{ id: number; x: number; y: number }[]>(
    [],
  );
  const unsyncedTaps = useRef(0);

  // Sync logic (Keep this as is)
  useEffect(() => {
    if (user?.id)
      api
        .login(user)
        .then((data) => setGameState(data.gameState))
        .catch(console.error);
  }, [user?.id]);

  useEffect(() => {
    const timer = setInterval(() => restoreEnergy(energyRegen), 1000);
    return () => clearInterval(timer);
  }, [restoreEnergy, energyRegen]);

  const handleTap = (e: any) => {
    if (energy < tapValue) return;

    // Correct relative coordinate calculation
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    incrementPoints();
    decrementEnergy();
    unsyncedTaps.current += 1;

    const id = Date.now();
    setClicks((prev) => [...prev, { id, x, y }]);
    setTimeout(() => setClicks((prev) => prev.filter((c) => c.id !== id)), 600);
  };

  return (
    // MAIN WRAPPER: bg-transparent lets your custom background shine
    <div className="flex-1 flex flex-col items-center pt-8 relative overflow-hidden bg-transparent text-white">
      <AnimatePresence mode="wait">
        {currentView === "game" ? (
          <motion.div
            key="game"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full flex flex-col items-center z-10"
          >
            {/* STATS: Semi-transparent 'glass' look */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-sm px-4 mb-8">
              <StatBox label="Profit/Hr" value="+12.5k" />
              <div className="bg-black/30 backdrop-blur-md rounded-xl p-2 border border-white/10 flex flex-col items-center relative overflow-hidden shadow-xl">
                <span className="text-[9px] text-gray-400 uppercase font-bold tracking-widest">
                  League
                </span>
                <span className="text-sm font-black text-yellow-500">
                  {levelName}
                </span>
                <div
                  className="absolute bottom-0 left-0 h-[2px] bg-yellow-500/50"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <StatBox label="Recharge" value={`+${energyRegen}/s`} isEnergy />
            </div>

            {/* BALANCE */}
            <div className="flex items-center gap-3 mb-8 drop-shadow-2xl">
              <span className="text-3xl">🦄</span>
              <span className="text-5xl font-black font-mono tracking-tighter">
                {points.toLocaleString()}
              </span>
            </div>

            {/* COIN & FLOATING NUMBERS CONTAINER */}
            <div className="flex-grow flex items-center justify-center mb-8 relative w-full pointer-events-none">
              <div className="pointer-events-auto">
                <Coin onTap={handleTap} />
              </div>

              {/* FLOATING TEXT (Positioned absolute within this container) */}
              <AnimatePresence>
                {clicks.map((c) => (
                  <motion.span
                    key={c.id}
                    initial={{ opacity: 1, y: c.y - 120, x: c.x - 20 }}
                    animate={{ opacity: 0, y: c.y - 220 }}
                    exit={{ opacity: 0 }}
                    className="absolute text-4xl font-black text-white drop-shadow-[0_2px_10px_rgba(0,0,0,1)]"
                    style={{ left: 0, top: 0 }}
                  >
                    +{tapValue}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>

            {/* BOTTOM ENERGY & BOOST */}
            <div className="w-full max-w-sm px-6 mb-8 mt-auto">
              <div className="flex justify-between items-end mb-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Energy
                  </span>
                  <span className="text-sm font-bold flex items-center gap-1 drop-shadow-lg">
                    <span className="text-yellow-500">⚡</span>
                    {Math.floor(energy)} / {maxEnergy}
                  </span>
                </div>

                <button
                  onClick={() => setCurrentView("boost")}
                  className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 flex items-center gap-2 active:scale-95 transition-all shadow-lg"
                >
                  <span className="text-lg">🚀</span>
                  <span className="text-xs font-bold uppercase tracking-tight">
                    Boost
                  </span>
                </button>
              </div>

              <div className="w-full h-3 bg-black/40 rounded-full border border-white/10 overflow-hidden backdrop-blur-sm">
                <motion.div
                  className="h-full bg-gradient-to-r from-yellow-600 to-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.4)]"
                  animate={{ width: `${(energy / maxEnergy) * 100}%` }}
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

// Reusable StatBox with transparency
const StatBox = ({ label, value, isEnergy }: any) => (
  <div className="bg-black/30 backdrop-blur-md rounded-xl p-2 border border-white/10 flex flex-col items-center shadow-xl">
    <span className="text-[9px] text-gray-400 uppercase font-bold tracking-widest">
      {label}
    </span>
    <span className="text-sm font-black flex items-center gap-1">
      {isEnergy && <span className="text-yellow-500 text-[10px]">⚡</span>}
      {value}
    </span>
  </div>
);

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

  // Sync Logic
  useEffect(() => {
    if (user?.id) {
      api
        .login(user)
        .then((data) => setGameState(data.gameState))
        .catch(console.error);
    }
  }, [user?.id]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (user && unsyncedTaps.current > 0) {
        const tapsToSend = unsyncedTaps.current;
        try {
          await api.syncTaps(user.id, tapsToSend);
          unsyncedTaps.current -= tapsToSend;
        } catch (error) {
          console.error(error);
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => restoreEnergy(energyRegen), 1000);
    return () => clearInterval(timer);
  }, [restoreEnergy, energyRegen]);

  const handleTap = (e: any) => {
    if (energy < tapValue) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    incrementPoints();
    decrementEnergy();
    unsyncedTaps.current += 1;

    const id = Date.now();
    setClicks((prev) => [...prev, { id, x: clientX, y: clientY }]);
    setTimeout(() => setClicks((prev) => prev.filter((c) => c.id !== id)), 600);
  };

  return (
    <div className="flex-1 flex flex-col items-center pt-8 relative overflow-hidden bg-black text-white">
      <AnimatePresence mode="wait">
        {currentView === "game" ? (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex flex-col items-center"
          >
            {/* TOP STATS */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-sm px-4 mb-8">
              <StatBox label="Profit/Hr" value="+12.5k" />

              {/* LEAGUE BOX WITH PROGRESS */}
              <div className="bg-[#1c1c1e] rounded-xl p-2 border border-white/5 flex flex-col items-center relative overflow-hidden">
                <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">
                  League
                </span>
                <span className="text-sm font-black text-yellow-500">
                  {levelName}
                </span>
                {/* Subtle progress bar at bottom of card */}
                <div
                  className="absolute bottom-0 left-0 h-[2px] bg-yellow-500/50 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <StatBox label="Recharge" value={`+${energyRegen}/s`} isEnergy />
            </div>

            {/* BALANCE */}
            <div className="flex items-center gap-3 mb-8">
              <span className="text-3xl">🦄</span>
              <span className="text-5xl font-black font-mono">
                {points.toLocaleString()}
              </span>
            </div>

            {/* THE COIN */}
            <div className="flex-grow flex items-center justify-center mb-8">
              <Coin onTap={handleTap} />
            </div>

            {/* FLOATING TEXT */}
            {clicks.map((c) => (
              <motion.span
                key={c.id}
                initial={{ opacity: 1, y: c.y - 40, x: c.x }}
                animate={{ opacity: 0, y: c.y - 120 }}
                className="absolute text-3xl font-black pointer-events-none z-50 text-white"
              >
                +{tapValue}
              </motion.span>
            ))}

            {/* BOTTOM NAV / ENERGY */}
            <div className="w-full max-w-sm px-6 mb-8">
              <div className="flex justify-between items-end mb-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                    Energy
                  </span>
                  <span className="text-sm font-bold flex items-center gap-1">
                    <span className="text-yellow-500">⚡</span>
                    {Math.floor(energy)} / {maxEnergy}
                  </span>
                </div>

                {/* BOOST BUTTON */}
                <button
                  onClick={() => setCurrentView("boost")}
                  className="bg-[#1c1c1e] px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2 active:scale-95 transition-transform"
                >
                  <span className="text-lg">🚀</span>
                  <span className="text-xs font-bold uppercase">Boost</span>
                </button>
              </div>

              {/* ENERGY PROGRESS BAR */}
              <div className="w-full h-3 bg-white/5 rounded-full border border-white/5 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-yellow-600 to-yellow-300"
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

const StatBox = ({ label, value, isEnergy }: any) => (
  <div className="bg-[#1c1c1e] rounded-xl p-2 border border-white/5 flex flex-col items-center">
    <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">
      {label}
    </span>
    <span className="text-sm font-black flex items-center gap-1">
      {isEnergy && <span className="text-yellow-500 text-[10px]">⚡</span>}
      {value}
    </span>
  </div>
);

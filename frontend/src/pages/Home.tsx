import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useGameStore } from "../store/gameStore";
import { useTelegram } from "../hooks/useTelegram";
import { api } from "../api/client";
import { Coin } from "../components/Coin";
import { Boost } from "./Boost";
import { ModernTicker } from "../components/ModernTicker";

export const Home = () => {
  const [currentView, setCurrentView] = useState<"game" | "boost">("game");

  // Animation controls for the balance "Pop" effect
  const balanceControls = useAnimation();

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
    profitPerHour, // Get profit from store
    tickPassivePoints, // Get the tick action
  } = useGameStore();

  const { user } = useTelegram();
  const [clicks, setClicks] = useState<{ id: number; x: number; y: number }[]>(
    [],
  );

  // 1. STATE REFS (Crucial for sync logic inside setInterval)
  const unsyncedTaps = useRef(0);
  const lastTapRef = useRef<number>(0);
  const energyRef = useRef(energy);
  const pointsRef = useRef(points);

  // Keep refs in sync with real state
  useEffect(() => {
    energyRef.current = energy;
  }, [energy]);
  useEffect(() => {
    pointsRef.current = points;
  }, [points]);

  // 2. Initial Login
  useEffect(() => {
    if (user?.id) {
      api
        .login(user)
        .then((data) => setGameState(data.gameState))
        .catch((e) => console.error("Login Error:", e));
    }
  }, [user?.id, setGameState]);

  // 3. THE SYNC LOOP (Sends taps to backend)
  useEffect(() => {
    const interval = setInterval(async () => {
      const tapsToSend = unsyncedTaps.current;

      if (user?.id && tapsToSend > 0) {
        try {
          const serverState = await api.syncTaps(user.id, tapsToSend);
          unsyncedTaps.current -= tapsToSend;

          const now = Date.now();
          // If user tapped recently (Active), or we just synced, protect local state
          const isTapping = now - lastTapRef.current < 3000;

          if (isTapping) {
            // Update everything EXCEPT points/energy to avoid "jumping" backward
            setGameState({
              ...serverState,
              energy: energyRef.current,
              points: pointsRef.current,
            });
          } else {
            // User is idle, strict sync allowed
            setGameState(serverState);
          }
        } catch (error) {
          console.error("Sync Failed:", error);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [user?.id, setGameState]);

  // 4. ENERGY REGEN LOOP
  useEffect(() => {
    const timer = setInterval(() => {
      if (energy < maxEnergy) {
        restoreEnergy(energyRegen);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [restoreEnergy, energyRegen, energy, maxEnergy]);

  // 5. PASSIVE EARN LOOP (The Live Ticker)
  useEffect(() => {
    if (profitPerHour === 0) return;

    // Run every 1 second
    const interval = setInterval(() => {
      tickPassivePoints();
    }, 1000);

    return () => clearInterval(interval);
  }, [profitPerHour, tickPassivePoints]);

  // 6. TAP HANDLER
  const handleTap = (e: React.PointerEvent<HTMLDivElement>) => {
    const now = Date.now();
    if (now - lastTapRef.current < 40) return; // Debounce
    lastTapRef.current = now;

    if (energy < tapValue) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    incrementPoints();
    decrementEnergy();
    unsyncedTaps.current += 1;

    // Trigger "Pop" animation on balance
    balanceControls.start({
      scale: [1, 1.05, 1],
      transition: { duration: 0.08 },
    });

    // Floating Numbers Logic
    const id = Date.now();
    setClicks((prev) => [...prev, { id, x, y }]);
    setTimeout(() => setClicks((prev) => prev.filter((c) => c.id !== id)), 600);

    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred("light");
    }
  };

  // 7. DEV HELPER: Buy Upgrade
  const handleBuyTestUpgrade = async () => {
    if (!user?.id) return;
    try {
      // Cost: 500, Reward: +1000/hr
      const newState = await api.buyMiningUpgrade(user.id, 500, 1000);
      setGameState(newState);
      alert("Success! +1000 Profit/Hr acquired.");
    } catch (e) {
      alert("Error: Not enough points?");
    }
  };

  // Helper for formatting K/M
  const formatProfit = (num: number) => {
    if (num >= 1000000) return `+${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `+${(num / 1000).toFixed(1)}k`;
    return `+${num}`;
  };

  return (
    <div className="flex-1 flex flex-col items-center pt-8 relative overflow-hidden bg-transparent text-white">
      <AnimatePresence mode="wait">
        {currentView === "game" ? (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex flex-col items-center z-10"
          >
            {/* STATS HEADER */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-sm px-4 mb-8">
              <StatBox
                label="Profit/Hr"
                value={formatProfit(profitPerHour)}
                isProfit
              />

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
            <div className="flex flex-col items-center mb-8 z-20">
              {/* Label above numbers */}
              <span className="text-xs font-bold text-yellow-500/80 uppercase tracking-[0.2em] mb-2 drop-shadow-md">
                Total Balance
              </span>

              <div className="flex items-center gap-3">
                {/* Unicorn / Icon */}
                <span className="text-4xl filter drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                  🦄
                </span>

                {/* THE MODERN TICKER CONTAINER */}
                <motion.div animate={balanceControls} className="relative">
                  {/* 1. The Text Effect (Gradient + Shadow) */}
                  <div className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-400 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                    <ModernTicker value={points} />
                  </div>

                  {/* 2. Optional: Shine/Reflection Effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 animate-shine pointer-events-none" />
                </motion.div>
              </div>
            </div>

            {/* CLICK AREA */}
            <div className="flex-grow flex items-center justify-center mb-8 relative w-full pointer-events-none">
              <div className="pointer-events-auto">
                <Coin onTap={handleTap} tapValue={tapValue} />
              </div>

              <AnimatePresence>
                {clicks.map((c) => (
                  <motion.span
                    key={c.id}
                    initial={{ opacity: 1, y: c.y - 120, x: c.x - 20 }}
                    animate={{ opacity: 0, y: c.y - 220 }}
                    exit={{ opacity: 0 }}
                    className="absolute text-4xl font-black text-white drop-shadow-[0_2px_10px_rgba(0,0,0,1)] pointer-events-none"
                    style={{ left: 0, top: 0 }}
                  >
                    +{tapValue}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>

            {/* BOTTOM NAV */}
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
                  animate={{
                    width: `${Math.min(100, (energy / maxEnergy) * 100)}%`,
                  }}
                  transition={{ type: "tween", ease: "linear", duration: 0.2 }}
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

const StatBox = ({ label, value, isEnergy, isProfit }: any) => (
  <div className="bg-black/30 backdrop-blur-md rounded-xl p-2 border border-white/10 flex flex-col items-center shadow-xl">
    <span className="text-[9px] text-gray-400 uppercase font-bold tracking-widest">
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

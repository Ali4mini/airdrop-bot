// src/pages/Home.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../store/gameStore";
import { Coin } from "../components/Coin"; // <--- Import Component

export const Home = () => {
  const { points, energy, maxEnergy, incrementPoints, decrementEnergy } =
    useGameStore();
  const [clicks, setClicks] = useState<{ id: number; x: number; y: number }[]>(
    [],
  );

  const handleTap = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ) => {
    if (energy <= 0) return;

    // Get coordinates safely for both Mouse and Touch events
    const clientX =
      "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY =
      "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    incrementPoints(1);
    decrementEnergy(1);

    // Trigger floating number animation
    const id = Date.now();
    setClicks((prev) => [...prev, { id, x: clientX, y: clientY }]);
    setTimeout(() => {
      setClicks((prev) => prev.filter((c) => c.id !== id));
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col items-center pt-8 relative z-10 min-h-0">
      {/* 1. STATS DASHBOARD */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-sm mb-6 px-4">
        {/* ... (Keep your stats code exactly as it was) ... */}
        <div className="bg-[#1c1c1e] rounded-xl p-2 flex flex-col items-center border border-white/5 shadow-lg">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">
            Profit/Hr
          </span>
          <span className="text-sm font-bold text-white">+12.5k</span>
        </div>
        <div className="bg-[#1c1c1e] rounded-xl p-2 flex flex-col items-center border border-white/5 shadow-lg">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">
            League
          </span>
          <span className="text-sm font-bold text-yellow-500">Bronze</span>
        </div>
        <div className="bg-[#1c1c1e] rounded-xl p-2 flex flex-col items-center border border-white/5 shadow-lg">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">
            Energy
          </span>
          <span className="text-sm font-bold text-white">Full</span>
        </div>
      </div>

      {/* 2. MAIN SCORE */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-yellow-500 border-2 border-yellow-300 flex items-center justify-center shadow-[0_0_10px_rgba(234,179,8,0.5)]">
          <span className="text-xl">🦄</span>
        </div>
        <span className="text-5xl font-black text-white drop-shadow-lg font-mono">
          {points.toLocaleString()}
        </span>
      </div>

      {/* 3. THE COIN COMPONENT */}
      <div className="flex-grow flex items-center justify-center mb-4">
        {/* We pass the handleTap function to the child component */}
        <Coin onTap={handleTap} />
      </div>

      {/* FLOATING NUMBERS (Must stay in Home to be positioned absolute to screen) */}
      {clicks.map((click) => (
        <div
          key={click.id}
          className="absolute text-4xl font-bold text-white pointer-events-none z-50"
          style={{ top: click.y - 40, left: click.x }}
        >
          <motion.div
            initial={{ opacity: 1, y: 0, scale: 0.5 }}
            animate={{ opacity: 0, y: -100, scale: 1.2 }}
            transition={{ duration: 0.6 }}
            className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
          >
            +1
          </motion.div>
        </div>
      ))}

      {/* 4. ENERGY BAR */}
      <div className="w-full max-w-xs px-4 mb-2">
        <div className="flex justify-between text-xs font-bold text-gray-400 mb-1 uppercase tracking-wide">
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">⚡</span>
            <span>Energy</span>
          </div>
          <span>
            {energy} / {maxEnergy}
          </span>
        </div>
        <div className="w-full bg-[#2d2d2d] rounded-full h-3 overflow-hidden border border-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300"
            initial={{ width: 0 }}
            animate={{ width: `${(energy / maxEnergy) * 100}%` }}
            transition={{ type: "spring", stiffness: 50 }}
          />
        </div>
      </div>
    </div>
  );
};

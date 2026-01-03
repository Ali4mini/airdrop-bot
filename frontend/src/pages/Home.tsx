import { useState } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../store/gameStore";

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
    const clientX =
      "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY =
      "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    incrementPoints(1);
    decrementEnergy(1);

    // Add click animation
    const id = Date.now();
    setClicks((prev) => [...prev, { id, x: clientX, y: clientY }]);
    setTimeout(() => {
      setClicks((prev) => prev.filter((c) => c.id !== id));
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col items-center pt-8 relative z-10">
      {/* 1. STATS DASHBOARD (Fills the top space) */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-sm mb-6 px-4">
        {/* Profit Per Hour */}
        <div className="bg-[#1c1c1e] rounded-xl p-2 flex flex-col items-center border border-white/5 shadow-lg">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">
            Profit/Hr
          </span>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-sm font-bold text-white">+12.5k</span>
          </div>
        </div>
        {/* League */}
        <div className="bg-[#1c1c1e] rounded-xl p-2 flex flex-col items-center border border-white/5 shadow-lg">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">
            League
          </span>
          <span className="text-sm font-bold text-yellow-500">Bronze</span>
        </div>
        {/* Daily Refills */}
        <div className="bg-[#1c1c1e] rounded-xl p-2 flex flex-col items-center border border-white/5 shadow-lg">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">
            Energy
          </span>
          <span className="text-sm font-bold text-white">Full</span>
        </div>
      </div>

      {/* 2. MAIN SCORE (Bigger, Better font, Icon) */}
      <div className="flex items-center gap-3 mb-12">
        {/* Coin Icon Image */}
        <div className="w-12 h-12 rounded-full bg-yellow-500 border-2 border-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.5)] flex items-center justify-center">
          <span className="text-2xl">🦄</span>
        </div>
        <span className="text-6xl font-black text-white drop-shadow-[0_2px_10px_rgba(255,215,0,0.3)] tracking-tight font-mono">
          {points.toLocaleString()}
        </span>
      </div>

      {/* 3. THE 3D COIN (The Star of the Show) */}
      <div className="flex-grow flex items-center justify-center mb-8">
        <motion.div
          whileTap={{ scale: 0.95, rotate: 2 }}
          className="cursor-pointer select-none relative"
          onClick={handleTap}
          onTouchStart={handleTap}
        >
          {/* Outer Ring */}
          <div className="w-72 h-72 rounded-full bg-gradient-to-b from-[#fcd34d] via-[#b45309] to-[#78350f] p-3 shadow-[0_0_60px_rgba(234,179,8,0.5)] relative z-10">
            {/* Inner Body */}
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#fbbf24] to-[#d97706] shadow-[inset_0_2px_20px_rgba(0,0,0,0.3)] flex items-center justify-center relative border-[3px] border-[#92400e]/30">
              {/* Decorative Circle Line */}
              <div className="absolute inset-5 rounded-full border border-yellow-200/20 border-dashed"></div>

              {/* Central Character/Icon */}
              <span className="text-9xl filter drop-shadow-xl select-none relative z-20 transform -rotate-6">
                🦄
              </span>

              {/* Shine Effect (Glassy look) */}
              <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-full pointer-events-none"></div>
            </div>
          </div>

          {/* Pulse Effect behind the coin */}
          <div className="absolute inset-0 bg-yellow-500 rounded-full blur-[80px] opacity-20 animate-pulse -z-10"></div>
        </motion.div>
      </div>

      {/* Floating Animations */}
      {clicks.map((click) => (
        <div
          key={click.id}
          className="absolute text-4xl font-bold text-white pointer-events-none z-50"
          style={{ top: click.y - 40, left: click.x }}
        >
          <motion.div
            initial={{ opacity: 1, y: 0, scale: 0.5 }}
            animate={{ opacity: 0, y: -150, scale: 1.2 }}
            transition={{ duration: 0.8 }}
            className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
          >
            +1
          </motion.div>
        </div>
      ))}

      {/* 4. ENERGY BAR (Bottom) */}
      <div className="w-full max-w-xs px-4 mb-4">
        <div className="flex justify-between text-xs font-bold text-gray-400 mb-1 uppercase tracking-wide">
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">⚡</span>
            <span>Energy</span>
          </div>
          <span>
            {energy} / {maxEnergy}
          </span>
        </div>
        <div className="w-full bg-[#2d2d2d] rounded-full h-4 overflow-hidden border border-white/5">
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

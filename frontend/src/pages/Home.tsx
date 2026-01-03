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
    setClicks((prev) => [...prev, { id: Date.now(), x: clientX, y: clientY }]);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative">
      {/* Points */}
      <div className="text-5xl font-black mb-8 select-none font-mono">
        {points.toLocaleString()}
      </div>

      {/* Coin */}
      <motion.div
        whileTap={{ scale: 0.95 }}
        className="cursor-pointer select-none"
        onClick={handleTap}
        onTouchStart={handleTap}
      >
        <div className="w-64 h-64 rounded-full bg-gradient-to-b from-yellow-400 to-yellow-600 shadow-[0_0_30px_rgba(234,179,8,0.6)] flex items-center justify-center border-4 border-yellow-200">
          <span className="text-6xl">🪙</span>
        </div>
      </motion.div>

      {/* Floating Animations */}
      {clicks.map((click) => (
        <div
          key={click.id}
          className="absolute text-2xl font-bold text-white pointer-events-none"
          style={{ top: click.y - 40, left: click.x }}
        >
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -100 }}
            transition={{ duration: 1 }}
          >
            +1
          </motion.div>
        </div>
      ))}

      {/* Energy Bar */}
      <div className="w-full max-w-xs mt-8 px-4">
        <div className="flex justify-between text-sm mb-1">
          <span>⚡ Energy</span>
          <span>
            {energy} / {maxEnergy}
          </span>
        </div>
        <progress
          className="progress progress-warning w-full h-4"
          value={energy}
          max={maxEnergy}
        ></progress>
      </div>
    </div>
  );
};

import { useEffect, useState } from "react";
import { useTelegram } from "./hooks/useTelegram";
import { useGameStore } from "./store/gameStore";
import { motion } from "framer-motion";

function App() {
  const { user, expand } = useTelegram();
  const { points, energy, maxEnergy, incrementPoints, decrementEnergy } =
    useGameStore();

  // For the "+1" floating animation
  const [clicks, setClicks] = useState<{ id: number; x: number; y: number }[]>(
    [],
  );

  useEffect(() => {
    expand(); // Expand to full height on load
  }, []);

  const handleTap = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ) => {
    if (energy <= 0) return;

    // Handle touch or mouse coordinates
    const clientX =
      "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY =
      "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    // Logic
    incrementPoints(1);
    decrementEnergy(1);

    // Animation Logic
    const id = Date.now();
    setClicks((prev) => [...prev, { id, x: clientX, y: clientY }]);

    // Remove the animation element after 1 sec
    setTimeout(() => {
      setClicks((prev) => prev.filter((c) => c.id !== id));
    }, 1000);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-black text-white font-sans overflow-hidden">
      {/* --- HEADER --- */}
      <div className="navbar bg-base-100 z-10 border-b border-gray-800 pb-safe-top">
        <div className="flex-1">
          <div className="flex flex-col">
            <span className="text-xs opacity-50">Welcome</span>
            <span className="font-bold text-lg">{user?.first_name}</span>
          </div>
        </div>
        <div className="flex-none gap-2">
          <div className="badge badge-primary badge-outline">Level 1</div>
        </div>
      </div>

      {/* --- MAIN GAME AREA --- */}
      <div className="flex-grow flex flex-col items-center justify-center relative z-0">
        {/* Points Display */}
        <div className="text-5xl font-black mb-8 select-none font-mono">
          {points.toLocaleString()}
        </div>

        {/* TAP BUTTON (Using a DaisyUI Avatar styled as a coin) */}
        <motion.div
          whileTap={{ scale: 0.95 }}
          className="cursor-pointer select-none"
          onClick={(e) => handleTap(e)} // Fallback for desktop
          onTouchStart={(e) => handleTap(e)} // Better for mobile
        >
          <div className="w-64 h-64 rounded-full bg-gradient-to-b from-yellow-400 to-yellow-600 shadow-[0_0_50px_rgba(234,179,8,0.4)] flex items-center justify-center border-4 border-yellow-200">
            <span className="text-6xl">🪙</span>
          </div>
        </motion.div>

        {/* Floating Numbers Container */}
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

      {/* --- BOTTOM NAVIGATION (DaisyUI) --- */}
      <div className="btm-nav btm-nav-md bg-base-200 pb-safe-bottom">
        <button className="active text-warning">
          <span className="btm-nav-label">Tap</span>
        </button>
        <button>
          <span className="btm-nav-label">Boost</span>
        </button>
        <button>
          <span className="btm-nav-label">Stats</span>
        </button>
      </div>
    </div>
  );
}

export default App;

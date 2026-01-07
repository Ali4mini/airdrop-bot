import React, { useState } from "react";
import {
  motion,
  useSpring,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from "framer-motion";

interface CoinProps {
  onTap: (e: React.PointerEvent<HTMLDivElement>) => void;
  // We need tapValue to decide what text to show on each particle
  tapValue: number;
}

// Interface for a single particle's state
interface Particle {
  id: number;
  x: number; // Initial X position relative to the coin
  y: number; // Initial Y position relative to the coin
  value: string; // E.g., "+1" or "✨"
}

export const Coin = ({ onTap, tapValue }: CoinProps) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["20deg", "-20deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-20deg", "20deg"]);

  // State to manage the floating particles
  const [particles, setParticles] = useState<Particle[]>([]);

  const handleInteraction = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault(); // Prevent browser defaults like touch emulation

    const rect = e.currentTarget.getBoundingClientRect();
    // Calculate tap position relative to the Coin component
    const tapX = e.clientX - rect.left;
    const tapY = e.clientY - rect.top;

    // 3D Tilt Logic
    const offsetX = tapX / rect.width - 0.5;
    const offsetY = tapY / rect.height - 0.5;
    x.set(offsetX);
    y.set(offsetY);

    // Reset tilt after a short delay
    setTimeout(() => {
      x.set(0);
      y.set(0);
    }, 100);

    // --- Particle Effect Logic ---
    const numParticles = 3; // Number of small particles per tap
    for (let i = 0; i < numParticles; i++) {
      const particleId = Date.now() + Math.random(); // Unique ID for each particle
      const newParticle: Particle = {
        id: particleId,
        // Distribute particles randomly around the tap point
        x: tapX + (Math.random() - 0.5) * 30,
        y: tapY + (Math.random() - 0.5) * 30,
        value: `🔥`, // Each small particle shows "+1"
      };
      setParticles((prev) => [...prev, newParticle]);

      // Remove particle after its animation finishes
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== particleId));
      }, 800); // Match animation duration
    }
    // --- End Particle Effect Logic ---

    onTap(e); // Call the original onTap handler
  };

  return (
    <div className="relative flex items-center justify-center perspective-1000">
      <div className="absolute w-72 h-72 bg-orange-500 rounded-full blur-[80px] opacity-20 animate-pulse pointer-events-none" />

      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
        }}
        whileTap={{ scale: 0.92 }}
        onPointerDown={handleInteraction}
        className="relative w-72 h-72 cursor-pointer select-none touch-manipulation z-10 outline-none -webkit-tap-highlight-color-transparent"
      >
        {/* OUTSIDE EDGE */}
        <div className="absolute inset-0 rounded-full bg-[#8B4513] translate-y-2 shadow-2xl" />

        {/* MAIN BODY */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#FDE68A] via-[#B45309] to-[#78350F] p-[6px] shadow-inner">
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#B45309] via-[#FDE68A] to-[#B45309] p-[4px]">
            <div className="w-full h-full rounded-full bg-[#D97706] relative overflow-hidden flex items-center justify-center shadow-[inset_0_4px_10px_rgba(0,0,0,0.5)]">
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `repeating-conic-gradient(from 0deg, transparent 0deg 10deg, #451a03 10deg 20deg)`,
                }}
              />

              <div className="absolute w-[80%] h-[80%] rounded-full border-[3px] border-[#B45309]/30 flex items-center justify-center">
                <span className="text-8xl drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] z-20 pointer-events-none">
                  🔥
                </span>
              </div>

              {/* Top-left highlight */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none" />
              {/* Bottom-right shadow */}
              <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-tl from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* --- Particle Rendering --- */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.span
            key={p.id}
            initial={{ opacity: 1, x: p.x, y: p.y, scale: 0.5 }}
            animate={{
              opacity: 0,
              y: p.y - 80, // Float upwards
              x: p.x + (Math.random() - 0.5) * 60, // Add some horizontal spread
              scale: 0.9,
            }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }} // Faster fade out on exit
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute text-sm font-bold text-yellow-300 pointer-events-none drop-shadow-md z-30 whitespace-nowrap"
            // Important: Style particle position directly
            style={{
              left: 0,
              top: 0,
              // We use transform directly here for the absolute positioning
              // Framer Motion's 'x' and 'y' props will then apply relative transforms on top of this.
              transform: `translate(${p.x}px, ${p.y}px)`,
            }}
          >
            {p.value}
          </motion.span>
        ))}
      </AnimatePresence>
      {/* --- End Particle Rendering --- */}

      <style>{`
        .perspective-1000 { perspective: 1000px; }
      `}</style>
    </div>
  );
};

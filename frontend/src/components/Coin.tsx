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
  tapValue: number;
  logoUrl?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  value: string;
}

export const Coin = ({
  onTap,
  tapValue,
  logoUrl = "../../public/1770311369-removebg-preview.png",
}: CoinProps) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["20deg", "-20deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-20deg", "20deg"]);

  // This sheen moves across the WHOLE coin (rim + face + logo)
  const sheenGradient = useTransform(
    mouseXSpring,
    [-0.5, 0.5],
    [
      "linear-gradient(115deg, transparent 0%, rgba(255,255,255,0) 100%)",
      "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)",
    ],
  );

  const [particles, setParticles] = useState<Particle[]>([]);

  const handleInteraction = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const tapX = e.clientX - rect.left;
    const tapY = e.clientY - rect.top;

    const offsetX = tapX / rect.width - 0.5;
    const offsetY = tapY / rect.height - 0.5;
    x.set(offsetX);
    y.set(offsetY);

    setTimeout(() => {
      x.set(0);
      y.set(0);
    }, 100);

    const numParticles = 3;
    for (let i = 0; i < numParticles; i++) {
      const particleId = Date.now() + Math.random();
      setParticles((prev) => [
        ...prev,
        {
          id: particleId,
          x: tapX + (Math.random() - 0.5) * 40,
          y: tapY + (Math.random() - 0.5) * 40,
          value: `+${tapValue}`,
        },
      ]);
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== particleId));
      }, 800);
    }
    onTap(e);
  };

  return (
    <div className="relative flex items-center justify-center perspective-1000 group">
      {/* 1. Background Glow */}
      <div className="absolute w-64 h-64 bg-amber-500 rounded-full blur-[80px] opacity-40 group-hover:opacity-60 transition-opacity duration-500" />

      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        whileTap={{ scale: 0.96 }}
        onPointerDown={handleInteraction}
        className="relative w-72 h-72 cursor-pointer select-none touch-manipulation z-10"
      >
        {/* --- 2. THICK 3D RIM --- */}
        {/* Darkest outer edge */}
        <div className="absolute inset-0 rounded-full bg-[#5d2806] shadow-2xl translate-y-2" />

        {/* Main Gold Rim (Gradient Light to Dark) */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#fcd34d] via-[#d97706] to-[#78350f] p-[10px]">
          {/* Inner Groove (Dark Line separating Rim from Face) */}
          <div className="w-full h-full rounded-full bg-[#451a03] p-[2px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
            {/* --- 3. THE COIN FACE --- */}
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#fbbf24] to-[#b45309] relative overflow-hidden flex items-center justify-center">
              {/* Sunburst Pattern - Now Covers Everything */}
              <div
                className="absolute inset-0 opacity-30 mix-blend-overlay"
                style={{
                  backgroundImage: `repeating-conic-gradient(from 0deg, transparent 0deg 10deg, #78350F 10deg 20deg)`,
                }}
              />

              {/* Grain Texture */}
              <div
                className="absolute inset-0 opacity-10 bg-black mix-blend-overlay"
                style={{
                  backgroundImage:
                    "url('https://grainy-gradients.vercel.app/noise.svg')",
                }}
              />

              {/* --- 4. THE LOGO (Embossed Effect) --- */}
              {/* No wrapper div with shadow! Just the logo. */}
              <div className="relative w-[55%] h-[55%] z-20">
                {/* 
                   A. Drop Shadow (The shadow cast by the raised logo)
                   Moves down-right
                */}
                <img
                  src={logoUrl}
                  className="absolute inset-0 w-full h-full object-contain brightness-0 opacity-40 blur-[2px] translate-x-1 translate-y-1"
                />

                {/* 
                   B. Highlight Edge (The light hitting the top-left)
                   Moves up-left, bright white
                */}
                <img
                  src={logoUrl}
                  className="absolute inset-0 w-full h-full object-contain brightness-200 opacity-50 blur-[1px] -translate-x-[1px] -translate-y-[1px]"
                />

                {/* 
                   C. The Actual Logo
                   Clean, crisp, with a slight internal glow to make it look 3D
                */}
                <img
                  src={logoUrl}
                  className="relative w-full h-full object-contain drop-shadow-sm"
                  style={{ filter: "saturate(1.1) brightness(1.05)" }}
                />
              </div>

              {/* --- 5. GLOBAL SHINE OVERLAY --- */}
              {/* This makes the logo feel like it's UNDER the glass/finish */}
              <motion.div
                className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-80"
                style={{ background: sheenGradient }}
              />

              {/* Convex Highlights (Static) */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 via-transparent to-black/30 pointer-events-none" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Particles */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, x: p.x, y: p.y, scale: 0.5 }}
            animate={{ opacity: 0, y: p.y - 100, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute pointer-events-none z-30"
            style={{
              left: 0,
              top: 0,
              transform: `translate(${p.x}px, ${p.y}px)`,
            }}
          >
            <span
              className="text-3xl font-black text-white drop-shadow-md"
              style={{ WebkitTextStroke: "1px #d97706" }}
            >
              {p.value}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>

      <style>{`.perspective-1000 { perspective: 1000px; }`}</style>
    </div>
  );
};

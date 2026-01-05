import React, { useState } from "react";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";

interface CoinProps {
  onTap: (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ) => void;
}

export const Coin = ({ onTap }: CoinProps) => {
  // 3D Tilt Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth out the tilt return animation
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["20deg", "-20deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-20deg", "20deg"]);

  const handleInteraction = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();

    // Calculate touch position relative to center for the 3D tilt
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const offsetX = (clientX - rect.left) / rect.width - 0.5;
    const offsetY = (clientY - rect.top) / rect.height - 0.5;

    x.set(offsetX);
    y.set(offsetY);

    // Reset tilt after a short delay
    setTimeout(() => {
      x.set(0);
      y.set(0);
    }, 100);

    onTap(e);
  };

  return (
    <div className="relative flex items-center justify-center perspective-1000">
      {/* Dynamic Background Glow */}
      <div className="absolute w-72 h-72 bg-orange-500 rounded-full blur-[80px] opacity-20 animate-pulse pointer-events-none" />

      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        whileTap={{ scale: 0.92 }}
        onPointerDown={handleInteraction}
        className="relative w-72 h-72 cursor-pointer select-none touch-manipulation z-10"
      >
        {/* OUTSIDE EDGE (The "Thickness" of the coin) */}
        <div className="absolute inset-0 rounded-full bg-[#8B4513] translate-y-2 shadow-2xl" />

        {/* MAIN BODY */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#FDE68A] via-[#B45309] to-[#78350F] p-[6px] shadow-inner">
          {/* INNER BEZEL (The shiny rim) */}
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#B45309] via-[#FDE68A] to-[#B45309] p-[4px]">
            {/* COIN FACE */}
            <div className="w-full h-full rounded-full bg-[#D97706] relative overflow-hidden flex items-center justify-center shadow-[inset_0_4px_10px_rgba(0,0,0,0.5)]">
              {/* Texture/Pattern (Radial lines) */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `repeating-conic-gradient(from 0deg, transparent 0deg 10deg, #451a03 10deg 20deg)`,
                }}
              />

              {/* Central Embossed Ring */}
              <div className="absolute w-[80%] h-[80%] rounded-full border-[3px] border-[#B45309]/30 flex items-center justify-center">
                {/* Symbol with depth */}
                <span className="text-8xl drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] z-20">
                  🔥
                </span>
              </div>

              {/* Top "Shine" Highlight */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none" />

              {/* Bottom "Shadow" Reflection */}
              <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-tl from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* CSS for Perspective - Add to your global CSS or a style tag */}
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
};

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const Background = () => {
  // We use this to ensure random positions match on server/client if using SSR,
  // though for Vite it's mostly fine. It prevents hydration errors.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-[#050505] -z-50 overflow-hidden">
      {/* 0. BASE GRADIENT (Prevents flat black look) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#1a1a1a_0%,_#000000_100%)] opacity-50" />

      {/* 1. AMBIENT CORNER LIGHTS (Fills the dark edges) */}
      {/* Top Left - Gold */}
      <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-yellow-600/10 rounded-full blur-[120px]" />
      {/* Top Right - Purple */}
      <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px]" />
      {/* Bottom - Blue/Dark */}
      <div className="absolute -bottom-[10%] left-[20%] w-[60%] h-[40%] bg-blue-900/10 rounded-full blur-[100px]" />

      {/* 2. CENTRAL GOLD GLOW (Focuses eye on the coin) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-yellow-600/20 rounded-full blur-[100px]" />

      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] bg-yellow-500/20 rounded-full blur-[80px]"
      />

      {/* 3. INCREASED FLOATING PARTICLES */}
      {mounted &&
        [...Array(20)].map((_, i) => {
          // Randomize start position to be anywhere on screen, not just bottom
          const randomX = Math.random() * 100; // percent
          const randomDelay = Math.random() * 5;
          const randomDuration = Math.random() * 10 + 10; // Slower, more floaty

          return (
            <motion.div
              key={i}
              className="absolute bg-white rounded-full"
              initial={{
                left: `${randomX}%`,
                top: `${Math.random() * 120}%`, // Start anywhere vertically
                opacity: 0,
                scale: 0,
              }}
              animate={{
                top: "-10%", // Float to top
                opacity: [0, 0.4, 0], // Fade in then out
                scale: [0, Math.random() * 0.5 + 0.5, 0],
              }}
              transition={{
                duration: randomDuration,
                repeat: Infinity,
                delay: randomDelay,
                ease: "linear",
              }}
              style={{
                width: Math.random() * 3 + 1 + "px",
                height: Math.random() * 3 + 1 + "px",
              }}
            />
          );
        })}

      {/* 4. TECH TEXTURE (Grid instead of just lines for more coverage) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* 5. VIGNETTE (Reduced intensity so corners aren't pitch black) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />
    </div>
  );
};

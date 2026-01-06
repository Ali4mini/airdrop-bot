import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const Background = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-[#050505] -z-50 overflow-hidden">
      {/* 0. BASE GRADIENT */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#1a1a1a_0%,_#000000_100%)] opacity-50" />

      {/* 1. AMBIENT CORNER LIGHTS */}
      <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-yellow-600/20 rounded-full blur-[120px]" />
      <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px]" />
      <div className="absolute -bottom-[10%] left-[20%] w-[60%] h-[40%] bg-blue-900/20 rounded-full blur-[100px]" />

      {/* 2. CENTRAL GOLD GLOW */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-yellow-600/10 rounded-full blur-[100px]" />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] bg-yellow-500/20 rounded-full blur-[80px]"
      />

      {/* 3. FLOATING PARTICLES */}
      {mounted &&
        [...Array(15)].map((_, i) => {
          const randomX = Math.random() * 100;
          return (
            <motion.div
              key={i}
              className="absolute bg-white rounded-full"
              initial={{ left: `${randomX}%`, top: "110%", opacity: 0 }}
              animate={{ top: "-10%", opacity: [0, 0.5, 0] }}
              transition={{
                duration: Math.random() * 10 + 15,
                repeat: Infinity,
                delay: Math.random() * 10,
                ease: "linear",
              }}
              style={{
                width: Math.random() * 2 + "px",
                height: Math.random() * 2 + "px",
              }}
            />
          );
        })}

      {/* 4. SUBTLE GRID */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* --- BALANCED SIDE EFFECTS --- */}

      {/* LEFT SIDE: Clean Gold Beam */}
      <div className="absolute top-0 left-0 w-12 h-full bg-gradient-to-r from-yellow-900/10 to-transparent blur-sm">
        {/* The Beam: Thin, glowing, but no hard border */}
        <div className="absolute top-0 left-0 h-full w-[1px] overflow-hidden">
          <motion.div
            className="w-full h-[200px] bg-gradient-to-b from-transparent via-yellow-400 to-transparent shadow-[0_0_8px_1px_rgba(250,204,21,0.4)]"
            animate={{ top: ["-30%", "120%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>

      {/* RIGHT SIDE: Clean Purple Beam */}
      <div className="absolute top-0 right-0 w-12 h-full bg-gradient-to-l from-purple-900/10 to-transparent blur-sm">
        {/* The Beam */}
        <div className="absolute top-0 right-0 h-full w-[1px] overflow-hidden">
          <motion.div
            className="w-full h-[200px] bg-gradient-to-b from-transparent via-purple-500 to-transparent shadow-[0_0_8px_1px_rgba(168,85,247,0.4)]"
            animate={{ top: ["-30%", "120%"] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
              delay: 1.5,
            }}
          />
        </div>
      </div>

      {/* 5. VIGNETTE (Tying it all together) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.7)_100%)] pointer-events-none" />
    </div>
  );
};

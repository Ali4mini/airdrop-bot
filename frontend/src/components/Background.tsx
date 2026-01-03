import { motion } from "framer-motion";

export const Background = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-[#0a0a0a] -z-50 overflow-hidden">
      {/* 1. CENTRAL GOLD GLOW (Focuses eye on the coin) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-yellow-600/20 rounded-full blur-[100px]" />

      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-yellow-500/30 rounded-full blur-[80px]"
      />

      {/* 2. SECONDARY PURPLE ACCENT (Bottom for depth) */}
      <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-purple-900/20 to-transparent blur-3xl" />

      {/* 3. FLOATING PARTICLES (Embers) */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-white rounded-full opacity-20"
          initial={{
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 100,
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            y: -100,
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: Math.random() * 5 + 5, // Random speed between 5-10s
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear",
          }}
          style={{
            width: Math.random() * 4 + 1 + "px",
            height: Math.random() * 4 + 1 + "px",
          }}
        />
      ))}

      {/* 4. SCANLINES (Tech Texture) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(transparent 50%, rgba(0, 0, 0, 0.5) 50%)",
          backgroundSize: "100% 4px",
        }}
      />

      {/* 5. VIGNETTE (Dark edges) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />
    </div>
  );
};

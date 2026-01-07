import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

export const Background = () => {
  const [mounted, setMounted] = useState(false);

  // --- PARALLAX MOUSE EFFECT ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth out the movement (stiffness/damping controls the "weight")
  const springX = useSpring(mouseX, { stiffness: 40, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 30 });

  // Map mouse position to movement distance
  const moveX = useTransform(springX, [0, window.innerWidth], [-20, 20]);
  const moveY = useTransform(springY, [0, window.innerHeight], [-20, 20]);
  const moveXReverse = useTransform(springX, [0, window.innerWidth], [20, -20]);

  useEffect(() => {
    setMounted(true);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-[#050505] -z-50 overflow-hidden">
      {/* 0. NOISE TEXTURE */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-[1]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* 1. BASE GRADIENT */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_#1a1a1a_0%,_#000000_100%)] opacity-80" />

      {/* 2. PARALLAX BLOBS */}
      <motion.div style={{ x: moveX, y: moveY }} className="absolute inset-0">
        {/* Top Left: Orange */}
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[60%] bg-orange-600/20 rounded-full blur-[120px] mix-blend-screen" />

        {/* Top Right: Purple */}
        <div className="absolute -top-[10%] -right-[20%] w-[70%] h-[60%] bg-purple-700/20 rounded-full blur-[120px] mix-blend-screen" />
      </motion.div>

      <motion.div
        style={{ x: moveXReverse, y: moveY }}
        className="absolute inset-0"
      >
        {/* Bottom Center: Blue anchor */}
        <div className="absolute -bottom-[20%] left-[10%] w-[80%] h-[50%] bg-blue-900/20 rounded-full blur-[100px]" />
      </motion.div>

      {/* 3. PULSING CORE */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-yellow-500/10 rounded-full blur-[90px]"
      />

      {/* 4. RARE SHOOTING STARS */}
      {/* Reduced array size to 2, so only max 2 stars exist at once, but with long delays */}
      {mounted && [...Array(2)].map((_, i) => <RareShootingStar key={i} />)}

      {/* 5. FLOATING DUST PARTICLES */}
      {mounted &&
        [...Array(15)].map((_, i) => {
          const randomX = Math.random() * 100;
          return (
            <motion.div
              key={`dust-${i}`}
              className="absolute bg-white rounded-full shadow-[0_0_8px_white]"
              initial={{ left: `${randomX}%`, top: "110%", opacity: 0 }}
              animate={{ top: "-10%", opacity: [0, 0.6, 0] }}
              transition={{
                duration: Math.random() * 15 + 20,
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

      {/* 6. TECHNO GRID (Faded edges) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(circle at center, black 40%, transparent 100%)",
        }}
      />
    </div>
  );
};

// --- RARE SHOOTING STAR ---
const RareShootingStar = () => {
  const [key, setKey] = useState(0);
  const [config, setConfig] = useState(getRandomConfig());

  function getRandomConfig() {
    const startX = Math.random() * 100;
    const startY = Math.random() * 30; // Top 30% only

    const distance = 30 + Math.random() * 40;
    const angle = (30 + Math.random() * 60) * (Math.PI / 180);
    const direction = startX < 50 ? 1 : -1;

    const endX = startX + Math.cos(angle) * distance * direction;
    const endY = startY + Math.sin(angle) * distance;
    const rotation = direction === 1 ? 45 : -45;

    // DELAY: Between 10 and 25 seconds
    const delay = Math.random() * 15 + 10;

    return { startX, startY, endX, endY, rotation, delay };
  }

  return (
    <motion.div
      key={key}
      initial={{
        left: `${config.startX}%`,
        top: `${config.startY}%`,
        opacity: 0,
        scale: 0,
      }}
      animate={{
        left: `${config.endX}%`,
        top: `${config.endY}%`,
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
      }}
      transition={{
        duration: 1.2, // Fast movement
        ease: "easeInOut",
        delay: config.delay,
      }}
      onAnimationComplete={() => {
        setConfig(getRandomConfig());
        setKey((prev) => prev + 1);
      }}
      className="absolute w-[100px] h-[1px] bg-gradient-to-r from-transparent via-white to-transparent z-0"
      style={{ rotate: config.rotation }}
    >
      <div className="absolute right-1/2 top-1/2 -translate-y-1/2 w-[2px] h-[2px] bg-white rounded-full shadow-[0_0_8px_1px_white]" />
    </motion.div>
  );
};

import React, { memo } from "react";
import { motion } from "framer-motion";

// 1. Static Base64 Noise (Tiny 64x64 repeating pattern)
// Much faster than generating SVG noise in real-time
const NOISE_PATTERN =
  "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwBAMAAAClLOS0AAAAElBMVEUAAAD8/f3///8AAABMmS4AAAAABnRSTlMAMwA1MzMzM7O0dgAAABhJREFUOMtjYBhYwMTEwMTEwMTEwMTEQAAADEAAHh1J5dMAAAAASUVORK5CYII=')";

export const Background = memo(() => {
  return (
    <div className="fixed inset-0 w-full h-full bg-[#050505] -z-50 overflow-hidden translate-z-0">
      {/* 1. FAST NOISE TEXTURE */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: NOISE_PATTERN }}
      />

      {/* 2. STATIC BLOBS (Replaces heavy blur-120px divs) */}
      {/* We use radial gradients combined. This is 1 DOM node vs 3, and 0 blurs. */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background: `
            radial-gradient(circle at 80% 20%, rgba(126, 34, 206, 0.2) 0%, transparent 40%),
            radial-gradient(circle at 20% 20%, rgba(234, 88, 12, 0.2) 0%, transparent 40%),
            radial-gradient(circle at 50% 90%, rgba(30, 58, 138, 0.2) 0%, transparent 50%)
          `,
        }}
      />

      {/* 3. PULSING CORE (CSS Animation) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-yellow-500/5 rounded-full blur-3xl animate-pulse-slow" />

      {/* 4. TECHNO GRID (CSS Gradient) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.2) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(circle at center, black 30%, transparent 100%)",
        }}
      />

      {/* 5. LIGHTWEIGHT DUST (CSS Keyframes) */}
      {/* We reduce count to 6 and use pure CSS animation (zero JS overhead) */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute bg-white/80 rounded-full animate-float-up"
          style={{
            left: `${Math.random() * 100}%`,
            top: "100%",
            width: Math.random() * 2 + 1 + "px",
            height: Math.random() * 2 + 1 + "px",
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${15 + Math.random() * 10}s`,
          }}
        />
      ))}

      {/* 6. SHOOTING STAR (Optimized) */}
      <ShootingStarController />

      {/* Add global styles for animations if not in Tailwind config */}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0); opacity: 0; }
          20% { opacity: 0.5; }
          80% { opacity: 0.5; }
          100% { transform: translateY(-120vh); opacity: 0; }
        }
        .animate-float-up {
          animation: floatUp linear infinite;
          will-change: transform, opacity;
        }
        .animate-pulse-slow {
          animation: pulseSlow 6s ease-in-out infinite;
        }
        @keyframes pulseSlow {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
});

Background.displayName = "Background";

// --- OPTIMIZED SHOOTING STAR ---
// Only mounts one star at a time to save memory
const ShootingStarController = () => {
  const [starKey, setStarKey] = React.useState(0);

  // Trigger a new star every 8-15 seconds roughly
  React.useEffect(() => {
    const timeout = setTimeout(
      () => {
        setStarKey((prev) => prev + 1);
      },
      Math.random() * 8000 + 8000,
    );

    return () => clearTimeout(timeout);
  }, [starKey]);

  return <ShootingStar key={starKey} />;
};

const ShootingStar = memo(() => {
  // Calculate position once on mount
  const style = React.useMemo(() => {
    const startX = Math.random() * 100;
    const startY = Math.random() * 40;
    const angle = 45; // Fixed angle is cheaper to render
    const distance = 200;

    // We use CSS variables to pass random values to keyframes if needed,
    // but standard Framer Motion is fine here for a single element.
    return { startX, startY };
  }, []);

  return (
    <motion.div
      initial={{
        left: `${style.startX}%`,
        top: `${style.startY}%`,
        opacity: 1,
        scale: 0,
        translateX: 0,
        translateY: 0,
      }}
      animate={{ opacity: 0, translateX: 150, translateY: 150, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="absolute w-[80px] h-[1px] bg-gradient-to-r from-transparent via-white to-transparent"
      style={{ rotate: "45deg" }}
    />
  );
});

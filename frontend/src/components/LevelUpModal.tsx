import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import confetti from "canvas-confetti";
import { useUIStore } from "../store/uiStore";
import { Zap, Hand, X } from "lucide-react";

export const LevelUpModal = () => {
  const { levelUp, closeLevelUp } = useUIStore();

  useEffect(() => {
    if (levelUp.isOpen) {
      // 1. Haptic Feedback
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");
      }

      // 2. Continuous Confetti Shower
      const duration = 2500;
      const animationEnd = Date.now() + duration;
      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 150,
      };

      const randomInRange = (min: number, max: number) =>
        Math.random() * (max - min) + min;

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ["#FFD700", "#FFA500", "#ffffff"], // Gold & White
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ["#FFD700", "#FFA500", "#ffffff"],
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [levelUp.isOpen]);

  return (
    <AnimatePresence>
      {levelUp.isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
        >
          {/* THE CARD */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotateX: 20 }}
            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
            exit={{ scale: 0.8, opacity: 0, rotateX: -20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative w-full max-w-sm bg-[#111] rounded-[32px] overflow-hidden border border-yellow-500/30 shadow-[0_0_80px_rgba(234,179,8,0.2)]"
          >
            {/* 1. ANIMATED SUNBURST BACKGROUND */}
            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] opacity-20 pointer-events-none">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-full h-full bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(234,179,8,0.5)_30deg,transparent_60deg,rgba(234,179,8,0.5)_90deg,transparent_120deg,rgba(234,179,8,0.5)_150deg,transparent_180deg)]"
              />
            </div>

            {/* 2. CARD CONTENT */}
            <div className="relative z-10 p-8 flex flex-col items-center">
              {/* Close Button (Subtle) */}
              <button
                onClick={closeLevelUp}
                className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              {/* LEVEL HEADER */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-yellow-500 font-bold tracking-widest text-xs uppercase mb-6 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20"
              >
                Level Up Achieved
              </motion.div>

              {/* MAIN ICON */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-yellow-500 blur-[60px] opacity-40 animate-pulse" />
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="text-9xl drop-shadow-2xl relative z-10"
                >
                  🏆
                </motion.div>
              </div>

              {/* RANK NAME */}
              <motion.h2
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="text-4xl font-black text-white italic tracking-tighter mb-1 text-center bg-gradient-to-br from-white via-yellow-200 to-yellow-600 bg-clip-text text-transparent"
              >
                {levelUp.levelName}
              </motion.h2>

              <p className="text-gray-400 text-sm font-medium mb-8">
                League Unlocked
              </p>

              {/* STATS UPGRADE GRID */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="w-full grid grid-cols-2 gap-3 mb-8"
              >
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center">
                  <div className="bg-purple-500/20 p-2 rounded-full mb-2">
                    <Zap size={16} className="text-purple-400" />
                  </div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold">
                    Energy Limit
                  </span>
                  <span className="text-white font-bold text-lg">+500</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center">
                  <div className="bg-green-500/20 p-2 rounded-full mb-2">
                    <Hand size={16} className="text-green-400" />
                  </div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold">
                    Tap Value
                  </span>
                  <span className="text-white font-bold text-lg">+1</span>
                </div>
              </motion.div>

              {/* ACTION BUTTON */}
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                onClick={closeLevelUp}
                whileTap={{ scale: 0.95 }}
                className="w-full relative overflow-hidden group bg-yellow-500 hover:bg-yellow-400 text-black font-black text-lg py-4 rounded-2xl shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all"
              >
                <span className="relative z-10">CONTINUE</span>

                {/* Shine Effect on Button */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

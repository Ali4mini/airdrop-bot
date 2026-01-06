import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import confetti from "canvas-confetti";
import { useUIStore } from "../store/uiStore";

export const LevelUpModal = () => {
  const { levelUp, closeLevelUp } = useUIStore();

  useEffect(() => {
    if (levelUp.isOpen) {
      // 1. Trigger Vibration
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");
      }

      // 2. Trigger Confetti Cannon
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        // Launch confetti from left corner
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 },
          colors: ["#fbbf24", "#a855f7", "#ffffff"], // Gold, Purple, White
        });
        // Launch confetti from right corner
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.8 },
          colors: ["#fbbf24", "#a855f7", "#ffffff"],
        });

        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [levelUp.isOpen]);

  return (
    <AnimatePresence>
      {levelUp.isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          onClick={closeLevelUp} // Close when clicking background
        >
          <motion.div
            initial={{ scale: 0.5, y: 100, rotateX: 20 }}
            animate={{ scale: 1, y: 0, rotateX: 0 }}
            exit={{ scale: 0.5, y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking card
            className="w-full max-w-xs bg-[#1a1a1a] border-2 border-yellow-500/50 rounded-[2rem] p-8 flex flex-col items-center text-center shadow-[0_0_60px_rgba(234,179,8,0.3)] relative overflow-hidden"
          >
            {/* Background Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent pointer-events-none" />

            {/* Animated Trophy Icon */}
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-8xl mb-6 filter drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]"
            >
              🏆
            </motion.div>

            <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2 drop-shadow-md">
              Level Up!
            </h2>

            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent my-4" />

            <p className="text-gray-400 text-sm mb-8 font-medium">
              You have reached the <br />
              <span className="text-2xl text-yellow-400 font-black block mt-2 drop-shadow-sm">
                {levelUp.levelName} League
              </span>
            </p>

            <button
              onClick={closeLevelUp}
              className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-black text-lg px-8 py-4 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              AWESOME!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

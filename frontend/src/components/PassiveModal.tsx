import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface PassiveModalProps {
  isOpen: boolean;
  earned: number;
  onClose: () => void;
}

export const PassiveModal = ({
  isOpen,
  earned,
  onClose,
}: PassiveModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            className="relative w-full max-w-sm bg-[#1a1a1a] border border-yellow-500/30 rounded-3xl p-6 flex flex-col items-center shadow-[0_0_50px_rgba(234,179,8,0.2)]"
          >
            {/* Decoration */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-7xl drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">
              💤
            </div>

            <h2 className="text-2xl font-black text-white mt-8 mb-2 uppercase tracking-tight text-center">
              Offline Income
            </h2>

            <p className="text-gray-400 text-center text-sm mb-6">
              Your exchange was working while you were away!
            </p>

            <div className="bg-white/5 rounded-2xl p-6 w-full flex flex-col items-center mb-6 border border-white/5">
              <span className="text-yellow-500 font-bold text-5xl mb-1 drop-shadow-lg">
                +{earned.toLocaleString()}
              </span>
              <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                Coins Earned
              </span>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-xl text-lg uppercase tracking-wider transition-all active:scale-95 shadow-[0_0_20px_rgba(234,179,8,0.3)]"
            >
              Collect
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

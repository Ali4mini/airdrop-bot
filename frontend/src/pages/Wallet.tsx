import { motion } from "framer-motion";
import { Wallet as WalletIcon, ArrowRight } from "lucide-react";

export const Wallet = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center px-6 pb-24 text-white relative overflow-hidden">
      {/* Background Decor (Optional Glow) */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/20 blur-[100px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Animated Icon Container */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-yellow-500 blur-2xl opacity-20 animate-pulse" />
          <div className="w-24 h-24 bg-gradient-to-br from-gray-800 to-black rounded-3xl border border-white/10 flex items-center justify-center shadow-2xl relative z-10">
            <WalletIcon size={48} className="text-yellow-500" />
          </div>

          {/* Floating Badge */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: -10, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute -top-2 -right-6 bg-yellow-500 text-black text-[10px] font-black uppercase px-2 py-1 rounded-full shadow-lg transform rotate-12"
          >
            Soon
          </motion.div>
        </div>

        <h1 className="text-3xl font-black mb-2 tracking-tight">Wallet</h1>

        <p className="text-gray-400 text-center text-sm max-w-[260px] leading-relaxed mb-8">
          We are working on integrating{" "}
          <span className="text-white font-bold">TON Connect</span>. Soon you
          will be able to connect your wallet and withdraw your airdrop.
        </p>

        {/* Placeholder UI to look cool */}
        <div className="w-full max-w-xs space-y-3 opacity-50 grayscale select-none pointer-events-none">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-[10px] font-bold">💎</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-300">
                  Connect Wallet
                </span>
                <span className="text-[10px] text-gray-500">TON Network</span>
              </div>
            </div>
            <ArrowRight size={16} className="text-gray-500" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

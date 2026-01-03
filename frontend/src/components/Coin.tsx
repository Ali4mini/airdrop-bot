import { motion } from "framer-motion";

interface CoinProps {
  onTap: (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ) => void;
}

export const Coin = ({ onTap }: CoinProps) => {
  return (
    <div className="relative flex items-center justify-center">
      {/* GLOW EFFECT (Behind the coin) */}
      <div className="absolute inset-0 bg-yellow-500 rounded-full blur-[60px] opacity-20 animate-pulse pointer-events-none" />

      <motion.div
        whileTap={{ scale: 0.95, rotate: 3 }}
        whileHover={{ scale: 1.02 }}
        className="w-80 h-80 cursor-pointer select-none touch-manipulation relative z-10"
        onClick={onTap}
        onTouchStart={onTap}
        style={{
          // Removes blue highlight on mobile tap
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {/* --- LAYER 1: OUTER GOLD RING (The Rim) --- */}
        <div className="w-full h-full rounded-full bg-gradient-to-b from-[#FCD34D] via-[#D97706] to-[#78350F] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.3)]">
          {/* --- LAYER 2: INNER DARK GOLD (The Depth) --- */}
          <div className="w-full h-full rounded-full bg-[#B45309] shadow-[inset_0_5px_10px_rgba(0,0,0,0.4)] p-1 relative overflow-hidden">
            {/* --- LAYER 3: MAIN FACE (The Surface) --- */}
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#FFD700] via-[#F59E0B] to-[#D97706] flex items-center justify-center relative shadow-[inset_0_2px_5px_rgba(255,255,255,0.4)]">
              {/* TEXTURE: Radial Pattern Overlay */}
              <div
                className="absolute inset-0 opacity-20 rounded-full mix-blend-overlay pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle at center, transparent 30%, #78350F 100%), repeating-conic-gradient(#78350F 0deg 5deg, transparent 5deg 10deg)`,
                }}
              />

              {/* BORDER: Inner Decorative Ring */}
              <div className="absolute inset-4 rounded-full border-2 border-[#FEF3C7] opacity-30 border-dashed" />

              {/* ICON / SYMBOL */}
              <span className="text-9xl filter drop-shadow-lg transform -rotate-6 select-none relative z-20">
                🦄
              </span>

              {/* REFLECTION: Top Shine (Glass Effect) */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90%] h-[40%] bg-gradient-to-b from-white/40 to-transparent rounded-t-full blur-[1px] pointer-events-none" />

              {/* REFLECTION: Bottom Rim Light */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[60%] h-[10px] bg-white/20 blur-md rounded-[100%] pointer-events-none" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

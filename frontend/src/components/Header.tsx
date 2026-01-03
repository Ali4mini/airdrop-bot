import { useTelegram } from "../hooks/useTelegram";
import { motion } from "framer-motion";
import { useGameStore } from "../store/gameStore"; // <--- Import Store
import { getLevelInfo } from "../config/levels";

export const Header = () => {
  const { user } = useTelegram();
  const { points, level, levelName } = useGameStore();

  // Calculate live progress for the bar
  const { progress, nextLevelPoints } = getLevelInfo(points);

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName) return "??";
    return `${firstName[0]}${lastName ? lastName[0] : ""}`.toUpperCase();
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 px-4 pt-safe-top mt-2 pointer-events-none">
      <div className="flex justify-between items-start">
        {/* --- LEFT ISLAND --- */}
        <motion.div className="flex items-center gap-3 bg-[#1c1c1e]/80 backdrop-blur-md border border-white/10 rounded-full p-1.5 pr-6 shadow-lg pointer-events-auto">
          {/* Avatar */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#fcd34d] to-[#b45309] flex items-center justify-center text-white font-bold text-sm shadow-inner border-2 border-[#1c1c1e]">
              {getInitials(user?.first_name, user?.last_name)}
            </div>
            {/* Dynamic Level Badge */}
            <div className="absolute -bottom-1 -right-1 bg-blue-500 text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-[#1c1c1e]">
              Lvl {level}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col w-24">
            <span className="text-sm font-bold text-white leading-none truncate">
              {user?.first_name || "Unknown"}
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-yellow-500 font-medium uppercase tracking-wide">
                {levelName}
              </span>
            </div>

            {/* Dynamic Progress Bar */}
            <div className="w-full h-1.5 bg-gray-700 rounded-full mt-1 overflow-hidden relative">
              <motion.div
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600"
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", stiffness: 50 }}
              />
            </div>
            {/* Points to next level text */}
            {nextLevelPoints && (
              <span className="text-[8px] text-gray-500 text-right mt-0.5">
                {points.toLocaleString()} / {nextLevelPoints.toLocaleString()}
              </span>
            )}
          </div>
        </motion.div>
      </div>
    </header>
  );
};

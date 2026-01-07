import { useTelegram } from "../hooks/useTelegram";
import { Wallet, Settings, Star, User } from "lucide-react";
import { motion } from "framer-motion";

export const Header = () => {
  const { user } = useTelegram();

  // Fallback initials if no photo
  const initials = user?.first_name
    ? user.first_name.slice(0, 2).toUpperCase()
    : "??";

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-3"
    >
      {/* Glassmorphic Container */}
      <div className="flex items-center justify-between bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl">
        {/* LEFT: User Profile */}
        <div className="flex items-center gap-3">
          {/* Avatar with Rank Ring */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 p-[2px]">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                {user?.photo_url ? (
                  <img
                    src={user.photo_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-bold text-xs text-yellow-500">
                    {initials}
                  </span>
                )}
              </div>
            </div>

            {/* Online/Status Dot */}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full" />
          </div>

          {/* Name & Badge */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-bold text-sm text-white max-w-[100px] truncate">
                {user?.first_name || "Unknown"}
              </span>
              {user?.is_premium && (
                <Star size={12} className="text-blue-400 fill-blue-400" />
              )}
            </div>
            <span className="text-[10px] text-gray-400 font-medium">
              {user?.is_premium ? "Premium Account" : "Standard Account"}
            </span>
          </div>
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-2">
          {/* Wallet Capsule (Visual Only for now) */}
          <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full px-3 py-1.5 transition-colors group">
            <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/40 transition-colors">
              <Wallet size={12} className="text-blue-400" />
            </div>
            {/* Truncated Address or 'Connect' */}
            <span className="text-[10px] font-bold text-gray-300">Connect</span>
          </button>

          {/* Settings / Menu */}
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 transition-colors">
            <Settings size={18} />
          </button>
        </div>
      </div>
    </motion.header>
  );
};

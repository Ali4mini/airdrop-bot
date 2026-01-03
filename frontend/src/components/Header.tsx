import { useTelegram } from "../hooks/useTelegram";
import { motion } from "framer-motion";

export const Header = () => {
  const { user } = useTelegram();

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName) return "??";
    return `${firstName[0]}${lastName ? lastName[0] : ""}`.toUpperCase();
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 px-4 pt-safe-top mt-2 pointer-events-none">
      <div className="flex justify-between items-start">
        {/* --- LEFT ISLAND: PROFILE & RANK --- */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 bg-[#1c1c1e]/80 backdrop-blur-md border border-white/10 rounded-full p-1.5 pr-6 shadow-lg pointer-events-auto"
        >
          {/* Avatar with Level Ring */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#fcd34d] to-[#b45309] flex items-center justify-center text-white font-bold text-sm shadow-inner border-2 border-[#1c1c1e]">
              {getInitials(user?.first_name, user?.last_name)}
            </div>
            {/* Level Badge (Absolute) */}
            <div className="absolute -bottom-1 -right-1 bg-blue-500 text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-[#1c1c1e]">
              Lvl 1
            </div>
          </div>

          {/* Text Info */}
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white leading-none">
              {user?.first_name || "Unknown"}
            </span>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] text-yellow-500 font-medium uppercase tracking-wide">
                Grandmaster
              </span>
              <span className="text-[10px] text-gray-500">• 1/10</span>
            </div>

            {/* Mini Progress Bar inside the capsule */}
            <div className="w-16 h-1 bg-gray-700 rounded-full mt-1 overflow-hidden">
              <div className="w-[30%] h-full bg-yellow-500 rounded-full" />
            </div>
          </div>
        </motion.div>

        {/* --- RIGHT ISLAND: WALLET / SETTINGS --- */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="pointer-events-auto flex gap-2"
        >
          {/* Wallet Button */}
          <button className="w-10 h-10 bg-[#1c1c1e]/80 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform text-white/80 hover:text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0 3 3 0 016 0h3.75a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v12a2.25 2.25 0 002.25 2.25h12.75a2.25 2.25 0 002.25-2.25V12zM15 12a2.25 2.25 0 11-6 0 2.25 2.25 0 016 0z"
              />
            </svg>
          </button>

          {/* Settings Button */}
          <button className="w-10 h-10 bg-[#1c1c1e]/80 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform text-white/80 hover:text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.212 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </motion.div>
      </div>
    </header>
  );
};

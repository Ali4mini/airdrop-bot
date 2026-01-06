import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: "tap", path: "/", label: "Game", icon: <TapIcon /> },
    { id: "earn", path: "/tasks", label: "Earn", icon: <TasksIcon /> },
    {
      id: "friends",
      path: "/friends",
      label: "Friends",
      icon: <FriendsIcon />,
    },
    { id: "wallet", path: "/wallet", label: "Wallet", icon: <WalletIcon /> },
  ];

  const handleNav = (path: string) => {
    if (location.pathname !== path) {
      // 1. Trigger Haptic Feedback (Crucial for UX)
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred("light");
      }
      navigate(path);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-[360px] z-50">
      {/* 
        GLASS CONTAINER 
        - increased blur (backdrop-blur-2xl)
        - subtle white gradient border
        - deep shadow for depth
      */}
      <div className="flex items-center justify-between bg-black/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-1.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] relative">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;

          return (
            <button
              key={tab.id}
              onClick={() => handleNav(tab.path)}
              className="relative flex-1 flex flex-col items-center justify-center py-3 rounded-[1.5rem] group overflow-hidden"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              {/* ACTIVE BACKGROUND (The "Pill") */}
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-[#2c2c2e] rounded-[1.5rem]"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                >
                  {/* Subtle top-highlight for 3D effect */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-white/20" />
                </motion.div>
              )}

              {/* ICON & LABEL CONTAINER */}
              <div className="relative z-10 flex flex-col items-center gap-1">
                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    y: isActive ? -2 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`text-2xl transition-colors duration-200 ${
                    isActive
                      ? "text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                      : "text-gray-500 group-hover:text-gray-300"
                  }`}
                >
                  {tab.icon}
                </motion.div>

                <span
                  className={`text-[10px] font-bold tracking-wide transition-colors duration-200 ${
                    isActive
                      ? "text-white"
                      : "text-gray-500 group-hover:text-gray-400"
                  }`}
                >
                  {tab.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// --- ICONS (Added a Wallet Icon for completeness) ---

const TapIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-6 h-6"
  >
    <path d="M10.5 18.75a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" />
    <path
      fillRule="evenodd"
      d="M8.625.75A3.375 3.375 0 005.25 4.125v15.75a3.375 3.375 0 003.375 3.375h6.75a3.375 3.375 0 003.375-3.375V4.125A3.375 3.375 0 0015.375.75h-6.75zM7.5 4.125c0-.621.504-1.125 1.125-1.125h6.75c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-6.75A1.125 1.125 0 017.5 19.875V4.125z"
      clipRule="evenodd"
    />
  </svg>
);

const TasksIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-6 h-6"
  >
    <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.035-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.035.84-1.875 1.875-1.875h.75c1.035 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.035.84-1.875 1.875-1.875h.75c1.035 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" />
  </svg>
);

const FriendsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-6 h-6"
  >
    <path
      fillRule="evenodd"
      d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z"
      clipRule="evenodd"
    />
  </svg>
);

const WalletIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-6 h-6"
  >
    <path
      fillRule="evenodd"
      d="M12 2.25a.75.75 0 01.75.75v.756a32.355 32.355 0 015.688.832 3.75 3.75 0 012.56 3.478v2.686c0 .888-.46 1.698-1.23 2.148l.015.02c.486.641.875 1.316 1.163 2.024a.75.75 0 01-1.333.691 10.48 10.48 0 00-1.187-1.986l-1.643-2.19a.75.75 0 01.22-.999c.355-.257.669-.582.917-.954a2.25 2.25 0 00.375-1.241V5.568a2.25 2.25 0 00-1.536-2.086 30.85 30.85 0 00-5.002-.756V2.25A.75.75 0 0112 2.25z"
      clipRule="evenodd"
    />
    <path d="M3.75 12a.75.75 0 01.75.75v6.75c0 .414.336.75.75.75h9a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75H4.5a3.75 3.75 0 01-3.75-3.75v-6a.75.75 0 01.75-.75z" />
    <path
      fillRule="evenodd"
      d="M13.594 11.23a1.5 1.5 0 011.966-1.966l3.437 1.145a.75.75 0 01.442.98 25.13 25.13 0 01-4.088 6.697.75.75 0 01-1.043.056L8.85 13.5a.75.75 0 01-.064-1.054l4.808-1.216z"
      clipRule="evenodd"
    />
  </svg>
);

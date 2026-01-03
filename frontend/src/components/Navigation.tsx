import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: "tap", path: "/", label: "Tap", icon: <TapIcon /> },
    { id: "tasks", path: "/tasks", label: "Tasks", icon: <TasksIcon /> },
    {
      id: "friends",
      path: "/friends",
      label: "Friends",
      icon: <FriendsIcon />,
    },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[350px] z-50 px-4">
      {/* GLASS CAPSULE CONTAINER */}
      <div className="flex items-center justify-between bg-[#1c1c1e]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-2 shadow-2xl relative">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className="relative z-10 flex-1 flex flex-col items-center justify-center py-2 min-h-[64px]"
            >
              {/* Active Tab Background Animation (The "Glow") */}
              {isActive && (
                <motion.div
                  layoutId="active-tab"
                  className="absolute inset-0 bg-gray-700/50 rounded-2xl -z-10"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}

              {/* Icon Container */}
              <div
                className={`transition-colors duration-200 ${
                  isActive ? "text-yellow-400" : "text-gray-500"
                }`}
              >
                {tab.icon}
              </div>

              {/* Text Label */}
              <span
                className={`text-[10px] font-bold mt-1 transition-all duration-200 ${
                  isActive
                    ? "text-white opacity-100"
                    : "text-gray-500 opacity-70"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// --- SVG ICONS (Clean & Modern) ---

const TapIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-6 h-6"
  >
    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.061 1.061l1.59-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.061-1.06l-1.59-1.591a.75.75 0 10-1.061 1.061l1.59 1.59zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
  </svg>
);

const TasksIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-6 h-6"
  >
    <path
      fillRule="evenodd"
      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z"
      clipRule="evenodd"
    />
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
    <path d="M5.082 14.254a6.741 6.741 0 00-4.562 4.756.75.75 0 00.375.842A12.71 12.71 0 0012 21.75a12.709 12.709 0 007.135-2.223.75.75 0 00-1.07-1.06 6.741 6.741 0 01-6.136-1.849.75.75 0 00-1.125 0 6.741 6.741 0 01-6.136 1.849.75.75 0 00-1.07 1.06c.036.036.071.072.106.108a12.723 12.723 0 00-4.408-3.99z" />
  </svg>
);

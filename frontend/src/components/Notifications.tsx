import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { useUIStore } from "../store/uiStore";

export const Notification = () => {
  const { notification, hideNotification } = useUIStore();

  useEffect(() => {
    if (notification.message) {
      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        hideNotification();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.message, hideNotification]);

  // Determine colors based on type
  const getStyles = () => {
    switch (notification.type) {
      case "error":
        return {
          bg: "rgba(239, 68, 68, 0.2)", // Red transparent
          border: "rgba(239, 68, 68, 0.4)",
          dot: "bg-red-500",
          shadow: "shadow-[0_0_20px_rgba(239,68,68,0.3)]",
        };
      case "info":
        return {
          bg: "rgba(59, 130, 246, 0.2)", // Blue transparent
          border: "rgba(59, 130, 246, 0.4)",
          dot: "bg-blue-500",
          shadow: "shadow-[0_0_20px_rgba(59,130,246,0.3)]",
        };
      case "success":
      default:
        return {
          bg: "rgba(16, 185, 129, 0.2)", // Green transparent
          border: "rgba(16, 185, 129, 0.4)",
          dot: "bg-green-500",
          shadow: "shadow-[0_0_20px_rgba(16,185,129,0.3)]",
        };
    }
  };

  const style = getStyles();

  return (
    <AnimatePresence>
      {notification.message && (
        <div className="fixed top-4 left-0 w-full flex justify-center z-[100] pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`
              flex items-center gap-3 px-5 py-3 rounded-full 
              backdrop-blur-xl border ${style.shadow}
            `}
            style={{
              backgroundColor: style.bg,
              borderColor: style.border,
            }}
          >
            {/* Glowing Dot Indicator */}
            <div
              className={`w-2.5 h-2.5 rounded-full ${style.dot} shadow-[0_0_10px_currentColor]`}
            />

            {/* Message Text */}
            <span className="text-sm font-bold text-white tracking-wide drop-shadow-md">
              {notification.message}
            </span>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

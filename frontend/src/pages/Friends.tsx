import { useState } from "react";
import { motion } from "framer-motion";

// Mock Data
const FRIENDS = [
  { id: 1, name: "Alex T.", level: 4, earned: 50000, avatar: "🦁" },
  { id: 2, name: "Sarah J.", level: 2, earned: 12500, avatar: "🦊" },
  { id: 3, name: "Mike R.", level: 1, earned: 2500, avatar: "🐶" },
];

export const Friends = () => {
  const [copied, setCopied] = useState(false);
  const link = "https://t.me/my_bot?start=12345";

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 pb-24 pt-6 px-4">
      {/* 1. HERO TEXT */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ rotate: -10, scale: 0.8 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-6xl mb-2"
        >
          🤝
        </motion.div>
        <h1 className="text-3xl font-black text-white">Invite Friends!</h1>
        <p className="text-gray-400 text-sm mt-2">
          You and your friend will receive bonuses
        </p>
      </div>

      {/* 2. REWARD CARDS (The "Offer") */}
      <div className="flex flex-col gap-3 mb-8">
        {/* Card 1: Regular */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-[#1c1c1e] rounded-2xl p-4 flex items-center gap-4 border border-white/5 relative overflow-hidden"
        >
          <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-2xl">
            🎁
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white">Invite a friend</span>
            <span className="text-yellow-500 font-bold text-sm flex items-center gap-1">
              <span className="w-1 h-1 bg-yellow-500 rounded-full"></span>
              +2,500 for you and your friend
            </span>
          </div>
        </motion.div>

        {/* Card 2: Premium (Highlighted) */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-2xl p-4 flex items-center gap-4 border border-blue-500/30 relative overflow-hidden"
        >
          {/* Shine effect */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-[50px] -mr-10 -mt-10"></div>

          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-2xl relative z-10">
            💎
          </div>
          <div className="flex flex-col relative z-10">
            <span className="font-bold text-white">
              Friend with Telegram Premium
            </span>
            <span className="text-blue-400 font-bold text-sm flex items-center gap-1">
              <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
              +25,000 for you and your friend
            </span>
          </div>
        </motion.div>
      </div>

      {/* 3. LIST OF FRIENDS */}
      <div className="mb-4">
        <h2 className="font-bold text-lg mb-4 text-white">
          List of your friends ({FRIENDS.length})
        </h2>

        {FRIENDS.length === 0 ? (
          <div className="text-center py-10 opacity-50 bg-[#1c1c1e] rounded-xl border border-dashed border-gray-700">
            <span className="text-4xl block mb-2">😢</span>
            You haven't invited anyone yet
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {FRIENDS.map((friend, i) => (
              <motion.div
                key={friend.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#1c1c1e]/50 backdrop-blur-md rounded-xl p-3 flex items-center justify-between border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-xl">
                    {friend.avatar}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-white">
                      {friend.name}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Level {friend.level}
                    </span>
                  </div>
                </div>
                <div className="text-yellow-500 font-mono font-bold text-sm">
                  +{friend.earned.toLocaleString()}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 4. FIXED BOTTOM ACTIONS */}
      {/* We add a fixed container at the bottom (above nav) for the Invite Buttons */}
      <div className="fixed bottom-24 left-0 w-full px-4 z-20">
        <div className="flex gap-2">
          {/* Invite Button (Big) */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex-1 bg-white text-black font-black text-lg py-4 mb-4 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:bg-gray-100 transition-colors"
          >
            Invite a friend
          </motion.button>

          {/* Copy Button (Small) */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleCopy}
            className="w-16 mb-4 bg-[#1c1c1e] rounded-2xl flex items-center justify-center border border-white/10"
          >
            {copied ? (
              <span className="text-green-500 text-xl">✓</span>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6 text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5"
                />
              </svg>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

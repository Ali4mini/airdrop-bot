import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "../api/client"; // Ensure this points to your API client

interface FriendInfo {
  user_id: string;
  first_name: string;
  earned: number;
  joined_at: number; // Unix timestamp
}

interface ReferralData {
  referral_info: {
    referral_code: string;
    link: string;
  };
  friends: FriendInfo[];
  total_earned: number;
  friends_count: number;
}

export const Friends = ({ userId }: { userId: number }) => {
  const [data, setData] = useState<ReferralData | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        setLoading(true);
        // This calls the FastAPI endpoint @router.get("/")
        const response = await api.getReferralInfo(userId);
        setData(response);
        setError(null);
      } catch (err) {
        console.error("Error fetching referral data:", err);
        setError("Failed to load referral data");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchReferralData();
    }
  }, [userId]);

  const handleCopy = () => {
    if (!data?.referral_info.link) return;

    navigator.clipboard.writeText(data.referral_info.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInviteTelegram = () => {
    if (!data?.referral_info.link) return;

    // Optional: Use the Telegram share URL format for a better UX:
    // This pre-fills a message for the user to send to their friends
    const shareText = encodeURIComponent(
      "Join me on this awesome app and get 2,500 points!",
    );
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(data.referral_info.link)}&text=${shareText}`;

    window.open(shareUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="flex-1 pb-24 pt-6 px-4 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-400 font-medium">Loading rewards...</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 pb-24 pt-6 px-4 flex items-center justify-center">
        <div className="text-red-500 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
          {error || "Something went wrong"}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 pb-32 pt-6 px-4">
      {/* 1. HERO TEXT */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ rotate: -10, scale: 0.8 }}
          animate={{ rotate: 0, scale: 1 }}
          className="text-6xl mb-2"
        >
          🤝
        </motion.div>
        <h1 className="text-3xl font-black text-white">Invite Friends!</h1>
        <p className="text-gray-400 text-sm mt-2">
          You and your friend will receive bonuses
        </p>
      </div>

      {/* 2. REWARD CARDS */}
      <div className="flex flex-col gap-3 mb-8">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-[#1c1c1e] rounded-2xl p-4 flex items-center gap-4 border border-white/5"
        >
          <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-2xl">
            🎁
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white">Invite a friend</span>
            <span className="text-yellow-500 font-bold text-sm flex items-center gap-1">
              +2,500 for you and your friend
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-2xl p-4 flex items-center gap-4 border border-blue-500/30 relative overflow-hidden"
        >
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-2xl relative z-10">
            💎
          </div>
          <div className="flex flex-col relative z-10">
            <span className="font-bold text-white">Friend with Premium</span>
            <span className="text-blue-400 font-bold text-sm flex items-center gap-1">
              +25,000 for you and your friend
            </span>
          </div>
        </motion.div>
      </div>

      {/* 3. LIST OF FRIENDS */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg text-white">
            Your Friends ({data.friends_count})
          </h2>
          <span className="text-yellow-500 text-sm font-bold">
            Total Earned: {data.total_earned.toLocaleString()}
          </span>
        </div>

        {data.friends.length === 0 ? (
          <div className="text-center py-10 opacity-50 bg-[#1c1c1e] rounded-xl border border-dashed border-gray-700">
            <span className="text-4xl block mb-2">😢</span>
            You haven't invited anyone yet
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {data.friends.map((friend, i) => (
              <motion.div
                key={friend.user_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#1c1c1e]/50 backdrop-blur-md rounded-xl p-3 flex items-center justify-between border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-lg font-bold text-white">
                    {friend.first_name[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-white">
                      {friend.first_name}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Joined{" "}
                      {new Date(friend.joined_at * 1000).toLocaleDateString()}
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
      <div className="fixed bottom-24 left-0 w-full px-4 z-20">
        <div className="flex gap-2 max-w-md mx-auto">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleInviteTelegram}
            className="flex-1 bg-white text-black font-black text-lg py-4 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            Invite via Telegram
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleCopy}
            className="w-16 bg-[#1c1c1e] rounded-2xl flex items-center justify-center border border-white/10"
          >
            {copied ? (
              <span className="text-green-500 text-xl font-bold">✓</span>
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

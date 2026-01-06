import { motion } from "framer-motion";
import { Check, Lock } from "lucide-react"; // Assuming you use lucide-react or similar icons
import type { DailyReward as DailyRewardType } from "../types";
import { useCountdown, getNextMidnightUTC } from "../hooks/useCountdown";

interface DailyRewardProps {
  rewards: DailyRewardType[];
  currentStreak: number; // The user's current streak (e.g. 2 means they finished day 2)
  lastCheckIn: string | null; // Timestamp
  onClaim: (day: number) => void;
  isClaiming: boolean;
}

export const DailyReward = ({
  rewards,
  currentStreak,
  lastCheckIn,
  onClaim,
  isClaiming,
}: DailyRewardProps) => {
  // Logic: Check if claimed TODAY (UTC)
  const hasClaimedToday = () => {
    if (!lastCheckIn || lastCheckIn === "null") return false;
    const lastDate = new Date(parseInt(lastCheckIn) * 1000)
      .toISOString()
      .split("T")[0];
    const today = new Date().toISOString().split("T")[0];
    return lastDate === today;
  };

  const claimedToday = hasClaimedToday();
  const nextDayToClaim = currentStreak + 1;

  // Timer for next claim
  const nextResetTime = getNextMidnightUTC();
  const countdown = useCountdown(claimedToday ? nextResetTime : null);

  return (
    <div className="w-full bg-white/5 backdrop-blur-md rounded-2xl p-4 mb-6 border border-white/10 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-bold">Daily Rewards</h2>
          <p className="text-xs text-gray-400">Log in daily to earn more!</p>
        </div>

        {claimedToday && (
          <div className="text-right">
            <span className="text-[10px] uppercase text-gray-400 font-bold">
              Next Reward
            </span>
            <div className="font-mono text-yellow-500 font-bold">
              {countdown}
            </div>
          </div>
        )}
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {rewards.map((day) => {
          // Status Logic
          const isCompleted = day.day <= currentStreak;
          const isCurrent = day.day === nextDayToClaim;
          const isLocked = day.day > nextDayToClaim;

          return (
            <div
              key={day.day}
              className={`
                relative flex flex-col items-center justify-center p-2 rounded-xl border
                ${isCompleted ? "bg-green-500/20 border-green-500/50" : ""}
                ${isCurrent && !claimedToday ? "bg-yellow-500/20 border-yellow-500 animate-pulse" : ""}
                ${isLocked || (isCurrent && claimedToday) ? "bg-black/20 border-white/5 opacity-50" : ""}
              `}
            >
              <span className="text-[10px] uppercase font-bold text-gray-400 mb-1">
                Day {day.day}
              </span>

              {isCompleted ? (
                <div className="bg-green-500 rounded-full p-1">
                  <Check size={12} className="text-black" />
                </div>
              ) : isLocked ? (
                <Lock size={12} className="text-gray-500" />
              ) : (
                <span className="text-xs font-bold text-yellow-400">
                  {day.reward / 1000}K
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Claim Button */}
      {!claimedToday && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onClaim(nextDayToClaim)}
          disabled={isClaiming}
          className={`
            w-full py-3 rounded-xl font-bold uppercase tracking-widest text-sm shadow-lg
            ${
              isClaiming
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-yellow-500 text-black hover:bg-yellow-400"
            }
          `}
        >
          {isClaiming ? "Claiming..." : "Claim Reward"}
        </motion.button>
      )}
    </div>
  );
};

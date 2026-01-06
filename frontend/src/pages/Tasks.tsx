import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { UserTasksResponse } from "../types";

export const Tasks = ({ userId }: { userId: number }) => {
  // Accept userId as prop
  const [tasksData, setTasksData] = useState<UserTasksResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [userId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await api.getUserTasks(userId);
      setTasksData(data);
      setError(null);
    } catch (err) {
      setError("Failed to load tasks");
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskComplete = async (taskId: string) => {
    try {
      await api.completeTask(userId, taskId);
      // Refresh tasks after completion
      fetchTasks();
    } catch (err) {
      console.error("Error completing task:", err);
    }
  };

  const handleTaskClaim = async (taskId: string) => {
    try {
      await api.claimTaskReward(userId, taskId);
      // Refresh tasks after claiming
      fetchTasks();
    } catch (err) {
      console.error("Error claiming task reward:", err);
    }
  };

  const handleDailyRewardClaim = async (day: number) => {
    try {
      await api.claimDailyReward(userId, day);
      // Refresh tasks after claiming daily reward
      fetchTasks();
    } catch (err) {
      console.error("Error claiming daily reward:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 pb-20 pt-6 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 pb-20 pt-6 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!tasksData) {
    return (
      <div className="flex-1 pb-20 pt-6 flex items-center justify-center">
        <div className="text-white">No tasks available</div>
      </div>
    );
  }

  // Determine which daily reward should be active (the next unclaimed day)
  const getNextActiveDay = () => {
    if (!tasksData.daily_rewards || tasksData.daily_rewards.length === 0)
      return null;

    // Sort rewards by day to ensure proper order
    const sortedRewards = [...tasksData.daily_rewards].sort(
      (a, b) => a.day - b.day,
    );

    // Find the first unclaimed day
    for (let i = 0; i < sortedRewards.length; i++) {
      if (!sortedRewards[i].is_claimed) {
        return sortedRewards[i].day;
      }
    }

    // If all are claimed, return null (no active day)
    return null;
  };

  const activeDay = getNextActiveDay();

  return (
    <div className="flex-1 pb-20 pt-6">
      <div className="flex flex-col items-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mb-4 border border-yellow-500/30 shadow-[0_0_40px_rgba(234,179,8,0.2)]"
        >
          <span className="text-6xl filter drop-shadow-lg">💰</span>
        </motion.div>
        <h1 className="text-3xl font-black text-white text-center">
          Earn Coins
        </h1>
        <p className="text-gray-400 text-center text-sm mt-1 max-w-[200px]">
          Complete tasks and check in daily to maximize your earnings.
        </p>
      </div>

      {/* DAILY REWARDS */}
      <div className="mb-8">
        <div className="flex justify-between items-center px-4 mb-3">
          <h2 className="font-bold text-lg">Daily Rewards</h2>
          <span className="text-xs text-yellow-500 font-medium cursor-pointer">
            See all
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto px-4 pb-4 no-scrollbar">
          {tasksData.daily_rewards.map((dayReward) => {
            const isCurrent =
              activeDay === dayReward.day && !dayReward.is_claimed;

            return (
              <div
                key={dayReward.day}
                className={`flex-shrink-0 w-20 h-28 rounded-xl flex flex-col items-center justify-center gap-1 border relative overflow-hidden transition-all
                  ${
                    dayReward.is_claimed
                      ? "bg-green-500/20 border-green-500/50"
                      : isCurrent
                        ? "bg-gradient-to-b from-yellow-600/20 to-yellow-900/20 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                        : "bg-[#1c1c1e] border-white/5 opacity-60"
                  }
                `}
              >
                <span className="text-xs text-gray-400 font-bold uppercase">
                  Day {dayReward.day}
                </span>
                <span className="text-2xl">
                  {dayReward.day === 7 ? "🎁" : "🪙"}
                </span>
                <span
                  className={`text-[10px] font-bold ${dayReward.is_claimed ? "text-green-400" : "text-white"}`}
                >
                  {dayReward.reward >= 1000
                    ? `${dayReward.reward / 1000}K`
                    : dayReward.reward}
                </span>
                {!dayReward.is_claimed && isCurrent && (
                  <button
                    onClick={() => handleDailyRewardClaim(dayReward.day)}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] cursor-pointer"
                  >
                    <span className="text-yellow-400 text-xl font-bold">
                      Claim
                    </span>
                  </button>
                )}
                {dayReward.is_claimed && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                    <span className="text-green-400 text-xl font-bold">✓</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* TASK LIST */}
      <div className="px-4">
        <h2 className="font-bold text-lg mb-4">Task List</h2>
        <div className="flex flex-col gap-3">
          {tasksData.tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#1c1c1e] rounded-2xl p-4 flex items-center justify-between border border-white/5 hover:border-yellow-500/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#2c2c2e] flex items-center justify-center text-2xl shadow-inner">
                  {task.icon}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-white leading-tight mb-1">
                    {task.title}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500 text-xs">🪙</span>
                    <span className="text-yellow-500 text-xs font-bold">
                      +{task.reward.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              {task.status === "claimed" ? (
                <span className="text-green-500 font-bold text-sm flex items-center gap-1">
                  Done ✓
                </span>
              ) : (
                <button
                  onClick={() => {
                    if (task.status === "pending") {
                      handleTaskComplete(task.id);
                    } else if (task.status === "completed") {
                      handleTaskClaim(task.id);
                    }
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95
                  ${task.status === "pending" ? "bg-gray-700 text-gray-300" : "bg-white text-black hover:bg-yellow-400"}`}
                >
                  {task.status === "pending" ? "Check" : "Start"}
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

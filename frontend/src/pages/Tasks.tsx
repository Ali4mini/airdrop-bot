import { useEffect, useState } from "react";
import { useTelegram } from "../hooks/useTelegram";
import { api } from "../api/client";
import { DailyReward } from "../components/DailyReward";
import { useGameStore } from "../store/gameStore";
import { useCountdown, getNextMidnightUTC } from "../hooks/useCountdown";
import { motion } from "framer-motion";
import type { Task, DailyReward as DailyRewardType } from "../types";

// Icons (Replace with whatever library you use, e.g., lucide-react)
const IconMap: Record<string, string> = {
  "📱": "📱",
  "🐦": "🐦",
  "📺": "📺",
  "👥": "👥",
};

export const Tasks = () => {
  const { user } = useTelegram();
  const { setGameState } = useGameStore(); // To update coins after claim

  const [tasks, setTasks] = useState<Task[]>([]);
  const [dailyRewards, setDailyRewards] = useState<DailyRewardType[]>([]);
  const [streak, setStreak] = useState(0);
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [claimingDay, setClaimingDay] = useState(false);
  const [claimingTask, setClaimingTask] = useState<string | null>(null);

  // Countdown for "New Tasks" (Synced to Midnight UTC)
  const nextRefresh = getNextMidnightUTC();
  const refreshCountdown = useCountdown(nextRefresh);

  const fetchData = async () => {
    if (!user?.id) return;
    try {
      const data = await api.getUserTasks(user.id);
      setTasks(data.tasks);
      setDailyRewards(data.daily_rewards);
      setStreak(data.current_streak);
      setLastCheckIn(data.last_check_in);

      // Also update game points in store to match server
      setGameState({ points: data.coins });
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  // Handlers
  const handleDailyClaim = async (day: number) => {
    if (!user?.id) return;
    setClaimingDay(true);
    try {
      const res = await api.claimDailyReward(user.id, day);
      if (res.success) {
        // Optimistic UI updates
        setStreak(day);
        setLastCheckIn(Math.floor(Date.now() / 1000).toString());
        setGameState({ points: res.new_coins });
        // Optional: Show success toast
      }
    } catch (e) {
      console.error(e);
      // Optional: Show error toast
    } finally {
      setClaimingDay(false);
    }
  };

  const handleTaskAction = async (task: Task) => {
    if (!user?.id) return;
    setClaimingTask(task.id);

    try {
      if (task.status === "pending") {
        // 1. Start/Check Task
        if (task.type === "social") {
          // Open Link logic here
          window.open("https://telegram.org", "_blank");
        }

        // 2. Complete on backend
        const res = await api.completeTask(user.id, task.id);
        if (res.success) {
          setTasks((prev) =>
            prev.map((t) =>
              t.id === task.id ? { ...t, status: "completed" } : t,
            ),
          );
        }
      } else if (task.status === "completed") {
        // 3. Claim Reward
        const res = await api.claimTaskReward(user.id, task.id);
        if (res.success) {
          setGameState({ points: res.new_coins });
          setTasks((prev) =>
            prev.map((t) =>
              t.id === task.id ? { ...t, status: "claimed" } : t,
            ),
          );
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setClaimingTask(null);
    }
  };

  if (loading)
    return <div className="text-white text-center pt-20">Loading tasks...</div>;

  return (
    <div className="w-full h-full overflow-y-auto px-4 pt-6 pb-24 text-white">
      <h1 className="text-3xl font-black mb-6 text-center">Earn Coins</h1>

      {/* DAILY REWARD SECTION */}
      <DailyReward
        rewards={dailyRewards}
        currentStreak={streak}
        lastCheckIn={lastCheckIn}
        onClaim={handleDailyClaim}
        isClaiming={claimingDay}
      />

      {/* TASKS LIST HEADER */}
      <div className="flex justify-between items-end mb-4 px-1">
        <h2 className="text-lg font-bold">Available Tasks</h2>
        <div className="text-right">
          <span className="text-[10px] text-gray-400 uppercase font-bold block">
            New Tasks In
          </span>
          <span className="font-mono text-xs text-yellow-500">
            {refreshCountdown}
          </span>
        </div>
      </div>

      {/* TASKS LIST */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
              flex items-center justify-between p-4 rounded-2xl border 
              ${task.status === "claimed" ? "bg-white/5 border-white/5 opacity-60" : "bg-black/20 border-white/10"}
            `}
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">
                {IconMap[task.icon] || task.icon}
              </span>
              <div>
                <h3 className="font-bold text-sm">{task.title}</h3>
                <span className="text-yellow-500 font-mono text-xs font-bold">
                  +{task.reward.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleTaskAction(task)}
              disabled={claimingTask === task.id || task.status === "claimed"}
              className={`
                px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide min-w-[90px]
                ${task.status === "pending" ? "bg-white text-black hover:bg-gray-200" : ""}
                ${task.status === "completed" ? "bg-yellow-500 text-black animate-pulse" : ""}
                ${task.status === "claimed" ? "bg-transparent text-gray-500 border border-gray-600" : ""}
              `}
            >
              {claimingTask === task.id
                ? "..."
                : task.status === "pending"
                  ? "Start"
                  : task.status === "completed"
                    ? "Claim"
                    : "Done"}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

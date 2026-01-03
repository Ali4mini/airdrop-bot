import { motion } from "framer-motion";
import { TASKS_DATA, DAILY_REWARDS_DATA } from "../data/mocks"; // <--- Import Data
// Note: In a real app, you would fetch this data in a useEffect

export const Tasks = () => {
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

      {/* 2. DAILY REWARDS */}
      <div className="mb-8">
        <div className="flex justify-between items-center px-4 mb-3">
          <h2 className="font-bold text-lg">Daily Rewards</h2>
          <span className="text-xs text-yellow-500 font-medium cursor-pointer">
            See all
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto px-4 pb-4 no-scrollbar">
          {DAILY_REWARDS_DATA.map((day) => {
            // Logic to determine active day (mock logic)
            const isCurrent =
              !day.isClaimed && DAILY_REWARDS_DATA[day.day - 2]?.isClaimed;

            return (
              <div
                key={day.day}
                className={`flex-shrink-0 w-20 h-28 rounded-xl flex flex-col items-center justify-center gap-1 border relative overflow-hidden transition-all
                  ${
                    day.isClaimed
                      ? "bg-green-500/20 border-green-500/50"
                      : isCurrent
                        ? "bg-gradient-to-b from-yellow-600/20 to-yellow-900/20 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                        : "bg-[#1c1c1e] border-white/5 opacity-60"
                  }
                `}
              >
                <span className="text-xs text-gray-400 font-bold uppercase">
                  Day {day.day}
                </span>
                <span className="text-2xl">{day.day === 7 ? "🎁" : "🪙"}</span>
                <span
                  className={`text-[10px] font-bold ${day.isClaimed ? "text-green-400" : "text-white"}`}
                >
                  {day.reward >= 1000 ? `${day.reward / 1000}K` : day.reward}
                </span>
                {day.isClaimed && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                    <span className="text-green-400 text-xl font-bold">✓</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. TASK LIST */}
      <div className="px-4">
        <h2 className="font-bold text-lg mb-4">Task List</h2>
        <div className="flex flex-col gap-3">
          {TASKS_DATA.map((task, index) => (
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

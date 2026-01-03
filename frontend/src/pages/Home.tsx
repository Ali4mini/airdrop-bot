import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../store/gameStore";
import { useTelegram } from "../hooks/useTelegram";
import { api } from "../api/client"; // Import our Axios client
import { Coin } from "../components/Coin";

export const Home = () => {
  const {
    points,
    energy,
    maxEnergy,
    incrementPoints,
    decrementEnergy,
    restoreEnergy,
    setGameState, // We use this to sync with server truth
  } = useGameStore();

  const { user } = useTelegram();
  const [clicks, setClicks] = useState<{ id: number; x: number; y: number }[]>(
    [],
  );

  // Ref to track taps that haven't been sent to server yet
  // We use a Ref because we don't want to re-render the component just because this number changes
  const unsyncedTaps = useRef(0);

  // 1. INITIAL LOAD: Login to Backend
  useEffect(() => {
    if (user) {
      api
        .login(user)
        .then((data) => {
          console.log("Logged in:", data);
          setGameState(data.gameState);
        })
        .catch((err) => console.error("Login failed:", err));
    }
    // CHANGE THIS LINE:
    // Old: }, [user, setGameState]);
    // New: Only run if the ID changes
  }, [user?.id, setGameState]);

  // 2. SYNC LOOP: Send accumulated taps every 2 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (user && unsyncedTaps.current > 0) {
        const tapsToSend = unsyncedTaps.current;

        try {
          // Send request via Axios
          const serverState = await api.syncTaps(user.id, tapsToSend);

          // Reset the accumulator only after success
          unsyncedTaps.current -= tapsToSend;

          // Optional: Strictly force server state?
          // Usually better to let local state drift slightly for smoothness,
          // but syncing here prevents cheating.
          // setGameState(serverState);
        } catch (error) {
          console.error("Failed to sync taps:", error);
          // If it fails, we keep the taps in unsyncedTaps and try again next loop
        }
      }
    }, 200); // Sync every .2 seconds

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => {
      restoreEnergy(1);
    }, 1000); // Runs every 1000ms no matter what

    return () => clearInterval(timer);
  }, [restoreEnergy]); // Only depends on the function, not the 'energy' value

  // 3. TAP HANDLER (Optimistic UI Update)
  const handleTap = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ) => {
    if (energy <= 0) return;

    // 1. Coordinates for animation
    const clientX =
      "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY =
      "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    // 2. Update Local Store (Instant Feedback)
    incrementPoints(1);
    decrementEnergy(1);

    // 3. Accumulate for Server Sync
    unsyncedTaps.current += 1;

    // 4. Trigger Animation
    const id = Date.now();
    setClicks((prev) => [...prev, { id, x: clientX, y: clientY }]);
    setTimeout(() => {
      setClicks((prev) => prev.filter((c) => c.id !== id));
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col items-center pt-8 relative z-10 min-h-0">
      {/* STATS DASHBOARD */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-sm mb-6 px-4">
        <div className="bg-[#1c1c1e] rounded-xl p-2 flex flex-col items-center border border-white/5 shadow-lg">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">
            Profit/Hr
          </span>
          <span className="text-sm font-bold text-white">+12.5k</span>
        </div>
        <div className="bg-[#1c1c1e] rounded-xl p-2 flex flex-col items-center border border-white/5 shadow-lg">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">
            League
          </span>
          <span className="text-sm font-bold text-yellow-500">Bronze</span>
        </div>
        <div className="bg-[#1c1c1e] rounded-xl p-2 flex flex-col items-center border border-white/5 shadow-lg">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">
            Energy
          </span>
          <span className="text-sm font-bold text-white">Full</span>
        </div>
      </div>

      {/* MAIN SCORE */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-yellow-500 border-2 border-yellow-300 flex items-center justify-center shadow-[0_0_10px_rgba(234,179,8,0.5)]">
          <span className="text-xl">🦄</span>
        </div>
        <span className="text-5xl font-black text-white drop-shadow-lg font-mono">
          {points.toLocaleString()}
        </span>
      </div>

      {/* COIN COMPONENT */}
      <div className="flex-grow flex items-center justify-center mb-4">
        <Coin onTap={handleTap} />
      </div>

      {/* FLOATING NUMBERS */}
      {clicks.map((click) => (
        <div
          key={click.id}
          className="absolute text-4xl font-bold text-white pointer-events-none z-50"
          style={{ top: click.y - 40, left: click.x }}
        >
          <motion.div
            initial={{ opacity: 1, y: 0, scale: 0.5 }}
            animate={{ opacity: 0, y: -100, scale: 1.2 }}
            transition={{ duration: 0.6 }}
            className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
          >
            +1
          </motion.div>
        </div>
      ))}

      {/* ENERGY BAR */}
      <div className="w-full max-w-xs px-4 mb-2">
        <div className="flex justify-between text-xs font-bold text-gray-400 mb-1 uppercase tracking-wide">
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">⚡</span>
            <span>Energy</span>
          </div>
          <span>
            {Math.floor(Number.isNaN(energy) ? 0 : energy)} /{" "}
            {maxEnergy || 1000}
          </span>
        </div>

        <div className="w-full bg-[#2d2d2d] rounded-full h-3 overflow-hidden border border-white/5 relative">
          {/* Background track */}
          <div className="absolute inset-0 bg-black/20" />

          <motion.div
            className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 relative z-10"
            // SAFEGUARD: Ensure percentage is between 0 and 100
            animate={{
              width: `${Math.min(100, Math.max(0, (energy / maxEnergy) * 100))}%`,
            }}
            transition={{ type: "spring", stiffness: 50, damping: 10 }}
          />
        </div>
      </div>
    </div>
  );
};

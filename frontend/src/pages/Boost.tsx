import { motion } from "framer-motion";
import { useGameStore } from "../store/gameStore";

export const Boost = ({ onBack }: { onBack: () => void }) => {
  const { points, tapValue, maxEnergy, energyRegen } = useGameStore();

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="fixed inset-0 z-50 flex flex-col p-6 bg-black/60 backdrop-blur-xl overflow-y-auto"
    >
      <div className="flex items-center mb-8">
        <button onClick={onBack} className="text-white text-3xl mr-4">
          ✕
        </button>
        <h1 className="text-2xl font-bold text-white">Boosters</h1>
      </div>

      <div className="text-center mb-10 bg-white/5 backdrop-blur-lg py-6 rounded-3xl border border-white/10 shadow-2xl">
        <p className="text-gray-400 text-xs uppercase tracking-widest mb-1 font-bold">
          Your Balance
        </p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-3xl">🦄</span>
          <span className="text-4xl font-black text-white">
            {points.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="space-y-4 pb-10">
        <h2 className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] px-2">
          Upgrades
        </h2>
        <UpgradeCard
          icon="👆"
          title="Multitap"
          level={tapValue}
          cost={tapValue * 1000}
          desc={`+1 per tap`}
        />
        <UpgradeCard
          icon="🔋"
          title="Energy Limit"
          level={maxEnergy / 500}
          cost={(maxEnergy / 500) * 1000}
          desc="+500 capacity"
        />
        <UpgradeCard
          icon="⚡"
          title="Recharge Speed"
          level={energyRegen}
          cost={energyRegen * 2500}
          desc="+1/sec regen"
        />
      </div>
    </motion.div>
  );
};

const UpgradeCard = ({ icon, title, level, cost, desc }: any) => (
  <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center justify-between active:scale-[0.98] transition-all shadow-lg">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-black/40 rounded-xl flex items-center justify-center text-2xl border border-white/10 shadow-inner">
        {icon}
      </div>
      <div>
        <h3 className="text-white font-bold text-sm">{title}</h3>
        <p className="text-[10px] text-gray-400 font-bold uppercase">
          {desc} • Level {level}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-2 bg-yellow-500/10 px-3 py-2 rounded-xl border border-yellow-500/20">
      <span className="text-xs">🦄</span>
      <span className="text-white font-black text-xs">
        {cost >= 1000 ? cost / 1000 + "k" : cost}
      </span>
    </div>
  </div>
);

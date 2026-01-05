import { useGameStore } from "../store/gameStore";

export const Boost = ({ onBack }: { onBack: () => void }) => {
  const { points, tapValue, maxEnergy, energyRegen } = useGameStore();

  // Pricing formula: level * 1000
  const multitapCost = tapValue * 1000;
  const energyCost = (maxEnergy / 500) * 1000;

  return (
    <div className="w-full h-full bg-black p-6 flex flex-col">
      <div className="flex items-center mb-8">
        <button onClick={onBack} className="text-white text-3xl mr-4">
          ✕
        </button>
        <h1 className="text-2xl font-bold text-white">Boosters</h1>
      </div>

      <div className="text-center mb-10 bg-[#1c1c1e] py-6 rounded-3xl border border-white/5">
        <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">
          Your Balance
        </p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-3xl">🦄</span>
          <span className="text-4xl font-black text-white">
            {points.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-white/50 text-xs font-bold uppercase tracking-widest px-2">
          Upgrades
        </h2>

        <UpgradeCard
          icon="👆"
          title="Multitap"
          level={tapValue}
          cost={multitapCost}
          desc={`+1 per tap`}
        />

        <UpgradeCard
          icon="🔋"
          title="Energy Limit"
          level={maxEnergy / 500}
          cost={energyCost}
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
    </div>
  );
};

const UpgradeCard = ({ icon, title, level, cost, desc }: any) => (
  <div className="bg-[#1c1c1e] p-4 rounded-2xl border border-white/5 flex items-center justify-between active:bg-[#2c2c2e]">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-black/40 rounded-xl flex items-center justify-center text-2xl border border-white/5">
        {icon}
      </div>
      <div>
        <h3 className="text-white font-bold text-sm">{title}</h3>
        <p className="text-[10px] text-gray-500 font-bold uppercase">
          {desc} • Level {level}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg border border-white/5">
      <span className="text-xs">🦄</span>
      <span className="text-white font-bold text-sm">
        {cost >= 1000 ? cost / 1000 + "k" : cost}
      </span>
    </div>
  </div>
);

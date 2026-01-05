import { create } from "zustand";
import type { GameState } from "../types";
import { getLevelInfo } from "../config/levels";

interface GameStore extends GameState {
  // Actions
  incrementPoints: () => void;
  decrementEnergy: () => void;
  restoreEnergy: (amount: number) => void;
  setGameState: (state: any) => void;

  // UI Helpers (Calculated)
  levelName: string;
  tapValue: number; // The total value (Base + Boost)
  energyRegen: number; // The total regen (Base + Boost)
  progress: number; // 0-100 for the progress bar
}

export const useGameStore = create<GameStore>((set, get) => ({
  // --- Initial Game State ---
  points: 0,
  energy: 1000,
  maxEnergy: 1000,
  level: 1,

  // Upgrade Levels (Default to 1)
  multitapLevel: 1,
  energyLimitLevel: 1,
  rechargeSpeedLevel: 1,
  tapBotLevel: 0,

  // --- UI Helper Defaults ---
  levelName: "Bronze",
  tapValue: 1,
  energyRegen: 1,
  progress: 0,

  // --- Logic: Tap Coin ---
  incrementPoints: () =>
    set((state) => {
      // 1. Get Base Stats from current League
      const currentInfo = getLevelInfo(state.points);

      // 2. Calculate Total Power
      // Formula: League Base + (Multitap Level - 1)
      // Example: Silver(2) + Multitap Lvl 3 = 2 + (3-1) = 4
      const pointsPerTap = currentInfo.tapValue + (state.multitapLevel - 1);

      const newPoints = state.points + pointsPerTap;

      // 3. Check if we leveled up with this tap
      const nextInfo = getLevelInfo(newPoints);

      return {
        points: newPoints,
        level: nextInfo.level,
        levelName: nextInfo.name,
        progress: nextInfo.progress,
        // Update display value immediately
        tapValue: nextInfo.tapValue + (state.multitapLevel - 1),
      };
    }),

  // --- Logic: Consume Energy ---
  decrementEnergy: () =>
    set((state) => {
      // 1. Calculate cost (Must match pointsPerTap logic exactly)
      const currentInfo = getLevelInfo(state.points);
      const costPerTap = currentInfo.tapValue + (state.multitapLevel - 1);

      return {
        energy: Math.max(0, state.energy - costPerTap),
      };
    }),

  // --- Logic: Passive Recharge ---
  restoreEnergy: (amount) =>
    set((state) => {
      // 'amount' here is usually passed from the interval in Home.tsx
      if (state.energy >= state.maxEnergy) return {};
      return {
        energy: Math.min(state.maxEnergy, state.energy + amount),
      };
    }),

  // --- Logic: Sync with Backend ---
  setGameState: (newState: any) =>
    set((state) => {
      /* 
         MAPPING LOGIC:
         Handles both JavaScript camelCase and Python snake_case
      */
      const points = newState.points ?? state.points;
      const energy = newState.energy ?? state.energy;

      const maxEnergy =
        newState.maxEnergy ?? newState.max_energy ?? state.maxEnergy;

      const multitapLevel =
        newState.multitapLevel ??
        newState.multitap_level ??
        state.multitapLevel;

      const energyLimitLevel =
        newState.energyLimitLevel ??
        newState.energy_limit_level ??
        state.energyLimitLevel;

      const rechargeSpeedLevel =
        newState.rechargeSpeedLevel ??
        newState.recharge_speed_level ??
        state.rechargeSpeedLevel;

      const tapBotLevel =
        newState.tapBotLevel ?? newState.tap_bot_level ?? state.tapBotLevel;

      // Recalculate League/Progress info based on the synced points
      const info = getLevelInfo(points);

      return {
        ...state, // Keep existing state
        points,
        energy,
        maxEnergy,
        multitapLevel,
        energyLimitLevel,
        rechargeSpeedLevel,
        tapBotLevel,

        level: info.level,
        levelName: info.name,
        progress: info.progress,

        /* 
           CALCULATED VALUES FOR UI:
           1. tapValue = League Base + Multitap Boost
           2. energyRegen = League Base + Recharge Boost
        */
        tapValue: info.tapValue + (multitapLevel - 1),
        energyRegen: info.energyRegen + (rechargeSpeedLevel - 1),
      };
    }),
}));

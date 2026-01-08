import { create } from "zustand";
import type { GameState } from "../types";
import { getLevelInfo } from "../config/levels";

interface GameStore extends GameState {
  // --- New Field ---
  profitPerHour: number;

  // Actions
  incrementPoints: () => void;
  decrementEnergy: () => void;
  restoreEnergy: (amount: number) => void;
  setGameState: (state: any) => void;
  tickPassivePoints: () => void;

  // UI Helpers (Calculated)
  levelName: string;
  tapValue: number;
  energyRegen: number;
  progress: number;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // --- Initial Game State ---
  points: 0,
  energy: 1000,
  maxEnergy: 1000,
  level: 1,

  // Upgrade Levels
  multitapLevel: 1,
  energyLimitLevel: 1,
  rechargeSpeedLevel: 1,
  tapBotLevel: 0,

  // --- New Field Default ---
  profitPerHour: 0,

  // --- UI Helper Defaults ---
  levelName: "Bronze",
  tapValue: 1,
  energyRegen: 1,
  progress: 0,

  // --- Logic: Tap Coin ---
  incrementPoints: () =>
    set((state) => {
      const currentInfo = getLevelInfo(state.points);
      const pointsPerTap = currentInfo.tapValue + (state.multitapLevel - 1);
      const newPoints = state.points + pointsPerTap;
      const nextInfo = getLevelInfo(newPoints);

      return {
        points: newPoints,
        level: nextInfo.level,
        levelName: nextInfo.name,
        progress: nextInfo.progress,
        tapValue: nextInfo.tapValue + (state.multitapLevel - 1),
      };
    }),

  // --- Logic: Consume Energy ---
  decrementEnergy: () =>
    set((state) => {
      const currentInfo = getLevelInfo(state.points);
      const costPerTap = currentInfo.tapValue + (state.multitapLevel - 1);
      return {
        energy: Math.max(0, state.energy - costPerTap),
      };
    }),

  // --- Logic: Passive Recharge ---
  restoreEnergy: (amount) =>
    set((state) => {
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
         Handles snake_case (Backend DB) -> camelCase (Frontend)
      */
      const points = newState.points ?? state.points;
      const energy = newState.energy ?? state.energy;

      // NEW: Map profit per hour
      const profitPerHour =
        newState.profitPerHour ??
        newState.profit_per_hour ??
        state.profitPerHour ??
        0;

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

      // Recalculate League/Progress
      const info = getLevelInfo(points);

      return {
        ...state,
        points,
        energy,
        maxEnergy,
        multitapLevel,
        energyLimitLevel,
        rechargeSpeedLevel,
        tapBotLevel,
        profitPerHour, // Store the value

        level: info.level,
        levelName: info.name,
        progress: info.progress,

        tapValue: info.tapValue + (multitapLevel - 1),
        energyRegen: info.energyRegen + (rechargeSpeedLevel - 1),
      };
    }),
  // We use a small internal accumulator to handle fractional gains
  // (e.g., if you earn 100/hr, that is 0.027 per second. We need to track that decimal)
  internalDecimalPoints: 0,

  tickPassivePoints: () =>
    set((state) => {
      if (state.profitPerHour === 0) return {};

      // Calculate coins per second (profit / 3600)
      // Since we run this tick every 1000ms (1s), we add exactly this amount
      const coinsPerSecond = state.profitPerHour / 3600;

      // We just add to points.
      // Note: In a real app, you might want to store 'points' as a float internally
      // and Math.floor() it in the UI, but adding to the integer is fine for simple games.
      return {
        points: state.points + coinsPerSecond,
      };
    }),
}));

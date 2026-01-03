import { create } from "zustand";
import type { GameState } from "../types";
import { getLevelInfo } from "../config/levels";

interface GameStore extends GameState {
  incrementPoints: () => void; // No argument needed now, logic is internal
  decrementEnergy: () => void; // Logic internal
  restoreEnergy: (amount: number) => void;
  setGameState: (state: Partial<GameState>) => void;

  // Helpers for UI
  levelName: string;
  tapValue: number; // <--- We expose this so UI can show "+2"
}

export const useGameStore = create<GameStore>((set) => ({
  points: 0,
  energy: 1000,
  maxEnergy: 1000,
  level: 1,
  levelName: "Bronze",
  tapValue: 1, // Default

  incrementPoints: () =>
    set((state) => {
      // 1. Get value based on CURRENT points
      const { tapValue } = getLevelInfo(state.points);

      // 2. Add that value
      const newPoints = state.points + tapValue;

      // 3. Recalculate level (in case we just leveled up)
      const info = getLevelInfo(newPoints);

      return {
        points: newPoints,
        level: info.level,
        levelName: info.name,
        tapValue: info.tapValue, // Update for next tap
      };
    }),

  // We decrease 1 Energy per TAP, regardless of how many points you get
  // This makes leveling up feel like a powerful upgrade
  decrementEnergy: () =>
    set((state) => ({
      energy: Math.max(0, state.energy - 1),
    })),

  restoreEnergy: (amount) =>
    set((state) => {
      const currentEnergy = Number.isNaN(state.energy) ? 0 : state.energy;
      const max = state.maxEnergy || 1000;
      if (currentEnergy >= max) return {};
      return { energy: Math.min(max, currentEnergy + amount) };
    }),

  setGameState: (newState) =>
    set((state) => {
      const points = newState.points ?? state.points;
      const info = getLevelInfo(points);

      return {
        points: points,
        energy: newState.energy ?? state.energy,
        maxEnergy: newState.maxEnergy || 1000,
        level: info.level,
        levelName: info.name,
        tapValue: info.tapValue, // Sync value from server state
      };
    }),
}));

import { create } from "zustand";
import type { GameState } from "../types";
import { getLevelInfo } from "../config/levels";

interface GameStore extends GameState {
  incrementPoints: () => void;
  decrementEnergy: () => void;
  restoreEnergy: (amount: number) => void;
  setGameState: (state: Partial<GameState>) => void;

  // UI Helpers
  levelName: string;
  tapValue: number;
  energyRegen: number; // <--- NEW PROPERTY
}

export const useGameStore = create<GameStore>((set) => ({
  points: 0,
  energy: 1000,
  maxEnergy: 1000,
  level: 1,
  levelName: "Bronze",
  tapValue: 1,
  energyRegen: 1, // Default value

  incrementPoints: () =>
    set((state) => {
      const { tapValue } = getLevelInfo(state.points);
      const newPoints = state.points + tapValue;
      const info = getLevelInfo(newPoints);

      return {
        points: newPoints,
        level: info.level,
        levelName: info.name,
        tapValue: info.tapValue,
        energyRegen: info.energyRegen, // <--- Update logic
      };
    }),

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
        tapValue: info.tapValue,
        energyRegen: info.energyRegen, // <--- Sync from calculated level
      };
    }),
}));

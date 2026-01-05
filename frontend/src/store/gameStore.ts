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
  energyRegen: number;
  progress: number; // Added this
}

export const useGameStore = create<GameStore>((set) => ({
  points: 0,
  energy: 1000,
  maxEnergy: 1000,
  level: 1,
  levelName: "Bronze",
  tapValue: 1,
  energyRegen: 1,
  progress: 0,

  incrementPoints: () =>
    set((state) => {
      const info = getLevelInfo(state.points + state.tapValue);
      return {
        points: state.points + state.tapValue,
        level: info.level,
        levelName: info.name,
        tapValue: info.tapValue,
        energyRegen: info.energyRegen,
        progress: info.progress,
      };
    }),

  decrementEnergy: () =>
    set((state) => ({
      energy: Math.max(0, state.energy - state.tapValue), // Consume energy based on tap value
    })),

  restoreEnergy: (amount) =>
    set((state) => {
      if (state.energy >= state.maxEnergy) return {};
      return { energy: Math.min(state.maxEnergy, state.energy + amount) };
    }),

  setGameState: (newState) =>
    set((state) => {
      const points = newState.points ?? state.points;
      const info = getLevelInfo(points);
      return {
        ...state,
        ...newState,
        levelName: info.name,
        tapValue: info.tapValue,
        energyRegen: info.energyRegen,
        progress: info.progress,
      };
    }),
}));

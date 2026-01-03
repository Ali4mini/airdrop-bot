import { create } from "zustand";
import type { GameState } from "../types";

interface GameStore extends GameState {
  incrementPoints: (amount: number) => void;
  decrementEnergy: (amount: number) => void;
  restoreEnergy: (amount: number) => void;
  setGameState: (state: Partial<GameState>) => void; // Allow partial updates
}

export const useGameStore = create<GameStore>((set) => ({
  points: 0,
  energy: 1000,
  maxEnergy: 1000,
  level: 1,

  incrementPoints: (amount) =>
    set((state) => ({
      points: state.points + amount,
    })),

  decrementEnergy: (amount) =>
    set((state) => ({
      energy: Math.max(0, state.energy - amount),
    })),

  // FIX: Handle NaN or Undefined safely
  restoreEnergy: (amount) =>
    set((state) => {
      const currentEnergy = Number.isNaN(state.energy) ? 0 : state.energy;
      const max = state.maxEnergy || 1000;

      if (currentEnergy >= max) return {}; // Stop if full

      return {
        energy: Math.min(max, currentEnergy + amount),
      };
    }),

  // FIX: Add fallbacks using || so undefined doesn't break the app
  setGameState: (newState) =>
    set((state) => ({
      points: newState.points ?? state.points, // Use ?? to allow 0 but block undefined
      energy: newState.energy ?? state.energy,
      level: newState.level ?? state.level,
      maxEnergy: newState.maxEnergy || 1000, // Default to 1000 if backend forgets it
    })),
}));

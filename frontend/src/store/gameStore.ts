import { create } from "zustand";

interface GameState {
  points: number;
  energy: number;
  maxEnergy: number;
  incrementPoints: (amount: number) => void;
  decrementEnergy: (amount: number) => void;
  refillEnergy: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  points: 0,
  energy: 1000,
  maxEnergy: 1000,
  incrementPoints: (amount) =>
    set((state) => ({ points: state.points + amount })),
  decrementEnergy: (amount) =>
    set((state) => ({
      energy: Math.max(0, state.energy - amount), // Prevent negative energy
    })),
  refillEnergy: () => set((state) => ({ energy: state.maxEnergy })),
}));

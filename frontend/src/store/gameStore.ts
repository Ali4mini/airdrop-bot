import { create } from "zustand";
import type { GameState } from "../types";
import { getLevelInfo } from "../config/levels";

interface GameStore extends GameState {
  // Actions
  incrementPoints: () => void;
  decrementEnergy: () => void;
  restoreEnergy: (amount: number) => void;
  setGameState: (state: any) => void; // Using any to handle snake_case from API

  // UI Helpers (Calculated)
  levelName: string;
  tapValue: number;
  energyRegen: number;
  progress: number;
}

export const useGameStore = create<GameStore>((set) => ({
  // --- Initial Game State ---
  points: 0,
  energy: 1000,
  maxEnergy: 1000,
  level: 1,
  multitapLevel: 1,
  energyLimitLevel: 1,
  rechargeSpeedLevel: 1,

  // --- UI Helper Defaults ---
  levelName: "Bronze",
  tapValue: 1,
  energyRegen: 1,
  progress: 0,

  // --- Logic: Tap Coin ---
  incrementPoints: () =>
    set((state) => {
      // The amount earned per tap is determined by the Multitap Boost level
      const pointsToAdd = state.multitapLevel;
      const newPoints = state.points + pointsToAdd;

      // Calculate level progression based on total points
      const info = getLevelInfo(newPoints);

      return {
        points: newPoints,
        level: info.level,
        levelName: info.name,
        progress: info.progress,
        // tapValue and energyRegen are kept in sync with boosts in setGameState
      };
    }),

  // --- Logic: Consume Energy ---
  decrementEnergy: () =>
    set((state) => ({
      // Energy cost per tap is usually equal to points earned (standard bot mechanic)
      energy: Math.max(0, state.energy - state.multitapLevel),
    })),

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
         Handles both JavaScript camelCase and Python snake_case (multitap_level)
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

      // Recalculate League/Progress info based on the synced points
      const info = getLevelInfo(points);

      return {
        ...state,
        points,
        energy,
        maxEnergy,
        multitapLevel,
        energyLimitLevel,
        rechargeSpeedLevel,
        level: info.level,
        levelName: info.name,
        progress: info.progress,

        /* 
           CORE MECHANICS:
           1. tapValue is now driven by your Multitap Level.
           2. energyRegen is base level regen + bonus from Recharge Speed level.
        */
        tapValue: multitapLevel,
        energyRegen: info.energyRegen + (rechargeSpeedLevel - 1),
      };
    }),
}));

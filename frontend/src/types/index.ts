// src/types/index.ts

export interface User {
  id: number;
  username?: string;
  first_name: string;
  last_name?: string;
  language_code?: string;
  is_premium?: boolean;
}

export type TaskStatus = "start" | "pending" | "claimed";

export interface Task {
  id: number;
  title: string;
  reward: number;
  icon: string;
  status: TaskStatus;
}

// --- ADDED FOR PROGRESSION ---
export interface LevelInfo {
  level: number;
  name: string;
  minPoints: number;
  tapValue: number;
  energyRegen: number;
}

// --- UPDATED GAME STATE ---
export interface GameState {
  points: number;
  energy: number;
  maxEnergy: number;
  level: number;
  // These are often calculated but helpful to have in the state
  tapValue: number;
  energyRegen: number;
}

// --- ADDED FOR UI ANIMATIONS ---
export interface ClickAnimation {
  id: number;
  x: number;
  y: number;
}

export interface DailyReward {
  day: number;
  reward: number;
  isClaimed: boolean;
}

export interface Friend {
  id: number;
  name: string;
  level: number;
  earned: number;
  avatar?: string;
}

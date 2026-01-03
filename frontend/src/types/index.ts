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
  icon: string; // Emoji or URL
  status: TaskStatus;
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
  earned: number; // Amount earned from this referral
  avatar?: string; // Emoji or URL
}

export interface GameState {
  points: number;
  energy: number;
  maxEnergy: number;
  level: number;
}

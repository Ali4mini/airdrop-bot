// --- User Models ---
export interface User {
  id: number;
  username?: string;
  first_name: string;
  last_name?: string;
  language_code?: string;
  is_premium?: boolean;
}

// --- Game State (Matches Backend Pydantic Model) ---
export interface GameState {
  points: number;
  energy: number;
  maxEnergy: number; // mapped from max_energy in backend
  level: number;

  // New Boost Levels
  multitapLevel: number; // mapped from multitap_level
  energyLimitLevel: number; // mapped from energy_limit_level
  rechargeSpeedLevel: number; // mapped from recharge_speed_level
}

// --- Boost/Upgrade Types ---
// Using string literals ensures you don't send a typo to the backend
export type UpgradeType = "multitap" | "energy_limit" | "recharge_speed";

export interface UpgradeResponse extends Partial<GameState> {
  // The backend might return only the updated fields,
  // so we make them partial or include specific ones
  points: number;
}

// --- Levels & Progression ---
export interface LevelInfo {
  level: number;
  name: string;
  minPoints: number;
  tapValue: number;
  energyRegen: number;
  nextLevelPoints: number | null;
  progress: number;
}

// --- UI & Animations ---
export interface ClickAnimation {
  id: number;
  x: number;
  y: number;
}

// --- Social & Tasks ---
export type TaskStatus = "start" | "pending" | "claimed";

export interface Task {
  id: number;
  title: string;
  reward: number;
  icon: string;
  status: TaskStatus;
}

export interface Friend {
  id: number;
  name: string;
  level: number;
  earned: number;
  avatar?: string;
}

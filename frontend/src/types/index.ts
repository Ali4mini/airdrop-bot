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
  tapBotLevel?: number;
}

// --- Boost/Upgrade Types ---
// Using string literals ensures you don't send a typo to the backend
export type UpgradeType = "multitap" | "energy_limit" | "recharge_speed";

export interface UpgradeResponse extends Partial<GameState> {
  // The backend might return only the updated fields,
  // so we make them partial or include specific ones
  points: number;
  maxEnergy: number;
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
export type TaskStatus = "pending" | "completed" | "claimed";

export interface Task {
  id: string;
  title: string;
  icon: string;
  reward: number;
  status: TaskStatus;
  type: string; // 'social', 'watch', 'referral', etc.
}

export interface DailyReward {
  day: number;
  reward: number;
  is_claimed: boolean;
}

export interface UserTasksResponse {
  daily_rewards: DailyReward[];
  tasks: Task[];
  current_streak: number;
  last_check_in: string | null;
  coins: number;
}

export interface TaskUpdateResponse {
  success: boolean;
  task: Task;
}

export interface TaskClaimResponse {
  success: boolean;
  reward: number;
  new_coins: number;
  task: Task;
}

export interface DailyRewardClaimResponse {
  success: boolean;
  reward: number;
  new_coins: number;
  daily_reward: DailyReward;
}

export interface CoinsResponse {
  coins: number;
}

export interface TapPayload {
  user_id: number;
  taps: number;
}

export interface UpgradePayload {
  user_id: number;
  upgrade_type: UpgradeType;
}

export interface Friend {
  id: number;
  name: string;
  level: number;
  earned: number;
  avatar?: string;
}

// --- Referral Types ---
export interface ReferralInfo {
  referral_code: string;
  link: string;
}

export interface FriendInfo {
  id: number;
  name: string;
  level: number;
  earned: number;
  avatar: string;
}

export interface ReferralResponse {
  referral_info: ReferralInfo;
  friends: FriendInfo[];
  total_earned: number;
}

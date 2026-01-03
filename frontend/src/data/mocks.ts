// src/data/mocks.ts
import type { Task, DailyReward, Friend } from "../types";

// Endpoint: GET /api/tasks
export const TASKS_DATA: Task[] = [
  {
    id: 1,
    title: "Join Telegram Channel",
    reward: 5000,
    icon: "✈️",
    status: "start",
  },
  {
    id: 2,
    title: "Follow on X (Twitter)",
    reward: 2500,
    icon: "🐦",
    status: "start",
  },
  {
    id: 3,
    title: "Retweet Pinned Post",
    reward: 1000,
    icon: "🔁",
    status: "pending",
  },
  {
    id: 4,
    title: "Subscribe to YouTube",
    reward: 10000,
    icon: "📺",
    status: "claimed",
  },
  {
    id: 5,
    title: "Invite 3 Friends",
    reward: 25000,
    icon: "🤝",
    status: "start",
  },
];

// Endpoint: GET /api/daily-rewards
export const DAILY_REWARDS_DATA: DailyReward[] = [
  { day: 1, reward: 500, isClaimed: true },
  { day: 2, reward: 1000, isClaimed: true },
  { day: 3, reward: 2500, isClaimed: false }, // Current Day
  { day: 4, reward: 5000, isClaimed: false },
  { day: 5, reward: 15000, isClaimed: false },
  { day: 6, reward: 25000, isClaimed: false },
  { day: 7, reward: 100000, isClaimed: false },
];

// Endpoint: GET /api/friends
export const FRIENDS_DATA: Friend[] = [
  { id: 1, name: "Alex T.", level: 4, earned: 50000, avatar: "🦁" },
  { id: 2, name: "Sarah J.", level: 2, earned: 12500, avatar: "🦊" },
  { id: 3, name: "Mike R.", level: 1, earned: 2500, avatar: "🐶" },
  // Uncomment to test empty state:
  // ...[]
];

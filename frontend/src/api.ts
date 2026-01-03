// src/api.ts
const API_URL = "http://localhost:8000/api";

import type { User, GameState } from "./types";

export const loginUser = async (
  user: User,
): Promise<{ user: User; gameState: GameState }> => {
  const res = await fetch(`${API_URL}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  return res.json();
};

export const syncTaps = async (userId: number, taps: number) => {
  const res = await fetch(`${API_URL}/tap`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, taps }),
  });
  return res.json();
};

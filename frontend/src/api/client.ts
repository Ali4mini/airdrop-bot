import axios from "axios";
import type { User, GameState } from "../types";

// Create an Axios instance with base configuration
const apiClient = axios.create({
  baseURL: "http://localhost:8000/api", // Make sure FastAPI is running here
  headers: {
    "Content-Type": "application/json",
  },
});

export const api = {
  /**
   * Authenticates the user and returns their latest game state
   */
  login: async (user: User): Promise<{ user: User; gameState: GameState }> => {
    const response = await apiClient.post("/auth", user);
    return response.data;
  },

  /**
   * Syncs the accumulated taps to the server
   */
  syncTaps: async (userId: number, taps: number): Promise<GameState> => {
    const response = await apiClient.post("/tap", {
      user_id: userId,
      taps: taps,
    });
    return response.data;
  },
};

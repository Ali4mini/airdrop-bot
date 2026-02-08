import axios from "axios";
import type {
  UserTasksResponse,
  TaskUpdateResponse,
  TaskClaimResponse,
  DailyRewardClaimResponse,
  CoinsResponse,
  ReferralResponse,
} from "../types";

const VITE_API_URL = import.meta.env.VITE_API_URL;

console.log("VITE_API_URL: ", VITE_API_URL);

const apiClient = axios.create({
  // If you are using Docker/Vite proxy, this might be "/api"
  // If you are running locally, it is usually port 8000
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const api = {
  login: async (user: any) => {
    const response = await apiClient.post("/auth", user);
    return response.data;
  },

  syncTaps: async (userId: number, taps: number) => {
    const response = await apiClient.post("/tap", {
      user_id: userId,
      taps: taps,
    });
    return response.data; // This is the updated GameState
  },

  buyUpgrade: async (userId: number, upgradeType: string) => {
    const response = await apiClient.post("/upgrade", {
      user_id: userId,
      upgrade_type: upgradeType,
    });
    return response.data;
  },

  // --- NEW TASK MANAGEMENT ENDPOINTS ---

  getUserTasks: async (userId: number): Promise<UserTasksResponse> => {
    const response = await apiClient.get(`/tasks/${userId}`);
    return response.data;
  },

  completeTask: async (
    userId: number,
    taskId: string,
  ): Promise<TaskUpdateResponse> => {
    const response = await apiClient.post(
      `/tasks/${userId}/${taskId}/complete`,
    );
    return response.data;
  },

  claimTaskReward: async (
    userId: number,
    taskId: string,
  ): Promise<TaskClaimResponse> => {
    const response = await apiClient.post(`/tasks/${userId}/${taskId}/claim`);
    return response.data;
  },

  claimDailyReward: async (
    userId: number,
    day: number,
  ): Promise<DailyRewardClaimResponse> => {
    const response = await apiClient.post(
      `/tasks/${userId}/daily-reward/${day}/claim`,
    );
    return response.data;
  },

  getUserCoins: async (userId: string): Promise<CoinsResponse> => {
    const response = await apiClient.get(`/tasks/${userId}/coins`);
    return response.data;
  },

  // --- NEW REFERRAL ENDPOINTS ---
  getReferralInfo: async (userId: number): Promise<ReferralResponse> => {
    const response = await apiClient.get(`/referral/?user_id=${userId}`);
    return response.data;
  },

  processReferral: async (
    referrerCode: string,
    newUserTelegramId: string,
    firstName: string,
    lastName?: string,
    username?: string,
  ) => {
    const response = await apiClient.post("/referral/process", null, {
      params: {
        referrer_code: referrerCode,
        new_user_id: newUserTelegramId,
        first_name: firstName,
        last_name: lastName,
        username: username,
      },
    });
    return response.data;
  },
  syncPassive: async (userId: number) => {
    const response = await apiClient.post(`/sync-passive`, {
      user_id: userId,
    });
    // Map snake_case from backend to camelCase for frontend
    return {
      earned: response.data.earned,
      points: response.data.points,
      profitPerHour: response.data.profit_per_hour, // Important mapping
    };
  },
  // NEW METHOD
  buyMiningUpgrade: async (userId: number, cost: number, profit: number) => {
    const response = await apiClient.post(`/buy-card`, {
      user_id: userId,
      cost: cost,
      profit_increase: profit,
    });
    // This returns the full user state, which setGameState can handle
    return response.data;
  },
};

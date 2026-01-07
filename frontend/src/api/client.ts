import axios from "axios";
import type {
  UserTasksResponse,
  TaskUpdateResponse,
  TaskClaimResponse,
  DailyRewardClaimResponse,
  CoinsResponse,
  ReferralResponse,
} from "../types";

const apiClient = axios.create({
  // If you are using Docker/Vite proxy, this might be "/api"
  // If you are running locally, it is usually port 8000
  baseURL: "http://localhost:8000/api",
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
};

import axios from "axios";

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
};

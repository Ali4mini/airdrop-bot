import axios from "axios";

const apiClient = axios.create({
  // If testing on a real phone via Telegram,
  // this MUST be your PC's local IP (e.g., 192.168.1.50) or an Ngrok URL
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: { "Content-Type": "application/json" },
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

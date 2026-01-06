import { create } from "zustand";

type NotificationType = "success" | "error" | "info";

interface UIStore {
  notification: { message: string | null; type: NotificationType };
  showNotification: (message: string, type?: NotificationType) => void;
  hideNotification: () => void;

  // --- NEW LEVEL UP STATE ---
  levelUp: {
    isOpen: boolean;
    levelName: string;
  };
  openLevelUp: (levelName: string) => void;
  closeLevelUp: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  // ... notification logic ...
  notification: { message: null, type: "success" },
  showNotification: (message, type = "success") =>
    set({ notification: { message, type } }),
  hideNotification: () =>
    set({ notification: { message: null, type: "success" } }),

  // --- LEVEL UP LOGIC ---
  levelUp: { isOpen: false, levelName: "" },
  openLevelUp: (levelName) => set({ levelUp: { isOpen: true, levelName } }),
  closeLevelUp: () => set({ levelUp: { isOpen: false, levelName: "" } }),
}));

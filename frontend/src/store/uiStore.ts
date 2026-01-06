import { create } from "zustand";

type NotificationType = "success" | "error" | "info";

interface UIStore {
  notification: {
    message: string | null;
    type: NotificationType;
  };
  showNotification: (message: string, type?: NotificationType) => void;
  hideNotification: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  notification: {
    message: null,
    type: "success",
  },

  showNotification: (message, type = "success") => {
    // 1. Set the notification
    set({ notification: { message, type } });

    // 2. Auto-hide after 3 seconds (handled in component, but safety timeout here is good too)
    // We strictly rely on the component for timing to allow animations to finish,
    // but clearing the data state is fine.
  },

  hideNotification: () =>
    set({ notification: { message: null, type: "success" } }),
}));

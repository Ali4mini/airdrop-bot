import WebApp from "@twa-dev/sdk";
import { useCallback, useMemo } from "react";
import type { User } from "../types";

export function useTelegram() {
  const isTelegram = useMemo(() => !!WebApp.initData, []);

  const user = useMemo(() => {
    return isTelegram
      ? (WebApp.initDataUnsafe.user as User)
      : {
          id: 99999999,
          first_name: "Dev",
          last_name: "User",
          username: "dev_user",
          language_code: "en",
        };
  }, [isTelegram]);

  const close = useCallback(() => {
    if (isTelegram) WebApp.close();
    else console.log("Telegram Close triggered");
  }, [isTelegram]);

  const expand = useCallback(() => {
    if (isTelegram) WebApp.expand();
    else console.log("Telegram Expand triggered");
  }, [isTelegram]);

  const hapticFeedback = useCallback(
    (type: "light" | "medium" | "heavy" = "light") => {
      if (isTelegram && WebApp.HapticFeedback) {
        WebApp.HapticFeedback.impactOccurred(type);
      }
    },
    [isTelegram],
  );

  return {
    user,
    close,
    expand,
    isTelegram,
    hapticFeedback,
    WebApp, // Export raw WebApp for advanced settings
  };
}

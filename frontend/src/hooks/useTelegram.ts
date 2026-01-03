import WebApp from "@twa-dev/sdk";
import type { User } from "../types"; // <--- Import Type

export function useTelegram() {
  // Try to detect if we are in Telegram
  // Note: WebApp.initData is empty string if not in Telegram usually
  const isTelegram = !!WebApp.initData;

  const user = isTelegram
    ? (WebApp.initDataUnsafe.user as User)
    : {
        // Mock User for Chrome Development
        id: 99999999,
        first_name: "Dev",
        last_name: "User",
        username: "dev_user",
        language_code: "en",
      };

  const close = () => {
    if (isTelegram) WebApp.close();
    else console.log("Telegram Close triggered");
  };

  const expand = () => {
    if (isTelegram) WebApp.expand();
    else console.log("Telegram Expand triggered");
  };

  return {
    user,
    close,
    expand,
    isTelegram,
  };
}

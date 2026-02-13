import logging
import os

from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update, WebAppInfo
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

# 1. Setup Logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)

# 2. Get environment variables (Set these in your deployment)
TOKEN = os.getenv("TELEGRMA_BOT_TOKEN", "")
WEB_APP_URL = os.getenv("WEB_APP_URL", "")


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Sends a welcome message with a button to launch the Mini App."""
    user_name = update.effective_user.first_name

    # Define the button that opens the Mini App
    keyboard = [
        [
            InlineKeyboardButton(
                text="🚀 Launch App", web_app=WebAppInfo(url=WEB_APP_URL)
            )
        ],
        [
            InlineKeyboardButton(
                text="📢 Join Community", url="https://t.me/your_channel"
            )
        ],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    welcome_text = (
        f"Hi {user_name}! 👋\n\n"
        f"Welcome to **[App Name]**.\n"
        f"Tap the button below to start farming points and earn your airdrop! 🪂"
    )

    await update.message.reply_text(
        text=welcome_text, reply_markup=reply_markup, parse_mode="Markdown"
    )


if __name__ == "__main__":
    if not TOKEN or not WEB_APP_URL:
        print("Error: BOT_TOKEN or WEB_APP_URL environment variables not set.")
        exit(1)

    # Build the application
    application = ApplicationBuilder().token(TOKEN).build()

    # Add the /start command handler
    start_handler = CommandHandler("start", start)
    application.add_handler(start_handler)

    print("Bot is running...")
    application.run_polling()

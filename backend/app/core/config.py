# Game Configuration Constants

UPGRADE_CONFIG = {
    "multitap": {"base_cost": 1000, "coeff": 2},
    "energy_limit": {"base_cost": 500, "coeff": 1.5},
    "recharge_speed": {"base_cost": 2000, "coeff": 2.5},
    "tap_bot": {"base_cost": 10000, "coeff": 3},
}

LEVELS = [
    {"min": 100000, "val": 10, "lvl": 9},
    {"min": 50000, "val": 15, "lvl": 8},
    {"min": 30000, "val": 12, "lvl": 7},
    {"min": 10000, "val": 10, "lvl": 6},
    {"min": 5000, "val": 5, "lvl": 5},
    {"min": 1000, "val": 4, "lvl": 4},
    {"min": 500, "val": 3, "lvl": 3},
    {"min": 100, "val": 2, "lvl": 2},
    {"min": 0, "val": 1, "lvl": 1},
]

TASKS_DB = [
    {
        "id": "task_1",
        "title": "Join our Telegram",
        "reward": 1000,
        "icon": "📱",
        "type": "social",
        "status": "pending",
    },
    {
        "id": "task_2",
        "title": "Follow us on X",
        "icon": "🐦",
        "reward": 1500,
        "type": "social",
        "status": "pending",
    },
    {
        "id": "task_3",
        "title": "Watch video",
        "icon": "📺",
        "reward": 2000,
        "type": "watch",
        "status": "pending",
    },
    {
        "id": "task_4",
        "title": "Invite friends",
        "icon": "👥",
        "reward": 5000,
        "type": "referral",
        "status": "pending",
    },
    {
        "id": "task_5",
        "title": "Install MysteryPlay",
        "icon": "👥",
        "reward": 7000,
        "type": "special",
        "status": "pending",
    },
]

DAILY_REWARDS_DB = [
    {"day": 1, "reward": 1000, "is_claimed": False},
    {"day": 2, "reward": 2000, "is_claimed": False},
    {"day": 3, "reward": 3000, "is_claimed": False},
    {"day": 4, "reward": 4000, "is_claimed": False},
    {"day": 5, "reward": 5000, "is_claimed": False},
    {"day": 6, "reward": 6000, "is_claimed": False},
    {"day": 7, "reward": 10000, "is_claimed": False},
]


# 1. ONE-TIME TASKS (User does these once forever)
ONE_TIME_TASKS = [
    {
        "id": "social_tg",
        "title": "Join our Telegram",
        "reward": 5000,
        "icon": "📱",
        "type": "social",
        "status": "pending",
    },
    {
        "id": "social_x",
        "title": "Follow us on X",
        "icon": "🐦",
        "reward": 5000,
        "type": "social",
        "status": "pending",
    },
    {
        "id": "social_discord",
        "title": "Follow us on Discord",
        "icon": "D",
        "reward": 5000,
        "type": "social",
        "status": "pending",
    },
]

# 2. DAILY TASK POOL (We pick random ones from here daily)
# The IDs here are "base IDs". In Redis, we will save them as "daily_watch_1:2024-01-01"
#
DAILY_TASK_POOL = [
    # {
    #     "id": "daily_watch_1",
    #     "title": "Watch Daily News",
    #     "reward": 1000,
    #     "icon": "📺",
    #     "type": "watch",
    #     "status": "pending",
    # },
    # {
    #     "id": "daily_watch_2",
    #     "title": "Watch Crypto Update",
    #     "reward": 1000,
    #     "icon": "📺",
    #     "type": "watch",
    #     "status": "pending",
    # },
    {
        "id": "daily_share_1",
        "title": "Share with a friend",
        "reward": 1500,
        "icon": "👥",
        "type": "referral",
        "status": "pending",
    },
    {
        "id": "daily_like_1",
        "title": "Like recent post",
        "reward": 500,
        "icon": "🐦",
        "type": "social",
        "status": "pending",
    },
    {
        "id": "daily_quiz",
        "title": "Solve Daily Puzzle",
        "reward": 2000,
        "icon": "🧩",
        "type": "quiz",
        "status": "pending",
    },
    # {
    #     "id": "daily_check",
    #     "title": "Check Market Prices",
    #     "reward": 500,
    #     "icon": "📈",
    #     "type": "watch",
    #     "status": "pending",
    # },
]

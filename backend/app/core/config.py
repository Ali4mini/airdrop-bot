# Game Configuration Constants

UPGRADE_CONFIG = {
    "multitap":       {"base_cost": 1000, "coeff": 2}, 
    "energy_limit":   {"base_cost": 500,  "coeff": 1.5},
    "recharge_speed": {"base_cost": 2000, "coeff": 2.5},
    "tap_bot":        {"base_cost": 10000, "coeff": 3} 
}

LEVELS = [
    {"min": 10000, "val": 10, "lvl": 6},
    {"min": 5000,  "val": 5,  "lvl": 5},
    {"min": 1000,  "val": 4,  "lvl": 4},
    {"min": 500,   "val": 3,  "lvl": 3},
    {"min": 100,   "val": 2,  "lvl": 2},
    {"min": 0,     "val": 1,  "lvl": 1},
]

TASKS_DB = [
    {"id": "task_1", "title": "Join our Telegram", "reward": 1000, "icon": "📱", "type": "social", "status": "pending"},
    {"id": "task_2", "title": "Follow us on X", "icon": "🐦", "reward": 1500, "type": "social", "status": "pending"},
    {"id": "task_3", "title": "Watch video", "icon": "📺", "reward": 2000, "type": "watch", "status": "pending"},
    {"id": "task_4", "title": "Invite friends", "icon": "👥", "reward": 5000, "type": "referral", "status": "pending"},
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

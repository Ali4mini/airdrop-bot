from fastapi import APIRouter, Depends, HTTPException, Header
from .database import redis_client
from .models import UserData, GameState, TapPayload, Task
import json

router = APIRouter()


# --- MOCK DATA FOR TASKS (Since we don't store tasks in DB yet) ---
TASKS_DB = [
    {"id": 1, "title": "Join Channel", "reward": 5000, "icon": "✈️", "status": "start"},
    {"id": 2, "title": "Follow Twitter", "reward": 2500, "icon": "🐦", "status": "start"},
]

@router.post("/auth")
async def login(user: UserData):
    """
    Called when the app opens. Creates user in Redis if not exists.
    """
    user_key = f"user:{user.id}"
    
    # Check if user exists
    exists = await redis_client.exists(user_key)
    
    if not exists:
        # Initialize new user state
        initial_state = {
            "points": 0,
            "energy": 1000,
            "level": 1,
            "first_name": user.first_name
        }
        await redis_client.hset(user_key, mapping=initial_state)
    
    # Fetch current state
    data = await redis_client.hgetall(user_key)
    
    return {
        "user": user,
        "gameState": {
            "points": int(data.get("points", 0)),
            "energy": int(data.get("energy", 1000)),
            "level": int(data.get("level", 1)),
            "maxEnergy": 1000  # Explicitly send this field!
        }
    }



# MATCH FRONTEND CONFIG
LEVELS = [
    {"min": 10000, "val": 20, "lvl": 6},
    {"min": 5000,  "val": 10, "lvl": 5},
    {"min": 1000,  "val": 5,  "lvl": 4},
    {"min": 500,   "val": 3,  "lvl": 3},
    {"min": 100,   "val": 2,  "lvl": 2},
    {"min": 0,     "val": 1,  "lvl": 1},
]

def get_level_info(points):
    # Returns (level, tap_value)
    for l in LEVELS:
        if points >= l["min"]:
            return l["lvl"], l["val"]
    return 1, 1

@router.post("/tap")
async def sync_taps(payload: TapPayload):
    user_key = f"user:{payload.user_id}"
    
    if not await redis_client.exists(user_key):
        raise HTTPException(status_code=404, detail="User not found")
    
    # 1. Get Current State BEFORE adding points
    current_points = int(await redis_client.hget(user_key, "points") or 0)
    
    # 2. Determine value per tap based on CURRENT points
    current_level, tap_value = get_level_info(current_points)
    
    # 3. Calculate total gained
    points_gained = payload.taps * tap_value
    
    # 4. Update Redis
    new_points = await redis_client.hincrby(user_key, "points", points_gained)
    
    # 5. Decrease Energy (1 energy per physical tap)
    current_energy = int(await redis_client.hget(user_key, "energy") or 0)
    new_energy = max(0, current_energy - payload.taps)
    await redis_client.hset(user_key, "energy", new_energy)

    # 6. Check for Level Up (based on NEW points)
    new_level, _ = get_level_info(new_points)
    if new_level > current_level:
        await redis_client.hset(user_key, "level", new_level)

    return {
        "points": new_points, 
        "energy": new_energy, 
        "level": new_level,
        "maxEnergy": 1000
    }

@router.get("/tasks/{user_id}")
async def get_tasks(user_id: int):
    """
    Get tasks. In a real app, you'd check Redis to see which ones are 'claimed'.
    """
    # For now, just return static tasks. 
    # TODO: Implement Redis Set `user:{id}:completed_tasks`
    return TASKS_DB

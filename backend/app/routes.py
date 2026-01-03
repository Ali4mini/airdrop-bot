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

@router.post("/tap")
async def sync_taps(payload: TapPayload):
    """
    Frontend sends { "user_id": 123, "taps": 5 } every 2 seconds.
    We update Redis atomically.
    """
    user_key = f"user:{payload.user_id}"
    
    # Check if user exists
    if not await redis_client.exists(user_key):
        raise HTTPException(status_code=404, detail="User not found")
    
    # 1. Update Points
    new_points = await redis_client.hincrby(user_key, "points", payload.taps)
    
    # 2. Update Energy (Decrease)
    current_energy = int(await redis_client.hget(user_key, "energy") or 0)
    new_energy = max(0, current_energy - payload.taps)
    await redis_client.hset(user_key, "energy", new_energy)
    
    return {"points": new_points, "energy": new_energy}

@router.get("/tasks/{user_id}")
async def get_tasks(user_id: int):
    """
    Get tasks. In a real app, you'd check Redis to see which ones are 'claimed'.
    """
    # For now, just return static tasks. 
    # TODO: Implement Redis Set `user:{id}:completed_tasks`
    return TASKS_DB

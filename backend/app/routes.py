from fastapi import APIRouter, HTTPException
from .database import redis_client
from .models import UserData, TapPayload, UpgradePayload
import math

router = APIRouter()

# --- CONFIGURATION (Must match Frontend) ---
UPGRADE_CONFIG = {
    # base_cost must match the React code to avoid "Not enough points" errors
    "multitap":       {"base_cost": 1000, "coeff": 2}, 
    "energy_limit":   {"base_cost": 500,  "coeff": 1.5},
    "recharge_speed": {"base_cost": 2000, "coeff": 2.5}
}

TASKS_DB = [
    {"id": 1, "title": "Join Channel", "reward": 5000, "icon": "✈️", "status": "start"},
    {"id": 2, "title": "Follow Twitter", "reward": 2500, "icon": "🐦", "status": "start"},
]

def calculate_upgrade_cost(type: str, current_level: int):
    if type not in UPGRADE_CONFIG:
        return 999999999
    config = UPGRADE_CONFIG[type]
    # Calculate cost: base * (level ^ coeff)
    return int(config["base_cost"] * (current_level ** config["coeff"]))

# --- AUTHENTICATION ---
@router.post("/auth")
async def login(user: UserData):
    user_key = f"user:{user.id}"
    
    # Check if user exists
    exists = await redis_client.exists(user_key)
    
    if not exists:
        # Create new user
        initial_state = {
            "points": 0,
            "energy": 1000,
            "max_energy": 1000,
            "level": 1,
            "multitap_level": 1,
            "energy_limit_level": 1,
            "recharge_speed_level": 1,
            "first_name": user.first_name or ""
        }
        await redis_client.hset(user_key, mapping=initial_state)
    
    # Fetch latest state
    data = await redis_client.hgetall(user_key)
    
    return {
        "user": user,
        "gameState": {
            "points": int(data.get("points", 0)),
            "energy": int(data.get("energy", 1000)),
            "maxEnergy": int(data.get("max_energy", 1000)),
            "level": int(data.get("level", 1)),
            "multitap_level": int(data.get("multitap_level", 1)),
            "energy_limit_level": int(data.get("energy_limit_level", 1)),
            "recharge_speed_level": int(data.get("recharge_speed_level", 1))
        }
    }

# --- SYNC TAPS ---
@router.post("/tap")
async def sync_taps(payload: TapPayload):
    user_key = f"user:{payload.user_id}"
    
    # 1. Get current state
    data = await redis_client.hgetall(user_key)
    if not data:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 2. Parse Redis Data (Handle potential missing keys with defaults)
    multitap_level = int(data.get("multitap_level", 1))
    current_energy = int(data.get("energy", 0))
    # Note: We don't really need max_energy for calculation, just for return
    
    # 3. Calculate Logic
    # Points gained = (Taps clicked) * (Points per tap)
    points_gained = payload.taps * multitap_level
    
    # Energy cost = Points gained (Standard logic) 
    # Or simply payload.taps if you want 1 tap = 1 energy regardless of multiplier
    # Let's use: Cost = Taps (so Multitap is a pure bonus)
    energy_cost = payload.taps * multitap_level 
    
    new_energy = max(0, current_energy - energy_cost)
    
    # 4. Update Redis (Atomic Pipeline)
    pipe = redis_client.pipeline()
    pipe.hincrby(user_key, "points", points_gained)
    pipe.hset(user_key, "energy", new_energy)
    await pipe.execute()
    
    # 5. Return updated state to frontend
    final_data = await redis_client.hgetall(user_key)
    
    return {
        "points": int(final_data.get("points", 0)),
        "energy": int(final_data.get("energy", 0)),
        "maxEnergy": int(final_data.get("max_energy", 1000)),
        "multitap_level": int(final_data.get("multitap_level", 1)),
        "energy_limit_level": int(final_data.get("energy_limit_level", 1)),
        "recharge_speed_level": int(final_data.get("recharge_speed_level", 1)),
        "level": int(final_data.get("level", 1))
    }

# --- BUY UPGRADE ---
@router.post("/upgrade")
async def buy_upgrade(payload: UpgradePayload):
    user_key = f"user:{payload.user_id}"
    
    # 1. Fetch current data
    data = await redis_client.hgetall(user_key)
    if not data:
        raise HTTPException(status_code=404, detail="User not found")
        
    points = int(data.get("points", 0))
    
    # Map frontend type strings to Redis keys
    field_map = {
        "multitap": "multitap_level",
        "energy_limit": "energy_limit_level",
        "recharge_speed": "recharge_speed_level"
    }
    
    if payload.upgrade_type not in field_map:
        raise HTTPException(status_code=400, detail="Invalid upgrade type")
        
    db_field = field_map[payload.upgrade_type]
    current_level = int(data.get(db_field, 1))
    
    # 2. Calculate Cost
    cost = calculate_upgrade_cost(payload.upgrade_type, current_level)
    
    # 3. Validate Balance
    if points < cost:
        raise HTTPException(status_code=400, detail="Not enough points")
    
    # 4. Apply Upgrade
    new_points = points - cost
    new_level = current_level + 1
    
    pipe = redis_client.pipeline()
    pipe.hset(user_key, "points", new_points)
    pipe.hset(user_key, db_field, new_level)
    
    # Special logic: If upgrading Energy Limit, boost Max Energy
    if payload.upgrade_type == "energy_limit":
        # Base 1000 + 500 per level
        new_max = 1000 + ((new_level - 1) * 500)
        pipe.hset(user_key, "max_energy", new_max)
        # Optional: Refill energy on upgrade?
        # pipe.hset(user_key, "energy", new_max)
        
    await pipe.execute()
    
    # 5. Return Result
    updated_data = await redis_client.hgetall(user_key)
    
    return {
        "points": int(updated_data.get("points")),
        "energy": int(updated_data.get("energy")), # Return energy to keep UI sync
        "multitap_level": int(updated_data.get("multitap_level", 1)),
        "energy_limit_level": int(updated_data.get("energy_limit_level", 1)),
        "recharge_speed_level": int(updated_data.get("recharge_speed_level", 1)),
        "maxEnergy": int(updated_data.get("max_energy", 1000))
    }

# --- TASKS ---
@router.get("/tasks/{user_id}")
async def get_tasks(user_id: int):
    # TODO: Fetch completed task IDs from Redis `smembers user:{id}:tasks`
    # completed_ids = await redis_client.smembers(f"user:{user_id}:tasks")
    return TASKS_DB

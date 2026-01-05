from fastapi import APIRouter, HTTPException
from .database import redis_client
from .models import UserData, TapPayload, UpgradePayload
import time 

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

LEVELS = [
    {"min": 10000, "val": 10, "lvl": 6}, # Grandmaster: Base 10
    {"min": 5000,  "val": 5,  "lvl": 5}, # Diamond: Base 5
    {"min": 1000,  "val": 4,  "lvl": 4}, # Platinum: Base 4
    {"min": 500,   "val": 3,  "lvl": 3}, # Gold: Base 3
    {"min": 100,   "val": 2,  "lvl": 2}, # Silver: Base 2
    {"min": 0,     "val": 1,  "lvl": 1}, # Bronze: Base 1
]

def calculate_upgrade_cost(type: str, current_level: int):
    if type not in UPGRADE_CONFIG:
        return 999999999
    config = UPGRADE_CONFIG[type]
    # Calculate cost: base * (level ^ coeff)
    return int(config["base_cost"] * (current_level ** config["coeff"]))

# --- AUTHENTICATION ---

router = APIRouter()

# ... (Keep your UPGRADE_CONFIG and TASKS_DB here) ...
UPGRADE_CONFIG = {
    "multitap":       {"base_cost": 1000, "coeff": 2}, 
    "energy_limit":   {"base_cost": 500,  "coeff": 1.5},
    "recharge_speed": {"base_cost": 2000, "coeff": 2.5},
    "tap_bot":        {"base_cost": 10000, "coeff": 3} 
}

# --- HELPER: GET LEVEL & REGEN INFO ---
# We need this to know how fast to refill energy on login
LEVELS = [
    {"min": 10000, "val": 10, "regen": 1, "lvl": 6},
    {"min": 5000,  "val": 5,  "regen": 1, "lvl": 5},
    {"min": 1000,  "val": 4,  "regen": 1, "lvl": 4},
    {"min": 500,   "val": 3,  "regen": 1, "lvl": 3},
    {"min": 100,   "val": 2,  "regen": 1, "lvl": 2},
    {"min": 0,     "val": 1,  "regen": 1, "lvl": 1},
]

@router.post("/auth")
async def login(user: UserData):
    user_key = f"user:{user.id}"
    exists = await redis_client.exists(user_key)
    
    current_time = int(time.time())

    if not exists:
        # NEW USER: Start with Full Energy
        initial_state = {
            "points": 0,
            "energy": 1000, 
            "max_energy": 1000,
            "level": 1,
            "multitap_level": 1,
            "energy_limit_level": 1,
            "recharge_speed_level": 1,
            "last_sync_time": current_time # <--- Track time
        }
        await redis_client.hset(user_key, mapping=initial_state)
    
    # FETCH DATA
    data = await redis_client.hgetall(user_key)
    
    # --- OFFLINE REGENERATION LOGIC ---
    stored_energy = int(data.get("energy", 1000))
    max_energy = int(data.get("max_energy", 1000))
    last_sync = int(data.get("last_sync_time", current_time))
    
    # 1. Calculate how much to regen
    recharge_level = int(data.get("recharge_speed_level", 1))
    
    # Base regen (from league) + Recharge Boost
    # (Simplified: assume base is 1 for now)
    regen_rate = 1 + (recharge_level - 1) 
    
    seconds_passed = current_time - last_sync
    
    # 2. Add gained energy (Capped at Max)
    energy_gained = seconds_passed * regen_rate
    new_energy = min(max_energy, stored_energy + energy_gained)
    
    # 3. Save new energy to Redis immediately so it persists
    if new_energy != stored_energy:
        await redis_client.hset(user_key, mapping={
            "energy": new_energy,
            "last_sync_time": current_time
        })
    # ----------------------------------

    return {
        "user": user,
        "gameState": {
            "points": int(data.get("points", 0)),
            "energy": new_energy, # Return the REFILLED energy
            "maxEnergy": max_energy,
            "level": int(data.get("level", 1)),
            "multitapLevel": int(data.get("multitap_level", 1)),
            "energyLimitLevel": int(data.get("energy_limit_level", 1)),
            "rechargeSpeedLevel": int(data.get("recharge_speed_level", 1)),
            "tapBotLevel": int(data.get("tap_bot_level", 0))
        }
    }

@router.post("/tap")
async def sync_taps(payload: TapPayload):
    user_key = f"user:{payload.user_id}"
    
    data = await redis_client.hgetall(user_key)
    if not data:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update timestamp
    current_time = int(time.time())

    multitap_level = int(data.get("multitap_level", 1))
    current_energy = int(data.get("energy", 0))
    
    # Handle missing Level config gracefully
    current_level = int(data.get("level", 1))
    base_val = 1
    for l in LEVELS: 
        if l['lvl'] == current_level: base_val = l['val']

    points_per_tap = base_val + (multitap_level - 1)
    
    points_gained = payload.taps * points_per_tap
    energy_cost = payload.taps * points_per_tap 
    
    new_energy = max(0, current_energy - energy_cost)
    
    pipe = redis_client.pipeline()
    pipe.hincrby(user_key, "points", points_gained)
    
    # Update Energy AND Time
    pipe.hset(user_key, mapping={
        "energy": new_energy,
        "last_sync_time": current_time # <--- Important!
    })
    
    await pipe.execute()
    
    final_data = await redis_client.hgetall(user_key)
    
    return {
        "points": int(final_data.get("points", 0)),
        "energy": int(final_data.get("energy")), 
        "maxEnergy": int(final_data.get("max_energy", 1000)),
        "multitapLevel": int(final_data.get("multitap_level", 1)),
        "energyLimitLevel": int(final_data.get("energy_limit_level", 1)),
        "rechargeSpeedLevel": int(final_data.get("recharge_speed_level", 1)),
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

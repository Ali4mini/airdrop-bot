import time
from fastapi import HTTPException
from app.core.database import redis_client
from app.core.config import LEVELS, UPGRADE_CONFIG
from app.schemas import UserData

class GameService:
    @staticmethod
    def get_user_key(user_id: int | str) -> str:
        return f"user:{user_id}"

    @staticmethod
    async def create_user_if_not_exists(user: UserData):
        user_key = GameService.get_user_key(user.id)
        if not await redis_client.exists(user_key):
            initial_state = {
                "points": 0, "energy": 1000, "max_energy": 1000, "level": 1,
                "multitap_level": 1, "energy_limit_level": 1, "recharge_speed_level": 1,
                "tap_bot_level": 0, "last_sync_time": int(time.time())
            }
            await redis_client.hset(user_key, mapping=initial_state)

    @staticmethod
    async def get_user_state(user_id: int):
        user_key = GameService.get_user_key(user_id)
        data = await redis_client.hgetall(user_key)
        if not data:
            return None
            
        # Convert Redis strings to ints
        return {
            "points": int(data.get("points", 0)),
            "energy": int(data.get("energy", 1000)),
            "maxEnergy": int(data.get("max_energy", 1000)),
            "level": int(data.get("level", 1)),
            "multitapLevel": int(data.get("multitap_level", 1)),
            "energyLimitLevel": int(data.get("energy_limit_level", 1)),
            "rechargeSpeedLevel": int(data.get("recharge_speed_level", 1)),
            "tapBotLevel": int(data.get("tap_bot_level", 0))
        }

    @staticmethod
    async def process_tap(user_id: int, taps: int):
        user_key = GameService.get_user_key(user_id)
        data = await redis_client.hgetall(user_key)
        if not data:
            raise HTTPException(status_code=404, detail="User not found")
        
        current_time = int(time.time())
        
        # 1. Load Data
        multitap_level = int(data.get("multitap_level", 1))
        stored_energy = int(data.get("energy", 0))
        max_energy = int(data.get("max_energy", 1000))
        last_sync = int(data.get("last_sync_time", current_time))
        recharge_level = int(data.get("recharge_speed_level", 1))
        current_level = int(data.get("level", 1))

        # 2. Passive Regen
        regen_rate = 1 + (recharge_level - 1)
        seconds_passed = current_time - last_sync
        energy_with_regen = min(max_energy, stored_energy + (seconds_passed * regen_rate))
        
        # 3. Tap Logic
        base_val = 1
        for l in LEVELS: 
            if l['lvl'] == current_level: base_val = l['val']

        points_per_tap = base_val + (multitap_level - 1)
        points_gained = taps * points_per_tap
        energy_cost = taps * points_per_tap 
        
        new_energy = max(0, energy_with_regen - energy_cost)
        
        # 4. Save
        pipe = redis_client.pipeline()
        pipe.hincrby(user_key, "points", points_gained)
        pipe.hset(user_key, mapping={
            "energy": int(new_energy),
            "last_sync_time": current_time
        })
        await pipe.execute()
        
        # Return structured data matching Schema
        final_points = int(data.get("points", 0)) + points_gained
        
        return {
            "points": final_points,
            "energy": int(new_energy), 
            "maxEnergy": max_energy,
            "multitapLevel": multitap_level,
            "energyLimitLevel": int(data.get("energy_limit_level", 1)),
            "rechargeSpeedLevel": recharge_level,
            "level": current_level
        }

    @staticmethod
    async def buy_upgrade(user_id: int, upgrade_type: str):
        user_key = GameService.get_user_key(user_id)
        data = await redis_client.hgetall(user_key)
        if not data: raise HTTPException(404, "User not found")
        
        field_map = {
            "multitap": "multitap_level",
            "energy_limit": "energy_limit_level",
            "recharge_speed": "recharge_speed_level",
            "tap_bot": "tap_bot_level"
        }
        
        if upgrade_type not in field_map: raise HTTPException(400, "Invalid upgrade")
        
        db_field = field_map[upgrade_type]
        current_level = int(data.get(db_field, 1))
        
        # Calculate Cost
        config = UPGRADE_CONFIG.get(upgrade_type)
        if not config: raise HTTPException(400, "Config missing")
        
        cost = int(config["base_cost"] * (current_level ** config["coeff"]))
        points = int(data.get("points", 0))
        
        if points < cost: raise HTTPException(400, "Not enough points")
        
        new_level = current_level + 1
        new_points = points - cost
        
        pipe = redis_client.pipeline()
        pipe.hset(user_key, "points", new_points)
        pipe.hset(user_key, db_field, new_level)
        
        new_max = int(data.get("max_energy", 1000))
        if upgrade_type == "energy_limit":
            new_max = 1000 + ((new_level - 1) * 500)
            pipe.hset(user_key, "max_energy", new_max)
            
        await pipe.execute()
        
        # We need to return specific keys to pass the tests (snake_case vs camelCase mix)
        updated_data = await redis_client.hgetall(user_key)
        
        return {
            "points": int(updated_data.get("points")),
            "energy": int(updated_data.get("energy")),
            "multitap_level": int(updated_data.get("multitap_level", 1)),
            "energy_limit_level": int(updated_data.get("energy_limit_level", 1)),
            "recharge_speed_level": int(updated_data.get("recharge_speed_level", 1)),
            "maxEnergy": int(updated_data.get("max_energy"))
        }

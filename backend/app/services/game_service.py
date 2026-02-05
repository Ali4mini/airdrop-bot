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
            current_time = int(time.time())
            initial_state = {
                "points": 0, 
                "energy": 1000, 
                "max_energy": 1000, 
                "level": 1,
                "multitap_level": 1, 
                "energy_limit_level": 1, 
                "recharge_speed_level": 1,
                "tap_bot_level": 0, 
                "last_sync_time": current_time,
                # --- PASSIVE EARN FIELDS ---
                "profit_per_hour": 0,
                "last_passive_sync": current_time
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
            "tapBotLevel": int(data.get("tap_bot_level", 0)),
            # New Fields
            "profitPerHour": int(data.get("profit_per_hour", 0)),
            "lastPassiveSync": int(data.get("last_passive_sync", int(time.time())))
        }

    @staticmethod
    async def process_tap(user_id: int, taps: int):
        if taps < 0:
            return await GameService.get_user_state(user_id)

        user_key = GameService.get_user_key(user_id)
        data = await redis_client.hgetall(user_key)
        
        if not data:
            raise HTTPException(status_code=404, detail="User not found")
        
        current_time = int(time.time())
        
        # 1. Parse Data
        multitap_level = int(data.get("multitap_level", 1))
        stored_energy = int(data.get("energy", 0))
        max_energy = int(data.get("max_energy", 1000))
        last_sync = int(data.get("last_sync_time", current_time))
        recharge_level = int(data.get("recharge_speed_level", 1))
        current_level = int(data.get("level", 1))

        # 2. Calculate Passive Energy Regen
        regen_rate = 1 + (recharge_level - 1)
        seconds_passed = current_time - last_sync
        
        energy_with_regen = min(max_energy, stored_energy + (seconds_passed * regen_rate))
        
        # 3. Calculate Cost per Tap
        base_val = 1
        for l in LEVELS: 
            if l['lvl'] == current_level: 
                base_val = l['val']

        points_per_tap = base_val + (multitap_level - 1)
        energy_cost_per_tap = points_per_tap 
        
        if energy_cost_per_tap > 0:
            max_affordable_taps = energy_with_regen // energy_cost_per_tap
        else:
            max_affordable_taps = taps 

        actual_taps = min(taps, max_affordable_taps)
        
        points_gained = actual_taps * points_per_tap
        total_energy_cost = actual_taps * energy_cost_per_tap 
        
        new_energy = int(energy_with_regen - total_energy_cost)
        
        # 5. Save State
        pipe = redis_client.pipeline()
        pipe.hincrby(user_key, "points", points_gained)
        pipe.hset(user_key, mapping={
            "energy": new_energy,
            "last_sync_time": current_time
        })
        pipe.sadd("users_to_sync", user_id)
        await pipe.execute()

        
        # 6. Return Data
        # Re-fetch specific updated fields to ensure accuracy
        # But for speed, we can calculate local state to return
        final_points = int(data.get("points", 0)) + points_gained
        
        return {
            "points": final_points,
            "energy": new_energy, 
            "maxEnergy": max_energy,
            "multitapLevel": multitap_level,
            "energyLimitLevel": int(data.get("energy_limit_level", 1)),
            "rechargeSpeedLevel": recharge_level,
            "level": current_level,
            "processed_taps": actual_taps,
            # Include passive fields in response to match schema if needed, 
            # or frontend can use cached values
            "profitPerHour": int(data.get("profit_per_hour", 0)),
            "lastPassiveSync": int(data.get("last_passive_sync", current_time))
        }

    @staticmethod
    async def buy_upgrade(user_id: int, upgrade_type: str):
        # NOTE: This handles "Tap" upgrades. 
        # If you add mining cards, create a separate method or expand this one.
        
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
        
        if upgrade_type == "energy_limit":
            new_max = 1000 + ((new_level - 1) * 500)
            pipe.hset(user_key, "max_energy", new_max)
            

        pipe.sadd("users_to_sync", user_id)
        await pipe.execute()
        
        updated_data = await redis_client.hgetall(user_key)
        
        return {
            "points": int(updated_data.get("points")),
            "energy": int(updated_data.get("energy")),
            "multitap_level": int(updated_data.get("multitap_level", 1)),
            "energy_limit_level": int(updated_data.get("energy_limit_level", 1)),
            "recharge_speed_level": int(updated_data.get("recharge_speed_level", 1)),
            "maxEnergy": int(updated_data.get("max_energy")),
             # New Fields
            "profitPerHour": int(data.get("profit_per_hour", 0)),
            "lastPassiveSync": int(data.get("last_passive_sync", int(time.time())))
        }

    # ------------------------------------------------------------------
    # NEW FEATURE: Passive Income Sync
    # ------------------------------------------------------------------
    @staticmethod
    async def sync_passive_income(user_id: int):
        user_key = GameService.get_user_key(user_id)
        data = await redis_client.hgetall(user_key)
        
        if not data:
            raise HTTPException(status_code=404, detail="User not found")

        current_time = int(time.time())
        last_passive_sync = int(data.get("last_passive_sync", current_time))
        profit_per_hour = int(data.get("profit_per_hour", 0))

        # 1. Calculate Time Difference
        seconds_passed = current_time - last_passive_sync

        # 2. Config: Max offline time (3 hours)
        MAX_OFFLINE_SECONDS = 3 * 3600
        eligible_seconds = min(seconds_passed, MAX_OFFLINE_SECONDS)

        # 3. Calculate Earned Amount
        # Avoid division by zero issues
        earned_coins = 0
        if profit_per_hour > 0 and eligible_seconds > 0:
            earned_coins = int((profit_per_hour / 3600) * eligible_seconds)

        # 4. Update DB
        pipe = redis_client.pipeline()
        if earned_coins > 0:
            pipe.hincrby(user_key, "points", earned_coins)
        
        # Always update the sync time, even if 0 earned, 
        # so the timer resets for the next window.
        pipe.hset(user_key, "last_passive_sync", current_time)
        pipe.sadd("users_to_sync", user_id)
        await pipe.execute()

        new_total_points = int(data.get("points", 0)) + earned_coins

        return {
            "earned": earned_coins,
            "points": new_total_points,
            "profit_per_hour": profit_per_hour
        }

    # ------------------------------------------------------------------
    # HELPER: How to buy a "Mining Card" (Increases Profit)
    # ------------------------------------------------------------------
    # You will need to create an API endpoint for this like:
    # @router.post("/buy-card") calling this method.
    @staticmethod
    async def buy_mining_upgrade(user_id: int, cost: int, profit_increase: int):
        """
        Buying a card increases profit_per_hour.
        CRITICAL: We must sync existing earnings BEFORE changing the rate.
        """
        # 1. Claim pending earnings first
        await GameService.sync_passive_income(user_id)
        
        user_key = GameService.get_user_key(user_id)
        
        # 2. Check Balance
        current_points = int(await redis_client.hget(user_key, "points") or 0)
        if current_points < cost:
            raise HTTPException(400, "Insufficient funds")

        # 3. Apply Purchase
        pipe = redis_client.pipeline()
        pipe.hincrby(user_key, "points", -cost)
        pipe.hincrby(user_key, "profit_per_hour", profit_increase)
        
        pipe.sadd("users_to_sync", user_id)
        await pipe.execute()

        return await GameService.get_user_state(user_id)

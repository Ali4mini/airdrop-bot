import json
import random
import time
from fastapi import HTTPException
from app.core.database import redis_client

class ReferralService:
    
    @staticmethod
    def get_keys(user_id: str):
        return {
            "user": f"user:{user_id}",
            "referral": f"user:{user_id}:referral",
            "referrals": f"user:{user_id}:referrals",
            "referral_code_to_user": "referral_code_to_user",
            "referral_links": "referral_links"
        }

    @staticmethod
    async def initialize_referral(user_id: str, first_name: str, last_name: str = None, username: str = None):
        keys = ReferralService.get_keys(user_id)
        
        if await redis_client.exists(keys["referral"]):
            return
        
        referral_code = await ReferralService.generate_referral_code()
        
        referral_info = {
            "user_id": user_id,
            "referral_code": referral_code,
            "first_name": first_name,
            "last_name": last_name or "",
            "username": username or "",
            "total_earned": 0,
            "friends_count": 0
        }
        
        # Use a pipeline for the initialization
        pipe = redis_client.pipeline()
        pipe.set(keys["referral"], json.dumps(referral_info))
        pipe.hset("referral_code_to_user", referral_code, user_id)
        pipe.hset("referral_links", user_id, referral_code)
        
        # Trigger sync so the DB knows this user now has a referral code
        pipe.sadd("users_to_sync", user_id)
        await pipe.execute()

    @staticmethod
    async def process_referral(referrer_code: str, new_user_id: str, first_name: str, last_name: str = None, username: str = None):
        # 1. Validate Referrer
        referrer_user_id = await redis_client.hget("referral_code_to_user", referrer_code)
        if not referrer_user_id:
            raise HTTPException(400, "Invalid referral code")
        
        if str(referrer_user_id) == str(new_user_id):
            raise HTTPException(400, "You cannot refer yourself")

        # 2. Setup new user (Sync triggered inside initialize_referral)
        await ReferralService.initialize_referral(new_user_id, first_name, last_name, username)
        
        # 3. Get Referrer keys
        referrer_keys = ReferralService.get_keys(referrer_user_id)
        new_user_keys = ReferralService.get_keys(new_user_id)
        
        # Fetch current referrer data
        referrer_data_raw = await redis_client.get(referrer_keys["referral"])
        if not referrer_data_raw:
            raise HTTPException(500, "Referrer data not found")
        
        referrer_data = json.loads(referrer_data_raw)
        
        # 4. Prepare Updates
        referrer_data["friends_count"] += 1
        referrer_data["total_earned"] += 2500
        
        new_user_referral_relationship = {
            "user_id": new_user_id,
            "referral_code_used": referrer_code,
            "referrer_user_id": referrer_user_id,
            "first_name": first_name,
            "earned": 2500,
            "joined_at": int(time.time())
        }

        # 5. Execute everything in ONE Pipeline
        pipe = redis_client.pipeline()
        
        # Update Referrer stats and points
        pipe.set(referrer_keys["referral"], json.dumps(referrer_data))
        pipe.hset(referrer_keys["referrals"], new_user_id, json.dumps(new_user_referral_relationship))
        pipe.hincrby(f"user:{referrer_user_id}", "points", 2500)
        
        # Update New User (Who referred them) and points
        # We fetch the new user's referral string we just created in step 2
        # (This is a bit slow, but ensures data integrity)
        new_user_data_raw = await redis_client.get(new_user_keys["referral"])
        if new_user_data_raw:
            new_user_data = json.loads(new_user_data_raw)
            new_user_data["referred_by"] = referrer_code
            pipe.set(new_user_keys["referral"], json.dumps(new_user_data))

        pipe.hincrby(f"user:{new_user_id}", "points", 2500)

        # TRIGGER SYNC FOR BOTH USERS
        pipe.sadd("users_to_sync", referrer_user_id)
        pipe.sadd("users_to_sync", new_user_id)
        
        await pipe.execute()

    # ... get_referral_info remains mostly the same, 
    # but ensure it uses initialize_referral correctly ...

import json
import os
import random
import string
import time
from typing import Any, Dict, List, Optional

from fastapi import HTTPException

from app.core.database import redis_client

BOT_USERNAME = os.getenv("TELEGRAM_BOT_USERNAME", "YourBotName")


class ReferralService:

    @staticmethod
    def get_keys(user_id: str):
        return {
            "referral_stats": f"user:{user_id}:referral",
            "referrals_list": f"user:{user_id}:referrals",
            "code_to_id": "referral_code_to_user",
            "id_to_code": "referral_links",
            "sync_set": "users_to_sync",
        }

    @staticmethod
    async def get_referral_info(user_id: str) -> Dict[str, Any]:
        keys = ReferralService.get_keys(user_id)
        stats = await redis_client.hgetall(keys["referral_stats"])

        # Auto-initialize if user doesn't exist (safety)
        if not stats:
            # Note: In production, fetch actual name from DB/Telegram context
            stats = await ReferralService.initialize_referral(user_id, "User")

        friends_raw = await redis_client.hgetall(keys["referrals_list"])
        friends_list = []
        for f_json in friends_raw.values():
            friends_list.append(json.loads(f_json))

        friends_list.sort(key=lambda x: x["joined_at"], reverse=True)

        code = stats.get("referral_code")

        # Construct the response to match the Frontend's expectations
        return {
            "referral_info": {
                "referral_code": code,
                "link": f"https://t.me/{BOT_USERNAME}?start={code}",
            },
            "friends": friends_list,
            "total_earned": int(stats.get("total_earned", 0)),
            "friends_count": int(stats.get("friends_count", 0)),
        }

    @staticmethod
    async def generate_referral_code(length: int = 8) -> str:
        """Generates a unique referral code."""
        characters = string.ascii_uppercase + string.digits
        while True:
            code = "".join(random.choices(characters, k=length))
            # Check if code exists
            exists = await redis_client.hexists("referral_code_to_user", code)
            if not exists:
                return code

    @staticmethod
    async def initialize_referral(
        user_id: str, first_name: str, last_name: str = None, username: str = None
    ) -> Dict[str, Any]:
        keys = ReferralService.get_keys(user_id)

        # Check if already initialized
        existing = await redis_client.hgetall(keys["referral_stats"])
        if existing:
            return existing

        referral_code = await ReferralService.generate_referral_code()

        referral_data = {
            "user_id": user_id,
            "referral_code": referral_code,
            "first_name": first_name or "",
            "last_name": last_name or "",
            "username": username or "",
            "total_earned": 0,
            "friends_count": 0,
            "referred_by": "",  # Empty if not referred by anyone
        }

        pipe = redis_client.pipeline()
        pipe.hset(keys["referral_stats"], mapping=referral_data)
        pipe.hset(keys["code_to_id"], referral_code, user_id)
        pipe.hset(keys["id_to_code"], user_id, referral_code)
        pipe.sadd(keys["sync_set"], user_id)
        await pipe.execute()

        return referral_data

    @staticmethod
    async def process_referral(
        referrer_code: str,
        new_user_id: str,
        first_name: str,
        last_name: str = None,
        username: str = None,
    ):
        keys_new_user = ReferralService.get_keys(new_user_id)

        # 1. Validate Referrer
        referrer_user_id = await redis_client.hget(
            "referral_code_to_user", referrer_code
        )
        if not referrer_user_id:
            raise HTTPException(400, "Invalid referral code")

        if str(referrer_user_id) == str(new_user_id):
            raise HTTPException(400, "You cannot refer yourself")

        # 2. Check if new user is already referred to prevent double claiming
        already_referred = await redis_client.hget(
            keys_new_user["referral_stats"], "referred_by"
        )
        if already_referred:
            raise HTTPException(400, "User has already been referred")

        # 3. Initialize new user first
        await ReferralService.initialize_referral(
            new_user_id, first_name, last_name, username
        )

        # 4. Prepare updates
        referrer_keys = ReferralService.get_keys(referrer_user_id)
        reward_amount = 2500

        referral_log = {
            "user_id": new_user_id,
            "first_name": first_name,
            "earned": reward_amount,
            "joined_at": int(time.time()),
        }

        # 5. Atomic Pipeline Execution
        pipe = redis_client.pipeline()

        # Update Referrer (Atomic increments)
        pipe.hincrby(referrer_keys["referral_stats"], "friends_count", 1)
        pipe.hincrby(referrer_keys["referral_stats"], "total_earned", reward_amount)
        pipe.hset(
            referrer_keys["referrals_list"], new_user_id, json.dumps(referral_log)
        )
        pipe.hincrby(f"user:{referrer_user_id}", "points", reward_amount)

        # Update New User (Set who referred them)
        pipe.hset(keys_new_user["referral_stats"], "referred_by", referrer_code)
        pipe.hincrby(f"user:{new_user_id}", "points", reward_amount)

        # Trigger Sync
        pipe.sadd("users_to_sync", referrer_user_id)
        pipe.sadd("users_to_sync", new_user_id)

        await pipe.execute()

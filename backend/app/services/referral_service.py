import json
import random
from fastapi import HTTPException
from app.core.database import redis_client

class ReferralService:
    
    @staticmethod
    def get_keys(user_id: str):
        return {
            "user": f"user:{user_id}",
            "referral": f"user:{user_id}:referral",
            "referrals": f"user:{user_id}:referrals",
            "referral_code_to_user": "referral_code_to_user",  # Hash mapping referral codes to user IDs
            "referral_links": "referral_links"  # Hash mapping user IDs to their referral codes
        }

    @staticmethod
    async def generate_referral_code() -> str:
        """Generate a unique referral code."""
        while True:
            code = ''.join(random.choices('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', k=6))
            # Check if code already exists
            existing_user_id = await redis_client.hget("referral_code_to_user", code)
            if not existing_user_id:
                return code

    @staticmethod
    async def initialize_referral(user_id: str, first_name: str, last_name: str = None, username: str = None):
        """Initialize referral data for a user if it doesn't exist."""
        keys = ReferralService.get_keys(user_id)
        
        # Check if referral data already exists
        if await redis_client.exists(keys["referral"]):
            return
        
        # Generate referral code
        referral_code = await ReferralService.generate_referral_code()
        
        # Store user referral info
        referral_info = {
            "user_id": user_id,
            "referral_code": referral_code,
            "first_name": first_name,
            "last_name": last_name or "",
            "username": username or "",
            "total_earned": 0,
            "friends_count": 0
        }
        
        await redis_client.set(keys["referral"], json.dumps(referral_info))
        
        # Map referral code to user ID
        await redis_client.hset(keys["referral_code_to_user"], referral_code, user_id)
        
        # Map user ID to referral code
        await redis_client.hset(keys["referral_links"], user_id, referral_code)

    @staticmethod
    async def process_referral(referrer_code: str, new_user_id: str, first_name: str, last_name: str = None, username: str = None):
        """Process a referral when a new user joins via referral link."""
        # Find the referrer user ID from the referral code
        referrer_user_id = await redis_client.hget("referral_code_to_user", referrer_code)
        if not referrer_user_id:
            raise HTTPException(400, "Invalid referral code")
        
        # Initialize referral data for the new user
        await ReferralService.initialize_referral(new_user_id, first_name, last_name, username)
        
        # Get referrer's referral data
        referrer_keys = ReferralService.get_keys(referrer_user_id)
        referrer_data_raw = await redis_client.get(referrer_keys["referral"])
        if not referrer_data_raw:
            raise HTTPException(500, "Referrer data not found")
        
        referrer_data = json.loads(referrer_data_raw)
        
        # Update referrer's referral info
        referrer_data["friends_count"] += 1
        referrer_data["total_earned"] += 2500  # Regular referral bonus
        await redis_client.set(referrer_keys["referral"], json.dumps(referrer_data))
        
        # Record the referral relationship
        new_user_referral_data = {
            "user_id": new_user_id,
            "referral_code_used": referrer_code,
            "referrer_user_id": referrer_user_id,
            "first_name": first_name,
            "last_name": last_name or "",
            "username": username or "",
            "earned": 2500,  # Amount earned by the new user
            "joined_at": str(int(__import__('time').time()))
        }
        
        # Add the new user to referrer's referrals list
        referrals_key = f"user:{referrer_user_id}:referrals"
        await redis_client.hset(referrals_key, new_user_id, json.dumps(new_user_referral_data))
        
        # Add referrer info to new user's data
        new_user_keys = ReferralService.get_keys(new_user_id)
        new_user_data_raw = await redis_client.get(new_user_keys["referral"])
        new_user_data = json.loads(new_user_data_raw)
        new_user_data["referred_by"] = referrer_code
        await redis_client.set(new_user_keys["referral"], json.dumps(new_user_data))
        
        # Award coins to both users
        # Add to referrer's points
        await redis_client.hincrby(f"user:{referrer_user_id}", "points", 2500)
        # Add to new user's points
        await redis_client.hincrby(f"user:{new_user_id}", "points", 2500)

    @staticmethod
    async def get_referral_info(user_id: str):
        """Get referral information and friends list for a user."""
        keys = ReferralService.get_keys(user_id)
        
        # Initialize if needed
        await ReferralService.initialize_referral(user_id, "", "", "")
        
        # Get user's referral data
        referral_data_raw = await redis_client.get(keys["referral"])
        if not referral_data_raw:
            raise HTTPException(404, "Referral data not found")
        
        referral_data = json.loads(referral_data_raw)
        
        # Get friends list
        referrals_key = f"user:{user_id}:referrals"
        referrals_raw = await redis_client.hgetall(referrals_key)
        
        friends = []
        for friend_user_id, friend_data_raw in referrals_raw.items():
            friend_data = json.loads(friend_data_raw)
            friend_info = {
                "id": int(friend_user_id),
                "name": friend_data.get("first_name") or friend_data.get("username") or f"User_{friend_user_id}",
                "level": 1,  # You might store level in the referral data
                "earned": friend_data.get("earned", 2500),
                "avatar": ReferralService._get_avatar_for_user(friend_data)  # You might store avatar
            }
            friends.append(friend_info)
        
        return {
            "referral_info": {
                "referral_code": referral_data["referral_code"],
                "link": f"https://t.me/my_bot?start={referral_data['referral_code']}"
            },
            "friends": friends,
            "total_earned": referral_data.get("total_earned", 0)
        }

    @staticmethod
    def _get_avatar_for_user(user_data: dict) -> str:
        """Helper to assign an avatar emoji."""
        avatars = ["🦁", "🦊", "🐶", "🐱", "🐯", "🐵", "🦉", "🐼", "🦄", "🐻"]
        # You could use user ID or other data to assign a consistent avatar
        return random.choice(avatars)

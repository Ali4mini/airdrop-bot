from pydantic import BaseModel, Field
from typing import Optional, List

# --- User ---
class UserData(BaseModel):
    id: int
    username: Optional[str] = None
    first_name: str
    last_name: Optional[str] = None
    is_premium: Optional[bool] = False

# --- Referral Schemas ---
class ReferralInfo(BaseModel):
    referral_code: str
    link: str

class FriendInfo(BaseModel):
    id: int
    name: str  # Using first_name from UserData or username
    level: int
    earned: int  # Coins earned from this referral
    avatar: str  # Emoji or avatar identifier

class ReferralResponse(BaseModel):
    referral_info: ReferralInfo
    friends: List[FriendInfo]
    total_earned: int

# --- Game State ---
# Using snake_case for fields to match Python/Redis conventions easily
# and relying on Pydantic to handle serialization
class GameState(BaseModel):
    points: int
    energy: int
    maxEnergy: int
    level: int
    multitapLevel: int
    energyLimitLevel: int
    rechargeSpeedLevel: int
    tapBotLevel: int

class UpgradePayload(BaseModel):
    user_id: int
    upgrade_type: str 

# --- Tasks ---
class Task(BaseModel):
    id: str
    title: str
    icon: str
    reward: int
    status: str
    type: str

class DailyReward(BaseModel):
    day: int
    reward: int
    is_claimed: bool

class UserTasksResponse(BaseModel):
    daily_rewards: List[DailyReward]
    tasks: List[Task]
    current_streak: int
    last_check_in: Optional[str] = None
    coins: int

# --- Payloads ---
class TapPayload(BaseModel):
    user_id: int
    taps: int = Field(..., gt=0, le=1000) # insure the value is not negative

class TapResponse(BaseModel):
    points: int
    energy: int
    maxEnergy: int
    level: int
    multitapLevel: int
    energyLimitLevel: int
    rechargeSpeedLevel: int

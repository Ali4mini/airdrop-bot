from typing import List, Optional

from pydantic import BaseModel, Field


# --- User ---
class UserData(BaseModel):
    id: int
    username: Optional[str] = None
    first_name: str
    last_name: Optional[str] = None
    is_premium: Optional[bool] = False


class FriendInfo(BaseModel):
    user_id: str
    first_name: str
    earned: int
    joined_at: int


class ReferralInfo(BaseModel):
    referral_code: str
    link: str


class ReferralResponse(BaseModel):
    referral_info: ReferralInfo
    friends: List[FriendInfo]
    total_earned: int
    friends_count: int


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
    profitPerHour: int
    lastPassiveSync: int


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
    taps: int = Field(..., gt=0, le=1000)  # insure the value is not negative


class TapResponse(BaseModel):
    points: int
    energy: int
    maxEnergy: int
    level: int
    multitapLevel: int
    energyLimitLevel: int
    rechargeSpeedLevel: int


# A generic payload for actions that only need the user_id
class UserPayload(BaseModel):
    user_id: int


# Response for the passive sync
class PassiveEarnResponse(BaseModel):
    earned: int
    points: int
    profit_per_hour: int

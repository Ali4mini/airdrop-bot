from pydantic import BaseModel
from typing import Optional

# --- User ---
class UserData(BaseModel):
    id: int
    username: Optional[str] = None
    first_name: str
    last_name: Optional[str] = None
    is_premium: Optional[bool] = False

# --- Game State ---
class GameState(BaseModel):
    points: int = 0
    energy: int = 1000
    max_energy: int = 1000
    level: int = 1
    # Add these for the Boost system
    multitap_level: int = 1
    energy_limit_level: int = 1
    recharge_speed_level: int = 1
    tap_bot_level: int = 0

class UpgradePayload(BaseModel):
    user_id: int
    upgrade_type: str # 'multitap', 'energy_limit', 'recharge_speed'

# --- Tasks ---
class Task(BaseModel):
    id: str  # Changed from int to str to match the new system
    title: str
    icon: str
    reward: int
    status: str # 'pending', 'completed', 'claimed' - updated to match new system
    type: str  # Added type field for task categorization

class DailyReward(BaseModel):
    day: int
    reward: int
    is_claimed: bool

class UserTasksResponse(BaseModel):
    daily_rewards: list[DailyReward]
    tasks: list[Task]
    current_streak: int
    last_check_in: Optional[str] = None
    coins: int

class TaskUpdateResponse(BaseModel):
    success: bool
    task: Task

class TaskClaimResponse(BaseModel):
    success: bool
    reward: int
    new_coins: int
    task: Task

class DailyRewardClaimResponse(BaseModel):
    success: bool
    reward: int
    new_coins: int
    daily_reward: DailyReward

class CoinsResponse(BaseModel):
    coins: int

# --- Payload for Syncing Taps ---
class TapPayload(BaseModel):
    user_id: int
    taps: int # How many times they tapped since last sync

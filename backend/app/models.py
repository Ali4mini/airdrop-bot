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

class UpgradePayload(BaseModel):
    user_id: int
    upgrade_type: str # 'multitap', 'energy_limit', 'recharge_speed'

# --- Tasks ---
class Task(BaseModel):
    id: int
    title: str
    reward: int
    icon: str
    status: str # 'start', 'pending', 'claimed'

# --- Payload for Syncing Taps ---
class TapPayload(BaseModel):
    user_id: int
    taps: int # How many times they tapped since last sync

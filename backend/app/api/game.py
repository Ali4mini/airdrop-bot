from fastapi import APIRouter
# Add PassiveEarnResponse to imports
from app.schemas import TapPayload, TapResponse, UpgradePayload, UserPayload, PassiveEarnResponse
from app.services.game_service import GameService
from pydantic import BaseModel

router = APIRouter()

# --- Existing Endpoints ---
@router.post("/tap", response_model=TapResponse)
async def sync_taps(payload: TapPayload):
    return await GameService.process_tap(payload.user_id, payload.taps)

@router.post("/upgrade")
async def buy_upgrade(payload: UpgradePayload):
    return await GameService.buy_upgrade(payload.user_id, payload.upgrade_type)

@router.post("/sync-passive", response_model=PassiveEarnResponse)
async def sync_passive_income(payload: UserPayload):
    return await GameService.sync_passive_income(payload.user_id)

# --- NEW: Endpoint to Buy Profit Per Hour ---

class BuyCardPayload(BaseModel):
    user_id: int
    cost: int
    profit_increase: int

@router.post("/buy-card")
async def buy_card(payload: BuyCardPayload):
    """
    Test Endpoint: Buy an upgrade that increases Profit/Hour.
    In a real app, you would validate the card ID against a config file.
    """
    return await GameService.buy_mining_upgrade(
        user_id=payload.user_id, 
        cost=payload.cost, 
        profit_increase=payload.profit_increase
    )

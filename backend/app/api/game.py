from fastapi import APIRouter
from app.schemas import TapPayload, TapResponse, UpgradePayload
from app.services.game_service import GameService

router = APIRouter()

@router.post("/tap", response_model=TapResponse)
async def sync_taps(payload: TapPayload):
    return await GameService.process_tap(payload.user_id, payload.taps)

@router.post("/upgrade")
async def buy_upgrade(payload: UpgradePayload):
    return await GameService.buy_upgrade(payload.user_id, payload.upgrade_type)

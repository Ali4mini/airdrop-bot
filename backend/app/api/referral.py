from fastapi import APIRouter, HTTPException
from typing import Optional
from .. import schemas
from ..services.referral_service import ReferralService

router = APIRouter(prefix="/referral", tags=["referral"])

@router.get("/", response_model=schemas.ReferralResponse)
async def get_referral_info(
    user_id: str
):
    """Get referral information and friends list for the user."""
    result = await ReferralService.get_referral_info(user_id)
    return result

@router.post("/process")
async def process_referral(
    referrer_code: str,
    new_user_id: str,
    first_name: str,
    last_name: Optional[str] = None,
    username: Optional[str] = None
):
    """Process a referral when a new user joins."""
    await ReferralService.process_referral(referrer_code, new_user_id, first_name, last_name, username)
    return {"message": "Referral processed successfully"}

# Endpoint to get just the referral link (if needed separately)
@router.get("/link")
async def get_referral_link(
    user_id: str
):
    """Get referral link for the user."""
    result = await ReferralService.get_referral_info(user_id)
    return {"link": result["referral_info"]["link"]}

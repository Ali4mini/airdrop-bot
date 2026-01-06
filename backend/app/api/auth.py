from fastapi import APIRouter
from app.schemas import UserData
from app.services.game_service import GameService
from app.services.task_service import TaskService

router = APIRouter()

@router.post("/auth")
async def login(user: UserData):
    # 1. Ensure user exists
    await GameService.create_user_if_not_exists(user)
    
    # 2. Ensure tasks initialized
    await TaskService.initialize_tasks(str(user.id))
    
    # 3. Trigger regen sync
    state = await GameService.process_tap(user.id, 0)
    
    return {
        "user": user,
        "gameState": state
    }

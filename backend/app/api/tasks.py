from fastapi import APIRouter
from app.schemas import UserTasksResponse
from app.services.task_service import TaskService

router = APIRouter()

@router.get("/tasks/{user_id}", response_model=UserTasksResponse)
async def get_user_tasks(user_id: str):
    return await TaskService.get_overview(user_id)

@router.post("/tasks/{user_id}/{task_id}/complete")
async def complete_task(user_id: str, task_id: str):
    task = await TaskService.complete_task(user_id, task_id)
    return {"success": True, "task": task}

@router.post("/tasks/{user_id}/{task_id}/claim")
async def claim_task_reward(user_id: str, task_id: str):
    task, new_coins = await TaskService.claim_task(user_id, task_id)
    return {
        "success": True,
        "reward": task["reward"],
        "new_coins": new_coins,
        "task": task
    }

@router.post("/tasks/{user_id}/daily-reward/{day}/claim")
async def claim_daily_reward(user_id: str, day: int):
    reward, new_coins = await TaskService.claim_daily_reward(user_id, day)
    return {
        "success": True,
        "reward": reward["reward"],
        "new_coins": new_coins,
        "daily_reward": reward
    }

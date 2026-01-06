import json
import time
from datetime import datetime, timezone
from fastapi import HTTPException
from app.core.database import redis_client
from app.core.config import TASKS_DB, DAILY_REWARDS_DB

class TaskService:
    
    @staticmethod
    def get_keys(user_id: str):
        return {
            "user": f"user:{user_id}",
            "tasks": f"user:{user_id}:tasks",
            "rewards": f"user:{user_id}:daily_rewards",
            "stats": f"user:{user_id}:stats"
        }

    @staticmethod
    async def initialize_tasks(user_id: str):
        keys = TaskService.get_keys(user_id)
        
        # Init Tasks
        if not await redis_client.exists(keys["tasks"]):
            for task in TASKS_DB:
                await redis_client.hset(keys["tasks"], task["id"], json.dumps(task))
        
        # Init Daily Rewards
        if not await redis_client.exists(keys["rewards"]):
            for reward in DAILY_REWARDS_DB:
                await redis_client.hset(keys["rewards"], str(reward["day"]), json.dumps(reward))
        
        # Init Stats
        if not await redis_client.exists(keys["stats"]):
            await redis_client.hset(keys["stats"], mapping={"current_streak": 0, "last_check_in": "null"})

    @staticmethod
    async def get_overview(user_id: str):
        await TaskService.initialize_tasks(user_id)
        keys = TaskService.get_keys(user_id)
        
        tasks_raw = await redis_client.hgetall(keys["tasks"])
        rewards_raw = await redis_client.hgetall(keys["rewards"])
        stats = await redis_client.hgetall(keys["stats"])
        user_points = await redis_client.hget(keys["user"], "points")
        
        tasks = [json.loads(v) for v in tasks_raw.values()]
        daily_rewards = [json.loads(v) for v in rewards_raw.values()]
        daily_rewards.sort(key=lambda x: x["day"])
        
        return {
            "daily_rewards": daily_rewards,
            "tasks": tasks,
            "current_streak": int(stats.get("current_streak", 0)),
            "last_check_in": stats.get("last_check_in"),
            "coins": int(user_points) if user_points else 0
        }

    @staticmethod
    async def complete_task(user_id: str, task_id: str):
        await TaskService.initialize_tasks(user_id)
        keys = TaskService.get_keys(user_id)
        
        raw = await redis_client.hget(keys["tasks"], task_id)
        if not raw: raise HTTPException(404, "Task not found")
        
        task = json.loads(raw)
        if task["status"] == "claimed": raise HTTPException(400, "Task already completed")
        
        task["status"] = "completed"
        await redis_client.hset(keys["tasks"], task_id, json.dumps(task))
        return task

    @staticmethod
    async def claim_task(user_id: str, task_id: str):
        await TaskService.initialize_tasks(user_id)
        keys = TaskService.get_keys(user_id)
        
        raw = await redis_client.hget(keys["tasks"], task_id)
        if not raw: raise HTTPException(404, "Task not found")
        
        task = json.loads(raw)
        if task["status"] != "completed": raise HTTPException(400, "Task not completed yet")
        
        task["status"] = "claimed"
        await redis_client.hset(keys["tasks"], task_id, json.dumps(task))
        
        new_points = await redis_client.hincrby(keys["user"], "points", task["reward"])
        return task, new_points

    @staticmethod
    async def claim_daily_reward(user_id: str, day: int):
        await TaskService.initialize_tasks(user_id)
        keys = TaskService.get_keys(user_id)
        
        stats = await redis_client.hgetall(keys["stats"])
        last_check = stats.get("last_check_in")
        
        if last_check and last_check != "null":
            last_date = datetime.fromtimestamp(int(last_check), tz=timezone.utc).date()
            now_date = datetime.now(tz=timezone.utc).date()
            if last_date == now_date: raise HTTPException(400, "Already claimed today")
            
        current_streak = int(stats.get("current_streak", 0))
        if day != current_streak + 1: raise HTTPException(400, f"You must claim Day {current_streak + 1}")
        
        raw_reward = await redis_client.hget(keys["rewards"], str(day))
        if not raw_reward: raise HTTPException(404, "Reward not found")
        
        reward = json.loads(raw_reward)
        if reward["is_claimed"]: raise HTTPException(400, "Reward already claimed")
        
        reward["is_claimed"] = True
        await redis_client.hset(keys["rewards"], str(day), json.dumps(reward))
        
        new_points = await redis_client.hincrby(keys["user"], "points", reward["reward"])
        await redis_client.hset(keys["stats"], mapping={
            "current_streak": day,
            "last_check_in": str(int(time.time()))
        })
        
        return reward, new_points

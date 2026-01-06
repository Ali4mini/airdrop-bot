# app/services/base.py
class RedisKeys:
    @staticmethod
    def user(user_id: int | str) -> str:
        return f"user:{user_id}"

    @staticmethod
    def user_tasks(user_id: int | str) -> str:
        return f"user:{user_id}:tasks"

    @staticmethod
    def user_daily_rewards(user_id: int | str) -> str:
        return f"user:{user_id}:daily_rewards"

    @staticmethod
    def user_stats(user_id: int | str) -> str:
        return f"user:{user_id}:stats"

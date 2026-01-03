import redis.asyncio as redis
import os
from dotenv import load_dotenv

load_dotenv()

# Connect to Redis
redis_client = redis.from_url(os.getenv("REDIS_URL"), decode_responses=True)

async def get_redis():
    return redis_client

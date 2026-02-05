import redis.asyncio as redis
import os

# 1. Get URL from environment (Docker) or default to localhost (Local)
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# 2. CRITICAL: decode_responses=True makes Redis return Strings, not Bytes
redis_client = redis.from_url(REDIS_URL, decode_responses=True)


POSTGRES_URL = os.getenv("POSTGRES_URL")

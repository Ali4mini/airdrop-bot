import asyncio
import json
import logging
import psycopg2
from psycopg2.extras import execute_values
from database import redis_client, POSTGRES_URL 

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sync_worker")

async def redis_to_postgres_sync_loop():
    while True:
        try:
            # Pop 100 users who need syncing
            user_ids = await redis_client.spop("users_to_sync", 100)
            if not user_ids:
                await asyncio.sleep(10)
                continue

            payloads = []
            for uid in user_ids:
                pipe = redis_client.pipeline()
                # 1. Main Profile (Hash)
                pipe.hgetall(f"user:{uid}")
                # 2. Tasks (Hash)
                pipe.hgetall(f"user:{uid}:tasks")
                # 3. Stats (Hash)
                pipe.hgetall(f"user:{uid}:stats")
                # 4. Referral Summary (String/JSON)
                pipe.get(f"user:{uid}:referral")
                # 5. List of Friends (Hash)
                pipe.hgetall(f"user:{uid}:referrals")
                
                res = await pipe.execute()
                
                profile, tasks, stats, referral_sum, friends = res
                
                if not profile: continue

                # Build the complete snapshot
                full_state = {
                    "profile": profile,
                    "tasks": tasks,
                    "stats": stats,
                    "referral_summary": json.loads(referral_sum) if referral_sum else {},
                    "friends": friends
                }

                payloads.append((
                    int(uid),
                    int(profile.get("points", 0)),
                    int(profile.get("energy", 0)),
                    int(profile.get("level", 1)),
                    int(profile.get("profit_per_hour", 0)),
                    json.dumps(full_state) # Persisted in JSONB column
                ))

            if payloads:
                await asyncio.to_thread(run_upsert, payloads)

        except Exception as e:
            print(f"Sync Worker Error: {e}")
        
        await asyncio.sleep(10)

def run_upsert(payloads):
    """Sync function to handle blocking Postgres IO"""
    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor() as cur:
            upsert_query = """
                INSERT INTO users (telegram_id, points, energy, level, profit_per_hour, raw_state)
                VALUES %s
                ON CONFLICT (telegram_id) DO UPDATE SET
                    points = EXCLUDED.points,
                    energy = EXCLUDED.energy,
                    level = EXCLUDED.level,
                    profit_per_hour = EXCLUDED.profit_per_hour,
                    raw_state = EXCLUDED.raw_state,
                    last_db_sync = NOW();
            """
            execute_values(cur, upsert_query, payloads)
            conn.commit()
    finally:
        conn.close()

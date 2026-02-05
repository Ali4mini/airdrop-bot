import redis
import psycopg2
from psycopg2.extras import execute_values
import time
import logging

# Configuration
REDIS_CONFIG = {
    'host': 'localhost',
    'port': 6379,
    'db': 0,
    'decode_responses': True
}

POSTGRES_CONFIG = "dbname=postgres_password user=postgres password=postgres_password host=localhost"

# Constants
BUFFER_KEY = "user_clicks_buffer"
PROCESSING_KEY = "user_clicks_processing"
SYNC_INTERVAL = 30  # Seconds

# Setup Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def sync_data():
    # Connect to Redis and Postgres
    r = redis.Redis(**REDIS_CONFIG)
    conn = None
    
    try:
        # 1. Check if there is data to process
        if not r.exists(BUFFER_KEY):
            return

        # 2. Atomic Snapshot: Move buffer to processing key
        # This prevents losing clicks that come in while we are talking to Postgres
        r.rename(BUFFER_KEY, PROCESSING_KEY)
        
        # 3. Get all data from the processing key
        data = r.hgetall(PROCESSING_KEY)
        if not data:
            return

        # Prepare data for Bulk Upsert: List of tuples [(user_id, clicks), ...]
        # We convert clicks to int and ensure user_id is handled correctly
        updates = [(user_id, int(clicks)) for user_id, clicks in data.items()]

        logging.info(f"Syncing {len(updates)} users to PostgreSQL...")

        # 4. Connect to Postgres and perform Bulk UPSERT
        conn = psycopg2.connect(POSTGRES_CONFIG)
        cur = conn.cursor()

        upsert_query = """
            INSERT INTO users (telegram_id, balance, total_clicks, updated_at)
            VALUES %s
            ON CONFLICT (telegram_id) 
            DO UPDATE SET 
                balance = users.balance + EXCLUDED.balance,
                total_clicks = users.total_clicks + EXCLUDED.total_clicks,
                updated_at = NOW();
        """

        # execute_values is the fastest way to do bulk updates in psycopg2
        execute_values(cur, upsert_query, updates)
        
        conn.commit()
        cur.close()

        # 5. Only delete from Redis if Postgres commit was successful
        r.delete(PROCESSING_KEY)
        logging.info("Sync complete.")

    except redis.exceptions.ResponseError as e:
        # Handle case where key might have been deleted/moved by another process
        logging.error(f"Redis error: {e}")
    except Exception as e:
        logging.error(f"Error during sync: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    logging.info("Starting Redis-to-Postgres sync worker...")
    while True:
        sync_data()
        time.sleep(SYNC_INTERVAL)

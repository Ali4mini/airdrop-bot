CREATE TABLE IF NOT EXISTS users (
    telegram_id BIGINT PRIMARY KEY,
    points BIGINT DEFAULT 0,
    energy INT DEFAULT 1000,
    level INT DEFAULT 1,
    profit_per_hour INT DEFAULT 0,
    raw_state JSONB,
    last_db_sync TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leaderboard ON users (points DESC);

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
import fakeredis.aioredis

# Import the app
from main import app

# --- FIXTURES ---

@pytest_asyncio.fixture
async def mock_redis(monkeypatch):
    """
    Creates a FakeRedis instance and replaces the real redis_client 
    in ALL modules where it is imported.
    """
    # 1. Create Fake Redis
    fake = fakeredis.aioredis.FakeRedis(decode_responses=True)
    
    # 2. Patch the DEFINITION (Source)
    monkeypatch.setattr("app.core.database.redis_client", fake)
    
    # 3. CRITICAL: Patch the USAGES (Destinations)
    # Since services do 'from app.core.database import redis_client', 
    # they hold their own reference. We must update that reference.
    monkeypatch.setattr("app.services.game_service.redis_client", fake)
    monkeypatch.setattr("app.services.task_service.redis_client", fake)
    
    # 4. Patch Main (for startup event)
    monkeypatch.setattr("main.redis_client", fake)
    
    yield fake
    
    # 5. Cleanup to prevent "Event loop is closed" errors
    await fake.flushall()
    await fake.aclose()

@pytest_asyncio.fixture
async def client(mock_redis):
    # Pass mock_redis to ensure it's set up before the client starts
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac

# --- TESTS ---

@pytest.mark.asyncio
async def test_login_creates_user(client):
    payload = {"id": 123, "first_name": "TestUser", "is_premium": False}
    response = await client.post("/api/auth", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["gameState"]["energy"] == 1000

@pytest.mark.asyncio
async def test_tapping_math(client):
    # 1. Login
    await client.post("/api/auth", json={"id": 999, "first_name": "Tapper"})

    # 2. Tap
    tap_payload = {"user_id": 999, "taps": 10}
    response = await client.post("/api/tap", json=tap_payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["points"] == 10
    assert data["energy"] == 990

@pytest.mark.asyncio
async def test_buy_upgrade(client, mock_redis):
    user_key = "user:500"
    # Seed the fake DB directly
    await mock_redis.hset(user_key, mapping={
        "points": 5000,
        "multitap_level": 1,
        "energy": 1000,
        # We must seed defaults because the service reads them
        "max_energy": 1000,
        "energy_limit_level": 1,
        "recharge_speed_level": 1,
        "level": 1
    })

    payload = {"user_id": 500, "upgrade_type": "multitap"}
    response = await client.post("/api/upgrade", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["points"] == 4000
    assert data["multitap_level"] == 2

@pytest.mark.asyncio
async def test_energy_regen(client, mock_redis):
    import time
    
    past_time = int(time.time()) - 100
    user_key = "user:777"
    
    await mock_redis.hset(user_key, mapping={
        "energy": 0,
        "max_energy": 1000,
        "last_sync_time": past_time,
        "recharge_speed_level": 1,
        "points": 0,
        "level": 1,
        "multitap_level": 1
    })
    
    # Login triggers the regen calculation
    response = await client.post("/api/auth", json={"id": 777, "first_name": "Sleeper"})
    
    energy = response.json()["gameState"]["energy"]
    # 100 seconds * 1 energy/sec = 100 energy
    assert 99 <= energy <= 101

@pytest.mark.asyncio
async def test_tap_includes_passive_regen(client, mock_redis):
    import time
    user_id = 888
    
    # 1. SETUP: User was last seen 10 seconds ago
    current_time = int(time.time())
    ten_seconds_ago = current_time - 10
    
    await mock_redis.hset(f"user:{user_id}", mapping={
        "points": 0,
        "energy": 500,
        "max_energy": 1000,
        "last_sync_time": ten_seconds_ago,
        "recharge_speed_level": 1,
        "multitap_level": 1,
        "level": 1
    })

    # 2. ACTION: Tap
    response = await client.post("/api/tap", json={"user_id": user_id, "taps": 1})
    
    assert response.status_code == 200
    data = response.json()

    # 3. EXPECTATION: 500 (Start) + 10 (Regen) - 1 (Tap Cost) = 509
    expected_energy = 509
    assert expected_energy - 1 <= data["energy"] <= expected_energy + 1

# --- TASK TESTS ---

@pytest.mark.asyncio
async def test_complete_and_claim_task(client):
    user_id = "67890"
    await client.post("/api/auth", json={"id": int(user_id), "first_name": "Tasker"})
    
    # 1. Complete
    response = await client.post(f"/api/tasks/{user_id}/task_1/complete")
    assert response.status_code == 200
    assert response.json()["task"]["status"] == "completed"
    
    # 2. Claim
    response = await client.post(f"/api/tasks/{user_id}/task_1/claim")
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["new_coins"] == 1000

@pytest.mark.asyncio
async def test_task_validation(client):
    user_id = "11111"
    await client.post("/api/auth", json={"id": int(user_id), "first_name": "Validator"})
    
    # 1. Claim before Complete -> Fail (400)
    response = await client.post(f"/api/tasks/{user_id}/task_1/claim")
    assert response.status_code == 400 
    
    # 2. Complete -> Success (200)
    response = await client.post(f"/api/tasks/{user_id}/task_1/complete")
    assert response.status_code == 200
    
    # 3. Claim -> Success (200)
    response = await client.post(f"/api/tasks/{user_id}/task_1/claim")
    assert response.status_code == 200
    
    # 4. Complete again -> Fail (400 - Already Claimed)
    # Note: Logic in TaskService checks 'status == claimed' for complete_task
    response = await client.post(f"/api/tasks/{user_id}/task_1/complete")
    assert response.status_code == 400

@pytest.mark.asyncio
async def test_daily_reward_validation(client, mock_redis):
    user_id = "22222"
    
    # Initialize
    await client.post("/api/auth", json={"id": int(user_id), "first_name": "DailyValidator"})
    
    # Manually set Day 1 to claimed in Redis
    # Note: We store valid JSON string
    await mock_redis.hset(f"user:{user_id}:daily_rewards", "1", 
                         '{"day": 1, "reward": 1000, "is_claimed": true}')
    
    # Try to claim -> Fail
    response = await client.post(f"/api/tasks/{user_id}/daily-reward/1/claim")
    assert response.status_code == 400

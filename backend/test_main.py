import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
import fakeredis.aioredis

# --- IMPORTS BASED ON YOUR FILE STRUCTURE ---
from main import app
# We import redis_client from where it is USED (routes.py), not just where it is defined.
# Based on your file list: app/routes.py
from app.routes import redis_client 

# 1. MOCK REDIS FIXTURE
@pytest_asyncio.fixture(autouse=True)
async def mock_redis(monkeypatch):
    # Create the fake redis
    fake = fakeredis.aioredis.FakeRedis(decode_responses=True)
    
    # CRITICAL FIX: Point to "app.routes.redis_client"
    # This ensures the API uses the fake DB, not the real one
    monkeypatch.setattr("app.routes.redis_client", fake)
    
    # If you use redis_client in utils.py or main.py, patch those too:
    # monkeypatch.setattr("app.database.redis_client", fake)
    
    yield fake
    
    await fake.flushall() 
    await fake.aclose()

# 2. CLIENT FIXTURE
@pytest_asyncio.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac

# --- TESTS ---

@pytest.mark.asyncio
async def test_login_creates_user(client):
    # Note: URL is /api/auth because of main.py prefix
    payload = {"id": 123, "first_name": "TestUser", "is_premium": False}
    response = await client.post("/api/auth", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["gameState"]["energy"] == 1000

@pytest.mark.asyncio
async def test_tapping_math(client):
    # 1. Create User
    await client.post("/api/auth", json={"id": 999, "first_name": "Tapper"})

    # 2. Tap
    tap_payload = {"user_id": 999, "taps": 10}
    response = await client.post("/api/tap", json=tap_payload)
    
    data = response.json()
    # Assuming default logic: 1 tap = 1 point
    assert data["points"] == 10
    assert data["energy"] == 990

@pytest.mark.asyncio
async def test_buy_upgrade(client, mock_redis):
    user_key = "user:500"
    # Seed the fake DB
    await mock_redis.hset(user_key, mapping={
        "points": 5000,
        "multitap_level": 1,
        "energy": 1000
    })

    payload = {"user_id": 500, "upgrade_type": "multitap"}
    response = await client.post("/api/upgrade", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["points"] == 4000 # 5000 - 1000 cost
    print("data: ", data)
    assert data["multitap_level"] == 2 # Check camelCase return if you mapped it, or snake_case

@pytest.mark.asyncio
async def test_energy_regen(client, mock_redis):
    import time
    
    past_time = int(time.time()) - 100
    user_key = "user:777"
    
    await mock_redis.hset(user_key, mapping={
        "energy": 0,
        "max_energy": 1000,
        "last_sync_time": past_time,
        "recharge_speed_level": 1
    })
    
    response = await client.post("/api/auth", json={"id": 777, "first_name": "Sleeper"})
    
    # Should regen ~100 energy
    energy = response.json()["gameState"]["energy"]
    assert 99 <= energy <= 101

@pytest.mark.asyncio
async def test_tap_includes_passive_regen(client, mock_redis):
    """
    Ensures that when a user taps after a delay, the server calculates
    the energy regenerated during that delay BEFORE subtracting the tap cost.
    """
    import time
    
    user_id = 888
    
    # 1. SETUP: User was last seen 10 seconds ago with 500 energy
    current_time = int(time.time())
    ten_seconds_ago = current_time - 10
    
    await mock_redis.hset(f"user:{user_id}", mapping={
        "points": 0,
        "energy": 500,
        "max_energy": 1000,
        "last_sync_time": ten_seconds_ago,
        "recharge_speed_level": 1, # Regen rate = 1 per sec
        "multitap_level": 1,       # Tap cost = 1
        "level": 1                 # Base tap value = 1
    })

    # 2. ACTION: User sends 1 tap
    # The backend will process this at 'current_time'
    response = await client.post("/api/tap", json={"user_id": user_id, "taps": 1})
    
    assert response.status_code == 200
    data = response.json()

    # 3. EXPECTATION:
    # Regen Gained = 10 seconds * 1/sec = +10
    # Pre-Tap Total = 500 + 10 = 510
    # Cost = 1 tap * 1 = -1
    # Final Result should be 509
    
    # Note: We allow a range of +/- 1 because 'time.time()' execution 
    # might vary by a millisecond during the test run.
    expected_energy = 509
    assert expected_energy - 1 <= data["energy"] <= expected_energy + 1

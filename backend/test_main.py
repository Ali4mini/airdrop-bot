import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
import fakeredis.aioredis
import time
import json

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
    monkeypatch.setattr("app.services.referral_service.redis_client", fake) # Add this
    
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
    
    # First, get the tasks to see what daily tasks are available
    tasks_response = await client.get(f"/api/tasks/{user_id}")
    assert tasks_response.status_code == 200
    tasks_data = tasks_response.json()
    
    # Find a daily task to test with
    daily_tasks = [task for task in tasks_data["tasks"] if ":" in task["id"]]
    if daily_tasks:
        task_to_test = daily_tasks[0]
        task_id = task_to_test["id"]
    else:
        # If no daily tasks, try to find a one-time task
        one_time_tasks = [task for task in tasks_data["tasks"] if ":" not in task["id"]]
        if one_time_tasks:
            task_to_test = one_time_tasks[0]
            task_id = task_to_test["id"]
        else:
            pytest.fail("No tasks available to test")
    
    print(f"Testing with task ID: {task_id}")  # Debug print
    
    # 1. Complete
    response = await client.post(f"/api/tasks/{user_id}/{task_id}/complete")
    assert response.status_code == 200
    assert response.json()["task"]["status"] == "completed"
    
    # 2. Claim
    response = await client.post(f"/api/tasks/{user_id}/{task_id}/claim")
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["new_coins"] >= response.json()["reward"]  # At least reward amount


@pytest.mark.asyncio
async def test_task_validation(client):
    user_id = "11111"
    await client.post("/api/auth", json={"id": int(user_id), "first_name": "Validator"})
    
    # First, get the tasks to see what's available
    tasks_response = await client.get(f"/api/tasks/{user_id}")
    assert tasks_response.status_code == 200
    tasks_data = tasks_response.json()
    
    # Find a task to test with (preferably a one-time task for this test)
    one_time_tasks = [task for task in tasks_data["tasks"] if ":" not in task["id"]]
    if one_time_tasks:
        task_to_test = one_time_tasks[0]
        task_id = task_to_test["id"]
    else:
        # Use first available task if no one-time tasks
        if tasks_data["tasks"]:
            task_to_test = tasks_data["tasks"][0]
            task_id = task_to_test["id"]
        else:
            pytest.fail("No tasks available to test")
    
    # 1. Claim before Complete -> Fail (400)
    response = await client.post(f"/api/tasks/{user_id}/{task_id}/claim")
    assert response.status_code == 400 
    
    # 2. Complete -> Success (200)
    response = await client.post(f"/api/tasks/{user_id}/{task_id}/complete")
    assert response.status_code == 200
    
    # 3. Claim -> Success (200)
    response = await client.post(f"/api/tasks/{user_id}/{task_id}/claim")
    assert response.status_code == 200
    
    # 4. Complete again -> Fail (400 - Already Claimed)
    response = await client.post(f"/api/tasks/{user_id}/{task_id}/complete")
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

@pytest.mark.asyncio
async def test_prevent_negative_taps(client, mock_redis):
    """Exploit Check: sending negative taps should be rejected"""
    user_id = 666
    await client.post("/api/auth", json={"id": user_id, "first_name": "Hacker"})
    
    # Send negative taps
    payload = {"user_id": user_id, "taps": -100}
    response = await client.post("/api/tap", json=payload)
    
    # Ideally this should be 422 (Validation Error) or 400
    # currently your code accepts it, so this test might FAIL until we fix schemas.py
    assert response.status_code in [400, 422] 

@pytest.mark.asyncio
async def test_prevent_tapping_more_than_energy(client, mock_redis):
    """Exploit Check: Tapping 1000 times with only 10 energy"""
    user_id = 777
    
    # Seed user with low energy (10)
    await mock_redis.hset(f"user:{user_id}", mapping={
        "points": 0,
        "energy": 10,
        "max_energy": 1000,
        "level": 1,
        "multitap_level": 1,
        "last_sync_time": int(time.time()) # No regen time
    })
    
    # Try to tap 100 times (Cost 100)
    response = await client.post("/api/tap", json={"user_id": user_id, "taps": 100})
    
    data = response.json()
    
    # The user should ONLY get credit for the energy they had (10 taps), not 100.
    # Or the request should be rejected. 
    # Current code gives full points -> This is a BUG/GLITCH.
    assert data["points"] <= 10 # Should not be 100

@pytest.mark.asyncio
async def test_upgrade_insufficient_funds(client, mock_redis):
    user_id = 900
    # Seed user with 0 points
    await mock_redis.hset(f"user:{user_id}", mapping={
        "points": 0,
        "multitap_level": 1
    })

    payload = {"user_id": user_id, "upgrade_type": "multitap"}
    response = await client.post("/api/upgrade", json=payload)
    
    assert response.status_code == 400
    assert response.json()["detail"] == "Not enough points"

@pytest.mark.asyncio
async def test_energy_regen_cap(client, mock_redis):
    """Ensure energy doesn't overflow max_energy after long inactivity"""
    import time
    user_id = 999
    
    # User last seen 1 year ago
    long_ago = int(time.time()) - (3600 * 24 * 365)
    
    await mock_redis.hset(f"user:{user_id}", mapping={
        "energy": 0,
        "max_energy": 1000,
        "last_sync_time": long_ago,
        "recharge_speed_level": 1
    })
    
    response = await client.post("/api/auth", json={"id": user_id, "first_name": "OldUser"})
    
    data = response.json()["gameState"]
    # Energy should be exactly max_energy (1000), not 31,000,000
    assert data["energy"] == 1000

# --- REFERRAL TESTS ---

@pytest.mark.asyncio
async def test_get_referral_info_new_user(client, mock_redis):
    """Test that getting referral info for a new user creates their referral data."""
    user_id = "10000"
    
    # Get referral info for a new user
    response = await client.get(f"/api/referral/?user_id={user_id}")
    
    assert response.status_code == 200
    data = response.json()
    
    # Check the structure of the response
    assert "referral_info" in data
    assert "referral_code" in data["referral_info"]
    assert "link" in data["referral_info"]
    assert "friends" in data
    assert isinstance(data["friends"], list)
    assert "total_earned" in data
    
    # Check that the referral code and link are properly formatted
    assert len(data["referral_info"]["referral_code"]) == 6
    assert data["referral_info"]["link"].startswith("https://t.me/my_bot?start=")
    
    # Check that a new user has no friends initially
    assert len(data["friends"]) == 0
    
    # Verify that the referral data was stored in Redis
    referral_key = f"user:{user_id}:referral"
    referral_data_raw = await mock_redis.get(referral_key)
    assert referral_data_raw is not None
    
    referral_data = json.loads(referral_data_raw)
    assert referral_data["user_id"] == user_id
    assert referral_data["referral_code"] == data["referral_info"]["referral_code"]
    assert referral_data["friends_count"] == 0
    assert referral_data["total_earned"] == 0


@pytest.mark.asyncio
async def test_get_referral_info_existing_user(client, mock_redis):
    """Test that getting referral info for an existing user works."""
    user_id = "10001"
    
    # First, create referral data by getting referral info
    first_response = await client.get(f"/api/referral/?user_id={user_id}")
    assert first_response.status_code == 200
    first_data = first_response.json()
    first_code = first_data["referral_info"]["referral_code"]
    
    # Get referral info again
    second_response = await client.get(f"/api/referral/?user_id={user_id}")
    assert second_response.status_code == 200
    second_data = second_response.json()
    
    # The referral code should be the same
    assert second_data["referral_info"]["referral_code"] == first_code


@pytest.mark.asyncio
async def test_process_referral_valid(client, mock_redis):
    """Test that processing a valid referral works correctly."""
    # Create referrer user
    referrer_id = "20000"
    referrer_response = await client.get(f"/api/referral/?user_id={referrer_id}")
    assert referrer_response.status_code == 200
    referrer_data = referrer_response.json()
    referrer_code = referrer_data["referral_info"]["referral_code"]
    
    # Process referral for a new user
    new_user_id = "20001"
    new_user_first_name = "NewUser"
    
    response = await client.post(
        "/api/referral/process",
        params={
            "referrer_code": referrer_code,
            "new_user_id": new_user_id,
            "first_name": new_user_first_name
        }
    )
    
    assert response.status_code == 200
    assert response.json()["message"] == "Referral processed successfully"
    
    # Check that referrer's data was updated
    referrer_updated_response = await client.get(f"/api/referral/?user_id={referrer_id}")
    referrer_updated_data = referrer_updated_response.json()
    
    assert referrer_updated_data["referral_info"]["referral_code"] == referrer_code
    assert len(referrer_updated_data["friends"]) == 1
    assert referrer_updated_data["friends"][0]["name"] == new_user_first_name
    assert referrer_updated_data["total_earned"] == 2500  # Referrer bonus
    
    # Check that new user's data was updated
    new_user_response = await client.get(f"/api/referral/?user_id={new_user_id}")
    new_user_data = new_user_response.json()
    
    # The new user should have 0 friends initially but have been referred by someone
    # (Note: The current service doesn't return 'referred_by' in the main response)
    
    # Check that points were awarded to both users
    referrer_points = await mock_redis.hget(f"user:{referrer_id}", "points")
    assert int(referrer_points) == 2500
    
    new_user_points = await mock_redis.hget(f"user:{new_user_id}", "points")
    assert int(new_user_points) == 2500


@pytest.mark.asyncio
async def test_process_referral_invalid_code(client, mock_redis):
    """Test that processing a referral with an invalid code fails."""
    invalid_code = "INVALID"
    new_user_id = "30000"
    new_user_first_name = "NewUser"
    
    response = await client.post(
        "/api/referral/process",
        params={
            "referrer_code": invalid_code,
            "new_user_id": new_user_id,
            "first_name": new_user_first_name
        }
    )
    
    assert response.status_code == 400
    assert "Invalid referral code" in response.json()["detail"]


@pytest.mark.asyncio
async def test_referral_with_multiple_friends(client, mock_redis):
    """Test that a user can have multiple referred friends."""
    # Create referrer user
    referrer_id = "40000"
    referrer_response = await client.get(f"/api/referral/?user_id={referrer_id}")
    assert referrer_response.status_code == 200
    referrer_data = referrer_response.json()
    referrer_code = referrer_data["referral_info"]["referral_code"]
    
    # Process referrals for multiple new users
    for i in range(3):
        new_user_id = f"4000{i+1}"
        new_user_first_name = f"NewUser{i+1}"
        
        response = await client.post(
            "/api/referral/process",
            params={
                "referrer_code": referrer_code,
                "new_user_id": new_user_id,
                "first_name": new_user_first_name
            }
        )
        assert response.status_code == 200
    
    # Check that referrer's friends list has all 3 users
    referrer_updated_response = await client.get(f"/api/referral/?user_id={referrer_id}")
    referrer_updated_data = referrer_updated_response.json()
    
    assert len(referrer_updated_data["friends"]) == 3
    assert referrer_updated_data["total_earned"] == 7500  # 3 * 2500


@pytest.mark.asyncio
async def test_get_referral_link(client, mock_redis):
    """Test the dedicated endpoint for getting referral link."""
    user_id = "50000"
    
    # First, ensure user has referral data
    await client.get(f"/api/referral/?user_id={user_id}")
    
    # Get just the referral link
    response = await client.get(f"/api/referral/link?user_id={user_id}")
    
    assert response.status_code == 200
    data = response.json()
    
    assert "link" in data
    assert data["link"].startswith("https://t.me/my_bot?start=")
    
    # Verify the link matches what would be returned by the main endpoint
    full_response = await client.get(f"/api/referral/?user_id={user_id}")
    full_data = full_response.json()
    
    assert data["link"] == full_data["referral_info"]["link"]

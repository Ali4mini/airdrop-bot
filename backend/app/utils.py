import hashlib
import hmac
import json
from urllib.parse import parse_qsl
import os

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

def verify_telegram_web_app_data(telegram_init_data: str) -> bool:
    try:
        parsed_data = dict(parse_qsl(telegram_init_data))
        hash_ = parsed_data.pop('hash')
        
        # Sort keys alphabetically
        data_check_string = "\n".join(
            f"{k}={v}" for k, v in sorted(parsed_data.items())
        )
        
        # Calculate HMAC-SHA256 signature
        secret_key = hmac.new(b"WebAppData", TOKEN.encode(), hashlib.sha256).digest()
        calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
        
        return calculated_hash == hash_
    except Exception:
        return False

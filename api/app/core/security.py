import hashlib
import os
from datetime import datetime, timedelta, timezone
from typing import Optional, Any
import jwt
from app.core.config import settings

def get_password_hash(password: str) -> str:
    salt = os.urandom(16)
    pwd_bytes = password.encode('utf-8')
    key = hashlib.pbkdf2_hmac('sha256', pwd_bytes, salt, 100000)
    return f"{salt.hex()}:{key.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        salt_hex, key_hex = hashed_password.split(":")
        salt = bytes.fromhex(salt_hex)
        pwd_bytes = plain_password.encode('utf-8')
        new_key = hashlib.pbkdf2_hmac('sha256', pwd_bytes, salt, 100000)
        return new_key.hex() == key_hex
    except Exception:
        return False

def create_access_token(subject: Any, expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    payload = {"sub": str(subject), "exp": expire}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_access_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload.get("sub")
    except Exception:
        return None

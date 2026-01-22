from datetime import datetime, timedelta
from typing import Optional
import jwt
import bcrypt
from app.config import settings

def verify_password(plain_password: str, hash_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode('utf-8'),
        hash_password.encode('utf-8')
    )

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def get_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    # FIX: Use algorithms as a list consistently
    encode_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encode_jwt

def verify_token(token: str):
    try:
        # FIX: Change from algorithm=[settings.ALGORITHM] to algorithms=[settings.ALGORITHM]
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        print("Token Expired")
        return None  # FIX: Added explicit return
    except jwt.InvalidTokenError as e:
        print(f"Invalid Token: {e}")
        return None
    except Exception as e:
        print(f"Token verification error: {e}")
        return None
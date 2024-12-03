# utils.py

from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from fastapi import HTTPException
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")  # Replace with your actual secret key
SECURITY_PASSWORD_SALT = os.getenv("SECURITY_PASSWORD_SALT", "your-password-salt")  # Replace with your actual salt

def generate_verification_token(email: str) -> str:
    serializer = URLSafeTimedSerializer(SECRET_KEY)
    return serializer.dumps(email, salt=SECURITY_PASSWORD_SALT)

def confirm_verification_token(token: str, expiration: int = 3600) -> str:
    serializer = URLSafeTimedSerializer(SECRET_KEY)
    try:
        email = serializer.loads(
            token,
            salt=SECURITY_PASSWORD_SALT,
            max_age=expiration
        )
    except SignatureExpired:
        raise HTTPException(status_code=400, detail="The verification link has expired.")
    except BadSignature:
        raise HTTPException(status_code=400, detail="Invalid verification token.")
    return email

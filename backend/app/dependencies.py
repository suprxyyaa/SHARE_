import uuid
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.db import get_db
from app.services.auth_service import decode_token

bearer = HTTPBearer()

class CurrentUser:
    def __init__(self, user_id: uuid.UUID, role: str, email: str):
        self.user_id = user_id
        self.role = role
        self.email = email

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
) -> CurrentUser:
    try:
        payload = decode_token(credentials.credentials)
        return CurrentUser(
            user_id=uuid.UUID(payload["sub"]),
            role=payload["role"],
            email=payload["email"],
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

def require_patient(current: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    if current.role != "PATIENT":
        raise HTTPException(status_code=403, detail="Patient access required")
    return current

def require_doctor(current: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    if current.role != "DOCTOR":
        raise HTTPException(status_code=403, detail="Doctor access required")
    return current

def require_admin(current: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    if current.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current
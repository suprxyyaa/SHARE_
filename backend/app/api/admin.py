import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.db import get_db
from app.dependencies import require_admin, CurrentUser
from app.services.admin_service import (
    get_pending_doctors, approve_doctor, reject_doctor, get_reports
)

router = APIRouter(prefix="/admin", tags=["admin"])

class RejectBody(BaseModel):
    reason: Optional[str] = "Does not meet requirements"

@router.get("/pending-doctors")
def pending(db: Session = Depends(get_db),
            current: CurrentUser = Depends(require_admin)):
    result = get_pending_doctors(db)
    return {"success": True, "data": result}

@router.put("/doctors/{doctor_id}/approve")
def approve(doctor_id: uuid.UUID, db: Session = Depends(get_db),
            current: CurrentUser = Depends(require_admin)):
    approve_doctor(db, doctor_user_id=doctor_id)
    return {"success": True, "data": {"approved": True}}

@router.put("/doctors/{doctor_id}/reject")
def reject(doctor_id: uuid.UUID, body: RejectBody,
           db: Session = Depends(get_db),
           current: CurrentUser = Depends(require_admin)):
    reject_doctor(db, doctor_user_id=doctor_id, reason=body.reason)
    return {"success": True, "data": {"rejected": True}}

@router.get("/reports")
def reports(db: Session = Depends(get_db),
            current: CurrentUser = Depends(require_admin)):
    result = get_reports(db)
    return {"success": True, "data": result}
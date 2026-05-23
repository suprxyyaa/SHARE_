import uuid
import cloudinary
import cloudinary.uploader
import sqlalchemy as sa
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.config import settings
from app.models.tables import medical_file, file_permission

cloudinary.config(
    cloud_name=settings.cloudinary_cloud_name,
    api_key=settings.cloudinary_api_key,
    api_secret=settings.cloudinary_api_secret,
    secure=True
)

def upload_medical_file(db: Session, *, patient_id: uuid.UUID,
                        file_name: str, file_bytes: bytes,
                        file_type: str) -> dict:
    result = cloudinary.uploader.upload(
        file_bytes,
        folder=f"medshare/patients/{patient_id}",
        resource_type="raw",
        public_id=f"{uuid.uuid4()}",
        use_filename=False,
    )

    file_id = uuid.uuid4()
    db.execute(medical_file.insert().values(
        id=file_id,
        patient_id=patient_id,
        name=file_name,
        cloudinary_url=result["secure_url"],
        cloudinary_public_id=result["public_id"],
        file_type=file_type,
        size_bytes=result.get("bytes", 0),
    ))
    db.commit()
    return {"file_id": str(file_id), "name": file_name, "url": result["secure_url"]}

def get_patient_files(db: Session, *, patient_id: uuid.UUID) -> list:
    rows = db.execute(
        sa.select(medical_file)
        .where(
            medical_file.c.patient_id == patient_id,
            medical_file.c.deleted_at.is_(None),
        )
        .order_by(medical_file.c.uploaded_at.desc())
    ).fetchall()
    return [dict(r._mapping) for r in rows]

def share_file(db: Session, *, file_id: uuid.UUID, patient_id: uuid.UUID,
               doctor_id: uuid.UUID, expires_at: datetime) -> dict:
    file_row = db.execute(
        sa.select(medical_file).where(
            medical_file.c.id == file_id,
            medical_file.c.patient_id == patient_id,
            medical_file.c.deleted_at.is_(None),
        )
    ).fetchone()
    if not file_row:
        raise ValueError("File not found")

    if expires_at <= datetime.now(timezone.utc):
        raise ValueError("expires_at must be in the future")

    perm_id = uuid.uuid4()
    db.execute(file_permission.insert().values(
        id=perm_id,
        file_id=file_id,
        patient_id=patient_id,
        doctor_id=doctor_id,
        expires_at=expires_at,
        revoked_at=None,
    ))
    db.commit()
    return {"permission_id": str(perm_id)}

def revoke_file(db: Session, *, file_id: uuid.UUID,
                patient_id: uuid.UUID) -> None:
    result = db.execute(
        file_permission.update()
        .where(
            file_permission.c.file_id == file_id,
            file_permission.c.patient_id == patient_id,
            file_permission.c.revoked_at.is_(None),
        )
        .values(revoked_at=sa.func.now())
    )
    db.commit()
    if result.rowcount == 0:
        raise ValueError("No active permission found")
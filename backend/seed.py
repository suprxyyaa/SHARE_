"""
Initialize the database schema and optional demo data.

Run from the backend directory:
    python seed.py

Environment:
    SEED_DEMO=true  — also create demo patient and approved doctor accounts
"""

import os
import sys
import uuid

import sqlalchemy as sa

from app.db import engine, metadata
from app.models.tables import (
    availability,
    doctor_profile,
    patient_profile,
    tenant,
    user,
)
from app.services.auth_service import hash_password

DEMO_PATIENT_EMAIL = "demo.patient@share.test"
DEMO_PATIENT_PASSWORD = "patient123"
DEMO_DOCTOR_EMAIL = "demo.doctor@share.test"
DEMO_DOCTOR_PASSWORD = "doctor123"


def create_schema() -> None:
    metadata.create_all(bind=engine)
    print("Database schema is up to date.")


def seed_tenant(conn) -> None:
    existing = conn.execute(
        sa.select(tenant).where(tenant.c.name == "default")
    ).fetchone()
    if existing:
        print("Default tenant already exists.")
        return

    conn.execute(
        tenant.insert().values(id=uuid.uuid4(), name="default")
    )
    print("Seeded default tenant.")


def seed_demo_accounts(conn) -> None:
    if os.getenv("SEED_DEMO", "").lower() not in ("1", "true", "yes"):
        return

    patient_row = conn.execute(
        sa.select(user).where(user.c.email == DEMO_PATIENT_EMAIL)
    ).fetchone()
    if not patient_row:
        patient_user_id = uuid.uuid4()
        conn.execute(
            user.insert().values(
                id=patient_user_id,
                email=DEMO_PATIENT_EMAIL,
                password_hash=hash_password(DEMO_PATIENT_PASSWORD),
                role="PATIENT",
                status="ACTIVE",
            )
        )
        conn.execute(
            patient_profile.insert().values(
                id=uuid.uuid4(),
                user_id=patient_user_id,
                full_name="Demo Patient",
                phone="+10000000001",
            )
        )
        print(f"Seeded demo patient: {DEMO_PATIENT_EMAIL} / {DEMO_PATIENT_PASSWORD}")

    doctor_row = conn.execute(
        sa.select(user).where(user.c.email == DEMO_DOCTOR_EMAIL)
    ).fetchone()
    if not doctor_row:
        doctor_user_id = uuid.uuid4()
        conn.execute(
            user.insert().values(
                id=doctor_user_id,
                email=DEMO_DOCTOR_EMAIL,
                password_hash=hash_password(DEMO_DOCTOR_PASSWORD),
                role="DOCTOR",
                status="ACTIVE",
            )
        )
        conn.execute(
            doctor_profile.insert().values(
                id=uuid.uuid4(),
                user_id=doctor_user_id,
                full_name="Dr. Demo Physician",
                specialty="General Practice",
                bio="Demo doctor account for testing appointments and file sharing.",
                consultation_fee=500,
                consultation_type="BOTH",
                clinic_address="123 Demo Street",
                verification_status="APPROVED",
            )
        )
        conn.execute(
            availability.insert().values(
                id=uuid.uuid4(),
                doctor_id=doctor_user_id,
                day_of_week=1,
                start_time="09:00",
                end_time="17:00",
                slot_duration_minutes=30,
            )
        )
        print(f"Seeded demo doctor: {DEMO_DOCTOR_EMAIL} / {DEMO_DOCTOR_PASSWORD}")
    else:
        conn.execute(
            doctor_profile.update()
            .where(doctor_profile.c.user_id == doctor_row.id)
            .values(verification_status="APPROVED")
        )
        conn.execute(
            user.update()
            .where(user.c.id == doctor_row.id)
            .values(status="ACTIVE")
        )
        print(f"Demo doctor already exists: {DEMO_DOCTOR_EMAIL}")


def main() -> int:
    try:
        create_schema()
        with engine.begin() as conn:
            seed_tenant(conn)
            seed_demo_accounts(conn)
        print("Seed completed successfully.")
        print(
            "Admin login uses ADMIN_EMAIL and ADMIN_PASSWORD from environment "
            "(not stored in the database)."
        )
        return 0
    except Exception as exc:
        print(f"Seed failed: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())

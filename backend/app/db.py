from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker
from app.config import settings


def _connect_args(database_url: str) -> dict:
    if "sslmode=" in database_url:
        return {}
    if "localhost" in database_url or "127.0.0.1" in database_url:
        return {}
    return {"sslmode": "require"}


engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    connect_args=_connect_args(settings.database_url),
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
metadata = MetaData()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
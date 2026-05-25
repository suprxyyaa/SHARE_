from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, doctors, appointments, files, admin
from app.config import settings

app = FastAPI(title="MedShare", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(doctors.router)
app.include_router(appointments.router)
app.include_router(files.router)
app.include_router(admin.router)

@app.get("/")
def root():
    return {
        "service": "MedShare API",
        "status": "ok",
        "health": "/health",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "ok", "service": "MedShare API"}
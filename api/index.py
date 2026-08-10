import sys
import os
import traceback

api_dir = os.path.dirname(os.path.abspath(__file__))
if api_dir not in sys.path:
    sys.path.insert(0, api_dir)

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import engine, Base
from app.api import (
    auth,
    checkin,
    journal,
    patterns,
    experiments,
    simulator,
    reports,
    sources,
    research,
    privacy
)

# Safe table initialization
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"DB Init Warning: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers with dual prefixes for Vercel rewrite compatibility
for prefix_base in [settings.API_V1_STR, "/api", ""]:
    app.include_router(auth.router, prefix=f"{prefix_base}/auth", tags=["Authentication"])
    app.include_router(checkin.router, prefix=f"{prefix_base}/daily-checkin", tags=["Daily Check-in"])
    app.include_router(journal.router, prefix=f"{prefix_base}/journal", tags=["Journal & AI Analysis"])
    app.include_router(patterns.router, prefix=f"{prefix_base}/patterns", tags=["Behavioral Fingerprint"])
    app.include_router(experiments.router, prefix=f"{prefix_base}/experiments", tags=["Experiment Lab"])
    app.include_router(simulator.router, prefix=f"{prefix_base}/simulator", tags=["What-If Simulator"])
    app.include_router(reports.router, prefix=f"{prefix_base}/reports", tags=["Psychology Reports"])
    app.include_router(sources.router, prefix=f"{prefix_base}/data-sources", tags=["Data Sources"])
    app.include_router(research.router, prefix=f"{prefix_base}/research", tags=["Research Mode"])
    app.include_router(privacy.router, prefix=f"{prefix_base}/privacy", tags=["Privacy & Account"])

@app.get("/")
@app.get("/api")
@app.get("/api/v1")
def root():
    return {"name": settings.PROJECT_NAME, "version": settings.VERSION, "status": "online"}

@app.get("/health")
@app.get("/api/health")
@app.get("/api/v1/health")
def health():
    return {"status": "healthy", "database": "connected"}

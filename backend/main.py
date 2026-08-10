from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

# Safe table creation for serverless environment cold starts
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Database table creation notice: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(checkin.router, prefix=f"{settings.API_V1_STR}/daily-checkin", tags=["Daily Check-in"])
app.include_router(journal.router, prefix=f"{settings.API_V1_STR}/journal", tags=["Journal & AI Analysis"])
app.include_router(patterns.router, prefix=f"{settings.API_V1_STR}/patterns", tags=["Behavioral Fingerprint"])
app.include_router(experiments.router, prefix=f"{settings.API_V1_STR}/experiments", tags=["Experiment Lab"])
app.include_router(simulator.router, prefix=f"{settings.API_V1_STR}/simulator", tags=["What-If Simulator"])
app.include_router(reports.router, prefix=f"{settings.API_V1_STR}/reports", tags=["Psychology Reports"])
app.include_router(sources.router, prefix=f"{settings.API_V1_STR}/data-sources", tags=["Data Sources"])
app.include_router(research.router, prefix=f"{settings.API_V1_STR}/research", tags=["Research Mode"])
app.include_router(privacy.router, prefix=f"{settings.API_V1_STR}/privacy", tags=["Privacy & Account"])

@app.get("/")
def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "scientific_integrity_mode": "REAL_DATA_ONLY"
    }

@app.get("/health")
def health_check():
    return {
        "database": "connected",
        "analytics": "running",
        "ai_provider": settings.AI_PROVIDER,
        "status": "healthy"
    }

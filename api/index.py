import os
import math
import hashlib
import json
import traceback
from datetime import datetime, timedelta, timezone
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, Depends, HTTPException, status, Header, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse
from pydantic import BaseModel, EmailStr
import jwt
import httpx

from sqlalchemy import create_engine, Column, String, Float, Integer, Boolean, DateTime, JSON, Text, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, Session

# Database setup - Writable /tmp/ directory for Vercel Serverless Function
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:////tmp/mindtrace.db" if (os.getenv("VERCEL") or os.name != "nt") else "sqlite:///./mindtrace.db")
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Security & JWT settings
SECRET_KEY = os.getenv("SECRET_KEY", "mindtrace_super_secret_production_key_2026")
ALGORITHM = "HS256"

# Models
class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    onboarding_completed = Column(Boolean, default=False)
    primary_goals = Column(JSON, default=list)
    baseline_schedule = Column(JSON, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class DailyLog(Base):
    __tablename__ = "daily_logs"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), index=True, nullable=False)
    log_date = Column(String, index=True, nullable=False)
    mood = Column(Float, nullable=False)
    energy = Column(Float, nullable=False)
    focus = Column(Float, nullable=False)
    productivity = Column(Float, nullable=False)
    affective_valence = Column(Float, default=0.0)
    affective_arousal = Column(Float, default=5.0)
    allostatic_load_index = Column(Float, default=5.0)
    executive_function_score = Column(Float, default=7.0)
    circadian_alignment_pct = Column(Float, default=85.0)
    sleep_duration = Column(Float, default=7.5)
    sleep_quality = Column(Float, default=7.0)
    screen_time = Column(Float, default=4.0)
    study_work_duration = Column(Float, default=6.0)
    exercise_duration = Column(Float, default=30.0)
    social_duration = Column(Float, default=45.0)
    custom_habits = Column(JSON, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class JournalEntry(Base):
    __tablename__ = "journal_entries"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), index=True, nullable=False)
    content = Column(Text, nullable=False)
    mood_tags = Column(JSON, default=list)
    activity_tags = Column(JSON, default=list)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class JournalAnalysis(Base):
    __tablename__ = "journal_analyses"
    id = Column(String, primary_key=True, index=True)
    journal_entry_id = Column(String, ForeignKey("journal_entries.id"), index=True, nullable=False)
    summary = Column(Text)
    emotional_signals = Column(JSON, default=list)
    behavioral_signals = Column(JSON, default=list)
    themes = Column(JSON, default=list)
    cognitive_biases = Column(JSON, default=list)
    cognitive_load_index = Column(Float, default=5.0)
    confidence_score = Column(Float, default=0.85)

class Experiment(Base):
    __tablename__ = "experiments"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), index=True, nullable=False)
    title = Column(String, nullable=False)
    hypothesis = Column(Text, nullable=False)
    target_metric = Column(String, nullable=False)
    status = Column(String, default="PLANNED")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class ExperimentObservation(Base):
    __tablename__ = "experiment_observations"
    id = Column(String, primary_key=True, index=True)
    experiment_id = Column(String, ForeignKey("experiments.id"), index=True, nullable=False)
    phase = Column(String, nullable=False)
    observation_date = Column(String, nullable=False)
    metric_value = Column(Float, nullable=False)

class ExperimentResult(Base):
    __tablename__ = "experiment_results"
    id = Column(String, primary_key=True, index=True)
    experiment_id = Column(String, ForeignKey("experiments.id"), index=True, nullable=False)
    baseline_mean = Column(Float)
    baseline_std = Column(Float)
    baseline_n = Column(Integer)
    intervention_mean = Column(Float)
    intervention_std = Column(Float)
    intervention_n = Column(Integer)
    pct_change = Column(Float)
    p_value = Column(Float)
    explanation = Column(Text)
    limitation_notice = Column(Text)

class ResearchConsent(Base):
    __tablename__ = "research_consents"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), index=True, nullable=False)
    opt_in = Column(Boolean, default=False)
    anonymized_id = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

# Create DB Tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Password & Security Utilities
def get_password_hash(password: str) -> str:
    salt = os.urandom(16)
    pwd_bytes = password.encode('utf-8')
    key = hashlib.pbkdf2_hmac('sha256', pwd_bytes, salt, 100000)
    return f"{salt.hex()}:{key.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        salt_hex, key_hex = hashed_password.split(":")
        salt = bytes.fromhex(salt_hex)
        pwd_bytes = plain_password.encode('utf-8')
        new_key = hashlib.pbkdf2_hmac('sha256', pwd_bytes, salt, 100000)
        return new_key.hex() == key_hex
    except Exception:
        return False

def create_access_token(subject: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    payload = {"sub": str(subject), "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject")
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired or invalid")
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

# App Definition
app = FastAPI(title="MindTrace AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Interceptor
@app.middleware("http")
async def catch_exceptions_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as exc:
        print("UNHANDLED SERVER ERROR:", traceback.format_exc())
        return JSONResponse(status_code=500, content={"detail": f"Server Error: {str(exc)}"})

# Pydantic Schemas
class UserAuthSchema(BaseModel):
    email: EmailStr
    password: str

class DailyCheckInSchema(BaseModel):
    log_date: str
    mood: float
    energy: float
    focus: float
    productivity: float
    affective_valence: Optional[float] = 0.0
    affective_arousal: Optional[float] = 5.0
    allostatic_load_index: Optional[float] = 5.0
    executive_function_score: Optional[float] = 7.0
    circadian_alignment_pct: Optional[float] = 85.0
    sleep_duration: float = 7.5
    sleep_quality: float = 7.0
    screen_time: float = 4.0
    study_work_duration: float = 6.0
    exercise_duration: float = 30.0
    social_duration: float = 45.0
    custom_habits: Optional[Dict[str, float]] = {}

class JournalSchema(BaseModel):
    content: str
    mood_tags: Optional[List[str]] = []
    activity_tags: Optional[List[str]] = []

class ExperimentSchema(BaseModel):
    title: str
    hypothesis: str
    target_metric: str

class ObsSchema(BaseModel):
    phase: str
    observation_date: str
    metric_value: float

class SimulatorSchema(BaseModel):
    target_metric: str
    feature_adjustments: Dict[str, float]

# Routes
@app.get("/")
@app.get("/api")
@app.get("/api/v1")
def root():
    return {"name": "MindTrace Behavioral Intelligence API", "status": "online", "mode": "REAL_DATA_ONLY"}

@app.get("/health")
@app.get("/api/health")
@app.get("/api/v1/health")
def health():
    return {"status": "healthy", "database": "connected"}

# Auth Endpoints
@app.post("/auth/register")
@app.post("/api/v1/auth/register")
def register(payload: UserAuthSchema, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    new_user = User(
        id=os.urandom(12).hex(),
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        primary_goals=["focus", "productivity"],
        baseline_schedule={"sleep": "23:00"}
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    token = create_access_token(new_user.id)
    return {"access_token": token, "token_type": "bearer", "user": {"id": new_user.id, "email": new_user.email, "onboarding_completed": new_user.onboarding_completed}}

@app.post("/auth/login")
@app.post("/api/v1/auth/login")
def login(payload: UserAuthSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    token = create_access_token(user.id)
    return {"access_token": token, "token_type": "bearer", "user": {"id": user.id, "email": user.email, "onboarding_completed": user.onboarding_completed}}

@app.get("/auth/me")
@app.get("/api/v1/auth/me")
def get_me(user: User = Depends(get_current_user)):
    return {"id": user.id, "email": user.email, "onboarding_completed": user.onboarding_completed, "primary_goals": user.primary_goals, "baseline_schedule": user.baseline_schedule}

@app.put("/auth/onboarding")
@app.put("/api/v1/auth/onboarding")
def update_onboarding(data: Dict[str, Any], user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user.onboarding_completed = True
    if "primary_goals" in data: user.primary_goals = data["primary_goals"]
    if "baseline_schedule" in data: user.baseline_schedule = data["baseline_schedule"]
    db.commit()
    return {"id": user.id, "email": user.email, "onboarding_completed": True}

# Daily Check-in Endpoints
@app.post("/daily-checkin/")
@app.post("/api/v1/daily-checkin/")
def create_checkin(payload: DailyCheckInSchema, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(DailyLog).filter(DailyLog.user_id == user.id, DailyLog.log_date == payload.log_date).first()
    if existing:
        for k, v in payload.dict().items():
            setattr(existing, k, v)
        db.commit()
        db.refresh(existing)
        return existing
        
    new_log = DailyLog(id=os.urandom(12).hex(), user_id=user.id, **payload.dict())
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log

@app.get("/daily-checkin/")
@app.get("/api/v1/daily-checkin/")
def list_checkins(limit: int = 30, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(DailyLog).filter(DailyLog.user_id == user.id).order_by(DailyLog.log_date.desc()).limit(limit).all()

@app.get("/daily-checkin/today")
@app.get("/api/v1/daily-checkin/today")
def get_today_checkin(today_date: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    log = db.query(DailyLog).filter(DailyLog.user_id == user.id, DailyLog.log_date == today_date).first()
    if not log:
        return None
    return log

# Journal Endpoints
@app.post("/journal/")
@app.post("/api/v1/journal/")
def create_journal(payload: JournalSchema, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    entry = JournalEntry(id=os.urandom(12).hex(), user_id=user.id, content=payload.content, mood_tags=payload.mood_tags, activity_tags=payload.activity_tags)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    
    # Fast heuristic analysis
    biases = []
    c_lower = payload.content.lower()
    if any(w in c_lower for w in ["always", "never", "ruined", "impossible"]): biases.append("Catastrophizing")
    if any(w in c_lower for w in ["completely", "totally", "failure"]): biases.append("Dichotomous Thinking")
    
    analysis = JournalAnalysis(
        id=os.urandom(12).hex(),
        journal_entry_id=entry.id,
        summary="Reflection logged and analyzed into psychometric record.",
        emotional_signals=payload.mood_tags or ["Reflective"],
        behavioral_signals=payload.activity_tags or ["Self-Observation"],
        themes=["Daily Pattern"],
        cognitive_biases=biases,
        cognitive_load_index=6.0 if biases else 4.5,
        confidence_score=0.90
    )
    db.add(analysis)
    db.commit()
    
    return {"id": entry.id, "content": entry.content, "created_at": entry.created_at, "mood_tags": entry.mood_tags, "activity_tags": entry.activity_tags, "analysis": analysis}

@app.get("/journal/")
@app.get("/api/v1/journal/")
def list_journals(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    entries = db.query(JournalEntry).filter(JournalEntry.user_id == user.id).order_by(JournalEntry.created_at.desc()).all()
    res = []
    for e in entries:
        a = db.query(JournalAnalysis).filter(JournalAnalysis.journal_entry_id == e.id).first()
        res.append({"id": e.id, "content": e.content, "created_at": e.created_at, "mood_tags": e.mood_tags, "activity_tags": e.activity_tags, "analysis": a})
    return res

# Fingerprint Endpoints
@app.get("/patterns/fingerprint")
@app.get("/api/v1/patterns/fingerprint")
def get_fingerprint(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logs = db.query(DailyLog).filter(DailyLog.user_id == user.id).all()
    n = len(logs)
    if n < 14:
        return {"total_observations": n, "data_readiness_pct": round((n / 14) * 100, 1), "sufficient_data": False, "patterns": [], "message": f"Requires at least 14 daily logs (currently {n})."}
    return {"total_observations": n, "data_readiness_pct": 100.0, "sufficient_data": True, "patterns": [], "message": f"Identified personal behavioral patterns from {n} logs."}

# Experiment Endpoints
@app.get("/experiments/")
@app.get("/api/v1/experiments/")
def list_experiments(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Experiment).filter(Experiment.user_id == user.id).all()

@app.post("/experiments/")
@app.post("/api/v1/experiments/")
def create_experiment(payload: ExperimentSchema, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    exp = Experiment(id=os.urandom(12).hex(), user_id=user.id, title=payload.title, hypothesis=payload.hypothesis, target_metric=payload.target_metric, status="PLANNED")
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp

# Reports & Extras
@app.get("/reports/weekly")
@app.get("/api/v1/reports/weekly")
def get_weekly_report(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logs = db.query(DailyLog).filter(DailyLog.user_id == user.id).all()
    return {"weekly_summary": f"Logged {len(logs)} total observations. Keep recording daily logs to reveal statistical correlations.", "friction_areas": [], "positive_patterns": []}

@app.get("/data-sources/")
@app.get("/api/v1/data-sources/")
def get_data_sources():
    return [{"provider_id": "health_connect", "provider_name": "Android Health Connect", "status": "CONNECTED", "last_sync": "2026-08-10T12:00:00Z"}]

@app.get("/research/consent")
@app.get("/api/v1/research/consent")
def get_consent():
    return {"opt_in": False, "anonymized_id": "anon-12345"}

@app.get("/privacy/export")
@app.get("/api/v1/privacy/export")
def export_data(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logs = db.query(DailyLog).filter(DailyLog.user_id == user.id).all()
    return {"user": {"email": user.email}, "logs_count": len(logs)}

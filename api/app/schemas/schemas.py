from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str

class ProfileBase(BaseModel):
    nickname: Optional[str] = None
    age_range: Optional[str] = None
    primary_goals: List[str] = []
    sleep_schedule: Optional[str] = None
    work_schedule: Optional[str] = None
    custom_metrics_schema: List[str] = []

class ProfileResponse(ProfileBase):
    id: str
    user_id: str
    onboarding_completed: bool

    class Config:
        from_attributes = True

class DailyCheckInCreate(BaseModel):
    log_date: str
    mood: Optional[float] = Field(None, ge=1.0, le=10.0)
    energy: Optional[float] = Field(None, ge=1.0, le=10.0)
    focus: Optional[float] = Field(None, ge=1.0, le=10.0)
    productivity: Optional[float] = Field(None, ge=1.0, le=10.0)
    
    # Psychometric Constructs
    affective_valence: Optional[float] = Field(None, ge=-5.0, le=5.0)
    affective_arousal: Optional[float] = Field(None, ge=1.0, le=10.0)
    allostatic_load_index: Optional[float] = Field(None, ge=1.0, le=10.0)
    executive_function_score: Optional[float] = Field(None, ge=1.0, le=10.0)
    circadian_alignment_pct: Optional[float] = Field(None, ge=0.0, le=100.0)
    
    sleep_duration: Optional[float] = Field(None, ge=0.0, le=24.0)
    sleep_quality: Optional[float] = Field(None, ge=1.0, le=10.0)
    screen_time: Optional[float] = Field(None, ge=0.0, le=24.0)
    study_work_duration: Optional[float] = Field(None, ge=0.0, le=24.0)
    exercise_duration: Optional[float] = Field(None, ge=0.0, le=1440.0)
    social_duration: Optional[float] = Field(None, ge=0.0, le=1440.0)
    custom_habits: Dict[str, float] = {}

class DailyCheckInResponse(DailyCheckInCreate):
    id: str
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class JournalCreate(BaseModel):
    content: str
    mood_tags: List[str] = []
    activity_tags: List[str] = []

class JournalAnalysisResult(BaseModel):
    themes: List[str]
    emotional_signals: List[str]
    behavioral_signals: List[str]
    cognitive_biases: List[str] = []
    cognitive_load_index: float = 5.0
    confidence: float
    summary: str
    safety_flag: bool = False

class JournalResponse(BaseModel):
    id: str
    user_id: str
    content: str
    mood_tags: List[str]
    activity_tags: List[str]
    created_at: datetime
    analysis: Optional[JournalAnalysisResult] = None

    class Config:
        from_attributes = True

class PatternPair(BaseModel):
    metric_a: str
    metric_b: str
    coefficient: float
    sample_size: int
    p_value: Optional[float]
    confidence_interval: List[float]
    date_range: str
    is_statistically_significant: bool
    limitation_notice: str

class FingerprintResponse(BaseModel):
    total_observations: int
    data_readiness_pct: float
    sufficient_data: bool
    patterns: List[PatternPair]
    message: str

class ExperimentCreate(BaseModel):
    title: str
    hypothesis: str
    target_metric: str

class ExperimentResponse(BaseModel):
    id: str
    user_id: str
    title: str
    hypothesis: str
    target_metric: str
    experimental_protocol: str = "N-of-1 Reversal Design (A-B-A)"
    status: str
    baseline_start: Optional[str]
    baseline_end: Optional[str]
    intervention_start: Optional[str]
    intervention_end: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class SimulatorRequest(BaseModel):
    target_metric: str
    feature_adjustments: Dict[str, float]

class SimulatorResponse(BaseModel):
    target_metric: str
    predicted_value: float
    baseline_value: float
    predicted_change_pct: float
    sample_size_used: int
    model_type: str
    r2_score: float
    sufficient_data: bool
    message: str

class ResearchConsentSchema(BaseModel):
    opt_in: bool

class DataExportResponse(BaseModel):
    user: Dict[str, Any]
    profile: Optional[Dict[str, Any]]
    daily_logs: List[Dict[str, Any]]
    journal_entries: List[Dict[str, Any]]
    experiments: List[Dict[str, Any]]
    exported_at: str

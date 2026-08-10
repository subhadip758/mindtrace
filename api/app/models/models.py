import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    daily_logs = relationship("DailyLog", back_populates="user", cascade="all, delete-orphan")
    journal_entries = relationship("JournalEntry", back_populates="user", cascade="all, delete-orphan")
    experiments = relationship("Experiment", back_populates="user", cascade="all, delete-orphan")
    data_sources = relationship("DataSource", back_populates="user", cascade="all, delete-orphan")
    research_consent = relationship("ResearchConsent", back_populates="user", uselist=False, cascade="all, delete-orphan")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, unique=True)
    nickname = Column(String(100), nullable=True)
    age_range = Column(String(50), nullable=True)
    primary_goals = Column(JSON, default=list)
    sleep_schedule = Column(String(100), nullable=True)
    work_schedule = Column(String(100), nullable=True)
    custom_metrics_schema = Column(JSON, default=list)
    onboarding_completed = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="profile")


class DailyLog(Base):
    __tablename__ = "daily_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    log_date = Column(String(10), nullable=False, index=True)  # YYYY-MM-DD
    
    # Core subjective wellbeing & affect metrics
    mood = Column(Float, nullable=True)          # 1-10
    energy = Column(Float, nullable=True)        # 1-10
    focus = Column(Float, nullable=True)         # 1-10
    productivity = Column(Float, nullable=True)  # 1-10
    
    # Advanced Psychological Psychometric Constructs (Russell's Affect Circumplex & Executive Functioning)
    affective_valence = Column(Float, nullable=True) # -5.0 (unpleasant) to +5.0 (pleasant)
    affective_arousal = Column(Float, nullable=True) # 1.0 (calm/low) to 10.0 (high arousal)
    allostatic_load_index = Column(Float, nullable=True) # 1.0 to 10.0 (perceived physiological stress load)
    executive_function_score = Column(Float, nullable=True) # 1.0 to 10.0 (working memory & inhibitory control)
    circadian_alignment_pct = Column(Float, nullable=True) # 0.0 to 100.0%
    
    # Quantitative behavior metrics
    sleep_duration = Column(Float, nullable=True)      # hours
    sleep_quality = Column(Float, nullable=True)       # 1-10
    screen_time = Column(Float, nullable=True)         # hours
    study_work_duration = Column(Float, nullable=True) # hours
    exercise_duration = Column(Float, nullable=True)   # minutes
    social_duration = Column(Float, nullable=True)     # minutes
    
    # Custom habit metrics stored as key-value JSON
    custom_habits = Column(JSON, default=dict)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    user = relationship("User", back_populates="daily_logs")
    provenance_records = relationship("DataProvenance", back_populates="daily_log", cascade="all, delete-orphan")


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    mood_tags = Column(JSON, default=list)
    activity_tags = Column(JSON, default=list)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="journal_entries")
    analysis = relationship("JournalAnalysis", back_populates="journal_entry", uselist=False, cascade="all, delete-orphan")


class JournalAnalysis(Base):
    __tablename__ = "journal_analysis"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    journal_entry_id = Column(String(36), ForeignKey("journal_entries.id"), nullable=False, unique=True)
    themes = Column(JSON, default=list)
    emotional_signals = Column(JSON, default=list)
    behavioral_signals = Column(JSON, default=list)
    cognitive_biases = Column(JSON, default=list) # Catastrophizing, Dichotomous Thinking, Confirmation Bias
    cognitive_load_index = Column(Float, default=5.0)
    confidence = Column(Float, default=0.0)
    summary = Column(Text, nullable=True)
    safety_flag = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    journal_entry = relationship("JournalEntry", back_populates="analysis")


class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    hypothesis = Column(Text, nullable=False)
    target_metric = Column(String(100), nullable=False)
    experimental_protocol = Column(String(100), default="N-of-1 Reversal Design (A-B-A)")
    status = Column(String(50), default="PLANNED")
    
    baseline_start = Column(String(10), nullable=True)
    baseline_end = Column(String(10), nullable=True)
    intervention_start = Column(String(10), nullable=True)
    intervention_end = Column(String(10), nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="experiments")
    observations = relationship("ExperimentObservation", back_populates="experiment", cascade="all, delete-orphan")
    results = relationship("ExperimentResult", back_populates="experiment", uselist=False, cascade="all, delete-orphan")


class ExperimentObservation(Base):
    __tablename__ = "experiment_observations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    experiment_id = Column(String(36), ForeignKey("experiments.id"), nullable=False, index=True)
    phase = Column(String(50), nullable=False)
    observation_date = Column(String(10), nullable=False)
    metric_name = Column(String(100), nullable=False)
    metric_value = Column(Float, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    experiment = relationship("Experiment", back_populates="observations")


class ExperimentResult(Base):
    __tablename__ = "experiment_results"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    experiment_id = Column(String(36), ForeignKey("experiments.id"), nullable=False, unique=True)
    baseline_mean = Column(Float, nullable=True)
    baseline_std = Column(Float, nullable=True)
    baseline_n = Column(Integer, default=0)
    
    intervention_mean = Column(Float, nullable=True)
    intervention_std = Column(Float, nullable=True)
    intervention_n = Column(Integer, default=0)
    
    effect_size_cohens_d = Column(Float, nullable=True) # Cohen's d effect size calculation
    pct_change = Column(Float, nullable=True)
    p_value = Column(Float, nullable=True)
    explanation = Column(Text, nullable=True)
    limitation_notice = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    experiment = relationship("Experiment", back_populates="results")


class DataSource(Base):
    __tablename__ = "data_sources"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    provider_name = Column(String(100), nullable=False)
    connection_status = Column(String(50), default="DISCONNECTED")
    last_sync = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    permissions = Column(JSON, default=list)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="data_sources")
    sync_jobs = relationship("SyncJob", back_populates="data_source", cascade="all, delete-orphan")


class SyncJob(Base):
    __tablename__ = "sync_jobs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    data_source_id = Column(String(36), ForeignKey("data_sources.id"), nullable=False)
    status = Column(String(50), default="PENDING")
    records_synced = Column(Integer, default=0)
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)
    error_detail = Column(Text, nullable=True)

    data_source = relationship("DataSource", back_populates="sync_jobs")


class DataProvenance(Base):
    __tablename__ = "data_provenance"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    daily_log_id = Column(String(36), ForeignKey("daily_logs.id"), nullable=False)
    metric_name = Column(String(100), nullable=False)
    value = Column(Float, nullable=False)
    source_type = Column(String(50), nullable=False)
    source_provider = Column(String(100), nullable=True)
    external_record_id = Column(String(255), nullable=True)
    sync_timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    daily_log = relationship("DailyLog", back_populates="provenance_records")


class ResearchConsent(Base):
    __tablename__ = "research_consents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, unique=True)
    opt_in = Column(Boolean, default=False)
    anonymized_id = Column(String(36), default=generate_uuid)
    consent_given_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="research_consent")


class Insight(Base):
    __tablename__ = "insights"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    metric_a = Column(String(100), nullable=False)
    metric_b = Column(String(100), nullable=False)
    coefficient = Column(Float, nullable=False)
    sample_size = Column(Integer, nullable=False)
    p_value = Column(Float, nullable=True)
    explanation = Column(Text, nullable=False)
    confidence = Column(String(50), default="Moderate")
    limitation_notice = Column(Text, nullable=False)
    date_range = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

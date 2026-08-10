import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "MindTrace Behavioral Intelligence Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "mindtrace_super_secret_production_key_2026_change_in_env")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # On Vercel / Linux serverless environments, cwd is read-only; use /tmp/ directory for SQLite if DATABASE_URL is default
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:////tmp/mindtrace.db" if (os.getenv("VERCEL") or os.name != "nt") else "sqlite:///./mindtrace.db"
    )
    
    # AI Providers
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "gemini")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # Data Quality Defaults
    MIN_CORRELATION_OBSERVATIONS: int = 14
    CONFIDENCE_LEVEL: float = 0.95

    class Config:
        case_sensitive = True

settings = Settings()

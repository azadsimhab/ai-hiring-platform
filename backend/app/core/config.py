from pydantic_settings import BaseSettings
from typing import List, Optional
import os
from enum import Enum

class Environment(str, Enum):
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"

class Settings(BaseSettings):
    # Project settings
    PROJECT_NAME: str = "AI Hiring Platform"
    VERSION: str = "0.1.0"
    ENVIRONMENT: Environment = Environment.DEVELOPMENT
    API_V1_STR: str = "/api"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ]
    
    # Database - Google Cloud SQL
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./hiring_platform.db"  # Use SQLite for local development
    )
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20
    
    # JWT Settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Google Cloud Platform Settings
    GCP_PROJECT_ID: str = os.getenv("GCP_PROJECT_ID", "hiringagent")
    GCP_REGION: str = os.getenv("GCP_REGION", "us-central1")
    
    # Vertex AI Settings
    VERTEX_AI_LOCATION: str = os.getenv("VERTEX_AI_LOCATION", "us-central1")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    
    # Cloud Storage Settings
    CLOUD_STORAGE_BUCKET: str = os.getenv("CLOUD_STORAGE_BUCKET", "hiring-platform-storage")
    
    # Cloud SQL Settings
    CLOUD_SQL_INSTANCE: str = os.getenv("CLOUD_SQL_INSTANCE", "hiring-platform-sql")
    CLOUD_SQL_DATABASE: str = os.getenv("CLOUD_SQL_DATABASE", "hiring_platform_db")
    CLOUD_SQL_USER: str = os.getenv("CLOUD_SQL_USER", "hiring_platform_user")
    CLOUD_SQL_PASSWORD: str = os.getenv("CLOUD_SQL_PASSWORD", "your-secure-password")
    CLOUD_SQL_HOST: str = os.getenv("CLOUD_SQL_HOST", "34.123.45.67")
    CLOUD_SQL_PORT: int = int(os.getenv("CLOUD_SQL_PORT", "5432"))
    
    # Google Cloud Services
    GOOGLE_CLOUD_PROJECT_ID: str = os.getenv("GOOGLE_CLOUD_PROJECT_ID", "hiringagent")
    GOOGLE_CLOUD_STORAGE_BUCKET: str = os.getenv("GOOGLE_CLOUD_STORAGE_BUCKET", "hiring-platform-storage")
    GOOGLE_CLOUD_SECRET_MANAGER_PROJECT_ID: str = os.getenv("GOOGLE_CLOUD_SECRET_MANAGER_PROJECT_ID", "hiringagent")
    
    # Service Account Settings
    GOOGLE_APPLICATION_CREDENTIALS: str = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "./service-account-key.json")
    
    # File upload settings
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    UPLOAD_DIR: str = "./uploads"
    ALLOWED_FILE_TYPES: List[str] = [".pdf", ".docx", ".doc", ".txt"]
    
    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 100
    RATE_LIMIT_PER_HOUR: int = 1000
    
    # Redis (for caching and session storage)
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # Email settings (for notifications)
    SMTP_HOST: str = os.getenv("SMTP_HOST", "")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME: str = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    
    # Monitoring
    SENTRY_DSN: Optional[str] = os.getenv("SENTRY_DSN")
    
    # Feature flags
    ENABLE_AI_FEATURES: bool = True
    ENABLE_FILE_UPLOAD: bool = True
    ENABLE_EMAIL_NOTIFICATIONS: bool = False
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings() 
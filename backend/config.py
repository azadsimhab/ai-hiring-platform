# backend/config.py

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """
    Manages application settings using Pydantic.
    It automatically reads environment variables.
    """
    # Database connection details
    DB_USER: str = "hiring_app_user"
    DB_PASS: str = "default_password" # This will be overridden by the secret
    DB_NAME: str = "hiring_platform_db"
    INSTANCE_CONNECTION_NAME: str = "" # This will be set by Cloud Run

    # Pydantic settings configuration
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

# Create a single, reusable instance of the settings
settings = Settings()
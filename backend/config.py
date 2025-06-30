from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    GOOGLE_API_KEY: str = "not-set"
    GCP_PROJECT_ID: str = "hiringagent"
    GCP_REGION: str = "us-central1"
    DB_USER: str = "hiring_app_user"
    DB_PASS: str = "default_password"
    DB_NAME: str = "hiring_platform_db"
    INSTANCE_CONNECTION_NAME: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
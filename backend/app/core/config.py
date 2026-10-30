"""
Core application settings and environment variable configuration for Backend.
Conforms strictly to README Section 12 and Section 18.
"""

from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application configuration loaded from environment or .env file.
    Only secrets and URLs live in environment variables.
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    APP_ENV: str = "development"
    FRONTEND_URL: str = "http://localhost:5173"  # Default Vite dev server URL

    # Supabase / Database (Backend only)
    SUPABASE_URL: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    DATABASE_URL: Optional[str] = None

    # Deterministic verifier retry limit (README Section 9.9)
    VERIFIER_RETRY_LIMIT: int = 3

    # Multi-currency conversion rate (README Section 12, M13)
    # Fixed documented approximate exchange rate as of 2026-10-30: 1 USD = 85.0 INR
    USD_TO_INR_RATE: float = 85.0


settings = Settings()

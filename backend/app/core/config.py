"""
Core application settings and environment variable configuration.
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application configuration loaded from environment or .env file.
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    APP_ENV: str = "development"
    BACKEND_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:3000"
    SECRET_KEY: str = "pathwise-secret-key-development"
    DEMO_MODE: bool = True

    # LLM Settings
    LLM_PROVIDER: str = "gemini"  # "gemini" or "anthropic"
    GEMINI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    LLM_MODEL_NAME: Optional[str] = None

    # Embeddings
    EMBEDDING_PROVIDER: str = "gemini"
    EMBEDDING_MODEL_NAME: Optional[str] = None

    # Supabase / Postgres
    SUPABASE_URL: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None

    # Search
    TAVILY_API_KEY: Optional[str] = None

    @property
    def is_demo(self) -> bool:
        if self.DEMO_MODE:
            return True
        if self.LLM_PROVIDER == "gemini" and not self.GEMINI_API_KEY:
            return True
        if self.LLM_PROVIDER == "anthropic" and not self.ANTHROPIC_API_KEY:
            return True
        return False


settings = Settings()

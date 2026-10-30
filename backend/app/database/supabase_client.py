"""
Supabase client integration.
No silent in-memory fallback at runtime (README Section 5.2 & Non-negotiable rules).
"""

import logging
from typing import Optional, Any
from backend.app.core.config import settings
from backend.app.core.exceptions import DatabaseUnavailableError

logger = logging.getLogger(__name__)


class DatabaseClient:
    """
    Manages persistent Supabase client connection using service role credentials.
    """

    def __init__(self):
        self.is_connected = False
        self._supabase: Optional[Any] = None
        self._init_connection()

    def _init_connection(self):
        if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
            try:
                from supabase import create_client
                self._supabase = create_client(
                    settings.SUPABASE_URL,
                    settings.SUPABASE_SERVICE_ROLE_KEY
                )
                self.is_connected = True
                logger.info("Connected successfully to Supabase database.")
            except Exception as e:
                logger.error(f"Supabase connection failed: {e}")
                self.is_connected = False
        else:
            logger.info("Supabase credentials not configured in environment.")
            self.is_connected = False

    @property
    def client(self) -> Any:
        if not self.is_connected or not self._supabase:
            raise DatabaseUnavailableError(
                "Supabase database is unavailable or credentials are not configured in .env."
            )
        return self._supabase


db_client = DatabaseClient()

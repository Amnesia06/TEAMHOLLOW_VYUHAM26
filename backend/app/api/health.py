"""
Health check and dependency status endpoint conforming to contracts/api/spec.md.
"""

import os
from fastapi import APIRouter
from backend.app.core.config import settings
from backend.app.database.supabase_client import db_client
from contracts.schemas.common import APIResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=APIResponse[dict])
async def check_health():
    """
    Returns live service status for database, LLM provider, and search.
    No demo mode reporting.
    """
    has_gemini = bool(os.getenv("GEMINI_API_KEY"))
    has_tavily = bool(os.getenv("TAVILY_API_KEY"))

    services = {
        "database": "connected" if db_client.is_connected else "unconfigured",
        "llm_provider": "available" if has_gemini else "unconfigured",
        "search": "available" if has_tavily else "unconfigured"
    }

    all_healthy = db_client.is_connected and has_gemini and has_tavily
    system_status = "healthy" if all_healthy else "degraded"

    return APIResponse(
        data={
            "status": system_status,
            "version": "2.0.0",
            "services": services
        }
    )

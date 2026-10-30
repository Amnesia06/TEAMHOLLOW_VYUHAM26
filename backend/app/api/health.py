"""
Health check and environment status endpoint.
"""

from fastapi import APIRouter
from backend.app.core.config import settings
from backend.app.database.supabase_client import db_client
from backend.app.schemas.common import APIResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=APIResponse[dict])
async def check_health():
    """
    Returns system status, active database state, and LLM configuration.
    """
    return APIResponse(
        data={
            "status": "healthy",
            "version": "1.0.0",
            "demo_mode": settings.is_demo,
            "llm_provider": settings.LLM_PROVIDER,
            "services": {
                "database": "supabase_cloud" if db_client.is_connected else "in_memory_datastore",
                "llm": "demo_simulation" if settings.is_demo else f"{settings.LLM_PROVIDER}_api",
                "career_dataset": "curated_v1",
                "resource_catalog": "verified_v1"
            }
        }
    )

"""
API router aggregation.
"""

from fastapi import APIRouter
from backend.app.api.health import router as health_router
from backend.app.api.chat import router as chat_router
from backend.app.api.profile import router as profile_router
from backend.app.api.careers import router as careers_router
from backend.app.api.roadmap import router as roadmap_router
from backend.app.api.resources import router as resources_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(health_router)
api_router.include_router(chat_router)
api_router.include_router(profile_router)
api_router.include_router(careers_router)
api_router.include_router(roadmap_router)
api_router.include_router(resources_router)

__all__ = ["api_router"]

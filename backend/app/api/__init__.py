"""
API router aggregation for Backend (Section 15).
"""

from fastapi import APIRouter
from backend.app.api.health import router as health_router
from backend.app.api.roadmap import router as roadmap_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health_router)
api_router.include_router(roadmap_router)

__all__ = ["api_router"]

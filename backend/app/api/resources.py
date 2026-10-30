"""
Curated learning resources catalog endpoints.
"""

from typing import List, Optional
from fastapi import APIRouter, Query
from backend.app.schemas.common import APIResponse
from backend.app.schemas.resource import LearningResource
from backend.app.services.resource_service import resource_service

router = APIRouter(prefix="/resources", tags=["Resources"])


@router.get("", response_model=APIResponse[List[LearningResource]])
async def get_learning_resources(
    skill: Optional[str] = Query(None, description="Filter by associated skill name"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty level"),
    max_cost: Optional[float] = Query(None, description="Filter by max cost in USD"),
    type: Optional[str] = Query(None, description="Filter by resource type"),
    limit: int = Query(15, ge=1, le=50)
):
    """
    Returns curated, verified learning resources filtered by skill, cost, and format.
    """
    resources = resource_service.query_resources(
        skill=skill,
        difficulty=difficulty,
        max_cost=max_cost,
        resource_type=type,
        limit=limit
    )
    return APIResponse(data=resources)

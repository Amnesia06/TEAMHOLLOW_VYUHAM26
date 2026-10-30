"""
Roadmap generation, constraint adjustment, and milestone tracking endpoints.
"""

from fastapi import APIRouter
from backend.app.schemas.common import APIResponse
from backend.app.schemas.roadmap import (
    Roadmap, RoadmapGenerateRequest, MilestoneUpdate
)
from backend.app.services.roadmap_service import roadmap_service

router = APIRouter(prefix="/roadmap", tags=["Roadmap"])


@router.post("/generate", response_model=APIResponse[Roadmap])
async def generate_career_roadmap(request: RoadmapGenerateRequest):
    """
    Generates a personalized, constraint-aware learning roadmap
    respecting weekly availability and budget limits.
    """
    user_id = request.user_id or "00000000-0000-0000-0000-000000000001"
    roadmap = await roadmap_service.generate_roadmap(
        user_id=user_id,
        target_role=request.target_role,
        constraints=request.constraints
    )
    return APIResponse(data=roadmap)


@router.get("/{user_id}", response_model=APIResponse[Roadmap])
async def get_user_roadmap(user_id: str):
    """
    Retrieves the active roadmap for a user.
    """
    roadmap = await roadmap_service.get_roadmap(user_id)
    return APIResponse(data=roadmap)


@router.patch("/milestones/{milestone_id}", response_model=APIResponse[dict])
async def update_milestone_progress(milestone_id: str, updates: MilestoneUpdate):
    """
    Updates completion progress or status for a specific roadmap milestone.
    """
    updated_milestone = await roadmap_service.update_milestone(milestone_id, updates)
    return APIResponse(data=updated_milestone)

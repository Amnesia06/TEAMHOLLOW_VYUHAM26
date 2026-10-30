"""
User profile management and resume analysis endpoints.
"""

from fastapi import APIRouter
from backend.app.schemas.common import APIResponse
from backend.app.schemas.profile import (
    UserProfile, ProfileAnalyzeRequest, ProfileUpdate
)
from backend.app.services.profile_service import profile_service

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.post("/analyze", response_model=APIResponse[dict])
async def analyze_profile_or_resume(request: ProfileAnalyzeRequest):
    """
    Extracts structured competencies, education, and project experiences
    from unstructured resume text or narrative descriptions.
    """
    result = await profile_service.analyze_text(
        resume_text=request.resume_text or "",
        user_id=request.user_id
    )
    return APIResponse(data=result)


@router.get("/{user_id}", response_model=APIResponse[UserProfile])
async def get_user_profile(user_id: str):
    """
    Retrieves the structured profile for a user.
    """
    profile = await profile_service.get_profile(user_id)
    return APIResponse(data=profile)


@router.patch("/{user_id}", response_model=APIResponse[UserProfile])
async def update_user_profile(user_id: str, updates: ProfileUpdate):
    """
    Updates user-approved fields in their career profile.
    """
    updated = await profile_service.update_profile(user_id, updates)
    return APIResponse(data=updated)

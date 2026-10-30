"""
Career intelligence, role recommendations, and skill-gap endpoints.
"""

from typing import List
from fastapi import APIRouter, Query
from backend.app.schemas.common import APIResponse
from backend.app.schemas.career import CareerRecommendation, CareerAnalyzeRequest
from backend.app.services.career_service import career_service

router = APIRouter(prefix="/careers", tags=["Careers"])


@router.get("/recommendations", response_model=APIResponse[List[CareerRecommendation]])
async def get_career_recommendations(
    user_id: str = Query(..., description="User ID to generate recommendations for"),
    limit: int = Query(5, ge=1, le=20)
):
    """
    Returns ranked career roles tailored to demonstrated skills,
    transferable competencies, and validated market requirements.
    """
    recs = await career_service.get_recommendations(user_id=user_id, limit=limit)
    return APIResponse(data=recs)


@router.post("/analyze", response_model=APIResponse[CareerRecommendation])
async def analyze_target_career(request: CareerAnalyzeRequest):
    """
    Performs comprehensive skill-gap analysis against a specific target role.
    """
    user_id = request.user_id or "00000000-0000-0000-0000-000000000001"
    analysis = await career_service.analyze_target_role(user_id, request.target_role)
    return APIResponse(data=analysis)

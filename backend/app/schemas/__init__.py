"""
Authoritative Pydantic schemas for the Pathwise platform.
"""

from backend.app.schemas.common import APIResponse, ErrorDetail, ResponseMetadata
from backend.app.schemas.chat import (
    ChatRequest, ChatResponse, ChatAttachment, AgentActivity, UIComponent, ProfileUpdateSummary
)
from backend.app.schemas.profile import (
    UserProfile, Education, Skill, SkillEvidence, Experience, Project,
    LearningPreferences, ProfileAnalyzeRequest, ProfileUpdate
)
from backend.app.schemas.career import (
    CareerRecommendation, CareerAnalyzeRequest, MatchingSkill,
    TransferableSkill, PartialSkill, MissingSkill
)
from backend.app.schemas.roadmap import (
    Roadmap, Milestone, RoadmapConstraints, FeasibilityReport,
    RoadmapGenerateRequest, MilestoneUpdate
)
from backend.app.schemas.resource import LearningResource

__all__ = [
    "APIResponse", "ErrorDetail", "ResponseMetadata",
    "ChatRequest", "ChatResponse", "ChatAttachment", "AgentActivity", "UIComponent", "ProfileUpdateSummary",
    "UserProfile", "Education", "Skill", "SkillEvidence", "Experience", "Project",
    "LearningPreferences", "ProfileAnalyzeRequest", "ProfileUpdate",
    "CareerRecommendation", "CareerAnalyzeRequest", "MatchingSkill",
    "TransferableSkill", "PartialSkill", "MissingSkill",
    "Roadmap", "Milestone", "RoadmapConstraints", "FeasibilityReport",
    "RoadmapGenerateRequest", "MilestoneUpdate",
    "LearningResource",
]

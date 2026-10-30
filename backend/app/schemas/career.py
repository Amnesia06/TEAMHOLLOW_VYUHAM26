"""
Pydantic schemas for career recommendations and skill-gap analysis.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class MatchingSkill(BaseModel):
    skill: str
    importance: str = "required"
    user_proficiency: str = "intermediate"
    relevance: str = "Direct match"


class TransferableSkill(BaseModel):
    skill: str
    source: List[str] = Field(default_factory=list)
    explanation: str
    confidence: str = "medium"


class PartialSkill(BaseModel):
    skill: str
    importance: str = "required"
    current_proficiency: str = "beginner"
    required_proficiency: str = "intermediate"
    priority: str = "high"


class MissingSkill(BaseModel):
    skill: str
    importance: str = "required"
    priority: str = "critical"


class CareerRecommendation(BaseModel):
    role_id: Optional[str] = None
    role: str
    category: Optional[str] = None
    description: str
    match_score: float
    match_percentage: int
    match_explanation: str
    matching_skills: List[MatchingSkill] = Field(default_factory=list)
    transferable_skills: List[TransferableSkill] = Field(default_factory=list)
    partial_skills: List[PartialSkill] = Field(default_factory=list)
    missing_skills: List[MissingSkill] = Field(default_factory=list)
    confidence: float = 0.85
    salary_range: Optional[str] = None
    growth_outlook: Optional[str] = None
    data_source: str = "Curated Market Index"


class CareerAnalyzeRequest(BaseModel):
    user_id: Optional[str] = None
    target_role: str

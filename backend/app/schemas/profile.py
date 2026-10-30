"""
Pydantic schemas for user career profiles and skill evidence.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class Education(BaseModel):
    degree: str
    institution: str
    year: Optional[int] = None
    field: Optional[str] = None


class SkillEvidence(BaseModel):
    type: str  # "project", "experience", "education", "certification", "self_reported"
    description: str
    confidence: str = "medium"  # "low", "medium", "high"


class Skill(BaseModel):
    name: str
    category: str = "General"
    proficiency: str = "beginner"  # "beginner", "intermediate", "advanced", "expert"
    evidence: List[SkillEvidence] = Field(default_factory=list)
    is_inferred: bool = False
    last_updated: Optional[str] = None


class Experience(BaseModel):
    title: str
    company: str
    duration: Optional[str] = None
    description: Optional[str] = None


class Project(BaseModel):
    name: str
    description: str
    technologies: List[str] = Field(default_factory=list)
    skills_demonstrated: List[str] = Field(default_factory=list)


class LearningPreferences(BaseModel):
    hours_per_week: Optional[float] = 5.0
    budget_monthly: Optional[float] = 0.0
    preferred_format: Optional[str] = None


class UserProfile(BaseModel):
    user_id: Optional[str] = None
    education: List[Education] = Field(default_factory=list)
    skills: List[Skill] = Field(default_factory=list)
    experience: List[Experience] = Field(default_factory=list)
    projects: List[Project] = Field(default_factory=list)
    interests: List[str] = Field(default_factory=list)
    career_goals: List[str] = Field(default_factory=list)
    learning_preferences: LearningPreferences = Field(default_factory=LearningPreferences)
    completeness: float = 0.0
    last_updated: Optional[str] = None


class ProfileAnalyzeRequest(BaseModel):
    user_id: Optional[str] = None
    resume_text: Optional[str] = None
    additional_context: Optional[str] = None


class ProfileUpdate(BaseModel):
    education: Optional[List[Education]] = None
    skills: Optional[List[Skill]] = None
    experience: Optional[List[Experience]] = None
    projects: Optional[List[Project]] = None
    interests: Optional[List[str]] = None
    career_goals: Optional[List[str]] = None
    learning_preferences: Optional[LearningPreferences] = None

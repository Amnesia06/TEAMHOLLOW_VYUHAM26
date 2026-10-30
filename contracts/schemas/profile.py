"""
User Profile contract schemas.
"""

from typing import List, Dict, Optional
from pydantic import BaseModel, Field


class ProfileSkill(BaseModel):
    skill_id: str
    name: str
    level: int = Field(ge=0, le=3, description="0=none, 1=beginner, 2=intermediate, 3=advanced")


class Profile(BaseModel):
    skills: List[ProfileSkill] = Field(default_factory=list)
    unmapped_skills: List[str] = Field(default_factory=list, description="Skills not found in taxonomy, flagged")
    years_of_experience: float = Field(ge=0.0, default=0.0)
    years_per_skill: Dict[str, float] = Field(default_factory=dict)
    domain: str = Field(default="Software Engineering")

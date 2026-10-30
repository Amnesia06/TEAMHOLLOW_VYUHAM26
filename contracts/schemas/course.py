"""
Course and Learning Resource contract schemas.
"""

from typing import List, Literal
from pydantic import BaseModel, Field


class Course(BaseModel):
    id: str
    title: str
    platform: str
    url: str
    cost: float = Field(ge=0.0, description="Zero for free")
    currency: Literal["USD", "INR"] = "USD"
    hours: float = Field(gt=0.0, description="Estimated duration in hours")
    level: int = Field(ge=1, le=3, description="1=beginner, 2=intermediate, 3=advanced")
    skills_covered: List[str] = Field(default_factory=list, description="Taxonomy skill ids")
    prerequisite_skills: List[str] = Field(default_factory=list, description="Taxonomy skill ids")
    verified: bool = Field(default=False, description="True only if live verified. False if unverified.")

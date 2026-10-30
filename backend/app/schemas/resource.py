"""
Pydantic schemas for curated learning resources.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class LearningResource(BaseModel):
    resource_id: str
    title: str
    provider: str
    url: str
    topic: str
    skills: List[str] = Field(default_factory=list)
    cost: float = 0.0
    currency: str = "USD"
    difficulty: str = "beginner"
    estimated_hours: int = 10
    prerequisites: List[str] = Field(default_factory=list)
    type: str = "course"  # "course", "documentation", "video", "interactive", "project"
    last_verified: Optional[str] = None

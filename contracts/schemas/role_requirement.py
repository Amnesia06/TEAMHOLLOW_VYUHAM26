"""
Role Requirement contract schemas.
"""

from typing import Literal
from pydantic import BaseModel, Field


class RoleRequirement(BaseModel):
    skill_id: str
    skill_name: str
    frequency: float = Field(ge=0.0, le=1.0)
    required_level: int = Field(ge=0, le=3, description="0=none, 1=beginner, 2=intermediate, 3=advanced")
    trend: Literal["rising", "stable", "declining", "unknown"] = "unknown"
    source: Literal["cache", "live"] = "cache"
    timestamp: str

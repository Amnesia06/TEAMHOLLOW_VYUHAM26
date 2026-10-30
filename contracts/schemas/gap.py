"""
Skill Gap contract schemas.
"""

from typing import Optional, Literal
from pydantic import BaseModel, Field


class Gap(BaseModel):
    skill_id: str
    skill_name: str
    gap_size: int = Field(ge=0, le=3, description="Required level minus current level, floored at 0")
    frequency: float = Field(ge=0.0, le=1.0)
    transferable: bool = False
    supporting_skill: Optional[str] = None
    trend: Literal["rising", "stable", "declining", "unknown"] = "unknown"
    priority_score: float = Field(ge=0.0)

"""
Roadmap and Roadmap Item contract schemas.
"""

from typing import List, Optional, Literal
from pydantic import BaseModel, Field
from contracts.schemas.course import Course
from contracts.schemas.gap import Gap


class RoadmapItem(BaseModel):
    order: int = Field(ge=1, description="Position in sequence")
    course: Course
    gaps_covered: List[Gap] = Field(default_factory=list)
    start_week: float = Field(ge=1.0)
    end_week: float = Field(ge=1.0)
    cost: float = Field(ge=0.0)
    hours: float = Field(gt=0.0)
    added_for_prerequisite: bool = False
    explanation: str = Field(description="Evidence-based reasoning written by M6")


class UncoveredGap(BaseModel):
    gap: Gap
    reason: str


class Roadmap(BaseModel):
    items: List[RoadmapItem] = Field(default_factory=list)
    total_cost: float = Field(ge=0.0)
    total_hours: float = Field(ge=0.0)
    total_weeks: float = Field(ge=0.0)
    uncovered_gaps: List[UncoveredGap] = Field(default_factory=list)
    verifier_status: Literal["pass", "violations_flagged"] = "pass"
    violations: List[str] = Field(default_factory=list)

"""
Pydantic schemas for personalized, constraint-aware development roadmaps.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from backend.app.schemas.resource import LearningResource


class RoadmapConstraints(BaseModel):
    hours_per_week: float = 5.0
    monthly_budget: float = 0.0
    desired_timeline_months: Optional[float] = None
    preferred_format: Optional[List[str]] = None


class FeasibilityReport(BaseModel):
    is_feasible: bool = True
    total_estimated_hours: float
    total_estimated_weeks: float
    total_estimated_months: float
    total_estimated_cost: float
    weekly_hours_allocated: float
    notes: str


class Milestone(BaseModel):
    milestone_id: str
    order: int
    title: str
    description: str
    skills_covered: List[str] = Field(default_factory=list)
    estimated_hours: float = 10.0
    estimated_weeks: float = 2.0
    estimated_cost: float = 0.0
    schedule_window: Optional[str] = None
    prerequisites: List[str] = Field(default_factory=list)
    resources: List[LearningResource] = Field(default_factory=list)
    priority_explanation: str
    status: str = "not_started"  # "not_started", "in_progress", "completed"
    progress: int = 0


class Roadmap(BaseModel):
    roadmap_id: str
    target_role: str
    total_estimated_weeks: float
    total_estimated_months: float
    total_estimated_cost: float
    feasibility: FeasibilityReport
    milestones: List[Milestone] = Field(default_factory=list)
    explanation: str


class RoadmapGenerateRequest(BaseModel):
    user_id: Optional[str] = None
    target_role: str
    constraints: Optional[RoadmapConstraints] = None


class MilestoneUpdate(BaseModel):
    status: Optional[str] = None
    progress: Optional[int] = None
    notes: Optional[str] = None

"""
State definition for the M0 LangGraph Orchestrator.
Maintains state across Profiler, Market Intelligence, Gap Analyzer, Planner, Verifier, and Explainer.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from contracts.schemas.profile import Profile
from contracts.schemas.role_requirement import RoleRequirement
from contracts.schemas.gap import Gap
from contracts.schemas.roadmap import Roadmap
from contracts.schemas.constraints import Constraints


class OrchestratorEvent(BaseModel):
    step: str
    message: str
    data: Optional[Dict[str, Any]] = None
    timestamp: Optional[str] = None


class OrchestratorState(BaseModel):
    resume_text: str
    target_role: str
    constraints: Constraints
    profile: Optional[Profile] = None
    requirements: List[RoleRequirement] = Field(default_factory=list)
    market_source: str = "cache"
    fallback_reason: Optional[str] = None
    gaps: List[Gap] = Field(default_factory=list)
    roadmap: Optional[Roadmap] = None
    retry_count: int = 0
    verification_passed: bool = False
    verification_violations: List[str] = Field(default_factory=list)
    events: List[Dict[str, Any]] = Field(default_factory=list)
    error: Optional[str] = None


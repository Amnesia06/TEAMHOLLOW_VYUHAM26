"""
Pydantic schemas for the central conversational interface.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ChatAttachment(BaseModel):
    type: str  # e.g. "resume", "project_doc"
    content: str
    filename: Optional[str] = None


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    user_id: Optional[str] = None
    attachments: Optional[List[ChatAttachment]] = None


class AgentActivity(BaseModel):
    agent: str
    status: str  # "started", "completed", "error"
    summary: str


class UIComponent(BaseModel):
    type: str  # "career_card", "skill_badge", "roadmap_preview", "transferable_skills"
    data: Dict[str, Any]


class ProfileUpdateSummary(BaseModel):
    new_skills: List[str] = Field(default_factory=list)
    new_projects: List[str] = Field(default_factory=list)
    completeness: float = 0.0


class ChatResponse(BaseModel):
    message: str
    session_id: str
    agent_activity: List[AgentActivity] = Field(default_factory=list)
    profile_update: Optional[ProfileUpdateSummary] = None
    ui_components: List[UIComponent] = Field(default_factory=list)
    follow_up_suggestions: List[str] = Field(default_factory=list)

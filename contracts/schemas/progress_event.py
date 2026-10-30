"""
Progress Event contract schema for real-time streaming during analysis.
"""

from typing import Literal
from pydantic import BaseModel, Field


class ProgressEvent(BaseModel):
    step: str = Field(description="Agent or module running: Profiler, Market Intelligence, Gap Analyzer, Planner, Verifier, Explainer")
    status: Literal["started", "finished", "failed", "retrying"]
    message: str = Field(description="Short note, such as reason for live-search fallback or verifier violation")

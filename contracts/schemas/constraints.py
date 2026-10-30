"""
User Constraints contract schemas.
"""

from typing import Optional, Literal
from pydantic import BaseModel, Field


class UserConstraints(BaseModel):
    budget: float = Field(ge=0.0)
    currency: Literal["INR", "USD"] = "USD"
    weekly_hours: float = Field(gt=0.0, description="Available study hours per week")
    target_timeline: Optional[int] = Field(default=None, gt=0, description="Target timeline in weeks, optional")
    target_role: Optional[str] = Field(default=None, description="Target role name, optional")

# Backward compatibility alias
Constraints = UserConstraints


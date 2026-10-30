"""
Contracts schemas module.
"""

from contracts.schemas.common import APIResponse, ErrorDetail, ResponseMetadata
from contracts.schemas.profile import Profile, ProfileSkill
from contracts.schemas.role_requirement import RoleRequirement
from contracts.schemas.gap import Gap
from contracts.schemas.course import Course
from contracts.schemas.constraints import UserConstraints
from contracts.schemas.roadmap import Roadmap, RoadmapItem, UncoveredGap
from contracts.schemas.progress_event import ProgressEvent

__all__ = [
    "APIResponse",
    "ErrorDetail",
    "ResponseMetadata",
    "Profile",
    "ProfileSkill",
    "RoleRequirement",
    "Gap",
    "Course",
    "UserConstraints",
    "Roadmap",
    "RoadmapItem",
    "UncoveredGap",
    "ProgressEvent"
]

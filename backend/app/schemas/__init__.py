"""
Backend schemas: re-exports typed schemas from contracts.
"""

from contracts.schemas import (
    APIResponse,
    ErrorDetail,
    ResponseMetadata,
    Profile,
    ProfileSkill,
    RoleRequirement,
    Gap,
    Course,
    UserConstraints,
    Roadmap,
    RoadmapItem,
    UncoveredGap,
    ProgressEvent,
)

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
    "ProgressEvent",
]

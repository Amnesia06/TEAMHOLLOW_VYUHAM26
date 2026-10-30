"""
Automated validation of all contracts/examples/ JSON files against contracts/schemas/ models.
Gate requirement for Phase 0.
"""

import json
import os
import pytest
from contracts.schemas.common import APIResponse
from contracts.schemas.profile import Profile
from contracts.schemas.role_requirement import RoleRequirement
from contracts.schemas.gap import Gap
from contracts.schemas.course import Course
from contracts.schemas.constraints import UserConstraints
from contracts.schemas.roadmap import Roadmap, RoadmapItem
from contracts.schemas.progress_event import ProgressEvent

EXAMPLES_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "examples")


def load_example(filename: str):
    path = os.path.join(EXAMPLES_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def test_profile_example_validates():
    data = load_example("profile.json")
    obj = Profile(**data)
    assert len(obj.skills) > 0
    assert obj.years_of_experience >= 0


def test_role_requirement_example_validates():
    data = load_example("role_requirement.json")
    obj = RoleRequirement(**data)
    assert 0.0 <= obj.frequency <= 1.0
    assert 0 <= obj.required_level <= 3


def test_gap_example_validates():
    data = load_example("gap.json")
    obj = Gap(**data)
    assert 0 <= obj.gap_size <= 3
    assert obj.priority_score >= 0.0


def test_course_example_validates():
    data = load_example("course.json")
    obj = Course(**data)
    assert obj.cost >= 0.0
    assert obj.hours > 0.0
    assert 1 <= obj.level <= 3


def test_constraints_example_validates():
    data = load_example("constraints.json")
    obj = UserConstraints(**data)
    assert obj.weekly_hours > 0.0


def test_roadmap_item_example_validates():
    data = load_example("roadmap_item.json")
    obj = RoadmapItem(**data)
    assert obj.order >= 1
    assert obj.start_week >= 1.0


def test_roadmap_example_validates():
    data = load_example("roadmap.json")
    obj = Roadmap(**data)
    assert obj.verifier_status in ["pass", "violations_flagged"]
    assert len(obj.items) > 0


def test_progress_event_example_validates():
    data = load_example("progress_event.json")
    obj = ProgressEvent(**data)
    assert obj.status in ["started", "finished", "failed", "retrying"]


def test_api_response_example_validates():
    data = load_example("api_response.json")
    obj = APIResponse(**data)
    assert obj.success is True
    assert obj.error is None

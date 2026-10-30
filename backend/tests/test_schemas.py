"""
Pydantic schema validation unit tests.
"""

from backend.app.schemas.chat import ChatRequest, ChatResponse
from backend.app.schemas.profile import UserProfile, Skill
from backend.app.schemas.roadmap import RoadmapConstraints, FeasibilityReport


def test_chat_request_validation():
    req = ChatRequest(message="Hello Pathwise")
    assert req.message == "Hello Pathwise"
    assert req.session_id is None


def test_user_profile_schema():
    profile = UserProfile(
        skills=[
            Skill(name="Python", proficiency="intermediate")
        ]
    )
    assert len(profile.skills) == 1
    assert profile.skills[0].name == "Python"


def test_roadmap_constraints():
    constraints = RoadmapConstraints(hours_per_week=10, monthly_budget=50)
    assert constraints.hours_per_week == 10
    assert constraints.monthly_budget == 50

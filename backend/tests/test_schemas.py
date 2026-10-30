"""
Schema validation tests for backend.
"""

from contracts.schemas.profile import Profile
from contracts.schemas.gap import Gap
from contracts.schemas.constraints import UserConstraints


def test_user_constraints_validation():
    c = UserConstraints(budget=100.0, weekly_hours=15.0, currency="USD")
    assert c.budget == 100.0
    assert c.weekly_hours == 15.0


def test_gap_validation():
    g = Gap(
        skill_id="skill_python",
        skill_name="Python",
        gap_size=1,
        frequency=0.9,
        transferable=False,
        priority_score=0.9
    )
    assert g.skill_id == "skill_python"
    assert g.gap_size == 1

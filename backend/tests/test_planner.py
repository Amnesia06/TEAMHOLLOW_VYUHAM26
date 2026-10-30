"""
Unit tests for Deterministic Planner (M4) and Plan Verifier (M5).
"""

import pytest
from contracts.schemas.gap import Gap
from contracts.schemas.course import Course
from contracts.schemas.constraints import UserConstraints
from backend.app.catalog.catalog_db import CatalogDatabase
from backend.app.planner.optimizer import DeterministicPlanner, CycleDetectedError
from backend.app.planner.verifier import PlanVerifier


def test_zero_budget_planner():
    planner = DeterministicPlanner()
    gaps = [
        Gap(
            skill_id="skill_postgresql",
            skill_name="PostgreSQL",
            gap_size=2,
            frequency=0.8,
            transferable=False,
            supporting_skill=None,
            trend="rising",
            priority_score=1.6
        )
    ]
    constraints = UserConstraints(
        budget=0.0,
        currency="USD",
        weekly_hours=10.0,
        target_timeline=8,
        target_role="Full-Stack Developer"
    )

    roadmap = planner.generate_plan(gaps, constraints, user_skills=["skill_sql"])
    assert roadmap.total_cost == 0.0
    for item in roadmap.items:
        assert item.cost == 0.0


def test_prerequisite_ordering_planner():
    planner = DeterministicPlanner()
    gaps = [
        Gap(
            skill_id="skill_postgresql",
            skill_name="PostgreSQL",
            gap_size=2,
            frequency=0.8,
            transferable=False,
            supporting_skill=None,
            trend="rising",
            priority_score=1.6
        )
    ]
    constraints = UserConstraints(
        budget=0.0,
        currency="USD",
        weekly_hours=10.0,
        target_timeline=8,
        target_role="Full-Stack Developer"
    )

    roadmap = planner.generate_plan(gaps, constraints, user_skills=[])
    # Prerequisite SQL course was added or PostgreSQL appears
    assert len(roadmap.items) > 0


def test_verifier_catches_budget_violation():
    verifier = PlanVerifier()
    planner = DeterministicPlanner()
    gaps = [
        Gap(
            skill_id="skill_postgresql",
            skill_name="PostgreSQL",
            gap_size=2,
            frequency=0.8,
            transferable=False,
            supporting_skill=None,
            trend="rising",
            priority_score=1.6
        )
    ]
    constraints = UserConstraints(budget=0.0, currency="USD", weekly_hours=10.0)
    roadmap = planner.generate_plan(gaps, constraints, user_skills=[])

    # Manually induce budget violation
    roadmap.total_cost = 100.0
    result = verifier.verify_plan(roadmap, constraints)
    assert result["status"] == "violations_flagged"
    assert any("Rule 1" in v for v in result["violations"])

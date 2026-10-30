"""
Unit tests for Roadmap Optimizer and Constraint Scheduler.
"""

from intelligence.roadmap.optimizer import RoadmapOptimizer
from intelligence.roadmap.scheduler import ConstraintScheduler


def test_zero_budget_constraint():
    optimizer = RoadmapOptimizer()
    gaps = [{"skill": "PyTorch", "importance": "required"}]
    user_skills = ["Python"]

    roadmap = optimizer.generate_roadmap(
        target_role="Machine Learning Engineer",
        skill_gaps=gaps,
        user_skills=user_skills,
        hours_per_week=5.0,
        monthly_budget=0.0
    )

    assert roadmap["total_estimated_cost"] == 0.0
    assert len(roadmap["milestones"]) > 0
    for m in roadmap["milestones"]:
        assert m["estimated_cost"] == 0.0


def test_time_availability_scheduling():
    milestones = [
        {"title": "Step 1", "estimated_hours": 20, "estimated_cost": 0},
        {"title": "Step 2", "estimated_hours": 30, "estimated_cost": 0}
    ]
    # At 5 hours/week -> 50 hours total = 10 weeks
    scheduled, feasibility = ConstraintScheduler.schedule(
        milestones=milestones,
        hours_per_week=5.0,
        monthly_budget=0.0,
        desired_timeline_months=1.0  # 1 month is ~4.3 weeks -> conflict!
    )

    assert feasibility["total_estimated_hours"] == 50
    assert feasibility["total_estimated_weeks"] == 10.0
    assert feasibility["is_feasible"] is False
    assert "conflict" in feasibility["notes"].lower()

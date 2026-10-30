"""
Phase 2 P0 Test Suite: Backend Modules (M4 Planner & M5 Verifier).
Tests:
- M4 Deterministic Planner:
  - Deterministic repeatability (identical output on multiple runs)
  - Zero-budget constraint returns only free courses
  - Uncoverable gaps reported with reasons
  - Prerequisite insertion for unmet skills
- M5 Plan Verifier:
  - Purpose-built tests for each of the 6 verifier rules
  - Pass on compliant roadmap
"""

import pytest
from contracts.schemas.course import Course
from contracts.schemas.gap import Gap
from contracts.schemas.constraints import UserConstraints
from contracts.schemas.roadmap import Roadmap, RoadmapItem, UncoveredGap
from backend.app.planner.optimizer import DeterministicPlanner
from backend.app.planner.verifier import PlanVerifier
from backend.app.catalog.catalog_db import catalog_db


class TestM4Planner:
    """M4 Planner Module Acceptance Tests."""

    def test_m4_deterministic_repeatability(self):
        """Same input gives identical output on multiple runs."""
        planner = DeterministicPlanner(catalog=catalog_db)

        gaps = [
            Gap(
                skill_id="skill_postgresql",
                skill_name="PostgreSQL",
                gap_size=2,
                frequency=0.85,
                transferable=False,
                supporting_skill=None,
                trend="rising",
                priority_score=1.7
            ),
            Gap(
                skill_id="skill_nextjs",
                skill_name="Next.js",
                gap_size=2,
                frequency=0.75,
                transferable=False,
                supporting_skill=None,
                trend="stable",
                priority_score=1.5
            )
        ]
        constraints = UserConstraints(
            budget=100.0,
            currency="USD",
            weekly_hours=10,
            target_timeline=12,
            target_role="Full-Stack Developer"
        )
        user_skills = ["skill_react", "skill_typescript", "skill_sql"]

        plan_1 = planner.generate_plan(gaps, constraints, user_skills)
        plan_2 = planner.generate_plan(gaps, constraints, user_skills)

        assert len(plan_1.items) == len(plan_2.items)
        assert plan_1.total_cost == plan_2.total_cost
        assert plan_1.total_hours == plan_2.total_hours
        assert plan_1.total_weeks == plan_2.total_weeks
        assert [i.course.id for i in plan_1.items] == [i.course.id for i in plan_2.items]
        print(f"\n[PASS] M4 Determinism: Identical outputs verified across runs ({len(plan_1.items)} items, {plan_1.total_hours}h, ${plan_1.total_cost}).")

    def test_m4_zero_budget_constraint_yields_only_free_courses(self):
        """Zero-budget input yields exclusively free ($0.0) courses."""
        planner = DeterministicPlanner(catalog=catalog_db)

        gaps = [
            Gap(
                skill_id="skill_python",
                skill_name="Python",
                gap_size=2,
                frequency=0.95,
                transferable=False,
                supporting_skill=None,
                trend="stable",
                priority_score=1.9
            ),
            Gap(
                skill_id="skill_docker",
                skill_name="Docker",
                gap_size=2,
                frequency=0.80,
                transferable=False,
                supporting_skill=None,
                trend="rising",
                priority_score=1.92
            )
        ]
        constraints = UserConstraints(
            budget=0.0,
            currency="USD",
            weekly_hours=10,
            target_timeline=None,
            target_role="Data Engineer"
        )
        user_skills = ["skill_linux"]

        plan = planner.generate_plan(gaps, constraints, user_skills)

        assert plan.total_cost == 0.0
        for item in plan.items:
            assert item.cost == 0.0, f"Course {item.course.title} has non-zero cost {item.cost} under zero budget!"
        print(f"[PASS] M4 Zero-Budget: Scheduled {len(plan.items)} courses with total cost $0.00.")

    def test_m4_uncoverable_gaps_reported_with_reasons(self):
        """Gaps that cannot fit budget constraints are reported with explicit reasons."""
        planner = DeterministicPlanner(catalog=catalog_db)

        # Gap for a skill where free options don't fit extreme time constraints
        gaps = [
            Gap(
                skill_id="skill_pytorch",
                skill_name="PyTorch",
                gap_size=2,
                frequency=0.90,
                transferable=False,
                supporting_skill=None,
                trend="rising",
                priority_score=2.16
            )
        ]
        # Extremely tight timeline: 1 hour total
        constraints = UserConstraints(
            budget=0.0,
            currency="USD",
            weekly_hours=1,
            target_timeline=1,  # max 1 hour total
            target_role="Machine Learning Engineer"
        )
        user_skills = ["skill_python"]

        plan = planner.generate_plan(gaps, constraints, user_skills)

        # PyTorch courses take at least 4 hours, so with 1 hour max, it should be uncovered
        assert len(plan.uncovered_gaps) > 0
        uncovered = plan.uncovered_gaps[0]
        assert uncovered.gap.skill_id == "skill_pytorch"
        assert len(uncovered.reason) > 0
        print(f"[PASS] M4 Uncovered Gaps: Correctly reported with documented reason: '{uncovered.reason}'")

    def test_m4_prerequisite_course_inserted_automatically(self):
        """If a course has a prerequisite skill not held by user, cheapest prerequisite course is added."""
        planner = DeterministicPlanner(catalog=catalog_db)

        # Gap: Docker (requires skill_linux)
        gaps = [
            Gap(
                skill_id="skill_docker",
                skill_name="Docker",
                gap_size=2,
                frequency=0.85,
                transferable=False,
                supporting_skill=None,
                trend="stable",
                priority_score=1.7
            )
        ]
        constraints = UserConstraints(
            budget=50.0,
            currency="USD",
            weekly_hours=10,
            target_timeline=None,
            target_role="DevOps"
        )
        # User does NOT hold skill_linux
        user_skills = []

        plan = planner.generate_plan(gaps, constraints, user_skills)

        # Prerequisite for Docker (skill_linux) must be scheduled
        all_skills_covered = set()
        for item in plan.items:
            all_skills_covered.update(item.course.skills_covered)

        assert "skill_linux" in all_skills_covered
        # The linux course should be flagged as added_for_prerequisite
        prereq_items = [i for i in plan.items if i.added_for_prerequisite]
        assert len(prereq_items) > 0
        print(f"[PASS] M4 Prerequisite Resolution: Auto-added '{prereq_items[0].course.title}' for prerequisite skill.")


class TestM5Verifier:
    """M5 Verifier Module Acceptance Tests."""

    def test_m5_passes_compliant_roadmap(self):
        """Compliant roadmap passes all 6 rules."""
        verifier = PlanVerifier()
        course = catalog_db.get_course_by_id("res_py_01")
        constraints = UserConstraints(budget=50.0, currency="USD", weekly_hours=10, target_timeline=10)

        roadmap = Roadmap(
            items=[
                RoadmapItem(
                    order=1,
                    course=course,
                    gaps_covered=[],
                    start_week=1.0,
                    end_week=4.0,
                    cost=course.cost,
                    hours=course.hours,
                    added_for_prerequisite=False,
                    explanation="Foundational Python skill."
                )
            ],
            total_cost=course.cost,
            total_hours=course.hours,
            total_weeks=4.0,
            uncovered_gaps=[],
            verifier_status="pass",
            violations=[]
        )

        res = verifier.verify_plan(roadmap, constraints)
        assert res["status"] == "pass"
        assert len(res["violations"]) == 0
        print("\n[PASS] M5 Verifier: Compliant roadmap passed all 6 rules.")

    def test_m5_rule_1_cost_violation(self):
        """Rule 1: Cost exceeds budget."""
        verifier = PlanVerifier()
        course = Course(
            id="c_expensive", title="Paid Course", platform="Test", url="http://test.com",
            cost=200.0, currency="USD", hours=10.0, level=2, skills_covered=["skill_python"],
            prerequisite_skills=[], verified=False
        )
        constraints = UserConstraints(budget=50.0, currency="USD", weekly_hours=10)

        roadmap = Roadmap(
            items=[RoadmapItem(order=1, course=course, gaps_covered=[], start_week=1.0, end_week=2.0, cost=200.0, hours=10.0, added_for_prerequisite=False, explanation="test")],
            total_cost=200.0,
            total_hours=10.0,
            total_weeks=2.0,
            uncovered_gaps=[],
            verifier_status="pass",
            violations=[]
        )

        res = verifier.verify_plan(roadmap, constraints)
        assert res["status"] == "violations_flagged"
        assert any("Rule 1" in v for v in res["violations"])
        print("[PASS] M5 Rule 1: Triggered on budget overflow.")

    def test_m5_rule_2_hours_violation(self):
        """Rule 2: Total hours exceed timeline capacity."""
        verifier = PlanVerifier()
        course = Course(
            id="c_long", title="Long Course", platform="Test", url="http://test.com",
            cost=0.0, currency="USD", hours=60.0, level=2, skills_covered=["skill_python"],
            prerequisite_skills=[], verified=False
        )
        # Max capacity = 10 h/wk * 4 wks = 40 hours max
        constraints = UserConstraints(budget=100.0, currency="USD", weekly_hours=10, target_timeline=4)

        roadmap = Roadmap(
            items=[RoadmapItem(order=1, course=course, gaps_covered=[], start_week=1.0, end_week=6.0, cost=0.0, hours=60.0, added_for_prerequisite=False, explanation="test")],
            total_cost=0.0,
            total_hours=60.0,
            total_weeks=6.0,
            uncovered_gaps=[],
            verifier_status="pass",
            violations=[]
        )

        res = verifier.verify_plan(roadmap, constraints)
        assert res["status"] == "violations_flagged"
        assert any("Rule 2" in v for v in res["violations"])
        print("[PASS] M5 Rule 2: Triggered on timeline hours overflow.")

    def test_m5_rule_3_prerequisite_order_violation(self):
        """Rule 3: Course scheduled before its prerequisite."""
        verifier = PlanVerifier()
        course_prereq = Course(
            id="c_prereq", title="Python Foundation", platform="Test", url="http://test.com",
            cost=0.0, currency="USD", hours=10.0, level=1, skills_covered=["skill_python"],
            prerequisite_skills=[], verified=False
        )
        course_advanced = Course(
            id="c_adv", title="PyTorch ML", platform="Test", url="http://test.com",
            cost=0.0, currency="USD", hours=10.0, level=2, skills_covered=["skill_pytorch"],
            prerequisite_skills=["skill_python"], verified=False
        )
        constraints = UserConstraints(budget=100.0, currency="USD", weekly_hours=10)

        # Intentionally schedule advanced course BEFORE its prerequisite
        roadmap = Roadmap(
            items=[
                RoadmapItem(order=1, course=course_advanced, gaps_covered=[], start_week=1.0, end_week=2.0, cost=0.0, hours=10.0, added_for_prerequisite=False, explanation="test"),
                RoadmapItem(order=2, course=course_prereq, gaps_covered=[], start_week=3.0, end_week=4.0, cost=0.0, hours=10.0, added_for_prerequisite=False, explanation="test")
            ],
            total_cost=0.0,
            total_hours=20.0,
            total_weeks=4.0,
            uncovered_gaps=[],
            verifier_status="pass",
            violations=[]
        )

        res = verifier.verify_plan(roadmap, constraints)
        assert res["status"] == "violations_flagged"
        assert any("Rule 3" in v for v in res["violations"])
        print("[PASS] M5 Rule 3: Triggered on prerequisite order violation.")

    def test_m5_rule_4_undocumented_uncovered_gap(self):
        """Rule 4: Uncovered gap lacking a reason."""
        verifier = PlanVerifier()
        constraints = UserConstraints(budget=100.0, currency="USD", weekly_hours=10)

        roadmap = Roadmap(
            items=[],
            total_cost=0.0,
            total_hours=0.0,
            total_weeks=0.0,
            uncovered_gaps=[
                UncoveredGap(
                    gap=Gap(skill_id="skill_rust", skill_name="Rust", gap_size=2, frequency=0.8, transferable=False, trend="stable", priority_score=1.6),
                    reason=""  # Intentionally empty reason
                )
            ],
            verifier_status="pass",
            violations=[]
        )

        res = verifier.verify_plan(roadmap, constraints)
        assert res["status"] == "violations_flagged"
        assert any("Rule 4" in v for v in res["violations"])
        print("[PASS] M5 Rule 4: Triggered on undocumented uncovered gap.")

    def test_m5_rule_5_duplicate_courses(self):
        """Rule 5: Duplicate courses in roadmap."""
        verifier = PlanVerifier()
        course = catalog_db.get_course_by_id("res_py_01")
        constraints = UserConstraints(budget=100.0, currency="USD", weekly_hours=10)

        roadmap = Roadmap(
            items=[
                RoadmapItem(order=1, course=course, gaps_covered=[], start_week=1.0, end_week=2.0, cost=0.0, hours=10.0, added_for_prerequisite=False, explanation="test"),
                RoadmapItem(order=2, course=course, gaps_covered=[], start_week=3.0, end_week=4.0, cost=0.0, hours=10.0, added_for_prerequisite=False, explanation="test")
            ],
            total_cost=0.0,
            total_hours=20.0,
            total_weeks=4.0,
            uncovered_gaps=[],
            verifier_status="pass",
            violations=[]
        )

        res = verifier.verify_plan(roadmap, constraints)
        assert res["status"] == "violations_flagged"
        assert any("Rule 5" in v for v in res["violations"])
        print("[PASS] M5 Rule 5: Triggered on duplicate courses.")

    def test_m5_rule_6_invalid_timeline(self):
        """Rule 6: Invalid start/end weeks or missing explainer fields."""
        verifier = PlanVerifier()
        course = catalog_db.get_course_by_id("res_py_01")
        constraints = UserConstraints(budget=100.0, currency="USD", weekly_hours=10)

        roadmap = Roadmap(
            items=[
                # end_week < start_week
                RoadmapItem(order=1, course=course, gaps_covered=[], start_week=5.0, end_week=2.0, cost=0.0, hours=10.0, added_for_prerequisite=False, explanation="test")
            ],
            total_cost=0.0,
            total_hours=10.0,
            total_weeks=2.0,
            uncovered_gaps=[],
            verifier_status="pass",
            violations=[]
        )

        res = verifier.verify_plan(roadmap, constraints)
        assert res["status"] == "violations_flagged"
        assert any("Rule 6" in v for v in res["violations"])
        print("[PASS] M5 Rule 6: Triggered on invalid timeline.")


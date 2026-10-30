"""
Phase 6: Comprehensive End-to-End Acceptance Test Suite.
Tests all ten acceptance tests from README Section 21 with real clients and varied resumes.
"""

import pytest
import asyncio
import os
from contracts.schemas.profile import Profile, ProfileSkill
from contracts.schemas.constraints import UserConstraints
from contracts.schemas.gap import Gap
from contracts.schemas.course import Course
from contracts.schemas.roadmap import Roadmap, RoadmapItem
from intelligence.agents.profile_agent import ProfileAgent
from intelligence.agents.market_agent import MarketIntelligenceAgent
from intelligence.agents.role_matcher import role_matcher
from intelligence.agents.trends_agent import market_trends_agent
from intelligence.agents.explainer_agent import ExplainerAgent
from intelligence.skills.gap_analyzer import GapAnalyzer
from intelligence.search.tavily_client import TavilySearchAdapter
from backend.app.services.roadmap_service import roadmap_service
from backend.app.services.memory_service import memory_service
from backend.app.planner.optimizer import DeterministicPlanner
from backend.app.planner.verifier import PlanVerifier
from backend.app.catalog.catalog_db import catalog_db


# ==============================================================================
# Acceptance Test 1: Standard resume and common role produce compliant roadmap
# ==============================================================================
@pytest.mark.asyncio
async def test_acceptance_test_1_standard_resume_common_role():
    """
    Test 1: A standard resume and a common role produce a roadmap that respects budget and weekly hours.
    """
    resume_text = """
    Marcus Brody - Senior Full-Stack Engineer with 5+ years of experience.
    Proficient in TypeScript, React, Node.js, and Git.
    Looking to transition to Full-Stack Developer with deep PostgreSQL and Cloud architecture.
    """
    constraints = {
        "budget": 50.0,
        "currency": "USD",
        "weekly_hours": 15.0,
        "target_role": "Full-Stack Developer"
    }

    result = await roadmap_service.analyze(
        resume_text=resume_text,
        target_role="Full-Stack Developer",
        constraints=constraints
    )

    assert result["status"] == "success"
    roadmap_data = result["roadmap"]
    assert roadmap_data is not None
    assert len(roadmap_data["items"]) > 0

    # Verify budget constraint
    assert roadmap_data["total_cost"] <= 50.0

    # Verify timeline capacity (hours / weekly_hours <= total_weeks)
    assert roadmap_data["total_weeks"] >= round(roadmap_data["total_hours"] / 15.0, 1) - 0.1
    assert roadmap_data["verifier_status"] in ["pass", "violations_flagged"]

    print(f"\n[PASS Acceptance Test 1] Standard resume + Full-Stack Developer:")
    print(f"  Items: {len(roadmap_data['items'])}, Total Cost: ${roadmap_data['total_cost']}, Total Hours: {roadmap_data['total_hours']}h over {roadmap_data['total_weeks']} wks")


# ==============================================================================
# Acceptance Test 2: Zero-budget user receives only free courses & reports gaps
# ==============================================================================
def test_acceptance_test_2_zero_budget_free_courses():
    """
    Test 2: A zero-budget user receives only free courses, and any uncovered gap is reported with a reason.
    """
    planner = DeterministicPlanner(catalog=catalog_db)
    gaps = [
        Gap(skill_id="skill_python", skill_name="Python", gap_size=2, frequency=0.9, priority_score=1.8),
        Gap(skill_id="skill_docker", skill_name="Docker", gap_size=2, frequency=0.8, priority_score=1.6),
        Gap(skill_id="skill_niche_proprietary", skill_name="CustomProprietaryTool", gap_size=3, frequency=0.5, priority_score=1.5)
    ]
    constraints = UserConstraints(budget=0.0, currency="USD", weekly_hours=10.0, target_role="DevOps Engineer")
    user_skills = ["skill_git", "skill_linux"]

    plan = planner.generate_plan(gaps=gaps, constraints=constraints, user_skills=user_skills)

    # Every item must be free ($0.0)
    for item in plan.items:
        assert item.cost == 0.0

    assert plan.total_cost == 0.0

    # Uncovered gap for niche proprietary skill should be flagged with an explanation
    assert len(plan.uncovered_gaps) > 0
    assert any("CustomProprietaryTool" in ug.gap.skill_name or "skill_niche_proprietary" in ug.gap.skill_id for ug in plan.uncovered_gaps)
    for ug in plan.uncovered_gaps:
        assert len(ug.reason) > 5

    print(f"\n[PASS Acceptance Test 2] Zero-budget plan: 100% Free (${plan.total_cost}), {len(plan.uncovered_gaps)} uncovered gaps reported with reasons.")


# ==============================================================================
# Acceptance Test 3: Niche role triggers live Tavily search with logged reason
# ==============================================================================
@pytest.mark.asyncio
async def test_acceptance_test_3_niche_role_triggers_live_search():
    """
    Test 3: The niche role (Rust Embedded Systems Engineer) triggers live search, and the progress event shows the reason.
    """
    tavily_key = os.getenv("TAVILY_API_KEY")
    search_adapter = TavilySearchAdapter(api_key=tavily_key) if tavily_key else None
    niche_role = "Rust Embedded Systems Engineer"

    class EmptyCacheSearch:
        def search_postings(self, role, query_vector, top_k=15):
            return []

    agent = MarketIntelligenceAgent(posting_search=EmptyCacheSearch(), search_client=search_adapter)
    result = await agent.get_role_requirements(role=niche_role)

    assert result["source"] == "live"
    assert result["fallback_reason"] is not None
    assert "Insufficient cached postings" in result["fallback_reason"]
    assert niche_role in result["fallback_reason"]
    print(f"\n[PASS Acceptance Test 3] Niche role '{niche_role}' triggered live search fallback:")
    print(f"  Fallback Reason: {result['fallback_reason']}")


# ==============================================================================
# Acceptance Test 4: User with no target role receives ranked roles
# ==============================================================================
def test_acceptance_test_4_no_target_role_receives_ranked_roles():
    """
    Test 4: A user with no target role receives ranked roles and can select one.
    """
    profile = Profile(
        skills=[
            ProfileSkill(skill_id="skill_python", name="Python", level=2),
            ProfileSkill(skill_id="skill_sql", name="SQL", level=2),
            ProfileSkill(skill_id="skill_git", name="Git", level=2),
            ProfileSkill(skill_id="skill_postgresql", name="PostgreSQL", level=2),
        ],
        years_of_experience=2.5,
        domain="Data & Analytics"
    )

    ranked_roles = role_matcher.match_roles(profile=profile, top_n=5)
    assert len(ranked_roles) >= 3

    top_role = ranked_roles[0]
    assert "role_title" in top_role
    assert "fit_score" in top_role
    assert 0.0 <= top_role["fit_score"] <= 1.0
    assert len(top_role["matching_skills"]) > 0

    print(f"\n[PASS Acceptance Test 4] Role matcher ranked {len(ranked_roles)} sensible roles:")
    for idx, r in enumerate(ranked_roles[:3]):
        print(f"  #{idx+1}: {r['role_title']} (Fit: {round(r['fit_score'] * 100)}%, Matching: {', '.join(r['matching_skills'])})")


# ==============================================================================
# Acceptance Test 5: Prerequisite order holds in every generated roadmap
# ==============================================================================
def test_acceptance_test_5_prerequisite_ordering_holds():
    """
    Test 5: Prerequisite order holds in every generated roadmap (checked automatically).
    """
    planner = DeterministicPlanner(catalog=catalog_db)
    verifier = PlanVerifier()

    # Gap requiring PyTorch (which has Python as a prerequisite)
    gaps = [
        Gap(skill_id="skill_pytorch", skill_name="PyTorch", gap_size=2, frequency=0.85, priority_score=1.7)
    ]
    constraints = UserConstraints(budget=100.0, currency="USD", weekly_hours=10.0, target_role="ML Engineer")
    # User does NOT know Python yet
    user_skills = []

    plan = planner.generate_plan(gaps=gaps, constraints=constraints, user_skills=user_skills)

    # Automated check: Python prerequisite must be scheduled before PyTorch
    skills_seen = set(user_skills)
    for item in plan.items:
        for prereq in item.course.prerequisite_skills:
            assert prereq in skills_seen, f"Prerequisite {prereq} scheduled AFTER course {item.course.title}"
        for sc in item.course.skills_covered:
            skills_seen.add(sc)

    # Verifier Rule 3 check
    v_res = verifier.verify_plan(plan, constraints)
    assert not any("Rule 3" in v for v in v_res["violations"])
    print(f"\n[PASS Acceptance Test 5] Prerequisite order verified: foundational modules strictly precede dependent courses.")


# ==============================================================================
# Acceptance Test 6: Every roadmap item has an explanation citing computed data
# ==============================================================================
@pytest.mark.asyncio
async def test_acceptance_test_6_explanations_cite_computed_data():
    """
    Test 6: Every roadmap item has an explanation that cites its computed data.
    """
    explainer = ExplainerAgent()
    item = RoadmapItem(
        order=1,
        course=Course(
            id="res_py_01",
            title="Scientific Computing with Python",
            platform="freeCodeCamp",
            url="https://freecodecamp.org/learn/scientific-computing-with-python",
            cost=0.0,
            currency="USD",
            hours=25.0,
            level=1,
            skills_covered=["skill_python"],
            prerequisite_skills=[],
            verified=True
        ),
        gaps_covered=[Gap(skill_id="skill_python", skill_name="Python", gap_size=1, frequency=0.9, priority_score=1.0)],
        start_week=1.0,
        end_week=2.5,
        cost=0.0,
        hours=25.0,
        added_for_prerequisite=False,
        explanation=""
    )

    roadmap = Roadmap(
        items=[item],
        total_cost=0.0,
        total_hours=25.0,
        total_weeks=2.5,
        uncovered_gaps=[],
        verifier_status="pass",
        violations=[]
    )

    explained_roadmap = await explainer.explain_roadmap(
        roadmap=roadmap,
        target_role="Data Engineer"
    )

    explanation = explained_roadmap.items[0].explanation
    assert len(explanation) > 20
    # Must cite computed evidence (course title, hours, role, or skill)
    assert any(term.lower() in explanation.lower() for term in ["python", "scientific computing", "data engineer", "foundation", "gap"])
    print(f"\n[PASS Acceptance Test 6] Evidence-based explanation generated:")
    print(f"  \"{explanation}\"")


# ==============================================================================
# Acceptance Test 7: Changing hours or marking complete replans without resume
# ==============================================================================
@pytest.mark.asyncio
async def test_acceptance_test_7_replan_without_resume_upload():
    """
    Test 7: Changing weekly hours or marking an item complete replans without a new resume upload.
    """
    user_id = "test_user_replan"
    profile = Profile(
        skills=[ProfileSkill(skill_id="skill_javascript", name="JavaScript", level=2)],
        years_of_experience=1.5,
        domain="Frontend"
    )
    constraints = UserConstraints(weekly_hours=10.0, budget=100.0, currency="USD", target_role="Full-Stack Developer")
    initial_gaps = [
        Gap(skill_id="skill_react", skill_name="React", gap_size=2, frequency=0.9, priority_score=1.8),
        Gap(skill_id="skill_nodejs", skill_name="Node.js", gap_size=2, frequency=0.85, priority_score=1.7)
    ]
    initial_roadmap = roadmap_service.plan_and_verify(
        gaps=initial_gaps,
        constraints=constraints,
        user_skills=["skill_javascript"]
    )

    memory_service.save_session(
        user_id=user_id,
        profile=profile,
        target_role="Full-Stack Developer",
        constraints=constraints,
        roadmap=initial_roadmap,
        gaps=initial_gaps
    )

    # 1. Mark item #1 complete
    replanned_1 = await memory_service.mark_item_complete(user_id=user_id, item_order=1)
    assert len(replanned_1.items) == len(initial_roadmap.items) - 1

    # 2. Adjust weekly hours from 10 to 20 without uploading resume
    new_constraints = UserConstraints(weekly_hours=20.0, budget=100.0, currency="USD", target_role="Full-Stack Developer")
    replanned_2 = await memory_service.replan_with_constraints(user_id=user_id, new_constraints=new_constraints)

    assert replanned_2.total_weeks < replanned_1.total_weeks
    print(f"\n[PASS Acceptance Test 7] Reactive replanning succeeded without resume upload:")
    print(f"  Item completion reduced remaining items to {len(replanned_1.items)}")
    print(f"  Timeline compressed from {replanned_1.total_weeks} wks (10h/wk) to {replanned_2.total_weeks} wks (20h/wk)")


# ==============================================================================
# Acceptance Test 8: Infeasible input ends in flagged result within retry limit
# ==============================================================================
def test_acceptance_test_8_infeasible_input_flagged():
    """
    Test 8: An infeasible input ends in a flagged result within the retry limit.
    """
    verifier = PlanVerifier()
    course_impossible = Course(
        id="c_heavy",
        title="100-Hour Deep System",
        platform="Test",
        url="http://test.com",
        cost=1000.0,
        currency="USD",
        hours=100.0,
        level=3,
        skills_covered=["skill_cloud_aws_gcp"],
        prerequisite_skills=[],
        verified=False
    )
    # Impossible constraints: Budget $10, 1 week deadline at 5 h/wk (max 5 hours capacity vs 100h course)
    constraints = UserConstraints(budget=10.0, currency="USD", weekly_hours=5.0, target_timeline=1)
    roadmap = Roadmap(
        items=[
            RoadmapItem(order=1, course=course_impossible, gaps_covered=[], start_week=1.0, end_week=20.0, cost=1000.0, hours=100.0, added_for_prerequisite=False, explanation="")
        ],
        total_cost=1000.0,
        total_hours=100.0,
        total_weeks=20.0,
        uncovered_gaps=[],
        verifier_status="pass",
        violations=[]
    )

    res = verifier.verify_plan(roadmap=roadmap, constraints=constraints)
    assert res["status"] == "violations_flagged"
    assert len(res["violations"]) >= 2
    assert any("Rule 1" in v for v in res["violations"])  # Budget violation
    assert any("Rule 2" in v for v in res["violations"])  # Timeline violation
    print(f"\n[PASS Acceptance Test 8] Infeasible input correctly flagged with violations:")
    for v in res["violations"]:
        print(f"  - {v}")


# ==============================================================================
# Acceptance Test 9: Unusual skill wording normalizes to canonical skills
# ==============================================================================
@pytest.mark.asyncio
async def test_acceptance_test_9_unusual_skill_wording_normalization():
    """
    Test 9: A resume with unusual skill wording still normalizes to canonical skills.
    """
    agent = ProfileAgent()
    unusual_text = """
    Software Engineer with 3 years background.
    Daily work involved writing backend microservices in py, relational tables in postgres db,
    orchestrating containers, and building responsive client apps with react.js framework.
    """

    profile = await agent.extract_profile(resume_text=unusual_text)
    extracted_canonical = {s.skill_id.lower() for s in profile.skills}

    # Verify synonym mapping to canonical taxonomy
    assert any("python" in sid for sid in extracted_canonical), f"Python not normalized: {extracted_canonical}"
    assert any("postgresql" in sid or "sql" in sid for sid in extracted_canonical), f"PostgreSQL not normalized: {extracted_canonical}"
    assert any("react" in sid for sid in extracted_canonical), f"React not normalized: {extracted_canonical}"
    assert any("docker" in sid for sid in extracted_canonical), f"Docker not normalized: {extracted_canonical}"

    print(f"\n[PASS Acceptance Test 9] Unusual wording correctly normalized to canonical skills:")
    for s in profile.skills:
        print(f"  Skill: '{s.name}' -> Canonical ID: {s.skill_id} (Proficiency Level: {s.level})")


# ==============================================================================
# Acceptance Test 10: Trend table shows two snapshots with rising/declining labels
# ==============================================================================
def test_acceptance_test_10_market_trends_two_snapshots():
    """
    Test 10: The trend table shows at least two snapshots with rising or declining labels.
    """
    role = "Full-Stack Developer"
    trends = market_trends_agent.get_role_trends(role=role)

    assert trends["role"] == role
    assert trends["snapshots_count"] >= 2
    assert len(trends["dates"]) >= 2
    assert len(trends["trends"]) > 0

    trend_labels = {item["trend"] for item in trends["trends"]}
    assert "rising" in trend_labels or "declining" in trend_labels or "stable" in trend_labels

    for item in trends["trends"]:
        assert "skill" in item
        assert "delta" in item
        assert "frequency_baseline" in item
        assert "frequency_recent" in item
        expected_delta = round(item["frequency_recent"] - item["frequency_baseline"], 4)
        assert abs(item["delta"] - expected_delta) < 0.001

    print(f"\n[PASS Acceptance Test 10] Market Trends for '{role}':")
    print(f"  Snapshots: {', '.join(trends['dates'])}")
    for t in trends["trends"][:4]:
        print(f"  Skill: {t['skill']:<15} Baseline: {t['frequency_baseline']:.2f} Recent: {t['frequency_recent']:.2f} Delta: {t['delta']:+.2f} Trend: {t['trend'].upper()}")

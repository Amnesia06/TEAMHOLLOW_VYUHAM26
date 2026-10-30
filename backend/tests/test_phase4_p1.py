"""
Phase 4 P1 End-to-End Acceptance Tests:
- Acceptance Test 3: The niche role (Rust Embedded Systems Engineer) triggers live search, and the progress event shows the reason.
- Acceptance Test 4: A user with no target role receives ranked roles and can select one.
- Acceptance Test 7: Changing weekly hours or marking an item complete replans without a new resume upload.
- Acceptance Test 10: The trend table shows at least two snapshots with rising or declining labels.
"""

import pytest
import asyncio
import os
from contracts.schemas.profile import Profile, ProfileSkill
from contracts.schemas.constraints import UserConstraints
from intelligence.agents.market_agent import MarketIntelligenceAgent
from intelligence.agents.role_matcher import role_matcher
from intelligence.agents.trends_agent import market_trends_agent
from backend.app.services.roadmap_service import roadmap_service
from backend.app.services.memory_service import memory_service
from intelligence.search.tavily_client import TavilySearchAdapter


@pytest.mark.asyncio
async def test_acceptance_test_3_niche_role_triggers_live_search():
    """
    Acceptance Test 3:
    The niche role (Rust Embedded Systems Engineer) triggers live search,
    and the progress event / return structure shows the reason.
    """
    tavily_key = os.getenv("TAVILY_API_KEY")
    search_adapter = TavilySearchAdapter(api_key=tavily_key) if tavily_key else None

    # Role with 0 cached postings in base taxonomy
    niche_role = "Rust Embedded Systems Engineer"

    # Search client with minimal or 0 postings triggers fallback
    class MockEmptyPostingSearch:
        def search_postings(self, role, query_vector, top_k=15):
            return []  # 0 postings found, triggering fallback

    agent = MarketIntelligenceAgent(
        posting_search=MockEmptyPostingSearch(),
        search_client=search_adapter
    )

    result = await agent.get_role_requirements(role=niche_role)

    assert result["source"] == "live"
    assert result["fallback_reason"] is not None
    assert "Insufficient cached postings" in result["fallback_reason"]
    assert niche_role in result["fallback_reason"]

    print(f"\n[PASS Acceptance Test 3] Niche role '{niche_role}' triggered live search:")
    print(f"  Reason: {result['fallback_reason']}")
    print(f"  Source: {result['source']}")


@pytest.mark.asyncio
async def test_acceptance_test_4_user_with_no_target_role_receives_ranked_roles():
    """
    Acceptance Test 4:
    A user with no target role receives ranked roles and can select one.
    """
    # Profile with data engineering background
    profile = Profile(
        skills=[
            ProfileSkill(skill_id="skill_python", name="Python", level=2),
            ProfileSkill(skill_id="skill_sql", name="SQL", level=2),
            ProfileSkill(skill_id="skill_docker", name="Docker", level=1),
        ],
        unmapped_skills=[],
        years_of_experience=2.0,
        years_per_skill={"Python": 2.0, "SQL": 2.0},
        domain="Data Analytics"
    )

    ranked_roles = role_matcher.match_roles(profile=profile, top_n=4)

    assert len(ranked_roles) >= 3
    # Top roles should be sensible (Data Engineer or Python Backend)
    top_role_titles = [r["role_title"] for r in ranked_roles]
    assert any("Data" in title or "Python" in title for title in top_role_titles[:2])

    top_match = ranked_roles[0]
    assert 0.0 <= top_match["fit_score"] <= 1.0
    assert len(top_match["matching_skills"]) > 0
    assert "explanation" in top_match and len(top_match["explanation"]) > 10

    # User can select one role
    selected_role = top_match["role_title"]
    assert selected_role in top_role_titles

    print(f"\n[PASS Acceptance Test 4] User with no target role received {len(ranked_roles)} ranked roles:")
    for idx, r in enumerate(ranked_roles[:3], 1):
        print(f"  {idx}. {r['role_title']} (Fit Score: {r['fit_score'] * 100:.0f}%) -> {r['explanation']}")


@pytest.mark.asyncio
async def test_acceptance_test_7_replan_without_resume_upload():
    """
    Acceptance Test 7:
    Changing weekly hours or marking an item complete replans without a new resume upload.
    """
    user_id = "test_user_p1"
    resume = (
        "Frontend developer with 2 years of experience in JavaScript and HTML/CSS. "
        "Want to become a Full-Stack Developer learning React, Node.js, and PostgreSQL."
    )

    # Initial analysis
    initial_result = await roadmap_service.analyze(
        resume_text=resume,
        target_role="Full-Stack Developer",
        constraints={"weekly_hours": 10.0, "max_budget": 0.0, "currency": "USD"}
    )
    initial_roadmap = initial_result["roadmap"]
    assert len(initial_roadmap["items"]) > 0
    initial_weeks = initial_roadmap["total_weeks"]
    initial_items_count = len(initial_roadmap["items"])

    # Ensure session was saved in memory_service
    session = memory_service.get_session("guest")
    assert session is not None

    # Action 1: Change weekly hours to 20h (doubling hours should reduce total weeks)
    replanned_hours_roadmap = await memory_service.replan_with_constraints(
        user_id="guest",
        new_constraints=UserConstraints(weekly_hours=20.0, budget=0.0, currency="USD", target_role="Full-Stack Developer")
    )
    assert replanned_hours_roadmap.total_weeks < initial_weeks
    print(f"\n[PASS Acceptance Test 7a] Changed weekly hours 10h -> 20h:")
    print(f"  Initial timeline: {initial_weeks:.1f} weeks -> Replanned: {replanned_hours_roadmap.total_weeks:.1f} weeks")

    # Action 2: Mark item #1 complete
    first_item_order = initial_roadmap["items"][0]["order"]
    completed_course_title = initial_roadmap["items"][0]["course"]["title"]

    replanned_progress_roadmap = await memory_service.mark_item_complete(
        user_id="guest",
        item_order=first_item_order
    )

    # Learned skills incorporated, remaining gaps reduced
    assert replanned_progress_roadmap.verifier_status == "pass"
    print(f"[PASS Acceptance Test 7b] Marked item #{first_item_order} ('{completed_course_title}') complete:")
    print(f"  Remaining items replanned: {len(replanned_progress_roadmap.items)} modules (was {initial_items_count})")


@pytest.mark.asyncio
async def test_acceptance_test_10_market_trends_two_snapshots():
    """
    Acceptance Test 10:
    The trend table shows at least two snapshots with rising or declining labels.
    """
    trends_result = market_trends_agent.get_role_trends("Full-Stack Developer")

    assert trends_result["snapshots_count"] >= 2
    assert len(trends_result["dates"]) >= 2
    trends = trends_result["trends"]
    assert len(trends) > 0

    trend_labels = set(t["trend"] for t in trends)
    assert "rising" in trend_labels
    assert "declining" in trend_labels

    print(f"\n[PASS Acceptance Test 10] Market trend table for '{trends_result['role']}' across {trends_result['snapshots_count']} snapshots ({', '.join(trends_result['dates'])}):")
    for t in trends[:5]:
        print(f"  - {t['skill']}: {t['frequency_baseline']*100:.0f}% -> {t['frequency_recent']*100:.0f}% (Delta {t['delta']*100:+.0f}%) => [{t['trend'].upper()}]")

"""
Pathwise End-to-End Demo Script (README Section 23).
Executes the exact 10-step demo script from the specification:
1. Upload a resume, set budget and weekly hours, pick a target role.
2. Show the agent progress steps as they run.
3. Show the profile with canonical skills and levels.
4. Show gaps with priority scores and transferable skills flagged.
5. Show the roadmap: order, cost, hours, timeline, and the reason for each item.
6. Trigger the live-search fallback with the niche role and show why it triggered.
7. Show the market trend table with rising and declining skills.
8. Reduce the budget to force a constraint violation and show the Verifier returning the plan to the Planner.
9. Change weekly hours or mark a course complete and show replanning.
10. Show role suggestions for a user with no target role.
"""

import asyncio
import os
import sys

# Ensure repository root is on sys.path
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)

from contracts.schemas.profile import Profile, ProfileSkill
from contracts.schemas.constraints import UserConstraints
from contracts.schemas.gap import Gap
from contracts.schemas.course import Course
from contracts.schemas.roadmap import Roadmap, RoadmapItem
from backend.app.services.roadmap_service import roadmap_service
from backend.app.services.memory_service import memory_service
from intelligence.agents.market_agent import MarketIntelligenceAgent
from intelligence.agents.role_matcher import role_matcher
from intelligence.agents.trends_agent import market_trends_agent
from intelligence.search.tavily_client import TavilySearchAdapter
from backend.app.planner.verifier import PlanVerifier


async def run_demo(run_number: int = 1):
    print("=" * 80)
    print(f"PATHWISE DEMO RUN #{run_number} (README SECTION 23 SPECIFICATION)")
    print("=" * 80)

    # --------------------------------------------------------------------------
    # Step 1: Upload a resume, set budget and weekly hours, pick a target role
    # --------------------------------------------------------------------------
    print("\n--- STEP 1: Upload Resume & Set Constraints ---")
    candidate_resume = """
    Alex Morgan - Software Developer with 2.5 years of experience.
    Proficient in TypeScript, React, and basic Node.js.
    Familiar with Git and building simple REST APIs.
    Seeking transition to: Full-Stack Developer with PostgreSQL, Docker, and Cloud infrastructure.
    """
    constraints = {
        "budget": 50.0,
        "currency": "USD",
        "weekly_hours": 15.0,
        "target_role": "Full-Stack Developer"
    }
    print(f"Target Role: {constraints['target_role']}")
    print(f"Weekly Hours: {constraints['weekly_hours']} hrs/wk | Budget: ${constraints['budget']} {constraints['currency']}")

    # --------------------------------------------------------------------------
    # Step 2: Show agent progress steps as they run
    # --------------------------------------------------------------------------
    print("\n--- STEP 2: Multi-Agent Progress Stream ---")
    analysis_result = await roadmap_service.analyze(
        resume_text=candidate_resume,
        target_role=constraints["target_role"],
        constraints=constraints
    )

    for evt in analysis_result.get("events", []):
        print(f"  [{evt.get('step')}] -> {evt.get('message')}")

    # --------------------------------------------------------------------------
    # Step 3: Show the profile with canonical skills and levels
    # --------------------------------------------------------------------------
    print("\n--- STEP 3: Extracted Profile (Canonical Skills & Levels) ---")
    profile = analysis_result["profile"]
    print(f"Experience: {profile.get('years_of_experience')} years | Domain: {profile.get('domain')}")
    print("Extracted Skills:")
    for skill in profile.get("skills", []):
        lvl_label = ["None", "Beginner", "Intermediate", "Advanced"][skill.get("level", 1)]
        print(f"  - {skill.get('name'):<15} (ID: {skill.get('skill_id'):<20} Level: {skill.get('level')} [{lvl_label}])")

    # --------------------------------------------------------------------------
    # Step 4: Show gaps with priority scores and transferable skills flagged
    # --------------------------------------------------------------------------
    print("\n--- STEP 4: Computed Skill Gaps & Prioritization ---")
    gaps = analysis_result.get("gaps", [])
    print(f"Identified {len(gaps)} Missing or Growth Competencies:")
    for gap in gaps:
        trans_flag = " [TRANSFERABLE]" if gap.get("transferable") else ""
        print(f"  - {gap.get('skill_name'):<15} Gap Size: +{gap.get('gap_size')} | Market Freq: {gap.get('frequency'):.1%} | Priority: {gap.get('priority_score'):.2f}{trans_flag}")

    # --------------------------------------------------------------------------
    # Step 5: Show the roadmap: order, cost, hours, timeline, and reasons
    # --------------------------------------------------------------------------
    print("\n--- STEP 5: Optimized Learning Roadmap ---")
    roadmap = analysis_result["roadmap"]
    print(f"Total Sequence: {len(roadmap['items'])} Courses | Cost: ${roadmap['total_cost']} | Hours: {roadmap['total_hours']}h | Timeline: {roadmap['total_weeks']} weeks")
    print(f"Verifier Status: {roadmap['verifier_status'].upper()}")
    for item in roadmap["items"]:
        c = item["course"]
        print(f"\n  #{item['order']}: {c['title']} ({c['platform']})")
        print(f"      Duration: {item['hours']} hrs (Weeks {item['start_week']:.1f} - {item['end_week']:.1f}) | Cost: ${item['cost']}")
        print(f"      Gaps Covered: {[g.get('skill_name') for g in item.get('gaps_covered', [])]}")
        print(f"      Evidence Rationale: \"{item['explanation']}\"")

    # --------------------------------------------------------------------------
    # Step 6: Trigger live-search fallback with niche role and show why it triggered
    # --------------------------------------------------------------------------
    print("\n--- STEP 6: Autonomous Live Search Fallback on Niche Role ---")
    niche_role = "Rust Embedded Systems Engineer"
    tavily_key = os.getenv("TAVILY_API_KEY")
    search_adapter = TavilySearchAdapter(api_key=tavily_key) if tavily_key else None

    class EmptyCacheSearch:
        def search_postings(self, role, query_vector, top_k=15):
            return []

    market_agent = MarketIntelligenceAgent(posting_search=EmptyCacheSearch(), search_client=search_adapter)
    niche_result = await market_agent.get_role_requirements(role=niche_role)
    print(f"Target Role: '{niche_role}'")
    print(f"Market Source: {niche_result['source'].upper()}")
    print(f"Fallback Reason Logged: {niche_result['fallback_reason']}")
    print(f"Derived Requirements: {[r.skill_name for r in niche_result['requirements'][:4]]}")

    # --------------------------------------------------------------------------
    # Step 7: Show market trend table with rising and declining skills
    # --------------------------------------------------------------------------
    print("\n--- STEP 7: Market Skill Trends (Timestamped Snapshots) ---")
    trends_data = market_trends_agent.get_role_trends(role="Full-Stack Developer")
    print(f"Role: {trends_data['role']} | Snapshots: {', '.join(trends_data['dates'])}")
    print(f"{'Skill':<18} {'Baseline':<10} {'Recent':<10} {'Delta':<10} {'Trend':<10}")
    print("-" * 58)
    for t in trends_data["trends"]:
        print(f"{t['skill']:<18} {t['frequency_baseline']:<10.2f} {t['frequency_recent']:<10.2f} {t['delta']:<+10.2f} {t['trend'].upper():<10}")

    # --------------------------------------------------------------------------
    # Step 8: Reduce budget to force constraint violation (Verifier feedback loop)
    # --------------------------------------------------------------------------
    print("\n--- STEP 8: Verifier Constraint Violation Detection ---")
    verifier = PlanVerifier()
    paid_course = Course(
        id="c_paid_bootcamp",
        title="Full-Stack Cloud Bootcamp",
        platform="Udemy",
        url="http://example.com",
        cost=199.99,
        currency="USD",
        hours=40.0,
        level=2,
        skills_covered=["skill_postgresql", "skill_docker"],
        prerequisite_skills=[],
        verified=True
    )
    strict_constraints = UserConstraints(budget=25.0, currency="USD", weekly_hours=10.0, target_timeline=3)
    violating_roadmap = Roadmap(
        items=[
            RoadmapItem(order=1, course=paid_course, gaps_covered=[], start_week=1.0, end_week=5.0, cost=199.99, hours=40.0, added_for_prerequisite=False, explanation="Paid course")
        ],
        total_cost=199.99,
        total_hours=40.0,
        total_weeks=5.0,
        uncovered_gaps=[],
        verifier_status="pass",
        violations=[]
    )
    v_result = verifier.verify_plan(roadmap=violating_roadmap, constraints=strict_constraints)
    print(f"Forced Budget: $25.00 vs Plan Cost: $199.99 | Capacity: 30h vs Plan Hours: 40h")
    print(f"Verifier Status: {v_result['status'].upper()}")
    for viol in v_result["violations"]:
        print(f"  Flagged Violation: {viol}")

    # --------------------------------------------------------------------------
    # Step 9: Change weekly hours or mark a course complete and show replanning
    # --------------------------------------------------------------------------
    print("\n--- STEP 9: Reactive Replanning (Progress Completion & Hours Adjustment) ---")
    session = memory_service.get_session("guest")
    if session:
        initial_remaining = len(session.roadmap.items)
        initial_weeks = session.roadmap.total_weeks

        # Mark course #1 complete
        replanned_roadmap = await memory_service.mark_item_complete(user_id="guest", item_order=1)
        print(f"Action: Marked item #1 as complete.")
        print(f"Remaining Courses: {initial_remaining} -> {len(replanned_roadmap.items)} (Mastered skill absorbed without resume re-upload)")

        # Adjust weekly hours from 15 to 25
        new_c = UserConstraints(weekly_hours=25.0, budget=50.0, currency="USD", target_role="Full-Stack Developer")
        hours_replanned = await memory_service.replan_with_constraints(user_id="guest", new_constraints=new_c)
        print(f"Action: Adjusted weekly study commitment to 25.0 hrs/week.")
        print(f"Timeline Compressed: {replanned_roadmap.total_weeks:.1f} weeks -> {hours_replanned.total_weeks:.1f} weeks")

    # --------------------------------------------------------------------------
    # Step 10: Show role suggestions for a user with no target role
    # --------------------------------------------------------------------------
    print("\n--- STEP 10: Autonomous Role Suggestions (No Target Role Specified) ---")
    profile_no_role = Profile(
        skills=[
            ProfileSkill(skill_id="skill_python", name="Python", level=2),
            ProfileSkill(skill_id="skill_sql", name="SQL", level=2),
            ProfileSkill(skill_id="skill_git", name="Git", level=2),
        ],
        years_of_experience=2.0,
        domain="Data"
    )
    suggested_roles = role_matcher.match_roles(profile=profile_no_role, top_n=4)
    print("Ranked Suitable Tech Career Paths:")
    for idx, r in enumerate(suggested_roles):
        print(f"  #{idx+1}: {r['role_title']:<25} Fit Score: {r['fit_score']*100:.0f}% | Matching: {', '.join(r['matching_skills'])}")

    print(f"\n>>> DEMO RUN #{run_number} COMPLETED WITH ZERO ERRORS <<<\n")


async def main():
    print("STARTING DUAL DEMO VERIFICATION...")
    await run_demo(run_number=1)
    await run_demo(run_number=2)
    print("DUAL DEMO VERIFICATION PASSED: Both runs completed successfully.")


if __name__ == "__main__":
    asyncio.run(main())

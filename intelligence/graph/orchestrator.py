"""
LangGraph Multi-Agent Orchestrator (M0).
Coordinates the complete Pathwise intelligence and planning lifecycle:
1. ProfilerAgent (M1): extracts structured skills & experience from resume
2. MarketIntelligenceAgent (M2): analyzes job postings (vector db + live search fallback)
3. GapAnalyzer (M3): dense cosine similarity matching and priority scoring
4. DeterministicPlanner (M4): knapsack selection, prerequisite resolution & topological sort
5. PlanVerifier (M5): validates 6 deterministic rules with bounded retries
6. ExplainerAgent (M6): generates grounded, evidence-based rationales
"""

import logging
from typing import Dict, Any, List, Optional, TypedDict
from datetime import datetime, timezone
from langgraph.graph import StateGraph, END

from contracts.schemas.profile import Profile
from contracts.schemas.role_requirement import RoleRequirement
from contracts.schemas.gap import Gap
from contracts.schemas.roadmap import Roadmap
from contracts.schemas.constraints import Constraints, UserConstraints
from intelligence.agents.profile_agent import ProfileAgent
from intelligence.agents.market_agent import MarketIntelligenceAgent
from intelligence.skills.gap_analyzer import GapAnalyzer
from intelligence.agents.explainer_agent import ExplainerAgent
from backend.app.planner.optimizer import DeterministicPlanner
from backend.app.planner.verifier import PlanVerifier
from backend.app.catalog.catalog_db import catalog_db
from intelligence.skills.taxonomy import SkillTaxonomy

logger = logging.getLogger(__name__)


class GraphState(TypedDict, total=False):
    resume_text: str
    target_role: str
    constraints: Any
    user_constraints: Any
    profile: Optional[Profile]
    requirements: List[RoleRequirement]
    market_source: str
    fallback_reason: Optional[str]
    gaps: List[Gap]
    roadmap: Optional[Roadmap]
    retry_count: int
    verification_passed: bool
    verification_violations: List[str]
    events: List[Dict[str, Any]]
    error: Optional[str]


def create_orchestrator(
    profile_agent: Optional[ProfileAgent] = None,
    market_agent: Optional[MarketIntelligenceAgent] = None,
    gap_analyzer: Optional[GapAnalyzer] = None,
    planner: Optional[DeterministicPlanner] = None,
    verifier: Optional[PlanVerifier] = None,
    explainer: Optional[ExplainerAgent] = None,
):
    """Factory creating and compiling the M0 LangGraph workflow."""
    from backend.app.database.posting_search import SupabasePostingSearch
    p_agent = profile_agent or ProfileAgent()
    m_agent = market_agent or MarketIntelligenceAgent(posting_search=SupabasePostingSearch())
    g_analyzer = gap_analyzer or GapAnalyzer()
    d_planner = planner or DeterministicPlanner(catalog=catalog_db)
    p_verifier = verifier or PlanVerifier()
    e_agent = explainer or ExplainerAgent()

    # Define Node Functions
    async def profiler_node(state: GraphState) -> Dict[str, Any]:
        events = list(state.get("events", []))
        resume_text = state.get("resume_text", "")
        target_role = state.get("target_role", "").strip()

        profile = await p_agent.extract_profile(resume_text)
        if not target_role and profile.domain:
            target_role = profile.domain

        events.append({
            "step": "profiler",
            "message": f"Extracted {len(profile.skills)} skills and {profile.years_of_experience:.1f} years experience.",
            "data": {"skills_count": len(profile.skills), "domain": profile.domain},
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        return {
            "profile": profile,
            "target_role": target_role or "Full-Stack Developer",
            "events": events
        }

    async def market_intelligence_node(state: GraphState) -> Dict[str, Any]:
        events = list(state.get("events", []))
        target_role = state.get("target_role", "Full-Stack Developer")

        market_res = await m_agent.get_role_requirements(target_role)
        requirements: List[RoleRequirement] = market_res.get("requirements", [])
        source = market_res.get("source", "cache")
        fallback_reason = market_res.get("fallback_reason")

        msg = f"Retrieved {len(requirements)} requirements for {target_role} (source: {source})."
        if fallback_reason:
            msg += f" Note: {fallback_reason}"

        events.append({
            "step": "market_intelligence",
            "message": msg,
            "data": {
                "source": source,
                "requirements_count": len(requirements),
                "posting_count": market_res.get("posting_count", 0)
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        return {
            "requirements": requirements,
            "market_source": source,
            "fallback_reason": fallback_reason,
            "events": events
        }

    async def gap_analyzer_node(state: GraphState) -> Dict[str, Any]:
        events = list(state.get("events", []))
        profile: Profile = state.get("profile") or Profile(skills=[], unmapped_skills=[], years_of_experience=0, years_per_skill={}, domain="")
        requirements: List[RoleRequirement] = state.get("requirements", [])

        gaps = g_analyzer.analyze_gaps(profile=profile, requirements=requirements)

        events.append({
            "step": "gap_analyzer",
            "message": f"Identified {len(gaps)} skill gaps for target role {state.get('target_role')}.",
            "data": {
                "gaps_count": len(gaps),
                "top_gaps": [g.skill_name for g in gaps[:5]]
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        return {
            "gaps": gaps,
            "events": events
        }

    async def planner_node(state: GraphState) -> Dict[str, Any]:
        events = list(state.get("events", []))
        gaps: List[Gap] = state.get("gaps", [])
        constraints_dict = state.get("constraints", {})

        if isinstance(constraints_dict, UserConstraints):
            user_constraints = constraints_dict
        elif isinstance(constraints_dict, Constraints):
            user_constraints = UserConstraints(
                weekly_hours=constraints_dict.weekly_hours,
                budget=constraints_dict.budget,
                currency=constraints_dict.currency,
                target_timeline=constraints_dict.target_timeline
            )
        elif isinstance(constraints_dict, dict):
            user_constraints = UserConstraints(
                weekly_hours=float(constraints_dict.get("weekly_hours", 10.0)),
                budget=float(constraints_dict.get("max_budget", constraints_dict.get("budget", 0.0))),
                currency=constraints_dict.get("currency", "USD"),
                target_timeline=constraints_dict.get("timeline_weeks", constraints_dict.get("target_timeline"))
            )
        else:
            user_constraints = UserConstraints(weekly_hours=10.0, budget=0.0, currency="USD")

        profile = state.get("profile")
        user_skills = [s.name for s in profile.skills] if profile else []

        # Dynamically hunt and register courses for any novel skill gaps via live web search
        from intelligence.agents.course_hunter import course_hunter
        try:
            await course_hunter.hunt_and_register_courses(gaps=gaps, currency=user_constraints.currency)
        except Exception as e:
            logger.warning(f"LiveCourseHunter execution encountered non-fatal error: {e}")

        roadmap = d_planner.generate_plan(
            gaps=gaps,
            constraints=user_constraints,
            user_skills=user_skills
        )

        events.append({
            "step": "planner",
            "message": f"Planned {len(roadmap.items)} learning modules ({roadmap.total_hours:.1f} hours over {roadmap.total_weeks:.1f} weeks, cost: {roadmap.total_cost:g} {user_constraints.currency}).",
            "data": {
                "items_count": len(roadmap.items),
                "total_hours": roadmap.total_hours,
                "total_weeks": roadmap.total_weeks,
                "total_cost": roadmap.total_cost,
                "uncovered_gaps_count": len(roadmap.uncovered_gaps)
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        return {
            "roadmap": roadmap,
            "user_constraints": user_constraints,
            "events": events
        }

    async def verifier_node(state: GraphState) -> Dict[str, Any]:
        events = list(state.get("events", []))
        roadmap: Roadmap = state["roadmap"]
        user_constraints: UserConstraints = state.get("user_constraints") or UserConstraints(weekly_hours=10.0, budget=0.0, currency="USD")
        retry_count = state.get("retry_count", 0)

        verification_result = p_verifier.verify_plan(roadmap=roadmap, constraints=user_constraints)
        passed = verification_result.get("passed", False) or verification_result.get("status") == "pass"
        violations = verification_result.get("violations", [])

        if not passed:
            retry_count += 1
            roadmap.verifier_status = "violations_flagged"
            roadmap.violations = violations
            msg = f"Verifier flagged {len(violations)} rule violation(s) (retry {retry_count}/3): {'; '.join(violations)}"
        else:
            roadmap.verifier_status = "pass"
            roadmap.violations = []
            msg = "Verifier passed all 6 deterministic rules without violations."

        events.append({
            "step": "verifier",
            "message": msg,
            "data": {"passed": passed, "violations": violations, "retry_count": retry_count},
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        return {
            "roadmap": roadmap,
            "verification_passed": passed,
            "verification_violations": violations,
            "retry_count": retry_count,
            "events": events
        }

    def should_replan(state: GraphState) -> str:
        passed = state.get("verification_passed", False)
        retry_count = state.get("retry_count", 0)
        if passed or retry_count >= 3:
            return "explainer"
        return "planner"

    async def explainer_node(state: GraphState) -> Dict[str, Any]:
        events = list(state.get("events", []))
        roadmap: Roadmap = state["roadmap"]
        target_role = state.get("target_role", "Target Role")
        u_const = state.get("user_constraints") or UserConstraints(weekly_hours=10.0, budget=0.0, currency="USD")
        constraints_obj = Constraints(
            weekly_hours=u_const.weekly_hours,
            budget=u_const.budget,
            currency=u_const.currency,
            target_timeline=u_const.target_timeline
        )

        explained_roadmap = await e_agent.explain_roadmap(
            roadmap=roadmap,
            target_role=target_role,
            constraints=constraints_obj
        )

        events.append({
            "step": "explainer",
            "message": f"Generated grounded evidence-based rationales for all {len(explained_roadmap.items)} roadmap items.",
            "data": {"explained_count": len(explained_roadmap.items)},
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        return {
            "roadmap": explained_roadmap,
            "events": events
        }

    # Build Graph
    workflow = StateGraph(GraphState)
    workflow.add_node("profiler", profiler_node)
    workflow.add_node("market_intelligence", market_intelligence_node)
    workflow.add_node("gap_analyzer", gap_analyzer_node)
    workflow.add_node("planner", planner_node)
    workflow.add_node("verifier", verifier_node)
    workflow.add_node("explainer", explainer_node)

    workflow.set_entry_point("profiler")
    workflow.add_edge("profiler", "market_intelligence")
    workflow.add_edge("market_intelligence", "gap_analyzer")
    workflow.add_edge("gap_analyzer", "planner")
    workflow.add_edge("planner", "verifier")
    workflow.add_conditional_edges(
        "verifier",
        should_replan,
        {
            "planner": "planner",
            "explainer": "explainer"
        }
    )
    workflow.add_edge("explainer", END)

    return workflow.compile()

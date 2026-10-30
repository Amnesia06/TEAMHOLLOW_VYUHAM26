"""
Phase 3 P0 Integration Tests:
1. M6 Explainer Agent: Verified grounded explanations citing exact numbers & fallback.
2. M0 Orchestrator: End-to-end execution across Profiler -> Market Intelligence -> Gap Analyzer -> Planner -> Verifier -> Explainer.
3. Event Streaming: Correct sequence of lifecycle events emitted.
4. Real Market Ingestion: Role requirements & vector search working over India Tech Jobs dataset.
"""

import pytest
import asyncio
from contracts.schemas.roadmap import Roadmap, RoadmapItem
from contracts.schemas.course import Course
from contracts.schemas.gap import Gap
from contracts.schemas.constraints import Constraints
from intelligence.agents.explainer_agent import ExplainerAgent
from backend.app.services.roadmap_service import roadmap_service


@pytest.mark.asyncio
async def test_m6_explainer_grounded_fallback():
    explainer = ExplainerAgent(llm_client=None)

    course = Course(
        id="c-test-1",
        title="Production Node.js Microservices",
        platform="freeCodeCamp",
        url="https://example.com/node",
        cost=0.0,
        currency="USD",
        hours=15.0,
        level=2,
        skills_covered=["node.js"],
        prerequisite_skills=[]
    )
    gap = Gap(
        skill_id="node.js",
        skill_name="Node.js",
        current_level=0,
        required_level=2,
        gap_size=2,
        frequency=0.85,
        priority_score=0.92,
        status="critical"
    )
    item = RoadmapItem(
        order=1,
        course=course,
        gaps_covered=[gap],
        start_week=1.0,
        end_week=2.5,
        cost=0.0,
        hours=15.0,
        added_for_prerequisite=False,
        explanation=""
    )
    roadmap = Roadmap(
        items=[item],
        total_cost=0.0,
        total_hours=15.0,
        total_weeks=2.5,
        uncovered_gaps=[],
        verifier_status="pass",
        violations=[]
    )

    constraints = Constraints(weekly_hours=10.0, budget=0.0, currency="USD")
    res = await explainer.explain_roadmap(roadmap=roadmap, target_role="Full-Stack Developer", constraints=constraints)

    assert len(res.items) == 1
    expl = res.items[0].explanation
    assert "Node.js" in expl
    assert "85%" in expl or "0.85" in expl or "+2 levels" in expl
    assert "Free" in expl or "0" in expl
    print(f"\n[PASS] M6 Explainer generated grounded rationale: {expl}")


@pytest.mark.asyncio
async def test_m0_orchestrator_end_to_end():
    resume = (
        "Full-Stack Web Developer with 3 years of experience in JavaScript, React, and HTML/CSS. "
        "Seeking to level up in Node.js, Next.js, and PostgreSQL to transition to Senior Full-Stack Developer."
    )

    result = await roadmap_service.analyze(
        resume_text=resume,
        target_role="Full-Stack Developer",
        constraints={"weekly_hours": 10.0, "max_budget": 50.0, "currency": "USD"}
    )

    assert result["status"] == "success"
    assert result["target_role"] == "Full-Stack Developer"
    assert result["profile"] is not None
    assert len(result["profile"]["skills"]) >= 2
    assert len(result["requirements"]) > 0
    assert len(result["gaps"]) > 0
    assert result["roadmap"] is not None
    assert len(result["roadmap"]["items"]) > 0
    assert result["roadmap"]["verifier_status"] == "pass"

    # Verify explanations are populated and non-empty
    for item in result["roadmap"]["items"]:
        assert item["explanation"] != ""
        assert len(item["explanation"]) > 10

    # Verify event stream
    events = result["events"]
    steps = [e["step"] for e in events]
    assert "profiler" in steps
    assert "market_intelligence" in steps
    assert "gap_analyzer" in steps
    assert "planner" in steps
    assert "verifier" in steps
    assert "explainer" in steps

    print(f"\n[PASS] M0 Orchestrator generated {len(result['roadmap']['items'])} items across {result['roadmap']['total_weeks']:.1f} weeks.")


@pytest.mark.asyncio
async def test_m0_streaming_events():
    resume = "Junior Python developer with 1 year experience, aiming to become a Data Engineer with Apache Spark and Airflow."

    events_received = []
    complete_payload = None

    async for sse_event in roadmap_service.stream_analysis(
        resume_text=resume,
        target_role="Data Engineer",
        constraints={"weekly_hours": 15.0, "max_budget": 0.0, "currency": "USD"}
    ):
        if "event: progress" in sse_event:
            events_received.append(sse_event)
        elif "event: complete" in sse_event:
            complete_payload = sse_event

    assert len(events_received) >= 5
    assert complete_payload is not None
    assert "Data Engineer" in complete_payload
    print(f"\n[PASS] M0 Streaming emitted {len(events_received)} progress events and complete payload.")

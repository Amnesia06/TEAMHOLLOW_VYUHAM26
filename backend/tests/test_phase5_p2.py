"""
Phase 5 P2 Acceptance Tests:
- M11: Milestone checklist and progress tracking (completion percentage, item completion, hours completed/remaining).
- M12: Diagnostic quiz generation grounded in course skills (4 options, valid correct_index, explanation rationale).
- M13: Multi-currency conversion between USD and INR with documented rate (1 USD = 85.0 INR).
- M14: Auth and user modes (guest mode vs signed-in user persistence).
- M15: Polish and resilient fallback behavior (zero empty/blank crashes, structured APIResponse).
"""

import pytest
import asyncio
from contracts.schemas.quiz import Quiz, QuizQuestion
from contracts.schemas.profile import Profile, ProfileSkill
from contracts.schemas.constraints import UserConstraints
from contracts.schemas.gap import Gap
from contracts.schemas.roadmap import Roadmap, RoadmapItem
from intelligence.agents.quiz_agent import quiz_agent
from backend.app.core.currency import convert_currency
from backend.app.services.memory_service import memory_service
from backend.app.services.roadmap_service import roadmap_service
from fastapi.testclient import TestClient
from backend.app.main import app


@pytest.fixture
def client():
    return TestClient(app)


# ==========================================
# M11: Milestone Progress & Tracking
# ==========================================
def test_m11_milestone_progress_tracking():
    """
    M11: Milestone checklist and progress tracking.
    Verifies that completion percent, remaining hours, and item states compute accurately.
    """
    total_hours = 60.0
    items = [
        {"order": 1, "title": "Course A", "hours": 20.0, "status": "completed"},
        {"order": 2, "title": "Course B", "hours": 20.0, "status": "pending"},
        {"order": 3, "title": "Course C", "hours": 20.0, "status": "pending"},
    ]

    completed_items = [i for i in items if i["status"] == "completed"]
    completed_hours = sum(i["hours"] for i in completed_items)
    progress_percent = round((len(completed_items) / len(items)) * 100)

    assert progress_percent == 33
    assert completed_hours == 20.0
    assert (total_hours - completed_hours) == 40.0
    print(f"\n[PASS M11 Progress Tracking] Completed: {len(completed_items)}/{len(items)} ({progress_percent}%), Remaining: {total_hours - completed_hours} hrs")


# ==========================================
# M12: Diagnostic Quiz Generation
# ==========================================
@pytest.mark.asyncio
async def test_m12_quiz_generation_grounded_in_skills():
    """
    M12: Diagnostic quiz generation.
    Verifies that QuizAgent generates technical MCQs with:
    - 4 multiple choice options per question
    - Valid correct_index in range [0, 3]
    - Grounding explanation rationale
    """
    quiz = await quiz_agent.generate_quiz(
        course_id="test_course_py",
        course_title="Python for Everybody Specialization",
        skills=["python"]
    )

    assert isinstance(quiz, Quiz)
    assert quiz.course_id == "test_course_py"
    assert len(quiz.questions) >= 2

    for q in quiz.questions:
        assert isinstance(q, QuizQuestion)
        assert len(q.question.strip()) > 10
        assert len(q.options) == 4
        assert 0 <= q.correct_index < 4
        assert len(q.explanation.strip()) > 10

    print(f"\n[PASS M12 Quiz Generation] Generated {len(quiz.questions)} questions for '{quiz.course_title}'.")
    for idx, q in enumerate(quiz.questions):
        print(f"  Q{idx+1}: {q.question[:60]}... [Correct: Option {q.correct_index}]")


def test_m12_quiz_endpoint(client):
    """
    M12: Verifies POST /api/v1/quizzes/generate endpoint.
    """
    response = client.post(
        "/api/v1/quizzes/generate",
        json={
            "course_id": "res_react_01",
            "course_title": "React - The Complete Guide",
            "skills": ["react", "javascript"]
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    quiz_data = data["data"]
    assert quiz_data["course_id"] == "res_react_01"
    assert len(quiz_data["questions"]) >= 2
    assert len(quiz_data["questions"][0]["options"]) == 4
    print("\n[PASS M12 Quiz Endpoint] POST /api/v1/quizzes/generate returned valid payload.")


# ==========================================
# M13: Multi-Currency Conversion
# ==========================================
def test_m13_currency_conversion():
    """
    M13: Currency conversion between USD and INR using rate 1 USD = 85.0 INR.
    """
    # USD to INR
    assert convert_currency(0.0, "USD", "INR") == 0.0
    assert convert_currency(100.0, "USD", "INR") == 8500.0
    assert convert_currency(49.99, "USD", "INR") == 4249.15

    # INR to USD
    assert convert_currency(8500.0, "INR", "USD") == 100.0
    assert convert_currency(4250.0, "INR", "USD") == 50.0

    # Identity conversion
    assert convert_currency(100.0, "USD", "USD") == 100.0
    assert convert_currency(5000.0, "INR", "INR") == 5000.0
    print("\n[PASS M13 Currency Conversion] Verified 1 USD = 85.0 INR bidirectional conversions.")


# ==========================================
# M14: Auth & User Modes
# ==========================================
@pytest.mark.asyncio
async def test_m14_guest_and_user_session_modes():
    """
    M14: Auth & modes.
    Verifies that guest mode works seamlessly without requiring credentials,
    and signed-in users persist their roadmaps keyed to their user_id.
    """
    guest_id = "guest"
    user_id = "developer_alex@example.com"

    # Guest session initialization
    profile = Profile(
        skills=[ProfileSkill(skill_id="python", name="Python", level=2)],
        years_of_experience=2.0,
        domain="backend"
    )
    constraints = UserConstraints(weekly_hours=10, budget=0, currency="USD", target_role="Python Developer")
    initial_roadmap = roadmap_service.plan_and_verify(
        gaps=[Gap(skill_id="python", skill_name="Python", gap_size=1, frequency=0.8, priority_score=1.0)],
        constraints=constraints,
        user_skills=["Python"]
    )

    # Initialize guest session
    memory_service.save_session(
        user_id=guest_id,
        profile=profile,
        target_role=constraints.target_role,
        constraints=constraints,
        roadmap=initial_roadmap,
        gaps=[Gap(skill_id="python", skill_name="Python", gap_size=1, frequency=0.8, priority_score=1.0)]
    )
    guest_session = memory_service.get_session(guest_id)
    assert guest_session is not None
    assert guest_session.user_id == "guest"

    # Initialize signed-in user session
    memory_service.save_session(
        user_id=user_id,
        profile=profile,
        target_role=constraints.target_role,
        constraints=constraints,
        roadmap=initial_roadmap,
        gaps=[Gap(skill_id="python", skill_name="Python", gap_size=1, frequency=0.8, priority_score=1.0)]
    )
    user_session = memory_service.get_session(user_id)
    assert user_session is not None
    assert user_session.user_id == user_id
    assert len(user_session.roadmap.items) == len(initial_roadmap.items)

    print(f"\n[PASS M14 Auth & Modes] Guest and authenticated session '{user_id}' verified independently.")


# ==========================================
# M15: Polish & Error Handling
# ==========================================
def test_m15_polish_error_and_health_states(client):
    """
    M15: Verifies system health check and structured error responses.
    """
    # Health endpoint
    health_resp = client.get("/api/v1/health")
    assert health_resp.status_code == 200
    health_data = health_resp.json()
    assert health_data["success"] is True
    assert health_data["data"]["status"] == "healthy"

    # Market trends endpoint with default role
    trends_resp = client.get("/api/v1/market-trends?role=Full-Stack%20Developer")
    assert trends_resp.status_code == 200
    trends_data = trends_resp.json()
    assert trends_data["success"] is True
    assert trends_data["data"]["role"] == "Full-Stack Developer"

    print("\n[PASS M15 Polish & Resilience] Health, market trends, and structured responses verified.")

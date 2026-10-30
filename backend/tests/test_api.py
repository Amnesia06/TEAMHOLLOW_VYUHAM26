"""
Backend API endpoint integration tests using FastAPI TestClient.
"""

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is True
    assert json_data["data"]["status"] == "healthy"
    assert "demo_mode" in json_data["data"]


def test_chat_turn():
    response = client.post("/api/v1/chat", json={
        "message": "I'm a computer science graduate interested in AI and robotics. I know Python and C++, and I built an autonomous GPS rover project.",
        "session_id": "test_session_101"
    })
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is True
    res_data = json_data["data"]
    assert "message" in res_data
    assert len(res_data["agent_activity"]) > 0
    assert len(res_data["ui_components"]) > 0
    assert len(res_data["follow_up_suggestions"]) > 0


def test_get_profile():
    response = client.get("/api/v1/profile/00000000-0000-0000-0000-000000000001")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is True
    assert "skills" in json_data["data"]


def test_career_recommendations():
    response = client.get("/api/v1/careers/recommendations?user_id=00000000-0000-0000-0000-000000000001")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is True
    recs = json_data["data"]
    assert len(recs) > 0
    top = recs[0]
    assert "match_score" in top
    assert "matching_skills" in top
    assert "missing_skills" in top


def test_roadmap_generation():
    response = client.post("/api/v1/roadmap/generate", json={
        "target_role": "Robotics Software Engineer",
        "constraints": {
            "hours_per_week": 5,
            "monthly_budget": 0
        }
    })
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is True
    roadmap = json_data["data"]
    assert roadmap["total_estimated_cost"] == 0
    assert len(roadmap["milestones"]) > 0


def test_resources_query():
    response = client.get("/api/v1/resources?skill=Python")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is True
    assert len(json_data["data"]) > 0


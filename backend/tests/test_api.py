"""
Backend API endpoint tests using FastAPI TestClient.
"""

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_root_index():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"


def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is True
    assert "status" in json_data["data"]
    assert "services" in json_data["data"]
    assert "demo_mode" not in json_data["data"]


def test_catalog_courses_endpoint():
    # Test all courses
    res_all = client.get("/api/v1/catalog/courses")
    assert res_all.status_code == 200
    all_courses = res_all.json()["data"]
    assert len(all_courses) > 70

    # Test paid courses retrieval
    res_paid = client.get("/api/v1/catalog/courses?filter_type=paid")
    assert res_paid.status_code == 200
    paid_courses = res_paid.json()["data"]
    assert len(paid_courses) > 0
    assert all(c["cost"] > 0 for c in paid_courses)

    # Test free courses retrieval
    res_free = client.get("/api/v1/catalog/courses?filter_type=free")
    assert res_free.status_code == 200
    free_courses = res_free.json()["data"]
    assert len(free_courses) > 0
    assert all(c["cost"] == 0 for c in free_courses)

    # Test filtering by YouTube platform
    res_yt = client.get("/api/v1/catalog/courses?platform=youtube")
    assert res_yt.status_code == 200
    yt_courses = res_yt.json()["data"]
    assert len(yt_courses) > 0
    assert all("youtube" in c["platform"].lower() for c in yt_courses)

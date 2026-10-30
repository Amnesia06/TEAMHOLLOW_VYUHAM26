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

from fastapi.testclient import TestClient

from fastapi_backend.main import app


def test_cn_health():
    client = TestClient(app)
    resp = client.get("/健康")
    assert resp.status_code == 200
    assert resp.json().get("status") == "ok"

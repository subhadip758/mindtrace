from fastapi.testclient import TestClient
import pytest
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"

def test_user_registration_and_login():
    test_email = "test_user_mindtrace@example.com"
    test_password = "securepassword123"
    
    # Register
    res = client.post("/api/v1/auth/register", json={"email": test_email, "password": test_password})
    assert res.status_code in [200, 400] # 400 if already created in prior run
    
    # Login
    res_login = client.post("/api/v1/auth/login", json={"email": test_email, "password": test_password})
    assert res_login.status_code == 200
    token_data = res_login.json()
    assert "access_token" in token_data
    token = token_data["access_token"]
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Check Profile
    res_me = client.get("/api/v1/auth/me", headers=headers)
    assert res_me.status_code == 200

def test_insufficient_data_handling():
    test_email = "empty_user_mindtrace@example.com"
    test_password = "password123"
    
    res = client.post("/api/v1/auth/register", json={"email": test_email, "password": test_password})
    if res.status_code != 200:
        res = client.post("/api/v1/auth/login", json={"email": test_email, "password": test_password})
        
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Request fingerprint with 0 records
    res_fp = client.get("/api/v1/patterns/fingerprint", headers=headers)
    assert res_fp.status_code == 200
    fp_data = res_fp.json()
    assert fp_data["sufficient_data"] == False
    assert "Not enough real data yet" in fp_data["message"]

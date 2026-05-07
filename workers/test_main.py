from fastapi.testclient import TestClient
from main import app
import io

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "enclave": "mock"}

def test_process_document():
    # Mocking a file upload
    file_content = b"Mock confidential data"
    file_name = "test_document.txt"
    files = {"file": (file_name, io.BytesIO(file_content), "text/plain")}
    data = {"tenant_id": "tenant-123"}

    response = client.post("/api/v1/process", files=files, data=data)

    assert response.status_code == 200
    json_response = response.json()
    assert json_response["tenant_id"] == "tenant-123"
    assert json_response["filename"] == file_name
    assert "document_hash" in json_response
    assert json_response["results"]["status"] == "success"

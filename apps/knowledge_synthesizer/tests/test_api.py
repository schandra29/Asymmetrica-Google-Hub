import pytest
from fastapi.testclient import TestClient
import sys
import os
import asyncio

# Ensure the project root is in the Python path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..')))

from apps.knowledge_synthesizer.main import app
from apps.knowledge_synthesizer.synthesis_engine import tasks_db

@pytest.fixture
def client():
    """Provides a TestClient instance for making API requests."""
    return TestClient(app)

def test_root_endpoint(client: TestClient):
    """
    Tests that the root endpoint successfully serves the frontend's index.html.
    @regime: STABILIZATION (Core application serving)
    """
    response = client.get("/")
    assert response.status_code == 200
    assert "text/html" in response.headers['content-type']
    assert "<title>Asymmetrica Knowledge Synthesizer</title>" in response.text

def test_start_synthesis_endpoint(client: TestClient):
    """
    Tests the /synthesize endpoint to ensure it starts a task and returns a task ID.
    @regime: STABILIZATION (Critical path for starting a job)
    """
    # Arrange
    request_payload = {
        "directory": "/test/dir",
        "goal": "stabilize understanding of API testing"
    }

    # Act
    response = client.post("/synthesize", json=request_payload)

    # Assert
    assert response.status_code == 200
    response_data = response.json()
    assert "task_id" in response_data
    task_id = response_data['task_id']
    assert task_id in tasks_db # Check that the task was added to our in-memory DB

def test_full_synthesis_workflow_via_api(client: TestClient):
    """
    Tests the full, end-to-end workflow from starting a task to completion
    by calling the synchronous endpoint and then verifying the results.
    @regime: STABILIZATION (Complete end-to-end user journey)
    """
    # 1. Start the synthesis task. Since it's now synchronous, this will block until complete.
    start_response = client.post("/synthesize", json={"directory": "/test/e2e", "goal": "end-to-end test"})
    assert start_response.status_code == 200
    task_id = start_response.json()['task_id']

    # 2. Verify the final status is 'complete'
    status_response = client.get(f"/status/{task_id}")
    assert status_response.status_code == 200
    status_data = status_response.json()
    assert status_data["status"] == "complete"
    assert status_data["progress"] == 100.0

    # 3. Fetch the results
    results_response = client.get(f"/results/{task_id}")
    assert results_response.status_code == 200
    results_data = results_response.json()

    # 4. Assert the structure of the results payload
    assert results_data["task_id"] == task_id
    assert "classification" in results_data
    assert "batch_plan" in results_data
    assert "results" in results_data
    assert "synthesized_summaries" in results_data["results"]
    # The real WilliamsOptimizer calculates 3 batches for 500 documents.
    assert len(results_data["results"]["synthesized_summaries"]) == 3

def test_status_for_nonexistent_task(client: TestClient):
    """
    Tests that the status endpoint handles requests for invalid task IDs gracefully.
    @regime: EXPLORATION (Failure path testing)
    """
    response = client.get("/status/invalid-task-id")
    assert response.status_code == 200 # The endpoint itself works
    data = response.json()
    assert data["status"] == "not_found"
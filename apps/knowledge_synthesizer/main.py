from fastapi import FastAPI
from pydantic import BaseModel
import sys
import os

# Ensure the project root is in the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from core.defensekit.three_regime_planner import ThreeRegimePlanner
from core.defensekit.williams_optimizer import WilliamsOptimizer
from core.defensekit.harmonic_timer import HarmonicTimer
from core.defensekit.regime_aware_cache import RegimeAwareCache


from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI(
    title="Asymmetrica Knowledge Synthesizer",
    description="An application to synthesize knowledge from documents using the Asymmetrica DefenseKit.",
    version="1.0.0"
)

# Mount the 'static' directory to serve files like app.js
app.mount("/static", StaticFiles(directory="apps/knowledge_synthesizer/static"), name="static")

class SynthesisRequest(BaseModel):
    directory: str
    goal: str

class SynthesisStatus(BaseModel):
    status: str
    progress: float
    details: str

class SynthesisResult(BaseModel):
    knowledge_graph: dict

from .synthesis_engine import engine, tasks_db

@app.post("/synthesize")
async def start_synthesis(request: SynthesisRequest):
    """
    Starts the knowledge synthesis process for a given directory and goal.
    """
    task_id = await engine.start_new_synthesis(request)
    return {"task_id": task_id}


@app.get("/status/{task_id}", response_model=SynthesisStatus)
async def get_synthesis_status(task_id: str):
    """
    Retrieves the status of an ongoing synthesis task.
    """
    task = tasks_db.get(task_id)
    if not task:
        return SynthesisStatus(status="not_found", progress=0, details="Task not found.")

    return SynthesisStatus(
        status=task.status,
        progress=task.progress,
        details=task.details
    )


@app.get("/results/{task_id}")
async def get_synthesis_results(task_id: str):
    """
    Retrieves the final results of a completed synthesis task.
    """
    task = tasks_db.get(task_id)
    if not task:
        return {"error": "Task not found."}

    if task.status != "complete":
        return {"error": "Task is not yet complete."}

    return {
        "task_id": task_id,
        "classification": task.classification,
        "batch_plan": task.batch_plan,
        "results": task.result,
    }

@app.get("/", include_in_schema=False)
async def root():
    return FileResponse("apps/knowledge_synthesizer/static/index.html")
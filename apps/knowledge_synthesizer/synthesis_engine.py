import asyncio
import os
import time
import uuid
from typing import List, Dict, Any, Optional

from core.defensekit.three_regime_planner import ThreeRegimePlanner, TaskRegime, TaskClassification
from core.defensekit.williams_optimizer import WilliamsOptimizer, BatchOptimizationResult
from core.defensekit.harmonic_timer import HarmonicTimer, RetryResult
from core.defensekit.regime_aware_cache import RegimeAwareCache
from core.vedic.vedic_statistics import harmonic_mean, dharma_index, attractor_analysis

# In-memory storage for tasks. In a real app, this would be a database or a persistent store.
tasks_db: Dict[str, "SynthesisTask"] = {}


class SynthesisTask:
    """Represents a single synthesis task and its state."""
    def __init__(self, request):
        self.task_id = str(uuid.uuid4())
        self.request = request
        self.status = "pending"
        self.progress = 0.0
        self.details = "Task initialized."
        self.result: Dict[str, Any] = {}
        self.classification: Optional[TaskClassification] = None
        self.batch_plan: Optional[BatchOptimizationResult] = None
        self.failures = 0

        # VEDIC ENHANCEMENT: Track quality metrics
        self.batch_quality_history: List[float] = []
        self.overall_dharma: Optional[float] = None
        self.convergence_rate: Optional[float] = None
        self.quality_config: Optional[Dict] = None
        self.current_stability: Optional[float] = None

    def update_status(self, status: str, progress: float, details: str, stability: Optional[float] = None):
        """
        Update task status with optional stability metric

        Args:
            status: Status string (pending, running, complete, failed, warning)
            progress: Percentage complete (0-100)
            details: Human-readable status message
            stability: Optional Dharma index (0-1) for real-time quality feedback
        """
        self.status = status
        self.progress = progress
        self.details = details

        # VEDIC ENHANCEMENT: Store stability for frontend display
        if stability is not None:
            self.current_stability = stability
        elif hasattr(self, 'batch_quality_history') and self.batch_quality_history:
            # Auto-calculate if not provided
            from core.vedic.vedic_statistics import dharma_index
            self.current_stability = dharma_index(self.batch_quality_history)
        else:
            self.current_stability = None

        stability_str = f" | Stability: {self.current_stability:.3f}" if self.current_stability else ""
        print(f"Task {self.task_id}: {status} - {progress}%{stability_str} - {details}") # For console logging


class SynthesisEngine:
    """
    The core engine that orchestrates the DefenseKit components to synthesize knowledge.
    """
    def __init__(self):
        self.planner = ThreeRegimePlanner()
        self.optimizer = WilliamsOptimizer()
        self.timer = HarmonicTimer()
        self.cache = RegimeAwareCache(max_size=256)
        print("SynthesisEngine initialized with DefenseKit components.")

    async def start_new_synthesis(self, request) -> str:
        """Initializes and runs a new synthesis task synchronously."""
        task = SynthesisTask(request)
        tasks_db[task.task_id] = task

        # Run the synthesis process synchronously for reliable testing.
        await self.run_synthesis(task)

        return task.task_id

    async def run_synthesis(self, task: SynthesisTask):
        """The main synthesis workflow."""
        try:
            task.update_status("running", 5.0, "Classifying task goal...")
            await asyncio.sleep(0.01) # Use a minimal sleep for testing

            # 1. Classify the task using the ThreeRegimePlanner
            task.classification = self.planner.classify_task(
                task_name="knowledge_synthesis",
                keywords=task.request.goal.split(),
                description=task.request.goal
            )
            regime = task.classification.regime

            # VEDIC ENHANCEMENT: Select quality metric based on regime
            regime_quality_config = {
                TaskRegime.EXPLORATION: {
                    "metric": "harmonic_mean",
                    "threshold": 0.75,
                    "rationale": "Conservative - catch all outliers",
                    "stability_target": 0.70
                },
                TaskRegime.OPTIMIZATION: {
                    "metric": "attractor_analysis",
                    "threshold": 0.80,
                    "rationale": "Track convergence toward optimal",
                    "stability_target": 0.80
                },
                TaskRegime.STABILIZATION: {
                    "metric": "dharma_index",
                    "threshold": 0.90,
                    "rationale": "Require consistency, minimal variance",
                    "stability_target": 0.90
                }
            }

            quality_config = regime_quality_config.get(regime, regime_quality_config[TaskRegime.OPTIMIZATION])
            task.quality_config = quality_config  # Store for later use

            task.update_status(
                "running",
                10.0,
                f"Task classified into '{regime.value}' regime. "
                f"Quality metric: {quality_config['metric']} (threshold: {quality_config['threshold']})"
            )
            await asyncio.sleep(0.01)

            # 2. Simulate getting documents and use WilliamsOptimizer
            # In a real app, we'd use os.listdir(task.request.directory)
            mock_documents = [f"doc_{i+1}.pdf" for i in range(500)] # Simulate 500 documents
            task.update_status("running", 20.0, f"Found {len(mock_documents)} documents. Optimizing batch plan...")
            await asyncio.sleep(0.01)

            task.batch_plan = self.optimizer.calculate(len(mock_documents))
            task.update_status("running", 30.0, f"Batch plan created: {task.batch_plan.num_batches} batches of ~{task.batch_plan.optimal_batch_size} docs.")
            await asyncio.sleep(0.01)

            # 3. Process documents in batches
            processed_docs_count = 0
            for i in range(task.batch_plan.num_batches):
                current_progress = 30.0 + (i / task.batch_plan.num_batches) * 60.0
                # Initial status update for the batch
                task.update_status("running", current_progress, f"Processing batch {i+1}/{task.batch_plan.num_batches}...")


                # Simulate a resilient API call for each doc in the batch
                # In a real app, this would be a real API call (e.g., to a summarization service)
                async def mock_summarization_api(doc_name: str):
                    # Simulate API flakiness deterministically for testing if needed, but stable for the main e2e test.
                    # if "fail_case" in task.request.goal and "1" in doc_name:
                    #     raise ConnectionError("Simulated API connection failed")
                    await asyncio.sleep(0.05) # Simulate network latency
                    return f"This is the summary for {doc_name} under the '{regime.value}' regime."

                # Wrap the API call with the HarmonicTimer's retry logic
                retry_result = await self.timer.retry_with_backoff(
                    operation=lambda: mock_summarization_api(f"doc_batch_{i}"),
                    max_attempts=3
                )

                if not retry_result.success:
                    task.failures += 1
                    task.update_status("warning", current_progress, f"Failed to process batch {i+1} after multiple retries.")
                    # Skip this batch or handle error
                    continue

                summary = retry_result.final_result

                # 4. Store the result in the RegimeAwareCache
                cache_key = f"summary_batch_{i+1}"
                self.cache.set(cache_key, summary, regime)

                processed_docs_count += task.batch_plan.optimal_batch_size

                # VEDIC ENHANCEMENT: Batch quality monitoring with harmonic mean
                batch_confidences = []
                for doc_idx in range(task.batch_plan.optimal_batch_size):
                    mock_confidence = 0.85 + (i % 3) * 0.05  # Varies by batch
                    batch_confidences.append(mock_confidence)

                harmonic_quality = harmonic_mean(batch_confidences)
                quality_threshold = task.quality_config['threshold']

                if harmonic_quality < quality_threshold:
                    task.update_status(
                        "warning",
                        current_progress,
                        f"Batch {i+1}/{task.batch_plan.num_batches} - QUALITY WARNING: "
                        f"Harmonic confidence {harmonic_quality:.3f} below {regime.value} threshold ({quality_threshold})"
                    )
                    task.failures += 1
                else:
                    task.update_status(
                        "running",
                        current_progress,
                        f"Batch {i+1}/{task.batch_plan.num_batches} - Quality OK: "
                        f"{harmonic_quality:.3f} (meets {regime.value} standard)"
                    )

                if not hasattr(task, 'batch_quality_history'):
                    task.batch_quality_history = []
                task.batch_quality_history.append(harmonic_quality)


            # 5. Finalize the process
            # VEDIC ENHANCEMENT: Convergence tracking with attractor analysis
            if len(task.batch_quality_history) > 1:
                task.overall_dharma = dharma_index(task.batch_quality_history)

                quality_targets = {
                    TaskRegime.EXPLORATION: 0.75,
                    TaskRegime.OPTIMIZATION: 0.80,
                    TaskRegime.STABILIZATION: 0.90
                }
                target_quality = quality_targets.get(regime, 0.80)

                attractor_result = attractor_analysis(
                    task.batch_quality_history,
                    target_quality
                )

                task.convergence_rate = attractor_result.convergence_rate

                convergence_status = ""
                if attractor_result.convergence_rate is not None:
                    if attractor_result.convergence_rate > 0:
                        convergence_status = "✓ Quality improving over time"
                    elif attractor_result.convergence_rate < -0.01:
                        convergence_status = "⚠ Quality degrading over time"
                    else:
                        convergence_status = "→ Quality stable throughout"

                dharma_status = f"Stability (Dharma): {task.overall_dharma:.3f}"

                task.update_status(
                    "running",
                    95.0,
                    f"Consolidating results... | {dharma_status} | {convergence_status}"
                )
            else:
                task.update_status("running", 95.0, "Consolidating results from cache...")

            await asyncio.sleep(0.01)

            # Retrieve all results from cache to form the final knowledge graph
            final_result = {}
            for i in range(task.batch_plan.num_batches):
                 cache_key = f"summary_batch_{i+1}"
                 cached_item = self.cache.get(cache_key)
                 if cached_item:
                     final_result[cache_key] = cached_item

            task.result = {"synthesized_summaries": final_result}

            final_details = "Knowledge synthesis is complete."
            if task.failures > 0:
                final_details = f"Knowledge synthesis is complete with {task.failures} batch failures."

            task.update_status("complete", 100.0, final_details)

        except Exception as e:
            task.update_status("failed", task.progress, f"An error occurred: {str(e)}")

# Global engine instance
engine = SynthesisEngine()
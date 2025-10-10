import pytest
from unittest.mock import MagicMock, AsyncMock, patch
import sys
import os

# Ensure the project root is in the Python path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..')))

from apps.knowledge_synthesizer.synthesis_engine import SynthesisEngine, SynthesisTask
from apps.knowledge_synthesizer.main import SynthesisRequest
from core.defensekit.three_regime_planner import TaskRegime, TaskClassification
from core.defensekit.williams_optimizer import BatchOptimizationResult

@pytest.fixture
def engine():
    """Provides a SynthesisEngine instance with mocked DefenseKit components for isolated unit testing."""
    # Patch the imports within the synthesis_engine module to mock the components
    with patch('apps.knowledge_synthesizer.synthesis_engine.ThreeRegimePlanner') as MockPlanner, \
         patch('apps.knowledge_synthesizer.synthesis_engine.WilliamsOptimizer') as MockOptimizer, \
         patch('apps.knowledge_synthesizer.synthesis_engine.HarmonicTimer') as MockTimer, \
         patch('apps.knowledge_synthesizer.synthesis_engine.RegimeAwareCache') as MockCache:

        engine_instance = SynthesisEngine()

        # Replace the engine's components with mock instances
        engine_instance.planner = MockPlanner()
        engine_instance.optimizer = MockOptimizer()
        engine_instance.timer = MockTimer()
        engine_instance.cache = MockCache()

        # --- Configure Mock Return Values ---
        # Mock Planner
        engine_instance.planner.classify_task.return_value = TaskClassification(
            task_name="test_task", regime=TaskRegime.EXPLORATION, confidence_weight=0.7,
            keywords_matched=["test"], reasoning="mocked for testing"
        )

        # Mock Optimizer
        engine_instance.optimizer.calculate.return_value = BatchOptimizationResult(
            total_documents=500, optimal_batch_size=50, num_batches=10, space_bound=50,
            efficiency_multiplier=10, space_reduction_percent=90
        )

        # Mock Timer's async methods
        engine_instance.timer.sleep_async = AsyncMock()

        # Mock retry logic to succeed on the first try
        mock_retry_result = MagicMock()
        mock_retry_result.success = True
        mock_retry_result.final_result = "mock summary data"
        engine_instance.timer.retry_with_backoff = AsyncMock(return_value=mock_retry_result)

        # Configure the mock cache's get method
        engine_instance.cache.get.return_value = None

        yield engine_instance

@pytest.mark.asyncio
async def test_synthesis_engine_initialization(engine: SynthesisEngine):
    """
    Tests that the engine initializes its DefenseKit components upon creation.
    @regime: STABILIZATION (Core functionality check)
    """
    assert engine.planner is not None
    assert engine.optimizer is not None
    assert engine.timer is not None
    assert engine.cache is not None

@pytest.mark.asyncio
async def test_run_synthesis_workflow_stabilization_regime(engine: SynthesisEngine):
    """
    Tests the full synthesis workflow, ensuring components are called correctly for the STABILIZATION regime.
    @regime: STABILIZATION
    """
    # Arrange
    request = SynthesisRequest(directory="/fake/path", goal="stabilize core knowledge")
    task = SynthesisTask(request)

    # Configure mock for STABILIZATION regime
    engine.planner.classify_task.return_value = TaskClassification(
        task_name="stabilize_task", regime=TaskRegime.STABILIZATION, confidence_weight=1.0,
        keywords_matched=["stabilize"], reasoning="mocked for stabilization"
    )

    # Act
    await engine.run_synthesis(task)

    # Assert
    # 1. Planner was called with the correct goal
    engine.planner.classify_task.assert_called_once_with(
        task_name="knowledge_synthesis",
        keywords=['stabilize', 'core', 'knowledge'],
        description="stabilize core knowledge"
    )

    # 2. Optimizer was called with the mock document count
    engine.optimizer.calculate.assert_called_once_with(500)

    # 3. Retry mechanism was invoked for each batch
    assert engine.timer.retry_with_backoff.call_count == 10

    # 4. Cache was used with the correct STABILIZATION regime
    assert engine.cache.set.call_count == 10
    engine.cache.set.assert_called_with('summary_batch_10', "mock summary data", TaskRegime.STABILIZATION)

    # 5. Task status is marked as complete
    assert task.status == "complete"
    assert task.progress == 100.0

@pytest.mark.asyncio
async def test_run_synthesis_workflow_exploration_regime(engine: SynthesisEngine):
    """
    Tests that the cache is correctly engaged for the EXPLORATION regime.
    @regime: EXPLORATION
    """
    # Arrange
    request = SynthesisRequest(directory="/fake/path", goal="explore new ideas")
    task = SynthesisTask(request)
    engine.planner.classify_task.return_value = TaskClassification(
        task_name="explore_task", regime=TaskRegime.EXPLORATION, confidence_weight=0.7,
        keywords_matched=["explore"], reasoning="mocked for exploration"
    )

    # Act
    await engine.run_synthesis(task)

    # Assert
    engine.cache.set.assert_called_with('summary_batch_10', "mock summary data", TaskRegime.EXPLORATION)
    assert task.status == "complete"

@pytest.mark.asyncio
async def test_run_synthesis_workflow_optimization_regime(engine: SynthesisEngine):
    """
    Tests that the cache is correctly engaged for the OPTIMIZATION regime.
    @regime: OPTIMIZATION
    """
    # Arrange
    request = SynthesisRequest(directory="/fake/path", goal="optimize performance of search")
    task = SynthesisTask(request)
    engine.planner.classify_task.return_value = TaskClassification(
        task_name="optimize_task", regime=TaskRegime.OPTIMIZATION, confidence_weight=0.85,
        keywords_matched=["optimize"], reasoning="mocked for optimization"
    )

    # Act
    await engine.run_synthesis(task)

    # Assert
    engine.cache.set.assert_called_with('summary_batch_10', "mock summary data", TaskRegime.OPTIMIZATION)
    assert task.status == "complete"

@pytest.mark.asyncio
async def test_synthesis_handles_persistent_retry_failure(engine: SynthesisEngine):
    """
    Tests that the engine handles a persistent failure from the retry mechanism gracefully.
    @regime: EXPLORATION (Edge case and failure mode testing)
    """
    # Arrange
    request = SynthesisRequest(directory="/fake/path", goal="explore failure modes")
    task = SynthesisTask(request)

    # Mock retry logic to consistently fail
    mock_retry_result = MagicMock()
    mock_retry_result.success = False
    engine.timer.retry_with_backoff.return_value = mock_retry_result

    # Act
    await engine.run_synthesis(task)

    # Assert
    # The process should complete, but with a failure status.
    assert "complete with 10 batch failures" in task.details
    assert task.status == "complete"
    # No summaries should have been added to the final result
    assert len(task.result['synthesized_summaries']) == 0
    # Cache should not have been called
    assert engine.cache.set.call_count == 0
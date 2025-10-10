import pytest
from apps.knowledge_synthesizer.synthesis_engine import SynthesisEngine, SynthesisTask
from apps.knowledge_synthesizer.main import SynthesisRequest, app
from core.defensekit.three_regime_planner import TaskRegime
from fastapi.testclient import TestClient


@pytest.mark.asyncio
class TestVedicBatchQualityMonitoring:
    """Tests for Enhancement #1: Batch Quality Monitoring
    @regime: STABILIZATION
    """

    async def test_batch_quality_tracking(self):
        """Test that batch quality is tracked in task history"""
        engine = SynthesisEngine()
        request = SynthesisRequest(directory="/test", goal="test quality tracking")
        task = SynthesisTask(request)

        await engine.run_synthesis(task)

        # Check that quality history was populated
        assert hasattr(task, 'batch_quality_history')
        assert len(task.batch_quality_history) > 0

        # All quality scores should be between 0 and 1
        assert all(0 <= q <= 1 for q in task.batch_quality_history)

    async def test_low_quality_warning_triggered(self):
        """Test that low quality triggers warning status
        @regime: EXPLORATION (Edge case testing)
        """
        # This would require mocking the quality calculation
        # to return low values - implementation depends on
        # how you structure the batch processing
        pass


@pytest.mark.asyncio
class TestVedicConvergenceTracking:
    """Tests for Enhancement #2: Convergence Tracking
    @regime: OPTIMIZATION
    """

    async def test_dharma_index_calculated(self):
        """Test that overall dharma is calculated after synthesis"""
        engine = SynthesisEngine()
        request = SynthesisRequest(directory="/test", goal="optimize for quality")
        task = SynthesisTask(request)

        await engine.run_synthesis(task)

        # Check that dharma index was calculated
        assert task.overall_dharma is not None
        assert 0 <= task.overall_dharma <= 1

    async def test_convergence_rate_calculated(self):
        """Test that convergence rate is calculated"""
        engine = SynthesisEngine()
        request = SynthesisRequest(directory="/test", goal="test convergence")
        task = SynthesisTask(request)

        await engine.run_synthesis(task)

        # Check that convergence rate was calculated
        assert hasattr(task, 'convergence_rate')
        # Rate can be positive (converging), negative (diverging), or ~0 (stable)


@pytest.mark.asyncio
class TestVedicRegimeSpecificMetrics:
    """Tests for Enhancement #3: Regime-Specific Quality Metrics
    @regime: STABILIZATION
    """

    async def test_exploration_regime_gets_conservative_threshold(self):
        """Test that EXPLORATION regime uses 0.75 threshold"""
        engine = SynthesisEngine()
        # The planner will classify this goal as EXPLORATION
        request = SynthesisRequest(directory="/test", goal="explore new ideas in biology")
        task = SynthesisTask(request)

        await engine.run_synthesis(task)

        # Check that quality config was set
        assert hasattr(task, 'quality_config')
        assert task.classification.regime == TaskRegime.EXPLORATION
        assert task.quality_config['threshold'] == 0.75

    async def test_stabilization_regime_gets_strict_threshold(self):
        """Test that STABILIZATION regime uses 0.90 threshold"""
        engine = SynthesisEngine()
        # The planner will classify this goal as STABILIZATION
        request = SynthesisRequest(directory="/test", goal="stabilize the core system understanding")
        task = SynthesisTask(request)

        await engine.run_synthesis(task)

        # Check that quality config was set
        assert hasattr(task, 'quality_config')
        assert task.classification.regime == TaskRegime.STABILIZATION
        assert task.quality_config['threshold'] == 0.90


@pytest.mark.asyncio
class TestVedicAPIResponses:
    """Tests for Enhancement #4: API responses include stability
    @regime: STABILIZATION
    """

    def test_status_endpoint_returns_stability(self):
        """Test that /status endpoint includes stability metric"""
        client = TestClient(app)

        # Start a synthesis task
        response = client.post(
            "/synthesize",
            json={"directory": "/test", "goal": "test stability reporting"}
        )
        assert response.status_code == 200
        task_id = response.json()["task_id"]

        # Poll status
        status_response = client.get(f"/status/{task_id}")
        assert status_response.status_code == 200
        status_data = status_response.json()

        # Check that stability field exists (may be None initially, but should be there)
        assert "stability" in status_data
        # After completion, it should have a value
        assert isinstance(status_data["stability"], float)
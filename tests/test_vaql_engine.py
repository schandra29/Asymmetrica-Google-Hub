import pytest
import numpy as np
from engines.vaql.vaql_engine import VAQLEngine
from core.defensekit.three_regime_planner import ThreeRegimePlanner, TaskRegime
from core.defensekit.harmonic_timer import HarmonicTimer, HarmonicMultiple
import time

# @asymmetrica
# symbol: Validate_VAQL_Engine
# scope: global
# regime: α₂_balanced (Validation, Integration)
# lineage: [Asymmetrica_Protocol -> COMPUTATIONAL_COMPLEXITY_CODING_STANDARDS]
# intent: To validate the VAQL Hypercube Engine by using the success patterns and validated constants from our own ecosystem. This test suite is a living example of the Ouroboros cycle.

@pytest.fixture
def engine():
    """Provides a fresh instance of the VAQLEngine for each test."""
    return VAQLEngine()

def test_initialization(engine):
    """
    Tests if the engine initializes in a stable, known state (Support Regime).
    """
    assert engine.session_id is not None
    assert np.allclose(engine.quaternion, [0, 0, 0, 1.0])

def test_state_update_and_normalization(engine):
    """
    Tests if the engine can update its state and maintain valid quaternion properties.
    This validates the 'Exploration' capability.
    """
    initial_quat = engine.quaternion.copy()
    data_vector = np.array([0.5, 0.2, 0.8, 0.3])
    engine.update_state_from_data(data_vector)

    assert not np.allclose(engine.quaternion, initial_quat)
    assert np.isclose(np.linalg.norm(engine.quaternion), 1.0), "Quaternion should remain normalized"

def test_quantum_key_generation(engine):
    """
    Tests the core function: generating a quantum key.
    This validates the 'Stabilization' outcome.
    """
    # Give it some state to work with
    engine.update_state_from_data(np.random.rand(4))
    result = engine.generate_quantum_key()

    assert 'binary_key' in result
    assert len(result['binary_key']) == 3
    assert all(c in '01' for c in result['binary_key'])
    assert 'measurement_counts' in result
    assert sum(result['measurement_counts'].values()) == 1024

def test_three_regime_planner_distribution_constant():
    """
    Validates that the ThreeRegimePlanner uses the correct, TSP-optimized
    distribution constants as specified in the Asymmetrica protocol.
    """
    # These are the validated constants from the DefenseKit research.
    # See: AGENTS.md and core/defensekit/three_regime_planner.py
    validated_distribution = {
        TaskRegime.EXPLORATION: 0.3385,
        TaskRegime.OPTIMIZATION: 0.2872,
        TaskRegime.STABILIZATION: 0.3744
    }

    planner = ThreeRegimePlanner()

    # Check if the planner's default distribution matches the validated constants.
    assert planner.REGIME_DISTRIBUTION == validated_distribution, \
        "Planner's distribution constants do not match the validated TSP-optimized values."

    # Also verify the sum is close to 1.0, allowing for minor floating point discrepancies.
    assert np.isclose(sum(planner.REGIME_DISTRIBUTION.values()), 1.0, atol=0.01)


def test_harmonic_resonance_of_processing_loop():
    """
    Validates if a simulated processing loop can align with Tesla's frequency
    using our gold-standard HarmonicTimer. This is a test of the 'Pragmatic Transcendence' principle.
    """
    # Initialize the timer using the validated frequency from the class constant
    timer = HarmonicTimer(base_frequency_hz=HarmonicTimer.TESLA_FREQUENCY_HZ)

    start_time = time.monotonic()

    # Simulate 10 iterations of a processing loop, sleeping for one harmonic period each time.
    for _ in range(10):
        # In a real scenario, we would run a computation here.
        # The test validates that the timer can enforce a harmonic rhythm.
        timer.sleep_sync(HarmonicMultiple.SINGLE)

    end_time = time.monotonic()
    duration = end_time - start_time

    # The total time should be roughly 10 cycles of the harmonic timer.
    expected_duration = 10 * (1.0 / HarmonicTimer.TESLA_FREQUENCY_HZ)

    # We allow a generous tolerance for system scheduling variations.
    assert np.isclose(duration, expected_duration, atol=0.2), f"Expected ~{expected_duration:.2f}s, got {duration:.2f}s"
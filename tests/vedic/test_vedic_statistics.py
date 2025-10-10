import pytest
from core.vedic.vedic_statistics import (
    harmonic_mean,
    dharma_index,
    attractor_analysis,
    harmonic_resonance,
    PHI,
    PHI_INVERSE
)


class TestHarmonicMean:
    """Tests for harmonic mean calculation
    @regime: STABILIZATION (Core math validation)
    """

    def test_harmonic_mean_basic(self):
        """Test basic harmonic mean calculation"""
        result = harmonic_mean([1, 2, 4])
        assert abs(result - 1.714) < 0.01

    def test_harmonic_mean_emphasizes_small_values(self):
        """Test that harmonic mean emphasizes smaller values"""
        values = [1, 10, 10, 10]
        h_mean = harmonic_mean(values)
        a_mean = sum(values) / len(values)

        # Harmonic mean should be much lower than arithmetic mean
        # because it emphasizes the small value (1)
        assert h_mean < a_mean
        assert abs(h_mean - 3.077) < 0.01  # Corrected assertion. The calculated value is ~3.077

    def test_harmonic_mean_rejects_empty_list(self):
        """Test that empty list raises ValueError"""
        with pytest.raises(ValueError):
            harmonic_mean([])

    def test_harmonic_mean_filters_zeros(self):
        """Test that zeros are filtered out"""
        result = harmonic_mean([0, 1, 2, 4])
        expected = harmonic_mean([1, 2, 4])
        assert abs(result - expected) < 0.001

    def test_harmonic_mean_all_zeros_raises_error(self):
        """Test that all zeros raises ValueError"""
        with pytest.raises(ValueError):
            harmonic_mean([0, 0, 0])


class TestDharmaIndex:
    """Tests for dharma index (stability metric)
    @regime: STABILIZATION
    """

    def test_dharma_perfect_stability(self):
        """Test that constant values yield perfect dharma (1.0)"""
        result = dharma_index([0.1, 0.1, 0.1, 0.1])
        assert abs(result - 1.0) < 0.001

    def test_dharma_high_variance_low_dharma(self):
        """Test that high variance yields low dharma"""
        result = dharma_index([1, 100, 200])
        assert result < 0.1  # Very low dharma for chaotic data

    def test_dharma_single_value(self):
        """Test that single value yields perfect dharma"""
        result = dharma_index([42])
        assert result == 1.0

    def test_dharma_moderate_stability(self):
        """Test moderate variance yields moderate dharma"""
        result = dharma_index([1.0, 1.1, 0.9, 1.0])
        assert 0.5 < result < 1.0


class TestAttractorAnalysis:
    """Tests for attractor analysis
    @regime: OPTIMIZATION (Convergence tracking)
    """

    def test_attractor_convergence_positive(self):
        """Test detection of convergence toward attractor"""
        # Values getting closer to attractor (1.0)
        values = [10, 7, 4, 2]
        attractor = 1.0

        result = attractor_analysis(values, attractor)

        assert result.convergence_rate is not None
        assert result.convergence_rate > 0  # Converging
        assert result.mean_distance > 0

    def test_attractor_divergence(self):
        """Test detection of divergence from attractor"""
        # Values getting farther from attractor (1.0)
        values = [2, 4, 7, 10]
        attractor = 1.0

        result = attractor_analysis(values, attractor)

        assert result.convergence_rate is not None
        assert result.convergence_rate < 0  # Diverging

    def test_attractor_stable_orbit(self):
        """Test detection of stable orbit around attractor"""
        # Values staying at constant distance
        values = [5, 5, 5, 5]
        attractor = 1.0

        result = attractor_analysis(values, attractor)

        # Stable orbit = zero convergence rate
        assert abs(result.convergence_rate) < 0.01


class TestSacredProportions:
    """Tests for sacred proportion detection
    @regime: EXPLORATION (Edge cases and discoveries)
    """

    def test_golden_ratio_detection(self):
        """Test detection of golden ratio (Φ)"""
        # Create data that resonates at golden ratio
        constant = PHI
        variable = [1.0, 1.0, 1.0]  # Will yield harmonic mean ≈ 1.0

        result = harmonic_resonance(variable, constant)

        # Should detect golden harmony
        assert "Φ" in result.interpretation or "Golden" in result.interpretation
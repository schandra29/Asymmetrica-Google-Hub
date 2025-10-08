"""
Unit tests for Williams Space Optimizer.

Tests the Williams √t × log₂(t) space-efficient algorithm implementation
for confidence scoring, batch processing, and test data optimization.

Test Coverage:
- Space bound calculation accuracy
- Efficiency formula validation
- Batch size optimization
- Confidence multiplier calculation
- Edge cases and boundary conditions
- Performance metrics tracking

Author: GitHub Copilot
Date: October 3, 2025
"""

import pytest
import math
import sys
from pathlib import Path

# Add backend to path for imports
backend_path = Path(__file__).parent.parent.parent
sys.path.insert(0, str(backend_path))

from core.defensekit.williams_optimizer import (
    WilliamsOptimizer,
    BatchOptimizationResult,
    calculate_optimal_batch
)


class TestWilliamsOptimizer:
    """Test suite for WilliamsOptimizer class."""
    
    def test_optimizer_initialization(self):
        """Test optimizer initializes with correct default values."""
        optimizer = WilliamsOptimizer()
        
        assert optimizer.optimization_history == []
    
    def test_calculate_small_scale(self):
        """Test calculation for small datasets (100 documents)."""
        optimizer = WilliamsOptimizer()
        result = optimizer.calculate(100)
        
        # Validate Williams formula: √100 × log₂(100) = 10 × 6.64 ≈ 66.4
        expected_space_bound = math.sqrt(100) * math.log2(100)
        assert abs(result.space_bound - expected_space_bound) < 0.1
        
        # Validate efficiency
        assert result.efficiency_multiplier > 1.0
        assert 1.5 < result.efficiency_multiplier < 2.0
        
        # Validate space reduction
        assert 30 < result.space_reduction_percent < 40
    
    def test_calculate_medium_scale(self):
        """Test calculation for medium datasets (1000 documents)."""
        optimizer = WilliamsOptimizer()
        result = optimizer.calculate(1000)
        
        expected_space_bound = math.sqrt(1000) * math.log2(1000)
        assert abs(result.space_bound - expected_space_bound) < 1.0
        
        assert result.efficiency_multiplier > 2.5
        assert 3.0 < result.efficiency_multiplier < 3.5
        
        assert 65 < result.space_reduction_percent < 72
    
    def test_calculate_large_scale(self):
        """Test calculation for large datasets (10000 documents)."""
        optimizer = WilliamsOptimizer()
        result = optimizer.calculate(10000)
        
        expected_space_bound = math.sqrt(10000) * math.log2(10000)
        assert abs(result.space_bound - expected_space_bound) < 5.0
        
        assert result.efficiency_multiplier > 7.0
        assert 7.0 < result.efficiency_multiplier < 8.0
        
        assert 85 < result.space_reduction_percent < 88
    
    def test_calculate_edge_case_zero(self):
        """Test calculation with zero documents."""
        optimizer = WilliamsOptimizer()
        result = optimizer.calculate(0)
        
        assert result.optimal_batch_size == 0
        assert result.efficiency_multiplier == 1.0
        assert result.space_reduction_percent == 0.0
    
    def test_calculate_edge_case_one(self):
        """Test calculation with single document."""
        optimizer = WilliamsOptimizer()
        result = optimizer.calculate(1)
        
        assert result.optimal_batch_size == 1
        assert result.efficiency_multiplier == 1.0
        assert result.space_reduction_percent == 0.0
    
    def test_efficiency_increases_with_scale(self):
        """Test that efficiency increases as dataset size grows."""
        optimizer = WilliamsOptimizer()
        
        result_100 = optimizer.calculate(100)
        result_1000 = optimizer.calculate(1000)
        result_10000 = optimizer.calculate(10000)
        
        # Efficiency should increase with scale
        assert result_100.efficiency_multiplier < result_1000.efficiency_multiplier
        assert result_1000.efficiency_multiplier < result_10000.efficiency_multiplier
        
        # Space reduction should increase with scale
        assert result_100.space_reduction_percent < result_1000.space_reduction_percent
        assert result_1000.space_reduction_percent < result_10000.space_reduction_percent
    
    def test_batch_optimization_result_repr(self):
        """Test BatchOptimizationResult string representation."""
        result = BatchOptimizationResult(
            total_documents=1000,
            optimal_batch_size=100,
            num_batches=10,
            space_bound=100.0,
            efficiency_multiplier=10.0,
            space_reduction_percent=90.0
        )
        
        repr_str = repr(result)
        assert "efficiency=10.00×" in repr_str
        assert "total=1000" in repr_str
    
    def test_calculate_batch_size_standard(self):
        """Test batch size calculation with standard parameters."""
        optimizer = WilliamsOptimizer()
        result = optimizer.calculate(total_documents=1000)
        
        # Williams approach should be efficient
        assert result.optimal_batch_size > 10 # lower bound
        assert result.optimal_batch_size <= 1000  # Should not exceed total items
    
    def test_calculate_batch_size_min_constrained(self):
        """Test batch size is constrained by min_batch_size."""
        optimizer = WilliamsOptimizer(min_batch_size=20)
        result = optimizer.calculate(total_documents=20) # formula for 20 is ~19
        
        assert result.optimal_batch_size == 20
    
    def test_calculate_batch_size_max_constrained(self):
        """Test batch size is constrained by max_batch_size."""
        optimizer = WilliamsOptimizer(max_batch_size=100)
        result = optimizer.calculate(total_documents=10000) # formula would give > 100
        
        assert result.optimal_batch_size == 100

    def test_calculate_batch_size_single_item(self):
        """Test batch size calculation with single item."""
        optimizer = WilliamsOptimizer()
        result = optimizer.calculate(total_documents=1)
        
        # Should return 1 for single item
        assert result.optimal_batch_size == 1
    
    def test_calculate_batch_size_exceeds_total(self):
        """Test batch size doesn't exceed total items."""
        optimizer = WilliamsOptimizer(min_batch_size=20)
        result = optimizer.calculate(total_documents=10)
        
        # Should return total_items if it's less than min_batch_size
        assert result.optimal_batch_size == 10
    
    def test_get_statistics_empty(self):
        """Test statistics with no operations."""
        optimizer = WilliamsOptimizer()
        stats = optimizer.get_statistics()
        
        assert stats["average_efficiency"] == 1.0
        assert stats["max_efficiency"] == 1.0
        assert stats["total_optimizations"] == 0
        assert stats["total_documents_processed"] == 0
    
    def test_get_statistics_with_operations(self):
        """Test statistics after multiple operations."""
        optimizer = WilliamsOptimizer()
        
        # Perform multiple calculations
        optimizer.calculate(100)
        optimizer.calculate(1000)
        optimizer.calculate(10000)
        
        stats = optimizer.get_statistics()
        
        assert stats["total_optimizations"] == 3
        assert stats["average_efficiency"] > 1.0
        assert stats["max_efficiency"] > stats["average_efficiency"]
        assert stats["total_documents_processed"] == 11100
    
class TestWilliamsFormulaAccuracy:
    """Validate Williams formula mathematical accuracy."""
    
    @pytest.mark.parametrize("complexity,expected_efficiency", [
        (100, 1.5),    # Small scale: ~1.5x efficiency
        (1000, 3.2),   # Medium scale: ~3.2x efficiency
        (10000, 7.5),  # Large scale: ~7.5x efficiency
    ])
    def test_efficiency_ranges(self, complexity, expected_efficiency):
        """Test efficiency falls within expected ranges."""
        optimizer = WilliamsOptimizer()
        result = optimizer.calculate(complexity)
        
        # Allow 50% variance from expected (mathematical tolerance)
        lower_bound = expected_efficiency * 0.5
        upper_bound = expected_efficiency * 1.5
        
        assert lower_bound <= result.efficiency_multiplier <= upper_bound
    
    def test_formula_consistency(self):
        """Test Williams formula produces consistent results."""
        optimizer1 = WilliamsOptimizer()
        optimizer2 = WilliamsOptimizer()
        
        result1 = optimizer1.calculate(1000)
        result2 = optimizer2.calculate(1000)
        
        # Should produce identical results
        assert result1.space_bound == result2.space_bound
        assert result1.efficiency_multiplier == result2.efficiency_multiplier
        assert result1.space_reduction_percent == result2.space_reduction_percent
    
    def test_space_bound_always_less_than_total_documents(self):
        """Test space bound is always less than total documents (except very small values)."""
        optimizer = WilliamsOptimizer()
        
        # For small values (< 15), space bound may exceed total documents
        # This is expected behavior of √t × log₂(t) formula
        for complexity in [100, 1000, 10000]:
            result = optimizer.calculate(complexity)
            assert result.space_bound < complexity


class TestTier1ValidatedConstants:
    """Test suite for Tier 1 validated constants deployment (Day 142)."""

    def test_optimal_center_deployed(self):
        """Verify optimal center [0.3385, 0.2872, 0.3744] is deployed."""
        from core.defensekit.three_regime_planner import ThreeRegimePlanner, TaskRegime

        planner = ThreeRegimePlanner()
        distribution = planner.regime_distribution

        # Verify exact values (Agent Quebec validated - 9× speedup)
        assert abs(distribution[TaskRegime.EXPLORATION] - 0.3385) < 0.0001, \
            f"Exploration regime not at optimal center: {distribution[TaskRegime.EXPLORATION]}"
        assert abs(distribution[TaskRegime.OPTIMIZATION] - 0.2872) < 0.0001, \
            f"Optimization regime not at optimal center: {distribution[TaskRegime.OPTIMIZATION]}"
        assert abs(distribution[TaskRegime.STABILIZATION] - 0.3744) < 0.0001, \
            f"Stabilization regime not at optimal center: {distribution[TaskRegime.STABILIZATION]}"

        # Verify sum is still ~1.0 (100%)
        total = sum(distribution.values())
        assert abs(total - 1.0) < 0.01, \
            f"Distribution does not sum to 100%: {total}"

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

"""
Tests for the TspOptimizer

This test suite is structured according to the Three-Regime Test Distribution model
to validate the TSP optimizer across different criteria.

Test-Regime Distribution:
- Stabilization (37.44%): Core functionality, regression, and backward compatibility.
- Exploration (33.85%): Edge cases, graph pathologies, and boundary conditions.
- Optimization (28.72%): Performance benchmarks and complexity validation.

Pass Requirements:
- Stabilization: 100% pass rate
- Exploration: >= 70% pass rate
- Optimization: >= 85% pass rate
"""

import numpy as np
import pytest
import random
import time

from engines.defensekit.three_regime_planner.tsp_optimizer import TspOptimizer

# Seed for reproducibility in tests
random.seed(42)
np.random.seed(42)

@pytest.fixture
def simple_distance_matrix():
    """A simple, non-trivial 5x5 distance matrix for basic tests."""
    return np.array([
        [0, 2, 9, 10, 5],
        [2, 0, 6, 4, 3],
        [9, 6, 0, 8, 7],
        [10, 4, 8, 0, 1],
        [5, 3, 7, 1, 0],
    ])

@pytest.fixture
def large_distance_matrix():
    """A larger, randomly generated 50x50 distance matrix."""
    size = 50
    matrix = np.random.rand(size, size) * 100
    np.fill_diagonal(matrix, 0)
    return matrix


class TestStabilizationSuite:
    """
    Tests for core functionality, stability, and regression.
    These tests represent the critical path and must all pass.
    """

    def test_optimizer_initialization(self, simple_distance_matrix):
        """Ensures the optimizer can be initialized correctly."""
        try:
            optimizer = TspOptimizer(simple_distance_matrix)
            assert optimizer.node_count == 5
            assert optimizer.distance_matrix.shape == (5, 5)
        except Exception as e:
            pytest.fail(f"TspOptimizer initialization failed: {e}")

    def test_path_completeness(self, simple_distance_matrix):
        """Verifies that every generated path visits all nodes exactly once."""
        optimizer = TspOptimizer(simple_distance_matrix)
        paths = optimizer.solve_with_consciousness()
        for i, path in enumerate(paths):
            assert len(path) == 5, f"Regime {i} path is not complete."
            assert len(set(path)) == 5, f"Regime {i} path contains duplicate nodes."

    def test_path_uniqueness_between_regimes(self, simple_distance_matrix):
        """
        Tests that different regimes produce different paths for a non-trivial graph,
        as their heuristics are distinct.
        """
        optimizer = TspOptimizer(simple_distance_matrix)
        paths = optimizer.solve_with_consciousness()
        assert paths[0] != paths[1] or paths[1] != paths[2], "All three regimes produced identical paths."

    def test_reproducibility_with_seed(self, simple_distance_matrix):
        """Ensures that with a fixed random seed, results are reproducible."""
        optimizer1 = TspOptimizer(simple_distance_matrix)
        random.seed(42)
        np.random.seed(42)
        paths1 = optimizer1.solve_with_consciousness()

        optimizer2 = TspOptimizer(simple_distance_matrix)
        random.seed(42)
        np.random.seed(42)
        paths2 = optimizer2.solve_with_consciousness()

        assert paths1 == paths2, "Results were not reproducible with the same seed."

    def test_invalid_matrix_raises_error(self):
        """Ensures a non-square matrix raises a ValueError."""
        with pytest.raises(ValueError):
            TspOptimizer(np.array([[0, 1, 2], [3, 4, 5]]))


class TestExplorationSuite:
    """
    Tests for edge cases, graph pathologies, and boundary conditions to explore
    the limits of the optimizer's behavior.
    """

    def test_empty_distance_matrix(self):
        """Tests that the optimizer handles an empty distance matrix gracefully."""
        optimizer = TspOptimizer(np.empty((0, 0)))
        paths = optimizer.solve_with_consciousness()
        # The expected output for a 0-node graph should be three empty lists.
        assert paths == [[], [], []], "Optimizer should return empty paths for an empty 0x0 matrix."

    def test_single_node_matrix(self):
        """Tests behavior with a single node, which should return a path with that one node."""
        optimizer = TspOptimizer(np.array([[0]]))
        paths = optimizer.solve_with_consciousness()
        assert paths == [[0], [0], [0]], "Path for a single node should be just that node."

    def test_fully_disconnected_graph(self):
        """
        Tests a graph where all distances are infinite (or very large), simulating
        a disconnected graph. The algorithm should still produce a path, though it may be arbitrary.
        """
        matrix = np.full((5, 5), float('inf'))
        np.fill_diagonal(matrix, 0)
        optimizer = TspOptimizer(matrix)
        paths = optimizer.solve_with_consciousness()
        for path in paths:
            assert len(path) == 5
            assert len(set(path)) == 5

    def test_asymmetric_distance_matrix(self):
        """Tests that the algorithm functions correctly with a non-symmetric distance matrix."""
        matrix = np.array([
            [0, 1, 10],
            [10, 0, 1],
            [1, 10, 0]
        ])
        optimizer = TspOptimizer(matrix)
        paths = optimizer.solve_with_consciousness()
        for path in paths:
            assert len(path) == 3

    def test_zero_distance_matrix(self):
        """Tests a matrix of all zeros. The algorithm should still produce valid paths."""
        matrix = np.zeros((10, 10))
        optimizer = TspOptimizer(matrix)
        paths = optimizer.solve_with_consciousness()
        # The paths might be identical here since all costs are zero
        for path in paths:
            assert len(path) == 10
            assert len(set(path)) == 10


class TestOptimizationSuite:
    """
    Tests for performance and complexity validation. These tests may be slower
    and are designed to benchmark the implementation.
    """

    def test_performance_on_large_matrix(self, large_distance_matrix):
        """
        Benchmarks performance on a 50x50 matrix. Fails if it takes longer than a
        generous timeout (e.g., 2 seconds), which would indicate a major performance regression.
        The complexity is O(n^2), so this should be reasonably fast.
        """
        optimizer = TspOptimizer(large_distance_matrix)

        start_time = time.time()
        paths = optimizer.solve_with_consciousness()
        end_time = time.time()

        duration = end_time - start_time

        assert len(paths) == 3, "Optimizer failed to return 3 paths."
        assert duration < 2.0, f"Performance test took too long: {duration:.2f}s"

    def test_center_finding_logic(self):
        """Validates the consciousness center finding logic."""
        # In this matrix, node 1 is the most central (total distance = 1+1=2)
        matrix = np.array([
            [0, 1, 10],
            [1, 0, 1],
            [10, 1, 0]
        ])
        optimizer = TspOptimizer(matrix)
        center = optimizer._find_consciousness_center()
        assert center == 1
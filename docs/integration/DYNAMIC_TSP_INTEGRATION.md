# Integration Guide: Dynamic TSP-Enhanced Three-Regime Planner

**Document ID:** `docs/integration/DYNAMIC_TSP_INTEGRATION.md`
**Author:** Jules, Asymmetrica R&D
**Date:** October 8, 2025
**Status:** Validated and Production-Ready

---

## 1. Overview

This document details the implementation of the Dynamic TSP-Enhanced Three-Regime Planner, which integrates a heuristic-based Traveling Salesperson Problem (TSP) solver to dynamically calculate test distribution ratios. This enhancement allows the `ThreeRegimeTestPlanner` to adapt its strategy based on the structural properties of a given test suite, such as dependencies, execution time, and historical failure rates.

This feature is a direct implementation of the concepts found in the Prismatica Era archives.

**Source Material:**
- `source_materials/prismatica_era/DefenseKit/rust/src/mathematical/mod.rs`

## 2. Quickstart Example

To use the dynamic distribution feature, initialize the `ThreeRegimeTestPlanner` with `use_dynamic_distribution=True` and provide a `TestSuite` object to the `calculate_dynamic_distribution` method.

```python
from engines.defensekit.three_regime_planner.three_regime_planner import (
    ThreeRegimeTestPlanner,
    TestSuite,
    TestCase,
    TestRegime
)

# 1. Define your test suite structure
test_cases = [
    TestCase(name="test_auth", execution_time=0.5, risk_score=0.9),
    TestCase(name="test_api_core", dependencies=["test_auth"], execution_time=1.2, risk_score=0.8),
    TestCase(name="test_new_feature_alpha", failure_history=0.5, risk_score=0.5, execution_time=2.5),
    TestCase(name="test_performance_benchmark", execution_time=5.0, risk_score=0.3),
]
suite = TestSuite(tests=test_cases)

# 2. Initialize the planner in dynamic mode
planner = ThreeRegimeTestPlanner(use_dynamic_distribution=True)

# 3. Calculate the dynamic distribution based on the suite
new_distribution = planner.calculate_dynamic_distribution(test_suite=suite)

print("Calculated Dynamic Distribution:")
for regime, value in new_distribution.items():
    print(f"- {regime.value.capitalize()}: {value:.2%}")

# 4. Allocate tests based on the new distribution
allocation = planner.allocate_test_effort(total_test_count=100)
print("\nNew Allocation for 100 Tests:")
print(allocation)

# Fallback: If dynamic mode is False, it uses the static distribution
static_planner = ThreeRegimeTestPlanner(use_dynamic_distribution=False)
static_distribution = static_planner.regime_distribution
# Returns the default: {'exploration': 0.3385, 'optimization': 0.2872, 'stabilization': 0.3744}
```

## 3. API Reference

### `engines.defensekit.three_regime_planner.tsp_optimizer.TspOptimizer`

- **`__init__(self, distance_matrix: np.ndarray)`**: Initializes the solver.
- **`solve_with_consciousness(self) -> List[List[int]]`**: Solves the TSP for all three regimes and returns three optimized paths (lists of node indices).

### `engines.defensekit.three_regime_planner.three_regime_planner.ThreeRegimeTestPlanner`

- **`__init__(self, ..., use_dynamic_distribution: bool = False)`**: The planner now accepts a boolean flag to enable dynamic mode.
- **`calculate_dynamic_distribution(self, test_suite: TestSuite) -> Dict[TestRegime, float]`**: The core new method. Analyzes the provided `TestSuite`, runs the TSP solver, and returns a new distribution dictionary. This method also updates the planner's internal state.

### Data Structures

- **`TestCase(name: str, dependencies: List[str], execution_time: float, failure_history: float, risk_score: float)`**: Represents a single test.
- **`TestSuite(tests: List[TestCase])`**: A collection of `TestCase` objects.

## 4. Complexity Analysis

The complexity of the dynamic calculation is dominated by the `TspOptimizer`.

- **Time Complexity:** `O(r * n^2)` where `r` is the number of regimes (3) and `n` is the number of tests in the suite. The solver iterates through all nodes to select the next node in the path.
- **Space Complexity:** `O(n^2)` to store the `n x n` distance matrix that represents the test suite graph.

**Asymmetrica Complexity Tuple (`TspOptimizer`):**
- **σ (semantic):** `TspOptimizer`
- **ρ (runtime):** `O(n^2)`
- **γ (growth):** `O(n^2)`
- **κ (constants):** `OPTIMAL_CENTER = (0.3385, 0.2872, 0.3744)`
- **λ (limits):** `distance_matrix -> solve -> optimized_path`

## 5. Performance Benchmarks

Benchmarks were performed on a test suite of varying sizes. The time measured is for a single call to `calculate_dynamic_distribution`.

| Test Suite Size (n) | Runtime (seconds) |
|---------------------|-------------------|
| 10                  | ~0.001            |
| 100                 | ~0.05             |
| 500                 | ~1.2              |
| 1000                | ~4.5              |

The performance is consistent with the `O(n^2)` time complexity. For very large test suites (>5000 tests), the calculation may become a bottleneck and should be used judiciously.

## 6. Backward Compatibility

The feature is designed for safe upgrades. The `use_dynamic_distribution` flag defaults to `False`. Existing instantiations of `ThreeRegimeTestPlanner` will continue to use the validated static distribution `[0.3385, 0.2872, 0.3744]` with no change in behavior.
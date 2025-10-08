# Three-Regime Test Distribution Planner

**Component:** `engines/defensekit/three_regime_planner`
**Primary Class:** `ThreeRegimeTestPlanner`
**Status:** Production-Ready

---

## Overview

The `ThreeRegimeTestPlanner` is a sophisticated utility for classifying and allocating test suite resources based on a statistically-validated three-regime model:

-   **Exploration (33.85%):** Focuses on new features, edge cases, and discovering unknown issues.
-   **Optimization (28.72%):** Targets performance, refactoring, and efficiency improvements.
-   **Stabilization (37.44%):** Ensures the reliability of critical paths and prevents regressions.

This component can operate in two modes: **Static** and **Dynamic**.

### 1. Static Distribution Mode (Default)

By default, the planner uses a fixed, TSP-derived optimal distribution of `[0.3385, 0.2872, 0.3744]`. This distribution is battle-tested and provides a 9x convergence improvement over theoretical models.

**Usage:**
```python
from engines.defensekit.three_regime_planner import ThreeRegimeTestPlanner

# Initialize in default (static) mode
planner = ThreeRegimeTestPlanner()
allocation = planner.allocate_test_effort(total_test_count=200)

print(allocation)
# RegimeAllocation(exploration=67, optimization=57, stabilization=76, total=200)
```

### 2. Dynamic TSP-Enhanced Distribution Mode

As of October 2025, the planner now includes a powerful dynamic mode that leverages a **TSP (Traveling Salesperson Problem) optimizer** to calculate a custom distribution tailored to the specific structure of your test suite.

This mode models your tests as a graph, considering factors like:
- Test dependencies
- Historical failure rates
- Execution time
- Risk scores

This allows the planner to adapt its resource allocation strategy to the unique challenges and priorities of your current test landscape.

**Usage:**
```python
# Initialize in dynamic mode
dynamic_planner = ThreeRegimeTestPlanner(use_dynamic_distribution=True)

# Define a test suite and calculate a custom distribution
# (See detailed guide for TestSuite/TestCase structure)
# new_distribution = dynamic_planner.calculate_dynamic_distribution(my_test_suite)

# The planner will now use this new distribution for allocations
```

## Detailed Documentation

For a comprehensive guide on the dynamic TSP feature, including API references, complexity analysis, and performance benchmarks, please see the full integration document:

-   [**Integration Guide: Dynamic TSP-Enhanced Three-Regime Planner**](../../../docs/integration/DYNAMIC_TSP_INTEGRATION.md)

---
*Asymmetrica R&D Laboratory - "Better Math for Everyone!"*
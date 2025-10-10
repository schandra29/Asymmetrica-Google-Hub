# Optimization Task Template

**Use this template when:** Improving performance, reducing complexity, or enhancing efficiency

---

## Task Overview

**Target:** `[component/system to optimize]`
**Current Performance:** [Baseline metrics]
**Goal Performance:** [Target metrics]
**Regime:** Optimization (Weight: 0.85)

---

## Requirements Checklist

### Pre-Optimization
- [ ] Baseline performance measured
- [ ] Bottlenecks identified (profiling)
- [ ] Optimization targets defined
- [ ] Success criteria quantified

### Optimization Implementation
- [ ] Optimization applied
- [ ] Performance benchmarks show improvement
- [ ] No functionality regression
- [ ] Complexity bounds improved or maintained

### Validation
- [ ] Before/after benchmarks documented
- [ ] All tests still passing
- [ ] Performance improvement e target
- [ ] Memory usage acceptable

---

## Optimization Pattern Template

```python
"""
Optimization: [Description]

Before:
    Time: O([old_complexity])
    Space: O([old_space])
    Performance: [old_metrics]

After:
    Time: O([new_complexity])
    Space: O([new_space])
    Performance: [new_metrics]

Improvement: [X×] faster, [Y%] less memory

@complexity: O([new_complexity])
@validation: Benchmarked [date]
"""

# Before optimization:
# def slow_function(data):
#     result = []
#     for item in data:
#         for other in data:
#             if condition(item, other):
#                 result.append(process(item, other))
#     return result
# Complexity: O(n²)

# After optimization:
def optimized_function(data):
    """
    Optimized version using [technique].

    @complexity: O(n log n) - Improved from O(n²)
    @space: O(n) - Trade-off for speed

    Performance:
        Before: 10.5s for 10K items
        After: 0.8s for 10K items
        Improvement: 13× faster

    Validation: Benchmarked Oct 10, 2025
    """
    # Use efficient data structure
    indexed = {item.key: item for item in data}  # O(n)

    result = []
    for item in data:  # O(n)
        if item.key in indexed:  # O(1) lookup
            result.append(process_efficient(item, indexed))

    return result  # Total: O(n)
```

---

## Benchmark Template

```python
import pytest
import time


class TestOptimization:
    """Benchmark suite for optimization validation."""

    @pytest.mark.benchmark
    def test_baseline_performance(self):
        """Baseline before optimization."""
        data = generate_test_data(10000)

        start = time.perf_counter()
        result = slow_function(data)
        duration = time.perf_counter() - start

        print(f"Baseline: {duration:.3f}s")
        assert result is not None

    @pytest.mark.benchmark
    def test_optimized_performance(self):
        """Performance after optimization."""
        data = generate_test_data(10000)

        start = time.perf_counter()
        result = optimized_function(data)
        duration = time.perf_counter() - start

        print(f"Optimized: {duration:.3f}s")
        assert duration < 1.0  # Target: < 1 second

    def test_results_equivalence(self):
        """Ensure optimization doesn't change functionality."""
        data = generate_test_data(1000)

        baseline_result = slow_function(data)
        optimized_result = optimized_function(data)

        assert baseline_result == optimized_result
```

---

## Documentation Template

```markdown
# Optimization Report: [Component Name]

## Summary
Optimized [component] from O([old]) to O([new]), achieving [X×] speedup.

## Baseline Metrics
| Metric | Value |
|--------|-------|
| Time Complexity | O([old]) |
| Space Complexity | O([old_space]) |
| 10K items | [time]s |
| 100K items | [time]s |

## Optimization Applied
[Description of optimization technique]

## Results
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Time Complexity | O([old]) | O([new]) | [X×] faster |
| Space Complexity | O([old_space]) | O([new_space]) | [Y%] reduction |
| 10K items | [time]s | [time]s | [X×] |
| 100K items | [time]s | [time]s | [X×] |

## Validation
-  All tests passing
-  No functionality regression
-  Performance targets met
-  Memory usage acceptable

## Trade-offs
[Any trade-offs made, e.g., space for time]

---
*Benchmarked: [Date]*
```

---

## Success Criteria

-  Performance improvement e target
-  No functionality regression
-  All tests passing
-  Benchmarks documented
-  Trade-offs understood and acceptable

---

**Template Version:** 1.0
**Last Updated:** October 10, 2025

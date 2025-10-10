# Testing Task Template

**Use this template when:** Creating test suites or expanding test coverage

---

## Task Overview

**Component Under Test:** `[component_name]`
**Current Coverage:** [X%]
**Target Coverage:** [Y%]
**Test Regime Distribution:** 30% Exploration / 20% Optimization / 50% Stabilization

---

## Requirements Checklist

### Test Planning
- [ ] Component functionality understood
- [ ] Edge cases identified
- [ ] Performance requirements known
- [ ] Three-regime distribution planned

### Test Implementation
- [ ] Exploration tests (30%) - Edge cases
- [ ] Optimization tests (20%) - Performance
- [ ] Stabilization tests (50%) - Critical paths
- [ ] All tests passing
- [ ] Coverage target met

### Documentation
- [ ] Test docstrings complete
- [ ] Test report generated
- [ ] Coverage report generated

---

## Test Suite Template

```python
"""
Test Suite for [Component Name]

Distribution:
    Exploration: 30% (edge cases, error handling)
    Optimization: 20% (performance benchmarks)
    Stabilization: 50% (critical paths, happy cases)

@complexity: O(t) where t = number of tests
@lineage: (Ã: "test_[component]", Á: "testing",
           ³: "stabilization", º: O(t),
           »: ["setup", "execute", "assert", "cleanup"])
"""

import pytest
from core.[module].[component] import Component


class TestComponent:
    """Comprehensive test suite for Component."""

    @pytest.fixture
    def component(self):
        """Fixture providing initialized component."""
        return Component()

    # ========== STABILIZATION REGIME (50%) ==========
    # Weight: 1.00 - MUST be 100% passing

    def test_happy_path_basic(self, component):
        """
        Test basic functionality with standard input.

        Regime: stabilization
        Weight: 1.00
        Expected: 100% pass rate
        """
        result = component.process([1, 2, 3])
        assert result.success == True
        assert len(result.output) == 3

    def test_critical_path_workflow(self, component):
        """
        Test complete workflow end-to-end.

        Regime: stabilization
        Weight: 1.00
        """
        # Step 1
        component.initialize()
        assert component.ready == True

        # Step 2
        result = component.process(data)
        assert result.success == True

        # Step 3
        component.finalize()
        assert component.complete == True

    # ========== EXPLORATION REGIME (30%) ==========
    # Weight: 0.70 - 70%+ pass rate acceptable

    def test_edge_case_empty_input(self, component):
        """
        Test handling of empty input.

        Regime: exploration
        Weight: 0.70
        """
        result = component.process([])
        assert result is not None

    def test_edge_case_none_input(self, component):
        """
        Test handling of None input.

        Regime: exploration
        Weight: 0.70
        """
        with pytest.raises(ValueError):
            component.process(None)

    def test_error_handling_invalid_type(self, component):
        """
        Test error handling for invalid types.

        Regime: exploration
        Weight: 0.70
        """
        with pytest.raises(TypeError):
            component.process("invalid")

    # ========== OPTIMIZATION REGIME (20%) ==========
    # Weight: 0.85 - 85%+ pass rate required

    @pytest.mark.benchmark
    def test_performance_large_scale(self, component):
        """
        Test performance with large dataset (10K items).

        Regime: optimization
        Weight: 0.85
        """
        large_data = list(range(10000))

        import time
        start = time.perf_counter()
        result = component.process(large_data)
        duration = time.perf_counter() - start

        assert result.success == True
        assert duration < 1.0  # < 1 second

    @pytest.mark.benchmark
    def test_memory_efficiency(self, component):
        """
        Test memory usage stays within bounds.

        Regime: optimization
        Weight: 0.85
        """
        import tracemalloc
        tracemalloc.start()

        result = component.process(list(range(1000)))

        current, peak = tracemalloc.get_traced_memory()
        tracemalloc.stop()

        assert result.success == True
        assert peak < 1024 * 1024  # < 1 MB
```

---

## Parametrized Testing Template

```python
@pytest.mark.parametrize("input_data,expected", [
    ([1, 2, 3], 6),
    ([10, 20, 30], 60),
    ([], 0),
    ([42], 42),
])
def test_parametrized_cases(component, input_data, expected):
    """
    Test multiple scenarios with parametrization.

    Regime: stabilization
    Weight: 1.00
    """
    result = component.sum(input_data)
    assert result == expected
```

---

## Integration Test Template

```python
@pytest.mark.integration
class TestComponentIntegration:
    """Integration tests with other components."""

    async def test_integration_with_other_component(self):
        """
        Test integration between ComponentA and ComponentB.

        Regime: stabilization
        Weight: 1.00
        """
        component_a = ComponentA()
        component_b = ComponentB()

        # ComponentA produces output
        output_a = await component_a.process(data)

        # ComponentB consumes output
        result = await component_b.consume(output_a)

        assert result.success == True
```

---

## Test Report Template

```markdown
# Test Report: [Component Name]

**Date:** [Date]
**Coverage:** [X%]
**Status:** [PASS/FAIL]

## Test Distribution

| Regime | Tests | Passing | Pass Rate | Weight | Weighted Score |
|--------|-------|---------|-----------|--------|----------------|
| Exploration | X | Y | Z% | 0.70 | ... |
| Optimization | X | Y | Z% | 0.85 | ... |
| Stabilization | X | Y | Z% | 1.00 | ... |
| **Total** | **X** | **Y** | **Z%** | - | **...**  |

## Quality Gate Status

- [x] Stabilization: 100% passing 
- [x] Optimization: e85% passing 
- [x] Exploration: e70% passing 
- [x] Overall coverage e[target]% 

## Performance Benchmarks

| Test | Duration | Target | Status |
|------|----------|--------|--------|
| Small scale (100) | Xms | <100ms |  |
| Medium scale (1K) | Xms | <500ms |  |
| Large scale (10K) | Xms | <2s |  |

## Summary

[Brief summary of test results, any issues, recommendations]

---
*Generated: [Date]*
```

---

## Success Criteria

-  Target coverage achieved
-  Three-regime distribution maintained
-  All stabilization tests 100% passing
-  Performance benchmarks met
-  Test documentation complete

---

**Template Version:** 1.0
**Last Updated:** October 10, 2025

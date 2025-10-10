# Component Builder Template

**Use this template when:** Building a new reusable component for the core library

---

## Task Overview

**Component Name:** `[component_name]`
**Location:** `core/[category]/[component_name].py`
**Purpose:** [Brief one-sentence description]
**Regime Classification:** [Exploration/Optimization/Stabilization]

---

## Requirements Checklist

### Pre-Implementation
- [ ] Read relevant research materials
- [ ] Understand mathematical foundations
- [ ] Review similar existing components
- [ ] Define success criteria
- [ ] Identify complexity bounds

### Core Functionality
- [ ] Core algorithm implemented
- [ ] Type hints on all functions
- [ ] Complexity annotations in docstrings
- [ ] Asymmetrica Protocol semantic tuples
- [ ] Error handling for edge cases

### Testing Requirements
- [ ] Unit tests (90%+ coverage target)
- [ ] Integration tests (if applicable)
- [ ] Edge case tests
- [ ] Performance benchmarks
- [ ] Three-regime distribution maintained

### Documentation
- [ ] Module-level docstring
- [ ] Class/function docstrings with examples
- [ ] README.md in component directory
- [ ] Usage examples
- [ ] Complexity analysis documented

### Validation
- [ ] All tests passing
- [ ] Performance meets requirements
- [ ] Contract QA compliance (if applicable)
- [ ] Asymmetrica Protocol compliance verified

---

## Component Structure Template

```python
"""
[Component Name] - [Brief Description]

Mathematical Foundation:
- Formula: [Mathematical formula if applicable]
- Complexity: O(f(n))
- Source: [Citation or reference]

@complexity: O(f(n))
@lineage: (Ã: "[component_name]", Á: "[parent_module]",
           ³: "[regime]", º: O([complexity]),
           »: ["step1", "step2", "step3"])
@validation: [Validation status]
"""

from typing import [Types]
import [dependencies]


class ComponentName:
    """
    [Detailed component description]

    This component [what it does] by [how it does it].

    Mathematical Foundation:
        [Mathematical explanation if applicable]

    Performance Characteristics:
        - Time Complexity: O(f(n))
        - Space Complexity: O(g(n))
        - Best Case: ©(h(n))
        - Worst Case: O(k(n))

    Attributes:
        attribute_name (type): Description of attribute

    Example:
        >>> component = ComponentName()
        >>> result = component.method(args)
        >>> print(result)
        expected_output

    Validation:
        - X/X tests passing
        - Performance: [benchmarks]
        - Source: [reference]
    """

    def __init__(self, param: Type):
        """
        Initialize the component.

        @complexity: O(1)

        Args:
            param: Description of parameter
        """
        self.param = param

    def core_method(self, input_data: InputType) -> ReturnType:
        """
        [Method description]

        [Detailed explanation of what this method does]

        @complexity: O(f(n)) where n = [description]
        @lineage: (Ã: "core_method", Á: "ComponentName",
                   ³: "[regime]", º: O(f(n)),
                   »: ["validate", "process", "return"])

        Args:
            input_data: Description of input

        Returns:
            Description of return value

        Raises:
            ValueError: When [condition]
            TypeError: When [condition]

        Example:
            >>> result = component.core_method(data)
            >>> assert result.success == True

        Validation: [X/X tests passing]
        """
        # Implementation
        pass
```

---

## Testing Structure Template

```python
"""
Tests for [Component Name]

@complexity: O(t) where t = number of test cases
@lineage: (Ã: "test_component_name", Á: "testing",
           ³: "stabilization", º: O(t),
           »: ["setup", "test", "validate", "teardown"])
"""

import pytest
from core.[category].[component_name] import ComponentName


class TestComponentName:
    """
    Comprehensive test suite for ComponentName.

    Distribution (Three-Regime):
        - Exploration: 30% (edge cases, new features)
        - Optimization: 20% (performance, benchmarks)
        - Stabilization: 50% (critical paths, regression)
    """

    @pytest.fixture
    def component(self):
        """Fixture providing initialized component."""
        return ComponentName()

    # ============================================================
    # EXPLORATION REGIME (30% of tests)
    # Weight: 0.70
    # ============================================================

    def test_edge_case_empty_input(self, component):
        """
        Test component with empty input (edge case).

        Regime: exploration
        Weight: 0.70
        """
        result = component.core_method([])
        assert result is not None

    def test_edge_case_single_element(self, component):
        """
        Test component with single element (edge case).

        Regime: exploration
        Weight: 0.70
        """
        result = component.core_method([1])
        assert result.success == True

    def test_edge_case_invalid_input(self, component):
        """
        Test component with invalid input (error handling).

        Regime: exploration
        Weight: 0.70
        """
        with pytest.raises(ValueError):
            component.core_method(None)

    # ============================================================
    # OPTIMIZATION REGIME (20% of tests)
    # Weight: 0.85
    # ============================================================

    def test_performance_large_scale(self, component):
        """
        Test component performance at large scale (10K elements).

        Regime: optimization
        Weight: 0.85
        """
        large_input = list(range(10000))
        result = component.core_method(large_input)
        assert result.execution_time < 1.0  # < 1 second

    def test_memory_efficiency(self, component):
        """
        Test component memory usage (space complexity).

        Regime: optimization
        Weight: 0.85
        """
        result = component.core_method(list(range(1000)))
        assert result.memory_used < expected_bound

    # ============================================================
    # STABILIZATION REGIME (50% of tests)
    # Weight: 1.00 (MUST be 100% passing)
    # ============================================================

    def test_baseline_functionality(self, component):
        """
        Test baseline functionality with standard input.

        Regime: stabilization
        Weight: 1.00
        """
        result = component.core_method([1, 2, 3, 4, 5])
        assert result.success == True
        assert result.output == expected_output

    def test_critical_path_happy_case(self, component):
        """
        Test critical path with expected input.

        Regime: stabilization
        Weight: 1.00
        """
        result = component.core_method(standard_input)
        assert result == expected_result

    def test_regression_previous_bug(self, component):
        """
        Test that previous bug fix remains fixed.

        Regime: stabilization
        Weight: 1.00
        """
        # Test case that previously failed
        result = component.core_method(problematic_input)
        assert result.success == True
```

---

## README Template

Create `core/[category]/[component_name]/README.md`:

```markdown
# [Component Name]

**Category:** [Category]
**Status:** [Production/Beta/Experimental]
**Test Coverage:** X/X passing

---

## Overview

[Brief description of what this component does and why it exists]

## Mathematical Foundation

[Mathematical formula/algorithm if applicable]

**Complexity:**
- Time: O(f(n))
- Space: O(g(n))

**Source:** [Citation]

---

## Installation

```python
from core.[category].[component_name] import ComponentName
```

---

## Quick Start

```python
# Initialize component
component = ComponentName(param=value)

# Use core method
result = component.core_method(input_data)

# Access results
print(result.output)
```

---

## API Reference

### `ComponentName`

[Description]

**Methods:**
- `core_method(input_data)` - [Description]
- `helper_method()` - [Description]

---

## Performance Benchmarks

| Scale | Time | Memory | Efficiency |
|-------|------|--------|------------|
| 100 | Xms | YKB | Z× |
| 1K | Xms | YKB | Z× |
| 10K | Xms | YMB | Z× |

---

## Examples

### Example 1: Basic Usage
[Code example]

### Example 2: Advanced Usage
[Code example]

---

## Testing

```bash
pytest tests/unit/test_component_name.py -v
```

**Coverage:** X/X tests passing (100%)

---

## References

- [Source 1]
- [Source 2]
- Validation: [Link to validation report]

---

*Last Updated: [Date]*
```

---

## Success Criteria

### Component is complete when:
-  All requirements checklist items checked
-  Unit tests 90%+ passing
-  Stabilization tests 100% passing
-  Documentation complete
-  Performance benchmarks meet requirements
-  Code review approved
-  Asymmetrica Protocol compliant

### Quality Gates:
- **Code Quality:** Type hints, docstrings, complexity annotations
- **Test Quality:** Three-regime distribution maintained
- **Documentation Quality:** README + examples + API docs
- **Performance Quality:** Meets or exceeds benchmarks

---

## Tips for Success

1. **Start with tests** - Write tests first (TDD)
2. **Document as you go** - Don't leave docs for last
3. **Validate early** - Run tests frequently
4. **Benchmark often** - Check performance at each milestone
5. **Follow patterns** - Look at existing components for inspiration

---

**Template Version:** 1.0
**Last Updated:** October 10, 2025
**Maintained by:** Asymmetrica R&D Lab

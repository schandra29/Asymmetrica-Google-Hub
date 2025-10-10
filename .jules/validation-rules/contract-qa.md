# Contract QA Validation Rules

**Purpose:** Ensure API contracts are well-defined, tested, and maintained

---

## What is Contract Testing?

Contract testing validates that:
1. **Interfaces are well-defined** - Clear type signatures and expectations
2. **Behavior is guaranteed** - Components behave as promised
3. **Breaking changes are caught** - API evolution doesn't break consumers

---

## Validation Checklist

### Interface Contracts

- [ ] All public methods have type hints
- [ ] All parameters documented with types
- [ ] Return types explicitly defined
- [ ] Exceptions documented
- [ ] Default values specified

### Behavior Contracts

- [ ] Expected behavior documented
- [ ] Edge cases defined
- [ ] Error conditions specified
- [ ] Performance guarantees stated
- [ ] Side effects documented

### Contract Tests

- [ ] Interface contract tests written
- [ ] Behavior contract tests written
- [ ] All tests passing
- [ ] Tests cover critical paths
- [ ] Tests verify error handling

---

## Contract Test Template

```python
"""
Contract tests for [Component Name]

These tests verify the component's API contract is maintained.
"""

import pytest
from typing import Protocol
from core.[module].[component] import Component


class ComponentContract(Protocol):
    """
    Defines the contract that Component must satisfy.

    This protocol ensures:
    - Required methods exist
    - Method signatures are correct
    - Behavior guarantees are met
    """

    def process(self, data: list[int]) -> dict:
        """
        Process data and return result.

        Contract Guarantees:
        - Returns dict with 'success' key (bool)
        - Returns dict with 'output' key (list)
        - Never raises uncaught exceptions
        - Completes in < 1s for data size d 1000
        """
        ...


class TestComponentContract:
    """Verify Component satisfies its contract."""

    @pytest.fixture
    def component(self) -> Component:
        return Component()

    def test_interface_contract_methods_exist(self, component):
        """
        Verify all required methods exist.

        Contract: Component must have process() method
        """
        assert hasattr(component, 'process')
        assert callable(component.process)

    def test_interface_contract_type_hints(self, component):
        """
        Verify method has correct type hints.

        Contract: process(data: list[int]) -> dict
        """
        import inspect
        sig = inspect.signature(component.process)

        # Check parameter types
        assert 'data' in sig.parameters
        param = sig.parameters['data']
        # Type hint verification

        # Check return type
        assert sig.return_annotation != inspect.Signature.empty

    def test_behavior_contract_success_key(self, component):
        """
        Verify result always has 'success' key.

        Contract: Result must have boolean 'success' key
        """
        result = component.process([1, 2, 3])

        assert 'success' in result
        assert isinstance(result['success'], bool)

    def test_behavior_contract_output_key(self, component):
        """
        Verify result always has 'output' key.

        Contract: Result must have list 'output' key
        """
        result = component.process([1, 2, 3])

        assert 'output' in result
        assert isinstance(result['output'], list)

    def test_behavior_contract_no_uncaught_exceptions(self, component):
        """
        Verify component doesn't raise uncaught exceptions.

        Contract: All exceptions handled gracefully
        """
        # Should not raise, even with problematic input
        result = component.process([])  # Empty
        assert result is not None

        result = component.process([1] * 10000)  # Large
        assert result is not None

    def test_behavior_contract_performance(self, component):
        """
        Verify component meets performance guarantee.

        Contract: < 1s for data size d 1000
        """
        import time

        data = list(range(1000))
        start = time.perf_counter()
        result = component.process(data)
        duration = time.perf_counter() - start

        assert result['success'] == True
        assert duration < 1.0  # Contract: < 1 second

    def test_behavior_contract_idempotence(self, component):
        """
        Verify repeated calls produce same result.

        Contract: Component is idempotent
        """
        data = [1, 2, 3]

        result1 = component.process(data)
        result2 = component.process(data)

        assert result1 == result2

    def test_backward_compatibility(self, component):
        """
        Verify component maintains backward compatibility.

        Contract: Old API still works
        """
        # If API evolved, verify old usage still works
        result = component.process([1, 2, 3])  # Old signature
        assert result is not None
```

---

## Breaking Change Detection

### What Constitutes a Breaking Change?

L **Breaking Changes:**
- Removing a public method
- Changing method signature (parameters/return type)
- Changing behavior without version bump
- Removing guaranteed properties from return values
- Making method raise new exception types

 **Non-Breaking Changes:**
- Adding new methods
- Adding optional parameters with defaults
- Adding new properties to return values
- Improving performance
- Fixing bugs (unless bug was being relied upon)

### How to Evolve APIs Safely

1. **Deprecation Period:**
   ```python
   import warnings

   def old_method(self, data):
       """Deprecated: Use new_method() instead."""
       warnings.warn(
           "old_method is deprecated, use new_method",
           DeprecationWarning,
           stacklevel=2
       )
       return self.new_method(data)
   ```

2. **Version Bumping:**
   - Major version: Breaking changes
   - Minor version: New features (backward compatible)
   - Patch version: Bug fixes

3. **Contract Testing:**
   - Write tests for old API
   - Keep tests passing during transition
   - Only remove after deprecation period

---

## Success Criteria

### Contract QA Passes When:

-  All interface contracts defined (Protocol or abstract base class)
-  All behavior contracts documented
-  Contract tests written and passing
-  No breaking changes without version bump
-  Backward compatibility maintained

---

## Integration with CI/CD

```yaml
# .github/workflows/contract-qa.yml
name: Contract QA

on: [push, pull_request]

jobs:
  contract-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Contract Tests
        run: |
          pytest tests/contract/ -v --tb=short
      - name: Check for Breaking Changes
        run: |
          python scripts/detect_breaking_changes.py
```

---

**Validation Framework Version:** 1.0
**Last Updated:** October 10, 2025
**Maintained by:** Asymmetrica R&D Lab

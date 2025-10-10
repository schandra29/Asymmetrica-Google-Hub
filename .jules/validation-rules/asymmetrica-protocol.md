# Asymmetrica Protocol Validation Rules

**Purpose:** Ensure all code follows Asymmetrica Protocol standards

---

## Core Principles

1. **Evidence-Based** - All claims backed by empirical validation
2. **No Hyperbole** - Use measured metrics, not marketing language
3. **Complexity Annotations** - All functions document their complexity
4. **Semantic Tuples** - Lineage tracking for all components
5. **Test Coverage** - Three-regime distribution maintained

---

## Validation Checklist

### Code Quality

- [ ] All functions have type hints
- [ ] All public APIs have docstrings
- [ ] Complexity annotations present (@complexity)
- [ ] Semantic tuples documented (@lineage)
- [ ] No unvalidated claims in comments/docs

### Testing

- [ ] Three-regime distribution maintained (30/20/50)
- [ ] Stabilization tests 100% passing
- [ ] Optimization tests e85% passing
- [ ] Exploration tests e70% passing
- [ ] Test docstrings specify regime

### Documentation

- [ ] Evidence-based claims only
- [ ] Validation sources cited
- [ ] Performance metrics quantified
- [ ] Mathematical foundations explained
- [ ] No mystical/esoteric language

---

## Semantic Tuple Format

**Required in all component docstrings:**

```python
@lineage: (Ã: "signature", Á: "root", ³: "genre",
           º: complexity, »: ["flow", "steps"])
```

**Elements:**
- **Ã (Sigma)** - Component signature/name
- **Á (Rho)** - Root/parent module
- **³ (Gamma)** - Genre/regime classification
- **º (Kappa)** - Complexity bound
- **» (Lambda)** - Logical flow steps

**Example:**
```python
@lineage: (Ã: "williams_optimizer", Á: "defensekit",
           ³: "optimization", º: O(t log t),
           »: ["calculate", "optimize", "validate", "return"])
```

---

## Complexity Annotation Standards

### Required Format

```python
@complexity: O(f(n)) where n = [description]
@space: O(g(n))  # If space != O(1)
```

### Complexity Classes Reference

| Notation | Name | Description |
|----------|------|-------------|
| O(1) | Constant | Fixed operations |
| O(log n) | Logarithmic | Halving search space |
| O(n) | Linear | Single pass |
| O(n log n) | Linearithmic | Divide and conquer |
| O(n²) | Quadratic | Nested iterations |
| O(t log t) | Williams bound | Space-efficient |

---

## Evidence-Based Claims

###  Valid Claim Example

```python
"""
Williams Optimizer achieves 7.5× efficiency improvement
at 10K operations (empirically validated, 29/29 tests passing).

Source: iPermit DefenseKit Day 141
Validation: C:\Projects\iPermit-rebuild\backend\tests\unit\
"""
```

**Why valid:**
- Specific metric (7.5×)
- Specific scale (10K operations)
- Validation proof (29/29 tests)
- Source citation

### L Invalid Claim Example

```python
"""
Williams Optimizer is incredibly fast and will revolutionize computing.
"""
```

**Why invalid:**
- Vague ("incredibly fast")
- Hyperbolic ("revolutionize")
- No metrics
- No validation proof

---

## Three-Regime Test Distribution

### Required Distribution

```python
REGIME_DISTRIBUTION = {
    'exploration': 30%,     # Edge cases, new features
    'optimization': 20%,    # Performance, refactoring
    'stabilization': 50%    # Critical paths, regression
}
```

### Pass Rate Thresholds

| Regime | Weight | Minimum Pass Rate |
|--------|--------|-------------------|
| Exploration | 0.70 | 70% |
| Optimization | 0.85 | 85% |
| Stabilization | 1.00 | 100% |

### Test Regime Annotation

```python
def test_edge_case_empty_input(self):
    """
    Test handling of empty input.

    Regime: exploration
    Weight: 0.70
    """
    pass
```

---

## Documentation Standards

### Module-Level Docstring

```python
"""
[Module Name] - [Brief Description]

Mathematical Foundation:
    [Formula or algorithm if applicable]

Performance Characteristics:
    - Time: O(f(n))
    - Space: O(g(n))

@complexity: O(f(n))
@lineage: (Ã: "module_name", Á: "parent",
           ³: "regime", º: O(f(n)),
           »: ["step1", "step2"])

Example:
    >>> from module import Component
    >>> result = Component().process([1, 2, 3])
    >>> print(result)
    [1, 4, 9]

Validation: X/X tests passing
Source: [Citation or reference]
"""
```

### Function-Level Docstring

```python
def function_name(param: Type) -> ReturnType:
    """
    [One-line description]

    [Detailed explanation]

    @complexity: O(f(n)) where n = [description]
    @lineage: (Ã: "function_name", Á: "module",
               ³: "regime", º: O(f(n)),
               »: ["validate", "process", "return"])

    Args:
        param: Description with type information

    Returns:
        Description of return value

    Raises:
        ValueError: When [condition]

    Example:
        >>> result = function_name(data)
        >>> assert result.success == True

    Validation: X/X tests passing
    """
    pass
```

---

## Validation Script

```python
"""
Asymmetrica Protocol Compliance Checker

Run this script to validate protocol compliance.
"""

import ast
import re
from pathlib import Path


def check_complexity_annotation(node):
    """Check if function has @complexity annotation."""
    if not node.body:
        return False

    docstring = ast.get_docstring(node)
    if not docstring:
        return False

    return '@complexity:' in docstring


def check_lineage_tuple(node):
    """Check if component has @lineage tuple."""
    docstring = ast.get_docstring(node)
    if not docstring:
        return False

    return '@lineage:' in docstring


def check_type_hints(node):
    """Check if function has type hints."""
    if not hasattr(node, 'args'):
        return True  # Not a function

    # Check return annotation
    if node.returns is None:
        return False

    # Check parameter annotations
    for arg in node.args.args:
        if arg.annotation is None:
            return False

    return True


def validate_file(file_path: Path):
    """Validate a single Python file."""
    with open(file_path) as f:
        tree = ast.parse(f.read())

    issues = []

    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            if not check_type_hints(node):
                issues.append(f"Missing type hints: {node.name}")

            if not check_complexity_annotation(node):
                issues.append(f"Missing complexity annotation: {node.name}")

        if isinstance(node, ast.ClassDef):
            if not check_lineage_tuple(node):
                issues.append(f"Missing lineage tuple: {node.name}")

    return issues


# Usage:
# python scripts/validate_protocol.py core/
```

---

## Success Criteria

### Protocol Compliance Achieved When:

-  All functions have type hints
-  All public APIs have complexity annotations
-  All components have semantic tuples
-  Three-regime test distribution maintained
-  All claims evidence-based and cited
-  No hyperbolic or unvalidated language

---

**Validation Framework Version:** 1.0
**Last Updated:** October 10, 2025
**Maintained by:** Asymmetrica R&D Lab

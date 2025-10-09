# Jules Protocol Guide - Asymmetrica Standards

**Purpose:** Complete guide for Jules.Google to ensure all outputs comply with Asymmetrica Protocol standards.

**Last Updated:** October 8, 2025
**Framework:** Asymmetrica + MathAlive + Neutral Historian Protocol

---

## TABLE OF CONTENTS

1. [Neutral Historian Protocol](#neutral-historian-protocol)
2. [Quality Standards](#quality-standards)
3. [Evidence-Based Decision Making](#evidence-based-decision-making)
4. [Code Style Conventions](#code-style-conventions)
5. [Documentation Requirements](#documentation-requirements)
6. [Test Coverage Requirements](#test-coverage-requirements)
7. [Complexity Annotation Standards](#complexity-annotation-standards)
8. [Workflow Quality Gates](#workflow-quality-gates)

---

## NEUTRAL HISTORIAN PROTOCOL

### Core Principle

Transform esoteric/grimoire language into rigorous scientific language while preserving perfect factual fidelity.

### Language Translation Rules

#### ❌ AVOID (Esoteric/Grimoire Language)

| Avoid | Reason |
|-------|--------|
| "Sacred geometry" | Mystical connotation |
| "Blessed journey" | Religious overtone |
| "Universe blessed us" | Anthropomorphic attribution |
| "Stars aligned" | Metaphysical claim |
| "Divine inspiration" | Supernatural attribution |
| "Cosmic consciousness" | Unverifiable claim |
| "Channeling energy" | Pseudoscientific |
| "Vibrational frequency of love" | Not measurable |

#### ✅ USE (Rigorous Scientific Language)

| Use | Reason |
|-----|--------|
| "Geometric patterns" | Measurable, observable |
| "Research investigation" | Methodological process |
| "Empirical validation confirmed" | Evidence-based claim |
| "Conditions converged" | Causal analysis |
| "Pattern recognition" | Cognitive process |
| "Mathematical structure" | Formal definition |
| "Statistical correlation" | Quantifiable relationship |
| "Validated hypothesis" | Scientific method |

### Translation Examples

#### Before (Grimoire):
> "The sacred journey through the Collatz labyrinth revealed divine patterns where consciousness itself guided us to the blessed convergence point. The universe whispered the answer through synchronicity and cosmic alignment."

#### After (Neutral Historian):
> "Analysis of Collatz sequence behavior identified convergence patterns. Statistical validation (p < 0.001) confirmed the hypothesis that all positive integers converge to 1. The pattern was discovered through systematic exploration of sequence dynamics."

### Preservation Requirements

✅ **Always Preserve:**
- Timeline and chronology
- Mathematical proofs and formulas
- Empirical validation results
- Test coverage metrics
- Attribution and citations
- Performance benchmarks
- Statistical significance values

❌ **Never Alter:**
- Numerical data
- Test pass/fail counts
- Complexity annotations
- Formula derivations
- Source code logic

### Neutral Historian Checklist

Before submitting any synthesis, verify:

- [ ] All mystical language removed
- [ ] All factual information preserved
- [ ] All formulas intact
- [ ] All metrics unchanged
- [ ] All citations present
- [ ] Timeline accurate
- [ ] Attribution complete
- [ ] Statistical rigor maintained

---

## QUALITY STANDARDS

### Test Coverage Requirements

#### Three-Regime Distribution

All new test suites must follow TSP-optimized distribution:

```python
REQUIRED_DISTRIBUTION = {
    'exploration': 33.85%,    # Edge cases, new features
    'optimization': 28.72%,   # Performance, refactoring
    'stabilization': 37.44%   # Critical paths, regression
}
```

#### Pass Rate Thresholds

| Regime | Minimum Pass Rate | Confidence Weight |
|--------|------------------|-------------------|
| Exploration | 70% | 0.70 |
| Optimization | 85% | 0.85 |
| Stabilization | 100% | 1.00 |

**Critical:** Stabilization tests MUST achieve 100% pass rate before promotion to production.

### Code Coverage

- **Unit Tests:** ≥80% line coverage
- **Integration Tests:** ≥70% path coverage
- **Critical Paths:** 100% branch coverage

### Documentation Coverage

- **All public functions:** Docstrings required
- **All classes:** Class-level documentation required
- **All modules:** Module-level documentation required
- **All complexity > O(n):** Performance notes required

---

## EVIDENCE-BASED DECISION MAKING

### Core Principles

1. **No Unvalidated Claims:** Every assertion must have empirical support
2. **No Hyperbole:** Only use measured metrics (e.g., "1.5×" not "blazingly fast")
3. **No Theoretical-Only Content:** All patterns must be empirically validated
4. **No Overfitting:** Generalization must be tested across domains

### Validation Requirements

#### For Any New Pattern/Algorithm

✅ **Required:**
- Statistical significance (p < 0.05 minimum)
- Sample size justification (power analysis)
- Comparison to baseline
- Effect size calculation
- Cross-validation (if applicable)

✅ **Recommended:**
- Multiple domain validation
- Edge case testing
- Performance benchmarking
- Complexity analysis

### Making Claims

#### ✅ VALID CLAIM FORMAT

> "Williams Optimizer achieved 7.5× efficiency improvement at 10K operations (empirically validated, 29/29 tests passing, source: iPermit DefenseKit Day 141)."

**Why valid:**
- Specific metric (7.5×)
- Specific scale (10K operations)
- Validation proof (29/29 tests)
- Source citation (iPermit Day 141)

#### ❌ INVALID CLAIM FORMAT

> "Williams Optimizer is incredibly fast and will revolutionize computing."

**Why invalid:**
- Vague ("incredibly fast")
- Hyperbolic ("revolutionize")
- No metrics
- No validation proof

### Statistical Standards

Use these thresholds:

| Significance Level | Use Case |
|-------------------|----------|
| p < 0.05 | Standard threshold for validation |
| p < 0.01 | Strong evidence threshold |
| p < 0.001 | Very strong evidence |
| p < 3.86×10⁻⁴⁸ | MathAlive Gravity constant (extreme confidence) |

### Confidence Intervals

Always report confidence intervals with effect sizes:

```python
# Example reporting format
mean_improvement = 13.83
std_deviation = 20.97
confidence_95 = (mean_improvement - 1.96*std_deviation,
                 mean_improvement + 1.96*std_deviation)

print(f"Mean: {mean_improvement}% (95% CI: [{confidence_95[0]:.2f}, {confidence_95[1]:.2f}])")
# Output: "Mean: 13.83% (95% CI: [-27.28, 54.94])"
```

---

## CODE STYLE CONVENTIONS

### Python Standards

#### Type Hints (Required)

```python
# ✅ CORRECT
def calculate_space_bound(time_complexity: int) -> dict:
    """Calculate Williams space-efficient bound."""
    return {'bound': sqrt(time_complexity) * log2(time_complexity)}

# ❌ INCORRECT
def calculate_space_bound(time_complexity):
    """Calculate Williams space-efficient bound."""
    return {'bound': sqrt(time_complexity) * log2(time_complexity)}
```

#### Docstrings (Required Format)

```python
def function_name(arg1: type1, arg2: type2) -> return_type:
    """
    One-line summary of function purpose.

    Detailed description of what the function does, how it works,
    and any important implementation details.

    @complexity: O(f(n))
    @lineage: (σ: "name", ρ: "origin", γ: "category",
               κ: complexity, λ: ["flow", "steps"])

    Args:
        arg1: Description of first argument
        arg2: Description of second argument

    Returns:
        Description of return value

    Raises:
        ExceptionType: When and why this exception is raised

    Example:
        >>> function_name(value1, value2)
        expected_output

    Validation: X/X tests passing (source: location)
    Source: Citation or reference
    """
    pass
```

#### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Functions | snake_case | `calculate_space_bound()` |
| Classes | PascalCase | `WilliamsOptimizer` |
| Constants | UPPER_SNAKE_CASE | `TESLA_FREQUENCY_HZ` |
| Private | _leading_underscore | `_internal_helper()` |
| Modules | snake_case | `williams_optimizer.py` |

### JavaScript/TypeScript Standards

#### Type Annotations (Required for TypeScript)

```typescript
// ✅ CORRECT
function calculateSpaceBound(timeComplexity: number): {
  bound: number;
  efficiency: number;
} {
  return {
    bound: Math.sqrt(timeComplexity) * Math.log2(timeComplexity),
    efficiency: timeComplexity / bound
  };
}

// ❌ INCORRECT (missing types)
function calculateSpaceBound(timeComplexity) {
  // ...
}
```

#### JSDoc Comments (Required)

```javascript
/**
 * Calculate Williams space-efficient bound for given time complexity.
 *
 * @complexity O(1)
 * @lineage (σ: "williams_optimizer", ρ: "defensekit",
 *           γ: "optimization", κ: O(√t log t),
 *           λ: ["calculate", "optimize", "validate"])
 *
 * @param {number} timeComplexity - Total number of operations
 * @returns {{bound: number, efficiency: number}} Space bound and efficiency
 *
 * @example
 * const result = calculateSpaceBound(1000);
 * console.log(result.efficiency); // ~10.07
 *
 * @validation 29/29 tests passing (source: iPermit DefenseKit Day 141)
 */
function calculateSpaceBound(timeComplexity) {
  // implementation
}
```

---

## DOCUMENTATION REQUIREMENTS

### README.md Structure

Every component must have a README with:

1. **Title and one-line description**
2. **Installation instructions**
3. **Quick start example**
4. **API reference** (or link to full docs)
5. **Complexity analysis**
6. **Performance benchmarks**
7. **Test coverage metrics**
8. **Source citations**

### Inline Comments

#### When to Comment

✅ **Comment when:**
- Logic is non-obvious
- Algorithm has specific complexity requirement
- Formula has mathematical derivation
- Performance optimization is critical
- Edge case handling is necessary

❌ **Don't comment:**
- Obvious code (`i++` doesn't need "increment i")
- Self-documenting names (`calculate_total()` is clear)
- Redundant information already in docstring

#### Comment Format

```python
# Williams Space-Efficient Bound: √t × log₂(t)
# Source: Ryan Williams (MIT, 2011)
# Empirical validation: 29/29 tests, 1.5×-7.5× efficiency improvement
williams_bound = sqrt(time_complexity) * log2(time_complexity)
```

### Complexity Documentation

Always document complexity at function level:

```python
@complexity: O(f(n))          # Time complexity
@space: O(g(n))               # Space complexity (if different from O(1))
@best_case: Ω(h(n))           # Best case (if different from average)
@worst_case: O(k(n))          # Worst case (if different from average)
```

---

## TEST COVERAGE REQUIREMENTS

### Unit Tests

#### Minimum Coverage

- **All public functions:** 100% tested
- **All edge cases:** Covered
- **All error paths:** Tested
- **All regimes:** Represented

#### Test Structure

```python
import pytest

class TestWilliamsOptimizer:
    """Test suite for Williams Space Optimizer."""

    @pytest.fixture
    def optimizer(self):
        """Fixture providing initialized optimizer."""
        return WilliamsOptimizer()

    # EXPLORATION REGIME (33.85% of tests)
    def test_edge_case_zero_operations(self, optimizer):
        """Test Williams bound with zero operations (edge case)."""
        # Regime: exploration
        # Weight: 0.70
        pass

    def test_edge_case_single_operation(self, optimizer):
        """Test Williams bound with single operation (edge case)."""
        # Regime: exploration
        # Weight: 0.70
        pass

    # OPTIMIZATION REGIME (28.72% of tests)
    def test_performance_large_scale(self, optimizer):
        """Test Williams bound performance at 10K operations."""
        # Regime: optimization
        # Weight: 0.85
        pass

    # STABILIZATION REGIME (37.44% of tests)
    def test_baseline_calculation(self, optimizer):
        """Test Williams bound with standard 1000 operations."""
        # Regime: stabilization
        # Weight: 1.00
        pass
```

### Integration Tests

Test component interactions:

```python
def test_williams_harmonic_integration():
    """
    Test Williams Optimizer + Harmonic Timer integration.

    Verifies that optimal batch sizes are processed with
    harmonic timing between batches.

    @complexity: O(n) where n = number of batches
    @regime: stabilization (critical integration path)
    """
    optimizer = WilliamsOptimizer()
    timer = HarmonicTimer()

    docs = load_test_documents(1000)
    batch_config = optimizer.calculate(len(docs))

    for batch in create_batches(docs, batch_config.optimal_batch_size):
        process_batch(batch)
        timer.wait(Harmonic.SINGLE)  # Rate limiting

    assert_all_processed(docs)
```

### Contract Tests

Define API contracts:

```python
def test_williams_optimizer_contract():
    """
    Contract test: Williams Optimizer must satisfy interface.

    Required methods:
    - calculate(time_complexity: int) -> SpaceBoundResult
    - apply_leverage(regime: str) -> float

    Required properties:
    - Efficiency always > 1.0
    - Space reduction always 0-100%
    - Calculation time < 1ms
    """
    optimizer = WilliamsOptimizer()

    # Interface contract
    assert hasattr(optimizer, 'calculate')
    assert hasattr(optimizer, 'apply_leverage')

    # Behavior contract
    result = optimizer.calculate(1000)
    assert result.efficiency > 1.0
    assert 0 <= result.space_reduction_percent <= 100
```

---

## COMPLEXITY ANNOTATION STANDARDS

### Required Annotations

Every function/method must include complexity annotation:

```python
@complexity: O(f(n))  # Required
@space: O(g(n))       # If space != O(1)
```

### Complexity Classes Reference

| Notation | Name | Description | Example |
|----------|------|-------------|---------|
| O(1) | Constant | Fixed operations | Hash lookup |
| O(log n) | Logarithmic | Halving search space | Binary search |
| O(n) | Linear | Single pass | Array scan |
| O(n log n) | Linearithmic | Divide and conquer | Merge sort |
| O(n²) | Quadratic | Nested iterations | Bubble sort |
| O(2ⁿ) | Exponential | Combinatorial | Subset generation |
| O(√t log t) | Williams bound | Space-efficient | Williams optimizer |

### Domain-Specific Complexities

#### Williams Optimizer
```
Time: O(1)           # Calculation is constant
Space: O(√t log t)   # Memory allocation follows bound
```

#### Three-Regime Planner
```
Time: O(1)           # Classification is constant
Space: O(1)          # Fixed data structures
```

#### Harmonic Timer
```
Time: O(1)           # Delay calculation is constant
Space: O(1)          # No memory allocation
```

---

## WORKFLOW QUALITY GATES

### Pre-Implementation Checklist

Before starting any implementation, verify:

- [ ] Requirements clearly defined
- [ ] Success criteria measurable
- [ ] Baseline performance established
- [ ] Test strategy documented
- [ ] Complexity bounds identified
- [ ] Validation approach planned

### During Implementation Checklist

While implementing:

- [ ] Type hints on all functions
- [ ] Docstrings on all public APIs
- [ ] Complexity annotations present
- [ ] Unit tests written (test-driven)
- [ ] Edge cases identified and tested
- [ ] Performance benchmarks collected

### Pre-Commit Checklist

Before committing code:

- [ ] All tests passing
- [ ] No regression in existing tests
- [ ] Code coverage maintained/improved
- [ ] Documentation updated
- [ ] Complexity analysis verified
- [ ] No unvalidated claims in comments
- [ ] Neutral Historian review (if synthesis)

### Pre-Production Checklist

Before deploying to production:

- [ ] Stabilization tests 100% passing
- [ ] Integration tests passing
- [ ] Performance benchmarks meet SLA
- [ ] Security review complete
- [ ] Documentation complete
- [ ] Monitoring/alerting configured
- [ ] Rollback plan documented

---

## ASYMMETRICA PROTOCOL COMPLIANCE

### Semantic Tuple Format (Required)

All functions must include lineage annotation:

```python
@lineage: (σ: "signature", ρ: "root", γ: "genre",
           κ: complexity, λ: ["flow", "steps"])
```

### Example Compliance

```python
def calculate_optimal_batch_size(documents: list) -> int:
    """
    Calculate optimal batch size using Williams space bounds.

    Uses √t × log₂(t) formula to determine space-efficient
    batch allocation for document processing.

    @complexity: O(1)
    @lineage: (σ: "batch_optimizer", ρ: "williams_optimizer",
               γ: "optimization", κ: O(√t log t),
               λ: ["count", "calculate", "validate", "return"])

    Args:
        documents: List of document paths to process

    Returns:
        Optimal batch size (int) based on Williams bounds

    Validation: 29/29 tests passing, 1.5×-7.5× efficiency
    Source: iPermit DefenseKit integration (Day 141)
    Reference: JULES_MATH_CONTEXT.md § Williams Space Optimizer
    """
    time_complexity = len(documents)
    williams_bound = sqrt(time_complexity) * log2(time_complexity)

    return int(williams_bound)
```

### Non-Compliant Example (Don't Do This)

```python
# ❌ MISSING: Type hints
# ❌ MISSING: Complexity annotation
# ❌ MISSING: Lineage tuple
# ❌ MISSING: Validation proof
# ❌ VAGUE: "really fast"
def optimize(docs):
    """Make batch processing really fast."""
    return len(docs) // 10
```

---

## COLLABORATION PROTOCOL

### Working with Humans

When Jules receives instructions from humans:

✅ **DO:**
- Ask clarifying questions if requirements unclear
- Provide multiple solution options when applicable
- Explain trade-offs between approaches
- Cite specific validation sources
- Link to JULES_MATH_CONTEXT.md for formulas

❌ **DON'T:**
- Assume requirements without confirmation
- Implement without understanding "why"
- Skip validation steps to move faster
- Add features not explicitly requested

### Reporting Progress

Use this format for status updates:

```markdown
## Progress Update: [Task Name]

**Status:** [In Progress / Blocked / Complete]

**Completed:**
- [x] Item 1 with specific metrics
- [x] Item 2 with validation proof

**In Progress:**
- [ ] Item 3 (80% complete, blocked by X)

**Blocked:**
- [ ] Item 4 (waiting for Y)

**Metrics:**
- Tests passing: X/Y (Z%)
- Code coverage: A%
- Performance: B× improvement

**Next Steps:**
1. Specific action 1
2. Specific action 2

**References:**
- JULES_MATH_CONTEXT.md § Section Name
- Validation source: File path, line numbers
```

---

## EXAMPLE WORKFLOW: IMPLEMENTING NEW FEATURE

### Step-by-Step Protocol Compliance

1. **Understand Requirements**
   - Read feature spec thoroughly
   - Identify success criteria
   - Note quality gates

2. **Research Context**
   - Check JULES_MATH_CONTEXT.md for relevant formulas
   - Review existing implementations
   - Identify similar patterns

3. **Design Solution**
   - Sketch algorithm
   - Analyze complexity
   - Plan test strategy

4. **Implement with Protocol**
   ```python
   def new_feature(input: Type) -> ReturnType:
       """
       [One-line description]

       [Detailed description]

       @complexity: O(f(n))
       @lineage: (σ: "...", ρ: "...", γ: "...",
                  κ: O(...), λ: ["..."])

       Args:
           input: Description

       Returns:
           Description

       Validation: Planned (not yet run)
       """
       pass
   ```

5. **Write Tests**
   - Follow three-regime distribution
   - Cover edge cases
   - Test error paths

6. **Run Validation**
   - Execute test suite
   - Collect metrics
   - Compare to baseline

7. **Update Documentation**
   - Update docstring with validation results
   - Add to README if public API
   - Link to test files

8. **Pre-Commit Review**
   - Run through checklist
   - Verify protocol compliance
   - Confirm all tests passing

---

## REFERENCES

### Primary Documents

- **JULES_MATH_CONTEXT.md** - All validated formulas and empirical metrics
- **AGENTS.md** - Workflow loop definitions and project context
- **README.md** - Project overview and quick start

### Validation Sources

- iPermit DefenseKit: `C:\Projects\iPermit-rebuild\backend\tests\unit\`
- Agent Quebec Reports: `C:\Projects\iPermit-rebuild\AGENT_QUEBEC_MISSION_COMPLETE.md`
- Tier 2 Validation: `C:\Projects\iPermit-rebuild\DefenseKit_Final\TIER2_VALIDATION_REPORT.md`

### External Standards

- Python PEP 8: Style guide for Python code
- Python PEP 484: Type hints
- JSDoc: JavaScript documentation standard
- OpenAPI 3.1: API documentation standard

---

## REVISION HISTORY

| Date | Version | Changes |
|------|---------|---------|
| 2025-10-08 | 1.0 | Initial protocol guide for Jules.Google |

---

**Protocol Status:** Active
**Compliance Required:** All Jules outputs
**Review Frequency:** Monthly or per major validation milestone

*"Better Math for Everyone!"* - Asymmetrica R&D Laboratory

# Documentation Task Template

**Use this template when:** Writing technical documentation, guides, or API docs

---

## Task Overview

**Documentation Type:** [README/Guide/API Docs/Tutorial]
**Target Audience:** [Developers/Users/Researchers]
**Scope:** [Brief description]
**Regime:** [Exploration/Optimization/Stabilization]

---

## Requirements Checklist

### Planning
- [ ] Understand target audience
- [ ] Identify documentation gaps
- [ ] Review existing documentation
- [ ] Define structure and scope

### Content Creation
- [ ] Introduction/overview written
- [ ] Core content complete
- [ ] Code examples included
- [ ] Diagrams/visualizations added (if needed)
- [ ] References/citations included

### Quality Assurance
- [ ] Technical accuracy verified
- [ ] Code examples tested and working
- [ ] Grammar and spelling checked
- [ ] Formatting consistent
- [ ] Links validated

### Asymmetrica Protocol
- [ ] Complexity annotations included
- [ ] Evidence-based claims only
- [ ] Validation sources cited
- [ ] Semantic tuples documented (if code)

---

## README Template

```markdown
# [Component/Project Name]

**Version:** [X.Y.Z]
**Status:** [Production/Beta/Experimental]
**Last Updated:** [Date]

---

## Overview

[1-2 paragraph description of what this is and why it exists]

**Key Features:**
- Feature 1
- Feature 2
- Feature 3

---

## Installation

```bash
# Installation instructions
pip install [package]
# or
npm install [package]
```

---

## Quick Start

```python
# Minimal example showing basic usage
from module import Component

component = Component()
result = component.do_something()
print(result)
```

**Expected output:**
```
[expected output]
```

---

## Core Concepts

### Concept 1: [Name]
[Explanation with examples]

### Concept 2: [Name]
[Explanation with examples]

---

## API Reference

### `ClassName`

[Description]

**Methods:**
- `method_name(arg1, arg2)` - [Description]
  - **Args:** [arg descriptions]
  - **Returns:** [return description]
  - **Complexity:** O(f(n))

---

## Examples

### Example 1: [Use Case]
```python
# Code example
```

### Example 2: [Advanced Use Case]
```python
# Code example
```

---

## Performance

| Operation | Complexity | Benchmark |
|-----------|------------|-----------|
| Operation 1 | O(n) | Xms per 1K items |
| Operation 2 | O(log n) | Yms per 1K items |

---

## Testing

```bash
# Run tests
pytest tests/ -v
```

**Coverage:** X% (Y/Z tests passing)

---

## Contributing

[Contribution guidelines]

---

## References

- [Source 1]
- [Source 2]
- Validation: [Link to validation report]

---

## License

[License information]

---

*Maintained by: [Team/Individual]*
*Documentation Version: X.Y.Z*
```

---

## Tutorial/Guide Template

```markdown
# [Tutorial Title]

**Difficulty:** [Beginner/Intermediate/Advanced]
**Duration:** [Estimated time]
**Prerequisites:** [Required knowledge/setup]

---

## What You'll Learn

By the end of this tutorial, you'll be able to:
- [Learning objective 1]
- [Learning objective 2]
- [Learning objective 3]

---

## Prerequisites

Before starting, ensure you have:
- [Prerequisite 1]
- [Prerequisite 2]

---

## Step 1: [Step Title]

[Explanation]

```python
# Code for this step
```

**What's happening:**
- [Explanation of code]

---

## Step 2: [Step Title]

[Explanation]

```python
# Code for this step
```

---

## Step 3: [Step Title]

[Continue pattern...]

---

## Putting It All Together

```python
# Complete working example
```

---

## Next Steps

Now that you've completed this tutorial:
- Try [suggestion 1]
- Explore [suggestion 2]
- Read [related tutorial]

---

## Troubleshooting

### Issue: [Common problem]
**Solution:** [How to fix]

### Issue: [Another problem]
**Solution:** [How to fix]

---

## Summary

[Brief recap of what was learned]

---

*Tutorial Version: X.Y.Z*
*Last Updated: [Date]*
```

---

## API Documentation Template

```python
"""
[Module Name] - [Brief Description]

This module provides [functionality description].

@complexity: O(f(n))
@lineage: (Ã: "[module_name]", Á: "[parent]",
           ³: "[regime]", º: O([complexity]),
           »: ["step1", "step2", "step3"])

Example:
    Basic usage example:

    >>> from module import Component
    >>> component = Component()
    >>> result = component.process([1, 2, 3])
    >>> print(result)
    [1, 4, 9]

Attributes:
    CONSTANT_NAME (type): Description of module-level constant

Validation: [X/X tests passing, source: location]
"""


class ClassName:
    """
    [Detailed class description]

    This class [what it does] by [how it does it].

    Mathematical Foundation:
        [Mathematical explanation if applicable]

    Performance Characteristics:
        - Time Complexity: O(f(n))
        - Space Complexity: O(g(n))

    Attributes:
        attribute_name (type): Description

    Example:
        >>> obj = ClassName(param=value)
        >>> result = obj.method(data)
        >>> print(result.status)
        'success'

    Validation: [Test status]
    """

    def __init__(self, param: Type):
        """
        Initialize the class.

        @complexity: O(1)

        Args:
            param: Description of parameter

        Raises:
            ValueError: When param is invalid

        Example:
            >>> obj = ClassName(param=42)
            >>> obj.param
            42
        """
        self.param = param

    def method_name(self, arg: ArgType) -> ReturnType:
        """
        [Method description - one line]

        [Detailed explanation of what this method does,
        how it works, and any important considerations]

        @complexity: O(f(n)) where n = [description]
        @lineage: (Ã: "method_name", Á: "ClassName",
                   ³: "[regime]", º: O(f(n)),
                   »: ["validate", "process", "return"])

        Args:
            arg: Description of argument
                Additional details about the argument

        Returns:
            Description of return value with type info

        Raises:
            ValueError: When [condition]
            TypeError: When [condition]

        Example:
            >>> obj = ClassName(param=value)
            >>> result = obj.method_name(data)
            >>> assert result.success == True

        Note:
            Any important notes or warnings

        Validation: [X/X tests passing]
        """
        pass
```

---

## Checklist for Quality Documentation

### Content Quality
- [ ] Clear and concise writing
- [ ] No jargon without explanation
- [ ] Code examples are working and tested
- [ ] Diagrams aid understanding
- [ ] Progressive disclosure (simple ’ complex)

### Technical Accuracy
- [ ] All code examples run without errors
- [ ] Complexity annotations correct
- [ ] Performance claims backed by benchmarks
- [ ] Citations for external sources
- [ ] Validation status current

### Usability
- [ ] Table of contents for long docs
- [ ] Search-friendly headings
- [ ] Cross-references to related docs
- [ ] Troubleshooting section
- [ ] Next steps guidance

### Asymmetrica Protocol
- [ ] Evidence-based claims only
- [ ] No unvalidated hyperbole
- [ ] Semantic tuples where applicable
- [ ] Complexity annotations present
- [ ] Validation sources cited

---

## Success Criteria

-  Documentation serves target audience
-  All code examples work
-  Technical accuracy verified
-  Asymmetrica Protocol compliant
-  Reviewed and approved

---

**Template Version:** 1.0
**Last Updated:** October 10, 2025

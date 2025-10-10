# Jules AI Lab - Asymmetrica R&D Environment

**Welcome to the Asymmetrica AI Research & Development Laboratory!**

This directory contains everything Jules AI (Gemini 2.0 Flash Thinking) needs to work effectively in this environment.

---

## What is This Lab?

This is a **distributed AI agent swarm environment** designed for:
- **100 tasks/day** capacity
- **15 concurrent executions**
- **DefenseKit-powered** workflows
- **Asymmetrica Protocol** compliance
- **Validated foundations** only

---

## Directory Structure

```
.jules/
├── README.md (you are here!)
│
├── task-templates/
│   ├── component-builder.md      # Template for building new components
│   ├── integration-task.md       # Template for integration work
│   ├── optimization-task.md      # Template for performance optimization
│   ├── testing-task.md           # Template for test creation
│   └── documentation-task.md     # Template for documentation tasks
│
├── validation-rules/
│   ├── contract-qa.md            # Contract testing requirements
│   ├── ux-sonar.md               # UX validation (if applicable)
│   ├── asymmetrica-protocol.md   # Protocol compliance checklist
│   └── performance-gates.md      # Performance requirements
│
└── examples/
    ├── knowledge-synthesizer/    # Example: Full-stack app using all 4 DefenseKit components
    └── success-patterns.md       # What good work looks like
```

---

## Quick Start for Jules

### 1. Read the Protocol Guide
```
../docs/JULES_PROTOCOL_GUIDE.md
```
This is your complete reference for working in this lab.

### 2. Check the Task Queue
```
../docs/JULES_TASK_QUEUE.md
```
All available tasks are listed here with priorities.

### 3. Choose a Task Template
```
task-templates/
```
Pick the template that matches your task type.

### 4. Review Relevant Examples
```
examples/knowledge-synthesizer/
```
See how the Knowledge Synthesizer app was built.

### 5. Build & Validate
- Follow the template checklist
- Run validation rules
- Pass all quality gates
- Document your work

### 6. Log Completion
```
../docs/JULES_COMPLETION_LOG.md
```
Record your completed task with metrics.

---

## Available Components (Core Library)

All components are production-ready with 100% test coverage:

### DefenseKit Components

**1. Williams Optimizer** (`../core/defensekit/williams_optimizer.py`)
- Formula: √t × log₂(t)
- Validated: 29/29 tests passing
- Use for: Batch sizing, space optimization

**2. Three-Regime Planner** (`../core/defensekit/three_regime_planner.py`)
- Distribution: Exploration/Optimization/Stabilization
- Validated: 36/36 tests passing
- Use for: Task classification, quality weighting

**3. Harmonic Timer** (`../core/defensekit/harmonic_timer.py`)
- Frequency: Tesla 4.909 Hz
- Validated: 37/37 tests passing
- Use for: Rate limiting, retry logic

**4. Regime-Aware Cache** (`../core/defensekit/regime_aware_cache.py`)
- Adaptive caching by regime
- Validated: Production-ready
- Use for: Smart caching strategies

### Google API Components

**5. Google Auth Handler** (`../core/google_api/auth.py`)
- OAuth 2.0 service account auth
- Use for: Google API authentication

**6. Google Docs Handler** (`../core/google_api/docs_handler.py`)
- Read/write Google Docs
- Use for: Documentation automation

### Memory & Synthesis Components

**7. Asymmetrica Memory** (`../core/memory/asymmetrica_memory.py`)
- SQLite-based persistent memory
- Use for: Storing task results, metrics

**8. Repo Parser** (`../core/synthesis/repo_parser.py`)
- Document discovery and metadata extraction
- Use for: Finding source materials

**9. Batch Processor** (`../core/synthesis/batch_processor.py`)
- Williams-optimized batch creation
- Use for: Efficient document processing

---

## Quality Standards

All work MUST meet these standards:

### Test Coverage
- **Exploration regime:** 70%+ pass rate (weight: 0.70)
- **Optimization regime:** 85%+ pass rate (weight: 0.85)
- **Stabilization regime:** 100% pass rate (weight: 1.00)

### Code Quality
- Type hints on all functions
- Docstrings with complexity annotations
- Asymmetrica Protocol semantic tuples
- Performance benchmarks

### Documentation
- README for every component
- Usage examples in docstrings
- Complexity analysis
- Validation proof

---

## Task Templates

Choose the right template for your task:

| Template | Use When |
|----------|----------|
| `component-builder.md` | Building a new reusable component |
| `integration-task.md` | Integrating components or APIs |
| `optimization-task.md` | Improving performance |
| `testing-task.md` | Creating test suites |
| `documentation-task.md` | Writing docs or guides |

---

## Example: Knowledge Synthesizer

The Knowledge Synthesizer app demonstrates all DefenseKit components:

**Files:**
- `../apps/knowledge_synthesizer/main.py` (FastAPI app)
- `../apps/knowledge_synthesizer/synthesis_engine.py` (Core logic)
- `../apps/knowledge_synthesizer/tests/` (Test suite)

**What it does:**
1. Classifies tasks with **Three-Regime Planner**
2. Optimizes batches with **Williams Optimizer**
3. Rate-limits with **Harmonic Timer**
4. Caches with **Regime-Aware Cache**

**Metrics:**
- 664 lines of code
- 9/9 tests passing
- 18 minutes to build
- 100% DefenseKit integration

See `examples/knowledge-synthesizer/` for detailed analysis.

---

## Mathematical Foundations

Components are built on validated mathematics:

### Williams Space Optimizer
```
Space Bound = √t × log₂(t)
Source: MIT computational geometry (Ryan Williams, 2011)
Validation: 29/29 tests, 1.5×-7.5× efficiency improvement
```

### Three-Regime Distribution
```
Exploration: 30% (weight: 0.70)
Optimization: 20% (weight: 0.85)
Stabilization: 50% (weight: 1.00)
Source: Quality assurance research, empirical validation
```

### Tesla Harmonic Timing
```
Frequency: 4.909 Hz
Period: ~203.7ms
Source: Nikola Tesla electromagnetic research
Validation: <50ms variance, deterministic timing
```

---

## Communication Protocol

### When Starting a Task
1. Read the GitHub issue carefully
2. Check the relevant task template
3. Review existing components
4. Plan your approach
5. Show your plan for approval

### During Implementation
1. Follow the template checklist
2. Write tests first (TDD)
3. Document as you go
4. Run validation frequently

### Before Completion
1. All tests passing
2. Documentation complete
3. Validation rules satisfied
4. Performance benchmarks met
5. Log completion with metrics

---

## References

### Essential Documentation
- **JULES_PROTOCOL_GUIDE.md** - Complete workflow guide
- **JULES_QUICK_START.md** - Onboarding guide
- **JULES_MATH_CONTEXT.md** - Mathematical foundations
- **JULES_TASK_QUEUE.md** - Available tasks
- **JULES_COMPLETION_LOG.md** - Completed work
- **JULES_SWARM_METRICS.md** - Performance tracking

---

**Lab Status:** Operational
**Capacity:** 100 tasks/day, 15 concurrent
**Quality Standard:** Asymmetrica Protocol
**Motto:** "Better Math for Everyone!"

---

**Last Updated:** October 10, 2025
*Welcome to the swarm, Jules! Go build something legendary!* 🚀

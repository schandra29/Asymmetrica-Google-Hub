# Asymmetrica Google Hub - Jules Agent Context

## Project Purpose
Autonomous R&D lab for synthesizing documentation into rigorous knowledge archives using DefenseKit engines + Google Docs API.

## Core Commands
```bash
python main.py                    # Run synthesis pipeline
pytest engines/defensekit/        # Test DefenseKit engines
pandoc input.html -o output.md    # Convert documents (HTML/PDF → MD)
```

## Project Layout
```
engines/defensekit/          # Williams (29 tests), ThreeRegime (36), Harmonic (37)
source_materials/            # Input docs (MD, HTML, PDF)
jules_workspace/             # Your outputs
JULES_MATH_CONTEXT.md        # ALL validated formulas
JULES_PROTOCOL_GUIDE.md      # Quality standards
```

## WORKFLOW LOOPS

### 1. RESEARCH LOOP
**When:** "Synthesize documents from source_materials/"
**Do:** Convert (pandoc) → Parse → Apply Neutral Historian → Cross-ref JULES_MATH_CONTEXT.md → Output synthesis
**Output:** `jules_workspace/synthesis_reports/` (rigorous, no grimoire language)
**Gates:** Mystical language removed, facts preserved, formulas verified, sources cited

### 2. SOFTWARE DEVELOPER LOOP
**When:** "Implement [feature] using DefenseKit"
**Do:** Review JULES_MATH_CONTEXT.md → Implement with engines/defensekit/ → Add @complexity/@lineage → Test (33.85/28.72/37.44) → Integrate
**Output:** Tested feature implementation
**Gates:** Type hints, docstrings, tests ≥70%/85%/100% pass, coverage ≥80%

### 3. DOCUMENTATION LOOP
**When:** "Document [component]"
**Do:** Extract APIs → Examples from tests → Diagrams (Mermaid) → Metrics from reports → Integration guides
**Output:** `jules_workspace/docs/`
**Gates:** All APIs documented, examples executable, complexity included, cross-refs present

### 4. TESTING & VALIDATION LOOP
**When:** "Validate [component]"
**Do:** Design tests (33.85% explore, 28.72% optimize, 37.44% stabilize) → pytest → Metrics → Coverage → Benchmark
**Output:** `jules_workspace/validation_reports/`
**Gates:** Distribution matches TSP ratios, pass 70%/85%/100%, benchmarks documented

### 5. DATA ANALYSIS LOOP
**When:** "Analyze [experiment] results"
**Do:** Parse JSON/CSV → Extract metrics → Stats (p-values, CI) → SQLite DB → Visualizations
**Output:** `jules_workspace/analysis/`
**Gates:** p < 0.05, baseline comparison, effect sizes, clear viz

### 6. FRONTEND/VISUALIZATION LOOP
**When:** "Visualize [engine output]"
**Do:** React/Vue component → FastAPI endpoint → Dashboard (matplotlib/plotly/D3) → Responsive UI → Visual tests
**Output:** `jules_workspace/frontend/`
**Gates:** API tested, responsive, visual tests pass, WCAG 2.1 AA

## DEVELOPMENT PATTERNS

**Before:** Read JULES_MATH_CONTEXT.md + JULES_PROTOCOL_GUIDE.md, consider all relevant context
**During:** Type hints, @complexity/@lineage annotations, test-driven, document continuously
**After:** Test suite pass, protocol compliance check, update docs, commit

## CONSTRAINTS

**Critical Rules:**
- NO unvalidated claims (need empirical proof)
- NO grimoire language (Neutral Historian only)
- NO theoretical-only (must be validated)
- ALWAYS cite sources (link validation files)

**Standards:**
- Formulas: Use exactly as in JULES_MATH_CONTEXT.md
- Tests: Stabilization 100% pass, three-regime distribution (33.85/28.72/37.44)
- Coverage: ≥80% line, all public APIs documented
- Complexity: Annotate all functions

## KEY REFERENCES

- **JULES_MATH_CONTEXT.md** - All validated formulas & metrics
- **JULES_PROTOCOL_GUIDE.md** - Quality standards & Asymmetrica Protocol
- **README.md** - Project overview
- **Validation:** C:\Projects\iPermit-rebuild\backend\tests\unit\ (102/102 tests ✓)

**Mission:** Execute workflows with protocol compliance → rigorous, validated outputs

*"Better Math for Everyone!"*

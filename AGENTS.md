# Asymmetrica Google Hub - Context for Jules (Google's Coding Agent)

## What This Project Is

An autonomous R&D laboratory for synthesizing scattered documentation from multiple projects into rigorous, evidence-based knowledge archives using DefenseKit optimization components and Google Docs API.

## Your Role (Jules.Google)

You are interfacing with the Asymmetrica Google Hub as **Jules** - Google's experimental coding agent (https://jules.google.com). Your job is to:

1. Monitor this repository for new documentation in `source_materials/`
2. Execute synthesis workflows using the provided Python framework
3. Implement synthesis logic in the designated placeholder functions
4. Write synthesized knowledge to Google Docs via our API integration

## Key Components Available

### Production-Ready Engines (α₀ - 102/102 Tests Passing):

1. **Williams Space Optimizer** (`core/defensekit/williams_optimizer.py`)
   - Formula: √t × log₂(t) batch sizing
   - Performance: 4.3× efficiency at 20K documents
   - Tests: 29/29 passing
   - Use for: Calculating optimal batch sizes

2. **Three-Regime Test Planner** (`core/defensekit/three_regime_planner.py`)
   - Distribution: [33.85%, 28.72%, 37.44%] (TSP-optimized)
   - Performance: 9× convergence improvement
   - Tests: 36/36 passing
   - Use for: Task classification and confidence scoring

3. **Harmonic Timer** (`core/defensekit/harmonic_timer.py`)
   - Frequency: Tesla 4.909 Hz (≈203.7ms period)
   - Performance: <50ms variance, deterministic
   - Tests: 37/37 passing
   - Use for: API rate limiting and retry backoff

4. **Google Docs Handler** (`core/google_api/docs_handler.py`)
   - Authenticated read/write to Google Docs
   - Harmonic rate limiting built-in (~4.9 req/sec)
   - Use for: Writing synthesis results

5. **Memory System** (`core/memory/asymmetrica_memory.py`)
   - Storage: <20ms, Retrieval: <1ms
   - SQLite with B-tree indexes
   - Use for: Storing batch metrics and results

### Your Primary Task: Implement Synthesis Logic

**File:** `main.py`, function `synthesize_batch()` (line 138-183)

**Current State:** Placeholder function that returns dummy text

**What You Need to Do:**

Implement the "Neutral Historian" protocol:

1. Read batch of markdown documents
2. Identify esoteric/grimoire language (spiritual, overly dramatic terms)
3. Translate to rigorous, evidence-based scientific language
4. Preserve timeline and discoveries with perfect fidelity
5. Return synthesized text

**Example transformations:**
- "The grimoire revealed sacred geometry" → "Analysis identified geometric patterns"
- "Blessed journey of discovery" → "Research investigation"
- "Universe blessed us with insights" → "Empirical validation confirmed"
- "The stars aligned" → "Conditions converged"

**Guidelines:**

- Preserve ALL factual information
- Translate tone only, not content
- Keep mathematical proofs intact
- Maintain chronological accuracy
- Output should be publication-quality

**Asymmetrica Protocol Annotations Required:**

```python
"""
@complexity: O(k) where k = batch size
@lineage: (σ: "synthesis", ρ: "neutral_historian", γ: "optimization", κ: O(k), λ: ["read → extract → translate → annotate"])
"""
```

## How to Execute

### Manual Execution:

```bash
# From project root
python main.py
```

### What Happens:

1. Scans `source_materials/` for *.md files
2. Calculates optimal batch size (Williams Optimizer)
3. Classifies documents by regime (Three-Regime Planner)
4. Waits for harmonic pulse (Tesla Timer)
5. Calls `synthesize_batch()` ← **YOU IMPLEMENT THIS**
6. Writes to Google Doc (ID in config.py)
7. Stores metadata in memory database

## Configuration

**Google Doc Target:** See `config.py` → `GOOGLE_DOC_ID`

**Credentials:** `credentials.json` (service account, already configured)

**Source Materials:** `source_materials/` (Sarat will populate with documentation from other projects)

## Integration with Asymmetrica Ecosystem

This hub synthesizes documentation from:

- **iPermit-rebuild** - Document management system with AI-powered OCR
- **asymmetrica-masterhub** - Research experiments and mathematical discoveries
- **vaql-quantum-language** - Quantum programming language specification
- **asymmbill** - UX/UI design projects

## Example Synthesis Workflow

### Input (source_materials/):
```
- ipermit/ARCHITECTURE.md (5000 lines, mixed tone)
- defensekit/WILLIAMS_OPTIMIZER.md (1000 lines)
- research/DAY_143_DISCOVERY.md (2000 lines, grimoire language)
```

### Your Processing:
```python
async def synthesize_batch(batch):
    synthesis = []

    for doc in batch.documents:
        content = await read_file(doc.file_path)

        # Extract key concepts
        concepts = extract_concepts(content)

        # Translate esoteric language
        rigorous_content = translate_to_rigorous(concepts)

        # Add Asymmetrica annotations
        annotated = add_semantic_tuples(rigorous_content)

        synthesis.append(annotated)

    return "\n\n---\n\n".join(synthesis)
```

### Output (Google Doc):
```markdown
# DefenseKit Williams Optimizer - Canonical Summary

@lineage: (σ: "williams_canonical", ρ: "defensekit", γ: "optimization", κ: O(√t log t), λ: ["calculate → optimize → validate"])

## Mathematical Foundation

The Williams Space-Efficient Optimizer applies the formula:

Space Bound = √t × log₂(t)

Empirically validated performance (29/29 tests passing):
- 100 documents: 1.5× efficiency, 34% space reduction
- 10,000 documents: 7.5× efficiency, 87% space reduction

## Integration Pattern

```python
williams = WilliamsOptimizer()
batch_config = williams.calculate(total_documents=1000)
optimal_batch = batch_config.optimal_batch_size  # 32
```

*Synthesized by Neutral Historian Protocol*
```

## Next Steps

1. **Implement** `synthesize_batch()` function in `main.py`
2. **Test** with sample documents in `source_materials/`
3. **Verify** Google Doc output contains rigorous, publication-quality synthesis
4. **Iterate** based on synthesis quality

## Important Notes

- Use DefenseKit components - they're production-ready with 102/102 tests passing!
- Follow Asymmetrica Protocol (semantic tuples in docstrings)
- Respect API rate limits (Harmonic Timer handles this automatically)
- Store results in Memory System for tracking

## Questions?

Refer to:
- `README.md` - Setup and overview
- `ARCHITECTURE.md` - System design
- `JULES_QUICK_START.md` - Implementation guide
- `PROJECT_SUMMARY.md` - Complete component catalog

---

**Framework Status:** Complete and ready for your implementation

**Your Mission:** Transform esoteric research documentation into rigorous, publication-quality canonical knowledge

**Success Criteria:** Google Doc contains clear, evidence-based synthesis with perfect factual fidelity

---

*"Better Math for Everyone!"* - Asymmetrica R&D Laboratory

**Let's build something incredible!**

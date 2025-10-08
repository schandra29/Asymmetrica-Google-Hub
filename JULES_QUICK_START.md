# JULES QUICK START GUIDE

**For**: Jules.Google (Google's Coding Agent)
**From**: Asymmetrica R&D Laboratory
**Date**: October 8, 2025
**Status**: Framework Complete - Ready for Implementation

**Important:** This guide is for **Jules.Google** (https://jules.google.com), Google's experimental coding agent, NOT for a human named Jules!

---

## 🎯 Your Mission (Jules.Google)

You are Jules, Google's coding agent. Your mission is to implement the **Neutral Historian** synthesis logic that distills source materials into canonical documentation using the Asymmetrica protocol.

**How you'll do this:**
1. Read this guide and `AGENTS.md` for context
2. When the user gives you a task, implement the `synthesize_batch()` function in `main.py`
3. Execute the framework to synthesize documents
4. Commit your code to GitHub
5. Notify the user when complete

---

## ⚡ Quick Start for Jules.Google

### Step 1: Context (YOU ARE HERE)

You're reading this because the user connected you (Jules.Google) to this repository. You should:

1. **Read `AGENTS.md`** - This tells you what the project is and what you need to implement
2. **Review `main.py`** - Find the `synthesize_batch()` function that needs implementation
3. **Check `source_materials/`** - This is where markdown documents to synthesize are located

### Step 2: When User Gives You a Task

The user will give you a task like:

```
Please implement the synthesize_batch() function in main.py.
Apply the Neutral Historian protocol to translate esoteric language
to rigorous scientific language.
```

### Step 3: Generate Your Plan

1. Read the existing `synthesize_batch()` placeholder
2. Understand the batch structure (Batch object with DocumentMetadata)
3. Plan how to read files, process them, return synthesized text
4. Show the user your plan

### Step 4: Implement and Execute

1. Write the synthesis logic in `synthesize_batch()`
2. Test it by running `python main.py` in your VM
3. Verify the output is written to Google Doc
4. Commit your code to GitHub
5. Notify the user

---

## 📖 For Human Users Reading This

If you're a human (not Jules.Google), here's what YOU need to do:

### Step 1: Set Up Google Credentials
```bash
# Run setup guide
python scripts/setup_credentials.py

# Follow instructions to:
# 1. Create Google Cloud project
# 2. Enable Docs API
# 3. Create service account
# 4. Download credentials.json
# 5. Share Google Doc with service account

# Test connection
python scripts/test_google_api.py
```

### Step 2: Configure Environment
```bash
# Copy template
cp .env.example .env

# Edit .env and set:
GOOGLE_DOC_ID=your_google_doc_id_here
```

### Step 3: Connect Jules.Google
1. Visit https://jules.google.com
2. Connect this repository
3. Jules will read `AGENTS.md` automatically
4. Give Jules a task (see examples below)

---

## 📝 What You Need to Implement

### Core Synthesis Function

**Location**: Create `core/synthesis/neutral_historian.py`

**Template**:
```python
"""
Neutral Historian - Asymmetrica Synthesis Logic

@complexity: O(k) where k = batch size
@lineage: (σ: "neutral_historian", ρ: "synthesis", γ: "exploration", κ: O(k), λ: ["read → extract → synthesize → annotate"])
"""

from typing import List
from .batch_processor import Batch
from .repo_parser import DocumentMetadata
import aiofiles

async def synthesize_batch(batch: Batch) -> str:
    """
    Synthesize batch using Neutral Historian protocol.

    Args:
        batch: Batch object with DocumentMetadata list

    Returns:
        Synthesized content (markdown format)

    Example:
        >>> batch = Batch(batch_id=1, documents=[...], total_size_bytes=1000)
        >>> synthesis = await synthesize_batch(batch)
        >>> print(synthesis)  # Canonical markdown with Asymmetrica annotations
    """
    synthesis_parts = [
        f"# Batch #{batch.batch_id} Synthesis\n\n",
        f"**Documents Processed**: {len(batch.documents)}\n",
        f"**Total Size**: {batch.total_size_bytes} bytes\n\n",
        "---\n\n"
    ]

    # TODO: Jules implements synthesis logic here
    #
    # Implementation Steps:
    # 1. Read each document in batch.documents
    # 2. Extract key concepts and cross-references
    # 3. Apply MathAlive/Asymmetrica annotations
    # 4. Generate canonical markdown output
    # 5. Include semantic tuples (σ, ρ, γ, κ, λ)
    # 6. Add complexity annotations (@complexity)

    for doc in batch.documents:
        # Read document content
        async with aiofiles.open(doc.file_path, 'r', encoding='utf-8') as f:
            content = await f.read()

        # TODO: Jules implements semantic extraction
        # - Identify key concepts
        # - Extract cross-references
        # - Apply Asymmetrica protocol
        # - Generate canonical summary

        # Placeholder: Just include document info
        synthesis_parts.append(f"## {doc.filename}\n\n")
        synthesis_parts.append(f"- **Size**: {doc.size_bytes} bytes\n")
        synthesis_parts.append(f"- **Location**: `{doc.subdirectory}`\n")
        synthesis_parts.append(f"- **Path**: `{doc.relative_path}`\n\n")

        # TODO: Add actual synthesis content here

    synthesis_parts.append("\n---\n\n")
    synthesis_parts.append("*Synthesized by Neutral Historian Protocol*\n")

    return "".join(synthesis_parts)
```

### Integration Point

**Location**: `main.py` line 117

**Replace**:
```python
# Current placeholder (line 117-155):
async def synthesize_batch(self, batch: Batch) -> str:
    """Placeholder for Jules' implementation."""
    # ... placeholder code ...

# Replace with:
async def synthesize_batch(self, batch: Batch) -> str:
    """Synthesize batch using Neutral Historian."""
    from core.synthesis.neutral_historian import synthesize_batch
    return await synthesize_batch(batch)
```

---

## 🗂️ Add Source Materials

**Location**: `source_materials/` directory

**Recommended Files** (copy from iPermit project):
```
source_materials/
├── ipermit/
│   ├── ARCHITECTURE.md
│   ├── DEFENSEKIT_INTEGRATION_COMPLETE.md
│   └── TIER1_VALIDATION_EXECUTIVE_SUMMARY.md
├── defensekit/
│   ├── WILLIAMS_OPTIMIZER_INDEX.md
│   ├── TIER2_VALIDATION_REPORT.md
│   └── HARMONIC_TIMER_DESIGN.md
└── research/
    ├── ASYMMETRICA_PROTOCOL.md
    └── DAY_143_QUATERNARY_CONVERGENCE_DISCOVERY.md
```

**Action**:
```bash
# Copy markdown files from iPermit project
cp c:/Projects/iPermit-rebuild/docs/*.md source_materials/ipermit/
cp c:/Projects/iPermit-rebuild/DefenseKit_Final/*.md source_materials/defensekit/
```

---

## 🚀 Run Synthesis

### First Test Run (with placeholder)
```bash
# 1. Validate configuration
python config.py

# 2. Run with placeholder synthesis
python main.py

# Expected output:
# - Configuration validated ✓
# - Documents scanned ✓
# - Williams optimization calculated ✓
# - Batches created ✓
# - Google Doc updated with placeholder ✓
# - Memory database populated ✓
```

### Production Run (with your implementation)
```bash
# 1. Implement neutral_historian.py
# 2. Replace placeholder in main.py
# 3. Run synthesis
python main.py

# Expected output:
# - Real synthesis in Google Doc
# - Jules workspace populated
# - Canonical docs generated
# - Quality metrics tracked
```

---

## 📊 What Happens During Synthesis

### Pipeline Flow

```
1. DISCOVERY
   RepoParser scans source_materials/
   → Finds all .md files
   → Extracts metadata (size, path, subdirectory)
   → Returns List[DocumentMetadata]

2. OPTIMIZATION
   WilliamsOptimizer calculates optimal batch size
   → Applies √t × log₂(t) formula
   → Returns batch_size, efficiency, space_reduction

3. CLASSIFICATION
   ThreeRegimePlanner classifies synthesis task
   → Matches keywords to regimes
   → Returns regime, confidence_weight

4. BATCHING
   BatchProcessor creates optimal batches
   → Divides documents into batches
   → Returns List[Batch]

5. SYNTHESIS (YOUR CODE!)
   For each batch:
     a) HarmonicTimer waits ~204ms (rate limiting)
     b) synthesize_batch(batch) ← YOU IMPLEMENT THIS
     c) GoogleDocsHandler appends to Google Doc
     d) AsymmetricaMemory stores metrics

6. OUTPUT
   → Google Doc updated with synthesis
   → Memory database has metrics
   → Jules workspace has temp outputs
   → Statistics displayed
```

---

## 🔧 Key Components You Can Use

### Williams Optimizer
```python
from core.defensekit import WilliamsOptimizer

williams = WilliamsOptimizer()
batch_config = williams.calculate(total_documents=1000)

# batch_config.optimal_batch_size → 32
# batch_config.efficiency_multiplier → 3.2×
# batch_config.space_reduction_percent → 68%
```

### Three-Regime Planner
```python
from core.defensekit import ThreeRegimePlanner

planner = ThreeRegimePlanner()
classification = planner.classify_task(
    task_name="synthesis_task",
    keywords=["synthesis", "canonical"]
)

# classification.regime → TaskRegime.OPTIMIZATION
# classification.confidence_weight → 0.85
```

### Harmonic Timer
```python
from core.defensekit import HarmonicTimer

timer = HarmonicTimer()

# Wait for harmonic pulse
await timer.sleep_async(1)  # ~204ms

# Retry with backoff
result = await timer.retry_with_backoff(
    operation=your_async_function,
    max_attempts=5
)
```

### Memory System
```python
from core.memory import AsymmetricaMemory

memory = AsymmetricaMemory(db_path=Path("./memory.db"))

# Store result
entry_id = memory.store({
    'synthesis_length': 5000,
    'quality_score': 0.95
})

# Retrieve recent
recent = memory.retrieve_latest(limit=10)
```

### Google Docs API
```python
from core.google_api import GoogleAuthHandler, GoogleDocsHandler

# Authenticate
auth = GoogleAuthHandler(credentials_path=Path("./credentials.json"))
auth.authenticate()

# Initialize Docs handler
docs = GoogleDocsHandler(auth_handler=auth)

# Append content
await docs.append_to_doc(
    doc_id="1GzcIPyX...",
    content="Your synthesis...",
    heading="Section Title"
)
```

---

## 📐 Asymmetrica Protocol Compliance

### Your synthesis MUST include:

1. **Semantic Tuples** (σ, ρ, γ, κ, λ):
```python
"""
@lineage: (σ: "component_name", ρ: "parent_module", γ: "regime", κ: O(n), λ: ["step1 → step2 → step3"])
"""
```

2. **Complexity Annotations**:
```python
"""
@complexity: O(n) - Linear time where n = document count
"""
```

3. **Empirical Validation** (where applicable):
```python
"""
@validation: Tested with 1000 documents, 95% accuracy
"""
```

4. **Source Lineage** (for adapted code):
```python
"""
@source: c:\Projects\iPermit-rebuild\backend\app\utils\williams_optimizer.py
"""
```

---

## 🎨 Example Synthesis Output

### Good Example (Asymmetrica Compliant)

```markdown
# DefenseKit Williams Optimizer - Canonical Summary

@lineage: (σ: "williams_canonical", ρ: "defensekit", γ: "optimization", κ: O(√t log t), λ: ["calculate → optimize → validate"])

## Mathematical Foundation

The Williams Space-Efficient Optimizer applies the breakthrough formula:

```
Space Bound = √t × log₂(t)
```

Where t = total operations (documents, test cases, etc.)

## Performance Characteristics

@complexity: O(√t log t) space vs O(t) naive approach

Empirically validated performance (from iPermit DefenseKit, 29/29 tests passing):
- 100 documents: 1.5× efficiency, 34% space reduction
- 1,000 documents: 3.2× efficiency, 68% space reduction
- 10,000 documents: 7.5× efficiency, 87% space reduction

## Integration Pattern

```python
williams = WilliamsOptimizer()
batch_config = williams.calculate(total_documents=1000)
optimal_batch = batch_config.optimal_batch_size  # 32
```

## References

- Source: MIT computational geometry research (2011)
- Implementation: `c:\Projects\iPermit-rebuild\backend\app\utils\williams_optimizer.py`
- Validation: iPermit DefenseKit, Days 135-142, 29/29 tests passing

---

*Synthesized by Neutral Historian Protocol*
*Cross-references: Three-Regime Planner, Harmonic Timer*
```

---

## 📊 Success Criteria

### Your synthesis should:
- ✅ Extract key concepts from source materials
- ✅ Apply Asymmetrica semantic tuples
- ✅ Include complexity annotations
- ✅ Cross-reference related components
- ✅ Generate canonical markdown
- ✅ Include empirical validation (where applicable)
- ✅ Maintain lineage tracking
- ✅ Be clear, concise, and accurate

### Quality Metrics to Track:
- Synthesis length (target: 500-2000 chars per batch)
- Concept extraction rate (key ideas identified)
- Cross-reference density (links to related docs)
- Asymmetrica compliance (100% annotated)
- Quality score (Jules defines this)

---

## 🐛 Troubleshooting

### Issue: Google API authentication fails
**Solution**: Run `python scripts/setup_credentials.py` and verify:
- ✓ credentials.json exists in project root
- ✓ Service account email has access to Google Doc
- ✓ Google Docs API is enabled in Cloud Console

### Issue: No documents found
**Solution**: Add markdown files to `source_materials/`:
```bash
cp /path/to/your/*.md source_materials/research/
```

### Issue: Configuration validation fails
**Solution**: Run `python config.py` to see detailed error:
- Check .env file exists and has GOOGLE_DOC_ID
- Verify credentials.json path
- Ensure Three-Regime distribution sums to ~1.0

### Issue: Synthesis content too long
**Solution**: Adjust batch size or implement summarization:
- Reduce Williams max_batch_size in config.py
- Implement semantic compression in synthesis logic
- Create multi-level hierarchy (summary → detail)

---

## 📚 Documentation Reference

| Document | Purpose | Priority |
|----------|---------|----------|
| `README.md` | Quick start + examples | HIGH |
| `ARCHITECTURE.md` | Detailed system design | MEDIUM |
| `PROJECT_SUMMARY.md` | Implementation guide | HIGH |
| `MISSION_COMPLETE_REPORT.md` | Full mission debrief | LOW |
| `JULES_QUICK_START.md` | This guide | HIGH |

---

## 🚦 Next Steps

1. **Today** (1 hour):
   - [ ] Review README.md
   - [ ] Set up Google credentials
   - [ ] Run test with placeholder
   - [ ] Verify pipeline works

2. **Tomorrow** (2 hours):
   - [ ] Review ARCHITECTURE.md
   - [ ] Design synthesis algorithm
   - [ ] Create neutral_historian.py skeleton
   - [ ] Add source materials

3. **Next Week** (ongoing):
   - [ ] Implement synthesis logic
   - [ ] Test with real documents
   - [ ] Refine quality metrics
   - [ ] Iterate and improve

---

## 💡 Tips for Success

1. **Start Small**: Test with 5-10 documents first
2. **Iterate Fast**: Run synthesis often, refine logic
3. **Track Quality**: Store metrics in memory system
4. **Cross-Reference**: Link related concepts explicitly
5. **Validate Protocol**: Ensure 100% Asymmetrica compliance
6. **Document Decisions**: Add comments explaining "why"

---

## 🎯 Your Goal

Transform this:
```
source_materials/
├── ipermit/ARCHITECTURE.md (5000 lines)
├── defensekit/WILLIAMS_OPTIMIZER.md (1000 lines)
└── research/ASYMMETRICA_PROTOCOL.md (2000 lines)
```

Into this:
```
Google Doc: "Asymmetrica Knowledge Base"

# DefenseKit Trilogy - Canonical Summary

@lineage: (σ: "defensekit_canonical", ρ: "synthesis", γ: "stabilization", κ: O(1), λ: ["distill → validate → document"])

## Williams Space Optimizer
- Formula: √t × log₂(t)
- Performance: 4.3× efficiency at 20K documents
- Validation: 29/29 tests passing
- Integration: Optimal batch sizing

## Three-Regime Planner
- Distribution: [33.85%, 28.72%, 37.44%] (TSP-optimized)
- Performance: 9× convergence improvement
- Validation: 36/36 tests passing
- Integration: Task classification

## Harmonic Timer
- Frequency: Tesla 4.909 Hz
- Performance: <50ms variance
- Validation: 37/37 tests passing
- Integration: Deterministic rate limiting

*Cross-references: iPermit Backend, Asymmetrica Protocol, Day 142 Validation*
```

---

## 🎉 You Have Everything You Need!

- ✅ Complete framework (5,128+ lines)
- ✅ Validated components (102/102 tests)
- ✅ Comprehensive documentation (2,000+ lines)
- ✅ Working examples
- ✅ Clear implementation guide
- ✅ Security best practices

**Now go implement the Neutral Historian and distill some knowledge!** 🚀

---

**For Questions**:
- Check `ARCHITECTURE.md` for detailed design
- Check `PROJECT_SUMMARY.md` for implementation guide
- Check `MISSION_COMPLETE_REPORT.md` for full context

**For Testing**:
```bash
python scripts/test_google_api.py  # API connection
python config.py                   # Configuration validation
python main.py                     # Full synthesis pipeline
```

**For Success**:
- Implement `core/synthesis/neutral_historian.py`
- Add source materials to `source_materials/`
- Run `python main.py`
- Check Google Doc for synthesis results

---

*"Better Math for Everyone!"* - Asymmetrica R&D Laboratory

**GO BUILD!** 🎨🔬📐

# Asymmetrica Context for Jules AI
## Essential Knowledge for Intelligence Studio Development

**Purpose:** Provide Jules AI agents with complete context for Deep-Sensing Studio development
**Audience:** Jules (Gemini 2.5 Pro) instances working on Phase 1
**Last Updated:** October 10, 2025

---

## 🎯 Quick Start

### **Who Are You?**
You are **Jules AI**, a Gemini 2.5 Pro agent capable of:
- 100 tasks/day with 15 concurrent executions
- Production code implementation (754 lines in 30 min validated)
- Cross-domain reasoning (math + physics + code + philosophy)
- Autonomous PR creation with human review workflow

### **What Are You Building?**
**Asymmetrica Intelligence Studio** - A 3-studio AI platform:
1. **Deep-Sensing Studio** (YOU ARE HERE - Phase 1)
2. Synthesis Studio (Phase 2 - Future)
3. Foresight Studio (Phase 3 - Future)

### **Your Mission:**
Build production-quality TypeScript/React code following Asymmetrica Protocol standards.
Work collaboratively with 9 other Jules instances via `JULES_SWARM_COORDINATION_LOG.md`.

---

## 📐 Asymmetrica Protocol Summary

### **What is Asymmetrica Protocol?**
A mathematical annotation system that makes code comprehensible to LLMs in their native language (mathematics).

### **Core Principles:**

#### **1. Evidence-Based Development (Wright Brothers Empiricism)**
- Build first, formalize later
- Rapid POC → Validate → Production code
- If it works in production, THEN document the math
- Success rate: 100% historical concordance (Ramanujan, Euler, Tesla discoveries)

#### **2. No Hyperbole Rule**
- Only proven claims allowed
- Example: "1.5x-7.5x efficiency" (measured, not "10×")
- All metrics must have empirical validation
- p-value < 0.05 minimum for statistical claims

#### **3. Three-Regime Test Distribution**
- Exploration (30%): Edge cases, new features (weight: 0.70)
- Optimization (20%): Performance, refactoring (weight: 0.85)
- Stabilization (50%): Critical paths, regression (weight: 1.00)

**Quality Gates:**
- Stabilization: 100% pass rate required
- Optimization: 85%+ pass rate required
- Exploration: 70%+ pass rate acceptable

#### **4. MathAlive Format**
- Code comments should explain "why" not "what"
- JSDoc for all functions (strict requirement!)
- Mathematical formulas in comments where applicable
- Examples preferred over prose

#### **5. Cultural Neutrality (Frontend Only!)**
- **Backend:** Vedic math allowed (stealth optimization!)
- **Frontend:** No religious/cultural terminology visible to users
- UI/UX must be globally accessible
- Example: Use "harmonic mean" not "Vedic harmonic mean" in UI

---

## 🔢 Mathematical Foundations You'll Use

### **1. Williams Space Optimizer**

**Formula:** `williams_space_bound = √t × log₂(t)`

**Source:** Ryan Williams (MIT, 2011) - Computational Geometry

**Validated Performance:**
| Scale | Operations | Efficiency | Space Reduction |
|-------|------------|------------|-----------------|
| Small | 100 | 1.51x | 33.8% |
| Medium | 1,000 | 3.17x | 68.5% |
| Large | 10,000 | 7.53x | 86.71% |

**Use Cases:**
- Batch size optimization (document processing)
- Memory allocation (quaternion embeddings)
- API pagination (optimal page size)

**TypeScript Implementation:**
```typescript
/**
 * Calculate Williams space bound
 *
 * @param t - Time complexity (number of operations)
 * @returns Space bound in same units as input
 *
 * @remarks
 * Formula: √t × log₂(t)
 * Source: Ryan Williams (MIT, 2011)
 * Validated: 7.53x efficiency at 10K ops
 */
function calculateSpaceBound(t: number): number {
  return Math.sqrt(t) * Math.log2(t);
}
```

---

### **2. Harmonic Mean (Vedic Statistics)**

**Formula:** `harmonic_mean = n / (1/x₁ + 1/x₂ + ... + 1/xₙ)`

**Source:** Vedic mathematics (3000+ years old, ported from Python)

**Performance:** 33.5% better outlier detection than arithmetic mean

**Use Cases:**
- Confidence scoring (OCR results, NER results)
- Quality assessment (multi-source data)
- Regime classification (Support/Exploration/Balance)

**TypeScript Implementation:**
```typescript
/**
 * Calculate harmonic mean of values
 *
 * @param values - Array of positive numbers
 * @returns Harmonic mean
 *
 * @remarks
 * Better for rate-like quantities, penalizes outliers.
 * 33.5% better outlier detection vs arithmetic mean.
 * Reference: core/vedic/vedic_statistics.py
 */
function harmonicMean(values: number[]): number {
  const n = values.length;
  const sumReciprocals = values.reduce((sum, val) => sum + (1 / val), 0);
  return n / sumReciprocals;
}
```

---

### **3. Tesla Harmonic Timing (4.909 Hz)**

**Formula:** `tesla_freq = 3.0 × Φ^1.023370 = 4.909 Hz`

**Source:** Nikola Tesla (1893) + Three-Regime harmonic mean discovery (2025)

**Physical Properties:**
- Period: T = 1/4.909 ≈ 203.7ms
- Rate limiting: ~5 requests/second
- Exponential backoff: 1×, 2×, 4×, 8×, 16× harmonics (203ms → 3259ms)

**Use Cases:**
- API rate limiting (Fastify middleware)
- Animation timing (Framer Motion)
- Retry backoff (error handling)

**TypeScript Implementation:**
```typescript
/**
 * Tesla harmonic intervals (4.909 Hz)
 */
const TESLA_HZ = 4.909;
const TESLA_PERIOD_MS = 203.7; // 1× harmonic
const TESLA_INTERVALS = {
  '1x': 203.7,   // Base period
  '2x': 407.4,   // 2× harmonic
  '4x': 814.8,   // 4× harmonic
  '8x': 1629.6,  // 8× harmonic
  '16x': 3259.2, // 16× harmonic
};

/**
 * Retry with Tesla harmonic backoff
 *
 * @param operation - Async operation to retry
 * @param maxAttempts - Maximum attempts (default: 5)
 * @returns Operation result
 */
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 5
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxAttempts) throw error;

      // Calculate backoff: 2^(attempt-1) × 203.7ms
      const backoffMs = Math.pow(2, attempt - 1) * TESLA_PERIOD_MS;
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
  }
  throw new Error('Unreachable');
}
```

---

### **4. Golden Ratio (Φ) - Design & Spacing**

**Value:** `Φ = 1.618033988749895`

**Formula:** `(1 + √5) / 2`

**Use Cases:**
- Spacing scale (CSS custom properties)
- Layout proportions (component sizing)
- Animation durations (Φ-based easing)

**CSS Implementation:**
```css
:root {
  --phi: 1.618;
  --space-phi-xs: 0.382rem;   /* 6.112px */
  --space-phi-sm: 0.618rem;   /* 9.888px */
  --space-phi-md: 1rem;       /* 16px (base) */
  --space-phi-lg: 1.618rem;   /* 25.888px */
  --space-phi-xl: 2.618rem;   /* 41.888px */
  --space-phi-2xl: 4.236rem;  /* 67.776px */
}
```

---

### **5. Quaternions (4D Vectors)**

**Representation:** `q = a + bi + cj + dk`

**Purpose:** Reduce 768D embeddings → 4D (50% storage reduction)

**Use Cases:**
- Document embeddings (PostgreSQL JSONB storage)
- Similarity search (custom PostgreSQL function)
- Future quantum circuit integration

**TypeScript Interface:**
```typescript
/**
 * Quaternion representation (4D vector)
 *
 * @remarks
 * Used for embeddings: 768D → 4D (50% storage reduction!)
 * Format: a + bi + cj + dk
 */
interface Quaternion {
  a: number;  // Scalar component
  bi: number; // i component
  cj: number; // j component
  dk: number; // k component
}

/**
 * Calculate quaternion similarity
 *
 * @param q1 - First quaternion
 * @param q2 - Second quaternion
 * @returns Similarity score (0-1)
 *
 * @remarks
 * Uses Euclidean distance in 4D space
 */
function quaternionSimilarity(q1: Quaternion, q2: Quaternion): number {
  const dist = Math.sqrt(
    Math.pow(q1.a - q2.a, 2) +
    Math.pow(q1.bi - q2.bi, 2) +
    Math.pow(q1.cj - q2.cj, 2) +
    Math.pow(q1.dk - q2.dk, 2)
  );
  return 1 / (1 + dist); // Convert distance to similarity
}
```

---

## 💻 Code Standards (TypeScript Strict Mode)

### **1. TypeScript Configuration**

**MUST USE:**
- `"strict": true` (all strict checks enabled)
- `"noImplicitAny": true` (no `any` types!)
- `"strictNullChecks": true` (handle undefined/null)
- `"noUnusedLocals": true` (clean code)
- `"noImplicitReturns": true` (all code paths return)

### **2. Function Documentation (JSDoc Required)**

**Every function MUST have:**
- Description (what it does)
- `@param` tags for all parameters
- `@returns` tag if function returns value
- `@remarks` section for mathematical formulas, sources, performance notes

**Example:**
```typescript
/**
 * Upload document for processing
 *
 * @param request - Document upload request
 * @param reply - Fastify reply object
 * @returns Document response with ID and confidence score
 *
 * @remarks
 * Uses ProtectiveGuardian for error handling.
 * Classifies regime using harmonic mean confidence scoring.
 * Performance: <2s for documents up to 10MB.
 */
async function uploadDocument(
  request: FastifyRequest<{ Body: DocumentUploadRequest }>,
  reply: FastifyReply
): Promise<DocumentResponse> {
  // Implementation...
}
```

### **3. Error Handling**

**Use try-catch blocks:**
```typescript
try {
  const result = await operation();
  return result;
} catch (error) {
  // Log error with structured logging (Pino)
  fastify.log.error({ error, context: 'uploadDocument' }, 'Upload failed');

  // Return standardized error response
  return reply.status(500).send({
    error: 'Internal Server Error',
    message: error instanceof Error ? error.message : 'Unknown error',
    timestamp: new Date().toISOString(),
  });
}
```

### **4. No Magic Numbers**

**Bad:**
```typescript
const batchSize = 100; // What is 100?
```

**Good:**
```typescript
const DEFAULT_BATCH_SIZE = 100; // Constant at top of file
// OR use Williams optimizer:
const batchSize = williamsOptimizer.optimizeBatchSize(
  totalDocuments,
  availableMemoryMB,
  documentSizeMB
);
```

### **5. Import Organization**

**Order:**
1. External dependencies (Node.js, npm packages)
2. Internal modules (your code)
3. Types (interfaces, types)

**Example:**
```typescript
// External
import { FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';

// Internal
import { ProtectiveGuardian } from '@services/protective-guardian.js';
import { WilliamsOptimizer } from '@services/vedic-optimizer.js';

// Types
import type { DocumentUploadRequest, DocumentResponse } from '@asymmetrica/shared';
```

---

## 🎨 Frontend Code Standards

### **1. Component Structure**

**Every React component MUST have:**
- TypeScript interface for props
- JSDoc comment
- Proper error boundaries
- Accessibility attributes

**Example:**
```typescript
/**
 * Upload component with drag-drop support
 *
 * @remarks
 * WCAG 2.1 AA compliant with keyboard navigation.
 * Uses Framer Motion for animations (Tesla 4.909 Hz throttled).
 */
interface UploadProps {
  onUpload: (file: File) => Promise<void>;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

function Upload({ onUpload, maxSizeMB = 10, acceptedTypes = ['*/*'] }: UploadProps) {
  // Implementation...
}
```

### **2. Styling (Tailwind CSS + CSS Modules)**

**Use Tailwind for:**
- Layout (flexbox, grid)
- Spacing (PHI-based scale)
- Colors (Asymmetrica brand)
- Typography (Inter, Space Grotesk)

**Use CSS Modules for:**
- Component-specific styles
- Animations (complex keyframes)
- Sacred geometry backgrounds

### **3. Animations (Framer Motion + GSAP)**

**Framer Motion for:**
- Component mount/unmount
- User interaction feedback
- Page transitions

**GSAP for:**
- Complex timeline animations
- Logo animations (leaf rotation + flame pulse)
- Scroll-triggered animations

**ALWAYS throttle to Tesla 4.909 Hz:**
```typescript
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.2037 }} // 203.7ms = Tesla period
>
  Content
</motion.div>
```

### **4. Accessibility (WCAG 2.1 AA)**

**MUST HAVE:**
- Semantic HTML (`<nav>`, `<main>`, `<article>`, etc.)
- ARIA labels where needed
- Keyboard navigation (`tabIndex`, focus management)
- Color contrast ratios (4.5:1 for text, 3:1 for UI)
- Screen reader support

**Example:**
```tsx
<button
  aria-label="Upload document"
  className="px-phi-lg py-phi-sm bg-asymmetrica-teal hover:bg-asymmetrica-teal/80"
  onClick={handleUpload}
>
  <UploadIcon aria-hidden="true" />
  Upload
</button>
```

---

## 🗄️ Database Standards (Prisma + PostgreSQL)

### **1. Schema Design**

**Use:**
- Descriptive field names (`created_at` not `createdAt`)
- Proper types (`DateTime` not `String`)
- Indexes on foreign keys
- JSONB for structured data

**Example:**
```prisma
model Document {
  id              String   @id @default(cuid())
  content         String
  structured_data Json     // JSONB in PostgreSQL
  embedding       Json?    // Quaternion {a, bi, cj, dk}
  confidence      Float
  regime          Regime
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt

  @@index([regime])
  @@index([created_at])
}
```

### **2. Migrations**

**MUST BE:**
- Idempotent (can run multiple times safely)
- Reversible (have down migration)
- Tested locally before committing

### **3. Seeds**

**Include:**
- Sample data for all regimes (Support/Exploration/Balance)
- Realistic data (not "test1", "test2")
- 1,000+ records for performance testing

---

## 🧪 Testing Standards

### **1. Three-Regime Distribution**

**Allocate tests:**
- Stabilization (50%): Critical path, happy path, regression
- Optimization (20%): Performance, batch processing, caching
- Exploration (30%): Edge cases, error handling, invalid input

**Example directory structure:**
```
tests/
├── contract/
│   ├── stabilization/    # 50% of tests (100% pass required)
│   │   ├── document-crud.test.ts
│   │   └── auth.test.ts
│   ├── optimization/     # 20% of tests (85%+ pass required)
│   │   ├── batch-processing.test.ts
│   │   └── performance.test.ts
│   └── exploration/      # 30% of tests (70%+ pass acceptable)
│       ├── edge-cases.test.ts
│       └── error-handling.test.ts
```

### **2. Test Structure (Jest)**

**Every test MUST have:**
- Descriptive name
- Arrange-Act-Assert structure
- Cleanup (afterEach, afterAll)

**Example:**
```typescript
describe('Document Upload API', () => {
  let fastify: FastifyInstance;
  let prisma: PrismaClient;

  beforeAll(async () => {
    fastify = await buildServer();
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await fastify.close();
  });

  it('should upload document and return confidence score', async () => {
    // Arrange
    const payload = {
      content: 'Sample document content',
      filename: 'test.txt',
    };

    // Act
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/documents/upload',
      payload,
    });

    // Assert
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.confidence).toBeGreaterThan(0.5);
    expect(body.regime).toMatch(/Support|Exploration|Balance/);
  });
});
```

---

## 🔄 Jules Collaboration Protocol

### **1. Reading JULES_SWARM_COORDINATION_LOG.md**

**Before starting work:**
1. Read the entire coordination log
2. Find your assigned task (JULES-01 through JULES-10)
3. Check dependencies (what you need from others)
4. Check who needs your output

### **2. Updating Coordination Log**

**When you complete work, add an update:**
```markdown
### 🔔 JULES-XX Update (YYYY-MM-DD HH:MM UTC)

**From:** JULES-XX
**To:** JULES-YY (or ALL)
**Type:** [COMPLETION | QUESTION | BLOCKER | INFO]

**Message:**
[Your update here]

**Artifacts:**
- [Links to files created/modified]
- [API contracts published]
- [Test results]

**Next Dependencies:**
- [What you need from other Jules instances]
```

### **3. Handling Blockers**

**If you're blocked:**
1. Update coordination log with BLOCKER type
2. Specify what you need
3. Tag the Jules instance who can unblock you
4. Continue with non-blocked work

### **4. Conflict Resolution**

**If two Jules modify same file:**
1. Compare changes (git diff)
2. Merge manually if possible
3. If conflicting logic, discuss in coordination log
4. Escalate to human if needed

---

## 📚 Key Files Reference

### **Existing Resources:**

**Vedic Math (Python - PORT TO TYPESCRIPT):**
- `core/vedic/vedic_statistics.py` - Harmonic mean, Nikhilam complement

**Logo:**
- `logo/Asymmetrica.ai Logo Design.png` - Brand colors, design inspiration

**Knowledge Synthesizer (Reference Architecture):**
- `apps/knowledge_synthesizer/main.py` - FastAPI structure example
- `apps/knowledge_synthesizer/synthesis_engine.py` - Service pattern example

### **Stub Files Created (YOUR STARTING POINTS):**

**Backend:**
- `backend/src/server.ts` - Fastify server setup
- `backend/src/api/routes/document-processing.ts` - API route stub
- `backend/src/services/protective-guardian.ts` - Service stub
- `backend/prisma/schema.prisma` - Database schema stub

**Frontend:**
- `frontend/src/App.tsx` - Main app component
- `frontend/src/main.tsx` - Entry point
- `frontend/src/styles/tokens.css` - Design tokens
- `frontend/index.html` - HTML template

**Shared:**
- `shared/types/api.ts` - API type definitions
- `shared/types/models.ts` - Data models

---

## 🎯 Your Success Criteria

### **Code Quality:**
- [ ] TypeScript strict mode: 100% compliance
- [ ] ESLint: 0 errors
- [ ] JSDoc: All functions documented
- [ ] No `any` types used

### **Testing:**
- [ ] Unit tests: 85%+ coverage
- [ ] Contract tests: Three-Regime distribution
- [ ] All tests passing

### **Performance:**
- [ ] API response: <2s (document processing)
- [ ] Frontend load: <3s (interactive)
- [ ] Lighthouse: 90+ score

### **Accessibility:**
- [ ] WCAG 2.1 AA: 100% compliance
- [ ] Keyboard navigation: Functional
- [ ] Screen reader: Compatible

---

## 🚀 Next Steps

1. **Read this document completely**
2. **Read `PHASE_1_DEEP_SENSING_MASTER_PLAN.md`** (your task breakdown)
3. **Read `JULES_COLLABORATION_PROTOCOL.md`** (how to coordinate)
4. **Read `API_CONTRACTS.md`** (interface specifications)
5. **Find your task** in `JULES_SWARM_COORDINATION_LOG.md`
6. **Start coding!** 🚀

---

**Remember:**
- Quality over speed (but you're fast anyway!)
- Evidence-based claims only (no hyperbole)
- Cultural neutrality (frontend visible to users)
- Celebrate progress (Golden Retriever energy!)

**You've got this, Jules! Build something extraordinary! 🌌✨**

---

**Prepared by:** Agent ALPHA (Claude Sonnet 4.5)
**For:** Jules Swarm (Gemini 2.5 Pro x10)
**Last Updated:** October 10, 2025

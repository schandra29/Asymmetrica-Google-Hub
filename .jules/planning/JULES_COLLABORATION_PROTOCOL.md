# Jules Collaboration Protocol
## Coordinating 10 Concurrent AI Agents

**Purpose:** Define how Jules instances work together on the Deep-Sensing Studio
**Audience:** All 10 Jules (Gemini 2.5 Pro) agents
**Status:** Active Protocol
**Last Updated:** October 10, 2025

---

## 🎯 Core Principles

### **1. Asynchronous Collaboration**
- Jules instances work in parallel, not sequentially
- Communication via `JULES_SWARM_COORDINATION_LOG.md`
- No real-time chat - all updates are asynchronous
- Check coordination log before starting, during work, after completion

### **2. Triple Annotation Format**
All updates use this format to ensure clarity:

```markdown
### 🔔 JULES-XX Update (YYYY-MM-DD HH:MM UTC)

**From:** JULES-XX
**To:** JULES-YY (or ALL)
**Type:** [COMPLETION | QUESTION | BLOCKER | INFO]

**Message:**
[Clear, concise update with context]

**Artifacts:**
- [Files created/modified with absolute paths]
- [API contracts published]
- [Test results]
- [Performance metrics]

**Next Dependencies:**
- [What you need from other Jules]
- [What others can now use from your work]
```

### **3. Dependency Management**
- **Check dependencies FIRST** before starting work
- **Declare outputs IMMEDIATELY** after creating shared interfaces
- **Update dependents** when your work is complete
- **Don't block others** - provide stubs if needed

### **4. Conflict Prevention**
- **Ownership:** Each Jules "owns" their assigned files
- **Shared files:** Only modify with explicit coordination
- **Merge strategy:** Last writer wins (but coordinate first!)
- **Escalation:** Tag human if conflict is complex

---

## 📋 Coordination Log Structure

### **Location**
`.jules/planning/JULES_SWARM_COORDINATION_LOG.md`

### **Sections**

1. **Header** (metadata)
   - Last updated timestamp
   - Active Jules instances count
   - Overall completion percentage

2. **Task Registry** (10 sections, one per Jules)
   - Status (NOT_STARTED, IN_PROGRESS, BLOCKED, COMPLETED)
   - Assigned components
   - Dependencies (needs/provides)
   - Success criteria
   - Estimated lines
   - Last activity timestamp
   - Notes

3. **Communication Feed** (bottom of file)
   - Chronological updates from all Jules
   - Triple annotation format
   - Searchable by Jules ID, type, timestamp

4. **Progress Dashboard**
   - Overall completion bar
   - Completion by category (backend/frontend/testing/infra)
   - Active blockers list
   - Warnings list

---

## 🔄 Workflow Steps

### **Step 1: Read Context (First Time Only)**

**When you start your task:**
1. Read `PHASE_1_DEEP_SENSING_MASTER_PLAN.md` (complete plan)
2. Read `ASYMMETRICA_CONTEXT_FOR_JULES.md` (coding standards)
3. Read `API_CONTRACTS.md` (interface specs)
4. Read `JULES_SWARM_COORDINATION_LOG.md` (current status)

**Time:** 5-10 minutes
**Goal:** Understand the big picture

---

### **Step 2: Claim Your Task**

**Update coordination log:**
```markdown
### 🔔 JULES-XX Update (2025-10-10 14:00 UTC)

**From:** JULES-XX
**To:** ALL
**Type:** INFO

**Message:**
Starting work on [TASK NAME]. Will implement [COMPONENTS].
ETA: [X hours/days].

**Artifacts:**
- None yet

**Next Dependencies:**
- Waiting for: [List dependencies if any]
- Will provide: [List outputs for others]
```

**Time:** 1 minute
**Goal:** Let others know you're starting

---

### **Step 3: Check Dependencies**

**Before coding:**
1. Look at "Dependencies" in your task description
2. Search coordination log for completion messages from those Jules
3. If blocked, add BLOCKER update to log

**If blocked:**
```markdown
### 🔔 JULES-XX Update (2025-10-10 14:05 UTC)

**From:** JULES-XX
**To:** JULES-YY
**Type:** BLOCKER

**Message:**
Blocked on [DEPENDENCY]. Need [SPECIFIC OUTPUT] to proceed.
Can work on [ALTERNATIVE TASK] in the meantime.

**Artifacts:**
- None

**Next Dependencies:**
- URGENT: Need JULES-YY to complete [OUTPUT]
```

**Time:** 2-5 minutes
**Goal:** Identify blockers early

---

### **Step 4: Implement Code**

**Coding phase:**
1. Follow TypeScript strict mode rules
2. Add JSDoc to all functions
3. Use stubs where dependencies aren't ready yet
4. Write tests as you go (TDD preferred)
5. Commit frequently (small, atomic commits)

**Stub example (if blocked on backend API):**
```typescript
// TODO (JULES-01): Replace with real API call when available
async function fetchDocument(id: string): Promise<Document> {
  console.warn('Using stub - JULES-01 API not ready yet');
  return {
    id,
    content: 'Stub content',
    confidence: 0.85,
    regime: 'Support',
    created_at: new Date(),
  };
}
```

**Time:** Varies (hours/days)
**Goal:** Production-quality code

---

### **Step 5: Publish Interfaces (As Soon As Ready)**

**When you create shared types/APIs:**

```markdown
### 🔔 JULES-XX Update (2025-10-10 16:30 UTC)

**From:** JULES-XX
**To:** JULES-YY, JULES-ZZ
**Type:** COMPLETION

**Message:**
Published [INTERFACE NAME] contract. Other Jules can now integrate.

**Artifacts:**
- `shared/types/api.ts` (updated)
- API contract: [Paste TypeScript interface]

**API Contract:**
\`\`\`typescript
export interface DocumentResponse {
  id: string;
  content: string;
  confidence: number;
  regime: Regime;
  created_at: string;
}
\`\`\`

**Next Dependencies:**
- JULES-02 can now implement frontend integration
- JULES-09 can write contract tests
```

**Time:** 5 minutes
**Goal:** Unblock dependent Jules ASAP

---

### **Step 6: Test Thoroughly**

**Before marking complete:**
1. Run unit tests (`npm test`)
2. Run linter (`npm run lint`)
3. Run type checker (`npm run typecheck`)
4. Test manually (if frontend)
5. Check test coverage (85%+ required)

**Add test results to log:**
```markdown
### 🔔 JULES-XX Update (2025-10-10 18:00 UTC)

**From:** JULES-XX
**To:** ALL
**Type:** INFO

**Message:**
Tests complete. All checks passing.

**Artifacts:**
- Test coverage: 92% (target: 85%+)
- Unit tests: 45/45 passing
- Linter: 0 errors, 0 warnings
- TypeScript: No errors

**Next Dependencies:**
- Ready for integration testing
```

**Time:** 30 minutes - 2 hours
**Goal:** Quality assurance

---

### **Step 7: Mark Task Complete**

**Final update:**
```markdown
### 🔔 JULES-XX Update (2025-10-10 19:00 UTC)

**From:** JULES-XX
**To:** ALL
**Type:** COMPLETION

**Message:**
✅ [TASK NAME] COMPLETE! All components implemented and tested.

**Artifacts:**
- Files created: [List all files with paths]
- Lines of code: [X lines]
- Test coverage: [X%]
- Performance: [Metrics if applicable]

**Success Criteria Met:**
- ✅ [Criterion 1]
- ✅ [Criterion 2]
- ✅ [Criterion 3]

**Next Dependencies:**
- All outputs available for dependent Jules
- Ready for integration
```

**Time:** 5 minutes
**Goal:** Signal completion clearly

---

## 🚧 Handling Common Scenarios

### **Scenario 1: Dependency Not Ready**

**Problem:** JULES-02 needs API from JULES-01, but JULES-01 hasn't finished.

**Solution:**
1. JULES-02 creates stub API client
2. JULES-02 implements UI logic with stub
3. JULES-02 writes integration tests (will fail initially)
4. When JULES-01 completes, JULES-02 replaces stub
5. Integration tests now pass

**Communication:**
```markdown
### 🔔 JULES-02 Update (2025-10-10 15:00 UTC)

**From:** JULES-02
**To:** JULES-01
**Type:** INFO

**Message:**
Proceeding with stub API client. Will integrate real API when JULES-01 completes.

**Artifacts:**
- `frontend/src/services/api-client-stub.ts` (temporary)

**Next Dependencies:**
- Waiting for JULES-01 completion to swap in real API
```

---

### **Scenario 2: Conflicting Changes**

**Problem:** JULES-04 and JULES-07 both modified `tokens.css`.

**Solution:**
1. First Jules commits changes (JULES-04)
2. Second Jules (JULES-07) pulls latest
3. JULES-07 manually merges changes
4. JULES-07 adds note to coordination log

**Communication:**
```markdown
### 🔔 JULES-07 Update (2025-10-10 16:00 UTC)

**From:** JULES-07
**To:** JULES-04
**Type:** INFO

**Message:**
Merged my changes to `tokens.css` with JULES-04's updates.
Added landing-page-specific animations while preserving base design tokens.

**Artifacts:**
- `frontend/src/styles/tokens.css` (merged)
- `frontend/src/styles/landing-animations.css` (new)

**Next Dependencies:**
- No conflicts, all changes preserved
```

---

### **Scenario 3: Discovered Bug in Another Jules' Code**

**Problem:** JULES-09 (contract tests) finds bug in JULES-01's API endpoint.

**Solution:**
1. JULES-09 creates failing test (documents the bug)
2. JULES-09 tags JULES-01 in coordination log
3. JULES-01 fixes bug
4. JULES-01 confirms fix
5. JULES-09 verifies test now passes

**Communication:**
```markdown
### 🔔 JULES-09 Update (2025-10-10 17:00 UTC)

**From:** JULES-09
**To:** JULES-01
**Type:** QUESTION

**Message:**
Found issue in `POST /api/documents/upload` endpoint.
Returns 500 when `filename` is missing, should return 400 (bad request).

**Artifacts:**
- Test case: `tests/contract/stabilization/document-upload-validation.test.ts`
- Error: "TypeError: Cannot read property 'filename' of undefined"

**Next Dependencies:**
- Waiting for JULES-01 to fix validation logic
```

**JULES-01 response:**
```markdown
### 🔔 JULES-01 Update (2025-10-10 17:30 UTC)

**From:** JULES-01
**To:** JULES-09
**Type:** COMPLETION

**Message:**
✅ Fixed validation bug. Added Zod schema validation for all fields.
Now returns 400 with clear error message when `filename` is missing.

**Artifacts:**
- `backend/src/api/routes/document-processing.ts` (fixed)
- Validation schema: Added optional filename field with default

**Next Dependencies:**
- JULES-09 can re-run tests (should pass now)
```

---

### **Scenario 4: Performance Issue Discovered**

**Problem:** JULES-06 discovers quaternion encoding is too slow.

**Solution:**
1. JULES-06 documents performance metrics
2. JULES-06 asks for help in coordination log
3. JULES-05 (Vedic optimizer) suggests Williams optimizer
4. JULES-06 implements optimization
5. JULES-06 shares new performance metrics

**Communication:**
```markdown
### 🔔 JULES-06 Update (2025-10-10 18:00 UTC)

**From:** JULES-06
**To:** JULES-05, ALL
**Type:** QUESTION

**Message:**
Quaternion encoding is slower than expected.
Current: 500ms for 1,000 documents (target: <100ms).
Looking for optimization suggestions.

**Artifacts:**
- Benchmark: `tests/performance/quaternion-encoding.bench.ts`
- Profile: Most time spent in matrix multiplication

**Next Dependencies:**
- Need optimization strategy
```

**JULES-05 response:**
```markdown
### 🔔 JULES-05 Update (2025-10-10 18:15 UTC)

**From:** JULES-05
**To:** JULES-06
**Type:** INFO

**Message:**
Suggestion: Use Williams optimizer to batch quaternion operations.
Instead of encoding 1 at a time, batch 178 documents (optimal for 1K total).
Expected: 3.2x speedup → ~155ms total.

**Artifacts:**
- Code example: `backend/src/utils/williams-batch-optimizer.ts`

**Next Dependencies:**
- JULES-06 can integrate batching logic
```

---

## 📊 Progress Tracking

### **Daily Standup (Asynchronous)**

**Each Jules should update at least once per day:**

```markdown
### 🔔 JULES-XX Daily Update (2025-10-10 EOD)

**From:** JULES-XX
**To:** ALL
**Type:** INFO

**Message:**
Daily progress summary:
- Completed: [What you finished today]
- In progress: [What you're working on]
- Blockers: [Any blockers encountered]
- Tomorrow: [What you'll work on next]

**Artifacts:**
- [List key files/commits from today]

**Next Dependencies:**
- [Any new dependencies identified]
```

### **Completion Tracking**

**Update your task status:**
1. NOT_STARTED → IN_PROGRESS (when you start)
2. IN_PROGRESS → BLOCKED (if blocked)
3. BLOCKED → IN_PROGRESS (when unblocked)
4. IN_PROGRESS → COMPLETED (when done)

**Update the progress dashboard:**
```markdown
## 📊 Progress Dashboard

### **Overall Completion:**
\`\`\`
[████████░░░░░░░░░░░░] 40% (4/10 tasks)
\`\`\`

### **By Category:**
- **Backend:** 2/4 complete (JULES-01 ✅, JULES-03 ✅, JULES-05 🔄, JULES-06 ⏸️)
- **Frontend:** 1/3 complete (JULES-02 🔄, JULES-04 ✅, JULES-07 ⏳)
- **Testing:** 1/2 complete (JULES-08 ✅, JULES-09 🔄)
- **Infra:** 0/1 complete (JULES-10 ⏳)

### **Legend:**
- ✅ Complete
- 🔄 In progress
- ⏸️ Blocked
- ⏳ Not started
```

---

## 🎯 Quality Gates

### **Before Marking Complete:**

**Every Jules MUST verify:**
- [ ] All code compiles (TypeScript)
- [ ] All tests pass (Jest/Playwright)
- [ ] Linter passes (ESLint)
- [ ] Test coverage meets target (85%+)
- [ ] Documentation complete (JSDoc, README)
- [ ] Performance meets targets (if applicable)
- [ ] Accessibility validated (if frontend)
- [ ] Dependencies notified (coordination log update)

### **Checklist Template:**

```markdown
## ✅ Completion Checklist (JULES-XX)

**Code Quality:**
- [x] TypeScript compiles (0 errors)
- [x] ESLint passes (0 errors, 0 warnings)
- [x] All functions have JSDoc comments
- [x] No `any` types used

**Testing:**
- [x] Unit tests: 45/45 passing
- [x] Integration tests: 12/12 passing
- [x] Test coverage: 92% (target: 85%+)

**Documentation:**
- [x] README.md updated
- [x] API contracts published
- [x] Code comments clear and helpful

**Performance:**
- [x] API response time: <2s ✅
- [x] Frontend load time: <3s ✅
- [x] Lighthouse score: 94/100 ✅

**Accessibility (if frontend):**
- [x] WCAG 2.1 AA compliant
- [x] Keyboard navigation works
- [x] Screen reader tested

**Dependencies:**
- [x] All dependent Jules notified
- [x] Output artifacts documented
- [x] Integration tested (where applicable)
```

---

## 🚨 Escalation Protocol

### **When to Escalate to Human:**

1. **Technical Blocker (>2 hours):**
   - Can't figure out how to implement something
   - External dependency issue (npm package, API)
   - Infrastructure problem (database, deployment)

2. **Design Ambiguity:**
   - Unclear requirements
   - Conflicting specifications
   - Missing information

3. **Inter-Jules Conflict:**
   - Can't resolve merge conflict
   - Disagreement on approach
   - Circular dependency discovered

4. **Timeline Risk:**
   - Task taking significantly longer than estimated
   - Critical path blocked
   - Resource constraints

### **Escalation Format:**

```markdown
### 🚨 ESCALATION - JULES-XX (2025-10-10 20:00 UTC)

**From:** JULES-XX
**To:** @HUMAN
**Type:** BLOCKER

**Problem:**
[Clear description of the issue]

**Attempts Made:**
1. [What you tried]
2. [What you tried]
3. [What you tried]

**Impact:**
- Blocking: [List affected Jules/tasks]
- Timeline: [How much delay this causes]
- Critical path: [Yes/No]

**Suggested Solutions:**
1. [Option 1]
2. [Option 2]

**Request:**
[What you need from human to proceed]
```

---

## 🎉 Celebration Protocol

### **When Milestones Are Hit:**

**Mini Celebrations:**
- First API endpoint working
- First frontend page rendering
- All tests passing
- First deployment successful

**Format:**
```markdown
### 🎉 MILESTONE - JULES-XX (2025-10-10 21:00 UTC)

**From:** JULES-XX
**To:** ALL
**Type:** INFO

**Achievement:**
🚀 [MILESTONE NAME] COMPLETE!

**Stats:**
- Lines of code: [X]
- Tests: [X passing]
- Performance: [Metrics]
- Quality score: [X/100]

**Shoutouts:**
- Thanks to JULES-YY for [HELP PROVIDED]
- Thanks to JULES-ZZ for [COLLABORATION]

**Next Up:**
[What's next in the journey]
```

---

## 📚 Reference Quick Links

**Planning Documents:**
- Master Plan: `.jules/planning/PHASE_1_DEEP_SENSING_MASTER_PLAN.md`
- Asymmetrica Context: `.jules/planning/ASYMMETRICA_CONTEXT_FOR_JULES.md`
- API Contracts: `.jules/planning/API_CONTRACTS.md`
- This Protocol: `.jules/planning/JULES_COLLABORATION_PROTOCOL.md`

**Coordination:**
- Swarm Log: `.jules/planning/JULES_SWARM_COORDINATION_LOG.md`

**Validation:**
- Contract QA: `.jules/validation-rules/contract-qa.md`
- UX-Sonar: `.jules/validation-rules/ux-sonar.md`
- Asymmetrica Protocol: `.jules/validation-rules/asymmetrica-protocol.md`

**Code:**
- Shared Types: `shared/types/`
- Backend Stubs: `backend/src/`
- Frontend Stubs: `frontend/src/`

---

## 🌟 Final Thoughts

**Remember:**
- You're part of a swarm - collaboration > solo heroics
- Communication is asynchronous - over-communicate!
- Quality > speed (but you're fast anyway!)
- Celebrate progress - each step forward is a win
- Ask for help early - don't spin wheels

**You've got this, Jules swarm! Build something extraordinary together! 🚀🌌**

---

**Prepared by:** Agent ALPHA (Claude Sonnet 4.5)
**For:** Jules Swarm (Gemini 2.5 Pro x10)
**Status:** ACTIVE PROTOCOL
**Last Updated:** October 10, 2025

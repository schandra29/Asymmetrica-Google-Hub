# Multi-Team Baseline Quick Start 🌀

## 🚀 5-Minute Setup

### 1. Load System

```typescript
import { MultiTeamBaselineManager } from './multi-team-baseline';
import { WilliamsDriftChecker } from './baseline-drift-checker';
import { CrossTeamReporter } from './cross-team-reporter';

const manager = new MultiTeamBaselineManager(process.cwd());
const driftChecker = new WilliamsDriftChecker();
const reporter = new CrossTeamReporter(manager, driftChecker);
```

### 2. Load Baselines

```typescript
// Global baseline
manager.loadGlobalBaseline();

// Team overrides (optional)
manager.loadTeamOverride('team-ux');
manager.loadTeamOverride('team-backend');
manager.loadTeamOverride('team-qa');
```

### 3. Calculate Team SHM

```typescript
const scores = {
  ux: 0.85,
  design: 0.90,
  code: 0.75,
  semantic: 0.80,
  journey: 0.88,
  state: 0.82
};

const blended = manager.blendForTeam('team-ux', scores);
console.log(`Team SHM: ${blended.shm}`);
```

### 4. Check Drift & Merge

```typescript
// Check if merge allowed
const result = manager.checkMergeDrift('team-ux', blended.shm);

if (result.approved) {
  // Auto-merge
  manager.approveAutoMerge('team-ux', blended.shm, 'commit-hash');
  console.log('✅ Auto-merged!');
} else {
  // Manual review
  console.log(`❌ Manual review: ${result.reason}`);
}
```

### 5. Generate Report

```typescript
const report = reporter.generateReport(['team-ux', 'team-backend', 'team-qa']);
reporter.saveReport(report, 'reports/');
```

---

## 📐 Williams Formula Cheat Sheet

| Commits | Threshold | Behavior |
|---------|-----------|----------|
| 1-4     | 0.03-0.20%| Very strict |
| 8-16    | 0.42-0.80%| Balanced |
| 32-64   | 1.41-2.40%| Flexible |
| 100+    | 3.32%+    | Loose |

**Formula:** `√t × log₂(t) × 5%`

---

## 🧪 Test It

### Option 1: Full Test Suite

```bash
npx tsx run-unit-tests.ts
```

### Option 2: Drift Scenarios

```bash
npx tsx drift-scenarios-demo.ts
```

### Option 3: Jest Tests

```bash
npm test multi-team-baseline.spec.ts
```

---

## 📁 Add New Team

### Step 1: Create `teams/team-{name}_baselines.json`

```json
{
  "teamId": "team-{name}",
  "weights": {
    "ux": 0.25,
    "design": 0.25,
    "code": 0.125,
    "semantic": 0.125,
    "journey": 0.125,
    "state": 0.125
  },
  "regimeBlend": [0.30, 0.20, 0.50],
  "lastUpdated": "2025-10-05T00:00:00Z",
  "commitsSinceUpdate": 0
}
```

### Step 2: Load in Code

```typescript
manager.loadTeamOverride('team-{name}');
```

**Done!** ✅

---

## 🔍 Common Scenarios

### Scenario: Small Drift (Auto-Approve)

```typescript
// 16 commits since baseline, 0.61% drift
const result = manager.checkMergeDrift('team-ux', 0.825);
// result.approved = true (0.61% < 0.80%)
```

### Scenario: Large Drift (Manual Review)

```typescript
// 3 commits since baseline, 15.85% drift
const result = manager.checkMergeDrift('team-backend', 0.95);
// result.approved = false (15.85% > 0.14%)
```

### Scenario: Regime Mismatch

```typescript
const teams = [
  { teamId: 'team-ux', regime: 'exploration' },
  { teamId: 'team-backend', regime: 'stabilization' }
];

const mismatch = manager.checkRegimeMismatch(teams);
// mismatch.mismatch = true (opposing regimes)
```

---

## 📊 Report Example

```markdown
# Cross-Team Baseline Report

**Global SHM:** 0.8200
**Average SHM:** 0.8100
**Volatility:** 0.0082

## Team Contributions
- team-ux: 110.0% (stabilization)
- team-backend: 110.0% (stabilization)
- team-qa: 110.0% (stabilization)

## Recommendations
✅ All systems nominal. Continue current development patterns.
```

---

## 🛠️ Troubleshooting

### All merges rejected?
**Cause:** Low commit count (strict threshold)
**Fix:** Accumulate more commits or manually approve

### Too many auto-approvals?
**Cause:** High commit count (loose threshold)
**Fix:** Reset baseline, review weights

### Regime mismatch alerts?
**Cause:** Teams in different phases
**Fix:** Coordinate sprint planning

---

## 📚 Full Documentation

See: `MULTI_TEAM_BASELINE_DOCUMENTATION.md`

---

**Quick Start Complete!** 🌀✨

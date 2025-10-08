# 🎯 Jest Regime Reporter - Terminal Output Example

**Date:** October 3, 2025 (Day 141)
**Reporter:** `regime-reporter.js`
**Integration:** Three-Regime Test Classification

---

## ✅ Successful Test Run Example

When all tests pass and quality gates are met, you'll see this output:

```
ThreeRegimeTestPlanner initialized: Exploration=30%, Optimization=20%, Stabilization=50%

═══════════════════════════════════════════════════════════════════
  DEFENSEKIT THREE-REGIME CONTRACT TESTING
═══════════════════════════════════════════════════════════════════

 PASS  DEFENSEKIT-CONTRACT tests/contract/exploration/quantum-attack-scenarios.test.js
 PASS  DEFENSEKIT-CONTRACT tests/contract/exploration/timing-attack-vectors.test.js
 PASS  DEFENSEKIT-CONTRACT tests/contract/exploration/side-channel-probes.test.js
 PASS  DEFENSEKIT-CONTRACT tests/contract/exploration/edge-case-cryptography.test.js
 PASS  DEFENSEKIT-CONTRACT tests/contract/optimization/key-generation-performance.test.js
 PASS  DEFENSEKIT-CONTRACT tests/contract/optimization/encryption-throughput.test.js
 PASS  DEFENSEKIT-CONTRACT tests/contract/optimization/memory-efficiency.test.js
 PASS  DEFENSEKIT-CONTRACT tests/contract/optimization/batch-processing-benchmarks.test.js
 PASS  DEFENSEKIT-CONTRACT tests/contract/stabilization/baseline-cryptography.test.js
 PASS  DEFENSEKIT-CONTRACT tests/contract/stabilization/nist-compliance-validation.test.js
 PASS  DEFENSEKIT-CONTRACT tests/contract/stabilization/production-workflows.test.js
 PASS  DEFENSEKIT-CONTRACT tests/contract/stabilization/regression-prevention.test.js

═══════════════════════════════════════════════════════════════════
  THREE-REGIME TEST DISTRIBUTION REPORT
═══════════════════════════════════════════════════════════════════

EXPLORATION     12/12 passed (100.0%) ✅ [Weight: 0.70, Target: 30%, Gate: 70%]
OPTIMIZATION    8/8 passed (100.0%) ✅ [Weight: 0.85, Target: 20%, Gate: 85%]
STABILIZATION   16/16 passed (100.0%) ✅ [Weight: 1.00, Target: 50%, Gate: 100%]

───────────────────────────────────────────────────────────────────
OVERALL CONFIDENCE: 100.0% (weighted)
TOTAL TESTS: 36 (36 passed, 0 failed, 0 skipped)
DURATION: 2.34s
═══════════════════════════════════════════════════════════════════

📄 Regime report exported: coverage/contract-report/regime-report.json

✅ QUALITY GATES PASSED - Build can proceed
```

**Color Guide:**
- **Cyan (Exploration):** Edge cases, experimental tests
- **Yellow (Optimization):** Performance, benchmarks
- **Green (Stabilization):** Critical paths, regression prevention

---

## ❌ Failed Test Run Example

When tests fail or quality gates are violated:

```
ThreeRegimeTestPlanner initialized: Exploration=30%, Optimization=20%, Stabilization=50%

═══════════════════════════════════════════════════════════════════
  DEFENSEKIT THREE-REGIME CONTRACT TESTING
═══════════════════════════════════════════════════════════════════

 PASS  DEFENSEKIT-CONTRACT tests/contract/exploration/quantum-attack-scenarios.test.js
 FAIL  DEFENSEKIT-CONTRACT tests/contract/exploration/timing-attack-vectors.test.js
 PASS  DEFENSEKIT-CONTRACT tests/contract/exploration/side-channel-probes.test.js
 PASS  DEFENSEKIT-CONTRACT tests/contract/exploration/edge-case-cryptography.test.js
 PASS  DEFENSEKIT-CONTRACT tests/contract/optimization/key-generation-performance.test.js
 FAIL  DEFENSEKIT-CONTRACT tests/contract/optimization/encryption-throughput.test.js
 PASS  DEFENSEKIT-CONTRACT tests/contract/optimization/memory-efficiency.test.js
 PASS  DEFENSEKIT-CONTRACT tests/contract/optimization/batch-processing-benchmarks.test.js
 PASS  DEFENSEKIT-CONTRACT tests/contract/stabilization/baseline-cryptography.test.js
 FAIL  DEFENSEKIT-CONTRACT tests/contract/stabilization/nist-compliance-validation.test.js
 PASS  DEFENSEKIT-CONTRACT tests/contract/stabilization/production-workflows.test.js
 PASS  DEFENSEKIT-CONTRACT tests/contract/stabilization/regression-prevention.test.js

═══════════════════════════════════════════════════════════════════
  THREE-REGIME TEST DISTRIBUTION REPORT
═══════════════════════════════════════════════════════════════════

EXPLORATION     10/12 passed (83.3%) ✅ [Weight: 0.70, Target: 30%, Gate: 70%]
  ✗ should detect timing attack via constant-time validation
    AssertionError: Timing variance too high: 12.5% (expected < 5%)

OPTIMIZATION    6/8 passed (75.0%) ❌ [Weight: 0.85, Target: 20%, Gate: 85%]
  ✗ should achieve ChaCha20 throughput > 100 MB/s
    AssertionError: Throughput 87.3 MB/s (target: 100 MB/s)

STABILIZATION   15/16 passed (93.8%) ❌ [Weight: 1.00, Target: 50%, Gate: 100%]
  ✗ should validate NIST test vector for X25519
    AssertionError: Public key mismatch

───────────────────────────────────────────────────────────────────
OVERALL CONFIDENCE: 87.6% (weighted)
TOTAL TESTS: 36 (31 passed, 5 failed, 0 skipped)
DURATION: 3.12s
═══════════════════════════════════════════════════════════════════

📄 Regime report exported: coverage/contract-report/regime-report.json

⚠️  QUALITY GATE VIOLATIONS:
   optimization: 75.0% (required: 85%, gap: 10.0%)
   stabilization: 93.8% (required: 100%, gap: 6.2%)

❌ QUALITY GATES FAILED - Build should fail
```

**Priority Order for Fixes:**
1. **Stabilization failures** (blocking - must fix immediately)
2. **Optimization failures** (high priority - fix same day)
3. **Exploration failures** (medium priority - investigate within week)

---

## 📊 JSON Report Structure

The reporter exports detailed JSON to `coverage/contract-report/regime-report.json`:

```json
{
  "timestamp": "2025-10-03T12:16:03.567Z",
  "duration": 2.34,
  "overall": {
    "totalTests": 36,
    "passed": 36,
    "failed": 0,
    "skipped": 0,
    "confidence": {
      "overall": 1.0,
      "percentage": "100.0%",
      "contributions": {
        "exploration": 0.21,
        "optimization": 0.17,
        "stabilization": 0.50
      }
    }
  },
  "regimes": {
    "exploration": {
      "passed": 12,
      "failed": 0,
      "skipped": 0,
      "total": 12,
      "passRate": 1.0,
      "weight": 0.70,
      "proportion": 0.30
    },
    "optimization": {
      "passed": 8,
      "failed": 0,
      "skipped": 0,
      "total": 8,
      "passRate": 1.0,
      "weight": 0.85,
      "proportion": 0.20
    },
    "stabilization": {
      "passed": 16,
      "failed": 0,
      "skipped": 0,
      "total": 16,
      "passRate": 1.0,
      "weight": 1.00,
      "proportion": 0.50
    }
  },
  "qualityGates": {
    "exploration": {
      "threshold": 0.70,
      "actual": 1.0,
      "passed": true
    },
    "optimization": {
      "threshold": 0.85,
      "actual": 1.0,
      "passed": true
    },
    "stabilization": {
      "threshold": 1.00,
      "actual": 1.0,
      "passed": true
    }
  },
  "detailedResults": {
    "exploration": {
      "passed": 12,
      "failed": 0,
      "skipped": 0,
      "tests": [
        {
          "name": "should resist Shor's algorithm quantum attack",
          "status": "passed",
          "duration": 152,
          "classification": {
            "regime": "exploration",
            "weight": 0.70,
            "reasoning": "Matched 2 exploration keywords"
          }
        }
        // ... more tests
      ]
    },
    "optimization": { /* ... */ },
    "stabilization": { /* ... */ }
  }
}
```

---

## 🔗 Integration Points

### 1. CI/CD Consumption

GitHub Actions uses this JSON report to:
- Display regime distribution in PR comments
- Fail builds when quality gates violated
- Track confidence trends over time

### 2. Programmatic Access

```javascript
// Load report
const report = require('./coverage/contract-report/regime-report.json');

// Check quality gates
if (!report.qualityGates.stabilization.passed) {
  console.error('❌ Stabilization gate failed!');
  process.exit(1);
}

// Extract confidence
console.log(`Overall confidence: ${report.overall.confidence.percentage}`);
```

### 3. Metrics Export

The JSON can be consumed by:
- Prometheus (convert to metrics)
- Datadog (custom metrics)
- Grafana (dashboard visualization)
- Slack/Teams (webhook notifications)

---

## 🎨 Terminal Colors

The reporter uses ANSI color codes for visual clarity:

| Element | Color | Purpose |
|---------|-------|---------|
| **Exploration** | Cyan (`\x1b[36m`) | Edge cases, experimental |
| **Optimization** | Yellow (`\x1b[33m`) | Performance, benchmarks |
| **Stabilization** | Green (`\x1b[32m`) | Critical paths, production |
| **Pass** | Green (`\x1b[32m`) | Test passed |
| **Fail** | Red (`\x1b[31m`) | Test failed |
| **Warning** | Yellow (`\x1b[33m`) | Quality gate warning |
| **Header** | Magenta (`\x1b[35m`) | Report headers |

---

## 📈 Confidence Calculation

**Formula:**
```
overall_confidence = Σ(pass_rate × regime_weight × regime_proportion)
```

**Example:**
```
Exploration:     1.0 × 0.70 × 0.30 = 0.21
Optimization:    1.0 × 0.85 × 0.20 = 0.17
Stabilization:   1.0 × 1.00 × 0.50 = 0.50
─────────────────────────────────────────
Overall:                         = 0.88 (88%)
```

**Interpretation:**
- **90-100%:** Excellent quality, ready for production
- **80-90%:** Good quality, minor improvements needed
- **70-80%:** Acceptable, focus on critical path improvements
- **< 70%:** Poor quality, significant rework required

---

## 🚀 Next Steps

1. **Run Tests:**
   ```bash
   npm run test:contract
   ```

2. **Review Report:**
   ```bash
   cat coverage/contract-report/regime-report.json | jq '.overall.confidence'
   ```

3. **Push to GitHub:**
   - Workflow automatically runs
   - PR comment posted with results
   - Build fails if quality gates violated

4. **Monitor Trends:**
   - Track confidence over time
   - Set alerts for drops below 85%
   - Review failed tests by priority

---

**Happy Testing! May your quality gates always be green! 🚀✅**

# AI Vision Engine Architecture

## Data Flow Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                      BROWSER (AsymmBill)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Performance APIs                                         │   │
│  │  - PerformanceObserver (CLS, Long Tasks, Paint)         │   │
│  │  - requestAnimationFrame (FPS)                          │   │
│  │  - Animation API monitoring                              │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    SONIC RADAR ENGINE                            │
│  Captures raw telemetry points:                                 │
│  - fps: { type: 'fps', value: 34.97, timestamp: 3662 }         │
│  - cls: { type: 'cls', value: 0, timestamp: 800 }              │
│  - paint: { type: 'paint', name: 'first-paint', ... }          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND COLLECTOR                            │
│  Aggregates metrics:                                            │
│  {                                                              │
│    metrics: {                                                   │
│      fps: 34.97,                                                │
│      cls: 0,                                                    │
│      longTasks: 0,                                              │
│      consoleErrors: 0,                                          │
│      requests: 24                                               │
│    }                                                            │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    TELEMETRY NORMALIZER                          │
│  Computes Asymmetrica metrics:                                  │
│  {                                                              │
│    metrics: {                                                   │
│      smoothnessIndex: 34.97  // fps / (1 + cls + longTasks)   │
│      energyEfficiency: 582.83 // perceivedResp / cpuTime       │
│      stabilizationTime: 0                                       │
│    },                                                           │
│    asymmetrica: {                                               │
│      regime: 'exploration'    // smoothness < 40               │
│      complexity: 'O(n)'        // based on animations/events   │
│    }                                                            │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      HEURISTICS ENGINE                           │
│  Rule-based analysis:                                           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ low-fps: (m) => m.fps < 50                             │   │
│  │ Result: TRIGGERED (34.97 < 50) ❌                      │   │
│  │ Severity: critical                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ high-cls: (m) => m.cls > 0.1                           │   │
│  │ Result: NOT TRIGGERED (0 < 0.1) ✅                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Output: [{ heuristic: 'low-fps', severity: 'critical', ... }] │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     CRITIQUE ADAPTER                             │
│  Generates AI critique:                                         │
│                                                                 │
│  1. For each triggered heuristic:                              │
│     - Generate code example                                     │
│     - Format message with metrics                               │
│                                                                 │
│  2. Compute scores:                                             │
│     - smoothnessScore = 34.97 × 1.5 = 52.46                    │
│     - energyScore = min(582.83 × 20, 100) = 100                │
│     - overallScore = (52.46 + 100) / 2 = 76.23                 │
│                                                                 │
│  3. Generate regime-based recommendations:                      │
│     - "exploration" → "Focus on critical fixes"                │
│                                                                 │
│  Output: {                                                      │
│    summary: "⚠️ Found 1 critical issues...",                   │
│    issues: [...],                                               │
│    metrics: { overallScore: 76.23 },                           │
│    recommendations: [...]                                       │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────┴─────────────────────┐
        │                                            │
        ↓                                            ↓
┌──────────────────────┐                  ┌─────────────────────┐
│  REPORT GENERATOR    │                  │  CI INTEGRATION     │
│                      │                  │                     │
│  Markdown Report:    │                  │  PR Comment:        │
│  ┌────────────────┐  │                  │  ┌───────────────┐  │
│  │ # UX Sonar     │  │                  │  │ ## 🦇 Analysis│  │
│  │                │  │                  │  │               │  │
│  │ Score: 76.23   │  │                  │  │ ❌ FAILED     │  │
│  │                │  │                  │  │               │  │
│  │ ## Issues      │  │                  │  │ ### Critical  │  │
│  │ 1. low-fps     │  │                  │  │ - low-fps     │  │
│  │                │  │                  │  │               │  │
│  │ ```js          │  │                  │  │ ### Recs      │  │
│  │ // code        │  │                  │  │ - Profile JS  │  │
│  │ ```            │  │                  │  └───────────────┘  │
│  └────────────────┘  │                  │                     │
│                      │                  │  shouldFailCI:      │
│  JSON Report:        │                  │  true (critical)    │
│  { critique, ... }   │                  │                     │
│                      │                  └─────────────────────┘
│  Saved to:           │
│  reports/_.md        │
└──────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      BASELINE STORAGE                            │
│  Saves normalized telemetry + critique to:                      │
│  baselines/_.json                                               │
│                                                                 │
│  Used for future comparisons:                                   │
│  - Regression detection                                         │
│  - Trend analysis                                               │
│  - PR comment baseline deltas                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Heuristics Decision Tree

```
                          ┌─────────────┐
                          │   Metrics   │
                          └──────┬──────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
                ↓                ↓                ↓
        ┌───────────────┐ ┌───────────────┐ ┌──────────────┐
        │ FPS < 50?     │ │ CLS > 0.1?    │ │ longTasks?   │
        │               │ │               │ │              │
        │ YES → low-fps │ │ YES → high-cls│ │ YES → check  │
        │ (critical)    │ │ (critical)    │ │   threshold  │
        └───────────────┘ └───────────────┘ └──────────────┘
                │                │                │
                └────────────────┼────────────────┘
                                 ↓
                          ┌─────────────┐
                          │   Issues    │
                          │   Array     │
                          └──────┬──────┘
                                 │
                        ┌────────┴────────┐
                        │                 │
                        ↓                 ↓
                  ┌───────────┐     ┌──────────────┐
                  │ Critical? │     │   Warnings?  │
                  │           │     │              │
                  │ YES → CI  │     │ Display in   │
                  │   FAIL    │     │ report only  │
                  └───────────┘     └──────────────┘
```

---

## Scoring Algorithm

### Smoothness Score
```typescript
smoothnessIndex = fps / (1 + cls + longTaskPenalty)
smoothnessScore = min(smoothnessIndex × 1.5, 100)

Example:
fps = 34.97, cls = 0, longTasks = 0
smoothnessIndex = 34.97 / (1 + 0 + 0) = 34.97
smoothnessScore = 34.97 × 1.5 = 52.46
```

### Energy Score
```typescript
perceivedResponsiveness = fps / 60
cpuTime = longTasks > 0 ? longTasks / 1000 : 0.001
energyEfficiency = perceivedResponsiveness / cpuTime
energyScore = min(energyEfficiency × 20, 100)

Example:
fps = 34.97, longTasks = 0
perceivedResponsiveness = 34.97 / 60 = 0.583
cpuTime = 0.001
energyEfficiency = 0.583 / 0.001 = 583
energyScore = min(583 × 20, 100) = 100 (capped)
```

### Overall Score
```typescript
overallScore = (smoothnessScore + energyScore) / 2

Example:
overallScore = (52.46 + 100) / 2 = 76.23
```

---

## Regime Classification

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  IF cls > 0.1 OR smoothness < 40                │
│    → exploration                                │
│    → Focus: "Fix critical issues"               │
│                                                 │
│  ELSE IF smoothness >= 50 AND cls <= 0.05       │
│    → stabilization                              │
│    → Focus: "Maintain through monitoring"       │
│                                                 │
│  ELSE                                           │
│    → optimization                               │
│    → Focus: "Fine-tune performance"             │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Example Classification:
```
smoothness = 34.97, cls = 0
→ smoothness < 40 → exploration ✅
```

---

## Code Example Generation

Each heuristic maps to a solution pattern:

### low-fps → Layout Optimization
```javascript
// ❌ Bad: Animating layout properties
element.style.width = '100px'; // Causes reflow

// ✅ Good: Transform-based animation
element.style.transform = 'scaleX(1.5)'; // GPU-accelerated
```

### high-cls → Space Reservation
```javascript
// ✅ Reserve space for dynamic content
<div style="min-height: 200px;">
  <img src="..." style="aspect-ratio: 16/9;" />
</div>
```

### long-tasks → Task Splitting
```javascript
// ✅ Break up long tasks
function heavyWork() {
  for (let i = 0; i < items.length; i++) {
    if (i % 100 === 0) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    processItem(items[i]);
  }
}
```

---

## CI/CD Integration Flow

```
                    ┌─────────────────┐
                    │   PR Created    │
                    └────────┬────────┘
                             │
                             ↓
                    ┌─────────────────┐
                    │  GitHub Actions │
                    │  runs tests     │
                    └────────┬────────┘
                             │
                             ↓
                    ┌─────────────────┐
                    │  UX Sonar runs  │
                    │  AI Vision test │
                    └────────┬────────┘
                             │
                             ↓
                    ┌─────────────────┐
                    │  Load baseline  │
                    │  (if exists)    │
                    └────────┬────────┘
                             │
                             ↓
                    ┌─────────────────┐
                    │  Compare scores │
                    │  Generate PR    │
                    │  comment        │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ↓                 ↓
            ┌──────────────┐   ┌─────────────┐
            │ Score >= 80  │   │ Score < 60  │
            │ No critical  │   │ OR critical │
            │              │   │             │
            │ → CI PASS ✅ │   │ → CI FAIL ❌│
            └──────────────┘   └─────────────┘
```

---

## Example: Real AsymmBill Analysis

### Input (RTL Testing Platform):
```json
{
  "metrics": {
    "fps": 34.97,
    "cls": 0,
    "longTasks": 0
  }
}
```

### Processing:
```
1. Smoothness Index: 34.97 / (1 + 0 + 0) = 34.97
2. Energy Efficiency: (34.97/60) / 0.001 = 582.83
3. Regime: smoothness < 40 → exploration
4. Heuristics:
   - low-fps: 34.97 < 50 ✅ TRIGGERED
   - high-cls: 0 < 0.1 ❌
   - long-tasks: 0 < 100 ❌
```

### Output:
```json
{
  "summary": "⚠️ Found 1 critical issues and 0 warnings. FPS: 35.0, CLS: 0.000. Regime: exploration.",
  "issues": [
    {
      "type": "low-fps",
      "severity": "critical",
      "description": "Frame rate below optimal (34.97 FPS, target: 60)",
      "suggestion": "Use transform/opacity for animations...",
      "codeExample": "..."
    }
  ],
  "metrics": {
    "smoothnessScore": 52.46,
    "energyScore": 100,
    "overallScore": 76.23
  }
}
```

### CI Decision:
```
shouldFailCI = true (critical issue detected)
Verdict: ❌ FAILED
```

---

## Performance Impact

### Telemetry Collection Overhead:
- **FPS monitoring**: ~0.1% CPU (requestAnimationFrame)
- **CLS monitoring**: ~0.05% CPU (PerformanceObserver)
- **Total overhead**: < 1% on target application

### Analysis Performance:
- **Heuristics evaluation**: < 1ms
- **Critique generation**: < 5ms
- **Report generation**: < 10ms
- **Total analysis time**: < 20ms

### Storage:
- **Per test run**: ~5KB (JSON baseline)
- **Markdown report**: ~1-2KB

---

**This architecture gives AI "HD Vision" into software UX performance! 🤖🔍**

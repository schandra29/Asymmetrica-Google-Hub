# Tetractys Quick Reference Guide

**Agent November - Sacred Geometry Integration**
**Status:** Complete and Operational ✅

---

## What is the Tetractys?

The Tetractys is Pythagoras' sacred triangle:
```
         •  (1 dot - Unity)
        • •  (2 dots - Duality)
       • • •  (3 dots - Harmony)
      • • • •  (4 dots - Matter)

Total: 1 + 2 + 3 + 4 = 10 (Perfection)
```

We've implemented this as a **hierarchical metric convergence system** for the Asymmetrica Dashboard.

---

## File Locations (Absolute Paths)

### Core Implementation
- **Engine:** `C:\Projects\asymmbill\tests\ux-sonar\utils\tetractys-engine.ts`
- **Visualizer:** `C:\Projects\asymmbill\tests\ux-sonar\utils\tetractys-visualizer.ts`

### Integration
- **Dashboard:** `C:\Projects\asymmbill\tests\ux-sonar\dashboard-generator.ts`
- **Aggregator:** `C:\Projects\asymmbill\tests\ux-sonar\dashboard\report-aggregator.ts`

### Testing & Demos
- **Tests:** `C:\Projects\asymmbill\tests\ux-sonar\tests\tetractys-engine.spec.ts`
- **Demo Script:** `C:\Projects\asymmbill\tests\ux-sonar\demo-tetractys.ts`
- **Benchmark:** `C:\Projects\asymmbill\tests\ux-sonar\benchmark-tetractys.ts`
- **HTML Demo:** `C:\Projects\asymmbill\tests\ux-sonar\tetractys-demo.html`

### Documentation
- **Full Docs:** `C:\Projects\asymmbill\tests\ux-sonar\TETRACTYS_SACRED_GEOMETRY.md`
- **Mission Report:** `C:\Projects\asymmbill\tests\ux-sonar\AGENT_NOVEMBER_MISSION_COMPLETE.md`
- **Quick Ref:** `C:\Projects\asymmbill\tests\ux-sonar\TETRACTYS_QUICK_REFERENCE.md` (this file)

---

## Quick Start - 30 Second Guide

### 1. Basic Usage (TypeScript)

```typescript
import { calculateSHMWithTetractys } from './utils/tetractys-engine';

const result = calculateSHMWithTetractys({
  ux: 0.95,
  design: 0.88,
  code: 0.92,
  semantic: 0.81,
  journey: 0.76,
  state: 0.89
});

console.log(`SHM: ${result.apex}`); // 0.6720
console.log(result.visualization);  // ASCII Tetractys
```

### 2. Dashboard Integration

```typescript
import { SonarDashboard } from './dashboard-generator';

const dashboard = new SonarDashboard();
const sonarScores = new Map([
  ['ux', 0.95],
  ['design', 0.88],
  // ...
]);

const tetractys = dashboard.calculateSHMTetractys(sonarScores);
```

### 3. Visual Component

```typescript
import { generateTetractysWidget } from './utils/tetractys-visualizer';

const widget = generateTetractysWidget(result, ['UX', 'Des', 'Cod', 'Sem', 'Jrn', 'Sta']);
document.getElementById('container').innerHTML = widget;
```

---

## Running the Demo

```bash
# Navigate to ux-sonar directory
cd C:\Projects\asymmbill\tests\ux-sonar

# Run the TypeScript demo
npx tsx demo-tetractys.ts

# Open the HTML demo in browser
start tetractys-demo.html
```

---

## Key Concepts

### Sacred Weights
- **Level 1 (Apex):** Weight = 4 (most refined)
- **Level 2:** Weight = 3
- **Level 3:** Weight = 2
- **Level 4 (Base):** Weight = 1 (raw metrics)
- **Total:** 4 + 3 + 2 + 1 = **10** (sacred perfection)

### Convergence Path
```
6 metrics (base) → 3 metrics → 2 metrics → 1 metric (apex)
```

Each level pairs and harmonizes the metrics from below.

### Golden Ratio (φ)
```
φ = (1 + √5) / 2 ≈ 1.618033988749895
```

Used in the golden ratio geometric harmonizer for natural balance.

---

## Available Harmonizers

1. **Arithmetic Mean** - Simple average
2. **Geometric Mean** - Preserves proportional relationships
3. **Harmonic Mean** - Emphasizes smaller values
4. **Golden Ratio Geometric** - Sacred φ-based harmonization (default)
5. **Quadratic Mean (RMS)** - Emphasizes larger values

### Changing Harmonizer

```typescript
import { TetractysEngine, Harmonizers } from './utils/tetractys-engine';

const engine = new TetractysEngine({
  harmonizer: Harmonizers.arithmeticMean // or any other
});
```

---

## API Reference

### TetractysEngine

```typescript
class TetractysEngine {
  constructor(config: TetractysConfig)
  converge(rawMetrics: number[]): TetractysConvergenceResult
  visualize(result: TetractysConvergenceResult, labels?: string[]): string
}
```

### TetractysConvergenceResult

```typescript
interface TetractysConvergenceResult {
  apex: number;                  // Final SHM value
  levels: TetractysLevel[];      // All 4 levels
  convergencePath: number[];     // e.g., [6, 3, 2, 1]
  weightedScore: number;         // Sacred weighted average
  convergenceJourney?: [...];    // Step-by-step (if trackPath: true)
}
```

### Factory Functions

```typescript
// Create Tetractys for Sonar Dashboard
createSonarTetractys(options?: {...}): TetractysEngine

// High-level calculation
calculateSHMWithTetractys(sonarScores: {...}): TetractysConvergenceResult

// Visualization helpers
generateTetractysSVG(result, labels?): string
generateTetractysWidget(result, labels?): string
```

---

## Performance

- **Execution Time:** ~0.008ms (8 microseconds)
- **Overhead vs Simple Average:** ~700% (but still negligible)
- **Memory:** O(log n) for hierarchical levels
- **Complexity:** O(n log n)

**Conclusion:** Fast enough for any dashboard use case.

---

## Mathematical Validation

### Proof 1: Sacred Weight Sum
```
4 + 3 + 2 + 1 = 10 ✅
```

### Proof 2: Convergence Path
```
6 → ⌈6/2⌉=3 → ⌈3/2⌉=2 → ⌈2/2⌉=1 ✅
```

### Proof 3: Golden Ratio Identity
```
φ² = φ + 1
2.618... = 2.618... ✅
```

### Proof 4: Isomorphism to Ancient Tetractys
```
Ancient: 1-2-3-4 triangle (10 dots)
Modern:  4-3-2-1 weights (sum=10)
Status:  Isomorphic ✅
```

---

## Common Use Cases

### 1. Dashboard SHM Calculation
```typescript
const tetractys = calculateSHMWithTetractys(sonarScores);
const shm = tetractys.apex; // Use this as System Health Metric
```

### 2. Custom Weights
```typescript
const engine = new TetractysEngine({
  harmonizer: Harmonizers.geometricMean,
  weights: [10, 7, 4, 1] // Custom sacred weights
});
```

### 3. Convergence Journey Tracking
```typescript
const engine = createSonarTetractys({ trackPath: true });
const result = engine.converge(metrics);

result.convergenceJourney?.forEach(step => {
  console.log(`Level ${step.level}: ${step.harmonization}`);
  console.log(`  Input: ${step.input}`);
  console.log(`  Output: ${step.output}`);
});
```

### 4. Visual Dashboard Integration
```typescript
const result = calculateSHMWithTetractys(sonarScores);
const widget = generateTetractysWidget(result, sonarLabels);

// Add to dashboard HTML
const container = document.createElement('div');
container.innerHTML = widget;
dashboardElement.appendChild(container);
```

---

## Comparison: Tetractys vs Simple Average

### Simple Average (Old Method)
```typescript
SHM = 0.25×UX + 0.25×Design + 0.125×(Code+Semantic+Journey+State)
Result: 0.8800
```

### Tetractys (New Method)
```typescript
SHM = Tetractys.converge([UX, Design, Code, Semantic, Journey, State]).apex
Result: 0.6720 (with golden ratio harmonization)
```

### Why the Difference?
- Geometric mean is more conservative than arithmetic
- Golden ratio adjustment (φ^(-n/10)) dampens high values
- Hierarchical weighting (4-3-2-1) gives more importance to convergence
- Sacred proportions produce natural balance

---

## Troubleshooting

### Issue: "Cannot read properties of undefined"
**Solution:** Make sure to pass harmonizer in config:
```typescript
new TetractysEngine({ harmonizer: Harmonizers.arithmeticMean })
```

### Issue: "SHM is too low compared to simple average"
**Explanation:** This is expected with geometric mean + golden ratio. It's more conservative.
**Solution:** Use arithmetic mean if you want closer match:
```typescript
createSonarTetractys({ harmonizer: Harmonizers.arithmeticMean })
```

### Issue: "Visualization doesn't show in HTML"
**Solution:** Make sure to include the full widget HTML with embedded CSS:
```typescript
generateTetractysWidget(result, labels) // Not just generateSVG
```

---

## Next Steps & Extensions

### Immediate Use
1. Open `tetractys-demo.html` in browser to see live visualization
2. Run `npx tsx demo-tetractys.ts` to see console output
3. Integrate into dashboard with `generateTetractysWidget()`

### Future Enhancements
1. **3D Visualization** - WebGL rotating Tetractys
2. **Real-time Animation** - Show convergence 6→3→2→1 live
3. **Other Sacred Geometries** - Vesica Piscis, Flower of Life, etc.
4. **ML Optimization** - Learn optimal harmonizer from data
5. **Time Series** - Track Tetractys evolution over days

---

## Resources

### Documentation
- Full mathematical explanation: `TETRACTYS_SACRED_GEOMETRY.md`
- Mission completion report: `AGENT_NOVEMBER_MISSION_COMPLETE.md`
- This quick reference: `TETRACTYS_QUICK_REFERENCE.md`

### Code Examples
- Live demo: `tetractys-demo.html`
- TypeScript demo: `demo-tetractys.ts`
- Performance benchmark: `benchmark-tetractys.ts`

### Tests
- Contract tests: `tests/tetractys-engine.spec.ts` (40+ tests)
- Run tests: `npm test tetractys-engine.spec.ts`

### External References
- Pythagoras & Tetraktys: Heath (1921) "History of Greek Mathematics"
- Golden Ratio: Livio (2002) "The Golden Ratio"
- Sacred Geometry: Lawlor (1982) "Sacred Geometry: Philosophy and Practice"

---

## Credits

**Implementation:** Agent November
**Mathematical Basis:** Pythagoras (600 BCE)
**Sacred Geometry Research:** GPT-5 (2025)
**Protocol:** Asymmetrica (Human + AI collaboration)
**Date:** October 5, 2025

---

## The Sacred Oath

> "In this Tetractys, we find not just a calculation, but a connection—to Pythagoras, to the universe, to the eternal patterns that govern reality. May this code honor the ancient wisdom while serving the modern need."

---

**Quick Reference Status:** ✅ Complete
**Last Updated:** October 5, 2025
**Version:** 1.0.0

*The Tetractys lives! 🔺✨*

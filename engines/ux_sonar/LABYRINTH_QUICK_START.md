# Labyrinth Delay Engine - Quick Start Guide

**TL;DR**: The Labyrinth enforces sequential processing with harmonic timing delays. Use it for deterministic metric calculation.

---

## Installation

Already installed! The Labyrinth is in `utils/labyrinth-engine.ts`.

---

## Basic Usage (5 Minutes)

```typescript
import { LabyrinthEngine } from './utils/labyrinth-engine';

// Define your data structure
interface MyData {
  value: number;
}

// Create labyrinth
const labyrinth = new LabyrinthEngine<MyData>()
  .addStep({
    name: 'Increment',
    transform: async (data) => ({ ...data, value: data.value + 1 })
  })
  .addStep({
    name: 'Double',
    transform: async (data) => ({ ...data, value: data.value * 2 })
  });

// Traverse
const result = await labyrinth.traverse({ value: 5 });

console.log(result.result.value); // 12: (5+1)*2
console.log(result.sacredTiming); // true
console.log(result.path.length);  // 2
```

---

## Configuration Options

```typescript
new LabyrinthEngine<T>({
  teslaFrequencyHz: 4.909,  // Default: Tesla harmonic
  verbose: false,           // Default: quiet
  skipDelays: false         // Default: use harmonic delays
})
```

**When to skip delays:**
- Unit tests (for speed)
- CI/CD pipelines
- Development iteration

**When to use delays:**
- Production reports
- Baseline comparisons
- Quality gates

---

## Delay Constants

```typescript
import { HarmonicDelays } from './utils/labyrinth-engine';

.addStep({
  name: 'Fast Step',
  delay: HarmonicDelays.IMMEDIATE,  // 0ms
  transform: ...
})

.addStep({
  name: 'Standard Step',
  delay: HarmonicDelays.SINGLE,     // ~204ms
  transform: ...
})

.addStep({
  name: 'Slow Step',
  delay: HarmonicDelays.TRIPLE,     // ~611ms
  transform: ...
})
```

**Available delays:**
- `IMMEDIATE` (0ms)
- `SINGLE` (~204ms)
- `DOUBLE` (~407ms)
- `TRIPLE` (~611ms)
- `QUADRUPLE` (~815ms)
- `QUINTUPLE` (~1019ms)
- `PERFECT_FIFTH` (~2444ms)

---

## Real-World Example (Design Sonar)

```typescript
import { LabyrinthEngine } from '../utils/labyrinth-engine';

interface AnalysisData {
  rawTelemetry: any;
  layoutPHI?: number;
  contrastRatio?: number;
  harmonyIndex?: number;
}

async function analyzeDesign(telemetry: any): Promise<AnalysisData> {
  const labyrinth = new LabyrinthEngine<AnalysisData>({ verbose: true })
    .addStep({
      name: 'Calculate Layout PHI',
      description: 'Golden ratio adherence',
      transform: async (data) => ({
        ...data,
        layoutPHI: computePHI(data.rawTelemetry)
      })
    })
    .addStep({
      name: 'Calculate Contrast Ratio',
      description: 'Average/max contrast',
      transform: async (data) => ({
        ...data,
        contrastRatio: computeContrast(data.rawTelemetry)
      })
    })
    .addStep({
      name: 'Compute Harmony Index',
      description: 'GPT-5 formula',
      transform: async (data) => ({
        ...data,
        harmonyIndex: (data.layoutPHI! * 0.618) + data.contrastRatio!
      })
    });

  const { result, path } = await labyrinth.traverse({ rawTelemetry: telemetry });

  console.log(`Harmony Index: ${result.harmonyIndex}`);
  console.log(`Journey took ${path.length} steps`);

  return result;
}
```

---

## Testing

```typescript
// In your tests (use skipDelays for speed)
const labyrinth = new LabyrinthEngine<TestData>({ skipDelays: true })
  .addStep({ name: 'Step 1', transform: ... })
  .addStep({ name: 'Step 2', transform: ... });

const result = await labyrinth.traverse(initialData);

expect(result.result.value).toBe(expectedValue);
expect(result.sacredTiming).toBe(false); // Delays skipped
```

---

## Error Handling

```typescript
try {
  const result = await labyrinth.traverse(data);
} catch (error) {
  // Error will include step name:
  // "Labyrinth step 'Calculate PHI' failed: ..."
  console.error('Journey failed:', error);
}
```

---

## Path History

```typescript
const result = await labyrinth.traverse(data);

result.path.forEach((record, i) => {
  console.log(`Step ${i + 1}: ${record.step}`);
  console.log(`  Duration: ${record.duration}ms`);
  console.log(`  Timestamp: ${record.timestamp}`);
  console.log(`  Harmonic Delay: ${record.harmonicDelay}ms`);
  console.log(`  Data:`, record.data);
});
```

---

## Performance Comparison

| Approach | Speed | Deterministic | Harmonic Timing |
|----------|-------|---------------|-----------------|
| `Promise.all` | Fastest | ❌ No | ❌ No |
| `skipDelays: true` | 2-3× slower | ✅ Yes | ❌ No |
| `skipDelays: false` | 30× slower | ✅ Yes | ✅ Yes |

**Rule of Thumb**: Use sacred timing (default) for production, skip delays for tests.

---

## Common Patterns

### Sequential Calculation

```typescript
const labyrinth = new LabyrinthEngine<Data>()
  .addStep({ name: 'Fetch', transform: async (d) => ({ ...d, raw: await fetch() }) })
  .addStep({ name: 'Parse', transform: async (d) => ({ ...d, parsed: parse(d.raw) }) })
  .addStep({ name: 'Validate', transform: async (d) => ({ ...d, valid: validate(d.parsed) }) })
  .addStep({ name: 'Store', transform: async (d) => { await store(d); return d; } });
```

### Metric Aggregation

```typescript
.addStep({
  name: 'Aggregate Metrics',
  transform: async (data) => {
    const aggregate = {
      total: data.metric1 + data.metric2 + data.metric3,
      average: (data.metric1 + data.metric2 + data.metric3) / 3,
      max: Math.max(data.metric1, data.metric2, data.metric3)
    };
    return { ...data, aggregate };
  }
})
```

### Conditional Logic

```typescript
.addStep({
  name: 'Apply Regime Rules',
  transform: async (data) => {
    if (data.harmonyIndex < 70) {
      return { ...data, regime: 'exploration', threshold: 0.7 };
    } else if (data.harmonyIndex < 85) {
      return { ...data, regime: 'optimization', threshold: 0.85 };
    } else {
      return { ...data, regime: 'stabilization', threshold: 1.0 };
    }
  }
})
```

---

## Troubleshooting

**Q: Tests are too slow!**
A: Use `skipDelays: true` for tests.

**Q: Results are non-deterministic!**
A: Make sure you're NOT using `Promise.all`. Use Labyrinth instead.

**Q: I need custom timing!**
A: Set `delay` on individual steps or change `teslaFrequencyHz`.

**Q: How do I debug?**
A: Use `verbose: true` to see each step's execution.

---

## Learn More

- **Full Documentation**: `LABYRINTH_SACRED_GEOMETRY.md`
- **Mission Report**: `AGENT_MIKE_MISSION_COMPLETE.md`
- **Contract Tests**: `tests/labyrinth-engine.spec.ts`
- **Benchmarks**: Run `npx tsx benchmark-labyrinth.ts`

---

## The Sacred Pattern

Remember:

- **Single Path** - Sequential execution
- **Each Turn Matters** - Every step transforms data
- **Intentional Delay** - Harmonic timing prevents collisions
- **No Shortcuts** - Anti-premature-optimization

**The labyrinth teaches patience. The journey IS the destination.** 🌀✨

---

*Quick Start Guide by Agent Mike - October 5, 2025*

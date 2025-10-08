# UX Sonar - Animation Telemetry System

## What This Does

UX Sonar captures **high-definition telemetry** of UI animations using:
- **Chrome DevTools Protocol (CDP)** for browser-level metrics
- **Performance Observers** for FPS, CLS, paint timings
- **Animation Event Listeners** for transition tracking
- **RequestAnimationFrame** for frame-by-frame analysis

This revolutionary methodology gives AI "HD Vision" of UI/UX by capturing the complete motion profile of user interactions.

## Philosophy: Ping → Echo → Map → Critique

### 1. Ping
User actions trigger UI changes (clicks, hovers, scrolls)

### 2. Echo
Capture animation response via telemetry:
- Frame timing data
- Layout shifts
- Animation events
- Performance metrics

### 3. Map
Build complete motion profile:
- FPS analysis
- Animation smoothness
- Layout stability
- Performance bottlenecks

### 4. Critique
AI analyzes for optimization opportunities

## Metrics Captured

### Core Performance Metrics
- **Average FPS**: Smoothness indicator (target: 60 FPS)
  - Calculated from requestAnimationFrame deltas
  - Shows overall rendering performance

- **p95 Frame Drop**: 95th percentile frame time
  - Identifies worst-case performance
  - Helps catch intermittent stutters

- **Max Frame Gap**: Worst frame stutter
  - Single largest frame delay
  - Critical for detecting janks

### User Experience Metrics
- **Total CLS** (Cumulative Layout Shift): Target < 0.1
  - Measures visual stability
  - Tracks unexpected layout movements
  - Core Web Vital metric

- **Long Tasks**: Main thread blocking time
  - Tasks longer than 50ms
  - Indicates UI unresponsiveness

### Animation Metrics
- **Animation Count**: Number of animations triggered
  - Tracks CSS animations, transitions, Web Animations
  - Includes pseudo-element animations

- **Time to Stable**: When UI settles (no changes for 500ms)
  - Measures total interaction time
  - From navigation to stable state

## Telemetry Data Structure

### Frame Data
```typescript
{
  timestamp: number;  // Performance.now() when frame rendered
  delta: number;      // Time since last frame (ms)
}
```

### Animation Events
```typescript
{
  type: string;           // 'animationstart', 'animationend', 'transitionrun', etc.
  name: string;           // Animation/property name
  timestamp: number;      // When event fired
  target?: string;        // data-testid if available
}
```

### Layout Shifts
```typescript
{
  timestamp: number;      // When shift occurred
  value: number;          // Shift magnitude
  sources: number;        // Number of elements that shifted
}
```

### CDP Telemetry
```typescript
{
  type: string;           // 'animationCreated', 'animationStarted', metric name
  name?: string;          // Animation name
  timestamp: number;      // Capture time
  duration?: number;      // Animation duration
  value?: number;         // Metric value
}
```

## Usage

### Running Tests

```bash
# Run all UX Sonar tests
npm run sonar

# Run with visible browser (watch animations)
npm run sonar:headed

# Debug mode (step through tests)
npm run sonar:debug
```

### Creating New Tests

```typescript
import { test, expect } from '@playwright/test';
import { SonicRadarEngine } from './sonic-radar-engine';

test('My Page - Animation Analysis', async ({ page }) => {
  const sonar = new SonicRadarEngine(page);
  await sonar.initialize();

  const result = await sonar.pingFlow('http://localhost:3000/my-page', [
    { type: 'wait', waitAfter: 1000 },
    { type: 'click', selector: 'button.cta', waitAfter: 500 },
    { type: 'scroll', pixels: 300, waitAfter: 500 }
  ]);

  console.log('=== UX METRICS ===');
  console.log(`Average FPS: ${result.metrics.avgFPS}`);
  console.log(`Total CLS: ${result.metrics.totalCLS}`);
  console.log(`Animations: ${result.metrics.animationCount}`);

  // Assertions
  expect(result.metrics.avgFPS).toBeGreaterThan(50);
  expect(result.metrics.totalCLS).toBeLessThan(0.1);

  await sonar.cleanup();
});
```

### Available Actions

```typescript
// Wait (allow animations to complete)
{ type: 'wait', waitAfter: 1000 }

// Click interaction
{ type: 'click', selector: 'button.cta', waitAfter: 500 }

// Hover interaction
{ type: 'hover', selector: '.card', waitAfter: 300 }

// Scroll interaction
{ type: 'scroll', pixels: 500, waitAfter: 500 }
```

## Architecture

### SonicRadarEngine Class

#### initialize()
- Establishes CDP connection
- Enables Animation, Performance, DOM domains
- Injects telemetry collectors into page
- Sets up event listeners

#### pingFlow(route, actions)
- Navigates to route
- Executes user actions sequentially
- Captures telemetry from CDP and page
- Computes performance metrics
- Returns complete telemetry snapshot

#### computeMetrics(pageTelemetry)
- Calculates FPS from frame deltas
- Computes p95 and max frame gaps
- Sums layout shifts for CLS
- Aggregates long task durations
- Counts animation events

#### cleanup()
- Detaches CDP session
- Releases resources

### Injected Collectors

The engine injects the following collectors into each page:

1. **Frame Timing**: requestAnimationFrame loop capturing frame deltas
2. **Animation Events**: Event listeners for CSS/Web Animations API
3. **Performance Observer**: Monitoring long tasks and paint events
4. **Layout Shift Observer**: Tracking cumulative layout shifts

## Performance Targets

### Excellent (60+ FPS)
- Buttery smooth animations
- No visible stuttering
- Ideal user experience

### Good (40-60 FPS)
- Generally smooth
- Occasional minor stutters acceptable
- Most users won't notice

### Acceptable (30-40 FPS)
- Visible stuttering on demanding animations
- May need optimization
- Acceptable for complex interactions

### Poor (<30 FPS)
- Significant janking
- Poor user experience
- Requires optimization

### CLS Targets
- **Good**: < 0.1
- **Needs Improvement**: 0.1 - 0.25
- **Poor**: > 0.25

## Output Files

After running tests:
- **HTML Report**: `ux-sonar-report/index.html`
- **JSON Results**: `ux-sonar-results/results.json`
- **Test Artifacts**: `ux-sonar-results/` (screenshots, videos on failure)

## Integration with AsymmBill

Current test coverage:
1. **Landing Page** (`/`)
   - Hero section animations
   - Scroll-triggered effects
   - Component interactions

2. **Canvas Enhanced** (`/canvas-enhanced`)
   - Canvas rendering performance
   - Interactive element tracking

3. **Test Visual** (`/test-visual`)
   - Visual test suite animations
   - Component animation performance

## Next Steps (Agent Bravo)

The telemetry data captured by Agent Alpha needs:
1. **Normalization**: Convert raw telemetry to standardized format
2. **Pattern Detection**: Identify animation bottlenecks
3. **AI Analysis**: Feed normalized data to LLM for critique
4. **Optimization Suggestions**: Generate actionable recommendations

## Technical Notes

### Why Chromium Only?
CDP (Chrome DevTools Protocol) is a Chromium-specific API. While Playwright supports multiple browsers, CDP features are only available in Chromium-based browsers.

### Why Single Worker?
Sequential execution ensures deterministic telemetry capture. Parallel tests can interfere with each other's timing measurements.

### Why No Retries?
Performance metrics must be accurate. Retries would skew average values and hide real performance issues.

## Credits

Methodology pioneered by **Sarat** - revolutionary approach to giving AI high-definition vision of UI/UX through animation telemetry.

---

**Built with:** Playwright + Chrome DevTools Protocol + TypeScript
**Part of:** AsymmBill UX Sonar System
**Agent:** Alpha (Core Engine Implementation)

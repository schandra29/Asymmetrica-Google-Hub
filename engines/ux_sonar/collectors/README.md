# Telemetry Collectors & Normalizer

## Architecture

\`\`\`
[Frontend Collector] → Captures UI/UX metrics (FPS, CLS, animations)
[Backend Collector]  → Captures API metrics (latency, errors)
       ↓
[Normalizer] → Converts to structured JSON with:
  - Smoothness Index
  - Energy Efficiency
  - Asymmetrica regime classification
  - Complexity assessment
       ↓
[Baseline Storage] → Saves to JSON for comparison
\`\`\`

## Metrics Computed

### Smoothness Index
\`avgFPS / (1 + totalCLS + longTaskPenalty)\`

Higher = smoother experience

### Energy Efficiency
\`Perceived responsiveness / CPU time\`

Higher = more efficient animations

### Regime Classification
- **Exploration**: Needs work (CLS > 0.1 or FPS < 40)
- **Optimization**: Good but can improve
- **Stabilization**: Solid performance

## Baseline Management

Baselines stored in \`tests/ux-sonar/baselines/{route}.json\`

Compare current run against baseline to detect regressions.

## Running Tests

\`\`\`bash
npm run test tests/ux-sonar/full-pipeline.spec.ts
\`\`\`

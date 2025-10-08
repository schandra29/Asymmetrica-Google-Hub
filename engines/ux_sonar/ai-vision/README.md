# AI Vision Engine

## Architecture

The AI Vision Engine analyzes normalized telemetry and generates actionable critiques:

```
[Normalized Telemetry]
    ↓
[Heuristics Engine] → Rule-based issue detection
    ↓
[Critique Adapter] → Generate critique with code examples
    ↓
[Report Generator] → Markdown/JSON reports
    ↓
[CI Integration] → PR comments, pass/fail decisions
```

## Heuristics

- **low-fps**: FPS < 50
- **high-cls**: CLS > 0.1
- **long-tasks**: Main thread blocking > 100ms
- **animation-jank**: Low FPS with many animations
- **backend-latency**: API latency > 500ms

## Scoring

### Smoothness Score (0-100)
Based on Smoothness Index × 1.5

### Energy Score (0-100)
Based on Energy Efficiency × 20

### Overall Score
Average of Smoothness + Energy scores

## CI/CD Integration

- Score ≥ 80: ✅ PASS
- Score 60-79: ⚠️ WARNING
- Score < 60: ❌ FAIL
- Any critical issues: ❌ FAIL

## Usage

```bash
# Analyze route
npm run sonar:analyze http://localhost:3000

# Run full pipeline
npm run sonar
```

## Components

### HeuristicsEngine
Rule-based issue detection using configurable heuristics. Each heuristic has:
- Condition (metric threshold)
- Severity (critical/warning/info)
- Message template
- Suggestion for fixing

### CritiqueAdapter
Transforms normalized telemetry into AI critique:
- Runs all heuristics
- Generates code examples
- Computes scores (smoothness, energy, overall)
- Creates summary and recommendations

### ReportGenerator
Creates human-readable reports:
- Markdown format for documentation
- JSON format for programmatic use
- Saves to `tests/ux-sonar/reports/`

### CIIntegration
Integrates with CI/CD pipelines:
- Generates PR comments
- Compares against baselines
- Determines pass/fail status
- Highlights critical issues

## Example Output

```markdown
# UX Sonar Report - /

**Generated:** 2025-10-05T02:00:00.000Z
**Regime:** optimization
**Overall Score:** 75.5/100

## Summary

⚠️ Found 0 critical issues and 1 warnings. FPS: 58.3, CLS: 0.05. Regime: optimization.

## Issues Found

### 1. animation-jank (warning)

**Description:** Animation performance degraded with 8 concurrent animations

**Suggestion:** Reduce concurrent animations. Use will-change CSS property sparingly.

**Code Example:**
\`\`\`javascript
// Stagger animations:
elements.forEach((el, i) => {
  gsap.to(el, {
    opacity: 1,
    delay: i * 0.1,
    duration: 0.3
  });
});
\`\`\`

## Recommendations

- Fine-tune animation timings and reduce complexity
- Profile JavaScript execution to find bottlenecks
- Set up UX Sonar baselines for continuous monitoring
```

## Extending Heuristics

Add new heuristics to `heuristics.ts`:

```typescript
{
  name: 'my-heuristic',
  condition: (m) => m.customMetric > threshold,
  severity: 'warning',
  message: 'Custom issue detected: {{customMetric}}',
  suggestion: 'How to fix this issue'
}
```

## Integration with Three-Regime Testing

The AI Vision Engine uses regime classification:
- **Exploration**: Focus on critical fixes
- **Optimization**: Fine-tune performance
- **Stabilization**: Maintain through monitoring

Recommendations adapt based on current regime.

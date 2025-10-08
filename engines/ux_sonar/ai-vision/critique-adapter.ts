import { HeuristicsEngine } from './heuristics';

interface AICritique {
  summary: string;
  issues: Array<{
    type: string;
    severity: string;
    description: string;
    suggestion: string;
    codeExample?: string;
  }>;
  metrics: {
    smoothnessScore: number;
    energyScore: number;
    overallScore: number;
  };
  recommendations: string[];
}

export class CritiqueAdapter {
  private heuristics = new HeuristicsEngine();

  generateCritique(normalizedTelemetry: any): AICritique {
    const frontendMetrics = normalizedTelemetry.layers.frontend?.metrics || {};
    const backendMetrics = normalizedTelemetry.layers.backend?.metrics || {};

    // Combine metrics for heuristic analysis
    const allMetrics = {
      ...frontendMetrics,
      ...backendMetrics
    };

    // Run heuristics
    const heuristicIssues = this.heuristics.analyze(allMetrics);

    // Generate issues with code examples
    const issues = heuristicIssues.map(issue => ({
      type: issue.heuristic,
      severity: issue.severity,
      description: issue.message,
      suggestion: issue.suggestion,
      codeExample: this.generateCodeExample(issue.heuristic, allMetrics)
    }));

    // Compute scores
    const smoothnessScore = this.computeSmoothnessScore(normalizedTelemetry);
    const energyScore = this.computeEnergyScore(normalizedTelemetry);
    const overallScore = (smoothnessScore + energyScore) / 2;

    // Generate summary
    const summary = this.generateSummary(normalizedTelemetry, issues);

    // Generate recommendations
    const recommendations = this.generateRecommendations(normalizedTelemetry, issues);

    return {
      summary,
      issues,
      metrics: {
        smoothnessScore: Math.round(smoothnessScore * 100) / 100,
        energyScore: Math.round(energyScore * 100) / 100,
        overallScore: Math.round(overallScore * 100) / 100
      },
      recommendations
    };
  }

  private generateCodeExample(heuristic: string, metrics: any): string | undefined {
    const examples: Record<string, string> = {
      'low-fps': `// Instead of animating layout properties:
element.style.width = '100px'; // ❌ Causes reflow

// Use transform:
element.style.transform = 'scaleX(1.5)'; // ✅ GPU-accelerated`,

      'high-cls': `// Reserve space for dynamic content:
<div style="min-height: 200px;"> {/* Prevents layout shift */}
  <img src="..." style="aspect-ratio: 16/9;" />
</div>`,

      'long-tasks': `// Break up long tasks:
function heavyWork() {
  for (let i = 0; i < items.length; i++) {
    if (i % 100 === 0) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    processItem(items[i]);
  }
}`,

      'animation-jank': `// Stagger animations:
elements.forEach((el, i) => {
  gsap.to(el, {
    opacity: 1,
    delay: i * 0.1, // Stagger by 100ms
    duration: 0.3
  });
})`
    };

    return examples[heuristic];
  }

  private computeSmoothnessScore(telemetry: any): number {
    const smoothness = telemetry.metrics.smoothnessIndex || 0;
    // Normalize to 0-100 scale
    return Math.min(100, smoothness * 1.5);
  }

  private computeEnergyScore(telemetry: any): number {
    const energy = telemetry.metrics.energyEfficiency || 0;
    // Normalize to 0-100 scale (cap at reasonable value)
    return Math.min(100, energy * 20);
  }

  private generateSummary(telemetry: any, issues: any[]): string {
    const regime = telemetry.asymmetrica.regime;
    const fps = telemetry.layers.frontend?.metrics.fps || 0;
    const cls = telemetry.layers.frontend?.metrics.cls || 0;

    if (issues.length === 0) {
      return `✅ Excellent performance! FPS: ${fps.toFixed(1)}, CLS: ${cls.toFixed(3)}. Currently in ${regime} regime.`;
    }

    const critical = issues.filter(i => i.severity === 'critical').length;
    const warnings = issues.filter(i => i.severity === 'warning').length;

    return `⚠️ Found ${critical} critical issues and ${warnings} warnings. FPS: ${fps.toFixed(1)}, CLS: ${cls.toFixed(3)}. Regime: ${regime}.`;
  }

  private generateRecommendations(telemetry: any, issues: any[]): string[] {
    const recs: string[] = [];

    // Regime-based recommendations
    const regime = telemetry.asymmetrica.regime;

    if (regime === 'exploration') {
      recs.push('Focus on fixing critical performance issues before optimizing');
    } else if (regime === 'optimization') {
      recs.push('Fine-tune animation timings and reduce complexity');
    } else {
      recs.push('Maintain current performance through monitoring');
    }

    // Issue-based recommendations
    if (issues.some(i => i.type === 'low-fps')) {
      recs.push('Profile JavaScript execution to find bottlenecks');
    }

    if (issues.some(i => i.type === 'high-cls')) {
      recs.push('Use skeleton screens for loading states');
    }

    // Always recommend monitoring
    recs.push('Set up UX Sonar baselines for continuous monitoring');

    return recs;
  }
}

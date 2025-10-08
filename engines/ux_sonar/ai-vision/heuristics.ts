interface Heuristic {
  name: string;
  condition: (metrics: any) => boolean;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  suggestion: string;
}

export class HeuristicsEngine {
  private heuristics: Heuristic[] = [
    {
      name: 'low-fps',
      condition: (m) => m.fps < 50,
      severity: 'critical',
      message: 'Frame rate below optimal ({{fps}} FPS, target: 60)',
      suggestion: 'Use transform/opacity for animations instead of layout properties. Check for heavy JavaScript blocking the main thread.'
    },
    {
      name: 'high-cls',
      condition: (m) => m.cls > 0.1,
      severity: 'critical',
      message: 'High Cumulative Layout Shift detected ({{cls}}, target: <0.1)',
      suggestion: 'Reserve space for dynamic content. Use aspect-ratio CSS for images. Avoid inserting content above existing content.'
    },
    {
      name: 'long-tasks',
      condition: (m) => m.longTasks > 100,
      severity: 'warning',
      message: 'Excessive main thread blocking ({{longTasks}}ms)',
      suggestion: 'Break up long tasks using setTimeout, requestIdleCallback, or Web Workers. Consider code splitting.'
    },
    {
      name: 'animation-jank',
      condition: (m) => m.fps < 55 && m.animationCount > 5,
      severity: 'warning',
      message: 'Animation performance degraded with {{animationCount}} concurrent animations',
      suggestion: 'Reduce concurrent animations. Use will-change CSS property sparingly. Consider staggering animation start times.'
    },
    {
      name: 'backend-latency',
      condition: (m) => m.latency && m.latency > 500,
      severity: 'warning',
      message: 'API latency high ({{latency}}ms, target: <500ms)',
      suggestion: 'Optimize database queries. Implement caching. Consider pagination for large datasets.'
    }
  ];

  analyze(metrics: any): Array<{
    heuristic: string;
    severity: string;
    message: string;
    suggestion: string;
  }> {
    const issues = [];

    for (const heuristic of this.heuristics) {
      if (heuristic.condition(metrics)) {
        issues.push({
          heuristic: heuristic.name,
          severity: heuristic.severity,
          message: this.interpolate(heuristic.message, metrics),
          suggestion: heuristic.suggestion
        });
      }
    }

    return issues;
  }

  private interpolate(message: string, metrics: any): string {
    return message.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      const value = metrics[key];
      if (typeof value === 'number') {
        return value.toFixed(2);
      }
      return value || 'N/A';
    });
  }
}

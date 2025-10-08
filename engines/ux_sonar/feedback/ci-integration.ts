export class CIIntegration {

  generatePRComment(critique: any, baseline: any | null): string {
    let comment = `## 🦇 UX Sonar Analysis\n\n`;

    // Overall verdict
    if (critique.metrics.overallScore >= 80) {
      comment += `✅ **PASSED** - Overall Score: ${critique.metrics.overallScore}/100\n\n`;
    } else if (critique.metrics.overallScore >= 60) {
      comment += `⚠️ **WARNING** - Overall Score: ${critique.metrics.overallScore}/100\n\n`;
    } else {
      comment += `❌ **FAILED** - Overall Score: ${critique.metrics.overallScore}/100\n\n`;
    }

    // Summary
    comment += `${critique.summary}\n\n`;

    // Baseline comparison (if exists)
    if (baseline) {
      comment += `### Baseline Comparison\n\n`;
      comment += `| Metric | Current | Baseline | Change |\n`;
      comment += `|--------|---------|----------|--------|\n`;
      comment += `| Smoothness | ${critique.metrics.smoothnessScore} | ${baseline.critique?.metrics?.smoothnessScore || 'N/A'} | ${this.formatDelta(critique.metrics.smoothnessScore, baseline.critique?.metrics?.smoothnessScore)} |\n`;
      comment += `| Energy | ${critique.metrics.energyScore} | ${baseline.critique?.metrics?.energyScore || 'N/A'} | ${this.formatDelta(critique.metrics.energyScore, baseline.critique?.metrics?.energyScore)} |\n\n`;
    }

    // Critical issues
    const criticalIssues = critique.issues.filter((i: any) => i.severity === 'critical');
    if (criticalIssues.length > 0) {
      comment += `### 🚨 Critical Issues\n\n`;
      criticalIssues.forEach((issue: any) => {
        comment += `- **${issue.type}**: ${issue.description}\n`;
        comment += `  - ${issue.suggestion}\n\n`;
      });
    }

    // Recommendations
    if (critique.recommendations.length > 0) {
      comment += `### 💡 Recommendations\n\n`;
      critique.recommendations.forEach((rec: string) => {
        comment += `- ${rec}\n`;
      });
    }

    comment += `\n---\n*Powered by UX Sonar*`;

    return comment;
  }

  private formatDelta(current: number, baseline: number | undefined): string {
    if (baseline === undefined) return 'N/A';
    const delta = current - baseline;
    if (delta > 0) return `+${delta.toFixed(1)} ✅`;
    if (delta < 0) return `${delta.toFixed(1)} ⚠️`;
    return '0';
  }

  shouldFailCI(critique: any): boolean {
    // Fail CI if overall score < 60 or any critical issues
    return critique.metrics.overallScore < 60 ||
           critique.issues.some((i: any) => i.severity === 'critical');
  }
}

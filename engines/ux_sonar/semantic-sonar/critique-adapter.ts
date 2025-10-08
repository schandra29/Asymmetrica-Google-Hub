/**
 * Semantic Sonar Critique Adapter
 * AI-powered architecture critique with decoupling and refactoring suggestions
 */

export interface SemanticCritiqueResult {
  summary: string;
  praise: string[];
  improvements: {
    priority: 'high' | 'medium' | 'low';
    category: string;
    issue: string;
    suggestion: string;
    codeExample: string;
    estimatedImpact: string;
  }[];
  refactoringRoadmap: {
    phase: string;
    tasks: string[];
    estimatedEffort: string;
  }[];
}

export class SemanticCritiqueAdapter {

  generateCritique(normalized: any, heuristics: any[]): SemanticCritiqueResult {
    const praise = this.generatePraise(normalized);
    const improvements = this.generateImprovements(normalized, heuristics);
    const roadmap = this.generateRefactoringRoadmap(normalized, improvements);
    const summary = this.generateSummary(normalized, praise, improvements);

    return {
      summary,
      praise,
      improvements,
      refactoringRoadmap: roadmap
    };
  }

  private generatePraise(normalized: any): string[] {
    const praise: string[] = [];
    const metrics = normalized.metrics;
    const telemetry = normalized.telemetry;

    if (metrics.aqs > 0.8) {
      praise.push(`✅ Excellent architecture quality: AQS = ${metrics.aqs.toFixed(2)} (coupling-cohesion ratio optimized)`);
    }

    if (telemetry.cycles.length === 0) {
      praise.push('✅ Zero circular dependencies! Clean dependency graph.');
    }

    if (metrics.modularityIndex > 0.8) {
      praise.push(`✅ High modularity: ${(metrics.modularityIndex * 100).toFixed(0)}% (well-structured architecture)`);
    }

    if (telemetry.godModules.length === 0) {
      praise.push('✅ No god modules! Responsibilities well-distributed.');
    }

    if (telemetry.layeringViolations.length === 0) {
      praise.push('✅ Clean architectural layering! No cross-layer violations.');
    }

    if (metrics.architectureHealth > 85) {
      praise.push(`✅ Excellent architecture health: ${metrics.architectureHealth}/100`);
    }

    return praise;
  }

  private generateImprovements(normalized: any, heuristics: any[]): SemanticCritiqueResult['improvements'] {
    const improvements: SemanticCritiqueResult['improvements'] = [];

    heuristics.forEach(h => {
      const priority = h.severity === 'critical' ? 'high' : h.severity === 'warning' ? 'medium' : 'low';

      improvements.push({
        priority,
        category: this.categorizeHeuristic(h.heuristic),
        issue: h.message,
        suggestion: h.suggestion,
        codeExample: h.codeExample || '',
        estimatedImpact: this.estimateImpact(h.heuristic)
      });
    });

    improvements.sort((a, b) => {
      const order = { high: 3, medium: 2, low: 1 };
      return order[b.priority] - order[a.priority];
    });

    return improvements;
  }

  private categorizeHeuristic(heuristic: string): string {
    const categories: { [key: string]: string } = {
      'dependency-cycle': 'Circular Dependencies',
      'excessive-coupling': 'Module Coupling',
      'god-module': 'Module Responsibility',
      'anti-layering': 'Architecture Layering',
      'orphan-domain': 'Code Organization'
    };
    return categories[heuristic] || 'Architecture';
  }

  private estimateImpact(heuristic: string): string {
    const impacts: { [key: string]: string } = {
      'dependency-cycle': 'Breaking cycles → 50% easier testing, 40% faster builds',
      'excessive-coupling': 'Reducing coupling → 60% fewer ripple effects, easier refactoring',
      'god-module': 'Splitting god modules → 70% clearer responsibilities, better testability',
      'anti-layering': 'Fixing layering → Better maintainability, cleaner architecture',
      'orphan-domain': 'Removing orphans → Smaller bundle, reduced cognitive load'
    };
    return impacts[heuristic] || 'Improved architecture quality';
  }

  private generateRefactoringRoadmap(normalized: any, improvements: SemanticCritiqueResult['improvements']): SemanticCritiqueResult['refactoringRoadmap'] {
    const roadmap: SemanticCritiqueResult['refactoringRoadmap'] = [];

    const high = improvements.filter(i => i.priority === 'high');
    if (high.length > 0) {
      roadmap.push({
        phase: 'Phase 1: Critical Architecture Fixes (Week 1-2)',
        tasks: high.map(i => `Fix ${i.category}: ${i.issue.split('.')[0]}`),
        estimatedEffort: `${high.length * 6} hours`
      });
    }

    const medium = improvements.filter(i => i.priority === 'medium');
    if (medium.length > 0) {
      roadmap.push({
        phase: 'Phase 2: Architecture Optimization (Week 3-4)',
        tasks: medium.map(i => `Optimize ${i.category}: ${i.issue.split('.')[0]}`),
        estimatedEffort: `${medium.length * 4} hours`
      });
    }

    const low = improvements.filter(i => i.priority === 'low');
    if (low.length > 0) {
      roadmap.push({
        phase: 'Phase 3: Architecture Cleanup (Week 5)',
        tasks: low.map(i => `Clean up ${i.category}`),
        estimatedEffort: `${low.length * 2} hours`
      });
    }

    roadmap.push({
      phase: 'Phase 4: Architecture Governance (Ongoing)',
      tasks: [
        'Set up madge in CI/CD to detect new cycles',
        'Configure architecture tests (ArchUnit or similar)',
        'Establish module ownership and boundaries',
        'Document architecture decision records (ADRs)'
      ],
      estimatedEffort: '6 hours setup'
    });

    return roadmap;
  }

  private generateSummary(normalized: any, praise: string[], improvements: SemanticCritiqueResult['improvements']): string {
    const metrics = normalized.metrics;
    const regime = normalized.asymmetrica.regime;

    let summary = `## Architecture Quality Summary\n\n`;

    const regimeEmoji = regime === 'stabilization' ? '✅' : regime === 'optimization' ? '⚠️' : '🔴';
    summary += `**Regime:** ${regimeEmoji} ${regime.toUpperCase()}\n\n`;

    summary += `**Key Metrics:**\n`;
    summary += `- AQS (Architecture Quality Score): ${metrics.aqs.toFixed(2)} (target: > 0.6)\n`;
    summary += `- Modularity Index: ${(metrics.modularityIndex * 100).toFixed(0)}% (target: > 70%)\n`;
    summary += `- Architecture Health: ${metrics.architectureHealth}/100 (target: > 70)\n`;
    summary += `- Coupling: ${metrics.coupling.toFixed(1)} (target: < 5)\n`;
    summary += `- Cohesion: ${(metrics.cohesion * 100).toFixed(0)}% (target: > 70%)\n\n`;

    if (praise.length >= 4) {
      summary += `**Overall:** Excellent architecture! ${praise.length} praise signals.\n\n`;
    } else if (improvements.length <= 2) {
      summary += `**Overall:** Good architecture with minor improvements.\n\n`;
    } else {
      summary += `**Overall:** Architecture needs attention. Several issues detected.\n\n`;
    }

    const highPriority = improvements.filter(i => i.priority === 'high').length;
    if (highPriority > 0) {
      summary += `**Action Required:** ${highPriority} critical architecture issues.\n`;
    }

    return summary;
  }
}

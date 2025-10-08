/**
 * Code Sonar Critique Adapter
 * AI-powered code quality critique with refactoring suggestions
 * Generates actionable feedback with code examples
 */

export interface CritiqueResult {
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

export class CodeCritiqueAdapter {

  /**
   * Generate comprehensive critique from normalized telemetry
   */
  generateCritique(normalized: any, heuristics: any[]): CritiqueResult {
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

  /**
   * Generate praise for good code quality metrics
   */
  private generatePraise(normalized: any): string[] {
    const praise: string[] = [];
    const metrics = normalized.metrics;
    const telemetry = normalized.telemetry;

    // Praise for low bug density
    if (metrics.bugDensity < 0.03) {
      praise.push(`✅ Excellent bug density: ${metrics.bugDensity.toFixed(3)} bugs/LOC (industry average: 0.05)`);
    }

    // Praise for high cohesion
    if (metrics.cohesionScore > 0.8) {
      praise.push(`✅ Strong cohesion: ${(metrics.cohesionScore * 100).toFixed(0)}% (functions are focused and single-responsibility)`);
    }

    // Praise for maintainability
    if (metrics.maintainabilityIndex > 80) {
      praise.push(`✅ Highly maintainable code: MI = ${metrics.maintainabilityIndex}/100`);
    }

    // Praise for low complexity
    if (telemetry.metrics.avgComplexity < 5) {
      praise.push(`✅ Low complexity: Average CC = ${telemetry.metrics.avgComplexity.toFixed(1)} (target: < 5)`);
    }

    // Praise for minimal duplication
    if (telemetry.metrics.duplicationRatio < 0.03) {
      praise.push(`✅ Minimal code duplication: ${(telemetry.metrics.duplicationRatio * 100).toFixed(1)}% (DRY principle upheld)`);
    }

    // Praise for clean codebase
    if (telemetry.deadCode.length === 0) {
      praise.push('✅ Zero dead code detected! Clean and lean codebase.');
    }

    // Praise for optimized bundles
    const bloatedBundles = telemetry.bundles.filter((b: any) => b.sizeGzip > 250 * 1024);
    if (telemetry.bundles.length > 0 && bloatedBundles.length === 0) {
      praise.push('✅ All bundles under 250 KB gzip! Excellent performance optimization.');
    }

    return praise;
  }

  /**
   * Generate improvement recommendations from heuristics
   */
  private generateImprovements(normalized: any, heuristics: any[]): CritiqueResult['improvements'] {
    const improvements: CritiqueResult['improvements'] = [];

    heuristics.forEach(heuristic => {
      const priority = this.determinePriority(heuristic.severity, normalized);
      const impact = this.estimateImpact(heuristic.heuristic, normalized);

      improvements.push({
        priority,
        category: this.categorizeHeuristic(heuristic.heuristic),
        issue: heuristic.message,
        suggestion: heuristic.suggestion,
        codeExample: heuristic.codeExample || '// No example available',
        estimatedImpact: impact
      });
    });

    // Sort by priority (high → medium → low)
    improvements.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    return improvements;
  }

  /**
   * Determine priority based on severity and current metrics
   */
  private determinePriority(severity: string, normalized: any): 'high' | 'medium' | 'low' {
    // Critical severity always high priority
    if (severity === 'critical') return 'high';

    // Warning with bad metrics = high priority
    if (severity === 'warning' && normalized.metrics.bugDensity > 0.05) {
      return 'high';
    }

    // Warning = medium priority
    if (severity === 'warning') return 'medium';

    // Info = low priority
    return 'low';
  }

  /**
   * Categorize heuristic into improvement area
   */
  private categorizeHeuristic(heuristic: string): string {
    const categories: { [key: string]: string } = {
      'cyclomatic-complexity-high': 'Code Complexity',
      'duplication-block': 'Code Duplication',
      'bundle-bloat': 'Performance',
      'dead-code': 'Code Cleanliness',
      'lint-violations-critical': 'Code Quality'
    };

    return categories[heuristic] || 'General';
  }

  /**
   * Estimate impact of fixing the issue
   */
  private estimateImpact(heuristic: string, normalized: any): string {
    const impacts: { [key: string]: string } = {
      'cyclomatic-complexity-high': 'Reducing complexity by 50% → 40% fewer bugs (r=0.72 correlation)',
      'duplication-block': 'Eliminating duplication → 30% faster maintenance, easier refactoring',
      'bundle-bloat': 'Reducing bundle size → 20-50% faster page loads, better Core Web Vitals',
      'dead-code': 'Removing dead code → 5-10% smaller bundles, clearer codebase',
      'lint-violations-critical': 'Fixing violations → Better accessibility, security, and UX'
    };

    return impacts[heuristic] || 'Improved code quality and maintainability';
  }

  /**
   * Generate refactoring roadmap with phases
   */
  private generateRefactoringRoadmap(normalized: any, improvements: CritiqueResult['improvements']): CritiqueResult['refactoringRoadmap'] {
    const roadmap: CritiqueResult['refactoringRoadmap'] = [];

    // Phase 1: Critical issues (high priority)
    const criticalImprovements = improvements.filter(i => i.priority === 'high');
    if (criticalImprovements.length > 0) {
      roadmap.push({
        phase: 'Phase 1: Critical Fixes (Week 1)',
        tasks: criticalImprovements.map(i => `Fix ${i.category}: ${i.issue.split('.')[0]}`),
        estimatedEffort: `${criticalImprovements.length * 4} hours`
      });
    }

    // Phase 2: Medium priority improvements
    const mediumImprovements = improvements.filter(i => i.priority === 'medium');
    if (mediumImprovements.length > 0) {
      roadmap.push({
        phase: 'Phase 2: Optimization (Week 2-3)',
        tasks: mediumImprovements.map(i => `Optimize ${i.category}: ${i.issue.split('.')[0]}`),
        estimatedEffort: `${mediumImprovements.length * 3} hours`
      });
    }

    // Phase 3: Low priority cleanups
    const lowImprovements = improvements.filter(i => i.priority === 'low');
    if (lowImprovements.length > 0) {
      roadmap.push({
        phase: 'Phase 3: Cleanup (Week 4)',
        tasks: lowImprovements.map(i => `Clean up ${i.category}: ${i.issue.split('.')[0]}`),
        estimatedEffort: `${lowImprovements.length * 2} hours`
      });
    }

    // Phase 4: Establish quality gates
    roadmap.push({
      phase: 'Phase 4: Quality Gates (Ongoing)',
      tasks: [
        'Configure ESLint with complexity rules (max-complexity: 10)',
        'Add jscpd to CI/CD pipeline (fail on > 3% duplication)',
        'Set up bundle size monitoring (budget: 250 KB/route)',
        'Enable pre-commit hooks for code quality checks'
      ],
      estimatedEffort: '4 hours setup'
    });

    return roadmap;
  }

  /**
   * Generate executive summary
   */
  private generateSummary(normalized: any, praise: string[], improvements: CritiqueResult['improvements']): string {
    const metrics = normalized.metrics;
    const regime = normalized.asymmetrica.regime;

    let summary = `## Code Quality Summary\n\n`;

    // Regime status
    const regimeEmoji = regime === 'stabilization' ? '✅' : regime === 'optimization' ? '⚠️' : '🔴';
    summary += `**Regime:** ${regimeEmoji} ${regime.toUpperCase()}\n\n`;

    // Key metrics
    summary += `**Key Metrics:**\n`;
    summary += `- Bug Density: ${metrics.bugDensity.toFixed(3)} bugs/LOC (target: < 0.05)\n`;
    summary += `- Maintainability Index: ${metrics.maintainabilityIndex}/100 (target: > 65)\n`;
    summary += `- Cohesion Score: ${(metrics.cohesionScore * 100).toFixed(0)}% (target: > 70%)\n`;
    summary += `- Complexity Score: ${metrics.complexityScore}/100 (target: > 70)\n`;
    summary += `- Duplication Score: ${metrics.duplicationScore}/100 (target: > 85)\n\n`;

    // Overall assessment
    if (praise.length >= 5) {
      summary += `**Overall:** Excellent code quality! ${praise.length} praise signals detected.\n\n`;
    } else if (improvements.length <= 2) {
      summary += `**Overall:** Good code quality with minor improvements needed.\n\n`;
    } else if (improvements.length <= 5) {
      summary += `**Overall:** Moderate code quality. Several improvements recommended.\n\n`;
    } else {
      summary += `**Overall:** Code quality needs attention. Multiple issues detected.\n\n`;
    }

    // Action items
    const highPriorityCount = improvements.filter(i => i.priority === 'high').length;
    if (highPriorityCount > 0) {
      summary += `**Action Required:** ${highPriorityCount} high-priority issues need immediate attention.\n`;
    }

    return summary;
  }

  /**
   * Generate refactoring code example for a specific issue
   */
  generateRefactoringExample(improvement: CritiqueResult['improvements'][0]): string {
    return `
### ${improvement.category}: ${improvement.issue.split('.')[0]}

**Priority:** ${improvement.priority.toUpperCase()}

**Issue:**
${improvement.issue}

**Suggestion:**
${improvement.suggestion}

**Estimated Impact:**
${improvement.estimatedImpact}

**Code Example:**
\`\`\`typescript
${improvement.codeExample}
\`\`\`
`;
  }
}

/**
 * Design Sonar Critique Adapter
 * Generates AI-powered design critiques with actionable code fixes
 */

import { DesignHeuristicsEngine } from './heuristics';

interface DesignCritique {
  summary: string;
  issues: Array<{
    type: string;
    severity: string;
    description: string;
    suggestion: string;
    codeExample?: string;
    affectedElements?: string[];
  }>;
  metrics: {
    harmonyScore: number;
    contrastScore: number;
    hierarchyScore: number;
    spacingScore: number;
    overallScore: number;
  };
  praise: string[];
  recommendations: string[];
}

export class DesignCritiqueAdapter {
  private heuristics = new DesignHeuristicsEngine();

  generateCritique(normalizedTelemetry: any): DesignCritique {
    // Run heuristics analysis
    const heuristicIssues = this.heuristics.analyze(normalizedTelemetry.telemetry);

    // Generate issues with code examples
    const issues = heuristicIssues.map(issue => ({
      type: issue.heuristic,
      severity: issue.severity,
      description: issue.message,
      suggestion: issue.suggestion,
      codeExample: this.generateCodeExample(issue.heuristic, normalizedTelemetry),
      affectedElements: issue.affectedElements
    }));

    // Extract metrics
    const metrics = {
      harmonyScore: normalizedTelemetry.metrics.harmonyIndex,
      contrastScore: normalizedTelemetry.metrics.contrastScore,
      hierarchyScore: normalizedTelemetry.metrics.hierarchyScore,
      spacingScore: normalizedTelemetry.metrics.spacingScore,
      overallScore: this.computeOverallScore(normalizedTelemetry.metrics)
    };

    // Generate summary
    const summary = this.generateSummary(normalizedTelemetry, issues);

    // Generate praise (Praise Mode!)
    const praise = this.generatePraise(normalizedTelemetry, issues);

    // Generate recommendations
    const recommendations = this.generateRecommendations(normalizedTelemetry, issues);

    return {
      summary,
      issues,
      metrics,
      praise,
      recommendations
    };
  }

  /**
   * Generate code fix example for specific heuristic
   */
  private generateCodeExample(heuristic: string, telemetry: any): string {
    // Use heuristics engine for base examples
    const baseExample = this.heuristics.generateCodeExample(heuristic);

    // Add context-specific examples based on actual telemetry data
    if (heuristic === 'low-contrast-text' && telemetry.telemetry.colors) {
      const lowContrastColors = telemetry.telemetry.colors.filter(
        (c: any) => c.contrast && c.contrast < 4.5
      );

      if (lowContrastColors.length > 0) {
        const example = lowContrastColors[0];
        return `${baseExample}

/* Specific issue detected: */
.${example.element} {
  /* Current: ${example.hex} with ${example.contrast?.toFixed(2)}:1 contrast */
  /* Recommended: Use #1a1a1a instead of ${example.hex} for 7:1 ratio */
}`;
      }
    }

    if (heuristic === 'type-hierarchy-flat' && telemetry.telemetry.typography) {
      const headings = telemetry.telemetry.typography.filter(
        (t: any) => /^h[1-6]$/.test(t.element)
      );

      if (headings.length > 0) {
        const sizes = headings.map((h: any) => `${h.element}: ${h.fontSize.toFixed(1)}px`).join(', ');
        return `${baseExample}

/* Current hierarchy detected: */
/* ${sizes} */

/* Recommended: Apply 1.25× scale ratio */`;
      }
    }

    return baseExample;
  }

  /**
   * Compute overall design score
   */
  private computeOverallScore(metrics: any): number {
    // Weighted average: harmony (40%), contrast (30%), hierarchy (15%), spacing (15%)
    const score =
      metrics.harmonyIndex * 0.4 +
      metrics.contrastScore * 0.3 +
      metrics.hierarchyScore * 0.15 +
      metrics.spacingScore * 0.15;

    return Math.round(score * 100) / 100;
  }

  /**
   * Generate summary based on regime and issues
   */
  private generateSummary(telemetry: any, issues: any[]): string {
    const regime = telemetry.asymmetrica.regime;
    const harmonyIndex = telemetry.metrics.harmonyIndex.toFixed(1);
    const colorCount = new Set(telemetry.telemetry.colors.map((c: any) => c.hex)).size;

    if (issues.length === 0) {
      return `✅ Excellent design harmony! Harmony Index: ${harmonyIndex}/100. ${colorCount} colors in palette. Currently in ${regime} regime.`;
    }

    const critical = issues.filter(i => i.severity === 'critical').length;
    const warnings = issues.filter(i => i.severity === 'warning').length;

    return `⚠️ Found ${critical} critical issues and ${warnings} warnings. Harmony Index: ${harmonyIndex}/100. Regime: ${regime}.`;
  }

  /**
   * Generate praise for good design decisions (Praise Mode!)
   */
  private generatePraise(telemetry: any, issues: any[]): string[] {
    const praise: string[] = [];

    // Praise for high harmony index
    if (telemetry.metrics.harmonyIndex >= 85) {
      praise.push('✅ Excellent harmony index! Your design follows golden ratio principles beautifully.');
    }

    // Praise for good contrast
    if (telemetry.metrics.contrastScore >= 90) {
      praise.push('✅ Outstanding contrast ratios! All text meets WCAG AAA standards.');
    } else if (telemetry.metrics.contrastScore >= 70) {
      praise.push('✅ Good contrast ratios! Most text meets WCAG AA standards.');
    }

    // Praise for proper hierarchy
    if (telemetry.metrics.hierarchyScore >= 80) {
      praise.push('✅ Excellent typography hierarchy! Clear visual distinction between heading levels.');
    }

    // Praise for grid-compliant spacing
    if (telemetry.metrics.spacingScore >= 80) {
      praise.push('✅ Perfect spacing consistency! Your layout follows a systematic grid.');
    }

    // Praise for no critical issues
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    if (criticalIssues.length === 0) {
      praise.push('✅ No critical accessibility issues detected! Great work on inclusive design.');
    }

    // Praise for reasonable color palette
    const colorCount = new Set(telemetry.telemetry.colors.map((c: any) => c.hex)).size;
    if (colorCount <= 10) {
      praise.push(`✅ Restrained color palette (${colorCount} colors)! Design system discipline at work.`);
    }

    // Praise for good breathability
    if (telemetry.metrics.breathabilityIndex >= 0.8) {
      praise.push('✅ Excellent breathability! Your layout has generous whitespace.');
    }

    return praise;
  }

  /**
   * Generate recommendations based on regime and issues
   */
  private generateRecommendations(telemetry: any, issues: any[]): string[] {
    const recs: string[] = [];
    const regime = telemetry.asymmetrica.regime;

    // Regime-based recommendations
    if (regime === 'exploration') {
      recs.push('Focus on fixing critical design issues before fine-tuning aesthetics');
      recs.push('Establish a baseline design system with color tokens and spacing scale');
    } else if (regime === 'optimization') {
      recs.push('Fine-tune color harmony and typography ratios');
      recs.push('Review spacing consistency across breakpoints');
    } else {
      recs.push('Maintain design quality through automated Design Sonar monitoring');
      recs.push('Document your design system for team consistency');
    }

    // Issue-specific recommendations
    if (issues.some(i => i.type === 'low-contrast-text')) {
      recs.push('Run WCAG contrast checker on all text elements');
      recs.push('Consider implementing a dark mode with proper contrast ratios');
    }

    if (issues.some(i => i.type === 'type-hierarchy-flat')) {
      recs.push('Adopt a modular scale for typography (recommended: 1.25× or 1.333× ratio)');
      recs.push('Use type-scale.com to generate harmonious font sizes');
    }

    if (issues.some(i => i.type === 'spacing-inconsistent')) {
      recs.push('Implement a spacing scale in your design tokens (4px, 8px, 16px, 24px, 32px)');
      recs.push('Use CSS custom properties for consistent spacing across components');
    }

    if (issues.some(i => i.type === 'palette-bloat')) {
      recs.push('Audit your color palette and consolidate similar shades');
      recs.push('Define semantic color tokens: primary, secondary, accent, neutral, success, warning, error');
    }

    if (issues.some(i => i.type === 'focus-state-missing')) {
      recs.push('Implement :focus-visible styles for all interactive elements');
      recs.push('Test keyboard navigation throughout your application');
    }

    // Always recommend baseline tracking
    if (issues.length > 0) {
      recs.push('Set up Design Sonar baselines to track improvements over time');
    }

    return recs;
  }

  /**
   * Generate visual color palette report (text-based)
   */
  generateColorPaletteReport(colors: any[]): string {
    const uniqueColors = new Map<string, any>();

    colors.forEach(c => {
      const hex = c.hex;
      if (!uniqueColors.has(hex)) {
        uniqueColors.set(hex, { ...c, count: 1 });
      } else {
        const existing = uniqueColors.get(hex)!;
        existing.count++;
      }
    });

    const colorArray = Array.from(uniqueColors.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // Top 20 colors

    let report = '## Color Palette\n\n';
    report += '| Color | Usage | Count |\n';
    report += '|-------|-------|-------|\n';

    colorArray.forEach(c => {
      report += `| ${c.hex} | ${c.usage} | ${c.count} |\n`;
    });

    return report;
  }
}

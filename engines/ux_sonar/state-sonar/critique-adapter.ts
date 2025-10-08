/**
 * State Sonar Critique Adapter
 * Provides actionable improvement suggestions for state machine architecture
 * Includes Praise Mode for clean state implementations
 */

import { StateHeuristicsEngine } from './heuristics';
import { StateNormalizer } from './normalizer';
import { StateTelemetry } from '../state-radar-engine';

interface CritiqueResult {
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  summary: string;
  praise: string[];
  issues: any[];
  improvements: string[];
  codeExamples: { [key: string]: string };
}

export class StateCritiqueAdapter {
  private heuristics: StateHeuristicsEngine;
  private normalizer: StateNormalizer;

  constructor() {
    this.heuristics = new StateHeuristicsEngine();
    this.normalizer = new StateNormalizer();
  }

  /**
   * Generate comprehensive critique of state machine architecture
   */
  critique(telemetry: StateTelemetry): CritiqueResult {
    // Analyze issues
    const issues = this.heuristics.analyze(telemetry);
    const praise = this.heuristics.generatePraise(telemetry);

    // Calculate metrics
    const normalized = this.normalizer.normalize({ telemetry }, '/');
    const explosionRisk = this.normalizer.calculateExplosionRisk(telemetry);

    // Compute score
    const score = this.computeScore(telemetry, issues, normalized.metrics);
    const grade = this.computeGrade(score);

    // Generate improvements
    const improvements = this.generateImprovements(issues, normalized.metrics, explosionRisk);

    // Generate code examples for each issue
    const codeExamples: { [key: string]: string } = {};
    issues.forEach(issue => {
      codeExamples[issue.heuristic] = this.heuristics.generateCodeExample(issue.heuristic);
    });

    // Generate summary
    const summary = this.generateSummary(telemetry, normalized.metrics, score, grade);

    return {
      score,
      grade,
      summary,
      praise,
      issues,
      improvements,
      codeExamples
    };
  }

  /**
   * Compute overall state architecture score (0-100)
   */
  private computeScore(telemetry: StateTelemetry, issues: any[], metrics: any): number {
    let score = 100;

    // Deduct points for issues
    issues.forEach(issue => {
      if (issue.severity === 'critical') {
        score -= 20;
      } else if (issue.severity === 'warning') {
        score -= 10;
      } else {
        score -= 5;
      }
    });

    // Deduct points for high SMT (unmanageable complexity)
    if (metrics.smt > 10) {
      score -= 30; // Severe penalty for unmanageable state
    } else if (metrics.smt > 8) {
      score -= 20;
    } else if (metrics.smt > 6) {
      score -= 10;
    }

    // Deduct points for low transition coverage
    if (metrics.transitionCoverage < 50) {
      score -= 20;
    } else if (metrics.transitionCoverage < 75) {
      score -= 10;
    }

    // Bonus points for good practices
    if (telemetry.impossibleStates.length === 0) {
      score += 5;
    }

    if (telemetry.raceConditions.length === 0) {
      score += 5;
    }

    if (metrics.transitionCoverage === 100) {
      score += 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Convert score to letter grade
   */
  private computeGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Generate summary of state architecture
   */
  private generateSummary(
    telemetry: StateTelemetry,
    metrics: any,
    score: number,
    grade: string
  ): string {
    const lines = [];

    lines.push(`State Machine Architecture: Grade ${grade} (${score}/100)`);
    lines.push('');
    lines.push(`Total State Machines: ${telemetry.stateMachines.length}`);
    lines.push(`Total States: ${metrics.totalStates}`);
    lines.push(`Total Transitions: ${metrics.totalTransitions}`);
    lines.push(`Parallel States: ${metrics.parallelStates}`);
    lines.push('');
    lines.push(`State Manageability Threshold (SMT): ${metrics.smt}`);
    lines.push(`Explosion Factor: ${metrics.explosionFactor.toFixed(2)}`);
    lines.push(`Transition Coverage: ${metrics.transitionCoverage}%`);
    lines.push('');

    if (metrics.smt > 10) {
      lines.push('⚠️  WARNING: SMT > 10 indicates unmanageable state complexity!');
    } else if (metrics.smt > 8) {
      lines.push('⚠️  CAUTION: SMT > 8 suggests high complexity, consider refactoring');
    } else if (metrics.smt < 5) {
      lines.push('✅ SMT is within manageable range');
    }

    lines.push('');
    lines.push(`Impossible States: ${metrics.impossibleStateCount}`);
    lines.push(`Race Conditions: ${metrics.raceConditionCount}`);
    lines.push('');
    lines.push(`Regime: ${telemetry.stateMachines.length > 0 ? 'State Machine Detected' : 'No State Machines'}`);

    return lines.join('\n');
  }

  /**
   * Generate improvement suggestions
   */
  private generateImprovements(issues: any[], metrics: any, explosionRisk: number): string[] {
    const improvements: string[] = [];

    // High-priority improvements
    if (metrics.smt > 10) {
      improvements.push(
        '🔴 CRITICAL: Reduce state complexity. SMT > 10 is unmanageable. Consider:'
      );
      improvements.push('   - Break down into smaller state machines');
      improvements.push('   - Use hierarchical states to reduce state count');
      improvements.push('   - Eliminate unnecessary parallel states');
    }

    if (metrics.impossibleStateCount > 0) {
      improvements.push(
        '🔴 CRITICAL: Fix impossible states. These indicate bugs in state machine logic.'
      );
      improvements.push('   - Review state machine definitions');
      improvements.push('   - Use XState visualizer to verify state graph');
      improvements.push('   - Add guards to prevent invalid transitions');
    }

    if (metrics.raceConditionCount > 0) {
      improvements.push(
        '🔴 CRITICAL: Resolve race conditions. Concurrent state mutations can cause bugs.'
      );
      improvements.push('   - Use XState\'s invoke/spawn for async operations');
      improvements.push('   - Implement proper state machine hierarchy');
      improvements.push('   - Add guards to prevent concurrent transitions');
    }

    // Medium-priority improvements
    if (metrics.transitionCoverage < 75) {
      improvements.push(
        '🟡 WARNING: Low transition coverage. Add event handlers for all states.'
      );
      improvements.push('   - Define transitions for all user intents');
      improvements.push('   - Use wildcard handlers for unhandled events');
      improvements.push('   - Mark terminal states explicitly');
    }

    if (explosionRisk > 60) {
      improvements.push(
        '🟡 WARNING: High state explosion risk. Consider refactoring to reduce complexity.'
      );
      improvements.push('   - Reduce number of parallel states');
      improvements.push('   - Use orthogonal regions sparingly');
      improvements.push('   - Simplify state graph structure');
    }

    // General improvements based on issues
    issues.forEach(issue => {
      if (!improvements.some(i => i.includes(issue.heuristic))) {
        improvements.push(`💡 ${issue.severity.toUpperCase()}: ${issue.suggestion}`);
      }
    });

    // Best practices
    if (improvements.length === 0) {
      improvements.push('✅ State architecture looks good! Consider these enhancements:');
      improvements.push('   - Add state machine visualizations to documentation');
      improvements.push('   - Implement state machine testing with @xstate/test');
      improvements.push('   - Monitor state transitions in production');
      improvements.push('   - Document state machine behavior and edge cases');
    }

    return improvements;
  }

  /**
   * Generate Praise Mode report
   */
  generatePraiseReport(telemetry: StateTelemetry): string {
    const praise = this.heuristics.generatePraise(telemetry);
    const normalized = this.normalizer.normalize({ telemetry }, '/');

    const lines = [];
    lines.push('🎉 STATE MACHINE PRAISE REPORT 🎉');
    lines.push('');

    if (praise.length > 0) {
      lines.push('Achievements:');
      praise.forEach(p => lines.push(`  ${p}`));
      lines.push('');
    }

    if (normalized.metrics.smt < 5) {
      lines.push('✅ Excellent state complexity management!');
      lines.push(`   SMT: ${normalized.metrics.smt} (well below threshold of 8)`);
      lines.push('');
    }

    if (normalized.metrics.transitionCoverage === 100) {
      lines.push('✅ Perfect transition coverage!');
      lines.push('   All states have proper event handlers');
      lines.push('');
    }

    if (telemetry.stateMachines.length > 0) {
      lines.push(`✅ Using ${telemetry.stateMachines.length} state machine(s)`);
      lines.push('   State machines prevent bugs and improve predictability');
      lines.push('');
    }

    if (praise.length === 0 && normalized.metrics.smt >= 5) {
      lines.push('Keep improving! Here are some goals:');
      lines.push('  - Reduce SMT below 5');
      lines.push('  - Achieve 100% transition coverage');
      lines.push('  - Eliminate all impossible states');
      lines.push('  - Resolve race conditions');
    }

    return lines.join('\n');
  }

  /**
   * Generate quick fix suggestions
   */
  generateQuickFixes(telemetry: StateTelemetry): string[] {
    const fixes: string[] = [];

    if (telemetry.impossibleStates.length > 0) {
      fixes.push('Quick Fix: Review state machine definitions and ensure all observed states are defined');
    }

    if (telemetry.raceConditions.length > 0) {
      fixes.push('Quick Fix: Add guards to prevent concurrent transitions from the same state');
    }

    const propDrillingCount = telemetry.propDrillingPaths.filter(p => p.depth > 3).length;
    if (propDrillingCount > 0) {
      fixes.push('Quick Fix: Extract deeply drilled state to React Context or state management library');
    }

    if (telemetry.stateMachines.length === 0 && telemetry.stateHooks.length > 5) {
      fixes.push('Quick Fix: Consider using XState for complex state management instead of multiple useState hooks');
    }

    return fixes;
  }
}

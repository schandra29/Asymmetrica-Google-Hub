/**
 * State Sonar Report Generator
 * Generates comprehensive reports with state machine diagrams (ASCII and DOT format)
 * Highlights missing transitions, race conditions, and state explosion analysis
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { StateTelemetry, StateMachineDefinition, StateTransition } from '../state-radar-engine';
import { StateCritiqueAdapter } from './critique-adapter';
import { StateNormalizer } from './normalizer';

export class StateReportGenerator {
  private critique: StateCritiqueAdapter;
  private normalizer: StateNormalizer;

  constructor() {
    this.critique = new StateCritiqueAdapter();
    this.normalizer = new StateNormalizer();
  }

  /**
   * Generate comprehensive state machine report
   */
  generateReport(telemetry: StateTelemetry, route: string): string {
    const critiqueResult = this.critique.critique(telemetry);
    const normalized = this.normalizer.normalize({ telemetry }, route);

    const sections = [];

    // Header
    sections.push(this.generateHeader(route, normalized.metrics));

    // Executive Summary
    sections.push(this.generateExecutiveSummary(critiqueResult));

    // State Machine Diagrams
    sections.push(this.generateStateMachineDiagrams(telemetry));

    // Metrics Section
    sections.push(this.generateMetricsSection(normalized.metrics));

    // Issues Section
    sections.push(this.generateIssuesSection(critiqueResult.issues));

    // Improvements Section
    sections.push(this.generateImprovementsSection(critiqueResult.improvements));

    // Code Examples Section
    sections.push(this.generateCodeExamplesSection(critiqueResult.codeExamples));

    // Praise Section
    if (critiqueResult.praise.length > 0) {
      sections.push(this.generatePraiseSection(critiqueResult.praise));
    }

    // State Explosion Analysis
    sections.push(this.generateExplosionAnalysis(telemetry, normalized.metrics));

    // Recommendations
    sections.push(this.generateRecommendations(telemetry, normalized.metrics, critiqueResult));

    return sections.join('\n\n' + '='.repeat(80) + '\n\n');
  }

  /**
   * Generate report header
   */
  private generateHeader(route: string, metrics: any): string {
    return `
╔════════════════════════════════════════════════════════════════════════════╗
║                     STATE SONAR ANALYSIS REPORT                            ║
╚════════════════════════════════════════════════════════════════════════════╝

Route: ${route}
Timestamp: ${new Date().toISOString()}
SMT (State Manageability Threshold): ${metrics.smt}
Regime: ${metrics.smt > 8 ? 'Exploration' : metrics.smt > 5 ? 'Optimization' : 'Stabilization'}
`.trim();
  }

  /**
   * Generate executive summary
   */
  private generateExecutiveSummary(critique: any): string {
    return `
## EXECUTIVE SUMMARY

${critique.summary}

Overall Grade: ${critique.grade} (Score: ${critique.score}/100)
`.trim();
  }

  /**
   * Generate state machine diagrams
   */
  private generateStateMachineDiagrams(telemetry: StateTelemetry): string {
    const sections = ['## STATE MACHINE DIAGRAMS'];

    if (telemetry.stateMachines.length === 0) {
      sections.push('\nNo state machines detected.');
      sections.push('\nConsider using XState or similar state machine library for complex state management.');
      return sections.join('\n');
    }

    telemetry.stateMachines.forEach((machine, index) => {
      sections.push(`\n### ${index + 1}. ${machine.name} (${machine.type})`);
      sections.push('');
      sections.push('**ASCII Diagram:**');
      sections.push('```');
      sections.push(this.generateASCIIDiagram(machine));
      sections.push('```');
      sections.push('');
      sections.push('**DOT Format (for Graphviz):**');
      sections.push('```dot');
      sections.push(this.generateDOTDiagram(machine));
      sections.push('```');
      sections.push('');
      sections.push(`**States:** ${machine.states.length}`);
      sections.push(`**Transitions:** ${machine.transitions.length}`);
      sections.push(`**Current State:** ${machine.currentState}`);
    });

    return sections.join('\n');
  }

  /**
   * Generate ASCII state machine diagram
   */
  private generateASCIIDiagram(machine: StateMachineDefinition): string {
    const lines: string[] = [];

    lines.push(`State Machine: ${machine.name}`);
    lines.push(`Initial State: ${machine.initialState}`);
    lines.push('');

    // Draw states
    machine.states.forEach(state => {
      const isCurrent = state === machine.currentState;
      const isInitial = state === machine.initialState;

      let stateSymbol = '[ ]';
      if (isCurrent && isInitial) {
        stateSymbol = '[*►]';
      } else if (isCurrent) {
        stateSymbol = '[►]';
      } else if (isInitial) {
        stateSymbol = '[*]';
      }

      lines.push(`  ${stateSymbol} ${state}`);

      // Show outgoing transitions
      const outgoing = machine.transitions.filter(t => t.from === state);
      outgoing.forEach(transition => {
        const isRed = this.isMissingTransition(transition);
        const arrow = isRed ? ' --[!]-->' : ' ------->';
        lines.push(`       ${arrow} ${transition.event} --> ${transition.to}`);
      });

      if (outgoing.length === 0) {
        const isTerminal = /success|error|complete|done|final/i.test(state);
        if (!isTerminal) {
          lines.push(`       --[!]--> [MISSING TRANSITIONS]`);
        }
      }

      lines.push('');
    });

    lines.push('Legend:');
    lines.push('  [*]   = Initial state');
    lines.push('  [►]   = Current state');
    lines.push('  [*►]  = Initial & current');
    lines.push('  [!]   = Missing or problematic transition');

    return lines.join('\n');
  }

  /**
   * Generate DOT diagram for Graphviz
   */
  private generateDOTDiagram(machine: StateMachineDefinition): string {
    const lines: string[] = [];

    lines.push(`digraph ${machine.name.replace(/\s+/g, '_')} {`);
    lines.push('  rankdir=LR;');
    lines.push('  node [shape=circle];');
    lines.push('');

    // Define initial state
    lines.push(`  ${this.escapeDOT(machine.initialState)} [style=filled, fillcolor=lightblue];`);

    // Define current state
    if (machine.currentState !== machine.initialState) {
      lines.push(`  ${this.escapeDOT(machine.currentState)} [style=filled, fillcolor=lightgreen];`);
    }

    // Define terminal states
    machine.states.forEach(state => {
      if (/success|error|complete|done|final/i.test(state)) {
        lines.push(`  ${this.escapeDOT(state)} [shape=doublecircle];`);
      }
    });

    lines.push('');

    // Define transitions
    machine.transitions.forEach(transition => {
      const color = this.isMissingTransition(transition) ? 'red' : 'black';
      lines.push(
        `  ${this.escapeDOT(transition.from)} -> ${this.escapeDOT(transition.to)} [label="${transition.event}", color=${color}];`
      );
    });

    lines.push('}');

    return lines.join('\n');
  }

  /**
   * Check if transition is missing or problematic
   */
  private isMissingTransition(transition: StateTransition): boolean {
    return transition.event.includes('missing') || transition.from === 'coverage-check';
  }

  /**
   * Escape DOT identifiers
   */
  private escapeDOT(str: string): string {
    return `"${str.replace(/"/g, '\\"')}"`;
  }

  /**
   * Generate metrics section
   */
  private generateMetricsSection(metrics: any): string {
    return `
## METRICS

| Metric                           | Value        | Status |
|----------------------------------|--------------|--------|
| SMT (Manageability Threshold)    | ${metrics.smt.toFixed(2)}        | ${metrics.smt > 10 ? '🔴 Critical' : metrics.smt > 8 ? '🟡 Warning' : '🟢 Good'} |
| Explosion Factor                 | ${metrics.explosionFactor.toFixed(2)}        | ${metrics.explosionFactor > 4 ? '🟡 High' : '🟢 Normal'} |
| Total States                     | ${metrics.totalStates}           | ${metrics.totalStates > 50 ? '🟡 Many' : '🟢 Normal'} |
| Total Transitions                | ${metrics.totalTransitions}      | ${metrics.totalTransitions > 100 ? '🟡 Many' : '🟢 Normal'} |
| Parallel States                  | ${metrics.parallelStates}        | ${metrics.parallelStates > 3 ? '🟡 High' : '🟢 Normal'} |
| Transition Coverage              | ${metrics.transitionCoverage}%           | ${metrics.transitionCoverage < 75 ? '🟡 Low' : metrics.transitionCoverage === 100 ? '🟢 Perfect' : '🟢 Good'} |
| Impossible States                | ${metrics.impossibleStateCount}           | ${metrics.impossibleStateCount > 0 ? '🔴 Issues' : '🟢 None'} |
| Race Conditions                  | ${metrics.raceConditionCount}           | ${metrics.raceConditionCount > 0 ? '🔴 Issues' : '🟢 None'} |

**SMT Threshold Guide:**
- SMT < 5: Simple, manageable state machine ✅
- SMT 5-8: Moderate complexity, watch for growth ⚠️
- SMT 8-10: High complexity, consider refactoring 🟡
- SMT > 10: Unmanageable, urgent refactoring needed 🔴
`.trim();
  }

  /**
   * Generate issues section
   */
  private generateIssuesSection(issues: any[]): string {
    if (issues.length === 0) {
      return '## ISSUES\n\n✅ No issues detected! State machine architecture looks clean.';
    }

    const lines = ['## ISSUES'];
    lines.push('');

    issues.forEach((issue, index) => {
      const icon = issue.severity === 'critical' ? '🔴' : issue.severity === 'warning' ? '🟡' : '🔵';
      lines.push(`### ${index + 1}. ${icon} ${issue.heuristic.toUpperCase()}`);
      lines.push('');
      lines.push(`**Severity:** ${issue.severity}`);
      lines.push(`**Message:** ${issue.message}`);
      lines.push(`**Suggestion:** ${issue.suggestion}`);

      if (issue.affectedElements && issue.affectedElements.length > 0) {
        lines.push('');
        lines.push('**Affected Elements:**');
        issue.affectedElements.slice(0, 10).forEach((elem: string) => {
          lines.push(`  - ${elem}`);
        });
        if (issue.affectedElements.length > 10) {
          lines.push(`  - ... and ${issue.affectedElements.length - 10} more`);
        }
      }

      lines.push('');
    });

    return lines.join('\n');
  }

  /**
   * Generate improvements section
   */
  private generateImprovementsSection(improvements: string[]): string {
    const lines = ['## RECOMMENDED IMPROVEMENTS'];
    lines.push('');

    improvements.forEach((improvement, index) => {
      lines.push(`${index + 1}. ${improvement}`);
    });

    return lines.join('\n');
  }

  /**
   * Generate code examples section
   */
  private generateCodeExamplesSection(codeExamples: { [key: string]: string }): string {
    if (Object.keys(codeExamples).length === 0) {
      return '';
    }

    const lines = ['## CODE EXAMPLES'];
    lines.push('');

    Object.entries(codeExamples).forEach(([heuristic, example]) => {
      lines.push(`### ${heuristic.toUpperCase()}`);
      lines.push('');
      lines.push('```typescript');
      lines.push(example);
      lines.push('```');
      lines.push('');
    });

    return lines.join('\n');
  }

  /**
   * Generate praise section
   */
  private generatePraiseSection(praise: string[]): string {
    const lines = ['## PRAISE MODE 🎉'];
    lines.push('');

    praise.forEach(p => {
      lines.push(p);
    });

    return lines.join('\n');
  }

  /**
   * Generate state explosion analysis
   */
  private generateExplosionAnalysis(telemetry: StateTelemetry, metrics: any): string {
    const explosionRisk = this.normalizer.calculateExplosionRisk(telemetry);

    const lines = ['## STATE EXPLOSION ANALYSIS'];
    lines.push('');
    lines.push(`**Explosion Risk:** ${explosionRisk}%`);
    lines.push('');

    if (explosionRisk > 80) {
      lines.push('🔴 **CRITICAL RISK:** State explosion is imminent!');
      lines.push('   - Current state count: ' + metrics.totalStates);
      lines.push('   - Parallel states: ' + metrics.parallelStates);
      lines.push('   - Explosion factor: ' + metrics.explosionFactor.toFixed(2));
      lines.push('');
      lines.push('**Immediate Actions:**');
      lines.push('   1. Reduce parallel states (each adds factorial complexity)');
      lines.push('   2. Use hierarchical states to group related states');
      lines.push('   3. Split into multiple smaller state machines');
    } else if (explosionRisk > 60) {
      lines.push('🟡 **WARNING:** Moderate risk of state explosion');
      lines.push('   - Monitor state growth carefully');
      lines.push('   - Consider refactoring before adding more states');
    } else {
      lines.push('✅ **LOW RISK:** State complexity is well-managed');
      lines.push('   - Current architecture is sustainable');
    }

    lines.push('');
    lines.push('**State Explosion Growth Rate:**');
    lines.push(`   - Current: O(${this.estimateGrowthRate(metrics.parallelStates)})`);
    lines.push(`   - Adding 1 parallel state: O(${this.estimateGrowthRate(metrics.parallelStates + 1)})`);

    return lines.join('\n');
  }

  /**
   * Estimate growth rate based on parallel states
   */
  private estimateGrowthRate(parallelStates: number): string {
    if (parallelStates <= 1) return 'n';
    if (parallelStates === 2) return '2n';
    if (parallelStates === 3) return 'n³';
    return `2^${parallelStates}`;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    telemetry: StateTelemetry,
    metrics: any,
    critique: any
  ): string {
    const lines = ['## FINAL RECOMMENDATIONS'];
    lines.push('');

    if (critique.grade === 'A') {
      lines.push('🏆 **Excellent state machine architecture!**');
      lines.push('');
      lines.push('Keep it up:');
      lines.push('  - Continue using XState or similar state machine libraries');
      lines.push('  - Document state machine behavior');
      lines.push('  - Add visual state diagrams to your docs');
      lines.push('  - Implement state machine testing');
    } else if (critique.grade === 'B') {
      lines.push('👍 **Good state machine architecture with room for improvement**');
      lines.push('');
      lines.push('Focus on:');
      lines.push('  - Addressing remaining warnings');
      lines.push('  - Improving transition coverage');
      lines.push('  - Documenting state flows');
    } else {
      lines.push('⚠️  **State machine architecture needs attention**');
      lines.push('');
      lines.push('Priority actions:');
      lines.push('  1. Fix critical issues (impossible states, race conditions)');
      lines.push('  2. Reduce state complexity (SMT < 8)');
      lines.push('  3. Improve transition coverage (aim for 100%)');
      lines.push('  4. Consider migrating to XState for better state management');
    }

    lines.push('');
    lines.push('**Resources:**');
    lines.push('  - XState Docs: https://xstate.js.org/docs/');
    lines.push('  - State Machine Testing: https://xstate.js.org/docs/packages/xstate-test/');
    lines.push('  - XState Visualizer: https://stately.ai/viz');

    return lines.join('\n');
  }

  /**
   * Save report to file
   */
  saveReport(report: string, route: string) {
    const reportDir = join(process.cwd(), 'tests/ux-sonar/reports');

    try {
      mkdirSync(reportDir, { recursive: true });
    } catch (e) {
      // Directory might already exist
    }

    const filename = route.replace(/\//g, '_') || 'root';
    const filepath = join(reportDir, `state_${filename}.md`);

    writeFileSync(filepath, report);
    console.log(`[State Report] Report saved: ${filepath}`);

    return filepath;
  }
}

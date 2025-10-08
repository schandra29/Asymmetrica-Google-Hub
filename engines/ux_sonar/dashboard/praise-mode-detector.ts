/**
 * PraiseModeDetector - Detects positive signals across all sonars
 * Celebrates wins and improvements!
 * Agent Foxtrot - Dashboard Architect
 */

import { PraiseSignal } from '../dashboard-generator';
import { SonarReportMap } from './report-aggregator';

export interface PraiseRule {
  sonar: string;
  condition: (data: any) => boolean;
  message: (data: any) => string;
  metric?: (data: any) => string;
  icon: string;
  priority: number; // Higher = more important
}

export class PraiseModeDetector {
  private rules: PraiseRule[] = [];

  constructor() {
    this.initializeRules();
  }

  /**
   * Initialize all praise detection rules
   */
  private initializeRules() {
    // UX Sonar Praise Rules
    this.rules.push({
      sonar: 'UX',
      condition: (uxReport) => {
        const fps = uxReport?.telemetry?.layers?.frontend?.metrics?.fps || 0;
        return fps >= 58;
      },
      message: () => 'Excellent frame rate! Smooth animations detected.',
      metric: (uxReport) => `${uxReport.telemetry.layers.frontend.metrics.fps.toFixed(0)} FPS`,
      icon: '✅',
      priority: 10
    });

    this.rules.push({
      sonar: 'UX',
      condition: (uxReport) => {
        const cls = uxReport?.telemetry?.layers?.frontend?.metrics?.cls || 1;
        return cls < 0.05;
      },
      message: () => 'Minimal layout shift - stable visual experience!',
      metric: (uxReport) => `CLS: ${uxReport.telemetry.layers.frontend.metrics.cls.toFixed(3)}`,
      icon: '✅',
      priority: 9
    });

    this.rules.push({
      sonar: 'UX',
      condition: (uxReport) => {
        const longTasks = uxReport?.telemetry?.layers?.frontend?.metrics?.longTasks || 1000;
        return longTasks < 50;
      },
      message: () => 'No blocking long tasks - responsive UI!',
      metric: (uxReport) => `${uxReport.telemetry.layers.frontend.metrics.longTasks}ms`,
      icon: '⚡',
      priority: 8
    });

    this.rules.push({
      sonar: 'UX',
      condition: (uxReport) => {
        const score = uxReport?.critique?.metrics?.overallScore || 0;
        return score >= 90;
      },
      message: () => 'Outstanding UX score - top-tier user experience!',
      metric: (uxReport) => `${uxReport.critique.metrics.overallScore}/100`,
      icon: '🏆',
      priority: 10
    });

    // Design Sonar Praise Rules (from GPT-5 spec)
    this.rules.push({
      sonar: 'Design',
      condition: (designReport) => {
        const harmony = designReport?.metrics?.paletteHarmony || 0;
        return harmony >= 0.85;
      },
      message: () => 'Excellent color harmony! LCH hue spacing perfectly balanced.',
      metric: (designReport) => `Harmony: ${designReport.metrics.paletteHarmony.toFixed(2)}`,
      icon: '🎨',
      priority: 9
    });

    this.rules.push({
      sonar: 'Design',
      condition: (designReport) => {
        const typeScale = designReport?.metrics?.typeScale || 0;
        return typeScale >= 0.95;
      },
      message: () => 'Typography scale consistent across 95%+ of instances!',
      metric: (designReport) => `Scale: ${(designReport.metrics.typeScale * 100).toFixed(0)}%`,
      icon: '✅',
      priority: 8
    });

    this.rules.push({
      sonar: 'Design',
      condition: (designReport) => {
        const accessibility = designReport?.metrics?.accessibility || 0;
        return accessibility >= 0.90;
      },
      message: () => 'Excellent accessibility compliance - inclusive design!',
      metric: (designReport) => `A11y: ${(designReport.metrics.accessibility * 100).toFixed(0)}%`,
      icon: '♿',
      priority: 9
    });

    // Journey Sonar Praise Rules
    this.rules.push({
      sonar: 'Journey',
      condition: (journeyReport) => {
        const flowScore = journeyReport?.metrics?.flowScore || 0;
        return flowScore >= 0.80;
      },
      message: () => 'Smooth path ratio improved - users completing tasks efficiently!',
      metric: (journeyReport) => `Flow: ${journeyReport.metrics.flowScore.toFixed(2)}`,
      icon: '🎯',
      priority: 8
    });

    this.rules.push({
      sonar: 'Journey',
      condition: (journeyReport) => {
        const timeToWow = journeyReport?.metrics?.timeToWow || 10000;
        return timeToWow < 3000; // Less than 3 seconds
      },
      message: () => 'Time-to-wow decreased! Faster path to first value.',
      metric: (journeyReport) => `TTW: ${(journeyReport.metrics.timeToWow / 1000).toFixed(1)}s`,
      icon: '⚡',
      priority: 9
    });

    this.rules.push({
      sonar: 'Journey',
      condition: (journeyReport) => {
        const errorRate = journeyReport?.metrics?.errorRate || 1;
        return errorRate < 0.05;
      },
      message: () => 'Near-zero error rate - smooth user journeys!',
      metric: (journeyReport) => `Errors: ${(journeyReport.metrics.errorRate * 100).toFixed(1)}%`,
      icon: '✅',
      priority: 8
    });

    // State Sonar Praise Rules
    this.rules.push({
      sonar: 'State',
      condition: (stateReport) => {
        const impossibleStates = stateReport?.metrics?.impossibleStates || 1;
        return impossibleStates === 0;
      },
      message: () => 'Zero impossible states detected - clean architecture!',
      metric: () => 'Impossible states: 0',
      icon: '🏗️',
      priority: 10
    });

    this.rules.push({
      sonar: 'State',
      condition: (stateReport) => {
        const transitionCoverage = stateReport?.metrics?.transitionCoverage || 0;
        return transitionCoverage >= 0.95;
      },
      message: () => 'Transition coverage 95%+ - comprehensive state machine!',
      metric: (stateReport) => `Coverage: ${(stateReport.metrics.transitionCoverage * 100).toFixed(0)}%`,
      icon: '✅',
      priority: 8
    });

    this.rules.push({
      sonar: 'State',
      condition: (stateReport) => {
        const smt = stateReport?.metrics?.smt || 100;
        return smt < 10; // State mutation time < 10ms
      },
      message: () => 'Lightning-fast state mutations - excellent performance!',
      metric: (stateReport) => `SMT: ${stateReport.metrics.smt.toFixed(1)}ms`,
      icon: '⚡',
      priority: 9
    });

    // Code Sonar Praise Rules
    this.rules.push({
      sonar: 'Code',
      condition: (codeReport) => {
        const complexity = codeReport?.metrics?.complexity || 100;
        const baseline = codeReport?.baseline?.complexity || complexity + 10;
        return complexity < baseline;
      },
      message: (codeReport) => {
        const reduction = ((codeReport.baseline.complexity - codeReport.metrics.complexity) / codeReport.baseline.complexity * 100).toFixed(0);
        return `Complexity reduced by ${reduction}% - cleaner code!`;
      },
      metric: (codeReport) => `Complexity: ${codeReport.metrics.complexity}`,
      icon: '📉',
      priority: 8
    });

    this.rules.push({
      sonar: 'Code',
      condition: (codeReport) => {
        const bundleSize = codeReport?.metrics?.bundleSize || 1000000;
        return bundleSize < 200000; // Less than 200KB
      },
      message: () => 'Bundle size optimized - fast load times!',
      metric: (codeReport) => `Bundle: ${(codeReport.metrics.bundleSize / 1024).toFixed(0)}KB`,
      icon: '📦',
      priority: 9
    });

    this.rules.push({
      sonar: 'Code',
      condition: (codeReport) => {
        const cycles = codeReport?.metrics?.circularDependencies || 1;
        return cycles === 0;
      },
      message: () => 'Zero circular dependencies - clean module architecture!',
      metric: () => 'Cycles: 0',
      icon: '🔄',
      priority: 10
    });

    this.rules.push({
      sonar: 'Code',
      condition: (codeReport) => {
        const density = codeReport?.metrics?.density || 1;
        return density < 0.05;
      },
      message: () => 'Low code density - excellent separation of concerns!',
      metric: (codeReport) => `Density: ${codeReport.metrics.density.toFixed(3)}`,
      icon: '✅',
      priority: 7
    });

    // Semantic Sonar Praise Rules
    this.rules.push({
      sonar: 'Semantic',
      condition: (semanticReport) => {
        const aqs = semanticReport?.metrics?.aqs || 0; // Accessibility Quality Score
        return aqs >= 0.80;
      },
      message: () => 'High semantic quality - meaningful HTML structure!',
      metric: (semanticReport) => `AQS: ${semanticReport.metrics.aqs.toFixed(2)}`,
      icon: '📝',
      priority: 8
    });

    this.rules.push({
      sonar: 'Semantic',
      condition: (semanticReport) => {
        const headingHierarchy = semanticReport?.metrics?.headingHierarchy || 0;
        return headingHierarchy >= 0.95;
      },
      message: () => 'Perfect heading hierarchy - excellent content structure!',
      metric: (semanticReport) => `Hierarchy: ${(semanticReport.metrics.headingHierarchy * 100).toFixed(0)}%`,
      icon: '📋',
      priority: 7
    });

    this.rules.push({
      sonar: 'Semantic',
      condition: (semanticReport) => {
        const ariaCompliance = semanticReport?.metrics?.ariaCompliance || 0;
        return ariaCompliance >= 0.90;
      },
      message: () => 'Excellent ARIA compliance - screen reader friendly!',
      metric: (semanticReport) => `ARIA: ${(semanticReport.metrics.ariaCompliance * 100).toFixed(0)}%`,
      icon: '♿',
      priority: 9
    });
  }

  /**
   * Detect all praise signals from reports
   */
  detectPraiseSignals(reports: SonarReportMap): PraiseSignal[] {
    const signals: PraiseSignal[] = [];

    // Evaluate each rule
    this.rules.forEach(rule => {
      try {
        let data: any = null;

        // Get the appropriate report data
        switch (rule.sonar) {
          case 'UX':
            data = reports.ux && reports.ux.length > 0 ? reports.ux[reports.ux.length - 1] : null;
            break;
          case 'Design':
            data = reports.design || null;
            break;
          case 'Code':
            data = reports.code || null;
            break;
          case 'Semantic':
            data = reports.semantic || null;
            break;
          case 'Journey':
            data = reports.journey || null;
            break;
          case 'State':
            data = reports.state || null;
            break;
        }

        // Check if condition is met
        if (data && rule.condition(data)) {
          signals.push({
            sonar: rule.sonar,
            message: rule.message(data),
            icon: rule.icon,
            metric: rule.metric ? rule.metric(data) : undefined
          });
        }
      } catch (error) {
        // Silently skip rules that fail (data might not be available yet)
        console.debug(`Praise rule check failed for ${rule.sonar}:`, error);
      }
    });

    // Sort by priority and return top signals
    signals.sort((a, b) => {
      const ruleA = this.rules.find(r => r.sonar === a.sonar && r.message({}) === a.message) || { priority: 0 };
      const ruleB = this.rules.find(r => r.sonar === b.sonar && r.message({}) === b.message) || { priority: 0 };
      return ruleB.priority - ruleA.priority;
    });

    return signals;
  }

  /**
   * Detect specific praise signals for a single sonar
   */
  detectForSonar(sonarName: string, data: any): PraiseSignal[] {
    const signals: PraiseSignal[] = [];

    this.rules
      .filter(rule => rule.sonar === sonarName)
      .forEach(rule => {
        try {
          if (rule.condition(data)) {
            signals.push({
              sonar: rule.sonar,
              message: rule.message(data),
              icon: rule.icon,
              metric: rule.metric ? rule.metric(data) : undefined
            });
          }
        } catch (error) {
          // Skip failed checks
        }
      });

    return signals;
  }

  /**
   * Get top N praise signals
   */
  getTopSignals(reports: SonarReportMap, count: number = 3): PraiseSignal[] {
    const allSignals = this.detectPraiseSignals(reports);
    return allSignals.slice(0, count);
  }

  /**
   * Generate celebration message based on signal count
   */
  generateCelebrationMessage(signalCount: number): string {
    if (signalCount === 0) {
      return 'Keep optimizing! Praise signals will appear as metrics improve.';
    } else if (signalCount === 1) {
      return '🎉 Great job! One area of excellence detected.';
    } else if (signalCount <= 3) {
      return `🎉 Excellent work! ${signalCount} areas of excellence detected.`;
    } else if (signalCount <= 6) {
      return `🏆 Outstanding! ${signalCount} areas of excellence across multiple sonars!`;
    } else {
      return `🚀 Incredible! ${signalCount} areas of excellence - you're crushing it!`;
    }
  }

  /**
   * Check if specific achievement unlocked
   */
  checkAchievement(reports: SonarReportMap, achievement: string): boolean {
    const achievements = {
      'perfect-ux': () => {
        const uxReport = reports.ux?.[reports.ux.length - 1];
        return (uxReport?.critique?.metrics?.overallScore || 0) === 100;
      },
      'zero-impossible-states': () => {
        return reports.state?.metrics?.impossibleStates === 0;
      },
      'a11y-champion': () => {
        const designA11y = reports.design?.metrics?.accessibility || 0;
        const semanticA11y = reports.semantic?.metrics?.ariaCompliance || 0;
        return designA11y >= 0.95 && semanticA11y >= 0.95;
      },
      'performance-master': () => {
        const uxReport = reports.ux?.[reports.ux.length - 1];
        const fps = uxReport?.telemetry?.layers?.frontend?.metrics?.fps || 0;
        const cls = uxReport?.telemetry?.layers?.frontend?.metrics?.cls || 1;
        return fps >= 60 && cls < 0.05;
      },
      'clean-code': () => {
        return reports.code?.metrics?.circularDependencies === 0 &&
               reports.code?.metrics?.density < 0.05;
      }
    };

    const checker = achievements[achievement as keyof typeof achievements];
    return checker ? checker() : false;
  }
}

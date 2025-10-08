/**
 * Journey Sonar Normalizer
 * Computes Frustration Score and determines user experience regime
 *
 * Based on Grok's formula:
 * Frustration Score (FS) = (hesitationTime/taskDuration) × rageClickDensity + backtrackRatio
 *
 * Research backing:
 * - Hesitation correlates r=0.65 with drop-offs (ACM 2023)
 * - Rage clicks predict 67% of abandons (UX Tigers 2023)
 */

import { writeFileSync, readFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface NormalizedJourneyTelemetry {
  id: string;
  timestamp: number;
  route: string;
  telemetry: any;
  metrics: {
    frustrationScore: number;
    hesitationRatio: number;
    rageClickDensity: number;
    backtrackRatio: number;
    errorLoopScore: number;
    taskSuccessRate: number;
    avgTaskDuration: number;
    delightScore: number;
  };
  asymmetrica: {
    regime: 'exploration' | 'optimization' | 'stabilization';
    complexity: string;
  };
  delight: {
    smoothPathRatio: number;
    timeToWow: number;
    frustrationLevel: 'none' | 'low' | 'medium' | 'high';
  };
}

export class JourneyNormalizer {

  normalize(rawTelemetry: any, route: string = '/'): NormalizedJourneyTelemetry {
    const frustrationScore = this.computeFrustrationScore(rawTelemetry.telemetry, rawTelemetry.duration);
    const hesitationRatio = this.computeHesitationRatio(rawTelemetry.telemetry, rawTelemetry.duration);
    const rageClickDensity = this.computeRageClickDensity(rawTelemetry.telemetry, rawTelemetry.duration);
    const backtrackRatio = this.computeBacktrackRatio(rawTelemetry.telemetry);
    const errorLoopScore = this.computeErrorLoopScore(rawTelemetry.telemetry);
    const delightScore = this.computeDelightScore(rawTelemetry.telemetry);

    const taskSuccessRate = rawTelemetry.metrics?.taskSuccessRate || 0;
    const avgTaskDuration = rawTelemetry.metrics?.avgTaskDuration || 0;

    const regime = this.determineRegime(frustrationScore, hesitationRatio, backtrackRatio);

    const smoothPathRatio = this.computeSmoothPathRatio(rawTelemetry.telemetry);
    const timeToWow = this.computeTimeToWow(rawTelemetry.telemetry);
    const frustrationLevel = this.determineFrustrationLevel(frustrationScore);

    return {
      id: `journey-telemetry-${Date.now()}`,
      timestamp: Date.now(),
      route,
      telemetry: rawTelemetry.telemetry,
      metrics: {
        frustrationScore,
        hesitationRatio,
        rageClickDensity,
        backtrackRatio,
        errorLoopScore,
        taskSuccessRate,
        avgTaskDuration,
        delightScore
      },
      asymmetrica: {
        regime,
        complexity: this.assessComplexity(rawTelemetry.telemetry)
      },
      delight: {
        smoothPathRatio,
        timeToWow,
        frustrationLevel
      }
    };
  }

  /**
   * Compute Frustration Score using Grok's formula:
   * FS = (hesitationTime/taskDuration) × rageClickDensity + backtrackRatio
   *
   * Returns: 0-1 scale (0 = no frustration, 1 = maximum frustration)
   */
  private computeFrustrationScore(telemetry: any, taskDuration: number): number {
    const hesitationRatio = this.computeHesitationRatio(telemetry, taskDuration);
    const rageClickDensity = this.computeRageClickDensity(telemetry, taskDuration);
    const backtrackRatio = this.computeBacktrackRatio(telemetry);

    // Grok's formula
    const frustrationScore = (hesitationRatio * rageClickDensity) + backtrackRatio;

    // Normalize to 0-1 scale (cap at 1.0)
    return Math.min(1.0, frustrationScore);
  }

  /**
   * Compute hesitation ratio: totalHesitationTime / taskDuration
   */
  private computeHesitationRatio(telemetry: any, taskDuration: number): number {
    const hesitationEvents = telemetry.hesitationEvents || [];

    if (hesitationEvents.length === 0 || taskDuration === 0) return 0;

    const totalHesitationTime = hesitationEvents.reduce(
      (sum: number, e: any) => sum + e.duration,
      0
    );

    return Math.min(1.0, totalHesitationTime / taskDuration);
  }

  /**
   * Compute rage click density: rageClickCount / (taskDuration in seconds)
   */
  private computeRageClickDensity(telemetry: any, taskDuration: number): number {
    const rageClickEvents = telemetry.rageClickEvents || [];

    if (rageClickEvents.length === 0 || taskDuration === 0) return 0;

    const totalRageClicks = rageClickEvents.reduce(
      (sum: number, e: any) => sum + e.clickCount,
      0
    );

    const taskDurationSeconds = taskDuration / 1000;
    const density = totalRageClicks / taskDurationSeconds;

    // Normalize: 5+ rage clicks per second = maximum density (1.0)
    return Math.min(1.0, density / 5);
  }

  /**
   * Compute backtrack ratio: backtrackCount / totalNavigations
   */
  private computeBacktrackRatio(telemetry: any): number {
    const navigationEvents = telemetry.navigationEvents || [];

    if (navigationEvents.length === 0) return 0;

    const backtrackLoops = navigationEvents.filter(
      (e: any) => e.action === 'backtrack-loop'
    ).length;

    return Math.min(1.0, backtrackLoops / navigationEvents.length);
  }

  /**
   * Compute error loop score: errorCount / maxExpectedErrors (3)
   */
  private computeErrorLoopScore(telemetry: any): number {
    const errorEvents = telemetry.errorEvents || [];

    if (errorEvents.length === 0) return 0;

    const totalErrors = errorEvents.reduce((sum: number, e: any) => sum + e.count, 0);

    // Normalize: 3+ errors = maximum score (1.0)
    return Math.min(1.0, totalErrors / 3);
  }

  /**
   * Compute delight score: inverse of frustration + success bonus
   */
  private computeDelightScore(telemetry: any): number {
    const taskCompletions = telemetry.taskCompletions || [];

    if (taskCompletions.length === 0) return 0.5;

    const successRate = taskCompletions.filter((t: any) => t.success).length / taskCompletions.length;
    const fastCompletions = taskCompletions.filter((t: any) => t.duration < 3000).length;
    const fastCompletionRate = fastCompletions / taskCompletions.length;

    const rageClickEvents = telemetry.rageClickEvents || [];
    const noRageBonus = rageClickEvents.length === 0 ? 0.2 : 0;

    const delightScore = (successRate * 0.5) + (fastCompletionRate * 0.3) + noRageBonus;

    return Math.min(1.0, delightScore);
  }

  /**
   * Compute smooth path ratio: % tasks completed without errors/frustration
   */
  private computeSmoothPathRatio(telemetry: any): number {
    const taskCompletions = telemetry.taskCompletions || [];

    if (taskCompletions.length === 0) return 0;

    const smoothTasks = taskCompletions.filter(
      (t: any) => t.success && t.errorCount === 0
    );

    return (smoothTasks.length / taskCompletions.length) * 100;
  }

  /**
   * Compute time-to-wow: Average time to first successful task
   */
  private computeTimeToWow(telemetry: any): number {
    const taskCompletions = telemetry.taskCompletions || [];
    const successfulTasks = taskCompletions.filter((t: any) => t.success);

    if (successfulTasks.length === 0) return 0;

    // Find first successful task
    const firstSuccess = successfulTasks[0];
    return firstSuccess.duration;
  }

  /**
   * Determine frustration level based on Frustration Score
   */
  private determineFrustrationLevel(frustrationScore: number): 'none' | 'low' | 'medium' | 'high' {
    if (frustrationScore < 0.1) return 'none';
    if (frustrationScore < 0.3) return 'low';
    if (frustrationScore < 0.6) return 'medium';
    return 'high';
  }

  /**
   * Determine regime based on frustration metrics
   *
   * Grok's guidance:
   * - Exploration: FS > 0.15 OR hesitation > 0.2
   * - Optimization: backtrack > 0.1
   * - Stabilization: otherwise
   */
  private determineRegime(
    frustrationScore: number,
    hesitationRatio: number,
    backtrackRatio: number
  ): 'exploration' | 'optimization' | 'stabilization' {
    // Exploration: High frustration or confusion
    if (frustrationScore > 0.15 || hesitationRatio > 0.2) {
      return 'exploration';
    }

    // Optimization: Significant backtracking
    if (backtrackRatio > 0.1) {
      return 'optimization';
    }

    // Stabilization: Smooth experience
    return 'stabilization';
  }

  /**
   * Assess complexity based on user behavior patterns
   */
  private assessComplexity(telemetry: any): string {
    const hesitationEvents = telemetry.hesitationEvents || [];
    const navigationEvents = telemetry.navigationEvents || [];
    const totalEvents = hesitationEvents.length + navigationEvents.length;

    if (totalEvents > 50) {
      return 'O(n²)'; // Complex, many decision points
    } else if (totalEvents > 20) {
      return 'O(n log n)'; // Moderate complexity
    } else {
      return 'O(n)'; // Simple, linear flow
    }
  }

  /**
   * Save baseline for future comparisons
   */
  saveBaseline(normalized: NormalizedJourneyTelemetry, route: string) {
    const baselineDir = join(process.cwd(), 'tests/ux-sonar/baselines');

    try {
      mkdirSync(baselineDir, { recursive: true });
    } catch (e) {
      // Directory might already exist
    }

    const filename = route.replace(/\//g, '_') || 'root';
    const filepath = join(baselineDir, `journey_${filename}.json`);

    writeFileSync(filepath, JSON.stringify(normalized, null, 2));
    console.log(`[Journey Normalizer] Baseline saved: ${filepath}`);
  }

  /**
   * Load baseline for comparison
   */
  loadBaseline(route: string): NormalizedJourneyTelemetry | null {
    const baselineDir = join(process.cwd(), 'tests/ux-sonar/baselines');
    const filename = route.replace(/\//g, '_') || 'root';
    const filepath = join(baselineDir, `journey_${filename}.json`);

    try {
      const data = JSON.parse(readFileSync(filepath, 'utf-8'));
      console.log(`[Journey Normalizer] Baseline loaded: ${filepath}`);
      return data;
    } catch (e) {
      console.log(`[Journey Normalizer] No baseline found for ${route}`);
      return null;
    }
  }

  /**
   * Compare baselines to detect UX improvements/regressions
   */
  compareBaselines(current: NormalizedJourneyTelemetry, baseline: NormalizedJourneyTelemetry) {
    const frustrationDelta = current.metrics.frustrationScore - baseline.metrics.frustrationScore;
    const delightDelta = current.metrics.delightScore - baseline.metrics.delightScore;
    const successRateDelta = current.metrics.taskSuccessRate - baseline.metrics.taskSuccessRate;
    const speedDelta = baseline.metrics.avgTaskDuration - current.metrics.avgTaskDuration; // Positive = faster

    // Determine if UX improved or regressed
    const improved = frustrationDelta < -0.1 || delightDelta > 0.1 || successRateDelta > 10;
    const regressed = frustrationDelta > 0.1 || delightDelta < -0.1 || successRateDelta < -10;

    return {
      frustrationDelta,
      delightDelta,
      successRateDelta,
      speedDelta,
      hesitationDelta: current.metrics.hesitationRatio - baseline.metrics.hesitationRatio,
      rageClickDelta: current.metrics.rageClickDensity - baseline.metrics.rageClickDensity,
      backtrackDelta: current.metrics.backtrackRatio - baseline.metrics.backtrackRatio,
      regimeChange: current.asymmetrica.regime !== baseline.asymmetrica.regime,
      verdict: improved ? 'improved' : regressed ? 'regressed' : 'stable'
    };
  }

  /**
   * Generate improvement recommendations
   */
  generateRecommendations(normalized: NormalizedJourneyTelemetry): string[] {
    const recommendations: string[] = [];
    const { metrics, delight } = normalized;

    // High frustration
    if (metrics.frustrationScore > 0.3) {
      recommendations.push('🚨 High frustration detected. Prioritize UX improvements immediately.');
    }

    // Excessive hesitation
    if (metrics.hesitationRatio > 0.2) {
      recommendations.push('⏱️ Users are hesitating frequently. Add clearer labels, tooltips, or onboarding.');
    }

    // Rage clicks
    if (metrics.rageClickDensity > 0.3) {
      recommendations.push('😡 Rage clicks detected. Add loading states and improve responsiveness.');
    }

    // Backtracking
    if (metrics.backtrackRatio > 0.2) {
      recommendations.push('🔄 Users are backtracking often. Improve navigation and add breadcrumbs.');
    }

    // Error loops
    if (metrics.errorLoopScore > 0.5) {
      recommendations.push('❌ Error loops detected. Add clear recovery paths and inline validation.');
    }

    // Low success rate
    if (metrics.taskSuccessRate < 70) {
      recommendations.push('📉 Low task success rate. Simplify workflows and reduce complexity.');
    }

    // Slow tasks
    if (metrics.avgTaskDuration > 10000) {
      recommendations.push('🐌 Tasks are taking too long. Optimize performance or reduce steps.');
    }

    // Delight signals!
    if (delight.frustrationLevel === 'none' && metrics.taskSuccessRate === 100) {
      recommendations.push('✅ Perfect UX! Zero frustration and 100% success rate. Keep it up!');
    }

    if (delight.smoothPathRatio > 80) {
      recommendations.push('✅ Smooth user journeys! Most tasks complete without friction.');
    }

    if (delight.timeToWow < 3000) {
      recommendations.push('✅ Fast time-to-value! Users are delighted quickly.');
    }

    return recommendations;
  }
}

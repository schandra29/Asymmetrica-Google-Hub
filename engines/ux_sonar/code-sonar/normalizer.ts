/**
 * Code Sonar Normalizer
 * Computes Bug Density and determines code quality regime
 * Based on Grok's formula: Bug Density = (CC^1.2 × duplicationRatio) / cohesionScore
 * Research: CC correlates r=0.72 with bugs, cohesion drops bug risk by 40%
 */

import { writeFileSync, readFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface NormalizedCodeTelemetry {
  id: string;
  timestamp: number;
  projectPath: string;
  telemetry: any;
  metrics: {
    bugDensity: number;
    cohesionScore: number;
    maintainabilityIndex: number;
    complexityScore: number;
    duplicationScore: number;
  };
  asymmetrica: {
    regime: 'exploration' | 'optimization' | 'stabilization';
    complexity: string;
  };
}

export class CodeNormalizer {

  normalize(rawTelemetry: any, projectPath: string = '/'): NormalizedCodeTelemetry {
    const cohesionScore = this.computeCohesionScore(rawTelemetry.telemetry);
    const bugDensity = this.computeBugDensity(rawTelemetry.telemetry, cohesionScore);
    const maintainabilityIndex = this.computeMaintainabilityIndex(rawTelemetry.telemetry);
    const complexityScore = this.computeComplexityScore(rawTelemetry.telemetry);
    const duplicationScore = this.computeDuplicationScore(rawTelemetry.telemetry);

    const regime = this.determineRegime(bugDensity, rawTelemetry.telemetry);

    return {
      id: `code-telemetry-${Date.now()}`,
      timestamp: Date.now(),
      projectPath,
      telemetry: rawTelemetry.telemetry,
      metrics: {
        bugDensity,
        cohesionScore,
        maintainabilityIndex,
        complexityScore,
        duplicationScore
      },
      asymmetrica: {
        regime,
        complexity: this.assessComplexity(rawTelemetry.telemetry)
      }
    };
  }

  /**
   * Compute Bug Density using Grok's formula:
   * Bug Density = (cyclomaticComplexity^1.2 × duplicationRatio) / cohesionScore
   *
   * Research foundation:
   * - CC correlates r=0.72 with bugs (ArXiv 2019)
   * - Density jumps 2.5× per 10 CC points
   * - Cohesion drops bug risk by 40%
   */
  private computeBugDensity(telemetry: any, cohesionScore: number): number {
    const avgComplexity = telemetry.metrics.avgComplexity || 1;
    const duplicationRatio = telemetry.metrics.duplicationRatio || 0;

    // Grok's formula: (CC^1.2 × duplicationRatio) / cohesionScore
    // Exponent 1.2 reflects non-linear bug increase with complexity
    const bugDensity = (Math.pow(avgComplexity, 1.2) * (1 + duplicationRatio)) / Math.max(cohesionScore, 0.1);

    // Normalize to bugs per 1000 lines of code (industry standard)
    return Math.round(bugDensity * 10) / 10;
  }

  /**
   * Compute Cohesion Score (0-1)
   * Measures how focused and single-responsibility the code is
   *
   * Indicators:
   * - Function length (shorter = higher cohesion)
   * - Complexity per function (lower = higher cohesion)
   * - Dead code ratio (lower = higher cohesion)
   */
  private computeCohesionScore(telemetry: any): number {
    if (telemetry.complexity.length === 0) return 0.5; // Neutral

    // Average function length (target: 10-20 lines)
    const avgFunctionLength = telemetry.complexity.reduce((sum: number, c: any) => sum + c.lines, 0) / telemetry.complexity.length;
    const lengthScore = avgFunctionLength <= 20 ? 1.0 : Math.max(0.3, 20 / avgFunctionLength);

    // Average complexity per function (target: < 5)
    const avgComplexity = telemetry.metrics.avgComplexity || 1;
    const complexityScore = avgComplexity <= 5 ? 1.0 : Math.max(0.2, 5 / avgComplexity);

    // Dead code ratio (lower is better)
    const totalFunctions = telemetry.complexity.length;
    const deadCodeCount = telemetry.deadCode.length;
    const deadCodeRatio = totalFunctions > 0 ? deadCodeCount / totalFunctions : 0;
    const deadCodeScore = Math.max(0, 1 - deadCodeRatio);

    // Weighted average (30% length, 40% complexity, 30% dead code)
    const cohesionScore = (lengthScore * 0.3) + (complexityScore * 0.4) + (deadCodeScore * 0.3);

    return Math.round(cohesionScore * 100) / 100;
  }

  /**
   * Compute Maintainability Index (0-100)
   * Industry standard formula: 171 - 5.2×ln(HV) - 0.23×CC - 16.2×ln(LOC)
   * Simplified version for our metrics
   */
  private computeMaintainabilityIndex(telemetry: any): number {
    const avgComplexity = telemetry.metrics.avgComplexity || 1;
    const totalLines = telemetry.metrics.totalLines || 1;
    const duplicationRatio = telemetry.metrics.duplicationRatio || 0;

    // Simplified MI: Base 100, subtract penalties
    let mi = 100;

    // Complexity penalty (0-30 points)
    mi -= Math.min(30, avgComplexity * 2);

    // Lines of code penalty (0-20 points)
    const locPenalty = Math.min(20, Math.log(totalLines) * 2);
    mi -= locPenalty;

    // Duplication penalty (0-25 points)
    mi -= Math.min(25, duplicationRatio * 100);

    // Dead code penalty (0-15 points)
    const deadCodeRatio = telemetry.deadCode.length / Math.max(telemetry.complexity.length, 1);
    mi -= Math.min(15, deadCodeRatio * 50);

    // Bundle bloat penalty (0-10 points)
    const bloatedBundles = telemetry.bundles.filter((b: any) => b.sizeGzip > 250 * 1024).length;
    mi -= Math.min(10, bloatedBundles * 5);

    return Math.max(0, Math.min(100, Math.round(mi)));
  }

  /**
   * Compute Complexity Score (0-100)
   * Higher score = lower complexity (better)
   */
  private computeComplexityScore(telemetry: any): number {
    const avgComplexity = telemetry.metrics.avgComplexity || 1;
    const maxComplexity = telemetry.metrics.maxComplexity || 1;

    // Target: avg < 5, max < 10
    const avgScore = avgComplexity <= 5 ? 100 : Math.max(0, 100 - (avgComplexity - 5) * 10);
    const maxScore = maxComplexity <= 10 ? 100 : Math.max(0, 100 - (maxComplexity - 10) * 5);

    // Weighted average (60% avg, 40% max)
    return Math.round((avgScore * 0.6) + (maxScore * 0.4));
  }

  /**
   * Compute Duplication Score (0-100)
   * Higher score = less duplication (better)
   */
  private computeDuplicationScore(telemetry: any): number {
    const duplicationRatio = telemetry.metrics.duplicationRatio || 0;

    // Target: < 3% duplication
    if (duplicationRatio <= 0.03) return 100;

    // Penalty: -10 points per 1% over target
    const score = 100 - ((duplicationRatio - 0.03) * 1000);

    return Math.max(0, Math.round(score));
  }

  /**
   * Determine regime based on bug density and complexity
   * Grok's guidance: exploration (density > 0.05), optimization (duplication > 0.15), stabilization (otherwise)
   */
  private determineRegime(bugDensity: number, telemetry: any): 'exploration' | 'optimization' | 'stabilization' {
    const avgComplexity = telemetry.metrics.avgComplexity || 0;
    const duplicationRatio = telemetry.metrics.duplicationRatio || 0;

    // Exploration: High bug density OR high complexity
    if (bugDensity > 0.05 || avgComplexity > 15) {
      return 'exploration';
    }

    // Optimization: Significant duplication
    if (duplicationRatio > 0.15) {
      return 'optimization';
    }

    // Stabilization: Good metrics
    return 'stabilization';
  }

  /**
   * Assess computational complexity notation
   */
  private assessComplexity(telemetry: any): string {
    const avgComplexity = telemetry.metrics.avgComplexity || 0;
    const maxComplexity = telemetry.metrics.maxComplexity || 0;

    // Based on cyclomatic complexity, estimate algorithmic complexity
    if (maxComplexity > 20 || avgComplexity > 10) {
      return 'O(n²)'; // High complexity, likely nested loops
    } else if (maxComplexity > 10 || avgComplexity > 5) {
      return 'O(n log n)'; // Moderate complexity
    } else {
      return 'O(n)'; // Linear complexity
    }
  }

  /**
   * Save baseline for future comparisons
   */
  saveBaseline(normalized: NormalizedCodeTelemetry, projectPath: string) {
    const baselineDir = join(process.cwd(), 'tests/ux-sonar/baselines');

    try {
      mkdirSync(baselineDir, { recursive: true });
    } catch (e) {
      // Directory might already exist
    }

    // Use project name from path
    const projectName = projectPath.split(/[/\\]/).pop() || 'project';
    const filepath = join(baselineDir, `code_${projectName}.json`);

    writeFileSync(filepath, JSON.stringify(normalized, null, 2));
    console.log(`[Code Normalizer] Baseline saved: ${filepath}`);
  }

  /**
   * Load baseline for comparison
   */
  loadBaseline(projectPath: string): NormalizedCodeTelemetry | null {
    const baselineDir = join(process.cwd(), 'tests/ux-sonar/baselines');
    const projectName = projectPath.split(/[/\\]/).pop() || 'project';
    const filepath = join(baselineDir, `code_${projectName}.json`);

    try {
      const data = JSON.parse(readFileSync(filepath, 'utf-8'));
      console.log(`[Code Normalizer] Baseline loaded: ${filepath}`);
      return data;
    } catch (e) {
      console.log(`[Code Normalizer] No baseline found for ${projectPath}`);
      return null;
    }
  }

  /**
   * Compare baselines
   */
  compareBaselines(current: NormalizedCodeTelemetry, baseline: NormalizedCodeTelemetry) {
    return {
      bugDensityDelta: current.metrics.bugDensity - baseline.metrics.bugDensity,
      cohesionDelta: current.metrics.cohesionScore - baseline.metrics.cohesionScore,
      maintainabilityDelta: current.metrics.maintainabilityIndex - baseline.metrics.maintainabilityIndex,
      complexityDelta: current.metrics.complexityScore - baseline.metrics.complexityScore,
      duplicationDelta: current.metrics.duplicationScore - baseline.metrics.duplicationScore,
      regimeChange: current.asymmetrica.regime !== baseline.asymmetrica.regime
    };
  }

  /**
   * Generate quality gates report
   * Returns pass/fail based on industry standards
   */
  checkQualityGates(normalized: NormalizedCodeTelemetry): { passed: boolean; failures: string[] } {
    const failures: string[] = [];

    // Gate 1: Bug Density (should be < 0.05 bugs/LOC)
    if (normalized.metrics.bugDensity > 0.05) {
      failures.push(`Bug Density too high: ${normalized.metrics.bugDensity} (target: < 0.05)`);
    }

    // Gate 2: Maintainability Index (should be > 65)
    if (normalized.metrics.maintainabilityIndex < 65) {
      failures.push(`Maintainability Index too low: ${normalized.metrics.maintainabilityIndex} (target: > 65)`);
    }

    // Gate 3: Complexity Score (should be > 70)
    if (normalized.metrics.complexityScore < 70) {
      failures.push(`Complexity Score too low: ${normalized.metrics.complexityScore} (target: > 70)`);
    }

    // Gate 4: Duplication Score (should be > 85)
    if (normalized.metrics.duplicationScore < 85) {
      failures.push(`Duplication Score too low: ${normalized.metrics.duplicationScore} (target: > 85)`);
    }

    return {
      passed: failures.length === 0,
      failures
    };
  }
}

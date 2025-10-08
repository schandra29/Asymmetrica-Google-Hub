/**
 * Semantic Sonar Normalizer
 * Computes Architecture Quality Score (AQS) and determines architecture regime
 * Based on Grok's formula: AQS = (cohesion/coupling) × modularityIndex
 * Research: Coupling-cohesion inverse r=-0.68, predicts maintainability 82% accuracy (Kent State 1999)
 */

import { writeFileSync, readFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface NormalizedSemanticTelemetry {
  id: string;
  timestamp: number;
  projectPath: string;
  telemetry: any;
  metrics: {
    aqs: number;
    cohesion: number;
    coupling: number;
    modularityIndex: number;
    maintainabilityScore: number;
    architectureHealth: number;
  };
  asymmetrica: {
    regime: 'exploration' | 'optimization' | 'stabilization';
    complexity: string;
  };
}

export class SemanticNormalizer {

  normalize(rawTelemetry: any, projectPath: string = '/'): NormalizedSemanticTelemetry {
    const cohesion = rawTelemetry.telemetry.metrics.avgCohesion;
    const coupling = rawTelemetry.telemetry.metrics.avgCoupling;
    const modularityIndex = rawTelemetry.telemetry.metrics.modularityIndex;

    const aqs = this.computeAQS(cohesion, coupling, modularityIndex);
    const maintainabilityScore = this.computeMaintainabilityScore(rawTelemetry.telemetry);
    const architectureHealth = this.computeArchitectureHealth(rawTelemetry.telemetry);

    const regime = this.determineRegime(coupling, aqs, modularityIndex);

    return {
      id: `semantic-telemetry-${Date.now()}`,
      timestamp: Date.now(),
      projectPath,
      telemetry: rawTelemetry.telemetry,
      metrics: {
        aqs,
        cohesion,
        coupling,
        modularityIndex,
        maintainabilityScore,
        architectureHealth
      },
      asymmetrica: {
        regime,
        complexity: this.assessComplexity(rawTelemetry.telemetry)
      }
    };
  }

  /**
   * Compute Architecture Quality Score using Grok's formula:
   * AQS = (cohesion/coupling) × modularityIndex
   *
   * Research foundation:
   * - Coupling-cohesion inverse: r=-0.68 (Kent State 1999)
   * - Predicts maintainability with 82% accuracy
   */
  private computeAQS(cohesion: number, coupling: number, modularityIndex: number): number {
    // Prevent division by zero
    const safeCoupling = Math.max(coupling, 0.1);

    // Grok's formula
    const aqs = (cohesion / safeCoupling) * modularityIndex;

    // Normalize to 0-1 scale (typical AQS range: 0-2)
    return Math.min(1, Math.max(0, aqs / 2));
  }

  /**
   * Compute Maintainability Score (0-100)
   * Factors: AQS, cycles, layering, orphans
   */
  private computeMaintainabilityScore(telemetry: any): number {
    let score = 100;

    // Penalty for circular dependencies (severe)
    score -= Math.min(30, telemetry.cycles.length * 10);

    // Penalty for excessive coupling (moderate)
    const highCoupling = telemetry.coupling.filter((c: any) => c.zScore > 2).length;
    score -= Math.min(20, highCoupling * 5);

    // Penalty for god modules (severe)
    score -= Math.min(25, telemetry.godModules.length * 8);

    // Penalty for layering violations (moderate)
    score -= Math.min(15, telemetry.layeringViolations.length * 3);

    // Penalty for orphan domains (minor)
    score -= Math.min(10, telemetry.orphanDomains.length * 2);

    return Math.max(0, Math.round(score));
  }

  /**
   * Compute Architecture Health (0-100)
   * Overall health indicator combining all metrics
   */
  private computeArchitectureHealth(telemetry: any): number {
    const metrics = telemetry.metrics;

    // Weight factors
    const modularityWeight = 0.4;
    const cohesionWeight = 0.3;
    const couplingWeight = 0.3;

    // Modularity score (0-100)
    const modularityScore = metrics.modularityIndex * 100;

    // Cohesion score (0-100)
    const cohesionScore = metrics.avgCohesion * 100;

    // Coupling score (0-100, inverted - lower coupling is better)
    const couplingScore = Math.max(0, 100 - (metrics.avgCoupling * 10));

    // Weighted average
    const health = (modularityScore * modularityWeight) +
                   (cohesionScore * cohesionWeight) +
                   (couplingScore * couplingWeight);

    return Math.round(health);
  }

  /**
   * Determine regime based on coupling and AQS
   * Grok's guidance: exploration (coupling > 0.3 OR AQS < 0.6), optimization (modularity < 0.5), stabilization (otherwise)
   */
  private determineRegime(coupling: number, aqs: number, modularityIndex: number): 'exploration' | 'optimization' | 'stabilization' {
    // Exploration: High coupling OR low AQS
    if (coupling > 0.3 || aqs < 0.6) {
      return 'exploration';
    }

    // Optimization: Low modularity
    if (modularityIndex < 0.5) {
      return 'optimization';
    }

    // Stabilization: Good metrics
    return 'stabilization';
  }

  /**
   * Assess computational complexity based on dependency graph
   */
  private assessComplexity(telemetry: any): string {
    const avgCoupling = telemetry.metrics.avgCoupling;
    const cycleCount = telemetry.cycles.length;

    // Cycles indicate higher complexity (potentially exponential)
    if (cycleCount > 5 || avgCoupling > 10) {
      return 'O(n²)'; // Complex dependency graph
    } else if (cycleCount > 0 || avgCoupling > 5) {
      return 'O(n log n)'; // Moderate complexity
    } else {
      return 'O(n)'; // Linear dependency graph
    }
  }

  /**
   * Save baseline for future comparisons
   */
  saveBaseline(normalized: NormalizedSemanticTelemetry, projectPath: string) {
    const baselineDir = join(process.cwd(), 'tests/ux-sonar/baselines');

    try {
      mkdirSync(baselineDir, { recursive: true });
    } catch (e) {
      // Directory might already exist
    }

    const projectName = projectPath.split(/[/\\]/).pop() || 'project';
    const filepath = join(baselineDir, `semantic_${projectName}.json`);

    writeFileSync(filepath, JSON.stringify(normalized, null, 2));
    console.log(`[Semantic Normalizer] Baseline saved: ${filepath}`);
  }

  /**
   * Load baseline for comparison
   */
  loadBaseline(projectPath: string): NormalizedSemanticTelemetry | null {
    const baselineDir = join(process.cwd(), 'tests/ux-sonar/baselines');
    const projectName = projectPath.split(/[/\\]/).pop() || 'project';
    const filepath = join(baselineDir, `semantic_${projectName}.json`);

    try {
      const data = JSON.parse(readFileSync(filepath, 'utf-8'));
      console.log(`[Semantic Normalizer] Baseline loaded: ${filepath}`);
      return data;
    } catch (e) {
      console.log(`[Semantic Normalizer] No baseline found for ${projectPath}`);
      return null;
    }
  }

  /**
   * Compare baselines
   */
  compareBaselines(current: NormalizedSemanticTelemetry, baseline: NormalizedSemanticTelemetry) {
    return {
      aqsDelta: current.metrics.aqs - baseline.metrics.aqs,
      cohesionDelta: current.metrics.cohesion - baseline.metrics.cohesion,
      couplingDelta: current.metrics.coupling - baseline.metrics.coupling,
      modularityDelta: current.metrics.modularityIndex - baseline.metrics.modularityIndex,
      maintainabilityDelta: current.metrics.maintainabilityScore - baseline.metrics.maintainabilityScore,
      architectureHealthDelta: current.metrics.architectureHealth - baseline.metrics.architectureHealth,
      regimeChange: current.asymmetrica.regime !== baseline.asymmetrica.regime,
      cyclesDelta: current.telemetry.cycles.length - baseline.telemetry.cycles.length,
      godModulesDelta: current.telemetry.godModules.length - baseline.telemetry.godModules.length
    };
  }

  /**
   * Generate quality gates report
   */
  checkQualityGates(normalized: NormalizedSemanticTelemetry): { passed: boolean; failures: string[] } {
    const failures: string[] = [];

    // Gate 1: AQS (should be > 0.6)
    if (normalized.metrics.aqs < 0.6) {
      failures.push(`AQS too low: ${normalized.metrics.aqs.toFixed(2)} (target: > 0.6)`);
    }

    // Gate 2: No circular dependencies
    if (normalized.telemetry.cycles.length > 0) {
      failures.push(`Circular dependencies detected: ${normalized.telemetry.cycles.length} cycles (target: 0)`);
    }

    // Gate 3: Modularity Index (should be > 0.7)
    if (normalized.metrics.modularityIndex < 0.7) {
      failures.push(`Modularity Index too low: ${normalized.metrics.modularityIndex.toFixed(2)} (target: > 0.7)`);
    }

    // Gate 4: No god modules
    if (normalized.telemetry.godModules.length > 0) {
      failures.push(`God modules detected: ${normalized.telemetry.godModules.length} (target: 0)`);
    }

    // Gate 5: Architecture Health (should be > 70)
    if (normalized.metrics.architectureHealth < 70) {
      failures.push(`Architecture Health too low: ${normalized.metrics.architectureHealth} (target: > 70)`);
    }

    return {
      passed: failures.length === 0,
      failures
    };
  }
}

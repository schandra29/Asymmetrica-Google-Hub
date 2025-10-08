/**
 * Multi-Team Dragon Merger
 *
 * Uses Dragon Curve fractal folding to merge baselines from multiple teams:
 *   - Detects metric drift between teams
 *   - Harmonizes baselines when alignment is good
 *   - Flags divergence for manual review
 *
 * Algorithm:
 *   1. Generate dragon curve path
 *   2. Fold each team's baseline along fractal
 *   3. Compare folded metrics at boundaries
 *   4. PHI-weighted averaging for harmonization
 *   5. Tetractys-style geometric mean for final merge
 *
 * Sacred Geometry:
 *   - Dragon (this): Boundary exploration
 *   - Tetractys (November): Hierarchical convergence
 *   - Labyrinth (Mike): Sequential timing
 *
 * @author Agent Oscar
 * @date October 5, 2025
 */

import DragonCurveEngine, { DragonFold, BoundaryEdge } from './dragon-curve-engine.js';

const PHI = 1.618033988749895;

export interface TeamBaseline {
  teamId: string;
  shm: number; // Statistical Harmonic Mean (0-1)
  metrics: Record<string, number>;
  timestamp: number;
  regime?: 'exploration' | 'stabilization' | 'convergence';
}

export interface TeamDrift {
  teamA: string;
  teamB: string;
  driftAmount: number; // 0-1 scale
  metricName?: string;
  foldLevel: number;
  phiWeight: number;
}

export interface MergeResult {
  mergedBaseline: TeamBaseline | null;
  drifts: TeamDrift[];
  fractalCoverage: number; // Percentage of team pairs explored
  harmonizationScore: number; // 0-1 (1 = perfect alignment)
  recommendation: 'merge' | 'review' | 'reject';
}

export class MultiTeamDragonMerger extends DragonCurveEngine {
  private readonly DRIFT_THRESHOLD_WARNING = 0.15; // 15% drift triggers warning
  private readonly DRIFT_THRESHOLD_REJECT = 0.30; // 30% drift prevents merge
  private readonly HARMONIZATION_TARGET = 0.10; // <10% avg drift = harmonious

  /**
   * Fold multiple team baselines together to find drifts
   *
   * Fractal Folding Process:
   *   Level 1: Compare team pairs directly
   *   Level 2: Fold each team's metrics (PHI adjustment)
   *   Level 3: Compare folded spaces (fractal drift)
   *   Level N: Deeper harmonics reveal subtle divergence
   *
   * @param teams Array of team baselines
   * @param level Fractal depth (2-4 recommended)
   * @returns Merge result with drifts and recommendation
   */
  foldTeamBaselines(teams: TeamBaseline[], level: number = 3): MergeResult {
    if (teams.length < 2) {
      return {
        mergedBaseline: teams[0] || null,
        drifts: [],
        fractalCoverage: 0,
        harmonizationScore: 1.0,
        recommendation: 'merge',
      };
    }

    const boundaries = this.exploreBoundaries(teams, level, (team, fold) =>
      this.foldTeam(team, fold)
    );

    // Detect drifts: Edges where folded teams diverge significantly
    const drifts: TeamDrift[] = [];

    for (const boundary of boundaries) {
      if (boundary.from && boundary.to) {
        const shmDrift = Math.abs(boundary.from.shm - boundary.to.shm);

        if (shmDrift > this.DRIFT_THRESHOLD_WARNING) {
          drifts.push({
            teamA: boundary.from.teamId,
            teamB: boundary.to.teamId,
            driftAmount: shmDrift,
            foldLevel: boundary.fold.level,
            phiWeight: boundary.fold.weight,
          });
        }

        // Check metric-level drift
        for (const key of Object.keys(boundary.from.metrics)) {
          if (boundary.to.metrics[key] !== undefined) {
            const metricDrift = Math.abs(boundary.from.metrics[key] - boundary.to.metrics[key]);

            if (metricDrift > this.DRIFT_THRESHOLD_WARNING) {
              drifts.push({
                teamA: boundary.from.teamId,
                teamB: boundary.to.teamId,
                driftAmount: metricDrift,
                metricName: key,
                foldLevel: boundary.fold.level,
                phiWeight: boundary.fold.weight,
              });
            }
          }
        }
      }
    }

    // Calculate harmonization score
    const avgDrift = drifts.reduce((sum, d) => sum + d.driftAmount, 0) / (drifts.length || 1);
    const harmonizationScore = Math.max(0, 1.0 - avgDrift / this.DRIFT_THRESHOLD_REJECT);

    // Merge decision
    let recommendation: 'merge' | 'review' | 'reject';
    let mergedBaseline: TeamBaseline | null = null;

    if (avgDrift < this.HARMONIZATION_TARGET) {
      recommendation = 'merge';
      mergedBaseline = this.harmonizeTeams(teams);
    } else if (avgDrift < this.DRIFT_THRESHOLD_REJECT) {
      recommendation = 'review';
      mergedBaseline = this.harmonizeTeams(teams); // Provisional merge
    } else {
      recommendation = 'reject';
    }

    return {
      mergedBaseline,
      drifts,
      fractalCoverage: boundaries.length / (teams.length * teams.length),
      harmonizationScore,
      recommendation,
    };
  }

  /**
   * Apply PHI-weighted transformation to team metrics
   * This simulates "folding" the team's metric space
   *
   * @param team Original baseline
   * @param fold Dragon curve fold metadata
   * @returns Folded team baseline
   */
  private foldTeam(team: TeamBaseline, fold: DragonFold): TeamBaseline | null {
    const phiAdjustment = 1.0 / fold.weight; // Deeper folds = smaller adjustments

    return {
      teamId: `${team.teamId}_fold_${fold.level}`,
      shm: team.shm * phiAdjustment,
      metrics: Object.fromEntries(
        Object.entries(team.metrics).map(([k, v]) => [k, v * phiAdjustment])
      ),
      timestamp: Date.now(),
      regime: fold.regime,
    };
  }

  /**
   * Harmonize teams using Tetractys-style geometric mean
   *
   * Process:
   *   1. Calculate geometric mean of SHM scores
   *   2. PHI-weighted average of metrics
   *   3. Adjust by team count (more teams = more conservative)
   *
   * Sacred Geometry Connection:
   *   - Tetractys: Triangular convergence (1-2-3-4 layers)
   *   - PHI: Golden ratio for natural balance
   *   - Dragon: Fractal folding preserves self-similarity
   */
  private harmonizeTeams(teams: TeamBaseline[]): TeamBaseline {
    const n = teams.length;

    // Geometric mean of SHM (Tetractys-style)
    const shmProduct = teams.reduce((prod, t) => prod * t.shm, 1);
    const geometricMeanSHM = Math.pow(shmProduct, 1 / n);

    // PHI-weighted metric averaging
    const mergedMetrics: Record<string, number> = {};

    for (const key of Object.keys(teams[0].metrics)) {
      const values = teams.map((t) => t.metrics[key]).filter((v) => v !== undefined);

      if (values.length > 0) {
        // Weighted by team index (earlier teams have more weight)
        const phiWeights = teams.map((_, i) => Math.pow(PHI, -(i / n)));
        const totalWeight = phiWeights.reduce((sum, w) => sum + w, 0);

        const weightedSum = values.reduce((sum, v, i) => sum + v * phiWeights[i], 0);
        mergedMetrics[key] = weightedSum / totalWeight;
      }
    }

    // PHI adjustment scaled by team count (stabilization)
    const countAdjustment = PHI / Math.sqrt(n);

    return {
      teamId: `merged_${teams.map((t) => t.teamId.split('_')[0]).join('_')}`,
      shm: geometricMeanSHM * countAdjustment,
      metrics: mergedMetrics,
      timestamp: Date.now(),
      regime: 'stabilization',
    };
  }

  /**
   * Generate drift report for manual review
   */
  generateDriftReport(drifts: TeamDrift[]): string {
    if (drifts.length === 0) {
      return '✅ No significant drifts detected. Teams are harmonious.';
    }

    const lines: string[] = ['🐉 Dragon Curve Drift Analysis', ''];

    // Sort by drift amount (highest first)
    const sorted = [...drifts].sort((a, b) => b.driftAmount - a.driftAmount);

    for (const drift of sorted) {
      const severity = drift.driftAmount > 0.3 ? '🔴 CRITICAL' : '⚠️  WARNING';
      const metric = drift.metricName ? ` (${drift.metricName})` : ' (SHM)';
      const percent = (drift.driftAmount * 100).toFixed(1);

      lines.push(
        `${severity}: ${drift.teamA} ↔ ${drift.teamB}${metric}`,
        `  Drift: ${percent}%`,
        `  Fold Level: ${drift.foldLevel} (PHI weight: ${drift.phiWeight.toFixed(3)})`,
        ''
      );
    }

    return lines.join('\n');
  }
}

export default MultiTeamDragonMerger;

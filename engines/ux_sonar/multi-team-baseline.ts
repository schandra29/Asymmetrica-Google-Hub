import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface Baseline {
  shm: number; // System Harmonic Mean
  regimeBlend: [number, number, number]; // [exploration, optimization, stabilization]
  weights: {
    ux: number;
    design: number;
    code: number;
    semantic: number;
    journey: number;
    state: number;
  };
  commitsSinceUpdate: number;
  lastUpdated: string;
  history?: BaselineSnapshot[];
}

export interface BaselineSnapshot {
  shm: number;
  timestamp: string;
  commitHash?: string;
  teamId?: string;
}

export interface TeamOverride {
  teamId: string;
  weights: {
    ux: number;
    design: number;
    code: number;
    semantic: number;
    journey: number;
    state: number;
  };
  regimeBlend: [number, number, number];
  thresholds?: {
    [key: string]: { harmony: number };
  };
  lastUpdated: string;
  commitsSinceUpdate: number;
}

export interface MergeDriftResult {
  approved: boolean;
  drift: number;
  threshold: number;
  reason: string;
  williamsValue: number;
}

export interface BlendedScores {
  shm: number;
  weights: Baseline['weights'];
  regimeBlend: [number, number, number];
  teamId: string;
  globalInfluence: number;
}

/**
 * Multi-Team Baseline Manager
 *
 * Manages global baselines and team-specific overrides using Williams Space Optimizer
 * for drift detection and auto-merging.
 *
 * Architecture:
 * [Global River DB] → [Team A Overrides] → [Williams Drift Check] → [Auto-Merge or Alert]
 *                  → [Team B Overrides] → [Cross-Team Regime Match] → [Notifications]
 *
 * Formula: williamsThreshold = √t × log₂(t)
 * Where t = commits since last baseline update
 * Auto-approve if delta < threshold × 5%
 */
export class MultiTeamBaselineManager {
  private globalBaseline: Baseline | null = null;
  private teamOverrides: Map<string, TeamOverride> = new Map();
  private baseDir: string;

  constructor(baseDir: string = process.cwd()) {
    this.baseDir = baseDir;
  }

  /**
   * Load global baseline from JSON
   */
  loadGlobalBaseline(): Baseline {
    const globalPath = join(this.baseDir, 'baselines/global-baseline.json');

    if (!existsSync(globalPath)) {
      throw new Error(`Global baseline not found at ${globalPath}`);
    }

    const data = JSON.parse(readFileSync(globalPath, 'utf-8'));
    this.globalBaseline = data;
    console.log(`[MultiTeam] Global baseline loaded: SHM=${data.shm}, commits=${data.commitsSinceUpdate}`);
    return data;
  }

  /**
   * Load team-specific override configuration
   */
  loadTeamOverride(teamId: string): TeamOverride {
    const teamPath = join(this.baseDir, `teams/${teamId}_baselines.json`);

    if (!existsSync(teamPath)) {
      throw new Error(`Team override not found for ${teamId} at ${teamPath}`);
    }

    const data = JSON.parse(readFileSync(teamPath, 'utf-8'));
    this.teamOverrides.set(teamId, data);
    console.log(`[MultiTeam] Team override loaded: ${teamId}, weights=${JSON.stringify(data.weights)}`);
    return data;
  }

  /**
   * Blend global baseline with team-specific weights
   * Team overrides are ADDITIVE to global (not replacements)
   */
  blendForTeam(teamId: string, scores: any): BlendedScores {
    if (!this.globalBaseline) {
      throw new Error('Global baseline must be loaded first');
    }

    const teamOverride = this.teamOverrides.get(teamId);

    if (!teamOverride) {
      // No override, use global
      return {
        shm: this.globalBaseline.shm,
        weights: this.globalBaseline.weights,
        regimeBlend: this.globalBaseline.regimeBlend,
        teamId,
        globalInfluence: 1.0
      };
    }

    // Blend weights: 50% global + 50% team
    const blendedWeights = {
      ux: (this.globalBaseline.weights.ux * 0.5) + (teamOverride.weights.ux * 0.5),
      design: (this.globalBaseline.weights.design * 0.5) + (teamOverride.weights.design * 0.5),
      code: (this.globalBaseline.weights.code * 0.5) + (teamOverride.weights.code * 0.5),
      semantic: (this.globalBaseline.weights.semantic * 0.5) + (teamOverride.weights.semantic * 0.5),
      journey: (this.globalBaseline.weights.journey * 0.5) + (teamOverride.weights.journey * 0.5),
      state: (this.globalBaseline.weights.state * 0.5) + (teamOverride.weights.state * 0.5)
    };

    // Blend regime: 70% global + 30% team
    const blendedRegime: [number, number, number] = [
      (this.globalBaseline.regimeBlend[0] * 0.7) + (teamOverride.regimeBlend[0] * 0.3),
      (this.globalBaseline.regimeBlend[1] * 0.7) + (teamOverride.regimeBlend[1] * 0.3),
      (this.globalBaseline.regimeBlend[2] * 0.7) + (teamOverride.regimeBlend[2] * 0.3)
    ];

    // Calculate blended SHM using team scores and blended weights
    const teamSHM = this.calculateSHM(scores, blendedWeights);

    return {
      shm: teamSHM,
      weights: blendedWeights,
      regimeBlend: blendedRegime,
      teamId,
      globalInfluence: 0.5 // 50% global influence
    };
  }

  /**
   * Check if merge drift is within acceptable Williams threshold
   * Formula: √t × log₂(t) where t = commits since last update
   * Auto-approve if drift < threshold × 5%
   */
  checkMergeDrift(teamId: string, newSHM: number): MergeDriftResult {
    if (!this.globalBaseline) {
      throw new Error('Global baseline must be loaded first');
    }

    const t = this.globalBaseline.commitsSinceUpdate;
    const williamsThreshold = Math.sqrt(t) * Math.log2(t > 0 ? t : 1);
    const drift = Math.abs(newSHM - this.globalBaseline.shm);
    const driftPercent = (drift / this.globalBaseline.shm) * 100;
    const autoApproveThreshold = williamsThreshold * 0.05; // 5% of Williams value

    const approved = driftPercent < autoApproveThreshold;

    return {
      approved,
      drift: driftPercent,
      threshold: autoApproveThreshold,
      reason: approved
        ? `Drift ${driftPercent.toFixed(2)}% < threshold ${autoApproveThreshold.toFixed(2)}%`
        : `Drift ${driftPercent.toFixed(2)}% > threshold ${autoApproveThreshold.toFixed(2)}% - requires review`,
      williamsValue: williamsThreshold
    };
  }

  /**
   * Auto-approve merge and update global baseline if within threshold
   */
  approveAutoMerge(teamId: string, newSHM: number, commitHash?: string): boolean {
    if (!this.globalBaseline) {
      throw new Error('Global baseline must be loaded first');
    }

    const driftResult = this.checkMergeDrift(teamId, newSHM);

    if (driftResult.approved) {
      // Add to history
      if (!this.globalBaseline.history) {
        this.globalBaseline.history = [];
      }

      this.globalBaseline.history.push({
        shm: this.globalBaseline.shm,
        timestamp: this.globalBaseline.lastUpdated,
        commitHash: commitHash,
        teamId: teamId
      });

      // Update global baseline
      this.globalBaseline.shm = newSHM;
      this.globalBaseline.commitsSinceUpdate = 0;
      this.globalBaseline.lastUpdated = new Date().toISOString();

      // Save to disk
      this.saveGlobalBaseline();

      console.log(`[MultiTeam] Auto-merge approved for ${teamId}: SHM ${newSHM}, drift=${driftResult.drift.toFixed(2)}%`);
      return true;
    } else {
      this.alertCrossTeam(`Merge from ${teamId} rejected: ${driftResult.reason}`);
      return false;
    }
  }

  /**
   * Alert system for cross-team notifications
   * (Console logs for now, extendable to WhatsApp/Slack)
   */
  alertCrossTeam(message: string): void {
    const timestamp = new Date().toISOString();
    console.warn(`[CROSS-TEAM ALERT] ${timestamp} - ${message}`);

    // Future: Send to notification service
    // await notificationService.send({ channel: 'cross-team', message });
  }

  /**
   * Save global baseline to disk
   */
  private saveGlobalBaseline(): void {
    if (!this.globalBaseline) return;

    const globalPath = join(this.baseDir, 'baselines/global-baseline.json');
    writeFileSync(globalPath, JSON.stringify(this.globalBaseline, null, 2));
    console.log(`[MultiTeam] Global baseline saved: ${globalPath}`);
  }

  /**
   * Calculate System Harmonic Mean using weighted scores
   */
  private calculateSHM(scores: any, weights: Baseline['weights']): number {
    const reciprocalSum =
      (weights.ux / (scores.ux || 0.01)) +
      (weights.design / (scores.design || 0.01)) +
      (weights.code / (scores.code || 0.01)) +
      (weights.semantic / (scores.semantic || 0.01)) +
      (weights.journey / (scores.journey || 0.01)) +
      (weights.state / (scores.state || 0.01));

    return 1 / reciprocalSum;
  }

  /**
   * Increment commit counter for drift tracking
   */
  incrementCommitCount(): void {
    if (this.globalBaseline) {
      this.globalBaseline.commitsSinceUpdate++;
      this.saveGlobalBaseline();
    }
  }

  /**
   * Get current global baseline
   */
  getGlobalBaseline(): Baseline | null {
    return this.globalBaseline;
  }

  /**
   * Get team override
   */
  getTeamOverride(teamId: string): TeamOverride | undefined {
    return this.teamOverrides.get(teamId);
  }

  /**
   * Check for regime mismatch across teams
   */
  checkRegimeMismatch(teams: { teamId: string; regime: string }[]): { mismatch: boolean; details: string } {
    if (teams.length < 2) {
      return { mismatch: false, details: 'Not enough teams to compare' };
    }

    const regimes = new Set(teams.map(t => t.regime));

    if (regimes.size > 1) {
      const details = teams.map(t => `${t.teamId}: ${t.regime}`).join(', ');
      return {
        mismatch: true,
        details: `Regime mismatch detected - ${details}`
      };
    }

    return { mismatch: false, details: 'All teams in sync' };
  }
}

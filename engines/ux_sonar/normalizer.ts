import { writeFileSync, readFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface NormalizedTelemetry {
  id: string;
  timestamp: number;
  route: string;
  layers: {
    frontend?: any;
    backend?: any;
  };
  metrics: {
    smoothnessIndex: number;
    energyEfficiency: number;
    stabilizationTime: number;
  };
  asymmetrica: {
    regime: 'exploration' | 'optimization' | 'stabilization';
    complexity: string;
  };
  teamContext?: string;
}

export class TelemetryNormalizer {

  normalize(frontendData: any, backendData?: any, route: string = '/', teamId?: string): NormalizedTelemetry {
    const smoothnessIndex = this.computeSmoothnessIndex(frontendData);
    const energyEfficiency = this.computeEnergyEfficiency(frontendData);
    const stabilizationTime = frontendData.metrics?.timeToStable || 0;

    const regime = this.determineRegime(smoothnessIndex, frontendData.metrics.cls);

    return {
      id: `telemetry-${Date.now()}${teamId ? `-${teamId}` : ''}`,
      timestamp: Date.now(),
      route,
      layers: {
        frontend: frontendData,
        backend: backendData
      },
      metrics: {
        smoothnessIndex,
        energyEfficiency,
        stabilizationTime
      },
      asymmetrica: {
        regime,
        complexity: this.assessComplexity(frontendData)
      },
      teamContext: teamId
    };
  }

  private computeSmoothnessIndex(frontendData: any): number {
    const fps = frontendData.metrics?.fps || 60;
    const cls = frontendData.metrics?.cls || 0;
    const longTasks = frontendData.metrics?.longTasks || 0;
    
    const longTaskPenalty = longTasks / 1000;
    return fps / (1 + cls + longTaskPenalty);
  }

  private computeEnergyEfficiency(frontendData: any): number {
    const fps = frontendData.metrics?.fps || 60;
    const longTasks = frontendData.metrics?.longTasks || 0;
    
    const perceivedResponsiveness = fps / 60;
    const cpuTime = longTasks > 0 ? longTasks / 1000 : 0.001;
    
    return perceivedResponsiveness / cpuTime;
  }

  private determineRegime(smoothness: number, cls: number): 'exploration' | 'optimization' | 'stabilization' {
    if (cls > 0.1 || smoothness < 40) {
      return 'exploration';
    } else if (smoothness >= 50 && cls <= 0.05) {
      return 'stabilization';
    } else {
      return 'optimization';
    }
  }

  private assessComplexity(frontendData: any): string {
    const animCount = frontendData.metrics?.animationCount || 0;
    const eventCount = frontendData.events?.length || 0;
    
    if (animCount > 10 || eventCount > 50) {
      return 'O(n²)';
    } else if (animCount > 5 || eventCount > 20) {
      return 'O(n log n)';
    } else {
      return 'O(n)';
    }
  }

  saveBaseline(normalized: NormalizedTelemetry, route: string) {
    const baselineDir = join(process.cwd(), 'tests/ux-sonar/baselines');
    
    try {
      mkdirSync(baselineDir, { recursive: true });
    } catch (e) {}
    
    const filename = route.replace(/\//g, '_') || 'root';
    const filepath = join(baselineDir, `${filename}.json`);
    
    writeFileSync(filepath, JSON.stringify(normalized, null, 2));
    console.log(`[Normalizer] Baseline saved: ${filepath}`);
  }

  loadBaseline(route: string): NormalizedTelemetry | null {
    const baselineDir = join(process.cwd(), 'tests/ux-sonar/baselines');
    const filename = route.replace(/\//g, '_') || 'root';
    const filepath = join(baselineDir, `${filename}.json`);
    
    try {
      const data = JSON.parse(readFileSync(filepath, 'utf-8'));
      console.log(`[Normalizer] Baseline loaded: ${filepath}`);
      return data;
    } catch (e) {
      console.log(`[Normalizer] No baseline found for ${route}`);
      return null;
    }
  }

  compareBaselines(current: NormalizedTelemetry, baseline: NormalizedTelemetry) {
    return {
      smoothnessDelta: current.metrics.smoothnessIndex - baseline.metrics.smoothnessIndex,
      energyDelta: current.metrics.energyEfficiency - baseline.metrics.energyEfficiency,
      clsDelta: (current.layers.frontend?.metrics.cls || 0) - (baseline.layers.frontend?.metrics.cls || 0),
      fpsDelta: (current.layers.frontend?.metrics.fps || 0) - (baseline.layers.frontend?.metrics.fps || 0),
      regimeChange: current.asymmetrica.regime !== baseline.asymmetrica.regime
    };
  }
}

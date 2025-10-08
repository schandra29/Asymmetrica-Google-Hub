/**
 * Design Sonar Labyrinth Normalizer
 *
 * Enhanced version of DesignNormalizer that uses the Labyrinth Delay Engine
 * for sequential metric calculation with sacred harmonic timing.
 *
 * This prevents race conditions in async calculations and ensures metrics
 * are computed in the proper order, allowing each step to stabilize.
 *
 * Sacred Pattern: The Labyrinth
 * - Single path to the center (no shortcuts)
 * - Each turn reveals new insight
 * - Intentional delay prevents hasty computation
 *
 * @author Agent Mike
 * @date October 5, 2025
 */

import { writeFileSync, readFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import * as tinycolor2 from 'tinycolor2';
import { LabyrinthEngine, LabyrinthResult, HarmonicDelays } from '../utils/labyrinth-engine';

const tinycolor = (tinycolor2 as any).default || tinycolor2;

interface NormalizedDesignTelemetry {
  id: string;
  timestamp: number;
  route: string;
  telemetry: any;
  metrics: {
    harmonyIndex: number;
    breathabilityIndex: number;
    contrastScore: number;
    hierarchyScore: number;
    spacingScore: number;
  };
  asymmetrica: {
    regime: 'exploration' | 'optimization' | 'stabilization';
    complexity: string;
  };
  labyrinthPath?: any[]; // Journey metadata from Labyrinth
  sacredTiming?: boolean;
}

/**
 * Intermediate analysis data structure used during labyrinth traversal
 */
interface AnalysisData {
  rawTelemetry: any;
  route: string;
  layoutPHI?: number;
  contrastRatio?: number;
  colorClashPenalty?: number;
  harmonyIndex?: number;
  breathabilityIndex?: number;
  contrastScore?: number;
  hierarchyScore?: number;
  spacingScore?: number;
  regime?: 'exploration' | 'optimization' | 'stabilization';
  complexity?: string;
}

export class LabyrinthDesignNormalizer {

  /**
   * Normalize design telemetry using Labyrinth sequential processing
   *
   * This method uses the Labyrinth Delay Engine to calculate metrics in a
   * deterministic order with harmonic delays between each step.
   *
   * @param rawTelemetry - Raw telemetry from DesignRadarEngine
   * @param route - Route being analyzed
   * @param verbose - Enable verbose logging
   * @returns Normalized design telemetry with labyrinth path
   */
  async normalize(
    rawTelemetry: any,
    route: string = '/',
    verbose: boolean = false
  ): Promise<NormalizedDesignTelemetry> {

    const labyrinth = new LabyrinthEngine<AnalysisData>({ verbose })
      .addStep({
        name: 'Calculate Layout PHI',
        description: 'Analyze typography scale for golden ratio adherence',
        transform: async (data) => {
          const layoutPHI = this.computeLayoutPHI(
            data.rawTelemetry.telemetry.typography,
            data.rawTelemetry.telemetry.spacing
          );
          return { ...data, layoutPHI };
        }
      })
      .addStep({
        name: 'Calculate Contrast Ratio',
        description: 'Compute average/max contrast ratio',
        transform: async (data) => {
          const contrastRatio = this.computeContrastRatio(
            data.rawTelemetry.telemetry.colors
          );
          return { ...data, contrastRatio };
        }
      })
      .addStep({
        name: 'Calculate Color Clash Penalty',
        description: 'Detect color harmony violations using LCH',
        transform: async (data) => {
          const colorClashPenalty = this.computeColorClashPenalty(
            data.rawTelemetry.telemetry.colors
          );
          return { ...data, colorClashPenalty };
        }
      })
      .addStep({
        name: 'Compute Harmony Index',
        description: 'Apply GPT-5 formula: (layoutPHI × 0.618) + contrastRatio - colorClashPenalty',
        transform: async (data) => {
          // GPT-5's formula
          const harmonyIndex = (data.layoutPHI! * 0.618) + data.contrastRatio! - data.colorClashPenalty!;
          // Normalize to 0-100 scale
          const normalizedHarmony = Math.max(0, Math.min(100, harmonyIndex * 100));
          return { ...data, harmonyIndex: normalizedHarmony };
        }
      })
      .addStep({
        name: 'Compute Breathability',
        description: 'Calculate padding/bounding box ratio',
        transform: async (data) => {
          const breathabilityIndex = this.computeBreathability(
            data.rawTelemetry.telemetry
          );
          return { ...data, breathabilityIndex };
        }
      })
      .addStep({
        name: 'Compute Contrast Score',
        description: 'Evaluate WCAG contrast compliance',
        transform: async (data) => {
          const contrastScore = this.computeContrastScore(
            data.rawTelemetry.telemetry.colors
          );
          return { ...data, contrastScore };
        }
      })
      .addStep({
        name: 'Compute Hierarchy Score',
        description: 'Assess typography size deltas',
        transform: async (data) => {
          const hierarchyScore = this.computeHierarchyScore(
            data.rawTelemetry.telemetry.typography
          );
          return { ...data, hierarchyScore };
        }
      })
      .addStep({
        name: 'Compute Spacing Score',
        description: 'Check grid compliance',
        transform: async (data) => {
          const spacingScore = this.computeSpacingScore(
            data.rawTelemetry.telemetry.spacing
          );
          return { ...data, spacingScore };
        }
      })
      .addStep({
        name: 'Determine Regime',
        description: 'Classify design quality regime',
        transform: async (data) => {
          const regime = this.determineRegime(data.harmonyIndex!);
          return { ...data, regime };
        }
      })
      .addStep({
        name: 'Assess Complexity',
        description: 'Calculate Big-O complexity',
        transform: async (data) => {
          const complexity = this.assessComplexity(data.rawTelemetry.telemetry);
          return { ...data, complexity };
        },
        delay: HarmonicDelays.IMMEDIATE // No delay after final step
      });

    // Traverse the labyrinth
    const initialData: AnalysisData = {
      rawTelemetry,
      route
    };

    const labyrinthResult: LabyrinthResult<AnalysisData> = await labyrinth.traverse(initialData);
    const finalData = labyrinthResult.result;

    if (verbose) {
      console.log(`[Labyrinth Normalizer] Journey complete in ${labyrinthResult.totalDuration}ms`);
      console.log(`[Labyrinth Normalizer] Harmonic delay: ${labyrinthResult.totalHarmonicDelay.toFixed(2)}ms`);
      console.log(`[Labyrinth Normalizer] Execution time: ${(labyrinthResult.totalDuration - labyrinthResult.totalHarmonicDelay)}ms`);
    }

    // Build final normalized result
    return {
      id: `design-telemetry-${Date.now()}`,
      timestamp: Date.now(),
      route,
      telemetry: rawTelemetry.telemetry,
      metrics: {
        harmonyIndex: finalData.harmonyIndex!,
        breathabilityIndex: finalData.breathabilityIndex!,
        contrastScore: finalData.contrastScore!,
        hierarchyScore: finalData.hierarchyScore!,
        spacingScore: finalData.spacingScore!
      },
      asymmetrica: {
        regime: finalData.regime!,
        complexity: finalData.complexity!
      },
      labyrinthPath: labyrinthResult.path.map(p => ({
        step: p.step,
        duration: p.duration,
        harmonicDelay: p.harmonicDelay
      })),
      sacredTiming: labyrinthResult.sacredTiming
    };
  }

  /**
   * Compute Layout PHI (Golden Ratio adherence)
   * Checks if typography scale follows ratios like 1.618, 1.5, 1.414, 1.333, 1.25, 1.2
   */
  private computeLayoutPHI(typography: any[], spacing: any[]): number {
    if (typography.length < 2) return 0.5; // Neutral score

    // Known good ratios (GPT-5's specification)
    const goldenRatios = [1.618, 1.5, 1.414, 1.333, 1.25, 1.2];

    // Group typography by element type
    const headingSizes = typography
      .filter(t => /^h[1-6]$/.test(t.element))
      .map(t => t.fontSize)
      .sort((a, b) => b - a); // Largest first

    if (headingSizes.length < 2) return 0.5;

    // Calculate ratios between consecutive sizes
    const ratios: number[] = [];
    for (let i = 0; i < headingSizes.length - 1; i++) {
      const ratio = headingSizes[i] / headingSizes[i + 1];
      ratios.push(ratio);
    }

    // Check how many ratios are close to golden ratios (within 10%)
    let matchCount = 0;
    ratios.forEach(ratio => {
      const hasMatch = goldenRatios.some(golden =>
        Math.abs(ratio - golden) / golden < 0.1
      );
      if (hasMatch) matchCount++;
    });

    // PHI score: percentage of ratios matching golden ratios
    return ratios.length > 0 ? matchCount / ratios.length : 0.5;
  }

  /**
   * Compute contrast ratio: avgContrast / maxContrast
   */
  private computeContrastRatio(colors: any[]): number {
    const contrastValues = colors
      .filter(c => c.contrast && c.contrast > 0)
      .map(c => c.contrast);

    if (contrastValues.length === 0) return 0.5;

    const avgContrast = contrastValues.reduce((sum, c) => sum + c, 0) / contrastValues.length;
    const maxContrast = Math.max(...contrastValues);

    return maxContrast > 0 ? avgContrast / maxContrast : 0;
  }

  /**
   * Compute color clash penalty using LCH color harmony
   * GPT-5: hue separation 30-60°, chroma balance +15-30
   */
  private computeColorClashPenalty(colors: any[]): number {
    if (colors.length < 2) return 0;

    // Extract unique colors
    const uniqueColors = new Map<string, any>();
    colors.forEach(c => {
      const color = tinycolor(c.hex);
      const hex = color.toHexString();
      if (!uniqueColors.has(hex)) {
        uniqueColors.set(hex, {
          ...c,
          hsl: color.toHsl()
        });
      }
    });

    const colorArray = Array.from(uniqueColors.values());
    let clashCount = 0;

    // Check pairs of colors for clashing
    for (let i = 0; i < colorArray.length; i++) {
      for (let j = i + 1; j < colorArray.length; j++) {
        const color1 = colorArray[i].hsl;
        const color2 = colorArray[j].hsl;

        // Calculate hue separation
        const hueDelta = Math.abs(color1.h - color2.h);
        const hueDistance = Math.min(hueDelta, 360 - hueDelta);

        // Check chroma (saturation) balance
        const chromaDelta = Math.abs(color1.s - color2.s) * 100;

        // Clash conditions: hue too close (< 30°) or too far (> 60°) AND chroma unbalanced
        const hueClash = hueDistance < 30 || hueDistance > 60;
        const chromaClash = chromaDelta < 15 || chromaDelta > 30;

        if (hueClash && chromaClash) {
          clashCount++;
        }
      }
    }

    // Normalize penalty (0-1 scale)
    const maxPossibleClashes = (colorArray.length * (colorArray.length - 1)) / 2;
    return maxPossibleClashes > 0 ? clashCount / maxPossibleClashes : 0;
  }

  /**
   * Compute breathability index
   * GPT-5: padding/bounding box ≥ 0.35 desktop, ≥ 0.28 mobile
   */
  private computeBreathability(telemetry: any): number {
    const spacing = telemetry.spacing || [];
    const paddingValues = spacing
      .filter((s: any) => s.type === 'padding')
      .map((s: any) => s.value);

    if (paddingValues.length === 0) return 0.5;

    // Estimate bounding box size (simplified: use average padding * 4)
    const avgPadding = paddingValues.reduce((sum: number, v: number) => sum + v, 0) / paddingValues.length;
    const estimatedBoundingBox = avgPadding * 10; // Rough estimate

    // Breathability ratio
    const breathability = avgPadding / estimatedBoundingBox;

    // Target: 0.35 for desktop (we'll use desktop as baseline)
    const breathabilityScore = Math.min(1, breathability / 0.35);

    return breathabilityScore;
  }

  /**
   * Compute contrast score (0-100)
   */
  private computeContrastScore(colors: any[]): number {
    const contrastValues = colors
      .filter(c => c.contrast && c.contrast > 0)
      .map(c => c.contrast);

    if (contrastValues.length === 0) return 50;

    const avgContrast = contrastValues.reduce((sum, c) => sum + c, 0) / contrastValues.length;

    // WCAG AA: 4.5:1 for normal text
    // Score based on average contrast
    const score = Math.min(100, (avgContrast / 4.5) * 100);

    return score;
  }

  /**
   * Compute hierarchy score based on type scale
   */
  private computeHierarchyScore(typography: any[]): number {
    const headings = typography.filter(t => /^h[1-6]$/.test(t.element));

    if (headings.length < 2) return 50;

    // Calculate size deltas
    const sortedSizes = headings
      .map(h => h.fontSize)
      .sort((a, b) => b - a);

    let properDeltaCount = 0;
    for (let i = 0; i < sortedSizes.length - 1; i++) {
      const delta = (sortedSizes[i] - sortedSizes[i + 1]) / sortedSizes[i];
      // Proper hierarchy: at least 8% delta
      if (delta >= 0.08) properDeltaCount++;
    }

    const score = (properDeltaCount / (sortedSizes.length - 1)) * 100;
    return score;
  }

  /**
   * Compute spacing score based on grid compliance
   */
  private computeSpacingScore(spacing: any[]): number {
    if (spacing.length === 0) return 50;

    const gridScale = [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96, 128];

    const onGridCount = spacing.filter(s => {
      const value = s.value;
      return gridScale.some(grid => Math.abs(value - grid) <= 2);
    }).length;

    const score = (onGridCount / spacing.length) * 100;
    return score;
  }

  /**
   * Determine regime based on harmony index
   * GPT-5 guidance: exploration (<0.7), optimization (0.7-0.85), stabilization (>0.85)
   */
  private determineRegime(harmonyIndex: number): 'exploration' | 'optimization' | 'stabilization' {
    if (harmonyIndex < 70) {
      return 'exploration';
    } else if (harmonyIndex < 85) {
      return 'optimization';
    } else {
      return 'stabilization';
    }
  }

  /**
   * Assess complexity based on element count and color palette size
   */
  private assessComplexity(telemetry: any): string {
    const elementCount = telemetry.layoutMetrics?.totalElements || 0;
    const colorCount = new Set(telemetry.colors.map((c: any) => c.hex)).size;

    if (elementCount > 500 || colorCount > 20) {
      return 'O(n²)';
    } else if (elementCount > 200 || colorCount > 10) {
      return 'O(n log n)';
    } else {
      return 'O(n)';
    }
  }

  /**
   * Save baseline for future comparisons
   */
  saveBaseline(normalized: NormalizedDesignTelemetry, route: string) {
    const baselineDir = join(process.cwd(), 'tests/ux-sonar/baselines');

    try {
      mkdirSync(baselineDir, { recursive: true });
    } catch (e) {
      // Directory might already exist
    }

    const filename = route.replace(/\//g, '_') || 'root';
    const filepath = join(baselineDir, `design_${filename}.json`);

    writeFileSync(filepath, JSON.stringify(normalized, null, 2));
    console.log(`[Labyrinth Design Normalizer] Baseline saved: ${filepath}`);
  }

  /**
   * Load baseline for comparison
   */
  loadBaseline(route: string): NormalizedDesignTelemetry | null {
    const baselineDir = join(process.cwd(), 'tests/ux-sonar/baselines');
    const filename = route.replace(/\//g, '_') || 'root';
    const filepath = join(baselineDir, `design_${filename}.json`);

    try {
      const data = JSON.parse(readFileSync(filepath, 'utf-8'));
      console.log(`[Labyrinth Design Normalizer] Baseline loaded: ${filepath}`);
      return data;
    } catch (e) {
      console.log(`[Labyrinth Design Normalizer] No baseline found for ${route}`);
      return null;
    }
  }

  /**
   * Compare baselines
   */
  compareBaselines(current: NormalizedDesignTelemetry, baseline: NormalizedDesignTelemetry) {
    return {
      harmonyDelta: current.metrics.harmonyIndex - baseline.metrics.harmonyIndex,
      contrastDelta: current.metrics.contrastScore - baseline.metrics.contrastScore,
      hierarchyDelta: current.metrics.hierarchyScore - baseline.metrics.hierarchyScore,
      spacingDelta: current.metrics.spacingScore - baseline.metrics.spacingScore,
      regimeChange: current.asymmetrica.regime !== baseline.asymmetrica.regime
    };
  }
}

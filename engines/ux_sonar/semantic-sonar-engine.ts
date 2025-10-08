/**
 * SemanticRadarEngine - Architecture Quality Telemetry Collector
 * Captures cohesion, coupling, modularity, and architectural patterns
 * Based on GPT-5 Semantic Sonar specifications
 */

import { Project, SourceFile, SyntaxKind } from 'ts-morph';
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';
import { join, relative } from 'path';

const execAsync = promisify(exec);

export interface DependencyCycle {
  cycle: string[];
  length: number;
}

export interface CouplingMetric {
  module: string;
  fanIn: number;
  fanOut: number;
  couplingScore: number;
  zScore: number;
}

export interface GodModule {
  module: string;
  centrality: number;
  inboundDeps: number;
  outboundDeps: number;
  score: number;
}

export interface LayeringViolation {
  from: string;
  to: string;
  violationType: 'ui-to-db' | 'ui-to-infra' | 'domain-to-ui' | 'cross-layer';
  layer1: string;
  layer2: string;
}

export interface OrphanDomain {
  module: string;
  type: 'unused' | 'unreachable' | 'isolated';
  reason: string;
}

export interface SemanticTelemetry {
  cycles: DependencyCycle[];
  coupling: CouplingMetric[];
  godModules: GodModule[];
  layeringViolations: LayeringViolation[];
  orphanDomains: OrphanDomain[];
  metrics: {
    totalModules: number;
    avgCoupling: number;
    maxCoupling: number;
    avgCohesion: number;
    modularityIndex: number;
    architectureScore: number;
  };
}

export interface SemanticRadarResult {
  projectPath: string;
  duration: number;
  telemetry: SemanticTelemetry;
  timestamp: number;
}

export class SemanticRadarEngine {
  private project: Project | null = null;
  private telemetry: SemanticTelemetry = {
    cycles: [],
    coupling: [],
    godModules: [],
    layeringViolations: [],
    orphanDomains: [],
    metrics: {
      totalModules: 0,
      avgCoupling: 0,
      maxCoupling: 0,
      avgCohesion: 0,
      modularityIndex: 0,
      architectureScore: 0
    }
  };
  private startTime: number = 0;

  async initialize(projectPath: string) {
    console.log('[SemanticRadar] Initializing TypeScript project...');

    // Initialize ts-morph project
    this.project = new Project({
      tsConfigFilePath: join(projectPath, 'tsconfig.json'),
      skipAddingFilesFromTsConfig: false
    });

    console.log(`[SemanticRadar] Loaded ${this.project.getSourceFiles().length} source files`);
  }

  async pingFlow(projectPath: string): Promise<SemanticRadarResult> {
    this.startTime = Date.now();
    this.telemetry = {
      cycles: [],
      coupling: [],
      godModules: [],
      layeringViolations: [],
      orphanDomains: [],
      metrics: {
        totalModules: 0,
        avgCoupling: 0,
        maxCoupling: 0,
        avgCohesion: 0,
        modularityIndex: 0,
        architectureScore: 0
      }
    };

    if (!this.project) {
      await this.initialize(projectPath);
    }

    console.log('[SemanticRadar] Starting architecture analysis...');

    // PING: Collect architectural telemetry
    await this.detectCycles(projectPath);
    await this.computeCoupling();
    await this.findGodModules();
    await this.checkLayering();
    await this.findOrphanDomains();

    // Compute aggregate metrics
    this.computeMetrics();

    const duration = Date.now() - this.startTime;

    console.log('[SemanticRadar] Analysis complete!');

    return {
      projectPath,
      duration,
      telemetry: this.telemetry,
      timestamp: Date.now()
    };
  }

  /**
   * Detect circular dependencies using madge
   * Heuristic 1: Dependency cycles (module A↔B or longer loops)
   */
  async detectCycles(projectPath: string) {
    console.log('[SemanticRadar] Detecting dependency cycles...');

    try {
      // Run madge to detect circular dependencies
      const { stdout } = await execAsync(
        `npx madge --circular --json "${projectPath}"`,
        { cwd: projectPath, maxBuffer: 10 * 1024 * 1024 }
      );

      const result = JSON.parse(stdout || '[]');

      if (Array.isArray(result)) {
        this.telemetry.cycles = result.map((cycle: string[]) => ({
          cycle,
          length: cycle.length
        }));
      }

      console.log(`[SemanticRadar] Found ${this.telemetry.cycles.length} circular dependencies`);
    } catch (error) {
      console.log('[SemanticRadar] Cycle detection skipped or failed:', (error as any).message);
      this.telemetry.cycles = [];
    }
  }

  /**
   * Compute coupling metrics (fan-in/fan-out)
   * Heuristic 2: Excessive coupling (z-score > 2)
   */
  async computeCoupling() {
    if (!this.project) return;

    console.log('[SemanticRadar] Computing coupling metrics...');

    const sourceFiles = this.project.getSourceFiles();
    const moduleMap = new Map<string, { fanIn: Set<string>; fanOut: Set<string> }>();

    // Build dependency graph
    for (const sourceFile of sourceFiles) {
      const filePath = sourceFile.getFilePath();
      if (filePath.includes('node_modules')) continue;

      const modulePath = relative(process.cwd(), filePath);

      if (!moduleMap.has(modulePath)) {
        moduleMap.set(modulePath, { fanIn: new Set(), fanOut: new Set() });
      }

      // Get imports (fan-out)
      const imports = sourceFile.getImportDeclarations();
      for (const imp of imports) {
        const moduleSpecifier = imp.getModuleSpecifierValue();
        if (moduleSpecifier.startsWith('.') || moduleSpecifier.startsWith('/')) {
          // Resolve relative import
          const importedFile = sourceFile.getDirectory().getRelativePathAsModuleSpecifierTo(moduleSpecifier);
          moduleMap.get(modulePath)!.fanOut.add(importedFile);

          // Add fan-in to imported module
          if (!moduleMap.has(importedFile)) {
            moduleMap.set(importedFile, { fanIn: new Set(), fanOut: new Set() });
          }
          moduleMap.get(importedFile)!.fanIn.add(modulePath);
        }
      }
    }

    // Calculate coupling scores
    const couplingMetrics: CouplingMetric[] = [];
    for (const [module, { fanIn, fanOut }] of moduleMap) {
      const fanInCount = fanIn.size;
      const fanOutCount = fanOut.size;
      const couplingScore = fanInCount + fanOutCount;

      couplingMetrics.push({
        module,
        fanIn: fanInCount,
        fanOut: fanOutCount,
        couplingScore,
        zScore: 0 // Will be computed after we have all scores
      });
    }

    // Compute z-scores
    if (couplingMetrics.length > 0) {
      const mean = couplingMetrics.reduce((sum, m) => sum + m.couplingScore, 0) / couplingMetrics.length;
      const variance = couplingMetrics.reduce((sum, m) => sum + Math.pow(m.couplingScore - mean, 2), 0) / couplingMetrics.length;
      const stdDev = Math.sqrt(variance);

      couplingMetrics.forEach(m => {
        m.zScore = stdDev > 0 ? (m.couplingScore - mean) / stdDev : 0;
      });
    }

    this.telemetry.coupling = couplingMetrics;

    console.log(`[SemanticRadar] Analyzed coupling for ${couplingMetrics.length} modules`);
  }

  /**
   * Find god modules (high centrality)
   * Heuristic 3: God module (centrality way above mean)
   */
  async findGodModules() {
    console.log('[SemanticRadar] Finding god modules...');

    if (this.telemetry.coupling.length === 0) return;

    // Calculate centrality (fan-in + fan-out)
    const centralities = this.telemetry.coupling.map(c => ({
      module: c.module,
      centrality: c.fanIn + c.fanOut,
      inboundDeps: c.fanIn,
      outboundDeps: c.fanOut
    }));

    const meanCentrality = centralities.reduce((sum, c) => sum + c.centrality, 0) / centralities.length;

    // God modules: centrality > 2× mean
    const godModules = centralities
      .filter(c => c.centrality > meanCentrality * 2)
      .map(c => ({
        ...c,
        score: c.centrality / meanCentrality
      }));

    this.telemetry.godModules = godModules;

    console.log(`[SemanticRadar] Found ${godModules.length} god modules`);
  }

  /**
   * Check architectural layering violations
   * Heuristic 4: Anti-layering (UI imports infra/db directly)
   */
  async checkLayering() {
    if (!this.project) return;

    console.log('[SemanticRadar] Checking layering violations...');

    const sourceFiles = this.project.getSourceFiles();
    const violations: LayeringViolation[] = [];

    // Define layer patterns
    const layers = {
      ui: /\/(components|pages|views|ui)\//,
      domain: /\/(domain|models|entities|business)\//,
      application: /\/(services|use-cases|application)\//,
      infrastructure: /\/(infra|infrastructure|db|database|api)\//
    };

    // Forbidden dependencies (higher layer → lower layer)
    const forbiddenDeps = [
      { from: 'ui', to: 'infrastructure', type: 'ui-to-infra' as const },
      { from: 'ui', to: 'database', type: 'ui-to-db' as const },
      { from: 'domain', to: 'ui', type: 'domain-to-ui' as const }
    ];

    for (const sourceFile of sourceFiles) {
      const filePath = sourceFile.getFilePath();
      if (filePath.includes('node_modules')) continue;

      const modulePath = relative(process.cwd(), filePath);
      const fromLayer = this.getLayer(modulePath, layers);

      const imports = sourceFile.getImportDeclarations();
      for (const imp of imports) {
        const moduleSpecifier = imp.getModuleSpecifierValue();
        if (moduleSpecifier.startsWith('.') || moduleSpecifier.startsWith('/')) {
          const toLayer = this.getLayer(moduleSpecifier, layers);

          // Check for violations
          const violation = forbiddenDeps.find(fd => fd.from === fromLayer && fd.to === toLayer);
          if (violation) {
            violations.push({
              from: modulePath,
              to: moduleSpecifier,
              violationType: violation.type,
              layer1: fromLayer || 'unknown',
              layer2: toLayer || 'unknown'
            });
          }
        }
      }
    }

    this.telemetry.layeringViolations = violations;

    console.log(`[SemanticRadar] Found ${violations.length} layering violations`);
  }

  /**
   * Get layer from file path
   */
  private getLayer(path: string, layers: { [key: string]: RegExp }): string | null {
    for (const [layer, pattern] of Object.entries(layers)) {
      if (pattern.test(path)) return layer;
    }
    return null;
  }

  /**
   * Find orphan domains (unused or unreachable)
   * Heuristic 5: Orphan domain (bounded context unused or unreachable)
   */
  async findOrphanDomains() {
    if (!this.project) return;

    console.log('[SemanticRadar] Finding orphan domains...');

    const sourceFiles = this.project.getSourceFiles();
    const orphans: OrphanDomain[] = [];

    // Find modules with zero fan-in (not imported by anyone)
    const unusedModules = this.telemetry.coupling.filter(c => c.fanIn === 0);

    for (const module of unusedModules) {
      // Check if it's an entry point (main.ts, index.ts, etc.)
      const isEntryPoint = /\/(main|index|app)\.(ts|tsx|js|jsx)$/.test(module.module);

      if (!isEntryPoint) {
        orphans.push({
          module: module.module,
          type: 'unused',
          reason: 'No imports found (zero fan-in)'
        });
      }
    }

    // Find isolated modules (zero fan-in AND zero fan-out)
    const isolatedModules = this.telemetry.coupling.filter(c => c.fanIn === 0 && c.fanOut === 0);

    for (const module of isolatedModules) {
      if (!orphans.some(o => o.module === module.module)) {
        orphans.push({
          module: module.module,
          type: 'isolated',
          reason: 'No dependencies in either direction'
        });
      }
    }

    this.telemetry.orphanDomains = orphans;

    console.log(`[SemanticRadar] Found ${orphans.length} orphan domains`);
  }

  /**
   * Compute aggregate metrics
   */
  private computeMetrics() {
    const couplingValues = this.telemetry.coupling.map(c => c.couplingScore);
    const totalModules = this.telemetry.coupling.length;

    const avgCoupling = couplingValues.length > 0
      ? couplingValues.reduce((sum, c) => sum + c, 0) / couplingValues.length
      : 0;

    const maxCoupling = couplingValues.length > 0
      ? Math.max(...couplingValues)
      : 0;

    // Compute cohesion (inverse of coupling)
    const avgCohesion = avgCoupling > 0 ? 1 / (1 + avgCoupling / 10) : 0.5;

    // Compute modularity index (0-1)
    // High modularity = low coupling, few cycles, clean layering
    const cyclesPenalty = Math.min(0.3, this.telemetry.cycles.length * 0.05);
    const layeringPenalty = Math.min(0.2, this.telemetry.layeringViolations.length * 0.02);
    const orphansPenalty = Math.min(0.1, this.telemetry.orphanDomains.length * 0.01);
    const couplingPenalty = Math.min(0.4, avgCoupling * 0.05);

    const modularityIndex = Math.max(0, 1 - cyclesPenalty - layeringPenalty - orphansPenalty - couplingPenalty);

    // Compute architecture score (0-100)
    const architectureScore = Math.round(modularityIndex * 100);

    this.telemetry.metrics = {
      totalModules,
      avgCoupling: Math.round(avgCoupling * 10) / 10,
      maxCoupling,
      avgCohesion: Math.round(avgCohesion * 100) / 100,
      modularityIndex: Math.round(modularityIndex * 100) / 100,
      architectureScore
    };
  }

  async cleanup() {
    this.project = null;
    this.telemetry = {
      cycles: [],
      coupling: [],
      godModules: [],
      layeringViolations: [],
      orphanDomains: [],
      metrics: {
        totalModules: 0,
        avgCoupling: 0,
        maxCoupling: 0,
        avgCohesion: 0,
        modularityIndex: 0,
        architectureScore: 0
      }
    };
  }
}

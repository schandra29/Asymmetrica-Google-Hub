/**
 * CodeRadarEngine - Code Quality Telemetry Collector
 * Captures complexity, duplication, and maintainability metrics
 * Based on GPT-5 Code Sonar specifications
 */

import { Project, SourceFile, SyntaxKind, Node } from 'ts-morph';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface CodeComplexityPoint {
  file: string;
  function: string;
  complexity: number;
  lines: number;
  startLine: number;
  endLine: number;
}

export interface DuplicationBlock {
  file1: string;
  file2: string;
  lines: number;
  startLine1: number;
  startLine2: number;
  code: string;
}

export interface DeadCodePoint {
  file: string;
  type: 'unused-export' | 'unreachable-code' | 'unused-import';
  identifier: string;
  line: number;
}

export interface BundleInfo {
  file: string;
  sizeBytes: number;
  sizeGzip: number;
  lines: number;
}

export interface CodeTelemetry {
  complexity: CodeComplexityPoint[];
  duplication: DuplicationBlock[];
  deadCode: DeadCodePoint[];
  bundles: BundleInfo[];
  lintViolations: {
    critical: number;
    warning: number;
    info: number;
  };
  metrics: {
    totalFiles: number;
    totalLines: number;
    avgComplexity: number;
    maxComplexity: number;
    duplicationRatio: number;
  };
}

export interface CodeRadarResult {
  projectPath: string;
  duration: number;
  telemetry: CodeTelemetry;
  timestamp: number;
}

export class CodeRadarEngine {
  private project: Project | null = null;
  private telemetry: CodeTelemetry = {
    complexity: [],
    duplication: [],
    deadCode: [],
    bundles: [],
    lintViolations: { critical: 0, warning: 0, info: 0 },
    metrics: {
      totalFiles: 0,
      totalLines: 0,
      avgComplexity: 0,
      maxComplexity: 0,
      duplicationRatio: 0
    }
  };
  private startTime: number = 0;

  async initialize(projectPath: string) {
    console.log('[CodeRadar] Initializing TypeScript project...');

    // Initialize ts-morph project
    this.project = new Project({
      tsConfigFilePath: join(projectPath, 'tsconfig.json'),
      skipAddingFilesFromTsConfig: false
    });

    console.log(`[CodeRadar] Loaded ${this.project.getSourceFiles().length} source files`);
  }

  async pingFlow(projectPath: string): Promise<CodeRadarResult> {
    this.startTime = Date.now();
    this.telemetry = {
      complexity: [],
      duplication: [],
      deadCode: [],
      bundles: [],
      lintViolations: { critical: 0, warning: 0, info: 0 },
      metrics: {
        totalFiles: 0,
        totalLines: 0,
        avgComplexity: 0,
        maxComplexity: 0,
        duplicationRatio: 0
      }
    };

    if (!this.project) {
      await this.initialize(projectPath);
    }

    console.log('[CodeRadar] Starting code analysis...');

    // PING: Collect telemetry
    await this.computeComplexity();
    await this.detectDuplication(projectPath);
    await this.analyzeBundles(projectPath);
    await this.findDeadCode();

    // Compute aggregate metrics
    this.computeMetrics();

    const duration = Date.now() - this.startTime;

    console.log('[CodeRadar] Analysis complete!');

    return {
      projectPath,
      duration,
      telemetry: this.telemetry,
      timestamp: Date.now()
    };
  }

  /**
   * Compute cyclomatic complexity for all functions
   * Formula: CC = E - N + 2P (edges - nodes + 2*connected_components)
   * Simplified: Count decision points + 1
   */
  async computeComplexity() {
    if (!this.project) return;

    console.log('[CodeRadar] Computing cyclomatic complexity...');

    const sourceFiles = this.project.getSourceFiles();

    for (const sourceFile of sourceFiles) {
      // Skip node_modules and test files
      const filePath = sourceFile.getFilePath();
      if (filePath.includes('node_modules') || filePath.includes('.spec.') || filePath.includes('.test.')) {
        continue;
      }

      // Find all function declarations, arrow functions, method declarations
      const functions = [
        ...sourceFile.getDescendantsOfKind(SyntaxKind.FunctionDeclaration),
        ...sourceFile.getDescendantsOfKind(SyntaxKind.ArrowFunction),
        ...sourceFile.getDescendantsOfKind(SyntaxKind.MethodDeclaration),
        ...sourceFile.getDescendantsOfKind(SyntaxKind.FunctionExpression)
      ];

      for (const fn of functions) {
        const complexity = this.calculateCyclomaticComplexity(fn);
        const name = this.getFunctionName(fn);
        const startLine = fn.getStartLineNumber();
        const endLine = fn.getEndLineNumber();
        const lines = endLine - startLine + 1;

        this.telemetry.complexity.push({
          file: relative(process.cwd(), filePath),
          function: name,
          complexity,
          lines,
          startLine,
          endLine
        });
      }
    }

    console.log(`[CodeRadar] Analyzed ${this.telemetry.complexity.length} functions`);
  }

  /**
   * Calculate cyclomatic complexity by counting decision points
   * CC = 1 + (if + while + for + case + catch + && + || + ?)
   */
  private calculateCyclomaticComplexity(node: Node): number {
    let complexity = 1; // Base complexity

    const countDecisionPoints = (n: Node) => {
      const kind = n.getKind();

      // Control flow statements
      if (kind === SyntaxKind.IfStatement) complexity++;
      else if (kind === SyntaxKind.WhileStatement) complexity++;
      else if (kind === SyntaxKind.ForStatement) complexity++;
      else if (kind === SyntaxKind.ForInStatement) complexity++;
      else if (kind === SyntaxKind.ForOfStatement) complexity++;
      else if (kind === SyntaxKind.DoStatement) complexity++;
      else if (kind === SyntaxKind.CaseClause) complexity++;
      else if (kind === SyntaxKind.CatchClause) complexity++;
      else if (kind === SyntaxKind.ConditionalExpression) complexity++; // Ternary ?:

      // Logical operators (short-circuit evaluation)
      else if (kind === SyntaxKind.AmpersandAmpersandToken) complexity++; // &&
      else if (kind === SyntaxKind.BarBarToken) complexity++; // ||

      // Recursively count in children
      n.getChildren().forEach(countDecisionPoints);
    };

    countDecisionPoints(node);

    return complexity;
  }

  /**
   * Get function name (handles anonymous functions)
   */
  private getFunctionName(fn: Node): string {
    if (Node.isFunctionDeclaration(fn) || Node.isMethodDeclaration(fn)) {
      return fn.getName() || '<anonymous>';
    } else if (Node.isArrowFunction(fn) || Node.isFunctionExpression(fn)) {
      // Try to get variable name for arrow functions
      const parent = fn.getParent();
      if (Node.isVariableDeclaration(parent)) {
        return parent.getName();
      } else if (Node.isPropertyAssignment(parent)) {
        return parent.getName();
      }
      return '<arrow>';
    }
    return '<unknown>';
  }

  /**
   * Detect code duplication using jscpd
   * Threshold: >= 30 lines in 2+ places
   */
  async detectDuplication(projectPath: string) {
    console.log('[CodeRadar] Detecting code duplication...');

    try {
      // Run jscpd to detect duplicates
      const { stdout } = await execAsync(
        `npx jscpd "${projectPath}" --min-lines 30 --min-tokens 70 --format json --reporters json --ignore "node_modules/**,dist/**,build/**,.next/**" --mode strict`,
        { cwd: projectPath, maxBuffer: 10 * 1024 * 1024 }
      );

      // Parse jscpd output
      const result = JSON.parse(stdout || '{}');

      if (result.duplicates && Array.isArray(result.duplicates)) {
        this.telemetry.duplication = result.duplicates.map((dup: any) => ({
          file1: relative(process.cwd(), dup.firstFile?.name || ''),
          file2: relative(process.cwd(), dup.secondFile?.name || ''),
          lines: dup.lines || 0,
          startLine1: dup.firstFile?.start || 0,
          startLine2: dup.secondFile?.start || 0,
          code: dup.fragment || ''
        }));
      }

      console.log(`[CodeRadar] Found ${this.telemetry.duplication.length} duplication blocks`);
    } catch (error) {
      // jscpd might exit with non-zero if duplicates found, or might not be installed
      console.log('[CodeRadar] Duplication detection skipped or failed:', (error as any).message);
      this.telemetry.duplication = [];
    }
  }

  /**
   * Analyze bundle sizes
   * Check for route chunks > 250 KB gzip
   */
  async analyzeBundles(projectPath: string) {
    console.log('[CodeRadar] Analyzing bundle sizes...');

    // Look for common build output directories
    const buildDirs = ['.next', 'dist', 'build', 'out'];

    for (const dir of buildDirs) {
      const buildPath = join(projectPath, dir);
      if (existsSync(buildPath)) {
        this.scanBundleDirectory(buildPath, projectPath);
        break; // Only analyze first found build directory
      }
    }

    console.log(`[CodeRadar] Analyzed ${this.telemetry.bundles.length} bundles`);
  }

  /**
   * Recursively scan build directory for JS bundles
   */
  private scanBundleDirectory(dirPath: string, basePath: string) {
    const entries = readdirSync(dirPath);

    for (const entry of entries) {
      const fullPath = join(dirPath, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        this.scanBundleDirectory(fullPath, basePath);
      } else if (entry.endsWith('.js') && !entry.endsWith('.map')) {
        const sizeBytes = stat.size;
        const content = readFileSync(fullPath, 'utf-8');
        const lines = content.split('\n').length;

        // Estimate gzip size (roughly 1/3 of original for JS)
        const sizeGzip = Math.round(sizeBytes / 3);

        this.telemetry.bundles.push({
          file: relative(basePath, fullPath),
          sizeBytes,
          sizeGzip,
          lines
        });
      }
    }
  }

  /**
   * Find dead code (unused exports, unreachable code)
   */
  async findDeadCode() {
    if (!this.project) return;

    console.log('[CodeRadar] Finding dead code...');

    const sourceFiles = this.project.getSourceFiles();

    for (const sourceFile of sourceFiles) {
      const filePath = sourceFile.getFilePath();
      if (filePath.includes('node_modules')) continue;

      // Find unused exports (exports never imported elsewhere)
      const exports = sourceFile.getExportedDeclarations();

      for (const [name, declarations] of exports) {
        // Check if this export is used anywhere
        const usages = this.project.getSourceFiles()
          .filter(sf => sf !== sourceFile)
          .some(sf => {
            const imports = sf.getImportDeclarations();
            return imports.some(imp => {
              const namedImports = imp.getNamedImports();
              return namedImports.some(ni => ni.getName() === name);
            });
          });

        if (!usages && declarations.length > 0) {
          const decl = declarations[0];
          this.telemetry.deadCode.push({
            file: relative(process.cwd(), filePath),
            type: 'unused-export',
            identifier: name,
            line: decl.getStartLineNumber()
          });
        }
      }
    }

    console.log(`[CodeRadar] Found ${this.telemetry.deadCode.length} dead code instances`);
  }

  /**
   * Compute aggregate metrics
   */
  private computeMetrics() {
    const complexityValues = this.telemetry.complexity.map(c => c.complexity);
    const totalLines = this.telemetry.complexity.reduce((sum, c) => sum + c.lines, 0);

    this.telemetry.metrics = {
      totalFiles: new Set(this.telemetry.complexity.map(c => c.file)).size,
      totalLines,
      avgComplexity: complexityValues.length > 0
        ? complexityValues.reduce((sum, c) => sum + c, 0) / complexityValues.length
        : 0,
      maxComplexity: complexityValues.length > 0
        ? Math.max(...complexityValues)
        : 0,
      duplicationRatio: totalLines > 0
        ? this.telemetry.duplication.reduce((sum, d) => sum + d.lines, 0) / totalLines
        : 0
    };
  }

  async cleanup() {
    this.project = null;
    this.telemetry = {
      complexity: [],
      duplication: [],
      deadCode: [],
      bundles: [],
      lintViolations: { critical: 0, warning: 0, info: 0 },
      metrics: {
        totalFiles: 0,
        totalLines: 0,
        avgComplexity: 0,
        maxComplexity: 0,
        duplicationRatio: 0
      }
    };
  }
}

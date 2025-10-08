/**
 * Code Sonar Heuristics Engine
 * Implements GPT-5's Top 5 Code Quality Heuristics
 * Based on empirical research: CC correlates r=0.72 with bugs (ArXiv 2019)
 */

interface CodeHeuristic {
  name: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  suggestion: string;
  affectedItems?: string[];
}

interface HeuristicResult {
  heuristic: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  suggestion: string;
  affectedItems?: string[];
  codeExample?: string;
}

export class CodeHeuristicsEngine {

  /**
   * Analyze code telemetry against all 5 heuristics
   */
  analyze(telemetry: any): HeuristicResult[] {
    const issues: HeuristicResult[] = [];

    // 1. Cyclomatic Complexity High (fn > 10, file > 50)
    const complexityIssues = this.checkCyclomaticComplexity(telemetry.complexity);
    if (complexityIssues) issues.push(complexityIssues);

    // 2. Duplication Block (>= 30 lines in 2+ places)
    const duplicationIssues = this.checkDuplication(telemetry.duplication);
    if (duplicationIssues) issues.push(duplicationIssues);

    // 3. Bundle Bloat (route chunk > 250 KB gzip)
    const bundleIssues = this.checkBundleBloat(telemetry.bundles);
    if (bundleIssues) issues.push(bundleIssues);

    // 4. Dead Code (unused exports, unreachable branches)
    const deadCodeIssues = this.checkDeadCode(telemetry.deadCode);
    if (deadCodeIssues) issues.push(deadCodeIssues);

    // 5. Lint Violations Critical (a11y/aria, security, perf rules)
    const lintIssues = this.checkLintViolations(telemetry.lintViolations);
    if (lintIssues) issues.push(lintIssues);

    return issues;
  }

  /**
   * Heuristic 1: Cyclomatic Complexity High
   * Research: CC correlates r=0.72 with bugs, density jumps 2.5x per 10 CC points
   * Threshold: Function > 10, File average > 50
   */
  private checkCyclomaticComplexity(complexity: any[]): HeuristicResult | null {
    // Check for high-complexity functions (> 10)
    const highComplexityFunctions = complexity.filter(c => c.complexity > 10);

    // Check for files with average complexity > 50
    const fileComplexity = new Map<string, number[]>();
    complexity.forEach(c => {
      if (!fileComplexity.has(c.file)) {
        fileComplexity.set(c.file, []);
      }
      fileComplexity.get(c.file)!.push(c.complexity);
    });

    const highComplexityFiles = Array.from(fileComplexity.entries())
      .filter(([file, complexities]) => {
        const avg = complexities.reduce((sum, c) => sum + c, 0) / complexities.length;
        return avg > 50;
      })
      .map(([file]) => file);

    const totalIssues = highComplexityFunctions.length + highComplexityFiles.length;

    if (totalIssues === 0) return null;

    const affectedItems = [
      ...highComplexityFunctions.slice(0, 5).map(f =>
        `${f.file}::${f.function} (CC: ${f.complexity}, lines: ${f.lines})`
      ),
      ...highComplexityFiles.slice(0, 3).map(file =>
        `${file} (avg CC: ${Math.round(fileComplexity.get(file)!.reduce((sum, c) => sum + c, 0) / fileComplexity.get(file)!.length)})`
      )
    ];

    return {
      heuristic: 'cyclomatic-complexity-high',
      severity: 'critical',
      message: `Found ${highComplexityFunctions.length} high-complexity functions (CC > 10) and ${highComplexityFiles.length} complex files (avg CC > 50). Bug density increases 2.5× per 10 CC points.`,
      suggestion: 'Refactor complex functions into smaller, single-responsibility functions. Extract nested logic into helper functions. Target CC < 10 for all functions.',
      affectedItems,
      codeExample: this.generateCodeExample('cyclomatic-complexity-high', highComplexityFunctions[0])
    };
  }

  /**
   * Heuristic 2: Duplication Block
   * Threshold: >= 30 lines duplicated in 2+ places
   */
  private checkDuplication(duplication: any[]): HeuristicResult | null {
    if (duplication.length === 0) return null;

    const totalDuplicatedLines = duplication.reduce((sum, d) => sum + d.lines, 0);

    const affectedItems = duplication.slice(0, 5).map(d =>
      `${d.file1}:${d.startLine1} ↔ ${d.file2}:${d.startLine2} (${d.lines} lines)`
    );

    return {
      heuristic: 'duplication-block',
      severity: 'warning',
      message: `Found ${duplication.length} duplication blocks totaling ${totalDuplicatedLines} lines. Duplicated code increases maintenance burden and bug propagation.`,
      suggestion: 'Extract duplicated code into reusable functions or modules. Consider using inheritance, composition, or utility functions to eliminate duplication.',
      affectedItems,
      codeExample: this.generateCodeExample('duplication-block', duplication[0])
    };
  }

  /**
   * Heuristic 3: Bundle Bloat
   * Threshold: Route chunk > 250 KB gzip
   */
  private checkBundleBloat(bundles: any[]): HeuristicResult | null {
    const bloatedBundles = bundles.filter(b => b.sizeGzip > 250 * 1024); // 250 KB

    if (bloatedBundles.length === 0) return null;

    const affectedItems = bloatedBundles.slice(0, 5).map(b =>
      `${b.file} (${Math.round(b.sizeGzip / 1024)} KB gzip, ${b.lines.toLocaleString()} lines)`
    );

    return {
      heuristic: 'bundle-bloat',
      severity: 'warning',
      message: `Found ${bloatedBundles.length} bundles exceeding 250 KB gzip. Large bundles slow initial page load and hurt performance metrics.`,
      suggestion: 'Implement code splitting, lazy loading, and dynamic imports. Remove unused dependencies. Use tree-shaking and minification. Consider route-based chunking.',
      affectedItems,
      codeExample: this.generateCodeExample('bundle-bloat')
    };
  }

  /**
   * Heuristic 4: Dead Code
   * Types: unused exports, unreachable branches
   */
  private checkDeadCode(deadCode: any[]): HeuristicResult | null {
    if (deadCode.length === 0) return null;

    const byType = {
      'unused-export': deadCode.filter(d => d.type === 'unused-export').length,
      'unreachable-code': deadCode.filter(d => d.type === 'unreachable-code').length,
      'unused-import': deadCode.filter(d => d.type === 'unused-import').length
    };

    const affectedItems = deadCode.slice(0, 10).map(d =>
      `${d.file}:${d.line} - ${d.type}: ${d.identifier}`
    );

    return {
      heuristic: 'dead-code',
      severity: 'info',
      message: `Found ${deadCode.length} dead code instances (${byType['unused-export']} unused exports, ${byType['unreachable-code']} unreachable code, ${byType['unused-import']} unused imports). Dead code bloats bundle size.`,
      suggestion: 'Remove unused exports and imports. Delete unreachable code branches. Use ESLint rules like no-unused-vars and no-unreachable to prevent accumulation.',
      affectedItems,
      codeExample: this.generateCodeExample('dead-code', deadCode[0])
    };
  }

  /**
   * Heuristic 5: Lint Violations Critical
   * Focus: a11y/aria, security, performance rules
   */
  private checkLintViolations(lintViolations: any): HeuristicResult | null {
    const { critical, warning, info } = lintViolations;

    if (critical === 0 && warning === 0) return null;

    const severity: 'critical' | 'warning' | 'info' = critical > 0 ? 'critical' : 'warning';

    return {
      heuristic: 'lint-violations-critical',
      severity,
      message: `Found ${critical} critical and ${warning} warning lint violations. Focus areas: accessibility, security, performance.`,
      suggestion: 'Run ESLint with a11y, security, and performance plugins. Fix critical violations immediately. Configure pre-commit hooks to prevent new violations.',
      affectedItems: [
        `Critical: ${critical}`,
        `Warning: ${warning}`,
        `Info: ${info}`
      ],
      codeExample: this.generateCodeExample('lint-violations-critical')
    };
  }

  /**
   * Generate code examples for each heuristic
   */
  generateCodeExample(heuristic: string, data?: any): string {
    const examples: { [key: string]: string } = {
      'cyclomatic-complexity-high': `/* Instead of complex nested logic: */
function processOrder(order) {
  if (order.status === 'pending') {
    if (order.items.length > 0) {
      for (const item of order.items) {
        if (item.inStock) {
          if (item.price > 0) {
            // 20+ lines of processing... ❌ CC = 15+
          }
        }
      }
    }
  }
}

/* Refactor into smaller functions: */
function processOrder(order) {
  if (!canProcess(order)) return;

  const validItems = getValidItems(order);
  validItems.forEach(processItem); // ✅ CC = 2
}

function canProcess(order) {
  return order.status === 'pending' && order.items.length > 0; // ✅ CC = 2
}

function getValidItems(order) {
  return order.items.filter(item => item.inStock && item.price > 0); // ✅ CC = 2
}`,

      'duplication-block': `/* Instead of duplicated validation: */
// File 1:
if (!user.email || !user.email.includes('@')) {
  throw new Error('Invalid email');
}
if (user.password.length < 8) {
  throw new Error('Password too short');
}

// File 2: (same 30+ lines duplicated) ❌

/* Extract into reusable validator: */
// validators.ts
export function validateUser(user) {
  if (!user.email?.includes('@')) {
    throw new Error('Invalid email');
  }
  if (user.password.length < 8) {
    throw new Error('Password too short');
  }
} // ✅ Single source of truth`,

      'bundle-bloat': `/* Instead of importing entire library: */
import _ from 'lodash'; // ❌ 70 KB gzipped

export function getUnique(arr) {
  return _.uniq(arr);
}

/* Use specific imports or native methods: */
import { uniq } from 'lodash-es'; // ✅ Tree-shakeable
// OR
export function getUnique(arr) {
  return [...new Set(arr)]; // ✅ Native, 0 KB
}

/* For route-based code splitting: */
// Instead of:
import HeavyComponent from './HeavyComponent'; // ❌ Always loaded

// Use dynamic import:
const HeavyComponent = lazy(() => import('./HeavyComponent')); // ✅ Lazy loaded`,

      'dead-code': `/* Instead of unused exports: */
export function usedFunction() { /* ... */ }
export function unusedFunction() { /* ... */ } // ❌ Never imported

export const USED_CONSTANT = 'value';
export const UNUSED_CONSTANT = 'value'; // ❌ Never imported

/* Remove unused code: */
export function usedFunction() { /* ... */ } // ✅
export const USED_CONSTANT = 'value'; // ✅

// Delete unusedFunction and UNUSED_CONSTANT`,

      'lint-violations-critical': `/* Instead of missing accessibility: */
<button onClick={handleClick}>
  <img src="icon.svg" /> {/* ❌ No alt text */}
</button>

<div onClick={handleClick}> {/* ❌ Not keyboard accessible */}
  Click me
</div>

/* Add proper accessibility: */
<button onClick={handleClick} aria-label="Submit form">
  <img src="icon.svg" alt="Submit icon" /> {/* ✅ Alt text */}
</button>

<button onClick={handleClick}> {/* ✅ Semantic HTML */}
  Click me
</button>

/* Configure ESLint: */
// .eslintrc.js
{
  extends: [
    'plugin:jsx-a11y/recommended',
    'plugin:security/recommended'
  ]
}`
    };

    return examples[heuristic] || '// No code example available';
  }

  /**
   * Generate praise signals for good code quality
   */
  generatePraise(telemetry: any): string[] {
    const praise: string[] = [];

    // Low complexity
    const avgComplexity = telemetry.metrics.avgComplexity;
    if (avgComplexity < 5) {
      praise.push(`✅ Excellent code complexity! Average CC: ${avgComplexity.toFixed(1)} (target: < 10)`);
    }

    // No duplication
    if (telemetry.duplication.length === 0) {
      praise.push('✅ Zero code duplication detected! DRY principle upheld.');
    }

    // Small bundles
    const largeBundles = telemetry.bundles.filter((b: any) => b.sizeGzip > 250 * 1024);
    if (telemetry.bundles.length > 0 && largeBundles.length === 0) {
      praise.push(`✅ All bundles under 250 KB gzip! Excellent bundle optimization.`);
    }

    // Minimal dead code
    if (telemetry.deadCode.length < 5) {
      praise.push('✅ Minimal dead code detected! Clean codebase.');
    }

    // No critical lint violations
    if (telemetry.lintViolations.critical === 0) {
      praise.push('✅ Zero critical lint violations! High code quality standards.');
    }

    return praise;
  }
}

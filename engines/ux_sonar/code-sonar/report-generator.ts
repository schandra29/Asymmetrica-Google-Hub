/**
 * Code Sonar Report Generator
 * Generates markdown reports with complexity metrics, duplication clusters, and refactoring recommendations
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

export class CodeReportGenerator {

  /**
   * Generate comprehensive markdown report
   */
  generateReport(
    normalized: any,
    heuristics: any[],
    critique: any,
    projectPath: string
  ): string {
    const sections: string[] = [];

    // Header
    sections.push(this.generateHeader(normalized, projectPath));

    // Executive Summary
    sections.push(critique.summary);

    // Praise Signals
    if (critique.praise.length > 0) {
      sections.push(this.generatePraiseSection(critique.praise));
    }

    // Quality Metrics Dashboard
    sections.push(this.generateMetricsDashboard(normalized));

    // Heuristic Violations
    if (heuristics.length > 0) {
      sections.push(this.generateHeuristicsSection(heuristics));
    }

    // Complexity Analysis
    sections.push(this.generateComplexitySection(normalized.telemetry));

    // Duplication Clusters
    if (normalized.telemetry.duplication.length > 0) {
      sections.push(this.generateDuplicationSection(normalized.telemetry.duplication));
    }

    // Bundle Analysis
    if (normalized.telemetry.bundles.length > 0) {
      sections.push(this.generateBundleSection(normalized.telemetry.bundles));
    }

    // Dead Code Report
    if (normalized.telemetry.deadCode.length > 0) {
      sections.push(this.generateDeadCodeSection(normalized.telemetry.deadCode));
    }

    // Refactoring Roadmap
    sections.push(this.generateRoadmapSection(critique.refactoringRoadmap));

    // Quality Gates
    sections.push(this.generateQualityGatesSection(normalized));

    // Footer
    sections.push(this.generateFooter());

    return sections.join('\n\n---\n\n');
  }

  /**
   * Generate report header
   */
  private generateHeader(normalized: any, projectPath: string): string {
    const date = new Date(normalized.timestamp).toLocaleString();
    const projectName = projectPath.split(/[/\\]/).pop() || 'Unknown Project';

    return `# 💻 Code Sonar Report

**Project:** ${projectName}
**Analyzed:** ${date}
**Regime:** ${normalized.asymmetrica.regime.toUpperCase()}
**Complexity:** ${normalized.asymmetrica.complexity}
`;
  }

  /**
   * Generate praise section
   */
  private generatePraiseSection(praise: string[]): string {
    return `## 🎉 Praise Signals

${praise.map(p => `- ${p}`).join('\n')}`;
  }

  /**
   * Generate metrics dashboard
   */
  private generateMetricsDashboard(normalized: any): string {
    const metrics = normalized.metrics;

    return `## 📊 Quality Metrics Dashboard

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| **Bug Density** | ${metrics.bugDensity.toFixed(3)} bugs/LOC | < 0.05 | ${metrics.bugDensity < 0.05 ? '✅ PASS' : '❌ FAIL'} |
| **Maintainability Index** | ${metrics.maintainabilityIndex}/100 | > 65 | ${metrics.maintainabilityIndex > 65 ? '✅ PASS' : '❌ FAIL'} |
| **Cohesion Score** | ${(metrics.cohesionScore * 100).toFixed(0)}% | > 70% | ${metrics.cohesionScore > 0.7 ? '✅ PASS' : '❌ FAIL'} |
| **Complexity Score** | ${metrics.complexityScore}/100 | > 70 | ${metrics.complexityScore > 70 ? '✅ PASS' : '❌ FAIL'} |
| **Duplication Score** | ${metrics.duplicationScore}/100 | > 85 | ${metrics.duplicationScore > 85 ? '✅ PASS' : '❌ FAIL'} |

**Formula Reference:**
- Bug Density = (CC^1.2 × duplicationRatio) / cohesionScore
- Research: CC correlates r=0.72 with bugs (ArXiv 2019)
- Cohesion reduces bug risk by 40%
`;
  }

  /**
   * Generate heuristics violations section
   */
  private generateHeuristicsSection(heuristics: any[]): string {
    let section = `## 🔍 Heuristic Violations\n\n`;

    heuristics.forEach((h, index) => {
      const severityEmoji = h.severity === 'critical' ? '🔴' : h.severity === 'warning' ? '⚠️' : 'ℹ️';

      section += `### ${index + 1}. ${severityEmoji} ${h.heuristic}\n\n`;
      section += `**Severity:** ${h.severity.toUpperCase()}\n\n`;
      section += `**Issue:** ${h.message}\n\n`;
      section += `**Suggestion:** ${h.suggestion}\n\n`;

      if (h.affectedItems && h.affectedItems.length > 0) {
        section += `**Affected Items:**\n`;
        h.affectedItems.slice(0, 10).forEach((item: string) => {
          section += `- \`${item}\`\n`;
        });
        if (h.affectedItems.length > 10) {
          section += `- ... and ${h.affectedItems.length - 10} more\n`;
        }
        section += '\n';
      }

      if (h.codeExample) {
        section += `**Code Example:**\n\`\`\`typescript\n${h.codeExample}\n\`\`\`\n\n`;
      }
    });

    return section;
  }

  /**
   * Generate complexity analysis section
   */
  private generateComplexitySection(telemetry: any): string {
    const { complexity, metrics } = telemetry;

    let section = `## 📈 Complexity Analysis\n\n`;

    section += `**Overall Statistics:**\n`;
    section += `- Total Files: ${metrics.totalFiles}\n`;
    section += `- Total Functions: ${complexity.length}\n`;
    section += `- Total Lines: ${metrics.totalLines.toLocaleString()}\n`;
    section += `- Average Complexity: ${metrics.avgComplexity.toFixed(1)}\n`;
    section += `- Max Complexity: ${metrics.maxComplexity}\n\n`;

    // Top 10 most complex functions
    const topComplex = [...complexity]
      .sort((a, b) => b.complexity - a.complexity)
      .slice(0, 10);

    if (topComplex.length > 0) {
      section += `**Top 10 Most Complex Functions:**\n\n`;
      section += `| Function | File | CC | Lines |\n`;
      section += `|----------|------|----:|------:|\n`;
      topComplex.forEach(c => {
        section += `| ${c.function} | ${c.file} | ${c.complexity} | ${c.lines} |\n`;
      });
      section += '\n';
    }

    // Complexity distribution
    const distribution = {
      low: complexity.filter(c => c.complexity <= 5).length,
      medium: complexity.filter(c => c.complexity > 5 && c.complexity <= 10).length,
      high: complexity.filter(c => c.complexity > 10 && c.complexity <= 20).length,
      veryHigh: complexity.filter(c => c.complexity > 20).length
    };

    section += `**Complexity Distribution:**\n`;
    section += `- Low (CC ≤ 5): ${distribution.low} functions (${((distribution.low / complexity.length) * 100).toFixed(1)}%)\n`;
    section += `- Medium (CC 6-10): ${distribution.medium} functions (${((distribution.medium / complexity.length) * 100).toFixed(1)}%)\n`;
    section += `- High (CC 11-20): ${distribution.high} functions (${((distribution.high / complexity.length) * 100).toFixed(1)}%)\n`;
    section += `- Very High (CC > 20): ${distribution.veryHigh} functions (${((distribution.veryHigh / complexity.length) * 100).toFixed(1)}%)\n`;

    return section;
  }

  /**
   * Generate duplication section
   */
  private generateDuplicationSection(duplication: any[]): string {
    let section = `## 🔄 Code Duplication Clusters\n\n`;

    const totalLines = duplication.reduce((sum, d) => sum + d.lines, 0);

    section += `**Summary:**\n`;
    section += `- Total Duplication Blocks: ${duplication.length}\n`;
    section += `- Total Duplicated Lines: ${totalLines}\n`;
    section += `- Average Block Size: ${Math.round(totalLines / duplication.length)} lines\n\n`;

    // Top 5 largest duplication blocks
    const topDuplicates = [...duplication]
      .sort((a, b) => b.lines - a.lines)
      .slice(0, 5);

    section += `**Top 5 Largest Duplication Blocks:**\n\n`;
    topDuplicates.forEach((dup, index) => {
      section += `${index + 1}. **${dup.lines} lines duplicated**\n`;
      section += `   - File 1: \`${dup.file1}:${dup.startLine1}\`\n`;
      section += `   - File 2: \`${dup.file2}:${dup.startLine2}\`\n\n`;
    });

    return section;
  }

  /**
   * Generate bundle analysis section
   */
  private generateBundleSection(bundles: any[]): string {
    let section = `## 📦 Bundle Analysis\n\n`;

    const totalSize = bundles.reduce((sum, b) => sum + b.sizeBytes, 0);
    const totalGzip = bundles.reduce((sum, b) => sum + b.sizeGzip, 0);
    const bloatedBundles = bundles.filter(b => b.sizeGzip > 250 * 1024);

    section += `**Summary:**\n`;
    section += `- Total Bundles: ${bundles.length}\n`;
    section += `- Total Size: ${(totalSize / 1024 / 1024).toFixed(2)} MB (${(totalGzip / 1024 / 1024).toFixed(2)} MB gzip)\n`;
    section += `- Bloated Bundles (> 250 KB gzip): ${bloatedBundles.length}\n\n`;

    // Largest bundles
    const topBundles = [...bundles]
      .sort((a, b) => b.sizeGzip - a.sizeGzip)
      .slice(0, 10);

    section += `**Top 10 Largest Bundles:**\n\n`;
    section += `| File | Size | Gzip | Lines | Status |\n`;
    section += `|------|-----:|-----:|------:|--------|\n`;
    topBundles.forEach(b => {
      const status = b.sizeGzip > 250 * 1024 ? '❌ BLOAT' : '✅ OK';
      section += `| ${b.file} | ${(b.sizeBytes / 1024).toFixed(0)} KB | ${(b.sizeGzip / 1024).toFixed(0)} KB | ${b.lines.toLocaleString()} | ${status} |\n`;
    });

    return section;
  }

  /**
   * Generate dead code section
   */
  private generateDeadCodeSection(deadCode: any[]): string {
    let section = `## 🗑️ Dead Code Report\n\n`;

    const byType = {
      'unused-export': deadCode.filter(d => d.type === 'unused-export'),
      'unreachable-code': deadCode.filter(d => d.type === 'unreachable-code'),
      'unused-import': deadCode.filter(d => d.type === 'unused-import')
    };

    section += `**Summary:**\n`;
    section += `- Total Dead Code Instances: ${deadCode.length}\n`;
    section += `- Unused Exports: ${byType['unused-export'].length}\n`;
    section += `- Unreachable Code: ${byType['unreachable-code'].length}\n`;
    section += `- Unused Imports: ${byType['unused-import'].length}\n\n`;

    // List top 20 dead code instances
    section += `**Dead Code Instances (showing first 20):**\n\n`;
    deadCode.slice(0, 20).forEach(d => {
      section += `- \`${d.file}:${d.line}\` - ${d.type}: \`${d.identifier}\`\n`;
    });

    if (deadCode.length > 20) {
      section += `\n... and ${deadCode.length - 20} more instances\n`;
    }

    return section;
  }

  /**
   * Generate refactoring roadmap section
   */
  private generateRoadmapSection(roadmap: any[]): string {
    let section = `## 🗺️ Refactoring Roadmap\n\n`;

    roadmap.forEach((phase, index) => {
      section += `### ${phase.phase}\n\n`;
      section += `**Estimated Effort:** ${phase.estimatedEffort}\n\n`;
      section += `**Tasks:**\n`;
      phase.tasks.forEach((task: string) => {
        section += `- [ ] ${task}\n`;
      });
      section += '\n';
    });

    return section;
  }

  /**
   * Generate quality gates section
   */
  private generateQualityGatesSection(normalized: any): string {
    const gates = [
      { name: 'Bug Density', value: normalized.metrics.bugDensity, target: '< 0.05', passed: normalized.metrics.bugDensity < 0.05 },
      { name: 'Maintainability Index', value: normalized.metrics.maintainabilityIndex, target: '> 65', passed: normalized.metrics.maintainabilityIndex > 65 },
      { name: 'Complexity Score', value: normalized.metrics.complexityScore, target: '> 70', passed: normalized.metrics.complexityScore > 70 },
      { name: 'Duplication Score', value: normalized.metrics.duplicationScore, target: '> 85', passed: normalized.metrics.duplicationScore > 85 }
    ];

    let section = `## 🚦 Quality Gates\n\n`;

    const passedCount = gates.filter(g => g.passed).length;
    const totalCount = gates.length;

    section += `**Overall:** ${passedCount}/${totalCount} gates passed\n\n`;

    section += `| Gate | Value | Target | Status |\n`;
    section += `|------|-------|--------|--------|\n`;
    gates.forEach(gate => {
      const status = gate.passed ? '✅ PASS' : '❌ FAIL';
      section += `| ${gate.name} | ${typeof gate.value === 'number' ? gate.value.toFixed(2) : gate.value} | ${gate.target} | ${status} |\n`;
    });

    return section;
  }

  /**
   * Generate footer
   */
  private generateFooter(): string {
    return `## 📚 References

**Research Citations:**
- ArXiv 2019: "Cyclomatic Complexity correlates r=0.72 with bug density"
- Grok's Formula: Bug Density = (CC^1.2 × duplicationRatio) / cohesionScore
- Industry Standards: MI > 65, CC < 10, Duplication < 3%

**Tools Used:**
- TypeScript Compiler API (ts-morph) for AST analysis
- jscpd for duplication detection
- Custom cyclomatic complexity calculator

---

*Generated by Code Sonar - Part of the Unified Sonar Suite*
*PING → ECHO → MAP → CRITIQUE Pattern*
`;
  }

  /**
   * Save report to file
   */
  saveReport(report: string, projectPath: string, filename?: string) {
    const reportsDir = join(process.cwd(), 'tests/ux-sonar/reports');

    try {
      mkdirSync(reportsDir, { recursive: true });
    } catch (e) {
      // Directory might already exist
    }

    const projectName = projectPath.split(/[/\\]/).pop() || 'project';
    const reportFilename = filename || `code_${projectName}_${Date.now()}.md`;
    const filepath = join(reportsDir, reportFilename);

    writeFileSync(filepath, report);
    console.log(`[Code Report] Saved to: ${filepath}`);

    return filepath;
  }
}

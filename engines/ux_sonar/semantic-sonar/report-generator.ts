/**
 * Semantic Sonar Report Generator
 * Generates markdown reports with dependency graphs, coupling metrics, and refactoring roadmap
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

export class SemanticReportGenerator {

  generateReport(
    normalized: any,
    heuristics: any[],
    critique: any,
    projectPath: string
  ): string {
    const sections: string[] = [];

    sections.push(this.generateHeader(normalized, projectPath));
    sections.push(critique.summary);

    if (critique.praise.length > 0) {
      sections.push(this.generatePraiseSection(critique.praise));
    }

    sections.push(this.generateMetricsDashboard(normalized));

    if (heuristics.length > 0) {
      sections.push(this.generateHeuristicsSection(heuristics));
    }

    if (normalized.telemetry.cycles.length > 0) {
      sections.push(this.generateCyclesSection(normalized.telemetry.cycles));
    }

    sections.push(this.generateCouplingSection(normalized.telemetry.coupling));

    if (normalized.telemetry.godModules.length > 0) {
      sections.push(this.generateGodModulesSection(normalized.telemetry.godModules));
    }

    if (normalized.telemetry.layeringViolations.length > 0) {
      sections.push(this.generateLayeringSection(normalized.telemetry.layeringViolations));
    }

    if (normalized.telemetry.orphanDomains.length > 0) {
      sections.push(this.generateOrphansSection(normalized.telemetry.orphanDomains));
    }

    sections.push(this.generateDependencyGraph(normalized.telemetry));
    sections.push(this.generateRoadmapSection(critique.refactoringRoadmap));
    sections.push(this.generateQualityGatesSection(normalized));
    sections.push(this.generateFooter());

    return sections.join('\n\n---\n\n');
  }

  private generateHeader(normalized: any, projectPath: string): string {
    const date = new Date(normalized.timestamp).toLocaleString();
    const projectName = projectPath.split(/[/\\]/).pop() || 'Unknown Project';

    return `# 🏗️ Semantic Sonar Report

**Project:** ${projectName}
**Analyzed:** ${date}
**Regime:** ${normalized.asymmetrica.regime.toUpperCase()}
**Complexity:** ${normalized.asymmetrica.complexity}
`;
  }

  private generatePraiseSection(praise: string[]): string {
    return `## 🎉 Praise Signals\n\n${praise.map(p => `- ${p}`).join('\n')}`;
  }

  private generateMetricsDashboard(normalized: any): string {
    const m = normalized.metrics;

    return `## 📊 Architecture Metrics Dashboard

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| **AQS (Architecture Quality)** | ${m.aqs.toFixed(2)} | > 0.6 | ${m.aqs > 0.6 ? '✅ PASS' : '❌ FAIL'} |
| **Modularity Index** | ${(m.modularityIndex * 100).toFixed(0)}% | > 70% | ${m.modularityIndex > 0.7 ? '✅ PASS' : '❌ FAIL'} |
| **Architecture Health** | ${m.architectureHealth}/100 | > 70 | ${m.architectureHealth > 70 ? '✅ PASS' : '❌ FAIL'} |
| **Coupling (avg)** | ${m.coupling.toFixed(1)} | < 5 | ${m.coupling < 5 ? '✅ PASS' : '❌ FAIL'} |
| **Cohesion** | ${(m.cohesion * 100).toFixed(0)}% | > 70% | ${m.cohesion > 0.7 ? '✅ PASS' : '❌ FAIL'} |

**Formula Reference:**
- AQS = (cohesion/coupling) × modularityIndex
- Research: Coupling-cohesion r=-0.68, predicts maintainability 82% (Kent State 1999)
`;
  }

  private generateHeuristicsSection(heuristics: any[]): string {
    let section = `## 🔍 Architecture Heuristic Violations\n\n`;

    heuristics.forEach((h, i) => {
      const emoji = h.severity === 'critical' ? '🔴' : h.severity === 'warning' ? '⚠️' : 'ℹ️';
      section += `### ${i + 1}. ${emoji} ${h.heuristic}\n\n`;
      section += `**Severity:** ${h.severity.toUpperCase()}\n\n`;
      section += `**Issue:** ${h.message}\n\n`;
      section += `**Suggestion:** ${h.suggestion}\n\n`;

      if (h.affectedItems?.length > 0) {
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

  private generateCyclesSection(cycles: any[]): string {
    let section = `## 🔄 Circular Dependencies\n\n`;

    section += `**Summary:** ${cycles.length} circular dependencies detected\n\n`;

    cycles.slice(0, 10).forEach((c, i) => {
      section += `${i + 1}. **Cycle Length: ${c.length}**\n`;
      section += `   \`${c.cycle.join(' → ')} → ${c.cycle[0]}\`\n\n`;
    });

    if (cycles.length > 10) {
      section += `... and ${cycles.length - 10} more cycles\n`;
    }

    return section;
  }

  private generateCouplingSection(coupling: any[]): string {
    let section = `## 🔗 Module Coupling Analysis\n\n`;

    const highCoupling = coupling.filter(c => c.zScore > 2);
    section += `**High Coupling Modules (z-score > 2):** ${highCoupling.length}\n\n`;

    const top = [...coupling].sort((a, b) => b.couplingScore - a.couplingScore).slice(0, 15);

    section += `**Top 15 Most Coupled Modules:**\n\n`;
    section += `| Module | Fan-In | Fan-Out | Total | Z-Score |\n`;
    section += `|--------|-------:|--------:|------:|--------:|\n`;
    top.forEach(c => {
      section += `| ${c.module} | ${c.fanIn} | ${c.fanOut} | ${c.couplingScore} | ${c.zScore.toFixed(2)} |\n`;
    });

    return section;
  }

  private generateGodModulesSection(godModules: any[]): string {
    let section = `## 👑 God Modules\n\n`;

    section += `**Found:** ${godModules.length} god modules (centrality > 2× mean)\n\n`;

    section += `| Module | Centrality | Score | Inbound | Outbound |\n`;
    section += `|--------|----------:|------:|--------:|---------:|\n`;
    godModules.forEach(gm => {
      section += `| ${gm.module} | ${gm.centrality} | ${gm.score.toFixed(2)}× | ${gm.inboundDeps} | ${gm.outboundDeps} |\n`;
    });

    return section;
  }

  private generateLayeringSection(violations: any[]): string {
    let section = `## 🏛️ Layering Violations\n\n`;

    section += `**Total Violations:** ${violations.length}\n\n`;

    const byType = violations.reduce((acc: any, v) => {
      acc[v.violationType] = (acc[v.violationType] || 0) + 1;
      return acc;
    }, {});

    section += `**By Type:**\n`;
    Object.entries(byType).forEach(([type, count]) => {
      section += `- ${type}: ${count}\n`;
    });
    section += '\n';

    section += `**Violations (showing first 20):**\n\n`;
    violations.slice(0, 20).forEach((v, i) => {
      section += `${i + 1}. \`${v.from}\` → \`${v.to}\` (${v.violationType})\n`;
    });

    return section;
  }

  private generateOrphansSection(orphans: any[]): string {
    let section = `## 🗑️ Orphan Domains\n\n`;

    section += `**Total Orphans:** ${orphans.length}\n\n`;

    orphans.slice(0, 20).forEach((o, i) => {
      section += `${i + 1}. \`${o.module}\` - ${o.type}: ${o.reason}\n`;
    });

    return section;
  }

  private generateDependencyGraph(telemetry: any): string {
    let section = `## 📐 Dependency Graph (ASCII)\n\n`;

    section += '```\n';
    section += `Modules: ${telemetry.metrics.totalModules}\n`;
    section += `Avg Coupling: ${telemetry.metrics.avgCoupling.toFixed(1)}\n`;
    section += `Max Coupling: ${telemetry.metrics.maxCoupling}\n`;
    section += `Cycles: ${telemetry.cycles.length}\n\n`;

    // Simple ASCII graph of top modules
    const top10 = [...telemetry.coupling]
      .sort((a, b) => b.couplingScore - a.couplingScore)
      .slice(0, 10);

    top10.forEach(m => {
      const bar = '█'.repeat(Math.min(50, m.couplingScore * 2));
      section += `${m.module.substring(0, 40).padEnd(40)} ${bar} ${m.couplingScore}\n`;
    });

    section += '```\n';

    return section;
  }

  private generateRoadmapSection(roadmap: any[]): string {
    let section = `## 🗺️ Architecture Refactoring Roadmap\n\n`;

    roadmap.forEach(phase => {
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

  private generateQualityGatesSection(normalized: any): string {
    const gates = [
      { name: 'AQS', value: normalized.metrics.aqs.toFixed(2), target: '> 0.6', passed: normalized.metrics.aqs > 0.6 },
      { name: 'No Cycles', value: normalized.telemetry.cycles.length, target: '0', passed: normalized.telemetry.cycles.length === 0 },
      { name: 'Modularity', value: (normalized.metrics.modularityIndex * 100).toFixed(0) + '%', target: '> 70%', passed: normalized.metrics.modularityIndex > 0.7 },
      { name: 'No God Modules', value: normalized.telemetry.godModules.length, target: '0', passed: normalized.telemetry.godModules.length === 0 },
      { name: 'Architecture Health', value: normalized.metrics.architectureHealth, target: '> 70', passed: normalized.metrics.architectureHealth > 70 }
    ];

    let section = `## 🚦 Architecture Quality Gates\n\n`;

    const passed = gates.filter(g => g.passed).length;
    section += `**Overall:** ${passed}/${gates.length} gates passed\n\n`;

    section += `| Gate | Value | Target | Status |\n`;
    section += `|------|-------|--------|--------|\n`;
    gates.forEach(gate => {
      const status = gate.passed ? '✅ PASS' : '❌ FAIL';
      section += `| ${gate.name} | ${gate.value} | ${gate.target} | ${status} |\n`;
    });

    return section;
  }

  private generateFooter(): string {
    return `## 📚 References

**Research Citations:**
- Kent State 1999: "Coupling-cohesion inverse correlation r=-0.68"
- Grok's Formula: AQS = (cohesion/coupling) × modularityIndex
- IEEE TSE 2018: "Circular dependencies increase change ripple by 3×"

**Tools Used:**
- ts-morph for dependency analysis
- madge for circular dependency detection
- Custom coupling/cohesion metrics

---

*Generated by Semantic Sonar - Part of the Unified Sonar Suite*
*PING → ECHO → MAP → CRITIQUE Pattern*
`;
  }

  saveReport(report: string, projectPath: string, filename?: string) {
    const reportsDir = join(process.cwd(), 'tests/ux-sonar/reports');

    try {
      mkdirSync(reportsDir, { recursive: true });
    } catch (e) {}

    const projectName = projectPath.split(/[/\\]/).pop() || 'project';
    const reportFilename = filename || `semantic_${projectName}_${Date.now()}.md`;
    const filepath = join(reportsDir, reportFilename);

    writeFileSync(filepath, report);
    console.log(`[Semantic Report] Saved to: ${filepath}`);

    return filepath;
  }
}

/**
 * Journey Sonar Report Generator
 * Generates Sankey diagrams, heatmaps, and funnel analysis
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface SankeyNode {
  id: string;
  name: string;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

interface SankeyDiagram {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

interface HeatmapCluster {
  x: number;
  y: number;
  intensity: number;
  type: 'rage-click' | 'hesitation';
  element?: string;
}

interface FunnelStep {
  name: string;
  entered: number;
  completed: number;
  dropoffRate: number;
}

interface JourneyReport {
  timestamp: number;
  route: string;
  sankey: SankeyDiagram;
  heatmap: HeatmapCluster[];
  funnel: FunnelStep[];
  summary: {
    totalUsers: number;
    completionRate: number;
    avgFrustrationScore: number;
    topFrictionPoints: string[];
  };
}

export class JourneyReportGenerator {

  /**
   * Generate comprehensive journey report
   */
  generate(normalizedData: any, route: string): JourneyReport {
    const sankey = this.generateSankeyData(normalizedData.telemetry);
    const heatmap = this.generateHeatmapData(normalizedData.telemetry);
    const funnel = this.generateFunnelData(normalizedData.telemetry);
    const summary = this.generateSummary(normalizedData);

    return {
      timestamp: Date.now(),
      route,
      sankey,
      heatmap,
      funnel,
      summary
    };
  }

  /**
   * Generate Sankey diagram data for navigation paths
   */
  private generateSankeyData(telemetry: any): SankeyDiagram {
    const navigationEvents = telemetry.navigationEvents || [];

    if (navigationEvents.length === 0) {
      return { nodes: [], links: [] };
    }

    // Extract unique routes
    const nodesMap = new Map<string, SankeyNode>();
    const linksMap = new Map<string, number>();

    navigationEvents.forEach((event: any) => {
      const from = event.from || 'start';
      const to = event.to || 'end';

      // Add nodes
      if (!nodesMap.has(from)) {
        nodesMap.set(from, { id: from, name: from });
      }
      if (!nodesMap.has(to)) {
        nodesMap.set(to, { id: to, name: to });
      }

      // Add/increment link
      const linkKey = `${from}->${to}`;
      linksMap.set(linkKey, (linksMap.get(linkKey) || 0) + 1);
    });

    // Convert to Sankey format
    const nodes = Array.from(nodesMap.values());
    const links = Array.from(linksMap.entries()).map(([linkKey, value]) => {
      const [source, target] = linkKey.split('->');
      return { source, target, value };
    });

    return { nodes, links };
  }

  /**
   * Generate heatmap data for rage clicks and hesitation zones
   */
  private generateHeatmapData(telemetry: any): HeatmapCluster[] {
    const clusters: HeatmapCluster[] = [];

    // Rage click clusters
    const rageClickEvents = telemetry.rageClickEvents || [];
    rageClickEvents.forEach((event: any) => {
      clusters.push({
        x: event.x,
        y: event.y,
        intensity: event.clickCount / 10, // Normalize 0-1
        type: 'rage-click',
        element: event.element
      });
    });

    // Hesitation zones (approximate from hover events)
    const hesitationEvents = telemetry.hesitationEvents || [];
    const hesitationMap = new Map<string, { count: number; totalDuration: number }>();

    hesitationEvents.forEach((event: any) => {
      const element = event.element || 'unknown';
      const existing = hesitationMap.get(element) || { count: 0, totalDuration: 0 };
      existing.count++;
      existing.totalDuration += event.duration;
      hesitationMap.set(element, existing);
    });

    // Convert hesitation map to clusters
    // (In real implementation, would need element position data)
    Array.from(hesitationMap.entries()).forEach(([element, data], index) => {
      clusters.push({
        x: 100 + (index * 200), // Approximate positioning
        y: 100 + (index * 150),
        intensity: Math.min(1, data.totalDuration / 10000), // Normalize
        type: 'hesitation',
        element
      });
    });

    return clusters;
  }

  /**
   * Generate funnel analysis data
   */
  private generateFunnelData(telemetry: any): FunnelStep[] {
    const taskCompletions = telemetry.taskCompletions || [];

    if (taskCompletions.length === 0) {
      return [];
    }

    // Group tasks by name
    const taskMap = new Map<string, { entered: number; completed: number }>();

    taskCompletions.forEach((task: any) => {
      const name = task.taskName || 'Unknown Task';
      const existing = taskMap.get(name) || { entered: 0, completed: 0 };
      existing.entered++;
      if (task.success) {
        existing.completed++;
      }
      taskMap.set(name, existing);
    });

    // Convert to funnel steps
    const funnel = Array.from(taskMap.entries()).map(([name, data]) => ({
      name,
      entered: data.entered,
      completed: data.completed,
      dropoffRate: ((data.entered - data.completed) / data.entered) * 100
    }));

    return funnel.sort((a, b) => b.dropoffRate - a.dropoffRate);
  }

  /**
   * Generate executive summary
   */
  private generateSummary(normalizedData: any): any {
    const { metrics, telemetry } = normalizedData;
    const taskCompletions = telemetry.taskCompletions || [];

    const totalUsers = taskCompletions.length || 1;
    const completionRate = metrics.taskSuccessRate || 0;
    const avgFrustrationScore = metrics.frustrationScore * 100;

    // Identify top friction points
    const frictionPoints: string[] = [];

    if (metrics.rageClickDensity > 0.3) {
      frictionPoints.push('Rage clicks (unresponsive elements)');
    }
    if (metrics.hesitationRatio > 0.2) {
      frictionPoints.push('Long hesitation (unclear affordances)');
    }
    if (metrics.backtrackRatio > 0.2) {
      frictionPoints.push('Navigation loops (users getting lost)');
    }
    if (metrics.errorLoopScore > 0.5) {
      frictionPoints.push('Error loops (no recovery paths)');
    }

    return {
      totalUsers,
      completionRate: Math.round(completionRate),
      avgFrustrationScore: Math.round(avgFrustrationScore),
      topFrictionPoints: frictionPoints
    };
  }

  /**
   * Generate HTML report with visualizations
   */
  generateHTMLReport(report: JourneyReport): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Journey Sonar Report - ${report.route}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 {
      color: #2d3748;
      border-bottom: 3px solid #4299e1;
      padding-bottom: 10px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 30px 0;
    }
    .metric {
      background: #edf2f7;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    .metric-value {
      font-size: 36px;
      font-weight: bold;
      color: #2d3748;
    }
    .metric-label {
      font-size: 14px;
      color: #718096;
      margin-top: 5px;
    }
    .friction-high { color: #e53e3e; }
    .friction-medium { color: #dd6b20; }
    .friction-low { color: #38a169; }
    .section {
      margin: 40px 0;
    }
    .heatmap-container {
      position: relative;
      width: 100%;
      height: 400px;
      background: #f7fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }
    .heatmap-cluster {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
    }
    .rage-click {
      background: radial-gradient(circle, rgba(229, 62, 62, 0.6), transparent);
    }
    .hesitation {
      background: radial-gradient(circle, rgba(221, 107, 32, 0.6), transparent);
    }
    .funnel {
      margin: 20px 0;
    }
    .funnel-step {
      margin: 10px 0;
      padding: 15px;
      background: #edf2f7;
      border-radius: 6px;
    }
    .funnel-bar {
      height: 30px;
      background: linear-gradient(90deg, #4299e1, #3182ce);
      border-radius: 4px;
      position: relative;
      margin: 10px 0;
    }
    .dropoff {
      position: absolute;
      right: 0;
      top: 0;
      height: 100%;
      background: rgba(229, 62, 62, 0.3);
      border-radius: 0 4px 4px 0;
    }
    .friction-list {
      list-style: none;
      padding: 0;
    }
    .friction-list li {
      padding: 10px;
      margin: 5px 0;
      background: #fff5f5;
      border-left: 4px solid #e53e3e;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Journey Sonar Report</h1>
    <p><strong>Route:</strong> ${report.route}</p>
    <p><strong>Generated:</strong> ${new Date(report.timestamp).toLocaleString()}</p>

    <div class="summary">
      <div class="metric">
        <div class="metric-value">${report.summary.totalUsers}</div>
        <div class="metric-label">Total Users</div>
      </div>
      <div class="metric">
        <div class="metric-value ${report.summary.completionRate >= 80 ? 'friction-low' : report.summary.completionRate >= 50 ? 'friction-medium' : 'friction-high'}">
          ${report.summary.completionRate}%
        </div>
        <div class="metric-label">Completion Rate</div>
      </div>
      <div class="metric">
        <div class="metric-value ${report.summary.avgFrustrationScore < 30 ? 'friction-low' : report.summary.avgFrustrationScore < 60 ? 'friction-medium' : 'friction-high'}">
          ${report.summary.avgFrustrationScore}%
        </div>
        <div class="metric-label">Frustration Score</div>
      </div>
    </div>

    <div class="section">
      <h2>Top Friction Points</h2>
      ${report.summary.topFrictionPoints.length > 0
        ? `<ul class="friction-list">
            ${report.summary.topFrictionPoints.map(point => `<li>${point}</li>`).join('')}
           </ul>`
        : '<p>✅ No major friction points detected!</p>'}
    </div>

    <div class="section">
      <h2>Frustration Heatmap</h2>
      <div class="heatmap-container">
        ${report.heatmap.map(cluster => `
          <div
            class="heatmap-cluster ${cluster.type}"
            style="
              left: ${cluster.x}px;
              top: ${cluster.y}px;
              width: ${cluster.intensity * 100}px;
              height: ${cluster.intensity * 100}px;
            "
            title="${cluster.element}: ${cluster.type}"
          ></div>
        `).join('')}
      </div>
      <p><strong>Legend:</strong> 🔴 Rage Clicks | 🟠 Hesitation Zones</p>
    </div>

    <div class="section">
      <h2>Task Funnel Analysis</h2>
      <div class="funnel">
        ${report.funnel.map(step => `
          <div class="funnel-step">
            <strong>${step.name}</strong>
            <div class="funnel-bar">
              <div class="dropoff" style="width: ${step.dropoffRate}%"></div>
            </div>
            <p>
              Entered: ${step.entered} |
              Completed: ${step.completed} |
              Dropoff: ${step.dropoffRate.toFixed(1)}%
            </p>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="section">
      <h2>Navigation Flow (Sankey)</h2>
      <p>Total navigation paths: ${report.sankey.links.length}</p>
      <ul>
        ${report.sankey.links.slice(0, 10).map(link => `
          <li>${link.source} → ${link.target} (${link.value} users)</li>
        `).join('')}
      </ul>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * Save report to file
   */
  saveReport(report: JourneyReport, format: 'html' | 'json' = 'html') {
    const reportsDir = join(process.cwd(), 'tests/ux-sonar/reports');

    try {
      mkdirSync(reportsDir, { recursive: true });
    } catch (e) {
      // Directory might already exist
    }

    const filename = report.route.replace(/\//g, '_') || 'root';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filepath = join(reportsDir, `journey_${filename}_${timestamp}.${format}`);

    if (format === 'html') {
      const html = this.generateHTMLReport(report);
      writeFileSync(filepath, html);
    } else {
      writeFileSync(filepath, JSON.stringify(report, null, 2));
    }

    console.log(`[Journey Report] Saved: ${filepath}`);
    return filepath;
  }
}

import { SonicRadarEngine } from '../sonic-radar-engine';
import { Page } from '@playwright/test';

interface FrontendTelemetry {
  layer: 'frontend';
  route: string;
  context: {
    timestamp: number;
    env: string;
    browser: string;
  };
  metrics: {
    fps: number;
    cls: number;
    consoleErrors: number;
    requests: number;
    longTasks: number;
  };
  events: Array<{
    type: string;
    name?: string;
    timestamp: number;
    value?: number;
  }>;
}

export class FrontendCollector {
  private sonar: SonicRadarEngine;
  
  constructor(private page: Page) {
    this.sonar = new SonicRadarEngine(page);
  }

  async initialize() {
    await this.sonar.initialize();
  }

  async collect(route: string): Promise<FrontendTelemetry> {
    const sonarResult = await this.sonar.pingFlow(route);
    
    const consoleErrors = await this.page.evaluate(() => {
      return (window as any).__consoleErrorCount || 0;
    });
    
    const requestCount = await this.page.evaluate(() => {
      return performance.getEntriesByType('resource').length;
    });

    return {
      layer: 'frontend',
      route,
      context: {
        timestamp: Date.now(),
        env: process.env.NODE_ENV || 'development',
        browser: 'chromium'
      },
      metrics: {
        fps: sonarResult.metrics.avgFPS,
        cls: sonarResult.metrics.totalCLS,
        consoleErrors,
        requests: requestCount,
        longTasks: sonarResult.metrics.totalLongTasks
      },
      events: sonarResult.telemetry.map(t => ({
        type: t.type,
        name: t.name,
        timestamp: t.timestamp,
        value: t.value
      }))
    };
  }

  async cleanup() {
    await this.sonar.cleanup();
  }
}

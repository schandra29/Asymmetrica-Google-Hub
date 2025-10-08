/**
 * SonicRadarEngine - Frontend UX Telemetry Collector
 * Captures visual smoothness metrics using browser performance APIs
 */

import { Page } from '@playwright/test';

export interface SonicTelemetryPoint {
  type: 'fps' | 'cls' | 'animation' | 'paint' | 'longTask';
  name?: string;
  timestamp: number;
  value?: number;
  duration?: number;
}

export interface SonicMetrics {
  avgFPS: number;
  totalCLS: number;
  totalLongTasks: number;
  timeToStable: number;
  animationCount: number;
}

export interface SonicRadarResult {
  route: string;
  duration: number;
  metrics: SonicMetrics;
  telemetry: SonicTelemetryPoint[];
  timestamp: number;
}

export class SonicRadarEngine {
  private telemetry: SonicTelemetryPoint[] = [];
  private startTime: number = 0;

  constructor(private page: Page) {}

  async initialize() {
    await this.page.addInitScript(() => {
      (window as any).__sonicTelemetry = [];
      (window as any).__consoleErrorCount = 0;

      const originalError = console.error;
      console.error = (...args) => {
        (window as any).__consoleErrorCount++;
        originalError.apply(console, args);
      };

      let lastFrameTime = performance.now();
      let frameCount = 0;
      let fpsHistory: number[] = [];

      function measureFPS() {
        const now = performance.now();
        const delta = now - lastFrameTime;
        const fps = 1000 / delta;

        fpsHistory.push(fps);
        if (fpsHistory.length > 60) fpsHistory.shift();

        lastFrameTime = now;
        frameCount++;

        if (frameCount % 60 === 0) {
          const avgFPS = fpsHistory.reduce((sum, f) => sum + f, 0) / fpsHistory.length;
          (window as any).__sonicTelemetry.push({
            type: 'fps',
            timestamp: now,
            value: Math.round(avgFPS * 100) / 100
          });
        }

        requestAnimationFrame(measureFPS);
      }

      requestAnimationFrame(measureFPS);

      if ('PerformanceObserver' in window) {
        try {
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                (window as any).__sonicTelemetry.push({
                  type: 'cls',
                  timestamp: entry.startTime,
                  value: (entry as any).value
                });
              }
            }
          }).observe({ type: 'layout-shift', buffered: true });
        } catch (e) {}

        try {
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              (window as any).__sonicTelemetry.push({
                type: 'paint',
                name: entry.name,
                timestamp: entry.startTime,
                duration: entry.duration
              });
            }
          }).observe({ type: 'paint', buffered: true });
        } catch (e) {}
      }
    });
  }

  async pingFlow(route: string): Promise<SonicRadarResult> {
    this.startTime = Date.now();
    this.telemetry = [];

    await this.page.goto(route, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await this.page.waitForTimeout(2000);

    const pageTelemetry = await this.page.evaluate(() => {
      return (window as any).__sonicTelemetry || [];
    });

    this.telemetry.push(...pageTelemetry);

    const metrics = this.computeMetrics();
    const duration = Date.now() - this.startTime;

    return { route, duration, metrics, telemetry: this.telemetry, timestamp: Date.now() };
  }

  private computeMetrics(): SonicMetrics {
    const fpsPoints = this.telemetry.filter(t => t.type === 'fps');
    const clsPoints = this.telemetry.filter(t => t.type === 'cls');
    const longTasks = this.telemetry.filter(t => t.type === 'longTask');
    const animations = this.telemetry.filter(t => t.type === 'animation');

    const fpsValues = fpsPoints.map(p => p.value || 0).filter(v => v > 0);
    const avgFPS = fpsValues.length > 0
      ? Math.round((fpsValues.reduce((sum, v) => sum + v, 0) / fpsValues.length) * 100) / 100
      : 60;

    const totalCLS = Math.round(clsPoints.reduce((sum, p) => sum + (p.value || 0), 0) * 1000) / 1000;
    const totalLongTasks = Math.round(longTasks.reduce((sum, t) => sum + (t.duration || 0), 0));

    let timeToStable = 0;
    for (const point of fpsPoints) {
      if ((point.value || 0) >= 50) {
        timeToStable = point.timestamp;
        break;
      }
    }

    return {
      avgFPS,
      totalCLS,
      totalLongTasks,
      timeToStable: Math.round(timeToStable),
      animationCount: animations.length
    };
  }

  async cleanup() {
    this.telemetry = [];
  }
}

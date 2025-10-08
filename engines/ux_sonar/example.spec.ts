import { test, expect } from '@playwright/test';
import { SonicRadarEngine } from './sonic-radar-engine';

test.describe('UX Sonar - AsymmBill Pages', () => {

  test('Landing Page - Animation Telemetry', async ({ page }) => {
    const sonar = new SonicRadarEngine(page);
    await sonar.initialize();

    const result = await sonar.pingFlow('http://localhost:3000', [
      { type: 'wait', waitAfter: 2000 }, // Allow page to settle and animations to complete
      { type: 'scroll', pixels: 500, waitAfter: 500 }, // Scroll to trigger animations
      { type: 'scroll', pixels: 500, waitAfter: 500 }
    ]);

    console.log('\n=== UX METRICS - LANDING PAGE ===');
    console.log(`Average FPS: ${result.metrics.avgFPS}`);
    console.log(`P95 Frame Drop: ${result.metrics.p95FrameDrop}ms`);
    console.log(`Max Frame Gap: ${result.metrics.maxFrameGap}ms`);
    console.log(`Total CLS: ${result.metrics.totalCLS}`);
    console.log(`Animations: ${result.metrics.animationCount}`);
    console.log(`Long Tasks: ${result.metrics.totalLongTasks}ms`);
    console.log(`Time to Stable: ${result.metrics.timeToStable}ms`);

    // Assertions - Landing page with animations
    expect(result.metrics.avgFPS).toBeGreaterThan(40); // Should be reasonably smooth
    expect(result.metrics.totalCLS).toBeLessThan(0.25); // Acceptable layout shift
    expect(result.metrics.maxFrameGap).toBeLessThan(100); // No severe janks

    await sonar.cleanup();
  });

  test('Canvas Enhanced - Interactive Flow', async ({ page }) => {
    const sonar = new SonicRadarEngine(page);
    await sonar.initialize();

    const result = await sonar.pingFlow('http://localhost:3000/canvas-enhanced', [
      { type: 'wait', waitAfter: 2000 }, // Allow canvas to initialize
      { type: 'scroll', pixels: 300, waitAfter: 500 }
    ]);

    console.log('\n=== UX METRICS - CANVAS ENHANCED ===');
    console.log(`Average FPS: ${result.metrics.avgFPS}`);
    console.log(`P95 Frame Drop: ${result.metrics.p95FrameDrop}ms`);
    console.log(`Max Frame Gap: ${result.metrics.maxFrameGap}ms`);
    console.log(`Total CLS: ${result.metrics.totalCLS}`);
    console.log(`Animations: ${result.metrics.animationCount}`);
    console.log(`Long Tasks: ${result.metrics.totalLongTasks}ms`);
    console.log(`Time to Stable: ${result.metrics.timeToStable}ms`);

    // Assertions - Canvas page
    expect(result.metrics.avgFPS).toBeGreaterThan(30); // Canvas rendering can be more intensive
    expect(result.metrics.totalCLS).toBeLessThan(0.3);

    await sonar.cleanup();
  });

  test('Test Visual - Animation Performance', async ({ page }) => {
    const sonar = new SonicRadarEngine(page);
    await sonar.initialize();

    const result = await sonar.pingFlow('http://localhost:3000/test-visual', [
      { type: 'wait', waitAfter: 2000 }, // Allow visual tests to render
      { type: 'scroll', pixels: 400, waitAfter: 500 }
    ]);

    console.log('\n=== UX METRICS - TEST VISUAL ===');
    console.log(`Average FPS: ${result.metrics.avgFPS}`);
    console.log(`P95 Frame Drop: ${result.metrics.p95FrameDrop}ms`);
    console.log(`Max Frame Gap: ${result.metrics.maxFrameGap}ms`);
    console.log(`Total CLS: ${result.metrics.totalCLS}`);
    console.log(`Animations: ${result.metrics.animationCount}`);
    console.log(`Long Tasks: ${result.metrics.totalLongTasks}ms`);
    console.log(`Time to Stable: ${result.metrics.timeToStable}ms`);

    // Assertions - Visual test page
    expect(result.metrics.avgFPS).toBeGreaterThan(40);
    expect(result.metrics.totalCLS).toBeLessThan(0.2);

    await sonar.cleanup();
  });

  test('Landing Page - Hover Interactions', async ({ page }) => {
    const sonar = new SonicRadarEngine(page);
    await sonar.initialize();

    const result = await sonar.pingFlow('http://localhost:3000', [
      { type: 'wait', waitAfter: 1500 },
      { type: 'hover', selector: 'button', waitAfter: 300 }, // Hover over first button
      { type: 'scroll', pixels: 200, waitAfter: 300 }
    ]);

    console.log('\n=== UX METRICS - HOVER INTERACTIONS ===');
    console.log(`Average FPS: ${result.metrics.avgFPS}`);
    console.log(`Animations: ${result.metrics.animationCount}`);
    console.log(`Total CLS: ${result.metrics.totalCLS}`);

    // Assertions - Interactive hover states
    expect(result.metrics.avgFPS).toBeGreaterThan(50);
    expect(result.metrics.totalCLS).toBeLessThan(0.15);

    await sonar.cleanup();
  });

  test('Full Telemetry Capture - All Animation Types', async ({ page }) => {
    const sonar = new SonicRadarEngine(page);
    await sonar.initialize();

    const result = await sonar.pingFlow('http://localhost:3000', [
      { type: 'wait', waitAfter: 1000 },
      { type: 'scroll', pixels: 300, waitAfter: 400 },
      { type: 'scroll', pixels: 300, waitAfter: 400 },
      { type: 'scroll', pixels: 300, waitAfter: 400 }
    ]);

    console.log('\n=== FULL TELEMETRY ANALYSIS ===');
    console.log(`Total Telemetry Points: ${result.telemetry.length}`);
    console.log(`Page Telemetry Frames: ${result.pageTelemetry?.frames.length || 0}`);
    console.log(`Animation Events: ${result.pageTelemetry?.animations.length || 0}`);
    console.log(`Layout Shifts: ${result.pageTelemetry?.shifts.length || 0}`);
    console.log(`Paint Events: ${result.pageTelemetry?.paints.length || 0}`);
    console.log(`Long Tasks: ${result.pageTelemetry?.longTasks.length || 0}`);

    console.log('\nAnimation Event Breakdown:');
    const animationTypes = result.pageTelemetry?.animations.reduce((acc: any, anim: any) => {
      acc[anim.type] = (acc[anim.type] || 0) + 1;
      return acc;
    }, {}) || {};
    Object.entries(animationTypes).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });

    // Verify telemetry capture
    expect(result.telemetry.length).toBeGreaterThan(0);
    expect(result.pageTelemetry?.frames.length).toBeGreaterThan(0);

    await sonar.cleanup();
  });
});

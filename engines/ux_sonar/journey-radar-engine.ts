/**
 * JourneyRadarEngine - User Behavior Telemetry Collector
 * Captures frustration, delight, and navigation patterns using browser behavior APIs
 * Privacy-first: No PII, no keystrokes, no text entry, aggregate metrics only
 *
 * Based on Grok's Journey Sonar specifications:
 * Formula: Frustration Score (FS) = (hesitationTime/taskDuration) × rageClickDensity + backtrackRatio
 */

import { Page } from '@playwright/test';

export interface PointerEvent {
  type: 'click' | 'hover' | 'move';
  timestamp: number;
  x?: number;
  y?: number;
  element?: string;
  duration?: number;
}

export interface HesitationEvent {
  timestamp: number;
  duration: number;
  beforeAction: string;
  element?: string;
}

export interface RageClickEvent {
  timestamp: number;
  clickCount: number;
  radius: number;
  element?: string;
  x: number;
  y: number;
}

export interface NavigationEvent {
  timestamp: number;
  from: string;
  to: string;
  action: 'forward' | 'back' | 'click';
}

export interface ErrorEvent {
  timestamp: number;
  errorType: string;
  count: number;
}

export interface TaskCompletionEvent {
  timestamp: number;
  taskName: string;
  duration: number;
  success: boolean;
  errorCount: number;
}

export interface JourneyTelemetry {
  hesitationEvents: HesitationEvent[];
  rageClickEvents: RageClickEvent[];
  navigationEvents: NavigationEvent[];
  errorEvents: ErrorEvent[];
  taskCompletions: TaskCompletionEvent[];
  pointerEvents: PointerEvent[];
}

export interface JourneyMetrics {
  avgHesitationTime: number;
  hesitationCount: number;
  rageClickCount: number;
  backtrackCount: number;
  errorLoopCount: number;
  taskSuccessRate: number;
  avgTaskDuration: number;
}

export interface JourneyRadarResult {
  route: string;
  duration: number;
  metrics: JourneyMetrics;
  telemetry: JourneyTelemetry;
  timestamp: number;
}

export class JourneyRadarEngine {
  private telemetry: JourneyTelemetry = {
    hesitationEvents: [],
    rageClickEvents: [],
    navigationEvents: [],
    errorEvents: [],
    taskCompletions: [],
    pointerEvents: []
  };
  private startTime: number = 0;
  private currentRoute: string = '';

  constructor(private page: Page) {}

  async initialize() {
    await this.page.addInitScript(() => {
      // Privacy-first telemetry storage
      (window as any).__journeyTelemetry = {
        hesitationEvents: [],
        rageClickEvents: [],
        navigationEvents: [],
        errorEvents: new Map(),
        pointerEvents: [],
        clickHistory: []
      };

      // Track pointer events for hesitation detection
      let lastPointerMove = performance.now();
      let hoverStartTime = 0;
      let hoverElement: Element | null = null;

      document.addEventListener('pointermove', (e) => {
        const now = performance.now();
        const timeSinceLastMove = now - lastPointerMove;

        // Detect long pause before action (>1.5s threshold per Grok)
        if (timeSinceLastMove > 1500 && hoverElement) {
          (window as any).__journeyTelemetry.hesitationEvents.push({
            timestamp: now,
            duration: timeSinceLastMove,
            beforeAction: 'move',
            element: hoverElement.tagName.toLowerCase()
          });
        }

        lastPointerMove = now;

        // Track hover duration
        const target = e.target as Element;
        if (target !== hoverElement) {
          hoverElement = target;
          hoverStartTime = now;
        }

        // Aggregate pointer event (no coordinates stored per privacy)
        (window as any).__journeyTelemetry.pointerEvents.push({
          type: 'move',
          timestamp: now
        });
      }, { passive: true });

      // Track clicks for rage click detection
      document.addEventListener('click', (e) => {
        const now = performance.now();
        const target = e.target as Element;
        const x = e.clientX;
        const y = e.clientY;

        // Add to click history
        const clickHistory = (window as any).__journeyTelemetry.clickHistory;
        clickHistory.push({ timestamp: now, x, y, element: target.tagName.toLowerCase() });

        // Keep only last 10 clicks for rage detection
        if (clickHistory.length > 10) {
          clickHistory.shift();
        }

        // Detect rage clicks: ≥3 clicks in 1s within 24px radius (per GPT-5)
        const recentClicks = clickHistory.filter((click: any) => now - click.timestamp < 1000);

        if (recentClicks.length >= 3) {
          // Check if clicks are within 24px radius
          const distances = recentClicks.map((click: any) => {
            const dx = click.x - x;
            const dy = click.y - y;
            return Math.sqrt(dx * dx + dy * dy);
          });

          const maxDistance = Math.max(...distances);

          if (maxDistance <= 24) {
            (window as any).__journeyTelemetry.rageClickEvents.push({
              timestamp: now,
              clickCount: recentClicks.length,
              radius: maxDistance,
              element: target.tagName.toLowerCase(),
              x: Math.round(x / 100) * 100, // Anonymize coordinates to nearest 100px
              y: Math.round(y / 100) * 100
            });
          }
        }

        // Track click event
        (window as any).__journeyTelemetry.pointerEvents.push({
          type: 'click',
          timestamp: now,
          element: target.tagName.toLowerCase()
        });
      });

      // Track hover events
      document.addEventListener('mouseover', (e) => {
        const now = performance.now();
        const target = e.target as Element;

        if (hoverElement !== target) {
          hoverElement = target;
          hoverStartTime = now;
        }
      });

      document.addEventListener('mouseout', (e) => {
        const now = performance.now();

        if (hoverElement && hoverStartTime) {
          const hoverDuration = now - hoverStartTime;

          // Detect long hesitation on hover (>1.5s threshold)
          if (hoverDuration > 1500) {
            (window as any).__journeyTelemetry.hesitationEvents.push({
              timestamp: now,
              duration: hoverDuration,
              beforeAction: 'hover',
              element: hoverElement.tagName.toLowerCase()
            });
          }

          hoverElement = null;
          hoverStartTime = 0;
        }
      });

      // Track errors (privacy: only error types, no messages)
      const originalError = console.error;
      console.error = (...args) => {
        const errorMap = (window as any).__journeyTelemetry.errorEvents;
        const errorType = 'console-error';

        errorMap.set(errorType, {
          timestamp: performance.now(),
          errorType,
          count: (errorMap.get(errorType)?.count || 0) + 1
        });

        originalError.apply(console, args);
      };

      // Track navigation for backtracking detection
      let navigationHistory: string[] = [];

      (window as any).__trackNavigation = (from: string, to: string, action: string) => {
        navigationHistory.push(to);

        // Detect backtrack loop: A→B→A within 10s (per GPT-5)
        if (navigationHistory.length >= 3) {
          const recent = navigationHistory.slice(-3);
          if (recent[0] === recent[2] && action === 'back') {
            (window as any).__journeyTelemetry.navigationEvents.push({
              timestamp: performance.now(),
              from,
              to,
              action: 'backtrack-loop'
            });
          }
        }

        (window as any).__journeyTelemetry.navigationEvents.push({
          timestamp: performance.now(),
          from,
          to,
          action
        });

        // Keep only last 20 navigation events
        if (navigationHistory.length > 20) {
          navigationHistory.shift();
        }
      };
    });

    console.log('[Journey Radar] Initialized - Privacy-first telemetry active');
  }

  async pingFlow(route: string, taskDefinition?: { name: string; expectedDuration: number }): Promise<JourneyRadarResult> {
    this.startTime = Date.now();
    this.currentRoute = route;
    this.telemetry = {
      hesitationEvents: [],
      rageClickEvents: [],
      navigationEvents: [],
      errorEvents: [],
      taskCompletions: [],
      pointerEvents: []
    };

    await this.page.goto(route, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

    // Allow time for user interactions
    await this.page.waitForTimeout(2000);

    // Collect telemetry
    const pageTelemetry = await this.page.evaluate(() => {
      return {
        hesitationEvents: (window as any).__journeyTelemetry.hesitationEvents || [],
        rageClickEvents: (window as any).__journeyTelemetry.rageClickEvents || [],
        navigationEvents: (window as any).__journeyTelemetry.navigationEvents || [],
        errorEvents: Array.from((window as any).__journeyTelemetry.errorEvents?.values() || []),
        pointerEvents: (window as any).__journeyTelemetry.pointerEvents || []
      };
    });

    this.telemetry.hesitationEvents = pageTelemetry.hesitationEvents as HesitationEvent[];
    this.telemetry.rageClickEvents = pageTelemetry.rageClickEvents as RageClickEvent[];
    this.telemetry.navigationEvents = pageTelemetry.navigationEvents as NavigationEvent[];
    this.telemetry.errorEvents = pageTelemetry.errorEvents as ErrorEvent[];
    this.telemetry.pointerEvents = pageTelemetry.pointerEvents as PointerEvent[];

    // Track task completion if provided
    if (taskDefinition) {
      const taskDuration = Date.now() - this.startTime;
      const errorCount = this.telemetry.errorEvents.reduce((sum, e) => sum + e.count, 0);

      this.telemetry.taskCompletions.push({
        timestamp: Date.now(),
        taskName: taskDefinition.name,
        duration: taskDuration,
        success: errorCount === 0,
        errorCount
      });
    }

    const metrics = this.computeMetrics();
    const duration = Date.now() - this.startTime;

    return {
      route,
      duration,
      metrics,
      telemetry: this.telemetry,
      timestamp: Date.now()
    };
  }

  /**
   * Track hesitation on specific elements
   */
  async trackHesitation(selector: string, threshold: number = 1500): Promise<number> {
    const hesitationTime = await this.page.evaluate(
      ({ sel, thresh }) => {
        return new Promise<number>((resolve) => {
          const element = document.querySelector(sel);
          if (!element) {
            resolve(0);
            return;
          }

          let hoverStartTime = 0;

          const onMouseOver = () => {
            hoverStartTime = performance.now();
          };

          const onMouseOut = () => {
            if (hoverStartTime > 0) {
              const duration = performance.now() - hoverStartTime;
              if (duration > thresh) {
                resolve(duration);
              }
              hoverStartTime = 0;
            }
          };

          const onClick = () => {
            const duration = hoverStartTime > 0 ? performance.now() - hoverStartTime : 0;
            resolve(duration);
          };

          element.addEventListener('mouseover', onMouseOver);
          element.addEventListener('mouseout', onMouseOut);
          element.addEventListener('click', onClick);

          // Timeout after 10 seconds
          setTimeout(() => resolve(0), 10000);
        });
      },
      { sel: selector, thresh: threshold }
    );

    if (hesitationTime > threshold) {
      this.telemetry.hesitationEvents.push({
        timestamp: Date.now(),
        duration: hesitationTime,
        beforeAction: 'click',
        element: selector
      });
    }

    return hesitationTime;
  }

  /**
   * Detect rage clicks on specific element
   */
  async detectRageClicks(selector: string): Promise<number> {
    const rageClickCount = await this.page.evaluate((sel) => {
      return new Promise<number>((resolve) => {
        const element = document.querySelector(sel);
        if (!element) {
          resolve(0);
          return;
        }

        let clickHistory: number[] = [];

        const onClick = () => {
          const now = performance.now();
          clickHistory.push(now);

          // Keep only clicks within last 1 second
          clickHistory = clickHistory.filter(time => now - time < 1000);

          if (clickHistory.length >= 3) {
            resolve(clickHistory.length);
          }
        };

        element.addEventListener('click', onClick);

        // Timeout after 5 seconds
        setTimeout(() => resolve(clickHistory.length), 5000);
      });
    }, selector);

    return rageClickCount;
  }

  /**
   * Track backtracking through navigation history
   */
  trackBacktracking(from: string, to: string, action: 'forward' | 'back' | 'click') {
    this.telemetry.navigationEvents.push({
      timestamp: Date.now(),
      from,
      to,
      action
    });

    // Inject into page context for tracking
    this.page.evaluate(
      ({ f, t, a }) => {
        if ((window as any).__trackNavigation) {
          (window as any).__trackNavigation(f, t, a);
        }
      },
      { f: from, t: to, a: action }
    );
  }

  /**
   * Detect error loops (same error repeated)
   */
  detectErrorLoops(): number {
    const errorMap = new Map<string, number[]>();

    this.telemetry.errorEvents.forEach(error => {
      const timestamps = errorMap.get(error.errorType) || [];
      timestamps.push(error.timestamp);
      errorMap.set(error.errorType, timestamps);
    });

    let errorLoopCount = 0;
    errorMap.forEach((timestamps, errorType) => {
      // Check for errors within 1 minute window
      for (let i = 0; i < timestamps.length - 1; i++) {
        if (timestamps[i + 1] - timestamps[i] < 60000) {
          errorLoopCount++;
        }
      }
    });

    return errorLoopCount;
  }

  /**
   * Measure task completion success
   */
  measureTaskCompletion(taskName: string, success: boolean, duration: number) {
    const errorCount = this.telemetry.errorEvents.reduce((sum, e) => sum + e.count, 0);

    this.telemetry.taskCompletions.push({
      timestamp: Date.now(),
      taskName,
      duration,
      success,
      errorCount
    });
  }

  private computeMetrics(): JourneyMetrics {
    const hesitationEvents = this.telemetry.hesitationEvents;
    const rageClickEvents = this.telemetry.rageClickEvents;
    const navigationEvents = this.telemetry.navigationEvents;
    const errorEvents = this.telemetry.errorEvents;
    const taskCompletions = this.telemetry.taskCompletions;

    const avgHesitationTime =
      hesitationEvents.length > 0
        ? hesitationEvents.reduce((sum, e) => sum + e.duration, 0) / hesitationEvents.length
        : 0;

    const backtrackCount = navigationEvents.filter(e => (e.action as string) === 'backtrack-loop').length;
    const errorLoopCount = this.detectErrorLoops();

    const taskSuccessRate =
      taskCompletions.length > 0
        ? (taskCompletions.filter(t => t.success).length / taskCompletions.length) * 100
        : 0;

    const avgTaskDuration =
      taskCompletions.length > 0
        ? taskCompletions.reduce((sum, t) => sum + t.duration, 0) / taskCompletions.length
        : 0;

    return {
      avgHesitationTime: Math.round(avgHesitationTime),
      hesitationCount: hesitationEvents.length,
      rageClickCount: rageClickEvents.length,
      backtrackCount,
      errorLoopCount,
      taskSuccessRate: Math.round(taskSuccessRate),
      avgTaskDuration: Math.round(avgTaskDuration)
    };
  }

  async cleanup() {
    this.telemetry = {
      hesitationEvents: [],
      rageClickEvents: [],
      navigationEvents: [],
      errorEvents: [],
      taskCompletions: [],
      pointerEvents: []
    };
  }
}

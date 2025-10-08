/**
 * Journey Sonar Heuristics Engine
 * Implements GPT-5's Top 5 User Frustration Heuristics
 *
 * Based on UX research:
 * - Hesitation correlates r=0.65 with drop-offs (ACM 2023)
 * - Rage clicks predict 67% of abandons (UX Tigers 2023)
 */

interface JourneyHeuristic {
  name: string;
  condition: (data: any) => boolean;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  suggestion: string;
  affectedElements?: string[];
  delightMode?: boolean;
}

interface HeuristicResult {
  heuristic: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  suggestion: string;
  affectedElements?: string[];
  delightMode?: boolean;
}

export class JourneyHeuristicsEngine {

  /**
   * Analyze journey telemetry against all 5 heuristics + delight signals
   */
  analyze(telemetry: any): HeuristicResult[] {
    const issues: HeuristicResult[] = [];

    // Top 5 Frustration Heuristics
    const rageClickIssue = this.checkRageClicks(telemetry);
    if (rageClickIssue) issues.push(rageClickIssue);

    const hesitationIssue = this.checkLongHesitation(telemetry);
    if (hesitationIssue) issues.push(hesitationIssue);

    const backtrackIssue = this.checkBacktrackLoop(telemetry);
    if (backtrackIssue) issues.push(backtrackIssue);

    const errorLoopIssue = this.checkErrorLoop(telemetry);
    if (errorLoopIssue) issues.push(errorLoopIssue);

    const choiceOverloadIssue = this.checkChoiceOverload(telemetry);
    if (choiceOverloadIssue) issues.push(choiceOverloadIssue);

    // Delight Signals (Praise Mode!)
    const delightSignals = this.detectDelightSignals(telemetry);
    issues.push(...delightSignals);

    return issues;
  }

  /**
   * Heuristic 1: Rage Clicks
   * ≥3 clicks in 1s within 24px radius
   */
  private checkRageClicks(telemetry: any): HeuristicResult | null {
    const rageClickEvents = telemetry.rageClickEvents || [];

    if (rageClickEvents.length === 0) return null;

    // Group rage clicks by element
    const elementMap = new Map<string, number>();
    rageClickEvents.forEach((event: any) => {
      const element = event.element || 'unknown';
      elementMap.set(element, (elementMap.get(element) || 0) + 1);
    });

    const affectedElements = Array.from(elementMap.entries())
      .map(([element, count]) => `${element} (${count} rage events)`)
      .slice(0, 5);

    const totalRageClicks = rageClickEvents.reduce(
      (sum: number, e: any) => sum + e.clickCount,
      0
    );

    return {
      heuristic: 'rage-clicks',
      severity: 'critical',
      message: `Detected ${rageClickEvents.length} rage click events with ${totalRageClicks} total clicks. Users are frustrated with unresponsive elements.`,
      suggestion: 'Add loading feedback, disable buttons during processing, or improve response time. Rage clicks indicate users feel the UI is broken.',
      affectedElements
    };
  }

  /**
   * Heuristic 2: Long Hesitation
   * >1.5s pause before key action, repeated
   */
  private checkLongHesitation(telemetry: any): HeuristicResult | null {
    const hesitationEvents = telemetry.hesitationEvents || [];

    if (hesitationEvents.length === 0) return null;

    // Filter for significant hesitations (>1.5s threshold)
    const significantHesitations = hesitationEvents.filter(
      (e: any) => e.duration > 1500
    );

    if (significantHesitations.length === 0) return null;

    // Group by element
    const elementMap = new Map<string, { count: number; avgDuration: number; totalDuration: number }>();
    significantHesitations.forEach((event: any) => {
      const element = event.element || 'unknown';
      const existing = elementMap.get(element) || { count: 0, avgDuration: 0, totalDuration: 0 };
      existing.count++;
      existing.totalDuration += event.duration;
      existing.avgDuration = existing.totalDuration / existing.count;
      elementMap.set(element, existing);
    });

    // Find elements with repeated hesitation (≥2 times)
    const repeatedHesitations = Array.from(elementMap.entries())
      .filter(([_, data]) => data.count >= 2)
      .sort((a, b) => b[1].avgDuration - a[1].avgDuration);

    if (repeatedHesitations.length === 0) return null;

    const affectedElements = repeatedHesitations
      .slice(0, 5)
      .map(([element, data]) =>
        `${element} (${data.count}× hesitations, avg ${Math.round(data.avgDuration)}ms)`
      );

    const avgHesitationTime = Math.round(
      significantHesitations.reduce((sum: number, e: any) => sum + e.duration, 0) /
      significantHesitations.length
    );

    return {
      heuristic: 'long-hesitation',
      severity: 'warning',
      message: `Detected ${significantHesitations.length} long hesitations (avg ${avgHesitationTime}ms). Users are confused about what to do next.`,
      suggestion: 'Add clearer labels, tooltips, or onboarding hints. Long hesitation indicates unclear affordances or decision paralysis.',
      affectedElements
    };
  }

  /**
   * Heuristic 3: Backtrack Loop
   * A→B→A within 10s or back button spam
   */
  private checkBacktrackLoop(telemetry: any): HeuristicResult | null {
    const navigationEvents = telemetry.navigationEvents || [];

    if (navigationEvents.length < 3) return null;

    // Count backtrack-loop events
    const backtrackLoops = navigationEvents.filter(
      (e: any) => e.action === 'backtrack-loop'
    );

    if (backtrackLoops.length === 0) return null;

    // Analyze navigation patterns
    const navigationPaths = backtrackLoops.map((e: any) => `${e.from} → ${e.to}`);
    const uniquePaths = Array.from(new Set(navigationPaths)) as string[];

    return {
      heuristic: 'backtrack-loop',
      severity: 'warning',
      message: `Detected ${backtrackLoops.length} backtrack loops. Users are navigating back and forth, unable to find what they need.`,
      suggestion: 'Improve navigation clarity, add breadcrumbs, or provide better search functionality. Backtracking indicates lost users.',
      affectedElements: uniquePaths.slice(0, 5) as string[]
    };
  }

  /**
   * Heuristic 4: Error Loop
   * Same error twice in a minute with no recovery
   */
  private checkErrorLoop(telemetry: any): HeuristicResult | null {
    const errorEvents = telemetry.errorEvents || [];

    if (errorEvents.length === 0) return null;

    // Check for repeated errors (count > 1 indicates loop)
    const errorLoops = errorEvents.filter((e: any) => e.count > 1);

    if (errorLoops.length === 0) return null;

    const totalErrorCount = errorLoops.reduce((sum: number, e: any) => sum + e.count, 0);
    const affectedErrors = errorLoops
      .map((e: any) => `${e.errorType} (${e.count} occurrences)`)
      .slice(0, 5);

    return {
      heuristic: 'error-loop',
      severity: 'critical',
      message: `Detected ${errorLoops.length} error loops with ${totalErrorCount} total errors. Users are stuck in error states with no clear recovery path.`,
      suggestion: 'Add clear error messages with recovery instructions, inline validation, or prevent invalid states. Error loops trap users.',
      affectedElements: affectedErrors
    };
  }

  /**
   * Heuristic 5: Choice Overload
   * >7 equally weighted options OR 3+ primary CTAs
   * (Hick's Law: Decision time = log₂(n))
   */
  private checkChoiceOverload(telemetry: any): HeuristicResult | null {
    // This requires DOM analysis, so we'll check for it in the telemetry
    // For now, we'll detect excessive clicks/hesitations on navigation elements

    const hesitationEvents = telemetry.hesitationEvents || [];
    const navigationHesitations = hesitationEvents.filter(
      (e: any) => e.element === 'a' || e.element === 'button'
    );

    if (navigationHesitations.length < 5) return null;

    // Calculate average hesitation on navigation elements
    const avgNavigationHesitation =
      navigationHesitations.reduce((sum: number, e: any) => sum + e.duration, 0) /
      navigationHesitations.length;

    // If average hesitation > 2s, likely choice overload
    if (avgNavigationHesitation < 2000) return null;

    return {
      heuristic: 'choice-overload',
      severity: 'warning',
      message: `Detected choice overload: Average ${Math.round(avgNavigationHesitation)}ms hesitation on navigation elements. Users are overwhelmed by options.`,
      suggestion: 'Apply Hick\'s Law: Reduce choices to 5-7 options, use progressive disclosure, or establish clear visual hierarchy (1 primary CTA).',
      affectedElements: [`${navigationHesitations.length} navigation elements with long hesitation`]
    };
  }

  /**
   * Delight Signal Detection (Praise Mode!)
   */
  private detectDelightSignals(telemetry: any): HeuristicResult[] {
    const delightSignals: HeuristicResult[] = [];

    // 1. Smooth Path Ratio (no errors, no hesitation, fast completion)
    const taskCompletions = telemetry.taskCompletions || [];
    const smoothTasks = taskCompletions.filter(
      (t: any) => t.success && t.errorCount === 0 && t.duration < 5000
    );

    if (smoothTasks.length > 0) {
      const smoothPathRatio = (smoothTasks.length / taskCompletions.length) * 100;
      if (smoothPathRatio >= 80) {
        delightSignals.push({
          heuristic: 'smooth-path',
          severity: 'info',
          message: `✅ Smooth task flow! ${smoothPathRatio.toFixed(0)}% of tasks completed quickly without errors.`,
          suggestion: 'Great UX! Users are finding value effortlessly.',
          delightMode: true
        });
      }
    }

    // 2. Time-to-Wow (fast first value)
    if (taskCompletions.length > 0) {
      const fastCompletions = taskCompletions.filter((t: any) => t.duration < 3000);
      if (fastCompletions.length >= taskCompletions.length * 0.5) {
        delightSignals.push({
          heuristic: 'time-to-wow',
          severity: 'info',
          message: `✅ Fast time-to-value! ${fastCompletions.length} tasks completed in under 3 seconds.`,
          suggestion: 'Excellent! Users are getting value immediately.',
          delightMode: true
        });
      }
    }

    // 3. Low Frustration (no rage clicks, minimal hesitation)
    const rageClickEvents = telemetry.rageClickEvents || [];
    const hesitationEvents = telemetry.hesitationEvents || [];

    if (rageClickEvents.length === 0 && hesitationEvents.length < 3) {
      delightSignals.push({
        heuristic: 'low-frustration',
        severity: 'info',
        message: '✅ Zero frustration! No rage clicks or excessive hesitation detected.',
        suggestion: 'Fantastic! Your UI is intuitive and responsive.',
        delightMode: true
      });
    }

    // 4. Task Success Rate
    if (taskCompletions.length > 0) {
      const successRate = (taskCompletions.filter((t: any) => t.success).length / taskCompletions.length) * 100;
      if (successRate === 100) {
        delightSignals.push({
          heuristic: 'perfect-success',
          severity: 'info',
          message: `✅ 100% task success rate! All ${taskCompletions.length} tasks completed successfully.`,
          suggestion: 'Outstanding! Your workflow is bulletproof.',
          delightMode: true
        });
      }
    }

    return delightSignals;
  }

  /**
   * Generate code fix example for a specific heuristic
   */
  generateCodeExample(heuristic: string, data?: any): string {
    const examples: { [key: string]: string } = {
      'rage-clicks': `/* Instead of unresponsive button: */
<button onClick={handleClick}>
  Submit
</button>

/* Add loading state and disable: */
<button
  onClick={handleClick}
  disabled={isLoading}
  className={isLoading ? 'opacity-50 cursor-not-allowed' : ''}
>
  {isLoading ? (
    <>
      <Spinner className="mr-2" />
      Processing...
    </>
  ) : 'Submit'}
</button>`,

      'long-hesitation': `/* Instead of unclear button: */
<button>Next</button>

/* Add clear affordance: */
<button
  aria-label="Continue to payment"
  className="relative group"
>
  Next
  <Tooltip>Continue to secure payment</Tooltip>
  <ArrowRight className="ml-2" />
</button>`,

      'backtrack-loop': `/* Instead of confusing navigation: */
<nav>
  <a href="/step1">Step 1</a>
  <a href="/step2">Step 2</a>
</nav>

/* Add breadcrumbs and progress: */
<nav aria-label="Progress">
  <ol className="flex items-center">
    <li className="completed">✓ Account Details</li>
    <li className="current">→ Payment Info</li>
    <li className="upcoming">Review Order</li>
  </ol>
</nav>`,

      'error-loop': `/* Instead of cryptic error: */
{error && <div>Error occurred</div>}

/* Add recovery path: */
{error && (
  <Alert severity="error">
    <strong>Payment failed:</strong> {error.message}
    <ul className="mt-2">
      <li>✓ Check card number and expiry</li>
      <li>✓ Ensure sufficient funds</li>
    </ul>
    <button onClick={retry}>Try Again</button>
    <a href="/help">Contact Support</a>
  </Alert>
)}`,

      'choice-overload': `/* Instead of 10 equal CTAs: */
<div>
  <button>Option 1</button>
  <button>Option 2</button>
  <button>Option 3</button>
  {/* ...10 more buttons */}
</div>

/* Use visual hierarchy (1 primary): */
<div className="flex gap-2">
  <button className="btn-primary">
    Recommended: Start Free Trial
  </button>
  <button className="btn-secondary">
    See Pricing
  </button>
  <Dropdown label="More Options">
    <DropdownItem>View Demo</DropdownItem>
    <DropdownItem>Contact Sales</DropdownItem>
  </Dropdown>
</div>`
    };

    return examples[heuristic] || '// No code example available';
  }
}

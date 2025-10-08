/**
 * Journey Sonar Critique Adapter
 * Generates UX improvement suggestions based on frustration patterns
 * Includes Praise Mode for celebrating great UX!
 */

import { JourneyHeuristicsEngine } from './heuristics';
import { JourneyNormalizer } from './normalizer';

interface Critique {
  heuristic: string;
  severity: 'critical' | 'warning' | 'info';
  finding: string;
  suggestion: string;
  codeExample?: string;
  affectedElements?: string[];
  delightMode?: boolean;
}

export class JourneyCritiqueAdapter {
  private heuristicsEngine = new JourneyHeuristicsEngine();
  private normalizer = new JourneyNormalizer();

  /**
   * Generate comprehensive UX critique from journey telemetry
   */
  generateCritique(normalizedData: any): Critique[] {
    const critiques: Critique[] = [];

    // Analyze heuristics
    const heuristicResults = this.heuristicsEngine.analyze(normalizedData.telemetry);

    // Convert heuristic results to critiques
    heuristicResults.forEach(result => {
      const codeExample = this.heuristicsEngine.generateCodeExample(result.heuristic);

      critiques.push({
        heuristic: result.heuristic,
        severity: result.severity,
        finding: result.message,
        suggestion: result.suggestion,
        codeExample: codeExample !== '// No code example available' ? codeExample : undefined,
        affectedElements: result.affectedElements,
        delightMode: result.delightMode || false
      });
    });

    // Add metric-based critiques
    const metricCritiques = this.generateMetricCritiques(normalizedData);
    critiques.push(...metricCritiques);

    return critiques;
  }

  /**
   * Generate critiques based on normalized metrics
   */
  private generateMetricCritiques(normalizedData: any): Critique[] {
    const critiques: Critique[] = [];
    const { metrics, delight } = normalizedData;

    // Frustration Score critique
    if (metrics.frustrationScore > 0.5) {
      critiques.push({
        heuristic: 'high-frustration-score',
        severity: 'critical',
        finding: `Overall Frustration Score is ${(metrics.frustrationScore * 100).toFixed(1)}%. Users are highly frustrated.`,
        suggestion: 'Conduct user testing to identify specific pain points. Prioritize fixing rage click events and reducing hesitation.',
        codeExample: this.generateFrustrationFixExample(metrics)
      });
    }

    // Hesitation ratio critique
    if (metrics.hesitationRatio > 0.3) {
      critiques.push({
        heuristic: 'high-hesitation',
        severity: 'warning',
        finding: `Users spend ${(metrics.hesitationRatio * 100).toFixed(1)}% of their time hesitating. Affordances are unclear.`,
        suggestion: 'Add tooltips, improve button labels, or provide onboarding guidance.',
        codeExample: `/* Add helpful tooltips: */
<button
  className="relative group"
  aria-label="Save your changes"
>
  Save
  <span className="tooltip">
    Save changes to your profile
  </span>
</button>`
      });
    }

    // Task success rate critique
    if (metrics.taskSuccessRate < 80 && metrics.taskSuccessRate > 0) {
      critiques.push({
        heuristic: 'low-success-rate',
        severity: 'critical',
        finding: `Only ${metrics.taskSuccessRate.toFixed(1)}% of tasks succeed. Users are failing to complete workflows.`,
        suggestion: 'Simplify workflows, add inline validation, and provide clear error recovery paths.',
        codeExample: `/* Add progressive validation: */
<form onSubmit={handleSubmit}>
  <Input
    name="email"
    onChange={validateEmail}
    error={emailError}
    helperText={emailError || "We'll never share your email"}
  />
  <button disabled={!isValid}>
    Continue
  </button>
</form>`
      });
    }

    // Slow task duration critique
    if (metrics.avgTaskDuration > 15000) {
      critiques.push({
        heuristic: 'slow-tasks',
        severity: 'warning',
        finding: `Average task duration is ${(metrics.avgTaskDuration / 1000).toFixed(1)}s. Users are spending too long on tasks.`,
        suggestion: 'Optimize performance, reduce form fields, or split tasks into smaller steps.',
        codeExample: `/* Use multi-step wizard: */
<Wizard>
  <Step title="Basic Info">
    <Input name="name" />
    <Input name="email" />
  </Step>
  <Step title="Details">
    <Input name="address" />
    <Input name="phone" />
  </Step>
  <Step title="Review">
    <Summary data={formData} />
  </Step>
</Wizard>`
      });
    }

    // Delight Mode - Praise great UX!
    if (delight.frustrationLevel === 'none') {
      critiques.push({
        heuristic: 'zero-frustration',
        severity: 'info',
        finding: '✅ Zero frustration detected! Your UX is delightful.',
        suggestion: 'Maintain this quality. Consider documenting your patterns for reuse.',
        delightMode: true
      });
    }

    if (delight.smoothPathRatio === 100) {
      critiques.push({
        heuristic: 'perfect-flow',
        severity: 'info',
        finding: '✅ 100% smooth task flow! All users completed without errors.',
        suggestion: 'Outstanding! Share this success with the team.',
        delightMode: true
      });
    }

    if (delight.timeToWow < 2000) {
      critiques.push({
        heuristic: 'instant-value',
        severity: 'info',
        finding: `✅ Lightning-fast time-to-value (${(delight.timeToWow / 1000).toFixed(1)}s)! Users are delighted immediately.`,
        suggestion: 'Excellent! This is best-in-class UX.',
        delightMode: true
      });
    }

    return critiques;
  }

  /**
   * Generate code example for fixing high frustration
   */
  private generateFrustrationFixExample(metrics: any): string {
    return `/* Reduce frustration with better feedback: */

// 1. Add loading states
const [isLoading, setIsLoading] = useState(false);

async function handleAction() {
  setIsLoading(true);
  try {
    await performAction();
    toast.success('Action completed!');
  } catch (error) {
    toast.error('Failed: ' + error.message);
  } finally {
    setIsLoading(false);
  }
}

// 2. Prevent rage clicks
<button
  onClick={handleAction}
  disabled={isLoading}
  className={isLoading ? 'cursor-wait opacity-50' : ''}
>
  {isLoading ? <Spinner /> : 'Submit'}
</button>

// 3. Add progress indicators
<ProgressBar
  current={step}
  total={totalSteps}
  label="Step {step} of {totalSteps}"
/>`;
  }

  /**
   * Format critiques as markdown report
   */
  formatAsMarkdown(critiques: Critique[]): string {
    const critical = critiques.filter(c => c.severity === 'critical');
    const warnings = critiques.filter(c => c.severity === 'warning');
    const delight = critiques.filter(c => c.delightMode === true);
    const info = critiques.filter(c => c.severity === 'info' && !c.delightMode);

    let markdown = '# Journey Sonar - UX Critique Report\n\n';
    markdown += `**Generated:** ${new Date().toLocaleString()}\n\n`;

    // Summary
    markdown += '## Summary\n\n';
    markdown += `- **Critical Issues:** ${critical.length}\n`;
    markdown += `- **Warnings:** ${warnings.length}\n`;
    markdown += `- **Info:** ${info.length}\n`;
    markdown += `- **Delight Signals:** ${delight.length}\n\n`;

    // Delight signals first (Praise Mode!)
    if (delight.length > 0) {
      markdown += '## 🎉 Delight Signals (Praise Mode!)\n\n';
      delight.forEach(c => {
        markdown += `### ${c.finding}\n\n`;
        markdown += `**Suggestion:** ${c.suggestion}\n\n`;
      });
    }

    // Critical issues
    if (critical.length > 0) {
      markdown += '## 🚨 Critical Issues\n\n';
      critical.forEach(c => {
        markdown += `### ${c.heuristic}\n\n`;
        markdown += `**Finding:** ${c.finding}\n\n`;
        markdown += `**Suggestion:** ${c.suggestion}\n\n`;

        if (c.affectedElements && c.affectedElements.length > 0) {
          markdown += '**Affected Elements:**\n';
          c.affectedElements.forEach(el => {
            markdown += `- ${el}\n`;
          });
          markdown += '\n';
        }

        if (c.codeExample) {
          markdown += '**Code Example:**\n\n```tsx\n' + c.codeExample + '\n```\n\n';
        }

        markdown += '---\n\n';
      });
    }

    // Warnings
    if (warnings.length > 0) {
      markdown += '## ⚠️ Warnings\n\n';
      warnings.forEach(c => {
        markdown += `### ${c.heuristic}\n\n`;
        markdown += `**Finding:** ${c.finding}\n\n`;
        markdown += `**Suggestion:** ${c.suggestion}\n\n`;

        if (c.affectedElements && c.affectedElements.length > 0) {
          markdown += '**Affected Elements:**\n';
          c.affectedElements.forEach(el => {
            markdown += `- ${el}\n`;
          });
          markdown += '\n';
        }

        if (c.codeExample) {
          markdown += '**Code Example:**\n\n```tsx\n' + c.codeExample + '\n```\n\n';
        }

        markdown += '---\n\n';
      });
    }

    // Info
    if (info.length > 0) {
      markdown += '## ℹ️ Informational\n\n';
      info.forEach(c => {
        markdown += `### ${c.heuristic}\n\n`;
        markdown += `**Finding:** ${c.finding}\n\n`;
        markdown += `**Suggestion:** ${c.suggestion}\n\n`;
        markdown += '---\n\n';
      });
    }

    return markdown;
  }

  /**
   * Format critiques as JSON for programmatic use
   */
  formatAsJSON(critiques: Critique[]): string {
    return JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        summary: {
          critical: critiques.filter(c => c.severity === 'critical').length,
          warnings: critiques.filter(c => c.severity === 'warning').length,
          info: critiques.filter(c => c.severity === 'info').length,
          delight: critiques.filter(c => c.delightMode === true).length
        },
        critiques
      },
      null,
      2
    );
  }
}

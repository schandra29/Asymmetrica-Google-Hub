/**
 * Design Sonar Heuristics Engine
 * Implements GPT-5's Top 5 Design Quality Heuristics
 */

import * as tinycolor2 from 'tinycolor2';
const tinycolor = (tinycolor2 as any).default || tinycolor2;

interface DesignHeuristic {
  name: string;
  condition: (data: any) => boolean;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  suggestion: string;
  affectedElements?: string[];
}

interface HeuristicResult {
  heuristic: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  suggestion: string;
  affectedElements?: string[];
}

export class DesignHeuristicsEngine {

  /**
   * Analyze design telemetry against all 5 heuristics
   */
  analyze(telemetry: any): HeuristicResult[] {
    const issues: HeuristicResult[] = [];

    // 1. Low Contrast Text (WCAG < 4.5:1)
    const contrastIssues = this.checkContrast(telemetry.colors);
    if (contrastIssues) issues.push(contrastIssues);

    // 2. Type Hierarchy Flat (adjacent levels < 8% size delta)
    const hierarchyIssues = this.checkTypeHierarchy(telemetry.typography);
    if (hierarchyIssues) issues.push(hierarchyIssues);

    // 3. Spacing Inconsistent (off-grid spacing)
    const spacingIssues = this.checkSpacing(telemetry.spacing);
    if (spacingIssues) issues.push(spacingIssues);

    // 4. Palette Bloat (>10 semantic colors)
    const paletteIssues = this.checkPalette(telemetry.colors);
    if (paletteIssues) issues.push(paletteIssues);

    // 5. Focus State Missing (no visible focus or < 3:1 contrast)
    const focusIssues = this.checkFocusStates(telemetry.focusStates);
    if (focusIssues) issues.push(focusIssues);

    return issues;
  }

  /**
   * Heuristic 1: Low Contrast Text
   * WCAG AA requires 4.5:1 for normal text, 3:1 for large text
   */
  private checkContrast(colors: any[]): HeuristicResult | null {
    const textColors = colors.filter(c => c.usage === 'text' && c.contrast);
    const lowContrastColors = textColors.filter(c => c.contrast && c.contrast < 4.5);

    if (lowContrastColors.length === 0) return null;

    const affectedElements = lowContrastColors.map(c => c.element).filter((v, i, a) => a.indexOf(v) === i);
    const avgContrast = lowContrastColors.reduce((sum, c) => sum + (c.contrast || 0), 0) / lowContrastColors.length;

    return {
      heuristic: 'low-contrast-text',
      severity: 'critical',
      message: `Found ${lowContrastColors.length} text elements with contrast below WCAG AA (4.5:1). Average contrast: ${avgContrast.toFixed(2)}:1`,
      suggestion: 'Increase color contrast to meet WCAG AA standards. Use darker text on light backgrounds or lighter text on dark backgrounds.',
      affectedElements
    };
  }

  /**
   * Heuristic 2: Type Hierarchy Flat
   * Adjacent heading levels should differ by at least 8% in size
   */
  private checkTypeHierarchy(typography: any[]): HeuristicResult | null {
    // Group by element type
    const headings = typography.filter(t => /^h[1-6]$/.test(t.element));

    if (headings.length < 2) return null;

    // Sort by heading level
    const sortedHeadings = headings.sort((a, b) => {
      const levelA = parseInt(a.element.replace('h', ''));
      const levelB = parseInt(b.element.replace('h', ''));
      return levelA - levelB;
    });

    // Calculate average font size per heading level
    const headingLevels: { [key: string]: number[] } = {};
    sortedHeadings.forEach(h => {
      const level = h.element;
      if (!headingLevels[level]) headingLevels[level] = [];
      headingLevels[level].push(h.fontSize);
    });

    const avgSizes: { level: string; size: number }[] = [];
    Object.keys(headingLevels).forEach(level => {
      const sizes = headingLevels[level];
      const avgSize = sizes.reduce((sum, s) => sum + s, 0) / sizes.length;
      avgSizes.push({ level, size: avgSize });
    });

    // Check for flat hierarchy (< 8% difference)
    const flatPairs: string[] = [];
    for (let i = 0; i < avgSizes.length - 1; i++) {
      const current = avgSizes[i];
      const next = avgSizes[i + 1];
      const delta = Math.abs(current.size - next.size) / current.size;

      if (delta < 0.08) {
        flatPairs.push(`${current.level} (${current.size.toFixed(1)}px) → ${next.level} (${next.size.toFixed(1)}px): ${(delta * 100).toFixed(1)}% delta`);
      }
    }

    if (flatPairs.length === 0) return null;

    return {
      heuristic: 'type-hierarchy-flat',
      severity: 'warning',
      message: `Typography hierarchy is too flat. ${flatPairs.length} heading pairs have less than 8% size difference.`,
      suggestion: 'Use a modular scale (1.2×, 1.25×, 1.333×, 1.5×, or 1.618× golden ratio) to create clear hierarchy.',
      affectedElements: flatPairs
    };
  }

  /**
   * Heuristic 3: Spacing Inconsistent
   * Spacing should follow a grid scale (4/8/16/24/32/48/64)
   */
  private checkSpacing(spacing: any[]): HeuristicResult | null {
    const gridScale = [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96, 128];

    const offGridSpacing = spacing.filter(s => {
      const value = s.value;
      // Check if value is close to any grid value (within 2px tolerance)
      return !gridScale.some(grid => Math.abs(value - grid) <= 2);
    });

    if (offGridSpacing.length === 0) return null;

    // Calculate percentage of off-grid spacing
    const offGridPercentage = (offGridSpacing.length / spacing.length) * 100;

    if (offGridPercentage < 20) return null; // Tolerate up to 20% off-grid

    const examples = offGridSpacing.slice(0, 5).map(s =>
      `${s.element} ${s.type}: ${s.value.toFixed(0)}px`
    );

    return {
      heuristic: 'spacing-inconsistent',
      severity: 'warning',
      message: `${offGridPercentage.toFixed(1)}% of spacing values are off-grid (not in 4/8/16/24/32 scale).`,
      suggestion: 'Use consistent spacing scale: 4px, 8px, 16px, 24px, 32px, 48px, 64px. This creates visual rhythm and easier maintenance.',
      affectedElements: examples
    };
  }

  /**
   * Heuristic 4: Palette Bloat
   * Should have ≤10 semantic color tokens
   */
  private checkPalette(colors: any[]): HeuristicResult | null {
    // Deduplicate colors by hex value
    const uniqueColors = new Map<string, any>();

    colors.forEach(c => {
      // Normalize color using tinycolor2
      const color = tinycolor(c.hex);
      const hex = color.toHexString();

      if (!uniqueColors.has(hex)) {
        uniqueColors.set(hex, c);
      }
    });

    const colorCount = uniqueColors.size;

    if (colorCount <= 10) return null;

    // List the colors
    const colorList = Array.from(uniqueColors.values())
      .slice(0, 15)
      .map(c => `${c.hex} (${c.usage})`);

    return {
      heuristic: 'palette-bloat',
      severity: 'warning',
      message: `Color palette has ${colorCount} unique colors (recommended: ≤10 semantic tokens).`,
      suggestion: 'Consolidate similar colors into semantic tokens. Use a design system with primary, secondary, accent, neutral, success, warning, error palettes.',
      affectedElements: colorList
    };
  }

  /**
   * Heuristic 5: Focus State Missing
   * Interactive elements should have visible focus with ≥3:1 contrast
   */
  private checkFocusStates(focusStates: any[]): HeuristicResult | null {
    const missingFocus = focusStates.filter(f => !f.hasFocus);
    const lowContrastFocus = focusStates.filter(f =>
      f.hasFocus && f.focusContrast && f.focusContrast < 3
    );

    const totalIssues = missingFocus.length + lowContrastFocus.length;

    if (totalIssues === 0) return null;

    const issuePercentage = (totalIssues / focusStates.length) * 100;

    const affectedElements = [
      ...missingFocus.slice(0, 3).map(f => `${f.element} (no focus outline)`),
      ...lowContrastFocus.slice(0, 3).map(f => `${f.element} (contrast: ${f.focusContrast?.toFixed(2)}:1)`)
    ];

    return {
      heuristic: 'focus-state-missing',
      severity: 'critical',
      message: `${issuePercentage.toFixed(1)}% of interactive elements lack proper focus states (${totalIssues}/${focusStates.length}).`,
      suggestion: 'Add visible focus indicators with minimum 3:1 contrast ratio. Example: outline: 2px solid #4A90E2',
      affectedElements
    };
  }

  /**
   * Generate code fix example for a specific heuristic
   */
  generateCodeExample(heuristic: string, data?: any): string {
    const examples: { [key: string]: string } = {
      'low-contrast-text': `/* Instead of low contrast: */
.text {
  color: #666666; /* 3.2:1 contrast ❌ */
  background: #ffffff;
}

/* Use high contrast: */
.text {
  color: #1a1a1a; /* 7.1:1 contrast ✅ */
  background: #ffffff;
}`,

      'type-hierarchy-flat': `/* Instead of flat hierarchy: */
h1 { font-size: 20px; } /* ❌ Too similar */
h2 { font-size: 19px; }

/* Use modular scale (1.25× ratio): */
h1 { font-size: 32px; } /* ✅ Clear hierarchy */
h2 { font-size: 24px; } /* 1.333× ratio */
h3 { font-size: 18px; }`,

      'spacing-inconsistent': `/* Instead of arbitrary spacing: */
.card {
  margin: 13px; /* ❌ Off-grid */
  padding: 17px;
}

/* Use grid-compliant spacing: */
.card {
  margin: 16px; /* ✅ On 8px grid */
  padding: 24px;
}`,

      'palette-bloat': `/* Instead of many similar colors: */
.accent-1 { color: #FF6B6C; } /* ❌ Redundant */
.accent-2 { color: #FF7080; }
.accent-3 { color: #FF5A5C; }

/* Consolidate into semantic tokens: */
:root {
  --color-accent: #FF6B6C; /* ✅ Single source */
}
.accent { color: var(--color-accent); }`,

      'focus-state-missing': `/* Instead of no focus state: */
button {
  outline: none; /* ❌ Accessibility issue */
}

/* Add visible focus with high contrast: */
button:focus-visible {
  outline: 2px solid #4A90E2; /* ✅ 3:1+ contrast */
  outline-offset: 2px;
}`
    };

    return examples[heuristic] || '// No code example available';
  }
}

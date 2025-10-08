/**
 * DesignRadarEngine - Visual Quality Telemetry Collector
 * Captures design harmony metrics using DOM inspection and color analysis
 * Based on GPT-5 Design Sonar specifications
 */

import { Page } from '@playwright/test';

export interface ColorTelemetry {
  hex: string;
  lch: { l: number; c: number; h: number };
  usage: 'text' | 'background' | 'border' | 'accent';
  contrast?: number;
  element?: string;
}

export interface TypographyTelemetry {
  fontSize: number;
  fontWeight: string;
  lineHeight: number;
  element: string;
  selector: string;
}

export interface SpacingTelemetry {
  type: 'margin' | 'padding';
  value: number;
  element: string;
  selector: string;
}

export interface FocusStateTelemetry {
  element: string;
  selector: string;
  hasFocus: boolean;
  focusContrast?: number;
  outlineWidth?: number;
}

export interface DesignTelemetry {
  colors: ColorTelemetry[];
  typography: TypographyTelemetry[];
  spacing: SpacingTelemetry[];
  focusStates: FocusStateTelemetry[];
  layoutMetrics: {
    totalElements: number;
    sampledElements: number;
  };
}

export interface DesignRadarResult {
  route: string;
  duration: number;
  telemetry: DesignTelemetry;
  timestamp: number;
}

export class DesignRadarEngine {
  private telemetry: DesignTelemetry = {
    colors: [],
    typography: [],
    spacing: [],
    focusStates: [],
    layoutMetrics: { totalElements: 0, sampledElements: 0 }
  };
  private startTime: number = 0;

  constructor(private page: Page) {}

  async initialize() {
    // Inject DOM inspection utilities
    await this.page.addInitScript(() => {
      (window as any).__designTelemetry = {
        colors: [],
        typography: [],
        spacing: [],
        focusStates: []
      };

      // Helper: Convert RGB to LCH
      (window as any).__rgbToLch = (r: number, g: number, b: number) => {
        // Simplified LCH conversion (proper implementation would use color spaces)
        // For now, using HSL as proxy (will be corrected by tinycolor2 on backend)
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const l = (max + min) / 2;

        let s = 0;
        if (max !== min) {
          s = l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
        }

        let h = 0;
        if (max !== min) {
          if (max === r) {
            h = ((g - b) / (max - min)) % 6;
          } else if (max === g) {
            h = (b - r) / (max - min) + 2;
          } else {
            h = (r - g) / (max - min) + 4;
          }
          h = h * 60;
          if (h < 0) h += 360;
        }

        return { l: l * 100, c: s * 100, h };
      };

      // Helper: Calculate contrast ratio
      (window as any).__getContrastRatio = (rgb1: number[], rgb2: number[]) => {
        const luminance = (rgb: number[]) => {
          const [r, g, b] = rgb.map(v => {
            v = v / 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
          });
          return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        };

        const l1 = luminance(rgb1);
        const l2 = luminance(rgb2);
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
      };

      // Helper: Parse RGB string
      (window as any).__parseRgb = (rgbString: string): number[] => {
        const match = rgbString.match(/\d+/g);
        return match ? match.slice(0, 3).map(Number) : [0, 0, 0];
      };
    });
  }

  async pingFlow(route: string): Promise<DesignRadarResult> {
    this.startTime = Date.now();
    this.telemetry = {
      colors: [],
      typography: [],
      spacing: [],
      focusStates: [],
      layoutMetrics: { totalElements: 0, sampledElements: 0 }
    };

    await this.page.goto(route, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await this.page.waitForTimeout(1000);

    // Collect design telemetry
    await this.collectColorTelemetry();
    await this.collectTypographyTelemetry();
    await this.collectSpacingTelemetry();
    await this.collectFocusStateTelemetry();

    const duration = Date.now() - this.startTime;

    return {
      route,
      duration,
      telemetry: this.telemetry,
      timestamp: Date.now()
    };
  }

  private async collectColorTelemetry() {
    const colorData = await this.page.evaluate(() => {
      const colors: any[] = [];
      const allElements = document.querySelectorAll('*');
      const totalElements = allElements.length;

      // Sample every 10th element for performance (Grok's guidance)
      const samplingRate = 10;
      const sampledElements: Element[] = [];

      for (let i = 0; i < allElements.length; i += samplingRate) {
        sampledElements.push(allElements[i]);
      }

      sampledElements.forEach((element) => {
        const computed = getComputedStyle(element);
        const bgColor = computed.backgroundColor;
        const textColor = computed.color;
        const borderColor = computed.borderColor;

        const parseColor = (colorStr: string, usage: string, elem: Element): any => {
          if (!colorStr || colorStr === 'rgba(0, 0, 0, 0)' || colorStr === 'transparent') {
            return null;
          }

          const rgb = (window as any).__parseRgb(colorStr);
          const lch = (window as any).__rgbToLch(rgb[0], rgb[1], rgb[2]);

          return {
            hex: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`,
            lch,
            usage,
            element: elem.tagName.toLowerCase()
          };
        };

        const bgColorData = parseColor(bgColor, 'background', element);
        let textColorData = parseColor(textColor, 'text', element);

        if (bgColorData) colors.push(bgColorData);
        if (textColorData) {
          // Calculate contrast if we have both text and background
          if (bgColorData) {
            const bgRgb = (window as any).__parseRgb(bgColor);
            const textRgb = (window as any).__parseRgb(textColor);
            const contrastRatio = (window as any).__getContrastRatio(textRgb, bgRgb);
            textColorData = { ...textColorData, contrast: contrastRatio };
          }
          colors.push(textColorData);
        }
      });

      return { colors, totalElements, sampledElements: sampledElements.length };
    });

    this.telemetry.colors = colorData.colors;
    this.telemetry.layoutMetrics.totalElements = colorData.totalElements;
    this.telemetry.layoutMetrics.sampledElements = colorData.sampledElements;
  }

  private async collectTypographyTelemetry() {
    const typographyData = await this.page.evaluate(() => {
      const typography: any[] = [];
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, button');

      // Sample for performance
      const samplingRate = 5;
      const sampledHeadings: Element[] = [];

      for (let i = 0; i < headings.length; i += samplingRate) {
        sampledHeadings.push(headings[i]);
      }

      sampledHeadings.forEach((element, index) => {
        const computed = getComputedStyle(element);
        const fontSize = parseFloat(computed.fontSize);
        const lineHeight = parseFloat(computed.lineHeight);

        typography.push({
          fontSize,
          fontWeight: computed.fontWeight,
          lineHeight: isNaN(lineHeight) ? fontSize * 1.5 : lineHeight,
          element: element.tagName.toLowerCase(),
          selector: `${element.tagName.toLowerCase()}:nth-of-type(${index + 1})`
        });
      });

      return typography;
    });

    this.telemetry.typography = typographyData;
  }

  private async collectSpacingTelemetry() {
    const spacingData = await this.page.evaluate(() => {
      const spacing: any[] = [];
      const elements = document.querySelectorAll('div, section, article, main, header, footer, nav');

      // Sample every 10th element
      const samplingRate = 10;
      const sampledElements: Element[] = [];

      for (let i = 0; i < elements.length; i += samplingRate) {
        sampledElements.push(elements[i]);
      }

      sampledElements.forEach((element, index) => {
        const computed = getComputedStyle(element);
        const selector = `${element.tagName.toLowerCase()}:nth-of-type(${index + 1})`;

        // Extract margin values
        ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'].forEach(prop => {
          const value = parseFloat(computed[prop as any]);
          if (!isNaN(value) && value > 0) {
            spacing.push({
              type: 'margin',
              value,
              element: element.tagName.toLowerCase(),
              selector
            });
          }
        });

        // Extract padding values
        ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'].forEach(prop => {
          const value = parseFloat(computed[prop as any]);
          if (!isNaN(value) && value > 0) {
            spacing.push({
              type: 'padding',
              value,
              element: element.tagName.toLowerCase(),
              selector
            });
          }
        });
      });

      return spacing;
    });

    this.telemetry.spacing = spacingData;
  }

  private async collectFocusStateTelemetry() {
    const focusData = await this.page.evaluate(() => {
      const focusStates: any[] = [];
      const interactiveElements = document.querySelectorAll('button, a, input, textarea, select');

      // Sample every 5th element
      const samplingRate = 5;
      const sampledElements: Element[] = [];

      for (let i = 0; i < interactiveElements.length; i += samplingRate) {
        sampledElements.push(interactiveElements[i]);
      }

      sampledElements.forEach((element, index) => {
        const computed = getComputedStyle(element);
        const outlineWidth = parseFloat(computed.outlineWidth);
        const outlineStyle = computed.outlineStyle;
        const outlineColor = computed.outlineColor;

        const hasFocus = outlineStyle !== 'none' && !isNaN(outlineWidth) && outlineWidth > 0;

        let focusContrast: number | undefined;
        if (hasFocus && outlineColor) {
          const bgColor = computed.backgroundColor;
          const outlineRgb = (window as any).__parseRgb(outlineColor);
          const bgRgb = (window as any).__parseRgb(bgColor);
          focusContrast = (window as any).__getContrastRatio(outlineRgb, bgRgb);
        }

        focusStates.push({
          element: element.tagName.toLowerCase(),
          selector: `${element.tagName.toLowerCase()}:nth-of-type(${index + 1})`,
          hasFocus,
          focusContrast,
          outlineWidth
        });
      });

      return focusStates;
    });

    this.telemetry.focusStates = focusData;
  }

  async cleanup() {
    this.telemetry = {
      colors: [],
      typography: [],
      spacing: [],
      focusStates: [],
      layoutMetrics: { totalElements: 0, sampledElements: 0 }
    };
  }
}

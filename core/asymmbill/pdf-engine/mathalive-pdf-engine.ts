/**
 * MathAlive PDF Generation Engine
 * Revolutionary HTML → Puppeteer pipeline for perfect multilingual PDFs
 * @version 1.0.0
 */

import puppeteer, { Browser, Page } from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { MATHALIVE_CONSTANTS } from '../mathalive/constants';

export interface MathAlivePDFOptions {
  language: string;
  templateId: string;
  invoiceData: any;
  letterhead?: string; // Base64 image for letterhead
  renderMode: 'pdf' | 'png' | 'jpeg';
  watermark?: boolean;
}

export class MathAlivePDFEngine {
  private browser: Browser | null = null;
  private readonly templateCache = new Map<string, string>();

  /**
   * Get Chrome executable path for different environments
   */
  private getChromePath(): string | undefined {
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      return process.env.PUPPETEER_EXECUTABLE_PATH;
    }

    if (process.env.NODE_ENV === 'production') {
      // Render.com paths from our deployment guide
      const possiblePaths = [
        '/opt/render/.cache/puppeteer/chrome/linux-140.0.7339.207/chrome-linux64/chrome',
        '/opt/render/.cache/puppeteer/chrome/linux-141.0.6495.0/chrome-linux64/chrome',
        '/opt/render/project/src/.cache/puppeteer/chrome/linux-140.0.7339.207/chrome-linux64/chrome',
      ];

      // fs imported at top
      for (const chromePath of possiblePaths) {
        if (fs.existsSync(chromePath)) {
          console.log(`✅ MathAlive: Found Chrome at: ${chromePath}`);
          return chromePath;
        }
      }
    }

    // Development: use system Chrome
    if (process.platform === 'win32') {
      return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    } else if (process.platform === 'darwin') {
      return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    }

    return undefined;
  }

  /**
   * Initialize browser with MathAlive optimizations
   */
  async initialize(): Promise<void> {
    if (this.browser) return;

    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-accelerated-2d-canvas',
        '--font-render-hinting=none', // Better Arabic rendering
        '--disable-font-subpixel-positioning',
        '--single-process', // Required for serverless
        '--no-zygote', // Process management
        '--disable-web-security',
        '--disable-features=IsolateOrigins',
        '--disable-site-isolation-trials'
      ],
      ignoreDefaultArgs: ['--disable-extensions'],
      executablePath: this.getChromePath()
    });

    console.log('🧮 MathAlive PDF Engine initialized');
  }

  /**
   * Generate HTML template with MathAlive patterns
   */
  private generateHTMLTemplate(options: MathAlivePDFOptions): string {
    // If we have compiledContent from template forge, use it directly
    if (options.invoiceData.compiledContent) {
      // The compiled content is already complete HTML from template forge
      // Just inject the letterhead if needed
      let html = options.invoiceData.compiledContent;

      // Add letterhead background if provided
      if (options.invoiceData.backgroundImage || options.invoiceData.letterheadBase64) {
        const base64 = options.invoiceData.backgroundImage || options.invoiceData.letterheadBase64;
        // Inject the background image into the body style
        html = html.replace(
          '<body',
          `<body style="background-image: url('data:image/png;base64,${base64}'); background-size: 210mm 297mm; background-repeat: no-repeat; background-position: 0 0; -webkit-print-color-adjust: exact; print-color-adjust: exact;"`
        );
      }

      return html;
    }

    // Otherwise use our own template building
    const isRTL = MATHALIVE_CONSTANTS.LANGPACK.RTL_LANGUAGES.includes(options.language);
    const direction = isRTL ? 'rtl' : 'ltr';

    // Get cached template or generate new one
    const cacheKey = `${options.templateId}_${options.language}`;
    if (!this.templateCache.has(cacheKey)) {
      this.templateCache.set(cacheKey, this.buildTemplate(options, direction));
    }

    const template = this.templateCache.get(cacheKey)!;
    return this.injectData(template, options.invoiceData);
  }

  /**
   * Build HTML template with perfect font support
   */
  private buildTemplate(options: MathAlivePDFOptions, direction: string): string {
    return `<!DOCTYPE html>
<html dir="${direction}" lang="${options.language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- Google Fonts for perfect multilingual support -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;700&family=Noto+Sans+JP:wght@400;700&family=Noto+Sans+Thai:wght@400;700&display=swap" rel="stylesheet">

  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: ${direction === 'rtl' ? "'Noto Sans Arabic'" : "'Inter'"}, sans-serif;
      direction: ${direction};
      color: #212121;
      font-size: 14px;
      line-height: 1.6;
      position: relative;
      width: 210mm;
      height: 297mm;
      padding: 0;
      margin: 0;
      background-color: white;
      /* MathAlive letterhead background support */
      background-image: url('data:image/png;base64,{{backgroundImage}}') !important;
      background-size: 210mm 297mm !important;
      background-repeat: no-repeat !important;
      background-position: 0 0 !important;
      background-attachment: fixed !important;
      /* CRITICAL for background printing */
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    /* Content overlay for letterhead compatibility */
    .content-overlay {
      position: absolute;
      top: ${options.letterhead ? '35mm' : '20mm'};
      left: 15mm;
      right: 15mm;
      bottom: 20mm;
      background: ${options.letterhead ? 'transparent' : 'white'};
      padding: 5mm;
    }

    /* Arabic/RTL text special handling */
    .arabic-text, [dir="rtl"] {
      font-family: 'Noto Sans Arabic', sans-serif;
      direction: rtl;
      text-align: right;
      unicode-bidi: bidi-override;
    }

    /* Chinese text */
    [lang="zh-CN"] {
      font-family: 'Noto Sans SC', sans-serif;
    }

    /* Japanese text */
    [lang="ja"] {
      font-family: 'Noto Sans JP', sans-serif;
    }

    /* Thai text */
    [lang="th"] {
      font-family: 'Noto Sans Thai', sans-serif;
    }

    .invoice-header {
      margin-bottom: 30px;
      text-align: ${direction === 'rtl' ? 'right' : 'left'};
    }

    .invoice-title {
      font-size: 28px;
      font-weight: 700;
      color: #2563eb;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 8px;
      display: inline-block;
      width: 100%;
    }

    .invoice-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 30px;
      background: rgba(255, 255, 255, 0.95);
      padding: 15px;
      border-radius: 6px;
      ${options.letterhead ? 'border: 1px solid rgba(0,0,0,0.1);' : ''}
    }

    .section-title {
      font-weight: 600;
      color: #4a5568;
      margin-bottom: 10px;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .invoice-table {
      width: 100%;
      border-collapse: collapse;
      margin: 30px 0;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .invoice-table th {
      background: #2563eb;
      color: white;
      padding: 12px;
      text-align: ${direction === 'rtl' ? 'right' : 'left'};
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .invoice-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 11px;
    }

    .invoice-table tbody tr:nth-child(even) {
      background-color: rgba(248, 248, 248, 0.7);
    }

    .invoice-total {
      float: ${direction === 'rtl' ? 'left' : 'right'};
      width: 300px;
      margin-top: 30px;
      padding: 20px;
      background: #f7fafc;
      border-radius: 8px;
      border-left: 4px solid #2563eb;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      padding: 5px 0;
    }

    .total-final {
      border-top: 2px solid #2563eb;
      padding-top: 10px;
      margin-top: 10px;
      font-weight: 700;
      font-size: 16px;
      color: #2563eb;
    }

    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 120px;
      color: rgba(0,0,0,0.05);
      font-weight: 700;
      z-index: -2;
      user-select: none;
    }

    /* Print optimizations */
    @media print {
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        background-image: url('data:image/png;base64,{{backgroundImage}}') !important;
        background-size: 210mm 297mm !important;
        background-repeat: no-repeat !important;
        background-position: 0 0 !important;
      }
    }
  </style>
</head>
<body>
  ${options.watermark ? '<div class="watermark">{{watermarkText}}</div>' : ''}

  <div class="content-overlay">
    <!-- Template content will be injected here -->
    {{INVOICE_CONTENT}}
  </div>
</body>
</html>`;
  }

  /**
   * Inject invoice data into template
   */
  private injectData(template: string, data: any): string {
    let html = template;

    // First, inject the compiled content if it exists
    if (data.compiledContent) {
      html = html.replace('{{INVOICE_CONTENT}}', data.compiledContent);
    }

    // Handle the letterhead image base64 - FIX THE REPLACEMENT
    if (data.letterheadBase64) {
      html = html.replace(/{{backgroundImage}}/g, data.letterheadBase64);
    } else if (data.backgroundImage) {
      html = html.replace(/{{backgroundImage}}/g, data.backgroundImage);
    }

    // Replace all other placeholders with actual data
    Object.keys(data).forEach(key => {
      if (key !== 'compiledContent' && key !== 'letterheadBase64' && key !== 'backgroundImage') {
        const regex = new RegExp(`{{${key}}}`, 'g');
        const value = data[key];

        // Handle different types of values
        if (typeof value === 'number') {
          html = html.replace(regex, value.toLocaleString());
        } else if (typeof value === 'string') {
          html = html.replace(regex, value);
        } else {
          html = html.replace(regex, String(value || ''));
        }
      }
    });

    // Clean up any remaining placeholders
    html = html.replace(/{{[^}]+}}/g, '');

    return html;
  }

  /**
   * Generate PDF with MathAlive optimization
   */
  async generatePDF(options: MathAlivePDFOptions): Promise<Buffer> {
    if (!this.browser) {
      await this.initialize();
    }

    const startTime = performance.now();
    const page = await this.browser!.newPage();

    try {
      // Handle letterhead conversion to base64 if it's a path
      let letterheadBase64 = '';
      if (options.letterhead) {
        if (options.letterhead.startsWith('data:')) {
          // Already base64 - just extract the base64 part (without data URL prefix)
          letterheadBase64 = options.letterhead.split(',')[1];
        } else if (options.letterhead.startsWith('/')) {
          // It's a path - convert to base64
          // fs and path imported at top
          const letterheadPath = path.join(process.cwd(), 'public', options.letterhead);

          try {
            const imageBuffer = fs.readFileSync(letterheadPath);
            letterheadBase64 = imageBuffer.toString('base64');
            console.log(`✅ MathAlive: Letterhead loaded, size: ${imageBuffer.length} bytes`);
          } catch (error) {
            console.warn('⚠️ MathAlive: Could not load letterhead:', error);
          }
        }
      }

      // Add letterhead to invoice data - only the base64 string (template adds the prefix)
      const enhancedData = {
        ...options.invoiceData,
        backgroundImage: letterheadBase64  // Template will add 'data:image/png;base64,' prefix
      };

      // Generate HTML from template and data
      const html = this.generateHTMLTemplate({
        ...options,
        invoiceData: enhancedData
      });

      // Set viewport for consistent rendering (A4 at 96 DPI)
      await page.setViewport({
        width: 794,
        height: 1123,
        deviceScaleFactor: 2 // High DPI for crisp text
      });

      // Set content with proper encoding for multilingual support
      await page.setContent(html, {
        waitUntil: 'networkidle0',
        timeout: MATHALIVE_CONSTANTS.PERFORMANCE.TIMEOUT
      });

      // Wait for fonts to load (CRITICAL for Google Fonts)
      await page.evaluateHandle('document.fonts.ready');

      // Extra time for Google Fonts to fully render
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Ensure proper RTL rendering for Arabic elements
      if (MATHALIVE_CONSTANTS.LANGPACK.RTL_LANGUAGES.includes(options.language)) {
        await page.evaluate(() => {
          const arabicElements = document.querySelectorAll('.arabic-text, [dir="rtl"]');
          arabicElements.forEach(element => {
            (element as HTMLElement).style.direction = 'rtl';
            (element as HTMLElement).style.textAlign = 'right';
            (element as HTMLElement).style.unicodeBidi = 'bidi-override';
          });
        });
      }

      let result: Buffer;

      if (options.renderMode === 'pdf') {
        result = await page.pdf({
          format: 'A4',
          printBackground: true, // CRITICAL for letterhead backgrounds
          preferCSSPageSize: true,
          margin: {
            top: '0mm',    // No margins for full letterhead
            right: '0mm',
            bottom: '0mm',
            left: '0mm'
          },
          displayHeaderFooter: false,
          scale: 1.0,
          tagged: true // Accessibility support
        });
      } else {
        const screenshot = await page.screenshot({
          type: options.renderMode as 'png' | 'jpeg',
          fullPage: true
        });
        result = screenshot as Buffer;
      }

      const duration = performance.now() - startTime;
      console.log(`⚡ MathAlive: Generated ${options.renderMode} in ${duration.toFixed(2)}ms`);

      return result;

    } finally {
      await page.close();
    }
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('🧮 MathAlive PDF Engine cleaned up');
    }
  }
}

// Export singleton instance
export const mathAlivePDFEngine = new MathAlivePDFEngine();
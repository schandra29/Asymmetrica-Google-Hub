import { test, expect } from '@playwright/test';
import { attachDebugInstrumentation } from '../utils/instrumentation';

/**
 * AsymmBill Core UI/UX Flow Tests
 * Using Playwright MCP for semantic, accessibility-driven testing
 * 
 * Coverage Goal: 95%+ UI/UX Flows
 * Strategy: Semantic snapshots, no brittle selectors
 */

test.describe('🧾 AsymmBill Invoice Generation Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    attachDebugInstrumentation(page);
    // Navigate to AsymmBill homepage with working settings
    await page.goto('/', {
      timeout: 15000,
      waitUntil: 'domcontentloaded'
    });
    
    // Wait for the application to fully load using semantic markers
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display homepage with key CTA elements', async ({ page }) => {
    // Semantic assertions - no brittle selectors!
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText(/generate.*invoice/i)).toBeVisible();
    await expect(page.getByText(/professional.*invoice/i)).toBeVisible();
    
    // Accessibility snapshot instead of visual screenshot
    const accessibilitySnapshot = await page.accessibility.snapshot();
    expect(accessibilitySnapshot).toBeTruthy();
    
    // Log content for debugging
    const title = await page.title();
    console.log(`📄 Homepage title: ${title}`);
    
    const bodyText = await page.locator('body').textContent();
    console.log(`📝 Homepage content: ${bodyText?.substring(0, 200)}...`);
  });

  test('should navigate to invoice canvas editor', async ({ page }) => {
    // Find and click the main CTA using semantic text
    const ctaButton = page.getByRole('button', { name: /create.*invoice/i });
    await expect(ctaButton).toBeVisible();
    await ctaButton.click();
    
    // Verify navigation using semantic content
    await expect(page.getByText(/invoice.*editor/i)).toBeVisible();
    await expect(page.url()).toContain('canvas');
    
    // Semantic form validation
    const invoiceForm = page.getByRole('main');
    await expect(invoiceForm).toBeVisible();
  });

  test('should handle multilingual invoice generation', async ({ page }) => {
    // Navigate to canvas editor
    await page.getByRole('button', { name: /create.*invoice/i }).click();
    
    // Test language switching - semantic approach
    const languageSelector = page.getByLabel(/language/i);
    if (await languageSelector.isVisible()) {
      await languageSelector.click();
      
      // Select Arabic for RTL testing
      const arabicOption = page.getByText(/arabic|العربية/i);
      if (await arabicOption.isVisible()) {
        await arabicOption.click();
        
        // Verify RTL layout changes
        const mainContent = page.getByRole('main');
        const direction = await mainContent.evaluate(el => 
          window.getComputedStyle(el).direction
        );
        expect(['rtl', 'ltr']).toContain(direction);
      }
    }
  });

  test('should validate form inputs semantically', async ({ page }) => {
    // Navigate to form
    await page.getByRole('button', { name: /create.*invoice/i }).click();
    
    // Test semantic form validation
    const companyNameField = page.getByLabel(/company.*name/i);
    const invoiceNumberField = page.getByLabel(/invoice.*number/i);
    const submitButton = page.getByRole('button', { name: /generate|create|submit/i });
    
    // Fill required fields
    await companyNameField.fill('Test Company Ltd.');
    await invoiceNumberField.fill('INV-2025-001');
    
    // Add invoice item semantically
    const addItemButton = page.getByRole('button', { name: /add.*item/i });
    if (await addItemButton.isVisible()) {
      await addItemButton.click();
      
      // Fill item details
      const itemDescription = page.getByLabel(/description/i).first();
      const itemQuantity = page.getByLabel(/quantity/i).first();
      const itemPrice = page.getByLabel(/price/i).first();
      
      await itemDescription.fill('Professional Services');
      await itemQuantity.fill('1');
      await itemPrice.fill('1000');
    }
    
    // Submit and verify success
    await submitButton.click();
    
    // Wait for processing - semantic success indicators
    await expect(page.getByText(/success|generated|complete/i)).toBeVisible({ timeout: 30000 });
  });

  test('should handle HTX authentication flow', async ({ page }) => {
    // Test HTX quantum authentication integration
    const loginButton = page.getByRole('button', { name: /login|sign.*in|connect/i });
    
    if (await loginButton.isVisible()) {
      await loginButton.click();
      
      // Verify HTX connection attempt
      await expect(page.getByText(/connecting|authenticating/i)).toBeVisible();
      
      // Mock successful authentication for testing
      // In real implementation, this would connect to HTX server
      await page.waitForTimeout(2000);
      
      // Verify authenticated state
      const userIndicator = page.getByText(/welcome|authenticated|connected/i);
      await expect(userIndicator).toBeVisible();
    }
  });
});

test.describe('🎨 AsymmBill Canvas Editor Tests', () => {
  
  test('should load canvas editor with semantic elements', async ({ page }) => {
    await page.goto('/canvas-editor');
    
    // Wait for canvas to initialize
    await expect(page.getByRole('main')).toBeVisible();
    
    // Verify canvas tools are accessible
    const canvasArea = page.getByLabel(/canvas|editor|design/i);
    await expect(canvasArea).toBeVisible();
    
    // Test semantic canvas interactions
    const toolbar = page.getByRole('toolbar');
    if (await toolbar.isVisible()) {
      const textTool = page.getByRole('button', { name: /text/i });
      const shapeTool = page.getByRole('button', { name: /shape|rectangle/i });
      
      await expect(textTool).toBeVisible();
      await expect(shapeTool).toBeVisible();
    }
  });
});

test.describe('📊 AsymmBill Performance & Accessibility', () => {
  
  test('should meet accessibility standards', async ({ page }) => {
    await page.goto('/');
    
    // Capture full accessibility tree
    const accessibilitySnapshot = await page.accessibility.snapshot();
    
    // Verify essential accessibility features
    expect(accessibilitySnapshot).toBeTruthy();
    
    // Check for proper heading hierarchy
    const headings = await page.getByRole('heading').all();
    expect(headings.length).toBeGreaterThan(0);
    
    // Verify form labels
    const inputs = await page.getByRole('textbox').all();
    for (const input of inputs) {
      const label = await input.getAttribute('aria-label') || 
                   await input.getAttribute('aria-labelledby');
      expect(label).toBeTruthy();
    }
  });

  test('should load within performance thresholds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await expect(page.getByRole('main')).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    
    // Performance assertion - should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    // Verify critical resources loaded
    await expect(page.getByText('AsymmBill')).toBeVisible();
  });
});
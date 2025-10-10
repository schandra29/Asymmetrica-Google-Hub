# UX-Sonar Validation Rules

**Purpose:** Ensure UI components meet accessibility, usability, and design standards

**Note:** Only applicable for tasks involving user interfaces

---

## When to Apply UX-Sonar

 **Apply when:**
- Building UI components
- Creating web applications
- Designing user workflows
- Implementing accessibility features

L **Skip when:**
- Building backend APIs only
- Creating CLI tools
- Developing libraries without UI

---

## Validation Checklist

### Accessibility (WCAG 2.1 AA)

- [ ] Color contrast e 4.5:1 for text
- [ ] Keyboard navigation functional
- [ ] Screen reader compatible
- [ ] Focus indicators visible
- [ ] Alt text for images
- [ ] Form labels associated
- [ ] Error messages descriptive

### Usability

- [ ] Loading states for async operations
- [ ] Error states with recovery options
- [ ] Success feedback visible
- [ ] Consistent interaction patterns
- [ ] Clear call-to-action hierarchy
- [ ] Mobile-responsive design
- [ ] Performance budget met (FCP < 1.5s, LCP < 2.5s)

### Visual Regression

- [ ] Component visual tests written
- [ ] Screenshots captured for comparison
- [ ] No unintended visual changes
- [ ] Design system compliance

---

## Accessibility Testing

### Automated Tests

```javascript
// Using axe-core for accessibility testing
import { axe } from 'jest-axe';

describe('Component Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Component />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('should be keyboard navigable', () => {
    const { getByRole } = render(<Component />);
    const button = getByRole('button');

    button.focus();
    expect(button).toHaveFocus();

    fireEvent.keyDown(button, { key: 'Enter' });
    // Verify action triggered
  });
});
```

### Manual Checklist

1. **Keyboard Navigation**
   - Tab through all interactive elements
   - Verify focus order makes sense
   - Ensure Enter/Space activate buttons
   - Verify Escape closes modals

2. **Screen Reader**
   - Test with NVDA/JAWS (Windows) or VoiceOver (Mac)
   - Verify all content is announced
   - Check ARIA labels are meaningful
   - Ensure dynamic content updates announced

3. **Color Contrast**
   - Use browser DevTools contrast checker
   - Verify text meets WCAG AA (4.5:1)
   - Verify large text meets AAA (3:1)

---

## Visual Regression Testing

### Using Percy or Playwright

```javascript
import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('component renders correctly', async ({ page }) => {
    await page.goto('/component-demo');

    // Wait for component to load
    await page.waitForSelector('[data-testid="component"]');

    // Take screenshot
    await expect(page).toHaveScreenshot('component-default.png');
  });

  test('component hover state', async ({ page }) => {
    await page.goto('/component-demo');

    const button = page.locator('button');
    await button.hover();

    await expect(page).toHaveScreenshot('component-hover.png');
  });

  test('component mobile view', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/component-demo');

    await expect(page).toHaveScreenshot('component-mobile.png');
  });
});
```

---

## Performance Budget

### Core Web Vitals Targets

| Metric | Target | Maximum |
|--------|--------|---------|
| First Contentful Paint (FCP) | < 1.0s | < 1.5s |
| Largest Contentful Paint (LCP) | < 2.0s | < 2.5s |
| First Input Delay (FID) | < 50ms | < 100ms |
| Cumulative Layout Shift (CLS) | < 0.05 | < 0.1 |

### Testing Performance

```javascript
import { lighthouse } from 'lighthouse';

describe('Performance', () => {
  it('should meet Core Web Vitals', async () => {
    const results = await lighthouse(url, {
      onlyCategories: ['performance'],
    });

    const { audits } = results.lhr;

    expect(audits['first-contentful-paint'].score).toBeGreaterThan(0.9);
    expect(audits['largest-contentful-paint'].score).toBeGreaterThan(0.9);
    expect(audits['cumulative-layout-shift'].score).toBeGreaterThan(0.9);
  });
});
```

---

## Design System Compliance

### Component Checklist

- [ ] Uses design tokens for colors
- [ ] Uses design tokens for spacing
- [ ] Uses design tokens for typography
- [ ] Follows component naming conventions
- [ ] Documented in Storybook/component library

### Design Tokens Example

```css
/* Design tokens */
:root {
  /* Colors */
  --color-primary: #0066cc;
  --color-secondary: #6c757d;
  --color-success: #28a745;
  --color-error: #dc3545;

  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;

  /* Typography */
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.25rem;
  --line-height: 1.5;
}

/* Component using tokens */
.button {
  padding: var(--space-sm) var(--space-md);
  font-size: var(--font-size-base);
  background-color: var(--color-primary);
  color: white;
}
```

---

## Usability Testing

### User Flow Testing

```javascript
describe('User Flow: Submit Form', () => {
  it('should guide user through happy path', async () => {
    const { getByLabelText, getByRole } = render(<FormComponent />);

    // Step 1: Fill form
    const nameInput = getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });

    const emailInput = getByLabelText('Email');
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

    // Step 2: Submit
    const submitButton = getByRole('button', { name: 'Submit' });
    fireEvent.click(submitButton);

    // Step 3: Verify success
    await waitFor(() => {
      expect(screen.getByText('Success!')).toBeInTheDocument();
    });
  });

  it('should show helpful errors', async () => {
    const { getByLabelText, getByRole, getByText } = render(<FormComponent />);

    // Submit without filling
    const submitButton = getByRole('button', { name: 'Submit' });
    fireEvent.click(submitButton);

    // Verify error messages
    await waitFor(() => {
      expect(getByText('Name is required')).toBeInTheDocument();
      expect(getByText('Email is required')).toBeInTheDocument();
    });
  });
});
```

---

## Success Criteria

### UX-Sonar Passes When:

-  WCAG 2.1 AA compliance verified
-  Keyboard navigation functional
-  Screen reader compatible
-  Visual regression tests passing
-  Core Web Vitals meet targets
-  Design system compliance maintained
-  User flows tested end-to-end

---

## Tools

### Recommended Tools

| Tool | Purpose |
|------|---------|
| axe-core | Automated accessibility testing |
| Lighthouse | Performance auditing |
| Percy/Chromatic | Visual regression testing |
| Playwright | End-to-end testing |
| Storybook | Component documentation |

---

**Validation Framework Version:** 1.0
**Last Updated:** October 10, 2025
**Maintained by:** Asymmetrica R&D Lab

# 🚀 E2E Test Execution Guide - Agent Charlie

**Quick Start:** Get E2E tests running in 5 minutes
**Complete Guide:** Everything you need to run, debug, and maintain E2E tests

---

## ⚡ QUICK START (5 Minutes)

### **Step 1: Install Dependencies**

```bash
cd frontend
npm install
npx playwright install --with-deps
```

### **Step 2: Start Backend & Frontend**

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Wait for both servers to start:
- Backend: http://localhost:8000 (check http://localhost:8000/health/live)
- Frontend: http://localhost:8080 (Vite dev server)

### **Step 3: Run Tests**

**Terminal 3 - Tests:**
```bash
cd frontend
npm run test:e2e
```

✅ **Done!** Tests will run in headless mode and generate an HTML report.

---

## 📋 TEST COMMANDS

### **Standard Execution**

```bash
# Run all E2E tests (headless)
npm run test:e2e

# Run with UI mode (interactive, best for development)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run in debug mode (step through tests)
npm run test:e2e:debug

# Run with parallelization (4 workers)
npm run test:e2e:parallel
```

### **Specific Test Suites**

```bash
# Critical flows only (must pass 100%)
npm run test:critical

# Security red team tests
npm run test:security

# Accessibility tests (WCAG AA)
npm run test:a11y

# Visual regression tests
npm run test:visual
```

### **Agent Charlie's New Tests**

```bash
# Complete workflow journey (4 pages)
npx playwright test specs/workflow-complete-journey.spec.ts

# OCR + Williams optimizer validation
npx playwright test specs/ocr-williams-validation.spec.ts

# Error handling & resilience
npx playwright test specs/error-handling-resilience.spec.ts

# Multi-document batch upload
npx playwright test specs/multi-document-batch.spec.ts

# Run all Agent Charlie tests
npx playwright test specs/workflow-complete-journey.spec.ts specs/ocr-williams-validation.spec.ts specs/error-handling-resilience.spec.ts specs/multi-document-batch.spec.ts
```

### **Selective Execution**

```bash
# Run single test by name
npx playwright test -g "Happy Path: Complete workflow"

# Run tests in a specific file
npx playwright test specs/critical-flows.spec.ts

# Run tests in a specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run tests matching pattern
npx playwright test -g "OCR"
```

---

## 🔧 CONFIGURATION

### **Playwright Config**

**Location:** `frontend/tests/e2e/playwright.config.ts`

**Key Settings:**
```typescript
{
  testDir: './specs',
  baseURL: 'http://localhost:8080',
  timeout: 60000,              // 1 minute per test
  fullyParallel: true,         // Run tests in parallel
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,

  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry'
  },

  projects: [
    { name: 'chromium' },
    { name: 'firefox' },
    { name: 'webkit' },
    { name: 'mobile-chrome' },
    { name: 'mobile-safari' },
    { name: 'rtl-testing' }     // Arabic locale
  ]
}
```

### **Environment Variables**

```bash
# Set base URL (default: http://localhost:8080)
export BASE_URL=http://localhost:3000

# Enable CI mode (retries, different worker count)
export CI=true

# Debug mode
export DEBUG=pw:api
```

---

## 🐛 DEBUGGING TESTS

### **Method 1: UI Mode (Recommended)**

```bash
npm run test:e2e:ui
```

**Features:**
- ✅ Visual test runner
- ✅ Step-by-step execution
- ✅ Time-travel debugging
- ✅ Network inspection
- ✅ Console logs
- ✅ Screenshot comparison

### **Method 2: Debug Mode**

```bash
npm run test:e2e:debug
```

Opens Playwright Inspector:
- Set breakpoints
- Step through code
- Inspect selectors
- View network requests

### **Method 3: Headed Mode**

```bash
npm run test:e2e:headed
```

See the browser while tests run:
- Watch interactions
- See visual bugs
- Verify timing issues

### **Method 4: VSCode Extension**

1. Install: [Playwright Test for VSCode](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)
2. Open test file
3. Click green arrow next to test
4. Use debugging tools

### **Common Debugging Commands**

```typescript
// In test file - add breakpoints
await page.pause();  // Pause execution (only in debug mode)

// Take screenshot manually
await page.screenshot({ path: 'debug.png' });

// Log page content
console.log(await page.content());

// Log element details
const element = page.locator('button');
console.log(await element.boundingBox());
console.log(await element.textContent());

// Increase timeout for debugging
test.setTimeout(120000); // 2 minutes
```

---

## 📊 TEST REPORTS

### **HTML Report (Auto-Generated)**

After test run:
```bash
npx playwright show-report
```

Opens interactive HTML report:
- Test results (pass/fail)
- Screenshots on failure
- Video recordings
- Execution timeline
- Console logs
- Network activity

**Location:** `frontend/playwright-report/index.html`

### **JSON Report**

```bash
# Generate JSON report
npx playwright test --reporter=json

# Output to file
npx playwright test --reporter=json > test-results.json
```

**Location:** `frontend/test-results/results.json`

### **JUnit XML (for CI/CD)**

```bash
npx playwright test --reporter=junit
```

**Location:** `frontend/test-results/junit.xml`

### **Custom Reporters**

Edit `playwright.config.ts`:
```typescript
reporter: [
  ['html', { outputFolder: 'playwright-report' }],
  ['junit', { outputFile: 'test-results/junit.xml' }],
  ['json', { outputFile: 'test-results/results.json' }],
  process.env.CI ? ['github'] : ['list']
]
```

---

## 🧪 SAMPLE DOCUMENTS

### **Location**

`Sample Document set/` (project root)

### **Documents Used in Tests**

| File | Type | Used In | Field Count |
|------|------|---------|-------------|
| Sarat_Birth_Certificate.jpg | Legal | OCR, Workflow, Batch | 15 |
| Sarat_10th_Certificate.jpg | Education | OCR, Batch | 10 |
| Sarat_12th_Transfer_Certificate.jpg | Education | Batch | 8 |
| Sarat_Inter_Certificate.jpg | Education | Batch | 10 |
| Sarat_Marriage_Certificate.jpg | Legal | OCR, Batch | 12 |
| Sarat_Conduct_Certificate.jpg | Legal | Batch | 8 |
| Sarat_Driving_License.jpg | Identity | OCR, Batch | 8 |
| Sarat_Offer_Letter.jpg | Employment | OCR, Batch | 25 |
| Sarat_Offer_Letter_1.jpg | Employment | Batch | 25 |

**Total:** 9 documents, 121 fields

### **Adding New Test Documents**

1. Place document in `Sample Document set/`
2. Update test to reference new file:
   ```typescript
   const docPath = path.join(SAMPLE_DOCS_DIR, 'New_Document.jpg');
   await fileInput.setInputFiles(docPath);
   ```

---

## ⚙️ CI/CD INTEGRATION

### **GitHub Actions**

Create `.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.13'

      - name: Install frontend dependencies
        run: |
          cd frontend
          npm ci

      - name: Install Playwright browsers
        run: |
          cd frontend
          npx playwright install --with-deps

      - name: Install backend dependencies
        run: |
          cd backend
          pip install -r requirements.txt

      - name: Run database migrations
        run: |
          cd backend
          alembic upgrade head
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/ipermit_test

      - name: Start backend server
        run: |
          cd backend
          uvicorn app.main:app --host 0.0.0.0 --port 8000 &
          sleep 5
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/ipermit_test
          MISTRAL_API_KEY: ${{ secrets.MISTRAL_API_KEY }}

      - name: Start frontend server
        run: |
          cd frontend
          npm run dev &
          sleep 5

      - name: Run E2E tests
        run: |
          cd frontend
          npm run test:e2e
        env:
          BASE_URL: http://localhost:8080
          CI: true

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: frontend/playwright-report/
          retention-days: 30

      - name: Upload test videos
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: test-videos
          path: frontend/test-results/
          retention-days: 7

      - name: Comment PR with results
        if: github.event_name == 'pull_request'
        uses: daun/playwright-report-comment@v3
        with:
          report-path: frontend/playwright-report
```

### **GitLab CI**

Create `.gitlab-ci.yml`:

```yaml
e2e-tests:
  stage: test
  image: mcr.microsoft.com/playwright:v1.47.2-jammy

  services:
    - postgres:14

  variables:
    DATABASE_URL: postgresql://postgres:postgres@postgres:5432/ipermit_test
    POSTGRES_DB: ipermit_test
    POSTGRES_PASSWORD: postgres
    BASE_URL: http://localhost:8080

  before_script:
    - cd frontend && npm ci
    - npx playwright install
    - cd ../backend && pip install -r requirements.txt

  script:
    - cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 &
    - cd frontend && npm run dev &
    - sleep 10
    - cd frontend && npm run test:e2e

  artifacts:
    when: always
    paths:
      - frontend/playwright-report/
      - frontend/test-results/
    expire_in: 1 week
```

### **Docker Compose**

Create `docker-compose.test.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: ipermit_test
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/ipermit_test
      MISTRAL_API_KEY: ${MISTRAL_API_KEY}
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "8080:8080"
    depends_on:
      - backend

  e2e-tests:
    image: mcr.microsoft.com/playwright:v1.47.2-jammy
    working_dir: /app
    volumes:
      - ./frontend:/app
    command: npm run test:e2e
    environment:
      BASE_URL: http://frontend:8080
    depends_on:
      - frontend
```

**Run with:**
```bash
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

---

## 🔍 TROUBLESHOOTING

### **Common Issues**

#### **1. "Target closed" or "Navigation timeout"**

**Cause:** Frontend/backend not running or wrong URL

**Fix:**
```bash
# Check servers are running
curl http://localhost:8000/health/live  # Backend
curl http://localhost:8080              # Frontend

# Update baseURL in playwright.config.ts if needed
export BASE_URL=http://localhost:3000
```

#### **2. "Locator not found" or "Element not visible"**

**Cause:** Selector changed or timing issue

**Fix:**
```typescript
// Increase timeout
await page.locator('button').click({ timeout: 10000 });

// Wait for element
await page.waitForSelector('button', { state: 'visible' });

// Use more flexible selectors
await page.locator('button:has-text("Submit")').first().click();
```

#### **3. "File not found" (sample documents)**

**Cause:** Path incorrect

**Fix:**
```bash
# Verify documents exist
ls -la "Sample Document set/"

# Check path in test
const SAMPLE_DOCS_DIR = path.join(__dirname, '../../../../Sample Document set');
console.log(`Looking for docs in: ${SAMPLE_DOCS_DIR}`);
```

#### **4. "Port already in use"**

**Cause:** Previous server still running

**Fix:**
```bash
# Kill processes on port 8000 (backend)
lsof -ti:8000 | xargs kill -9

# Kill processes on port 8080 (frontend)
lsof -ti:8080 | xargs kill -9

# Or use different ports
uvicorn app.main:app --port 8001
npm run dev -- --port 8081
```

#### **5. Tests pass locally but fail in CI**

**Cause:** Timing differences, missing dependencies

**Fix:**
```yaml
# Increase timeouts in CI
- name: Run E2E tests
  run: npm run test:e2e
  env:
    CI: true
    PLAYWRIGHT_TIMEOUT: 90000  # 90 seconds

# Install all dependencies
- run: npx playwright install --with-deps
```

#### **6. "Playwright not installed"**

**Cause:** Browsers not downloaded

**Fix:**
```bash
npx playwright install --with-deps
```

---

## 📈 PERFORMANCE TIPS

### **Speed Up Test Execution**

```bash
# Run tests in parallel (4 workers)
npm run test:e2e:parallel

# Run only changed tests (CI)
npx playwright test --only-changed

# Disable video recording (faster)
npx playwright test --reporter=html --config=playwright.config.ts
```

### **Reduce Flakiness**

```typescript
// Use auto-waiting (built-in)
await page.click('button');  // Waits for element automatically

// Avoid fixed waits
// BAD
await page.waitForTimeout(3000);

// GOOD
await page.waitForSelector('button', { state: 'visible' });

// Use retry logic
await test.step('Upload with retry', async () => {
  for (let i = 0; i < 3; i++) {
    try {
      await page.setInputFiles('input[type="file"]', docPath);
      await page.waitForSelector('text=Success', { timeout: 5000 });
      break;
    } catch (error) {
      if (i === 2) throw error;
    }
  }
});
```

### **Optimize Selectors**

```typescript
// Fast: Use test IDs
await page.locator('[data-testid="submit-button"]').click();

// Slower: Text matching
await page.locator('button:has-text("Submit")').click();

// Slowest: Complex CSS
await page.locator('div.form > div:nth-child(2) > button.primary').click();
```

---

## 🎯 BEST PRACTICES

### **1. Use Page Object Model (POM)**

```typescript
// pages/UploadPage.ts
export class UploadPage {
  constructor(private page: Page) {}

  async uploadDocument(filePath: string) {
    const fileInput = this.page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(filePath);
  }

  async waitForOCRComplete() {
    await this.page.waitForSelector('text=/complete|success/i', { timeout: 10000 });
  }
}

// Use in test
const uploadPage = new UploadPage(page);
await uploadPage.uploadDocument(docPath);
await uploadPage.waitForOCRComplete();
```

### **2. Use test.step() for Clarity**

```typescript
await test.step('Upload document', async () => {
  await fileInput.setInputFiles(docPath);
});

await test.step('Wait for OCR', async () => {
  await page.waitForSelector('text=Complete');
});
```

### **3. Clean Up After Tests**

```typescript
test.afterEach(async ({ page }) => {
  // Clear localStorage
  await page.evaluate(() => localStorage.clear());

  // Clear cookies
  await page.context().clearCookies();
});
```

### **4. Use Fixtures for Shared Setup**

```typescript
// fixtures.ts
export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    await use(page);
  }
});

// Use in test
test('Upload requires auth', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/upload');
  // Already logged in
});
```

---

## 📚 RESOURCES

### **Documentation**

- [Playwright Docs](https://playwright.dev/docs/intro)
- [Three-Regime Testing](../backend/tests/contract/README.md)
- [Williams Optimizer](../backend/app/utils/williams_optimizer.py)
- [E2E Coverage Report](./E2E_TEST_COVERAGE_REPORT.md)

### **Tools**

- [Playwright Inspector](https://playwright.dev/docs/debug#playwright-inspector)
- [Playwright Test VSCode Extension](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)

### **Community**

- [Playwright Discord](https://discord.com/invite/playwright-807756831384403968)
- [GitHub Discussions](https://github.com/microsoft/playwright/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/playwright)

---

## 🚀 NEXT STEPS

1. **Run Tests Locally:**
   ```bash
   npm run test:e2e:ui  # Start with UI mode
   ```

2. **Add to CI/CD:**
   - Copy GitHub Actions workflow
   - Set up secrets (MISTRAL_API_KEY)
   - Enable PR comments

3. **Monitor Test Health:**
   - Track flaky tests
   - Review failure trends
   - Update selectors as UI changes

4. **Expand Coverage:**
   - Add tests for new features
   - Maintain Three-Regime distribution (50/20/30)
   - Keep Williams validation updated

---

**Agent Charlie's Reminder:** Tests are not a burden—they're proof the system works. Run them often, debug them thoroughly, and trust the results. The numbers don't lie. 🧪✅

---

*End of Guide - You're ready to run E2E tests like a pro!* 🚀

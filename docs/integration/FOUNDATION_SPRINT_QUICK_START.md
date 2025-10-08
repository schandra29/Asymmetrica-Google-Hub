# Foundation Sprint Quick Start Guide
**Triple Crown Integration: Token Tracking + Accessibility + Pattern Routing**

---

## 🚀 Quick Start (5 Minutes)

### 1. Token Usage Monitoring

**Check Budget Status:**
```bash
curl http://localhost:8000/api/admin/budget-status
```

**Response:**
```json
{
  "total_budget": 20.00,
  "total_spent": 2.34,
  "remaining": 17.66,
  "percentage_used": 11.7,
  "alert_level": null,
  "burn_rate_per_day": 0.33,
  "projected_depletion_date": "2026-01-17",
  "days_remaining": 53
}
```

**Get Usage Summary:**
```bash
curl "http://localhost:8000/api/admin/usage-summary?operation_type=ocr"
```

**Top Consumers:**
```bash
curl "http://localhost:8000/api/admin/top-consumers?limit=5&group_by=operation_type"
```

### 2. Run Accessibility Tests

**Run Enhanced Sonar with Axe-core:**
```bash
cd frontend
npm run test:e2e -- enhanced-sonar.spec.ts
```

**Expected Output:**
```
✅ Upload Page passed accessibility scan
   Total violations: 0
   Passes: 47

✅ Review Page passed accessibility scan
   Total violations: 2
   Passes: 45

✅ Workflow Page passed accessibility scan
   Total violations: 1
   Passes: 46
```

### 3. Enable Pattern Routing

**Add Middleware to FastAPI:**
```python
# backend/app/main.py

from app.middleware.pattern_detection import PatternDetectionMiddleware

app = FastAPI()
app.add_middleware(PatternDetectionMiddleware)
```

**Make Request with Pattern Hint:**
```bash
curl -H "X-Execution-Pattern: B" \
     -H "X-Environment: production" \
     http://localhost:8000/api/ocr/extract
```

**Response Headers:**
```
X-Pattern-Used: B
X-Pattern-Name: Quality-Critical Operations
X-Pattern-Execution-Time: 2.456
X-Pattern-Batch-Size: 10
X-Pattern-Confidence-Threshold: 0.95
```

---

## 📁 File Locations

### Backend Files

**Token Tracking Integration:**
- `backend/app/core/ocr/mistral_service.py` - OCR service with token tracking
- `backend/app/services/token_tracker.py` - Token usage tracker (existing)
- `backend/app/api/routes/admin.py` - Budget status endpoints (NEW)

**Pattern Routing:**
- `backend/app/utils/pattern_router.py` - Pattern routing logic (NEW)
- `backend/config/patterns.yaml` - Pattern configuration (NEW)
- `backend/app/middleware/pattern_detection.py` - Auto-detection middleware (NEW)

### Frontend Files

**Accessibility Testing:**
- `frontend/tests/e2e/enhanced-sonar.spec.ts` - Axe-core integration tests (NEW)

---

## 🎯 Use Cases

### Use Case 1: Monitor API Costs

**Problem:** Need to track token usage and prevent budget overrun

**Solution:**
1. Check budget status: `GET /api/admin/budget-status`
2. Review daily usage: `GET /api/admin/usage-summary?start_date=2025-10-06`
3. Find top consumers: `GET /api/admin/top-consumers`

**Budget Alerts:**
- 50% (Info): Check spending patterns
- 75% (Warning): Review optimization opportunities
- 90% (Critical): Immediate action required
- 95% (Emergency): Switch to minimum-cost mode

### Use Case 2: Ensure WCAG 2.1 AA Compliance

**Problem:** Need to verify accessibility compliance

**Solution:**
1. Run enhanced sonar tests: `npm run test:e2e -- enhanced-sonar.spec.ts`
2. Review violation reports in test output
3. Fix critical/serious violations
4. Re-run tests to verify fixes

**Test Coverage:**
- WCAG 2.1 AA compliance (all pages)
- Multi-viewport accessibility (3 viewports)
- Keyboard navigation
- Color contrast
- Touch target size
- Form labels & headings

### Use Case 3: Optimize OCR Cost/Accuracy

**Problem:** Need different quality levels for different use cases

**Solution:**
1. High-volume production: Route to Pattern A (cost-optimized)
2. Legal compliance: Route to Pattern B (accuracy-focused)
3. Research tasks: Route to Pattern C (model comparison)
4. Development: Route to Pattern D (speed-optimized)

**Pattern Selection:**
- Automatic: Based on endpoint path
- Manual: Set `X-Execution-Pattern` header
- Configured: Update `config/patterns.yaml`

---

## 🔧 Configuration

### Token Tracking Configuration

**Modify Budget:**
```python
# backend/app/services/token_tracker.py

BUDGET_TOTAL_USD = 20.00  # Change to your budget

BUDGET_ALERT_THRESHOLDS = {
    "info": 0.50,      # 50%
    "warning": 0.75,   # 75%
    "critical": 0.90,  # 90%
    "emergency": 0.95  # 95%
}
```

**Add Model Pricing:**
```python
MODEL_PRICING = {
    "your-model": {"input": 0.10, "output": 0.10},
    # Add more models as needed
}
```

### Accessibility Configuration

**Modify Test Pages:**
```typescript
// frontend/tests/e2e/enhanced-sonar.spec.ts

const TEST_PAGES = [
  { path: '/', name: 'Upload Page' },
  { path: '/review', name: 'Review Page' },
  { path: '/workflow', name: 'Workflow Page' },
  { path: '/your-page', name: 'Your Page' }  // Add more pages
];
```

**Modify Viewports:**
```typescript
const VIEWPORTS = [
  { width: 375, height: 667, name: 'mobile' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 1920, height: 1080, name: 'desktop' },
  { width: 2560, height: 1440, name: '4k' }  // Add more viewports
];
```

### Pattern Routing Configuration

**Modify Pattern Targets:**
```yaml
# backend/config/patterns.yaml

patterns:
  high_volume_production:
    targets:
      response_time_ms: 2000      # Change target
      cost_per_operation: 0.00125 # Change target
      accuracy_threshold: 0.85    # Change target
```

**Add Custom Pattern:**
```yaml
patterns:
  your_custom_pattern:
    id: E
    name: Your Custom Pattern
    defensekit:
      williams: {regime: balance, leverage_multiplier: 11.5}
      harmonic: {retry: SINGLE, rate_limit: SINGLE}
    models:
      - provider: your-provider
        model: your-model
```

---

## 📊 Monitoring & Alerts

### Budget Monitoring

**Daily Check:**
```bash
#!/bin/bash
# budget-check.sh

BUDGET=$(curl -s http://localhost:8000/api/admin/budget-status)
PERCENTAGE=$(echo $BUDGET | jq -r '.percentage_used')

if (( $(echo "$PERCENTAGE > 90" | bc -l) )); then
  echo "🚨 CRITICAL: Budget at ${PERCENTAGE}%"
  # Send alert (email, Slack, etc.)
fi
```

**Cron Job:**
```cron
0 9 * * * /path/to/budget-check.sh  # Daily at 9 AM
```

### Accessibility Monitoring

**CI/CD Integration:**
```yaml
# .github/workflows/accessibility.yml

name: Accessibility Tests
on: [pull_request]

jobs:
  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e -- enhanced-sonar.spec.ts
```

### Pattern Metrics Monitoring

**Grafana Dashboard:**
```json
{
  "dashboard": {
    "title": "Pattern Routing Metrics",
    "panels": [
      {
        "title": "Pattern Usage",
        "targets": [
          {
            "expr": "pattern_usage_total{pattern=\"A\"}",
            "legendFormat": "Pattern A"
          }
        ]
      },
      {
        "title": "Pattern Execution Time",
        "targets": [
          {
            "expr": "pattern_execution_time_seconds{pattern=\"A\"}",
            "legendFormat": "Pattern A"
          }
        ]
      }
    ]
  }
}
```

---

## 🐛 Troubleshooting

### Token Tracking Issues

**Issue:** Token counts not being recorded

**Solution:**
1. Check if `get_tracker()` is imported in `mistral_service.py`
2. Verify Mistral API response includes `usage` object
3. Check logs for token tracking errors: `grep "token_usage" logs/*.log`

**Issue:** Budget status shows incorrect values

**Solution:**
1. Check if `data/token_usage.jsonl` exists and is readable
2. Verify pricing table matches AIMLAPI current pricing
3. Reset tracker if needed: `rm data/token_usage.jsonl`

### Accessibility Test Issues

**Issue:** Axe-core tests failing with "no violations expected"

**Solution:**
1. Run tests with `--headed` to see actual violations
2. Review violation reports in console output
3. Fix critical violations first, then serious
4. Update test expectations if violations are acceptable

**Issue:** Tests timing out

**Solution:**
1. Increase timeout: `test.setTimeout(60000)` (60 seconds)
2. Check if dev server is running: `npm run dev`
3. Verify Playwright browsers installed: `npx playwright install`

### Pattern Routing Issues

**Issue:** Wrong pattern selected

**Solution:**
1. Check explicit pattern hint: `X-Execution-Pattern` header
2. Verify endpoint path matches route detection logic
3. Review pattern scoring algorithm in logs
4. Update `patterns.yaml` thresholds if needed

**Issue:** Pattern config not loading

**Solution:**
1. Verify YAML syntax: `yamllint config/patterns.yaml`
2. Check file path in `PatternRouter.__init__()`
3. Ensure config directory exists: `mkdir -p backend/config`

---

## 📚 Additional Resources

### Documentation

- **Token Tracker:** `backend/app/services/token_tracker.py` (docstrings)
- **Pattern Router:** `backend/app/utils/pattern_router.py` (docstrings)
- **Axe-core:** https://www.deque.com/axe/core-documentation/
- **WCAG 2.1:** https://www.w3.org/WAI/WCAG21/quickref/

### Code Examples

**Token Tracking:**
```python
from app.services.token_tracker import get_tracker

tracker = get_tracker()
await tracker.record_usage(
    operation_id="ocr_passport_12345",
    model="pixtral-12b",
    input_tokens=2000,
    output_tokens=200,
    operation_type="ocr",
    metadata={"document_type": "passport"}
)
```

**Pattern Routing:**
```python
from app.utils.pattern_router import PatternRouter

router = PatternRouter()
pattern, config = router.route_task(
    task_type="ocr",
    volume_estimate=5000,
    cost_budget_per_op=0.001,
    accuracy_requirement=0.85,
    is_production=True
)
```

**Accessibility Testing:**
```typescript
import AxeBuilder from '@axe-core/playwright';

test('should have no accessibility violations', async ({ page }) => {
  await page.goto('http://localhost:3000');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();

  expect(results.violations).toHaveLength(0);
});
```

---

## ✅ Success Checklist

### Initial Setup
- [ ] Token tracking active (check `/api/admin/budget-status`)
- [ ] Axe-core installed (`@axe-core/playwright` in `package.json`)
- [ ] Pattern middleware enabled (in `main.py`)
- [ ] Configuration files created (`config/patterns.yaml`)

### Testing
- [ ] Enhanced sonar tests passing
- [ ] Budget status API returning data
- [ ] Pattern headers present in responses
- [ ] No critical WCAG violations

### Monitoring
- [ ] Budget alerts configured (email/Slack)
- [ ] Accessibility tests in CI/CD
- [ ] Pattern metrics tracked
- [ ] Grafana dashboards set up

### Production
- [ ] Budget threshold appropriate for usage
- [ ] Pattern configurations optimized
- [ ] WCAG 2.1 AA compliance achieved
- [ ] Cost optimization validated

---

**Quick Start Guide Version:** 1.0
**Last Updated:** October 6, 2025
**Status:** Production Ready ✅

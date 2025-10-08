# 💻 Code Sonar Report

**Project:** asymmbill
**Analyzed:** 5/10/2025, 6:42:41 am
**Regime:** EXPLORATION
**Complexity:** O(n²)


---

## Code Quality Summary

**Regime:** 🔴 EXPLORATION

**Key Metrics:**
- Bug Density: 3.800 bugs/LOC (target: < 0.05)
- Maintainability Index: 59/100 (target: > 65)
- Cohesion Score: 97% (target: > 70%)
- Complexity Score: 60/100 (target: > 70)
- Duplication Score: 100/100 (target: > 85)

**Overall:** Moderate code quality. Several improvements recommended.

**Action Required:** 2 high-priority issues need immediate attention.


---

## 🎉 Praise Signals

- ✅ Strong cohesion: 97% (functions are focused and single-responsibility)
- ✅ Low complexity: Average CC = 3.0 (target: < 5)
- ✅ Minimal code duplication: 0.0% (DRY principle upheld)

---

## 📊 Quality Metrics Dashboard

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| **Bug Density** | 3.800 bugs/LOC | < 0.05 | ❌ FAIL |
| **Maintainability Index** | 59/100 | > 65 | ❌ FAIL |
| **Cohesion Score** | 97% | > 70% | ✅ PASS |
| **Complexity Score** | 60/100 | > 70 | ❌ FAIL |
| **Duplication Score** | 100/100 | > 85 | ✅ PASS |

**Formula Reference:**
- Bug Density = (CC^1.2 × duplicationRatio) / cohesionScore
- Research: CC correlates r=0.72 with bugs (ArXiv 2019)
- Cohesion reduces bug risk by 40%


---

## 🔍 Heuristic Violations

### 1. 🔴 cyclomatic-complexity-high

**Severity:** CRITICAL

**Issue:** Found 43 high-complexity functions (CC > 10) and 0 complex files (avg CC > 50). Bug density increases 2.5× per 10 CC points.

**Suggestion:** Refactor complex functions into smaller, single-responsibility functions. Extract nested logic into helper functions. Target CC < 10 for all functions.

**Affected Items:**
- `components\EnhancedInvoiceCanvas.tsx::EnhancedInvoiceCanvas (CC: 124, lines: 994)`
- `components\EnhancedInvoiceCanvas.tsx::<arrow> (CC: 51, lines: 243)`
- `components\EnhancedInvoiceCanvas.tsx::<arrow> (CC: 36, lines: 151)`
- `components\EnhancedInvoiceCanvas.tsx::<arrow> (CC: 17, lines: 26)`
- `components\InvoiceDemo.tsx::InvoiceDemo (CC: 50, lines: 836)`

**Code Example:**
```typescript
/* Instead of complex nested logic: */
function processOrder(order) {
  if (order.status === 'pending') {
    if (order.items.length > 0) {
      for (const item of order.items) {
        if (item.inStock) {
          if (item.price > 0) {
            // 20+ lines of processing... ❌ CC = 15+
          }
        }
      }
    }
  }
}

/* Refactor into smaller functions: */
function processOrder(order) {
  if (!canProcess(order)) return;

  const validItems = getValidItems(order);
  validItems.forEach(processItem); // ✅ CC = 2
}

function canProcess(order) {
  return order.status === 'pending' && order.items.length > 0; // ✅ CC = 2
}

function getValidItems(order) {
  return order.items.filter(item => item.inStock && item.price > 0); // ✅ CC = 2
}
```

### 2. ⚠️ bundle-bloat

**Severity:** WARNING

**Issue:** Found 7 bundles exceeding 250 KB gzip. Large bundles slow initial page load and hurt performance metrics.

**Suggestion:** Implement code splitting, lazy loading, and dynamic imports. Remove unused dependencies. Use tree-shaking and minification. Consider route-based chunking.

**Affected Items:**
- `.next\server\chunks\ssr\node_modules_4223306e._.js (267 KB gzip, 13,306 lines)`
- `.next\server\chunks\ssr\node_modules_547e43fd._.js (350 KB gzip, 20,654 lines)`
- `.next\server\chunks\ssr\node_modules_5f2d4120._.js (349 KB gzip, 20,634 lines)`
- `.next\server\chunks\ssr\node_modules_next_dist_compiled_next-devtools_index_a19313bf.js (472 KB gzip, 29,853 lines)`
- `.next\static\chunks\node_modules_d059ff89._.js (279 KB gzip, 13,695 lines)`

**Code Example:**
```typescript
/* Instead of importing entire library: */
import _ from 'lodash'; // ❌ 70 KB gzipped

export function getUnique(arr) {
  return _.uniq(arr);
}

/* Use specific imports or native methods: */
import { uniq } from 'lodash-es'; // ✅ Tree-shakeable
// OR
export function getUnique(arr) {
  return [...new Set(arr)]; // ✅ Native, 0 KB
}

/* For route-based code splitting: */
// Instead of:
import HeavyComponent from './HeavyComponent'; // ❌ Always loaded

// Use dynamic import:
const HeavyComponent = lazy(() => import('./HeavyComponent')); // ✅ Lazy loaded
```

### 3. ℹ️ dead-code

**Severity:** INFO

**Issue:** Found 145 dead code instances (145 unused exports, 0 unreachable code, 0 unused imports). Dead code bloats bundle size.

**Suggestion:** Remove unused exports and imports. Delete unreachable code branches. Use ESLint rules like no-unused-vars and no-unreachable to prevent accumulation.

**Affected Items:**
- `next.config.ts:3 - unused-export: default`
- `playwright-debug.config.ts:8 - unused-export: default`
- `playwright.config.ts:43 - unused-export: default`
- `playwright.config.ux-sonar.ts:14 - unused-export: default`
- `app\layout.tsx:20 - unused-export: default`
- `app\layout.tsx:15 - unused-export: metadata`
- `app\page.tsx:6 - unused-export: default`
- `components\EnhancedInvoiceCanvas.tsx:68 - unused-export: default`
- `components\HeroSection.tsx:23 - unused-export: default`
- `components\HowItWorks.tsx:34 - unused-export: default`

**Code Example:**
```typescript
/* Instead of unused exports: */
export function usedFunction() { /* ... */ }
export function unusedFunction() { /* ... */ } // ❌ Never imported

export const USED_CONSTANT = 'value';
export const UNUSED_CONSTANT = 'value'; // ❌ Never imported

/* Remove unused code: */
export function usedFunction() { /* ... */ } // ✅
export const USED_CONSTANT = 'value'; // ✅

// Delete unusedFunction and UNUSED_CONSTANT
```



---

## 📈 Complexity Analysis

**Overall Statistics:**
- Total Files: 83
- Total Functions: 1316
- Total Lines: 24,658
- Average Complexity: 3.0
- Max Complexity: 124

**Top 10 Most Complex Functions:**

| Function | File | CC | Lines |
|----------|------|----:|------:|
| EnhancedInvoiceCanvas | components\EnhancedInvoiceCanvas.tsx | 124 | 994 |
| <arrow> | components\EnhancedInvoiceCanvas.tsx | 51 | 243 |
| InvoiceDemo | components\InvoiceDemo.tsx | 50 | 836 |
| POST | app\api\generate\route.ts | 41 | 180 |
| <arrow> | components\EnhancedInvoiceCanvas.tsx | 36 | 151 |
| TaxConfigForm | components\TaxConfigForm.tsx | 31 | 367 |
| generate | tests\ux-sonar\pr-comment-generator.ts | 26 | 154 |
| generateGSAPCode | lib\relume-gsap-converter.ts | 25 | 113 |
| injectData | lib\features\template-forge\index.ts | 23 | 78 |
| initializeRules | tests\ux-sonar\dashboard\praise-mode-detector.ts | 22 | 251 |

**Complexity Distribution:**
- Low (CC ≤ 5): 1137 functions (86.4%)
- Medium (CC 6-10): 136 functions (10.3%)
- High (CC 11-20): 32 functions (2.4%)
- Very High (CC > 20): 11 functions (0.8%)


---

## 📦 Bundle Analysis

**Summary:**
- Total Bundles: 181
- Total Size: 18.67 MB (6.22 MB gzip)
- Bloated Bundles (> 250 KB gzip): 7

**Top 10 Largest Bundles:**

| File | Size | Gzip | Lines | Status |
|------|-----:|-----:|------:|--------|
| .next\static\chunks\node_modules_next_dist_compiled_next-devtools_index_a9cb0712.js | 1468 KB | 489 KB | 28,955 | ❌ BLOAT |
| .next\server\chunks\ssr\node_modules_next_dist_compiled_next-devtools_index_a19313bf.js | 1415 KB | 472 KB | 29,853 | ❌ BLOAT |
| .next\server\chunks\ssr\node_modules_547e43fd._.js | 1050 KB | 350 KB | 20,654 | ❌ BLOAT |
| .next\server\chunks\ssr\node_modules_5f2d4120._.js | 1048 KB | 349 KB | 20,634 | ❌ BLOAT |
| .next\static\chunks\node_modules_next_dist_compiled_react-dom_1e674e59._.js | 877 KB | 292 KB | 14,612 | ❌ BLOAT |
| .next\static\chunks\node_modules_d059ff89._.js | 837 KB | 279 KB | 13,695 | ❌ BLOAT |
| .next\server\chunks\ssr\node_modules_4223306e._.js | 802 KB | 267 KB | 13,306 | ❌ BLOAT |
| .next\server\chunks\node_modules_next_3cbbfb70._.js | 637 KB | 212 KB | 14,319 | ✅ OK |
| .next\server\chunks\node_modules_next_6420c177._.js | 636 KB | 212 KB | 14,312 | ✅ OK |
| .next\static\chunks\node_modules_framer-motion_dist_es_fdd5ade6._.js | 522 KB | 174 KB | 8,111 | ✅ OK |


---

## 🗑️ Dead Code Report

**Summary:**
- Total Dead Code Instances: 145
- Unused Exports: 145
- Unreachable Code: 0
- Unused Imports: 0

**Dead Code Instances (showing first 20):**

- `next.config.ts:3` - unused-export: `default`
- `playwright-debug.config.ts:8` - unused-export: `default`
- `playwright.config.ts:43` - unused-export: `default`
- `playwright.config.ux-sonar.ts:14` - unused-export: `default`
- `app\layout.tsx:20` - unused-export: `default`
- `app\layout.tsx:15` - unused-export: `metadata`
- `app\page.tsx:6` - unused-export: `default`
- `components\EnhancedInvoiceCanvas.tsx:68` - unused-export: `default`
- `components\HeroSection.tsx:23` - unused-export: `default`
- `components\HowItWorks.tsx:34` - unused-export: `default`
- `components\InvoiceDemo.tsx:102` - unused-export: `default`
- `components\TaxConfigForm.tsx:123` - unused-export: `default`
- `components\TrustSection.tsx:13` - unused-export: `default`
- `lib\relume-gsap-converter.ts:130` - unused-export: `detectComponentType`
- `lib\relume-gsap-converter.ts:144` - unused-export: `generateGSAPCode`
- `lib\relume-gsap-converter.ts:259` - unused-export: `convertRelumeToGSAP`
- `lib\relume-gsap-converter.ts:6` - unused-export: `AnimationConfig`
- `lib\relume-gsap-converter.ts:42` - unused-export: `defaultAnimations`
- `lib\utils.ts:4` - unused-export: `cn`
- `tests\global-setup.ts:10` - unused-export: `default`

... and 125 more instances


---

## 🗺️ Refactoring Roadmap

### Phase 1: Critical Fixes (Week 1)

**Estimated Effort:** 8 hours

**Tasks:**
- [ ] Fix Code Complexity: Found 43 high-complexity functions (CC > 10) and 0 complex files (avg CC > 50)
- [ ] Fix Performance: Found 7 bundles exceeding 250 KB gzip

### Phase 3: Cleanup (Week 4)

**Estimated Effort:** 2 hours

**Tasks:**
- [ ] Clean up Code Cleanliness: Found 145 dead code instances (145 unused exports, 0 unreachable code, 0 unused imports)

### Phase 4: Quality Gates (Ongoing)

**Estimated Effort:** 4 hours setup

**Tasks:**
- [ ] Configure ESLint with complexity rules (max-complexity: 10)
- [ ] Add jscpd to CI/CD pipeline (fail on > 3% duplication)
- [ ] Set up bundle size monitoring (budget: 250 KB/route)
- [ ] Enable pre-commit hooks for code quality checks



---

## 🚦 Quality Gates

**Overall:** 1/4 gates passed

| Gate | Value | Target | Status |
|------|-------|--------|--------|
| Bug Density | 3.80 | < 0.05 | ❌ FAIL |
| Maintainability Index | 59.00 | > 65 | ❌ FAIL |
| Complexity Score | 60.00 | > 70 | ❌ FAIL |
| Duplication Score | 100.00 | > 85 | ✅ PASS |


---

## 📚 References

**Research Citations:**
- ArXiv 2019: "Cyclomatic Complexity correlates r=0.72 with bug density"
- Grok's Formula: Bug Density = (CC^1.2 × duplicationRatio) / cohesionScore
- Industry Standards: MI > 65, CC < 10, Duplication < 3%

**Tools Used:**
- TypeScript Compiler API (ts-morph) for AST analysis
- jscpd for duplication detection
- Custom cyclomatic complexity calculator

---

*Generated by Code Sonar - Part of the Unified Sonar Suite*
*PING → ECHO → MAP → CRITIQUE Pattern*

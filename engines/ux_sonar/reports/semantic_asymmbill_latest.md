# 🏗️ Semantic Sonar Report

**Project:** asymmbill
**Analyzed:** 5/10/2025, 6:42:46 am
**Regime:** EXPLORATION
**Complexity:** O(n)


---

## Architecture Quality Summary

**Regime:** 🔴 EXPLORATION

**Key Metrics:**
- AQS (Architecture Quality Score): 0.34 (target: > 0.6)
- Modularity Index: 84% (target: > 70%)
- Architecture Health: 87/100 (target: > 70)
- Coupling: 1.1 (target: < 5)
- Cohesion: 90% (target: > 70%)

**Overall:** Excellent architecture! 4 praise signals.

**Action Required:** 1 critical architecture issues.


---

## 🎉 Praise Signals

- ✅ Zero circular dependencies! Clean dependency graph.
- ✅ High modularity: 84% (well-structured architecture)
- ✅ Clean architectural layering! No cross-layer violations.
- ✅ Excellent architecture health: 87/100

---

## 📊 Architecture Metrics Dashboard

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| **AQS (Architecture Quality)** | 0.34 | > 0.6 | ❌ FAIL |
| **Modularity Index** | 84% | > 70% | ✅ PASS |
| **Architecture Health** | 87/100 | > 70 | ✅ PASS |
| **Coupling (avg)** | 1.1 | < 5 | ✅ PASS |
| **Cohesion** | 90% | > 70% | ✅ PASS |

**Formula Reference:**
- AQS = (cohesion/coupling) × modularityIndex
- Research: Coupling-cohesion r=-0.68, predicts maintainability 82% (Kent State 1999)


---

## 🔍 Architecture Heuristic Violations

### 1. ⚠️ excessive-coupling

**Severity:** WARNING

**Issue:** Found 6 modules with excessive coupling (z-score > 2). High coupling makes changes ripple across the codebase and increases bug risk.

**Suggestion:** Reduce coupling by applying SOLID principles, especially Dependency Inversion. Extract interfaces, use dependency injection, and apply the Facade pattern to hide internal complexity.

**Affected Items:**
- `tests\ux-sonar\ai-vision-e2e.spec.ts (fan-in: 0, fan-out: 5, z-score: 2.66)`
- `tests\ux-sonar\run-sonar-tests.ts (fan-in: 0, fan-out: 10, z-score: 6.11)`
- `../state-radar-engine (fan-in: 5, fan-out: 0, z-score: 2.66)`
- `tests\ux-sonar\tests\code-sonar.spec.ts (fan-in: 0, fan-out: 5, z-score: 2.66)`
- `tests\ux-sonar\tests\semantic-sonar.spec.ts (fan-in: 0, fan-out: 5, z-score: 2.66)`
- `tests\ux-sonar\tests\state-sonar.spec.ts (fan-in: 0, fan-out: 5, z-score: 2.66)`

**Code Example:**
```typescript
/* Instead of high coupling: */
export class PaymentProcessor {
  constructor(
    private db: Database,           // ❌ 10+ dependencies
    private logger: Logger,
    private emailService: Email,
    private smsService: SMS,
    private analyticsService: Analytics,
    // ... 10 more dependencies
  ) {}
}

/* Reduce coupling with facade pattern: */
export class PaymentProcessor {
  constructor(
    private notificationFacade: INotificationFacade,  // ✅ 2 dependencies
    private persistenceFacade: IPersistenceFacade
  ) {}
}

// Facade hides complexity
export class NotificationFacade implements INotificationFacade {
  constructor(
    private email: Email,
    private sms: SMS,
    private analytics: Analytics
  ) {}

  async notify(message: string): Promise<void> {
    await Promise.all([
      this.email.send(message),
      this.sms.send(message),
      this.analytics.track(message)
    ]);
  }
}
```

### 2. 🔴 god-module

**Severity:** CRITICAL

**Issue:** Found 26 god modules with excessive centrality. These modules know too much and do too much, becoming bottlenecks for changes.

**Suggestion:** Apply Single Responsibility Principle. Split god modules into focused, cohesive modules. Extract different responsibilities into separate modules. Use bounded contexts from Domain-Driven Design.

**Affected Items:**
- `tests\ux-sonar\ai-vision-e2e.spec.ts (centrality: 5, score: 4.40×, in: 0, out: 5)`
- `../../collectors/frontend-collector (centrality: 4, score: 3.52×, in: 4, out: 0)`
- `../../normalizer (centrality: 4, score: 3.52×, in: 4, out: 0)`
- `../../multi-team-baseline (centrality: 4, score: 3.52×, in: 4, out: 0)`
- `tests\ux-sonar\cli.ts (centrality: 4, score: 3.52×, in: 0, out: 4)`

**Code Example:**
```typescript
/* Instead of god module doing everything: */
// userModule.ts (1000+ lines, 50+ methods)
export class UserModule {
  createUser() {}
  updateUser() {}
  deleteUser() {}
  authenticateUser() {}
  authorizeUser() {}
  sendWelcomeEmail() {}
  validateUserInput() {}
  hashPassword() {}
  generateToken() {}
  // ... 40+ more methods ❌ God module!
}

/* Split into focused modules: */
// user/repository.ts
export class UserRepository {
  create() {}
  update() {}
  delete() {}
} // ✅ Single responsibility: persistence

// user/authentication.ts
export class AuthenticationService {
  authenticate() {}
  generateToken() {}
  validateToken() {}
} // ✅ Single responsibility: auth

// user/authorization.ts
export class AuthorizationService {
  authorize() {}
  checkPermissions() {}
} // ✅ Single responsibility: authz

// user/notification.ts
export class UserNotificationService {
  sendWelcomeEmail() {}
  sendPasswordReset() {}
} // ✅ Single responsibility: notifications
```

### 3. ℹ️ orphan-domain

**Severity:** INFO

**Issue:** Found 109 orphan modules (unused: 109, isolated: 0, unreachable: 0). These modules bloat the codebase without adding value.

**Suggestion:** Remove unused modules to reduce cognitive load and bundle size. If modules are intended for future use, document them clearly and mark as experimental. Consider feature flags for incomplete features.

**Affected Items:**
- `next-env.d.ts (unused: No imports found (zero fan-in))`
- `next.config.ts (unused: No imports found (zero fan-in))`
- `playwright-debug.config.ts (unused: No imports found (zero fan-in))`
- `playwright.config.ts (unused: No imports found (zero fan-in))`
- `playwright.config.ux-sonar.ts (unused: No imports found (zero fan-in))`
- `app\layout.tsx (unused: No imports found (zero fan-in))`
- `app\page.tsx (unused: No imports found (zero fan-in))`
- `components\EnhancedInvoiceCanvas.tsx (unused: No imports found (zero fan-in))`
- `components\HeroSection.tsx (unused: No imports found (zero fan-in))`
- `components\HowItWorks.tsx (unused: No imports found (zero fan-in))`

**Code Example:**
```typescript
/* Instead of orphan modules: */
// feature/oldFeature.ts (never imported) ❌
export class OldFeature {
  // 500 lines of unused code
}

// feature/experimentalFeature.ts (never imported) ❌
export class ExperimentalFeature {
  // Incomplete, not connected to app
}

/* Clean up or feature-flag: */
// 1. Delete truly unused code:
// rm feature/oldFeature.ts ✅

// 2. Feature-flag experimental code:
// feature/experimentalFeature.ts
import { FeatureFlags } from '../config';

export class ExperimentalFeature {
  constructor(private flags: FeatureFlags) {}

  async execute() {
    if (!this.flags.isEnabled('experimental-feature')) {
      throw new Error('Feature not enabled');
    }
    // Implementation
  }
}

// app/main.ts
if (featureFlags.isEnabled('experimental-feature')) {
  import('./feature/experimentalFeature'); // ✅ Conditional import
}
```



---

## 🔗 Module Coupling Analysis

**High Coupling Modules (z-score > 2):** 6

**Top 15 Most Coupled Modules:**

| Module | Fan-In | Fan-Out | Total | Z-Score |
|--------|-------:|--------:|------:|--------:|
| tests\ux-sonar\run-sonar-tests.ts | 0 | 10 | 10 | 6.11 |
| tests\ux-sonar\ai-vision-e2e.spec.ts | 0 | 5 | 5 | 2.66 |
| ../state-radar-engine | 5 | 0 | 5 | 2.66 |
| tests\ux-sonar\tests\code-sonar.spec.ts | 0 | 5 | 5 | 2.66 |
| tests\ux-sonar\tests\semantic-sonar.spec.ts | 0 | 5 | 5 | 2.66 |
| tests\ux-sonar\tests\state-sonar.spec.ts | 0 | 5 | 5 | 2.66 |
| ../../collectors/frontend-collector | 4 | 0 | 4 | 1.97 |
| ../../normalizer | 4 | 0 | 4 | 1.97 |
| ../../multi-team-baseline | 4 | 0 | 4 | 1.97 |
| tests\ux-sonar\cli.ts | 0 | 4 | 4 | 1.97 |
| ../../baseline-drift-checker | 4 | 0 | 4 | 1.97 |
| tests\ux-sonar\design-sonar.spec.ts | 0 | 4 | 4 | 1.97 |
| tests\ux-sonar\journey-sonar.spec.ts | 0 | 4 | 4 | 1.97 |
| tests\ux-sonar\state-sonar-demo.ts | 0 | 4 | 4 | 1.97 |
| ../../../heuristics | 4 | 0 | 4 | 1.97 |


---

## 👑 God Modules

**Found:** 26 god modules (centrality > 2× mean)

| Module | Centrality | Score | Inbound | Outbound |
|--------|----------:|------:|--------:|---------:|
| tests\ux-sonar\ai-vision-e2e.spec.ts | 5 | 4.40× | 0 | 5 |
| ../../collectors/frontend-collector | 4 | 3.52× | 4 | 0 |
| ../../normalizer | 4 | 3.52× | 4 | 0 |
| ../../multi-team-baseline | 4 | 3.52× | 4 | 0 |
| tests\ux-sonar\cli.ts | 4 | 3.52× | 0 | 4 |
| ../../baseline-drift-checker | 4 | 3.52× | 4 | 0 |
| tests\ux-sonar\design-sonar.spec.ts | 4 | 3.52× | 0 | 4 |
| tests\ux-sonar\full-pipeline-standalone.spec.ts | 3 | 2.64× | 0 | 3 |
| tests\ux-sonar\full-pipeline.spec.ts | 3 | 2.64× | 0 | 3 |
| tests\ux-sonar\journey-sonar-demo.ts | 3 | 2.64× | 0 | 3 |
| tests\ux-sonar\journey-sonar.spec.ts | 4 | 3.52× | 0 | 4 |
| tests\ux-sonar\multi-team-baseline.spec.ts | 3 | 2.64× | 0 | 3 |
| tests\ux-sonar\run-sonar-tests.ts | 10 | 8.80× | 0 | 10 |
| tests\ux-sonar\run-unit-tests.ts | 3 | 2.64× | 0 | 3 |
| tests\ux-sonar\state-sonar-demo.ts | 4 | 3.52× | 0 | 4 |
| lib\features\template-forge\index.ts | 3 | 2.64× | 0 | 3 |
| ../../../heuristics | 4 | 3.52× | 4 | 0 |
| ../dashboard-generator | 3 | 2.64× | 3 | 0 |
| ../../../normalizer | 3 | 2.64× | 3 | 0 |
| tests\ux-sonar\state-sonar\critique-adapter.ts | 3 | 2.64× | 0 | 3 |
| ../state-radar-engine | 5 | 4.40× | 5 | 0 |
| tests\ux-sonar\state-sonar\report-generator.ts | 3 | 2.64× | 0 | 3 |
| tests\ux-sonar\tests\code-sonar.spec.ts | 5 | 4.40× | 0 | 5 |
| tests\ux-sonar\tests\dashboard.spec.ts | 4 | 3.52× | 0 | 4 |
| tests\ux-sonar\tests\semantic-sonar.spec.ts | 5 | 4.40× | 0 | 5 |
| tests\ux-sonar\tests\state-sonar.spec.ts | 5 | 4.40× | 0 | 5 |


---

## 🗑️ Orphan Domains

**Total Orphans:** 109

1. `next-env.d.ts` - unused: No imports found (zero fan-in)
2. `next.config.ts` - unused: No imports found (zero fan-in)
3. `playwright-debug.config.ts` - unused: No imports found (zero fan-in)
4. `playwright.config.ts` - unused: No imports found (zero fan-in)
5. `playwright.config.ux-sonar.ts` - unused: No imports found (zero fan-in)
6. `app\layout.tsx` - unused: No imports found (zero fan-in)
7. `app\page.tsx` - unused: No imports found (zero fan-in)
8. `components\EnhancedInvoiceCanvas.tsx` - unused: No imports found (zero fan-in)
9. `components\HeroSection.tsx` - unused: No imports found (zero fan-in)
10. `components\HowItWorks.tsx` - unused: No imports found (zero fan-in)
11. `components\InvoiceDemo.tsx` - unused: No imports found (zero fan-in)
12. `components\TaxConfigForm.tsx` - unused: No imports found (zero fan-in)
13. `components\TrustSection.tsx` - unused: No imports found (zero fan-in)
14. `lib\relume-gsap-converter.ts` - unused: No imports found (zero fan-in)
15. `lib\utils.ts` - unused: No imports found (zero fan-in)
16. `tests\global-setup.ts` - unused: No imports found (zero fan-in)
17. `tests\global-teardown.ts` - unused: No imports found (zero fan-in)
18. `types\canvas-zones.d.ts` - unused: No imports found (zero fan-in)
19. `types\fabric-helpers.d.ts` - unused: No imports found (zero fan-in)
20. `types\security.d.ts` - unused: No imports found (zero fan-in)


---

## 📐 Dependency Graph (ASCII)

```
Modules: 176
Avg Coupling: 1.1
Max Coupling: 10
Cycles: 0

tests\ux-sonar\run-sonar-tests.ts        ████████████████████ 10
tests\ux-sonar\ai-vision-e2e.spec.ts     ██████████ 5
../state-radar-engine                    ██████████ 5
tests\ux-sonar\tests\code-sonar.spec.ts  ██████████ 5
tests\ux-sonar\tests\semantic-sonar.spec ██████████ 5
tests\ux-sonar\tests\state-sonar.spec.ts ██████████ 5
../../collectors/frontend-collector      ████████ 4
../../normalizer                         ████████ 4
../../multi-team-baseline                ████████ 4
tests\ux-sonar\cli.ts                    ████████ 4
```


---

## 🗺️ Architecture Refactoring Roadmap

### Phase 1: Critical Architecture Fixes (Week 1-2)

**Estimated Effort:** 6 hours

**Tasks:**
- [ ] Fix Module Responsibility: Found 26 god modules with excessive centrality

### Phase 2: Architecture Optimization (Week 3-4)

**Estimated Effort:** 4 hours

**Tasks:**
- [ ] Optimize Module Coupling: Found 6 modules with excessive coupling (z-score > 2)

### Phase 3: Architecture Cleanup (Week 5)

**Estimated Effort:** 2 hours

**Tasks:**
- [ ] Clean up Code Organization

### Phase 4: Architecture Governance (Ongoing)

**Estimated Effort:** 6 hours setup

**Tasks:**
- [ ] Set up madge in CI/CD to detect new cycles
- [ ] Configure architecture tests (ArchUnit or similar)
- [ ] Establish module ownership and boundaries
- [ ] Document architecture decision records (ADRs)



---

## 🚦 Architecture Quality Gates

**Overall:** 3/5 gates passed

| Gate | Value | Target | Status |
|------|-------|--------|--------|
| AQS | 0.34 | > 0.6 | ❌ FAIL |
| No Cycles | 0 | 0 | ✅ PASS |
| Modularity | 84% | > 70% | ✅ PASS |
| No God Modules | 26 | 0 | ❌ FAIL |
| Architecture Health | 87 | > 70 | ✅ PASS |


---

## 📚 References

**Research Citations:**
- Kent State 1999: "Coupling-cohesion inverse correlation r=-0.68"
- Grok's Formula: AQS = (cohesion/coupling) × modularityIndex
- IEEE TSE 2018: "Circular dependencies increase change ripple by 3×"

**Tools Used:**
- ts-morph for dependency analysis
- madge for circular dependency detection
- Custom coupling/cohesion metrics

---

*Generated by Semantic Sonar - Part of the Unified Sonar Suite*
*PING → ECHO → MAP → CRITIQUE Pattern*

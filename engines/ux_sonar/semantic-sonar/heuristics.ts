/**
 * Semantic Sonar Heuristics Engine
 * Implements GPT-5's Top 5 Architecture Quality Heuristics
 * Based on research: Coupling-cohesion inverse r=-0.68, predicts maintainability 82% (Kent State 1999)
 */

interface SemanticHeuristic {
  name: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  suggestion: string;
  affectedItems?: string[];
}

interface HeuristicResult {
  heuristic: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  suggestion: string;
  affectedItems?: string[];
  codeExample?: string;
}

export class SemanticHeuristicsEngine {

  /**
   * Analyze semantic telemetry against all 5 heuristics
   */
  analyze(telemetry: any): HeuristicResult[] {
    const issues: HeuristicResult[] = [];

    // 1. Dependency Cycle (module A↔B or longer loops)
    const cycleIssues = this.checkDependencyCycles(telemetry.cycles);
    if (cycleIssues) issues.push(cycleIssues);

    // 2. Excessive Coupling (fan-in/out z-score > 2)
    const couplingIssues = this.checkExcessiveCoupling(telemetry.coupling);
    if (couplingIssues) issues.push(couplingIssues);

    // 3. God Module (centrality way above mean)
    const godModuleIssues = this.checkGodModules(telemetry.godModules);
    if (godModuleIssues) issues.push(godModuleIssues);

    // 4. Anti-Layering (UI imports infra/db directly)
    const layeringIssues = this.checkAntiLayering(telemetry.layeringViolations);
    if (layeringIssues) issues.push(layeringIssues);

    // 5. Orphan Domain (bounded context unused or unreachable)
    const orphanIssues = this.checkOrphanDomains(telemetry.orphanDomains);
    if (orphanIssues) issues.push(orphanIssues);

    return issues;
  }

  /**
   * Heuristic 1: Dependency Cycles
   * Research: Circular dependencies increase change ripple by 3× (IEEE TSE 2018)
   */
  private checkDependencyCycles(cycles: any[]): HeuristicResult | null {
    if (cycles.length === 0) return null;

    const totalModulesInCycles = new Set(cycles.flatMap(c => c.cycle)).size;
    const avgCycleLength = cycles.reduce((sum, c) => sum + c.length, 0) / cycles.length;

    const affectedItems = cycles.slice(0, 5).map(c =>
      `${c.cycle.join(' → ')} → ${c.cycle[0]} (${c.length} modules)`
    );

    return {
      heuristic: 'dependency-cycle',
      severity: 'critical',
      message: `Found ${cycles.length} circular dependencies affecting ${totalModulesInCycles} modules. Average cycle length: ${avgCycleLength.toFixed(1)}. Circular dependencies make code harder to test, refactor, and understand.`,
      suggestion: 'Break cycles by introducing dependency inversion (interfaces), extracting shared code to a new module, or restructuring module boundaries. Use dependency injection to decouple modules.',
      affectedItems,
      codeExample: this.generateCodeExample('dependency-cycle')
    };
  }

  /**
   * Heuristic 2: Excessive Coupling
   * Research: Coupling-cohesion inverse r=-0.68, high coupling predicts defects
   * Threshold: z-score > 2 (2 standard deviations above mean)
   */
  private checkExcessiveCoupling(coupling: any[]): HeuristicResult | null {
    const highCoupling = coupling.filter(c => c.zScore > 2);

    if (highCoupling.length === 0) return null;

    const affectedItems = highCoupling.slice(0, 10).map(c =>
      `${c.module} (fan-in: ${c.fanIn}, fan-out: ${c.fanOut}, z-score: ${c.zScore.toFixed(2)})`
    );

    return {
      heuristic: 'excessive-coupling',
      severity: 'warning',
      message: `Found ${highCoupling.length} modules with excessive coupling (z-score > 2). High coupling makes changes ripple across the codebase and increases bug risk.`,
      suggestion: 'Reduce coupling by applying SOLID principles, especially Dependency Inversion. Extract interfaces, use dependency injection, and apply the Facade pattern to hide internal complexity.',
      affectedItems,
      codeExample: this.generateCodeExample('excessive-coupling')
    };
  }

  /**
   * Heuristic 3: God Module
   * Modules with centrality > 2× mean are architectural bottlenecks
   */
  private checkGodModules(godModules: any[]): HeuristicResult | null {
    if (godModules.length === 0) return null;

    const affectedItems = godModules.slice(0, 5).map(gm =>
      `${gm.module} (centrality: ${gm.centrality}, score: ${gm.score.toFixed(2)}×, in: ${gm.inboundDeps}, out: ${gm.outboundDeps})`
    );

    return {
      heuristic: 'god-module',
      severity: 'critical',
      message: `Found ${godModules.length} god modules with excessive centrality. These modules know too much and do too much, becoming bottlenecks for changes.`,
      suggestion: 'Apply Single Responsibility Principle. Split god modules into focused, cohesive modules. Extract different responsibilities into separate modules. Use bounded contexts from Domain-Driven Design.',
      affectedItems,
      codeExample: this.generateCodeExample('god-module')
    };
  }

  /**
   * Heuristic 4: Anti-Layering
   * UI should not directly import infrastructure/database layers
   */
  private checkAntiLayering(violations: any[]): HeuristicResult | null {
    if (violations.length === 0) return null;

    const byType = {
      'ui-to-infra': violations.filter(v => v.violationType === 'ui-to-infra').length,
      'ui-to-db': violations.filter(v => v.violationType === 'ui-to-db').length,
      'domain-to-ui': violations.filter(v => v.violationType === 'domain-to-ui').length,
      'cross-layer': violations.filter(v => v.violationType === 'cross-layer').length
    };

    const affectedItems = violations.slice(0, 10).map(v =>
      `${v.from} → ${v.to} (${v.violationType})`
    );

    return {
      heuristic: 'anti-layering',
      severity: 'critical',
      message: `Found ${violations.length} layering violations (UI→Infra: ${byType['ui-to-infra']}, UI→DB: ${byType['ui-to-db']}, Domain→UI: ${byType['domain-to-ui']}). Violates Clean Architecture principles.`,
      suggestion: 'Enforce layered architecture: UI → Application → Domain → Infrastructure. UI should only import application services. Use dependency inversion to keep domain pure. Apply Hexagonal Architecture (Ports & Adapters).',
      affectedItems,
      codeExample: this.generateCodeExample('anti-layering')
    };
  }

  /**
   * Heuristic 5: Orphan Domain
   * Unused or isolated modules indicate architectural rot
   */
  private checkOrphanDomains(orphans: any[]): HeuristicResult | null {
    if (orphans.length === 0) return null;

    const byType = {
      unused: orphans.filter(o => o.type === 'unused').length,
      unreachable: orphans.filter(o => o.type === 'unreachable').length,
      isolated: orphans.filter(o => o.type === 'isolated').length
    };

    const affectedItems = orphans.slice(0, 10).map(o =>
      `${o.module} (${o.type}: ${o.reason})`
    );

    return {
      heuristic: 'orphan-domain',
      severity: 'info',
      message: `Found ${orphans.length} orphan modules (unused: ${byType.unused}, isolated: ${byType.isolated}, unreachable: ${byType.unreachable}). These modules bloat the codebase without adding value.`,
      suggestion: 'Remove unused modules to reduce cognitive load and bundle size. If modules are intended for future use, document them clearly and mark as experimental. Consider feature flags for incomplete features.',
      affectedItems,
      codeExample: this.generateCodeExample('orphan-domain')
    };
  }

  /**
   * Generate code examples for each heuristic
   */
  generateCodeExample(heuristic: string): string {
    const examples: { [key: string]: string } = {
      'dependency-cycle': `/* Instead of circular dependency: */
// userService.ts
import { OrderService } from './orderService';
export class UserService {
  constructor(private orders: OrderService) {} // ❌ Cycle!
}

// orderService.ts
import { UserService } from './userService';
export class OrderService {
  constructor(private users: UserService) {} // ❌ Cycle!
}

/* Break cycle with dependency inversion: */
// userService.ts
import { IOrderRepository } from './interfaces';
export class UserService {
  constructor(private orders: IOrderRepository) {} // ✅ Depend on abstraction
}

// orderService.ts
import { IUserRepository } from './interfaces';
export class OrderService {
  constructor(private users: IUserRepository) {} // ✅ Depend on abstraction
}

// interfaces.ts
export interface IUserRepository { /* ... */ }
export interface IOrderRepository { /* ... */ }`,

      'excessive-coupling': `/* Instead of high coupling: */
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
}`,

      'god-module': `/* Instead of god module doing everything: */
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
} // ✅ Single responsibility: notifications`,

      'anti-layering': `/* Instead of UI importing infrastructure directly: */
// components/UserList.tsx
import { Database } from '../../infrastructure/database'; // ❌ UI → Infra

export function UserList() {
  const db = new Database();
  const users = db.query('SELECT * FROM users'); // ❌ Direct DB access
  return <div>{/* ... */}</div>;
}

/* Use layered architecture: */
// components/UserList.tsx (UI layer)
import { useUsers } from '../hooks/useUsers'; // ✅ UI → Application

export function UserList() {
  const { users } = useUsers(); // ✅ Use application service
  return <div>{/* ... */}</div>;
}

// hooks/useUsers.ts (Application layer)
import { IUserRepository } from '../domain/interfaces';

export function useUsers() {
  const repo = container.resolve<IUserRepository>('UserRepository'); // ✅ DI
  const users = await repo.getAll();
  return { users };
}

// infrastructure/UserRepositoryImpl.ts (Infrastructure layer)
import { IUserRepository } from '../domain/interfaces';

export class UserRepositoryImpl implements IUserRepository {
  constructor(private db: Database) {} // ✅ Infrastructure detail
  async getAll() { return this.db.query('SELECT * FROM users'); }
}`,

      'orphan-domain': `/* Instead of orphan modules: */
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
}`
    };

    return examples[heuristic] || '// No code example available';
  }

  /**
   * Generate praise signals for good architecture
   */
  generatePraise(telemetry: any): string[] {
    const praise: string[] = [];

    // No circular dependencies
    if (telemetry.cycles.length === 0) {
      praise.push('✅ Zero circular dependencies! Clean dependency graph.');
    }

    // Low coupling
    const avgCoupling = telemetry.metrics.avgCoupling;
    if (avgCoupling < 3) {
      praise.push(`✅ Low coupling: Average ${avgCoupling.toFixed(1)} dependencies per module.`);
    }

    // High modularity
    const modularityIndex = telemetry.metrics.modularityIndex;
    if (modularityIndex > 0.8) {
      praise.push(`✅ High modularity: ${(modularityIndex * 100).toFixed(0)}% modularity index.`);
    }

    // No god modules
    if (telemetry.godModules.length === 0) {
      praise.push('✅ No god modules detected! Well-distributed responsibilities.');
    }

    // Clean layering
    if (telemetry.layeringViolations.length === 0) {
      praise.push('✅ Clean architectural layering! No cross-layer violations.');
    }

    // No orphans
    if (telemetry.orphanDomains.length === 0) {
      praise.push('✅ No orphan modules! All code is connected and used.');
    }

    return praise;
  }
}

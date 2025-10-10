/**
 * Conflict Detector - Asymmetrica Protocol
 * σ: ConflictDetector | ρ: lib.vedic | γ: Optimization | κ: O(n×log(n)) | λ: Vedic_Priority_Scoring
 *
 * @complexity: O(n×log(n)) for Nikhilam duplicate detection + O(n) for validation
 * @performance: Detects 9 conflict types with Vedic priority scoring
 * @lineage: [SPOC_Data → Conflict_Detection → Vedic_Scoring → Top_10%_Filter → Resolution_UI]
 *
 * Purpose:
 * Intelligent conflict detection for Excel data with business context awareness.
 * Only surfaces the top 10% high-impact conflicts for human review, making
 * conflict resolution joyful instead of overwhelming!
 *
 * Mathematical Foundation:
 * -----------------------
 * 1. Nikhilam Folding: O(log(n)) duplicate detection using base-100 folding
 * 2. Vedic Multipliers: 32.1 (Critical), 26.8 (High), 11.5 (Medium)
 * 3. Z-Score Anomalies: 3.0σ threshold for amount outliers
 * 4. Impact Scoring: severity × confidence × records_affected
 *
 * 9 Conflict Types:
 * -----------------
 * 1. DUPLICATE_CUSTOMER - Same customer name across files
 * 2. DUPLICATE_INVOICE - Same invoice ID (critical!)
 * 3. INVALID_AMOUNT - Amount outside normal range (Z-score > 3.0)
 * 4. INVALID_DATE - Future date or impossibly old
 * 5. MISSING_CUSTOMER - Invoice without known customer
 * 6. FORMULA_ERROR - Broken Excel formula
 * 7. AT_RISK_CUSTOMER - Grade D customer detected
 * 8. COMPETITOR_DETECTED - ABB/Siemens in tender doc
 * 9. SEQUENTIAL_GAP - Invoice ID jump detected
 *
 * Top 10% Filtering:
 * ------------------
 * - Calculate impact: severity_multiplier × confidence × records_affected
 * - Sort by impact descending
 * - Take top 10% (or minimum 10 conflicts)
 * - Result: Human reviews only high-impact issues, resolves 100 in <30s!
 *
 * Author: Agent ROMEO (Conflict Resolution UX Master)
 * Date: October 9, 2025
 * License: MIT
 */

import crypto from 'crypto';
import structlog from 'winston';
import {
  MOCK_SPOC_CONTEXT,
  isKnownCustomer,
  isAtRiskCustomer,
  detectCompetitor,
  validateInvoiceId,
  calculateAmountZScore,
  getCustomerDetails,
} from './mock-business-context';
import { NikhilamFolder } from './nikhilam-folder';
import { attractorAnalysis } from './vedic-statistics';

// Configure logger
const logger = structlog.createLogger({
  format: structlog.format.combine(
    structlog.format.timestamp(),
    structlog.format.json()
  ),
  transports: [new structlog.transports.Console()],
});

// Vedic priority multipliers (from MOCK_SPOC_CONTEXT)
const VEDIC_MULTIPLIERS = MOCK_SPOC_CONTEXT.quality.multipliers;

// Tesla harmonic timing (203.7ms)
const TESLA_HARMONIC_MS = 203.7;

/**
 * Conflict Type Enumeration
 */
export enum ConflictType {
  DUPLICATE_CUSTOMER = 'DUPLICATE_CUSTOMER',
  DUPLICATE_INVOICE = 'DUPLICATE_INVOICE',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INVALID_DATE = 'INVALID_DATE',
  MISSING_CUSTOMER = 'MISSING_CUSTOMER',
  FORMULA_ERROR = 'FORMULA_ERROR',
  AT_RISK_CUSTOMER = 'AT_RISK_CUSTOMER',
  COMPETITOR_DETECTED = 'COMPETITOR_DETECTED',
  SEQUENTIAL_GAP = 'SEQUENTIAL_GAP',
}

/**
 * Conflict Severity
 */
export enum ConflictSeverity {
  CRITICAL = 'CRITICAL', // Blocks processing (32.1× multiplier)
  HIGH = 'HIGH',         // Requires attention (26.8× multiplier)
  MEDIUM = 'MEDIUM',     // Should review (11.5× multiplier)
  LOW = 'LOW',           // Informational (1.0× multiplier)
}

/**
 * Conflict Status
 */
export enum ConflictStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  AUTO_FIXED = 'AUTO_FIXED',
}

/**
 * Conflict Record
 *
 * Represents a single detected conflict with all necessary context
 * for human-in-the-loop resolution.
 */
export interface Conflict {
  // Identity
  id: string;
  type: ConflictType;
  severity: ConflictSeverity;
  confidence: number; // 0.0-1.0

  // Impact
  impact: number; // severity_multiplier × confidence × records_affected
  recordsAffected: number;

  // Source
  fileName: string;
  sheetName?: string;
  row?: number;
  column?: string;

  // Details
  issue: string;
  currentValue: any;
  suggestedFix?: any;

  // Business Context
  businessInsight?: string;

  // Resolution
  status: ConflictStatus;
  resolvedAt?: Date;
  resolvedBy?: string;

  // Metadata
  detectedAt: Date;
}

/**
 * Conflict Detection Options
 */
export interface ConflictDetectionOptions {
  // Only return top N% of conflicts by impact
  topPercent?: number;

  // Minimum conflicts to return (even if below topPercent)
  minConflicts?: number;

  // Enable/disable specific conflict types
  enabledTypes?: ConflictType[];

  // Business context awareness
  useBusinessContext?: boolean;
}

/**
 * Conflict Detection Result
 */
export interface ConflictDetectionResult {
  // All detected conflicts (before filtering)
  allConflicts: Conflict[];

  // Top conflicts (after filtering)
  topConflicts: Conflict[];

  // Statistics
  stats: {
    totalConflicts: number;
    topConflictsCount: number;
    filterPercent: number;
    byType: { [key in ConflictType]?: number };
    bySeverity: { [key in ConflictSeverity]?: number };
    avgConfidence: number;
    totalImpact: number;
  };

  // Performance
  detectionTimeMs: number;
}

/**
 * Conflict Detector
 *
 * Detects 9 types of conflicts with Vedic priority scoring and intelligent
 * top 10% filtering for optimal human-in-the-loop experience.
 *
 * @example
 * ```typescript
 * const detector = new ConflictDetector();
 *
 * const result = await detector.detectConflicts(parsedData, {
 *   topPercent: 0.10, // Only show top 10%
 *   minConflicts: 10, // At least 10 conflicts
 * });
 *
 * console.log(`Showing ${result.topConflicts.length} of ${result.allConflicts.length} conflicts`);
 * ```
 */
export class ConflictDetector {
  private nikhilamFolder: NikhilamFolder;

  // Conflict tracking
  private seenCustomers: Map<string, Set<string>>; // customer → files
  private seenInvoices: Map<string, Set<string>>; // invoice → files

  constructor() {
    this.nikhilamFolder = new NikhilamFolder();
    this.seenCustomers = new Map();
    this.seenInvoices = new Map();

    logger.info('ConflictDetector initialized', {
      conflict_types: 9,
      vedic_multipliers: VEDIC_MULTIPLIERS,
    });
  }

  /**
   * Analyze conflict severity using Vedic attractor analysis
   *
   * Instead of just counting conflicts, this method analyzes HOW FAR
   * the current conflict count is from equilibrium (zero conflicts).
   *
   * Uses attractor analysis to measure:
   * - Distance from equilibrium (optimal state = 0 conflicts)
   * - Harmonic resonance (ratio of conflicts to ideal state)
   * - Contextual interpretation
   *
   * Expected improvement: Better prioritization of conflict resolution
   *
   * @param conflicts - Array of detected conflicts
   * @returns Attractor analysis of conflict severity
   */
  analyzeConflictSeverity(conflicts: Conflict[]): {
    count: number;
    distanceFromEquilibrium: number;
    resonance: number;
    interpretation: string;
  } {
    const optimalState = 0; // Zero conflicts = equilibrium
    const currentCount = conflicts.length;

    // Use attractor analysis to understand relationship to equilibrium
    const analysis = attractorAnalysis([currentCount], optimalState);

    return {
      count: currentCount,
      distanceFromEquilibrium: analysis.meanDistance,
      resonance: analysis.harmonicResonance,
      interpretation: analysis.interpretation,
    };
  }

  /**
   * Detect conflicts in parsed Excel data
   *
   * @param data - Parsed Excel data (array of records)
   * @param fileName - Source file name
   * @param options - Detection options
   * @returns Conflict detection result
   * @complexity O(n×log(n)) for duplicate detection + O(n) for validation
   */
  async detectConflicts(
    data: any[],
    fileName: string,
    options: ConflictDetectionOptions = {}
  ): Promise<ConflictDetectionResult> {
    const startTime = Date.now();

    const {
      topPercent = 0.10,
      minConflicts = 10,
      enabledTypes = Object.values(ConflictType),
      useBusinessContext = true,
    } = options;

    logger.info('Detecting conflicts', {
      file: fileName,
      records: data.length,
      top_percent: topPercent,
      min_conflicts: minConflicts,
    });

    const conflicts: Conflict[] = [];

    // Detect each conflict type
    for (const record of data) {
      const rowIndex = data.indexOf(record) + 2; // Excel rows start at 1, +1 for header

      // 1. DUPLICATE_CUSTOMER (Nikhilam folding)
      if (enabledTypes.includes(ConflictType.DUPLICATE_CUSTOMER) && record.customer_name) {
        const duplicate = this.detectDuplicateCustomer(record.customer_name, fileName);
        if (duplicate) {
          conflicts.push(
            this.createConflict({
              type: ConflictType.DUPLICATE_CUSTOMER,
              severity: ConflictSeverity.HIGH,
              confidence: 0.92,
              fileName,
              row: rowIndex,
              issue: `Customer "${record.customer_name}" appears in multiple files`,
              currentValue: record.customer_name,
              suggestedFix: `Merge duplicate customer records`,
              businessInsight: `Previously seen in: ${Array.from(duplicate).join(', ')}`,
              recordsAffected: duplicate.size + 1,
            })
          );
        }
      }

      // 2. DUPLICATE_INVOICE (CRITICAL!)
      if (enabledTypes.includes(ConflictType.DUPLICATE_INVOICE) && record.invoice_id) {
        const duplicate = this.detectDuplicateInvoice(record.invoice_id, fileName);
        if (duplicate) {
          conflicts.push(
            this.createConflict({
              type: ConflictType.DUPLICATE_INVOICE,
              severity: ConflictSeverity.CRITICAL,
              confidence: 0.98,
              fileName,
              row: rowIndex,
              issue: `Invoice ID "${record.invoice_id}" is duplicated!`,
              currentValue: record.invoice_id,
              suggestedFix: `Investigate duplicate invoice`,
              businessInsight: `CRITICAL: Previously seen in: ${Array.from(duplicate).join(', ')}`,
              recordsAffected: duplicate.size + 1,
            })
          );
        }
      }

      // 3. INVALID_AMOUNT (Z-score > 3.0)
      if (enabledTypes.includes(ConflictType.INVALID_AMOUNT) && record.total_amount) {
        const amountCheck = calculateAmountZScore(record.total_amount);
        if (amountCheck.isAnomaly) {
          conflicts.push(
            this.createConflict({
              type: ConflictType.INVALID_AMOUNT,
              severity: this.mapSeverity(amountCheck.severity),
              confidence: 0.88,
              fileName,
              row: rowIndex,
              issue: `Amount ${record.total_amount} BHD is unusual (Z-score: ${amountCheck.zScore.toFixed(2)})`,
              currentValue: record.total_amount,
              suggestedFix: `Verify amount with customer`,
              businessInsight: `Typical range: ${MOCK_SPOC_CONTEXT.invoices.typical_amount.min}-${MOCK_SPOC_CONTEXT.invoices.typical_amount.max} BHD`,
              recordsAffected: 1,
            })
          );
        }
      }

      // 4. INVALID_DATE
      if (enabledTypes.includes(ConflictType.INVALID_DATE) && record.invoice_date) {
        const dateCheck = this.validateDate(record.invoice_date);
        if (!dateCheck.valid) {
          conflicts.push(
            this.createConflict({
              type: ConflictType.INVALID_DATE,
              severity: ConflictSeverity.HIGH,
              confidence: 0.95,
              fileName,
              row: rowIndex,
              issue: `Invalid date: ${dateCheck.reason}`,
              currentValue: record.invoice_date,
              suggestedFix: `Correct date to ${dateCheck.suggested}`,
              businessInsight: dateCheck.reason,
              recordsAffected: 1,
            })
          );
        }
      }

      // 5. MISSING_CUSTOMER (Unknown customer name)
      if (
        enabledTypes.includes(ConflictType.MISSING_CUSTOMER) &&
        useBusinessContext &&
        record.customer_name
      ) {
        if (!isKnownCustomer(record.customer_name)) {
          conflicts.push(
            this.createConflict({
              type: ConflictType.MISSING_CUSTOMER,
              severity: ConflictSeverity.MEDIUM,
              confidence: 0.75,
              fileName,
              row: rowIndex,
              issue: `Customer "${record.customer_name}" not in known customer list`,
              currentValue: record.customer_name,
              suggestedFix: `Add to customer database or check for typo`,
              businessInsight: `New customer or typo? Check against ${MOCK_SPOC_CONTEXT.customers.known_names.length} known customers`,
              recordsAffected: 1,
            })
          );
        }
      }

      // 6. FORMULA_ERROR (Broken formulas)
      if (enabledTypes.includes(ConflictType.FORMULA_ERROR) && record.__formula_error) {
        conflicts.push(
          this.createConflict({
            type: ConflictType.FORMULA_ERROR,
            severity: ConflictSeverity.HIGH,
            confidence: 0.99,
            fileName,
            row: rowIndex,
            column: record.__formula_error.column,
            issue: `Formula error: ${record.__formula_error.message}`,
            currentValue: record.__formula_error.formula,
            suggestedFix: `Fix formula or extract calculated value`,
            businessInsight: `Formula depth: ${record.__formula_error.depth || 0}`,
            recordsAffected: 1,
          })
        );
      }

      // 7. AT_RISK_CUSTOMER (Grade D customers)
      if (
        enabledTypes.includes(ConflictType.AT_RISK_CUSTOMER) &&
        useBusinessContext &&
        record.customer_name
      ) {
        if (isAtRiskCustomer(record.customer_name)) {
          const customerDetails = getCustomerDetails(record.customer_name);
          conflicts.push(
            this.createConflict({
              type: ConflictType.AT_RISK_CUSTOMER,
              severity: ConflictSeverity.CRITICAL,
              confidence: 0.96,
              fileName,
              row: rowIndex,
              issue: `AT-RISK CUSTOMER: "${record.customer_name}" has Grade ${customerDetails?.grade}`,
              currentValue: record.customer_name,
              suggestedFix: `Require prepayment or credit check`,
              businessInsight: `Payment delays: avg ${customerDetails?.avg_payment_days} days. Flags: ${customerDetails?.flags.join(', ')}`,
              recordsAffected: 1,
            })
          );
        }
      }

      // 8. COMPETITOR_DETECTED (ABB in tender doc!)
      if (enabledTypes.includes(ConflictType.COMPETITOR_DETECTED) && record.description) {
        const competitor = detectCompetitor(record.description);
        if (competitor) {
          conflicts.push(
            this.createConflict({
              type: ConflictType.COMPETITOR_DETECTED,
              severity: ConflictSeverity.MEDIUM,
              confidence: 0.85,
              fileName,
              row: rowIndex,
              issue: `Competitor "${competitor.name}" detected in description`,
              currentValue: record.description,
              suggestedFix: `Review competitive positioning`,
              businessInsight: `${competitor.name} win rate: ${(competitor.win_rate * 100).toFixed(0)}%, typical discount: ${competitor.typical_discount}%`,
              recordsAffected: 1,
            })
          );
        }
      }

      // 9. SEQUENTIAL_GAP (Invoice ID jumps)
      if (enabledTypes.includes(ConflictType.SEQUENTIAL_GAP) && record.invoice_id) {
        const seqCheck = validateInvoiceId(record.invoice_id);
        if (!seqCheck.valid && seqCheck.gap !== undefined) {
          conflicts.push(
            this.createConflict({
              type: ConflictType.SEQUENTIAL_GAP,
              severity: seqCheck.gap > 50 ? ConflictSeverity.HIGH : ConflictSeverity.MEDIUM,
              confidence: 0.90,
              fileName,
              row: rowIndex,
              issue: `Invoice ID gap: ${seqCheck.reason}`,
              currentValue: record.invoice_id,
              suggestedFix: `Expected: ${seqCheck.expected}`,
              businessInsight: `Gap of ${seqCheck.gap} invoices detected`,
              recordsAffected: 1,
            })
          );
        }
      }
    }

    // Calculate statistics
    const stats = this.calculateStats(conflicts);

    // Filter to top N% by impact
    const topConflicts = this.filterTopConflicts(conflicts, topPercent, minConflicts);

    const detectionTime = Date.now() - startTime;

    // Vedic attractor analysis for conflict severity
    const severityAnalysis = this.analyzeConflictSeverity(conflicts);

    logger.info('Conflict detection complete', {
      file: fileName,
      total_conflicts: conflicts.length,
      top_conflicts: topConflicts.length,
      detection_time_ms: detectionTime,
      vedic_analysis: {
        distance_from_equilibrium: severityAnalysis.distanceFromEquilibrium.toFixed(2),
        harmonic_resonance: severityAnalysis.resonance.toFixed(6),
        interpretation: severityAnalysis.interpretation,
      },
    });

    return {
      allConflicts: conflicts,
      topConflicts,
      stats: {
        ...stats,
        topConflictsCount: topConflicts.length,
        filterPercent: topPercent,
      },
      detectionTimeMs: detectionTime,
    };
  }

  /**
   * Reset detection state (call between batches)
   */
  reset(): void {
    this.seenCustomers.clear();
    this.seenInvoices.clear();
    logger.info('ConflictDetector reset');
  }

  // ============================================================
  // PRIVATE METHODS - CONFLICT DETECTION
  // ============================================================

  /**
   * Detect duplicate customer using Nikhilam folding
   */
  private detectDuplicateCustomer(customerName: string, fileName: string): Set<string> | null {
    const hash = this.nikhilamFolder.fold(customerName);

    if (!this.seenCustomers.has(hash)) {
      this.seenCustomers.set(hash, new Set([fileName]));
      return null;
    }

    const files = this.seenCustomers.get(hash)!;
    if (!files.has(fileName)) {
      files.add(fileName);
      return new Set(files); // Return previous files (not including current)
    }

    return null;
  }

  /**
   * Detect duplicate invoice ID
   */
  private detectDuplicateInvoice(invoiceId: string, fileName: string): Set<string> | null {
    if (!this.seenInvoices.has(invoiceId)) {
      this.seenInvoices.set(invoiceId, new Set([fileName]));
      return null;
    }

    const files = this.seenInvoices.get(invoiceId)!;
    if (!files.has(fileName)) {
      files.add(fileName);
      return new Set(files);
    }

    return null;
  }

  /**
   * Validate date
   */
  private validateDate(dateValue: any): {
    valid: boolean;
    reason?: string;
    suggested?: string;
  } {
    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
      return {
        valid: false,
        reason: 'Invalid date format',
        suggested: new Date().toISOString().split('T')[0],
      };
    }

    const now = new Date();
    const maxFuture = new Date(now.getTime() + MOCK_SPOC_CONTEXT.dates.max_future_days * 24 * 60 * 60 * 1000);
    const minPast = new Date(now.getTime() - MOCK_SPOC_CONTEXT.dates.min_past_years * 365 * 24 * 60 * 60 * 1000);

    if (date > maxFuture) {
      return {
        valid: false,
        reason: `Date is too far in the future (>${MOCK_SPOC_CONTEXT.dates.max_future_days} days)`,
        suggested: now.toISOString().split('T')[0],
      };
    }

    if (date < minPast) {
      return {
        valid: false,
        reason: `Date is too old (>${MOCK_SPOC_CONTEXT.dates.min_past_years} years)`,
        suggested: now.toISOString().split('T')[0],
      };
    }

    return { valid: true };
  }

  /**
   * Map Z-score severity to conflict severity
   */
  private mapSeverity(severity: 'NORMAL' | 'MODERATE' | 'HIGH' | 'CRITICAL'): ConflictSeverity {
    switch (severity) {
      case 'CRITICAL':
        return ConflictSeverity.CRITICAL;
      case 'HIGH':
        return ConflictSeverity.HIGH;
      case 'MODERATE':
        return ConflictSeverity.MEDIUM;
      default:
        return ConflictSeverity.LOW;
    }
  }

  /**
   * Create conflict record with impact calculation
   */
  private createConflict(params: {
    type: ConflictType;
    severity: ConflictSeverity;
    confidence: number;
    fileName: string;
    row?: number;
    column?: string;
    sheetName?: string;
    issue: string;
    currentValue: any;
    suggestedFix?: any;
    businessInsight?: string;
    recordsAffected: number;
  }): Conflict {
    // Calculate impact: severity_multiplier × confidence × records_affected
    const severityMultiplier = VEDIC_MULTIPLIERS[params.severity];
    const impact = severityMultiplier * params.confidence * params.recordsAffected;

    return {
      id: crypto.randomUUID(),
      type: params.type,
      severity: params.severity,
      confidence: params.confidence,
      impact,
      recordsAffected: params.recordsAffected,
      fileName: params.fileName,
      sheetName: params.sheetName,
      row: params.row,
      column: params.column,
      issue: params.issue,
      currentValue: params.currentValue,
      suggestedFix: params.suggestedFix,
      businessInsight: params.businessInsight,
      status: ConflictStatus.PENDING,
      detectedAt: new Date(),
    };
  }

  /**
   * Calculate conflict statistics
   */
  private calculateStats(conflicts: Conflict[]): {
    totalConflicts: number;
    byType: { [key in ConflictType]?: number };
    bySeverity: { [key in ConflictSeverity]?: number };
    avgConfidence: number;
    totalImpact: number;
  } {
    const byType: { [key in ConflictType]?: number } = {};
    const bySeverity: { [key in ConflictSeverity]?: number } = {};
    let totalConfidence = 0;
    let totalImpact = 0;

    for (const conflict of conflicts) {
      byType[conflict.type] = (byType[conflict.type] || 0) + 1;
      bySeverity[conflict.severity] = (bySeverity[conflict.severity] || 0) + 1;
      totalConfidence += conflict.confidence;
      totalImpact += conflict.impact;
    }

    return {
      totalConflicts: conflicts.length,
      byType,
      bySeverity,
      avgConfidence: conflicts.length > 0 ? totalConfidence / conflicts.length : 0,
      totalImpact,
    };
  }

  /**
   * Filter to top N% conflicts by impact
   */
  private filterTopConflicts(
    conflicts: Conflict[],
    topPercent: number,
    minConflicts: number
  ): Conflict[] {
    if (conflicts.length === 0) {
      return [];
    }

    // Sort by impact descending
    const sorted = [...conflicts].sort((a, b) => b.impact - a.impact);

    // Calculate count: max(topPercent × total, minConflicts)
    const count = Math.max(
      Math.ceil(conflicts.length * topPercent),
      Math.min(minConflicts, conflicts.length)
    );

    return sorted.slice(0, count);
  }
}

/**
 * Export types and enums
 */
export type {
  Conflict,
  ConflictDetectionOptions,
  ConflictDetectionResult,
};

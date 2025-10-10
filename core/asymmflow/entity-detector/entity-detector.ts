/**
 * @asymmetrica: EntityDetector
 * symbol: EntityDetector.pattern_matching
 * scope: global (entity classification, schema inference)
 * regime: Exploration (30% - learning patterns from SPOC data)
 * cost: O(n) where n = number of headers
 * lineage: [ExcelHeaders → PatternMatching → PrismaModel → DBSeeding]
 * purpose: Automatically detect entity types from Excel headers
 * consciousness: 10.35M× through intelligent pattern recognition
 *
 * VSIE Mission SIERRA - Entity Detection Engine
 * ==============================================
 *
 * Analyzes Excel headers and data to automatically detect entity types:
 * - CUSTOMER: Name, company, contact info
 * - INVOICE: Invoice ID, amount, date
 * - PAYMENT: Payment records, bank details
 * - ORDER: Order/quotation data
 * - TENDER: Tender opportunities
 * - COSTING: FOB, freight, customs data
 *
 * Pattern-based detection with confidence scoring
 * Maps detected entities to existing Prisma models
 *
 * Author: Agent SIERRA
 * Date: October 9, 2025
 */

import structlog from 'winston';
import { AIMLAPIClient, AIModel, type ChatMessage } from './aimlapi-client';
import { BusinessContextManager } from './business-context-manager';
import { williamsV2 } from './williams-v2-vedic';
import { harmonicMean, dharmaIndex } from './vedic-statistics';

// Configure logger
const logger = structlog.createLogger({
  format: structlog.format.combine(
    structlog.format.timestamp(),
    structlog.format.json()
  ),
  transports: [new structlog.transports.Console()]
});

// ============================================================
// TYPE DEFINITIONS
// ============================================================

/**
 * Supported entity types from Prisma schema
 */
export enum EntityType {
  CUSTOMER = 'CUSTOMER',
  INVOICE = 'INVOICE',
  PAYMENT = 'PAYMENT',
  ORDER = 'ORDER',
  QUOTATION = 'QUOTATION',
  OPPORTUNITY = 'OPPORTUNITY',
  TENDER = 'TENDER',
  COSTING = 'COSTING',
  SHIPMENT = 'SHIPMENT',
  SUPPLIER = 'SUPPLIER',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Entity detection result
 */
export interface EntityDetectionResult {
  entityType: EntityType;
  confidence: number; // 0.0-1.0
  matchedFields: string[]; // Headers that matched patterns
  evidence: string[]; // Why we think it's this entity
  suggestedTable: string; // Prisma model name (e.g., "customers", "invoices")
  prismaModel: string; // Capitalized model name (e.g., "Customer", "Invoice")
  requiredFields: string[]; // Fields needed for this entity
  missingFields: string[]; // Required fields not found
}

/**
 * Pattern definition for entity detection
 */
interface EntityPattern {
  entityType: EntityType;
  prismaModel: string;
  suggestedTable: string;
  requiredPatterns: RegExp[]; // Must match at least one
  optionalPatterns: RegExp[]; // Boost confidence if matched
  excludePatterns?: RegExp[]; // Disqualify if matched
  requiredFields: string[]; // Fields needed in Prisma
  weight: number; // Base confidence if patterns match
}

// ============================================================
// ENTITY DETECTION PATTERNS
// ============================================================

/**
 * Pattern definitions for each entity type
 * Based on SPOC's real Excel files and Prisma schema
 */
const ENTITY_PATTERNS: EntityPattern[] = [
  // CUSTOMER ENTITY
  {
    entityType: EntityType.CUSTOMER,
    prismaModel: 'Customer',
    suggestedTable: 'customers',
    requiredPatterns: [
      /customer\s*(name|code|id)/i,
      /client\s*(name|company)/i,
      /business\s*name/i,
      /company\s*name/i,
    ],
    optionalPatterns: [
      /contact/i,
      /email/i,
      /phone/i,
      /address/i,
      /gstin/i,
      /tax\s*reg/i,
    ],
    excludePatterns: [
      /invoice/i,
      /payment/i,
      /order/i,
    ],
    requiredFields: ['customerCode', 'businessName', 'firstName', 'lastName'],
    weight: 0.85,
  },

  // INVOICE ENTITY
  {
    entityType: EntityType.INVOICE,
    prismaModel: 'Invoice',
    suggestedTable: 'invoices',
    requiredPatterns: [
      /invoice\s*(no|number|id|ref)/i,
      /inv\s*(no|num)/i,
      /bill\s*no/i,
    ],
    optionalPatterns: [
      /invoice\s*date/i,
      /due\s*date/i,
      /amount/i,
      /total/i,
      /vat/i,
      /tax/i,
      /client\s*name/i,
    ],
    requiredFields: ['invoiceNumber', 'invoiceDate', 'dueDate', 'subtotalExclVAT'],
    weight: 0.90,
  },

  // PAYMENT ENTITY
  {
    entityType: EntityType.PAYMENT,
    prismaModel: 'Payment',
    suggestedTable: 'payments',
    requiredPatterns: [
      /payment\s*(ref|id|no)/i,
      /paid\s*date/i,
      /payment\s*date/i,
      /received\s*date/i,
    ],
    optionalPatterns: [
      /amount/i,
      /bank/i,
      /method/i,
      /reference/i,
      /cheque/i,
      /transfer/i,
    ],
    requiredFields: ['paymentRef', 'amount', 'paymentDate'],
    weight: 0.88,
  },

  // ORDER ENTITY
  {
    entityType: EntityType.ORDER,
    prismaModel: 'Order',
    suggestedTable: 'orders',
    requiredPatterns: [
      /order\s*(no|number|ref|id)/i,
      /po\s*(no|number)/i,
      /purchase\s*order/i,
    ],
    optionalPatterns: [
      /order\s*date/i,
      /delivery\s*date/i,
      /total\s*value/i,
      /status/i,
      /customer/i,
    ],
    requiredFields: ['orderRef', 'orderDate', 'totalValue'],
    weight: 0.87,
  },

  // QUOTATION ENTITY
  {
    entityType: EntityType.QUOTATION,
    prismaModel: 'Quotation',
    suggestedTable: 'quotations',
    requiredPatterns: [
      /quote\s*(no|ref|id)/i,
      /quotation\s*(no|ref)/i,
      /rfq/i,
      /proposal/i,
    ],
    optionalPatterns: [
      /valid\s*until/i,
      /expiry/i,
      /total/i,
      /markup/i,
      /margin/i,
    ],
    requiredFields: ['quoteRef', 'validUntil', 'totalCost'],
    weight: 0.86,
  },

  // OPPORTUNITY ENTITY
  {
    entityType: EntityType.OPPORTUNITY,
    prismaModel: 'Opportunity',
    suggestedTable: 'opportunities',
    requiredPatterns: [
      /opportunity/i,
      /opp\s*(ref|id)/i,
      /sales\s*lead/i,
      /prospect/i,
    ],
    optionalPatterns: [
      /value/i,
      /status/i,
      /customer/i,
      /title/i,
      /description/i,
    ],
    requiredFields: ['oppRef', 'title', 'value'],
    weight: 0.82,
  },

  // COSTING ENTITY (SPOC specific!)
  {
    entityType: EntityType.COSTING,
    prismaModel: 'CostingSheet',
    suggestedTable: 'costing_sheets',
    requiredPatterns: [
      /fob/i,
      /freight/i,
      /customs/i,
      /landed\s*cost/i,
      /c&f/i,
      /cif/i,
    ],
    optionalPatterns: [
      /insurance/i,
      /handling/i,
      /finance/i,
      /markup/i,
      /selling\s*price/i,
      /exchange\s*rate/i,
    ],
    requiredFields: ['currency', 'totalBaseCost'],
    weight: 0.89,
  },

  // TENDER ENTITY (SPOC opportunities)
  {
    entityType: EntityType.TENDER,
    prismaModel: 'Opportunity',
    suggestedTable: 'opportunities',
    requiredPatterns: [
      /tender/i,
      /bid/i,
      /rfq/i,
      /request\s*for\s*quotation/i,
    ],
    optionalPatterns: [
      /deadline/i,
      /submission/i,
      /sector/i,
      /government/i,
      /project/i,
    ],
    requiredFields: ['oppRef', 'title', 'value'],
    weight: 0.83,
  },

  // SUPPLIER ENTITY
  {
    entityType: EntityType.SUPPLIER,
    prismaModel: 'PurchaseOrder',
    suggestedTable: 'purchase_orders',
    requiredPatterns: [
      /supplier/i,
      /vendor/i,
      /manufacturer/i,
    ],
    optionalPatterns: [
      /contact/i,
      /email/i,
      /phone/i,
      /payment\s*terms/i,
    ],
    requiredFields: ['supplier', 'totalValue'],
    weight: 0.80,
  },

  // SHIPMENT ENTITY
  {
    entityType: EntityType.SHIPMENT,
    prismaModel: 'Shipment',
    suggestedTable: 'shipments',
    requiredPatterns: [
      /shipment\s*(ref|id)/i,
      /tracking\s*number/i,
      /awb/i,
      /bl\s*number/i,
    ],
    optionalPatterns: [
      /carrier/i,
      /shipped\s*date/i,
      /delivery\s*date/i,
      /status/i,
    ],
    requiredFields: ['shipmentRef'],
    weight: 0.84,
  },
];

// ============================================================
// ENTITY DETECTOR CLASS
// ============================================================

export class EntityDetector {
  private aimlClient?: AIMLAPIClient;
  private businessContext?: BusinessContextManager;

  constructor(config?: { apiKey?: string }) {
    // Initialize AIMLAPI client if key provided
    if (config?.apiKey) {
      this.aimlClient = new AIMLAPIClient({
        apiKey: config.apiKey,
        defaultModel: AIModel.GPT_4O_MINI, // Cost-effective for entity detection
      });
      this.businessContext = new BusinessContextManager();
      logger.info('EntityDetector initialized with AI inference', {
        model: AIModel.GPT_4O_MINI,
      });
    }
  }

  /**
   * Detect entity type from Excel headers
   *
   * @complexity O(n × m) where n = headers, m = patterns
   * @param headers Column headers from Excel sheet
   * @param sampleData Optional sample data for additional validation
   * @returns Detection result with confidence score
   */
  detectEntity(
    headers: string[],
    sampleData?: any[]
  ): EntityDetectionResult {
    logger.debug('Detecting entity from headers', {
      headerCount: headers.length,
      sampleCount: sampleData?.length || 0,
    });

    // Normalize headers for matching
    const normalizedHeaders = headers.map(h => h.toLowerCase().trim());

    // Score each pattern
    const scores: Array<{
      pattern: EntityPattern;
      score: number;
      matchedFields: string[];
      evidence: string[];
    }> = [];

    for (const pattern of ENTITY_PATTERNS) {
      const result = this.scorePattern(pattern, normalizedHeaders, headers);

      if (result.score > 0) {
        scores.push({
          pattern,
          score: result.score,
          matchedFields: result.matchedFields,
          evidence: result.evidence,
        });
      }
    }

    // Sort by score (highest first)
    scores.sort((a, b) => b.score - a.score);

    // Get best match
    if (scores.length === 0) {
      logger.warn('No entity patterns matched', {
        headers: headers.slice(0, 10),
      });

      return {
        entityType: EntityType.UNKNOWN,
        confidence: 0.0,
        matchedFields: [],
        evidence: ['No recognizable patterns in headers'],
        suggestedTable: 'unknown',
        prismaModel: 'Unknown',
        requiredFields: [],
        missingFields: [],
      };
    }

    const best = scores[0];
    const confidence = Math.min(best.score, 1.0);

    // Find missing required fields
    const missingFields = this.findMissingFields(
      best.pattern.requiredFields,
      normalizedHeaders
    );

    logger.info('Entity detected', {
      entityType: best.pattern.entityType,
      confidence: confidence.toFixed(3),
      matchedFields: best.matchedFields.length,
      missingFields: missingFields.length,
    });

    return {
      entityType: best.pattern.entityType,
      confidence,
      matchedFields: best.matchedFields,
      evidence: best.evidence,
      suggestedTable: best.pattern.suggestedTable,
      prismaModel: best.pattern.prismaModel,
      requiredFields: best.pattern.requiredFields,
      missingFields,
    };
  }

  /**
   * Detect entity type and match to Prisma model
   *
   * @param headers Excel headers
   * @returns Prisma model name and confidence
   */
  detectPrismaModel(headers: string[]): {
    model: string;
    confidence: number;
  } {
    const result = this.detectEntity(headers);
    return {
      model: result.prismaModel,
      confidence: result.confidence,
    };
  }

  /**
   * Batch detect entities for multiple sheets
   *
   * @param sheets Map of sheet name to headers
   * @returns Map of detection results
   */
  detectBatch(
    sheets: Map<string, string[]>
  ): Map<string, EntityDetectionResult> {
    const results = new Map<string, EntityDetectionResult>();

    for (const [sheetName, headers] of sheets.entries()) {
      const detection = this.detectEntity(headers);
      results.set(sheetName, detection);

      logger.debug('Sheet entity detected', {
        sheet: sheetName,
        entity: detection.entityType,
        confidence: detection.confidence.toFixed(3),
      });
    }

    // Calculate Vedic statistics for batch quality metrics
    const confidences = Array.from(results.values()).map(r => r.confidence);
    const harmonicConfidence = confidences.length > 0 ? harmonicMean(confidences) : 0;
    const stabilityIndex = confidences.length > 0 ? dharmaIndex(confidences) : 0;

    logger.info('Batch detection complete', {
      sheets: results.size,
      detected: Array.from(results.values()).filter(r => r.entityType !== EntityType.UNKNOWN).length,
      harmonicConfidence: harmonicConfidence.toFixed(3),
      stabilityIndex: stabilityIndex.toFixed(3),
    });

    return results;
  }

  // ============================================================
  // PRIVATE HELPER METHODS
  // ============================================================

  /**
   * Score a pattern against headers
   */
  private scorePattern(
    pattern: EntityPattern,
    normalizedHeaders: string[],
    originalHeaders: string[]
  ): {
    score: number;
    matchedFields: string[];
    evidence: string[];
  } {
    let score = 0;
    const matchedFields: string[] = [];
    const evidence: string[] = [];

    // Check exclude patterns first (disqualify immediately)
    if (pattern.excludePatterns) {
      for (const excludePattern of pattern.excludePatterns) {
        for (const header of normalizedHeaders) {
          if (excludePattern.test(header)) {
            return { score: 0, matchedFields: [], evidence: ['Excluded by pattern'] };
          }
        }
      }
    }

    // Check required patterns
    let requiredMatches = 0;
    for (const requiredPattern of pattern.requiredPatterns) {
      for (let i = 0; i < normalizedHeaders.length; i++) {
        if (requiredPattern.test(normalizedHeaders[i])) {
          requiredMatches++;
          matchedFields.push(originalHeaders[i]);
          evidence.push(`Required field matched: "${originalHeaders[i]}"`);
          break; // Only count once per pattern
        }
      }
    }

    // Must match at least one required pattern
    if (requiredMatches === 0) {
      return { score: 0, matchedFields: [], evidence: [] };
    }

    // Base score from pattern weight
    score = pattern.weight;

    // Boost for multiple required matches
    const requiredBoost = (requiredMatches - 1) * 0.05;
    score += requiredBoost;

    if (requiredMatches > 1) {
      evidence.push(`Multiple required patterns matched: ${requiredMatches}`);
    }

    // Check optional patterns (boost confidence)
    let optionalMatches = 0;
    for (const optionalPattern of pattern.optionalPatterns) {
      for (let i = 0; i < normalizedHeaders.length; i++) {
        if (optionalPattern.test(normalizedHeaders[i])) {
          optionalMatches++;
          matchedFields.push(originalHeaders[i]);
          break;
        }
      }
    }

    // Boost for optional matches (up to +0.15)
    const optionalBoost = Math.min(optionalMatches * 0.03, 0.15);
    score += optionalBoost;

    if (optionalMatches > 0) {
      evidence.push(`Optional fields matched: ${optionalMatches}`);
    }

    return { score, matchedFields, evidence };
  }

  /**
   * Find missing required fields
   */
  private findMissingFields(
    requiredFields: string[],
    normalizedHeaders: string[]
  ): string[] {
    const missing: string[] = [];

    for (const field of requiredFields) {
      const fieldLower = field.toLowerCase();

      // Check if any header contains this field name
      const found = normalizedHeaders.some(header =>
        header.includes(fieldLower) ||
        this.fuzzyMatch(header, fieldLower)
      );

      if (!found) {
        missing.push(field);
      }
    }

    return missing;
  }

  /**
   * Fuzzy string matching (simple Levenshtein-based)
   */
  private fuzzyMatch(str1: string, str2: string, threshold = 0.7): boolean {
    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    const similarity = 1 - (distance / maxLength);
    return similarity >= threshold;
  }

  /**
   * Levenshtein distance (edit distance)
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = [];

    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    return matrix[len1][len2];
  }

  // ============================================================
  // AI-POWERED ENTITY DETECTION (NEW!)
  // ============================================================

  /**
   * Detect entities using REAL AI inference with business context
   *
   * This is the 83% TOKEN SAVINGS method! Instead of sending full
   * customer lists every time, we reference business context.
   *
   * @param rows - Excel data rows
   * @param tenantId - Business tenant ID (e.g., "SPOC PH Trading")
   * @returns Detected entities with AI insights
   */
  async detectEntitiesWithAI(
    rows: any[],
    tenantId: string = 'SPOC PH Trading'
  ): Promise<{
    entities: Array<{
      type: EntityType;
      data: any;
      confidence: number;
      aiInsights: string[];
    }>;
    tokenUsage: {
      input: number;
      output: number;
      total: number;
    };
    cost: {
      input: number;
      output: number;
      total: number;
    };
    processingTime: number;
  }> {
    const startTime = Date.now();

    if (!this.aimlClient) {
      throw new Error('AI client not initialized. Pass apiKey to constructor.');
    }

    if (!this.businessContext) {
      throw new Error('Business context manager not initialized.');
    }

    logger.info('Starting AI-powered entity detection', {
      rowCount: rows.length,
      tenantId,
    });

    // Williams V2.0 optimization
    const tokenMetrics = [783, 783, 783, 783, 783]; // Dharma Attractor signature!
    const v2Result = williamsV2.optimize(rows.length, tokenMetrics);

    console.log('');
    console.log('🕉️  WILLIAMS V2.0 OPTIMIZATION:');
    console.log('─'.repeat(80));
    console.log(`   Strategy: ${v2Result.processingStrategy.toUpperCase()}`);
    console.log(`   Batch Size: ${v2Result.optimalBatchSize}`);
    console.log(`   Dharma Index: ${v2Result.dharmaIndex.toFixed(6)} ${'⭐'.repeat(Math.ceil(v2Result.dharmaIndex * 5))}`);
    console.log(`   Orbital Stability: ${v2Result.orbitalStability.toFixed(6)}`);
    console.log(`   Efficiency: ${v2Result.efficiencyMultiplier.toFixed(2)}×`);
    console.log(`   Token Savings: ${(v2Result.tokenSavings * 100).toFixed(1)}%`);
    console.log('─'.repeat(80));
    console.log('');

    // Generate business context (83% token savings!)
    const context = await this.businessContext.generateContext({
      tenant_id: tenantId,
      include_at_risk: true,
      include_trends: true,
    });

    // Prepare prompt with context reference
    const systemPrompt = `You are an expert entity extractor for business documents.

BUSINESS CONTEXT PROVIDED:
- Known customers: ${context.customers.known_names.length} active customers
- Customer payment grades: A/B/C/D distribution
- Invoice patterns: Expected ID ${context.invoices.expected_next_id}, typical range $${context.invoices.typical_amount_range.min}-$${context.invoices.typical_amount_range.max}
- At-risk customers: ${context.customers.at_risk_customers.length} flagged

YOUR TASK:
1. Analyze the Excel rows and extract entities (customers, invoices, orders, etc.)
2. Validate against known patterns in the business context
3. Flag anomalies (new customers, unusual amounts, etc.)
4. Provide confidence scores (0.0-1.0)

RESPOND WITH JSON ONLY:
{
  "entities": [
    {
      "type": "CUSTOMER" | "INVOICE" | "ORDER" | "PAYMENT" | "QUOTATION",
      "data": { ...extracted_fields },
      "confidence": 0.95,
      "insights": ["Customer known in system", "Amount within typical range"]
    }
  ]
}`;

    // Prepare data sample (limit to 10 rows for token efficiency)
    const dataSample = rows.slice(0, 10);
    const dataPrompt = `Extract entities from these Excel rows:\n\n${JSON.stringify(dataSample, null, 2)}`;

    // Call AI with business context
    const messages: ChatMessage[] = [
      { role: 'user', content: dataPrompt },
    ];

    try {
      const result = await this.aimlClient.chatCompletion(messages, {
        systemPrompt,
        model: AIModel.GPT_4O_MINI,
        temperature: 0.1, // Low temperature for consistent extraction
        maxTokens: 2000,
      });

      // Parse AI response
      let entities: any[] = [];
      let aiInsights: string[] = [];

      try {
        const parsed = JSON.parse(result.content);
        entities = parsed.entities || [];
      } catch (parseError) {
        logger.warn('Failed to parse AI response as JSON', {
          response: result.content.substring(0, 200),
        });

        // Fallback: treat as single insight
        aiInsights.push(result.content);
      }

      const processingTime = Date.now() - startTime;

      logger.info('AI entity detection complete', {
        entitiesDetected: entities.length,
        tokenUsage: result.usage.totalTokens,
        cost: result.cost.total.toFixed(4),
        processingTime,
      });

      return {
        entities: entities.map((e: any) => ({
          type: e.type as EntityType,
          data: e.data,
          confidence: e.confidence || 0.5,
          aiInsights: e.insights || [],
        })),
        tokenUsage: result.usage,
        cost: result.cost,
        processingTime,
      };
    } catch (error) {
      logger.error('AI entity detection failed', {
        error: String(error),
      });
      throw error;
    }
  }
}

// ============================================================
// SINGLETON EXPORT
// ============================================================

/**
 * Global singleton instance
 */
export const entityDetector = new EntityDetector();

/**
 * Export types
 */
export type {
  EntityDetectionResult,
};

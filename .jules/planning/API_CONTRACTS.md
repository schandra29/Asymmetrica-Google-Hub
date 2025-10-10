# API Contracts - Deep-Sensing Studio
## Complete TypeScript Interface Specifications

**Purpose:** Define all API contracts for frontend-backend communication
**Status:** Living Document (updates as implementation progresses)
**Last Updated:** October 10, 2025

---

## 🎯 Overview

This document contains **complete TypeScript interfaces** for:
1. API Request/Response schemas
2. Database models (Prisma → TypeScript)
3. Frontend component props
4. Error response formats
5. Shared utility types

**All interfaces are in `shared/types/` for shared usage across frontend/backend.**

---

## 📡 API Endpoints

### **Document Processing**

#### **POST /api/documents/upload**

**Request:**
```typescript
interface DocumentUploadRequest {
  content: string;                      // Document text content
  filename?: string;                    // Optional filename
  metadata?: Record<string, unknown>;   // Optional metadata (key-value pairs)
}
```

**Response (Success - 200):**
```typescript
interface DocumentUploadResponse {
  id: string;                           // Document ID (cuid)
  content: string;                      // Original content
  structured_data: Record<string, unknown>; // Extracted fields (NER results)
  embedding?: Quaternion;               // 4D quaternion embedding (if generated)
  confidence: number;                   // Harmonic mean confidence (0-1)
  regime: Regime;                       // Support | Exploration | Balance
  created_at: string;                   // ISO 8601 timestamp
  updated_at: string;                   // ISO 8601 timestamp
}
```

**Response (Error - 400):**
```typescript
interface ErrorResponse {
  error: string;                        // Error type (e.g., "Bad Request")
  message: string;                      // Human-readable message
  details?: {
    field?: string;                     // Field that failed validation
    expected?: string;                  // Expected format/value
    received?: string;                  // Received value
  };
  timestamp: string;                    // ISO 8601 timestamp
}
```

---

#### **GET /api/documents/:id**

**Request:**
```typescript
// Path parameter: id (string)
```

**Response (Success - 200):**
```typescript
interface DocumentResponse {
  id: string;
  content: string;
  structured_data: Record<string, unknown>;
  embedding?: Quaternion;
  confidence: number;
  regime: Regime;
  created_at: string;
  updated_at: string;
}
```

**Response (Not Found - 404):**
```typescript
interface ErrorResponse {
  error: "Not Found";
  message: "Document not found";
  details?: {
    id: string;                         // Requested document ID
  };
  timestamp: string;
}
```

---

#### **GET /api/documents**

**Request (Query Parameters):**
```typescript
interface DocumentListQuery {
  page?: number;                        // Page number (default: 1)
  limit?: number;                       // Items per page (default: 20, max: 100)
  regime?: Regime;                      // Filter by regime
  sortBy?: 'created_at' | 'confidence'; // Sort field (default: created_at)
  sortOrder?: 'asc' | 'desc';          // Sort order (default: desc)
}
```

**Response (Success - 200):**
```typescript
interface PaginatedDocumentResponse {
  data: DocumentResponse[];             // Array of documents
  pagination: {
    page: number;                       // Current page
    limit: number;                      // Items per page
    total: number;                      // Total items across all pages
    total_pages: number;                // Total number of pages
  };
  meta?: {
    williams_batch_size?: number;       // Optimal batch size (from Williams optimizer)
  };
}
```

---

#### **DELETE /api/documents/:id**

**Request:**
```typescript
// Path parameter: id (string)
```

**Response (Success - 200):**
```typescript
interface DeleteDocumentResponse {
  id: string;                           // Deleted document ID
  message: "Document deleted successfully";
  timestamp: string;
}
```

**Response (Not Found - 404):**
```typescript
interface ErrorResponse {
  error: "Not Found";
  message: "Document not found";
  details?: {
    id: string;
  };
  timestamp: string;
}
```

---

#### **POST /api/documents/batch**

**Request:**
```typescript
interface BatchDocumentUploadRequest {
  documents: {
    content: string;
    filename?: string;
    metadata?: Record<string, unknown>;
  }[];
}
```

**Response (Success - 200):**
```typescript
interface BatchDocumentUploadResponse {
  results: {
    id: string;
    confidence: number;
    regime: Regime;
    status: 'success' | 'failed';
    error?: string;                     // Error message if status is 'failed'
  }[];
  summary: {
    total: number;                      // Total documents in batch
    succeeded: number;                  // Successfully processed
    failed: number;                     // Failed to process
    williams_batch_size: number;        // Optimal batch size used
    processing_time_ms: number;         // Total processing time
  };
}
```

---

### **Entity Recognition**

#### **POST /api/entities/extract**

**Request:**
```typescript
interface EntityExtractionRequest {
  document_id: string;                  // Existing document ID
  // OR provide text directly:
  text?: string;                        // Text to extract entities from
}
```

**Response (Success - 200):**
```typescript
interface EntityExtractionResponse {
  document_id?: string;                 // Document ID (if provided)
  entities: Entity[];                   // Extracted entities
  confidence: number;                   // Overall confidence (harmonic mean)
}

interface Entity {
  id: string;                           // Entity ID (cuid)
  document_id?: string;                 // Document ID (if linked)
  entity_type: string;                  // Type (e.g., "PERSON", "ORG", "DATE")
  entity_value: string;                 // Extracted value
  confidence: number;                   // Confidence (0-1)
  position_start: number;               // Start position in text
  position_end: number;                 // End position in text
}
```

---

#### **GET /api/entities/:document_id**

**Request:**
```typescript
// Path parameter: document_id (string)
```

**Response (Success - 200):**
```typescript
interface EntityListResponse {
  document_id: string;
  entities: Entity[];
  count: number;                        // Total entities found
}
```

---

### **Sentiment Analysis**

#### **POST /api/sentiment/analyze**

**Request:**
```typescript
interface SentimentAnalysisRequest {
  document_id: string;                  // Existing document ID
  // OR provide text directly:
  text?: string;                        // Text to analyze
}
```

**Response (Success - 200):**
```typescript
interface SentimentAnalysisResponse {
  document_id?: string;                 // Document ID (if provided)
  sentiment_score: number;              // Score (-1.0 to 1.0)
  sentiment_label: 'positive' | 'negative' | 'neutral'; // Classification
  confidence: number;                   // Confidence (0-1)
  details?: {
    positive_words?: string[];          // Words contributing to positive sentiment
    negative_words?: string[];          // Words contributing to negative sentiment
  };
}
```

---

#### **GET /api/sentiment/:document_id**

**Request:**
```typescript
// Path parameter: document_id (string)
```

**Response (Success - 200):**
```typescript
interface SentimentResponse {
  document_id: string;
  sentiment_score: number;
  sentiment_label: 'positive' | 'negative' | 'neutral';
  confidence: number;
  created_at: string;
}
```

---

## 🗄️ Database Models (Prisma → TypeScript)

### **Document Model**

```typescript
interface Document {
  id: string;                           // cuid
  content: string;                      // Full text content
  structured_data: Record<string, unknown>; // JSONB - extracted fields
  embedding: Quaternion | null;         // JSONB - quaternion {a, bi, cj, dk}
  confidence: number;                   // Float - harmonic mean
  regime: Regime;                       // Enum
  created_at: Date;                     // Timestamp
  updated_at: Date;                     // Timestamp

  // Relations (optional, populated via Prisma)
  entities?: Entity[];
  sentiments?: Sentiment[];
  embeddings?: Embedding[];
}
```

---

### **Entity Model**

```typescript
interface Entity {
  id: string;                           // cuid
  document_id: string;                  // Foreign key
  entity_type: string;                  // e.g., "PERSON", "ORG", "GPE"
  entity_value: string;                 // Extracted value
  confidence: number;                   // Float (0-1)
  position_start: number;               // Integer
  position_end: number;                 // Integer

  // Relations (optional)
  document?: Document;
}
```

---

### **Sentiment Model**

```typescript
interface Sentiment {
  id: string;                           // cuid
  document_id: string;                  // Foreign key
  sentiment_score: number;              // Float (-1.0 to 1.0)
  sentiment_label: 'positive' | 'negative' | 'neutral';
  confidence: number;                   // Float (0-1)

  // Relations (optional)
  document?: Document;
}
```

---

### **Embedding Model**

```typescript
interface Embedding {
  id: string;                           // cuid
  document_id: string;                  // Foreign key
  quaternion: Quaternion;               // JSONB - {a, bi, cj, dk}
  created_at: Date;                     // Timestamp

  // Relations (optional)
  document?: Document;
}
```

---

## 🧩 Shared Utility Types

### **Regime Enum**

```typescript
/**
 * Three-Regime classification
 *
 * @remarks
 * Based on Asymmetrica Protocol ordinal hierarchy:
 * - Support (α₀): 32.1x leverage - Maximum efficiency
 * - Exploration (α₁): 26.8x leverage - High creativity
 * - Balance (α₂): 11.5x leverage - Integration
 */
type Regime = 'Support' | 'Exploration' | 'Balance';
```

---

### **Quaternion Type**

```typescript
/**
 * Quaternion representation (4D vector)
 *
 * @remarks
 * Used for embeddings: 768D → 4D (50% storage reduction!)
 * Format: a + bi + cj + dk
 */
interface Quaternion {
  a: number;  // Scalar component
  bi: number; // i component (imaginary)
  cj: number; // j component (imaginary)
  dk: number; // k component (imaginary)
}
```

---

### **Confidence Score**

```typescript
/**
 * Confidence scoring result
 *
 * @remarks
 * Uses harmonic mean for 33.5% better outlier detection.
 */
interface ConfidenceScore {
  value: number;                        // Confidence (0-1)
  regime: Regime;                       // Classified regime
  outliers: number[];                   // Detected outliers (if any)
}
```

---

### **Pagination Metadata**

```typescript
interface PaginationMeta {
  page: number;                         // Current page (1-indexed)
  limit: number;                        // Items per page
  total: number;                        // Total items
  total_pages: number;                  // Total pages
}
```

---

### **Error Response (Standardized)**

```typescript
/**
 * Standardized error response (RFC 7807 inspired)
 */
interface ErrorResponse {
  error: string;                        // Error type (e.g., "Bad Request")
  message: string;                      // Human-readable message
  details?: Record<string, unknown>;    // Additional context
  timestamp: string;                    // ISO 8601 timestamp
  trace_id?: string;                    // Request trace ID (for debugging)
}
```

---

## 🎨 Frontend Component Props

### **Upload Component**

```typescript
interface UploadProps {
  onUpload: (file: File) => Promise<void>;    // Upload handler
  maxSizeMB?: number;                         // Max file size (default: 10)
  acceptedTypes?: string[];                   // MIME types (default: ['*/*'])
  multiple?: boolean;                         // Allow multiple files (default: false)
  disabled?: boolean;                         // Disable upload (default: false)
}
```

---

### **DataCards Component**

```typescript
interface DataCardsProps {
  document: DocumentResponse;                 // Document data
  onEntityClick?: (entity: Entity) => void;   // Entity click handler
  showConfidence?: boolean;                   // Show confidence scores (default: true)
  variant?: 'compact' | 'detailed';           // Display variant (default: 'detailed')
}
```

---

### **SystemHealthGauge Component**

```typescript
interface SystemHealthGaugeProps {
  confidence: number;                         // Overall confidence (0-1)
  regime: Regime;                             // Current regime
  size?: 'sm' | 'md' | 'lg';                  // Gauge size (default: 'md')
  showLabel?: boolean;                        // Show text label (default: true)
  animated?: boolean;                         // Animate transitions (default: true)
}
```

---

### **InsightLens Page**

```typescript
interface InsightLensProps {
  documentId?: string;                        // Optional initial document ID
  onDocumentChange?: (doc: DocumentResponse) => void; // Document change callback
}
```

---

### **Landing Page**

```typescript
interface LandingProps {
  onGetStarted?: () => void;                  // CTA button callback
  showPricing?: boolean;                      // Show pricing section (default: true)
}
```

---

## 🔧 Service Layer Types

### **Protective Guardian**

```typescript
/**
 * Protective Guardian service interface
 */
interface IProtectiveGuardian {
  /**
   * Calculate confidence score using harmonic mean
   */
  calculateConfidence(values: number[]): ConfidenceScore;

  /**
   * Retry operation with Tesla harmonic backoff
   */
  retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxAttempts?: number
  ): Promise<T>;

  /**
   * Nikhilam correction for edge cases
   */
  nikhilamCorrection(value: number): number;
}
```

---

### **Williams Optimizer**

```typescript
/**
 * Williams Space Optimizer service interface
 */
interface IWilliamsOptimizer {
  /**
   * Calculate Williams space bound
   *
   * @param t - Time complexity (number of operations)
   * @returns Space bound
   */
  calculateSpaceBound(t: number): number;

  /**
   * Optimize batch size for processing
   *
   * @param totalItems - Total items to process
   * @param availableMemoryMB - Available memory in MB
   * @param memoryPerItemMB - Memory per item in MB
   * @returns Optimal batch size
   */
  optimizeBatchSize(
    totalItems: number,
    availableMemoryMB: number,
    memoryPerItemMB: number
  ): number;

  /**
   * Calculate confidence multiplier
   *
   * @param baseConfidence - Base confidence score
   * @param itemCount - Number of items
   * @returns Enhanced confidence
   */
  calculateConfidenceMultiplier(
    baseConfidence: number,
    itemCount: number
  ): number;
}
```

---

### **Quaternion Encoder**

```typescript
/**
 * Quaternion encoder service interface
 */
interface IQuaternionEncoder {
  /**
   * Encode 768D embedding to 4D quaternion
   *
   * @param embedding - 768D vector
   * @returns 4D quaternion
   */
  encode768DTo4D(embedding: number[]): Quaternion;

  /**
   * Calculate similarity between quaternions
   *
   * @param q1 - First quaternion
   * @param q2 - Second quaternion
   * @returns Similarity score (0-1)
   */
  calculateSimilarity(q1: Quaternion, q2: Quaternion): number;

  /**
   * Batch encode embeddings
   *
   * @param embeddings - Array of 768D vectors
   * @returns Array of quaternions
   */
  batchEncode(embeddings: number[][]): Quaternion[];
}
```

---

## 🧪 Test Types

### **Contract Test Context**

```typescript
/**
 * Test context for contract tests
 */
interface ContractTestContext {
  fastify: FastifyInstance;               // Fastify instance
  prisma: PrismaClient;                   // Prisma client
  redis: Redis;                           // Redis client
  testDocuments: Document[];              // Seed documents
}
```

---

### **UX-Sonar Test Result**

```typescript
/**
 * UX-Sonar test result
 */
interface UXSonarResult {
  wcag: {
    passed: number;
    failed: number;
    compliance: number;                   // Percentage (0-100)
  };
  lighthouse: {
    performance: number;                  // Score (0-100)
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  visualRegression: {
    changed: number;                      // Number of changed snapshots
    added: number;                        // Number of new snapshots
    removed: number;                      // Number of removed snapshots
  };
}
```

---

## 📝 Validation Schemas (Zod)

### **Document Upload Schema**

```typescript
import { z } from 'zod';

const DocumentUploadSchema = z.object({
  content: z.string().min(1).max(1000000),  // 1 char to 1MB
  filename: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

type DocumentUploadRequest = z.infer<typeof DocumentUploadSchema>;
```

---

### **Document List Query Schema**

```typescript
const DocumentListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  regime: z.enum(['Support', 'Exploration', 'Balance']).optional(),
  sortBy: z.enum(['created_at', 'confidence']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

type DocumentListQuery = z.infer<typeof DocumentListQuerySchema>;
```

---

## 🚀 Usage Examples

### **Backend API Route (JULES-01)**

```typescript
import { FastifyPluginAsync } from 'fastify';
import { DocumentUploadSchema } from '@asymmetrica/shared';

const documentRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/upload', async (request, reply) => {
    // Validate request
    const body = DocumentUploadSchema.parse(request.body);

    // Process document
    const result = await processDocument(body);

    // Return response
    return reply.status(200).send(result);
  });
};
```

---

### **Frontend Component (JULES-02)**

```typescript
import type { DocumentResponse } from '@asymmetrica/shared';

interface DataCardsProps {
  document: DocumentResponse;
}

function DataCards({ document }: DataCardsProps) {
  return (
    <div>
      <h2>{document.id}</h2>
      <p>Confidence: {(document.confidence * 100).toFixed(1)}%</p>
      <p>Regime: {document.regime}</p>
    </div>
  );
}
```

---

## 📚 Reference

**Shared Types Location:**
- `shared/types/api.ts` - API request/response types
- `shared/types/models.ts` - Database models
- `shared/types/index.ts` - Re-exports all types

**Usage:**
```typescript
// Backend
import type { DocumentUploadRequest, DocumentResponse } from '@asymmetrica/shared';

// Frontend
import type { DocumentResponse, Regime, Quaternion } from '@asymmetrica/shared';
```

---

**Status:** READY FOR IMPLEMENTATION
**Prepared by:** Agent ALPHA (Claude Sonnet 4.5)
**For:** Jules Swarm (JULES-01, JULES-02, JULES-03, etc.)
**Last Updated:** October 10, 2025

**Let's build with complete type safety! 🚀**

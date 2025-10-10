/**
 * Asymmetrica Deep-Sensing Studio - API Type Definitions
 *
 * Shared types for frontend-backend communication.
 * Ensures type safety across the entire application.
 *
 * @module shared/types/api
 */

import { Regime } from './regime';
import { Quaternion } from './vedic';
import { Entity, Sentiment } from './document';

// ============================================================================
// Request Types
// ============================================================================

/**
 * Document upload request
 */
export interface DocumentUploadRequest {
  /** Raw text content to process */
  content: string;
  /** Optional filename for tracking */
  filename?: string;
  /** Optional metadata (user-defined) */
  metadata?: Record<string, unknown>;
}

/**
 * Entity recognition request
 */
export interface EntityRecognitionRequest {
  /** Document ID to analyze */
  document_id: string;
  /** Force re-analysis even if entities exist */
  force_reanalysis?: boolean;
}

/**
 * Sentiment analysis request
 */
export interface SentimentAnalysisRequest {
  /** Document ID to analyze */
  document_id: string;
  /** Force re-analysis even if sentiment exists */
  force_reanalysis?: boolean;
}

/**
 * Batch processing request
 */
export interface BatchProcessingRequest {
  /** Array of document IDs to process */
  document_ids: string[];
  /** Operations to perform */
  operations: ('entity_recognition' | 'sentiment_analysis' | 'embedding')[];
  /** Optional callback URL for completion notification */
  callback_url?: string;
}

/**
 * Quaternion similarity search request
 */
export interface QuaternionSimilarityRequest {
  /** Source document ID or quaternion */
  source: string | Quaternion;
  /** Maximum number of results to return */
  limit?: number;
  /** Minimum similarity threshold (0-1) */
  threshold?: number;
  /** Similarity metric to use */
  metric?: 'euclidean' | 'cosine' | 'quaternion_product';
}

/**
 * Document query request (with filters)
 */
export interface DocumentQueryRequest {
  /** Filter by regime */
  regime?: Regime;
  /** Minimum confidence threshold */
  min_confidence?: number;
  /** Maximum confidence threshold */
  max_confidence?: number;
  /** Date range filter */
  created_after?: string; // ISO 8601 date string
  created_before?: string;
  /** Pagination */
  page?: number;
  limit?: number;
  /** Sorting */
  sort_by?: 'created_at' | 'updated_at' | 'confidence';
  sort_order?: 'asc' | 'desc';
}

// ============================================================================
// Response Types
// ============================================================================

/**
 * Document response (for API responses)
 */
export interface DocumentResponse {
  /** Unique identifier */
  id: string;
  /** Raw text content */
  content: string;
  /** Structured data (NER results) */
  structured_data: Record<string, unknown>;
  /** 4D quaternion embedding */
  embedding?: Quaternion;
  /** Harmonic mean confidence score */
  confidence: number;
  /** Three-Regime classification */
  regime: Regime;
  /** ISO 8601 timestamp */
  created_at: string;
  /** ISO 8601 timestamp */
  updated_at: string;
}

/**
 * Document response with relations
 */
export interface DocumentWithRelationsResponse extends DocumentResponse {
  /** Associated entities (NER results) */
  entities?: Entity[];
  /** Associated sentiment analyses */
  sentiments?: Sentiment[];
  /** Associated embeddings */
  embeddings?: Array<{
    id: string;
    quaternion: Quaternion;
    created_at: string;
  }>;
}

/**
 * Entity recognition response
 */
export interface EntityRecognitionResponse {
  /** Document ID */
  document_id: string;
  /** Extracted entities */
  entities: Entity[];
  /** Processing time in milliseconds */
  processing_time_ms: number;
  /** Average confidence across all entities */
  avg_confidence: number;
}

/**
 * Sentiment analysis response
 */
export interface SentimentAnalysisResponse {
  /** Document ID */
  document_id: string;
  /** Sentiment analysis result */
  sentiment: Sentiment;
  /** Processing time in milliseconds */
  processing_time_ms: number;
}

/**
 * Batch processing response
 */
export interface BatchProcessingResponse {
  /** Batch job ID */
  job_id: string;
  /** Number of documents in batch */
  total_documents: number;
  /** Current status */
  status: 'queued' | 'processing' | 'completed' | 'failed';
  /** Number of completed documents */
  completed_count: number;
  /** Number of failed documents */
  failed_count: number;
  /** Estimated completion time (ISO 8601) */
  estimated_completion?: string;
}

/**
 * Quaternion similarity search response
 */
export interface QuaternionSimilarityResponse {
  /** Source document ID (if applicable) */
  source_document_id?: string;
  /** Source quaternion used for search */
  source_quaternion: Quaternion;
  /** Array of similar documents */
  results: Array<{
    document_id: string;
    similarity: number;
    regime: Regime;
    confidence: number;
  }>;
  /** Search processing time in milliseconds */
  processing_time_ms: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  /** Array of results */
  data: T[];
  /** Pagination metadata */
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

/**
 * Error response (RFC 7807 Problem Details)
 */
export interface ErrorResponse {
  /** Error type/code */
  error: string;
  /** Human-readable error message */
  message: string;
  /** Additional error details */
  details?: Record<string, unknown>;
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Request ID for tracing */
  request_id?: string;
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  /** Service status */
  status: 'healthy' | 'degraded' | 'unhealthy';
  /** Service version */
  version: string;
  /** Timestamp of health check */
  timestamp: string;
  /** Component statuses */
  components: {
    database: 'up' | 'down';
    redis?: 'up' | 'down';
    storage?: 'up' | 'down';
  };
  /** Uptime in seconds */
  uptime_seconds: number;
}

/**
 * Statistics response
 */
export interface StatisticsResponse {
  /** Total document count */
  total_documents: number;
  /** Documents by regime */
  regime_distribution: {
    support: number;
    exploration: number;
    balance: number;
  };
  /** Average confidence by regime */
  avg_confidence_by_regime: {
    support: number;
    exploration: number;
    balance: number;
  };
  /** Recent activity */
  recent_activity: {
    last_24h: number;
    last_7d: number;
    last_30d: number;
  };
}

// ============================================================================
// WebSocket Types (for real-time updates)
// ============================================================================

/**
 * WebSocket message base type
 */
export interface WebSocketMessage {
  /** Message type */
  type: string;
  /** Message payload */
  payload: unknown;
  /** Timestamp */
  timestamp: string;
}

/**
 * Document processing event
 */
export interface DocumentProcessingEvent extends WebSocketMessage {
  type: 'document:processing' | 'document:completed' | 'document:failed';
  payload: {
    document_id: string;
    stage: 'upload' | 'entity_recognition' | 'sentiment_analysis' | 'embedding';
    progress?: number; // 0-100
    error?: string;
  };
}

/**
 * Batch job event
 */
export interface BatchJobEvent extends WebSocketMessage {
  type: 'batch:started' | 'batch:progress' | 'batch:completed' | 'batch:failed';
  payload: {
    job_id: string;
    completed_count: number;
    failed_count: number;
    total_count: number;
    progress_percentage: number;
  };
}

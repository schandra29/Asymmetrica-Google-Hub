/**
 * Asymmetrica Deep-Sensing Studio - API Type Definitions
 *
 * Shared types for frontend-backend communication.
 * Ensures type safety across the entire application.
 *
 * @module shared/types/api
 */

/**
 * Three-Regime classification
 *
 * @remarks
 * Based on Asymmetrica Protocol ordinal hierarchy:
 * - Support (α₀): 32.1x leverage - Maximum efficiency
 * - Exploration (α₁): 26.8x leverage - High creativity
 * - Balance (α₂): 11.5x leverage - Integration
 */
export type Regime = 'Support' | 'Exploration' | 'Balance';

/**
 * Quaternion representation (4D vector)
 *
 * @remarks
 * Used for embeddings: 768D → 4D (50% storage reduction!)
 * Format: a + bi + cj + dk
 */
export interface Quaternion {
  a: number;  // Scalar component
  bi: number; // i component
  cj: number; // j component
  dk: number; // k component
}

/**
 * Document upload request
 */
export interface DocumentUploadRequest {
  content: string;
  filename?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Document response
 */
export interface DocumentResponse {
  id: string;
  content: string;
  structured_data: Record<string, unknown>;
  embedding?: Quaternion;
  confidence: number;
  regime: Regime;
  created_at: string;
  updated_at: string;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

/**
 * Error response
 */
export interface ErrorResponse {
  error: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// TODO (JULES-01 + JULES-02): Add more types as you develop:
// - EntityRecognitionRequest/Response
// - SentimentAnalysisRequest/Response
// - BatchProcessingRequest/Response
// - QuaternionSimilarityRequest/Response

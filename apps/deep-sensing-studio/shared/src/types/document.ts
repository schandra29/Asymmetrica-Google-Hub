/**
 * Asymmetrica Deep-Sensing Studio - Document Model Types
 *
 * Core data models extracted from Prisma schema.
 * These types represent the database entities used throughout the application.
 *
 * @module shared/types/document
 */

import { Regime } from './regime';
import { Quaternion } from './vedic';

/**
 * Document model - Core storage unit for processed content
 *
 * @remarks
 * Maps to Prisma schema Document model.
 * Stores raw content, structured data (NER results), embeddings, and confidence scores.
 */
export interface Document {
  /** Unique identifier (CUID) */
  id: string;
  /** Raw text content of the document */
  content: string;
  /** Structured data extracted via NER, stored as JSONB */
  structured_data: Record<string, any>;
  /** 4D quaternion embedding (optional) */
  embedding?: Quaternion;
  /** Harmonic mean confidence score (0-1) */
  confidence: number;
  /** Three-Regime classification for sharding and analysis */
  regime: Regime;
  /** Creation timestamp */
  created_at: Date;
  /** Last update timestamp */
  updated_at: Date;
}

/**
 * Entity model - Named Entity Recognition (NER) result
 *
 * @remarks
 * Maps to Prisma schema Entity model.
 * Stores extracted entities (PERSON, ORGANIZATION, LOCATION, etc.)
 */
export interface Entity {
  /** Unique identifier (CUID) */
  id: string;
  /** Parent document ID (foreign key) */
  document_id: string;
  /** Entity type (e.g., "PERSON", "ORGANIZATION", "LOCATION") */
  entity_type: string;
  /** The actual text of the entity */
  entity_value: string;
  /** Confidence score for this entity extraction (0-1) */
  confidence: number;
  /** Start position in the original text */
  position_start: number;
  /** End position in the original text */
  position_end: number;
}

/**
 * Sentiment label enum - Matches Prisma SentimentLabel
 */
export type SentimentLabel = 'positive' | 'negative' | 'neutral';

/**
 * Sentiment model - Sentiment analysis result
 *
 * @remarks
 * Maps to Prisma schema Sentiment model.
 * Stores sentiment analysis results for documents.
 */
export interface Sentiment {
  /** Unique identifier (CUID) */
  id: string;
  /** Parent document ID (foreign key) */
  document_id: string;
  /** Sentiment score from -1.0 (negative) to 1.0 (positive) */
  sentiment_score: number;
  /** Classified sentiment label */
  sentiment_label: SentimentLabel;
  /** Confidence score for sentiment analysis (0-1) */
  confidence: number;
}

/**
 * Embedding model - Quaternion embedding storage
 *
 * @remarks
 * Maps to Prisma schema Embedding model.
 * Links quaternion embeddings to documents for similarity search.
 */
export interface Embedding {
  /** Unique identifier (CUID) */
  id: string;
  /** Parent document ID (foreign key) */
  document_id: string;
  /** The 4D quaternion vector: {a, bi, cj, dk} */
  quaternion: Quaternion;
  /** Creation timestamp */
  created_at: Date;
}

/**
 * User model - Authentication and authorization
 *
 * @remarks
 * Maps to Prisma schema User model.
 * For Phase 2 authentication implementation.
 */
export interface User {
  /** Unique identifier (CUID) */
  id: string;
  /** User email (unique) */
  email: string;
  /** User display name (optional) */
  name?: string;
  /** Hashed API key for authentication (optional) */
  api_key_hash?: string;
  /** Creation timestamp */
  created_at: Date;
  /** Last update timestamp */
  updated_at: Date;
}

/**
 * Document with relations - Full document with all associated data
 *
 * @remarks
 * Useful for API responses that include related entities, sentiments, and embeddings.
 */
export interface DocumentWithRelations extends Document {
  entities?: Entity[];
  sentiments?: Sentiment[];
  embeddings?: Embedding[];
}

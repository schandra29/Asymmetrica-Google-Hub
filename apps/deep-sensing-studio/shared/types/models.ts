/**
 * Asymmetrica Deep-Sensing Studio - Data Models
 *
 * Domain models used throughout the application.
 *
 * @module shared/types/models
 */

import type { Regime, Quaternion } from './api.js';

/**
 * Document model
 */
export interface Document {
  id: string;
  content: string;
  structured_data: Record<string, unknown>;
  embedding?: Quaternion;
  confidence: number;
  regime: Regime;
  created_at: Date;
  updated_at: Date;
}

/**
 * Entity model (NER result)
 */
export interface Entity {
  id: string;
  document_id: string;
  entity_type: string;
  entity_value: string;
  confidence: number;
  position_start: number;
  position_end: number;
}

/**
 * Sentiment model
 */
export interface Sentiment {
  id: string;
  document_id: string;
  sentiment_score: number;  // -1.0 to 1.0
  sentiment_label: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

// TODO (JULES-03): Add more models as database schema evolves

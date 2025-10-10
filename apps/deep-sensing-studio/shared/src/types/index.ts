/**
 * Asymmetrica Deep-Sensing Studio - Shared Types Entry Point
 *
 * Central export point for all shared types.
 * Import from '@deep-sensing/shared' in your application.
 *
 * @module shared/types
 *
 * @example
 * ```typescript
 * // In backend or frontend:
 * import { Document, Regime, Quaternion } from '@deep-sensing/shared';
 * ```
 */

// Core data models (from Prisma schema)
export * from './document';

// Three-Regime classification system
export * from './regime';

// Vedic mathematics and quaternion types
export * from './vedic';

// API request/response types
export * from './api';

/**
 * Asymmetrica Deep-Sensing Studio - Shared Package Entry Point
 *
 * @packageDocumentation
 *
 * @remarks
 * This package provides shared TypeScript types for the Deep-Sensing Studio,
 * ensuring type safety across backend and frontend.
 *
 * @example
 * ```typescript
 * import { Document, Regime, Quaternion, DocumentUploadRequest } from '@deep-sensing/shared';
 *
 * const doc: Document = {
 *   id: 'abc123',
 *   content: 'Sample text',
 *   structured_data: {},
 *   confidence: 0.95,
 *   regime: Regime.Support,
 *   created_at: new Date(),
 *   updated_at: new Date(),
 * };
 * ```
 */

export * from './types';

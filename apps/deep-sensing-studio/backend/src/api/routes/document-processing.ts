/**
 * DOCUMENT PROCESSING ROUTES
 *
 * This module contains the primary API routes for ingesting and analyzing
 * documents. It includes the main processing pipeline endpoint as well as
 * specific analysis endpoints for sentiment and entities.
 *
 * @file This file contains the document processing route plugin.
 * @author Jules AI (JULES-01)
 * @date 2025-10-10
 */

import { FastifyPluginAsync } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';
import { LayoutProcessor } from '../../services/layout-processor';
import { DocumentUploadRequest } from '@deep-sensing/shared';

const processor = new LayoutProcessor();

// Schema for the POST /process request body
const processBodySchema = {
  type: 'object',
  properties: {
    content: { type: 'string', minLength: 1, description: 'The text content of the document to process.' },
    filename: { type: 'string', description: 'An optional filename for the document.' },
    metadata: { type: 'object', additionalProperties: true, description: 'Optional key-value metadata.' },
  },
  required: ['content'],
} as const;

// Schemas for stubbed analysis endpoints
const analysisBodySchema = {
  type: 'object',
  properties: {
    document_id: { type: 'string', description: 'The ID of the document to analyze.' },
  },
  required: ['document_id'],
} as const;


/**
 * An asynchronous Fastify plugin that registers document processing routes.
 *
 * @param fastify The Fastify instance.
 */
const documentProcessingRoutes: FastifyPluginAsync = async (fastify): Promise<void> => {
  /**
   * @route POST /process
   * @description Submits a document for ingestion, analysis, and persistence.
   * @returns {DocumentResponse} 200 - The processed document record.
   */
  fastify.post<{ Body: DocumentUploadRequest }>(
    '/process',
    {
      schema: {
        description: 'Uploads a document for full processing, including confidence scoring, regime classification, and database storage.',
        tags: ['documents'],
        body: processBodySchema,
        // TODO: Add response schema for full OpenAPI spec compliance
      },
    },
    async (request, reply) => {
      const document = await processor.processDocument(request.body);
      return reply.status(200).send(document);
    }
  );

  /**
   * @route POST /analyze-sentiment
   * @description (STUB) Analyzes the sentiment of a given document.
   * @returns {object} 200 - A stubbed sentiment analysis response.
   */
  fastify.post<{ Body: FromSchema<typeof analysisBodySchema> }>(
    '/analyze-sentiment',
    {
      schema: {
        description: '(STUB) Performs sentiment analysis on a specified document.',
        tags: ['documents'],
        body: analysisBodySchema,
      },
    },
    async (request, reply) => {
      // Full implementation is outside JULES-01 scope.
      return reply.status(200).send({
        document_id: request.body.document_id,
        sentiment_score: 0.75,
        sentiment_label: 'positive',
        confidence: 0.9,
        message: 'This is a stubbed response.',
      });
    }
  );

  /**
   * @route POST /extract-entities
   * @description (STUB) Extracts named entities from a given document.
   * @returns {object} 200 - A stubbed entity extraction response.
   */
  fastify.post<{ Body: FromSchema<typeof analysisBodySchema> }>(
    '/extract-entities',
    {
      schema: {
        description: '(STUB) Extracts named entities (e.g., people, organizations) from a specified document.',
        tags: ['documents'],
        body: analysisBodySchema,
      },
    },
    async (request, reply) => {
      // Full implementation is outside JULES-01 scope.
      return reply.status(200).send({
        document_id: request.body.document_id,
        entities: [
          { type: 'PERSON', value: 'Jules', confidence: 0.99 },
          { type: 'ORGANIZATION', value: 'Asymmetrica', confidence: 0.98 },
        ],
        message: 'This is a stubbed response.',
      });
    }
  );
};

export default documentProcessingRoutes;
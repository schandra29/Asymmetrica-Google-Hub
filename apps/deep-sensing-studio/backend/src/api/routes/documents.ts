/**
 * DOCUMENT RETRIEVAL ROUTES
 *
 * This module contains the API routes for querying and retrieving documents
 * that have been processed by the system. It provides endpoints for fetching
 * a list of documents with filtering and pagination, as well as retrieving a
 * single document by its ID.
 *
 * @file This file contains the document retrieval route plugin.
 * @author Jules AI (JULES-01)
 * @date 2025-10-10
 */

import { FastifyPluginAsync } from 'fastify';
import { Regime } from '@prisma/client';
import { prisma } from '../../utils/prisma';
import { FromSchema } from 'json-schema-to-ts';
import { DocumentResponse, PaginatedDocumentResponse } from '@deep-sensing/shared';

// Schema for the GET /documents list query parameters
const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    regime: { type: 'string', enum: Object.values(Regime) },
    sortBy: { type: 'string', enum: ['created_at', 'confidence'], default: 'created_at' },
    sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
  },
} as const;

// Schema for the GET /documents/:id path parameter
const byIdParamsSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', description: 'The CUID of the document.' },
  },
  required: ['id'],
} as const;

/**
 * An asynchronous Fastify plugin that registers document retrieval routes.
 *
 * @param fastify The Fastify instance.
 */
const documentRoutes: FastifyPluginAsync = async (fastify): Promise<void> => {
  /**
   * @route GET /documents
   * @description Retrieves a paginated list of documents with filtering options.
   * @returns {PaginatedDocumentResponse} 200 - A paginated list of documents.
   */
  fastify.get<{ Querystring: FromSchema<typeof listQuerySchema> }>(
    '/',
    {
      schema: {
        description: 'Retrieves a paginated list of all processed documents.',
        tags: ['documents'],
        querystring: listQuerySchema,
        // TODO: Add response schema for full OpenAPI spec compliance
      },
    },
    async (request, reply) => {
      const { page, limit, regime, sortBy, sortOrder } = request.query;

      const where = regime ? { regime } : {};
      const skip = (page - 1) * limit;

      const [documents, total] = await prisma.$transaction([
        prisma.document.findMany({
          where,
          orderBy: { [sortBy]: sortOrder },
          take: limit,
          skip,
        }),
        prisma.document.count({ where }),
      ]);

      const response: PaginatedDocumentResponse = {
        data: documents.map(d => ({
          ...d,
          created_at: d.created_at.toISOString(),
          updated_at: d.updated_at.toISOString(),
        })),
        pagination: {
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit),
        },
      };

      return reply.status(200).send(response);
    }
  );

  /**
   * @route GET /documents/:id
   * @description Retrieves a single document by its unique ID.
   * @returns {DocumentResponse} 200 - The requested document.
   * @returns {ErrorResponse} 404 - If the document is not found.
   */
  fastify.get<{ Params: FromSchema<typeof byIdParamsSchema> }>(
    '/:id',
    {
      schema: {
        description: 'Retrieves a single document by its unique CUID.',
        tags: ['documents'],
        params: byIdParamsSchema,
        // TODO: Add response schema for full OpenAPI spec compliance
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const document = await prisma.document.findUnique({ where: { id } });

      if (!document) {
        return reply.status(404).send({
          error: 'Not Found',
          message: `Document with ID '${id}' not found.`,
          timestamp: new Date().toISOString(),
        });
      }

      const response: DocumentResponse = {
        ...document,
        created_at: document.created_at.toISOString(),
        updated_at: document.updated_at.toISOString(),
      };

      return reply.status(200).send(response);
    }
  );
};

export default documentRoutes;
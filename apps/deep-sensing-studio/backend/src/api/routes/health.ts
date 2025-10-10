/**
 * HEALTH CHECK ROUTE
 *
 * This module provides a simple health check endpoint for the API. It is used
 * by monitoring services and deployment platforms (like Render.com) to verify
 * that the application is running and responsive.
 *
 * @file This file contains the health check route plugin.
 * @author Jules AI (JULES-01)
 * @date 2025-10-10
 */

import { FastifyPluginAsync } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';

// Define the response schema for OpenAPI documentation
const healthResponseSchema = {
  type: 'object',
  properties: {
    status: { type: 'string', example: 'ok' },
    timestamp: { type: 'string', format: 'date-time' },
    system: { type: 'string', example: 'Asymmetrica Deep-Sensing API' }
  },
  required: ['status', 'timestamp', 'system'],
} as const;


/**
 * An asynchronous Fastify plugin that registers the /health route.
 *
 * @param fastify The Fastify instance.
 * @param _opts Plugin options (unused).
 */
const healthRoutes: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  /**
   * @route GET /health
   * @description Provides a simple health check for the service.
   * @returns {object} 200 - An object indicating the service is healthy.
   */
  fastify.get<{ Reply: FromSchema<typeof healthResponseSchema> }>(
    '/health',
    {
      schema: {
        description: 'Performs a health check on the API, returning the current status.',
        tags: ['utility'],
        response: {
          200: healthResponseSchema,
        },
      },
    },
    async (request, reply) => {
      return reply.status(200).send({
        status: 'ok',
        timestamp: new Date().toISOString(),
        system: 'Asymmetrica Deep-Sensing API'
      });
    }
  );
};

export default healthRoutes;
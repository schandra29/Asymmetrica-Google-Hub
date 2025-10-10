/**
 * CENTRALIZED ERROR HANDLING MIDDLEWARE
 *
 * This module provides a global error handler for the Fastify server. It ensures
 * that all errors, regardless of their source, are caught and transformed into a
 * standardized, client-friendly JSON response, conforming to the API contracts.
 *
 * @file This file contains the global error handler function.
 * @author Jules AI (JULES-01)
 * @date 2025-10-10
 */

import { FastifyInstance, FastifyRequest, FastifyReply, FastifyError } from 'fastify';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

/**
 * Maps an HTTP status code to its standard name.
 * @param statusCode The HTTP status code.
 * @returns The corresponding error name.
 */
function getErrorName(statusCode: number): string {
  switch (statusCode) {
    case 400: return 'Bad Request';
    case 401: return 'Unauthorized';
    case 403: return 'Forbidden';
    case 404: return 'Not Found';
    case 409: return 'Conflict';
    case 429: return 'Too Many Requests';
    case 500: return 'Internal Server Error';
    default: return 'Error';
  }
}

/**
 * Registers a global error handler for the Fastify instance.
 *
 * This function attaches a hook that catches all errors and formats them
 * into a standardized `ErrorResponse` object. It handles specific error types
 * like Zod validation errors and Prisma database errors, providing detailed
 * and helpful messages.
 *
 * @param fastify The Fastify instance to attach the error handler to.
 * @returns {void}
 */
export function registerErrorHandler(fastify: FastifyInstance): void {
  fastify.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    fastify.log.error(error, `An error occurred for request: ${request.id}`);

    // Handle Zod validation errors, which are always a 400 Bad Request
    if (error instanceof ZodError) {
      reply.status(400).send({
        error: 'Bad Request',
        message: 'Request validation failed.',
        details: error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Handle Prisma database errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') { // Unique constraint violation
        reply.status(409).send({
          error: 'Conflict',
          message: 'A record with the same unique value already exists.',
          details: { target: error.meta?.target },
          timestamp: new Date().toISOString(),
        });
        return;
      }
      if (error.code === 'P2025') { // Record to update or delete not found
        reply.status(404).send({
            error: 'Not Found',
            message: 'The requested resource to be updated or deleted was not found.',
            details: error.meta,
            timestamp: new Date().toISOString(),
        });
        return;
      }
    }

    const statusCode = error.statusCode || 500;
    const errorName = getErrorName(statusCode);

    // Default to 500 Internal Server Error for all other errors
    reply.status(statusCode).send({
      error: errorName,
      message: error.message || 'An unexpected error occurred.',
      timestamp: new Date().toISOString(),
    });
  });
}
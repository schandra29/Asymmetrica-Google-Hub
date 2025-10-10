/**
 * Asymmetrica Deep-Sensing Studio - Backend Server
 *
 * Main entry point for the Fastify server.
 * Implements Three-Regime architecture with Tesla 4.909 Hz rate limiting.
 *
 * @module server
 * @author JULES-01
 */

import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';

// Import route handlers
import healthRoutes from './api/routes/health.js';
import documentRoutes from './api/routes/documents.js';
import documentProcessingRoutes from './api/routes/document-processing.js';

// Import middleware
import { registerErrorHandler } from './middleware/error-handler.js';

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

/**
 * Initialize Fastify server with plugins and routes.
 *
 * @returns {Promise<FastifyInstance>} Configured Fastify instance.
 */
async function buildServer(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
  });

  // Register centralized error handler
  registerErrorHandler(fastify);

  // Security plugins
  await fastify.register(helmet);
  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Tesla 4.909 Hz Rate Limiting
  // The frequency is approximately 5 Hz, so we allow 5 requests per second.
  await fastify.register(rateLimit, {
    max: 5,
    timeWindow: '1 second',
  });

  // Swagger/OpenAPI documentation
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Asymmetrica Deep-Sensing Studio API',
        description: 'AI-powered document processing with Vedic optimization and Three-Regime architecture.',
        version: '1.0.0',
        contact: { name: 'Jules AI Swarm', email: 'jules@asymmetrica.ai' }
      },
      servers: [{ url: `http://${HOST}:${PORT}`, description: 'Development Server' }],
      tags: [
        { name: 'utility', description: 'Health and utility endpoints' },
        { name: 'documents', description: 'Document processing and retrieval endpoints' },
      ],
    },
  });

  await fastify.register(swaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });

  // Register all API routes under the /api/v1 prefix
  await fastify.register(healthRoutes, { prefix: '/api/v1' });
  await fastify.register(documentRoutes, { prefix: '/api/v1/documents' });
  await fastify.register(documentProcessingRoutes, { prefix: '/api/v1/documents' });

  fastify.log.info('All routes and plugins registered successfully.');

  return fastify;
}

/**
 * Start the server.
 */
async function start(): Promise<void> {
  try {
    const fastify = await buildServer();
    await fastify.listen({ port: PORT, host: HOST });
    fastify.log.info(`🚀 Deep-Sensing Studio API running at http://${HOST}:${PORT}`);
    fastify.log.info(`📚 Swagger docs available at http://${HOST}:${PORT}/docs`);
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

// Start server if this file is executed directly
if (import.meta.url.startsWith('file://') && process.argv[1] === new URL(import.meta.url).pathname) {
    void start();
}


export { buildServer };
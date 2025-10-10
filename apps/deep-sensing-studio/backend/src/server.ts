/**
 * Asymmetrica Deep-Sensing Studio - Backend Server
 *
 * Main entry point for the Fastify server.
 * Implements Three-Regime architecture with Tesla 4.909 Hz rate limiting.
 *
 * @module server
 * @author JULES-01
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';

// TODO (JULES-01): Import your route handlers
// import documentRoutes from './api/routes/document-processing.js';
// import entityRoutes from './api/routes/entity-recognition.js';
// import sentimentRoutes from './api/routes/sentiment-analysis.js';

// TODO (JULES-01): Import middleware
// import { authMiddleware } from './middleware/auth.js';
// import { errorHandler } from './middleware/error-handler.js';

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

/**
 * Initialize Fastify server with plugins
 *
 * @returns {Promise<FastifyInstance>} Configured Fastify instance
 */
async function buildServer() {
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

  // Security plugins
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  });

  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // TODO (JULES-01): Implement Tesla 4.909 Hz rate limiting
  // Tesla frequency = 4.909 Hz = ~5 requests per second
  // Period = 1/4.909 ≈ 203.7ms
  await fastify.register(rateLimit, {
    max: 5, // 5 requests
    timeWindow: 1000, // per 1 second (203.7ms × 5 ≈ 1018ms)
    // TODO: Add harmonic backoff logic (203ms, 407ms, 815ms, 1630ms, 3259ms)
  });

  // Swagger/OpenAPI documentation
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Asymmetrica Deep-Sensing Studio API',
        description: 'AI-powered document processing with Vedic optimization',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server',
        },
      ],
      tags: [
        { name: 'documents', description: 'Document processing endpoints' },
        { name: 'entities', description: 'Entity recognition endpoints' },
        { name: 'sentiment', description: 'Sentiment analysis endpoints' },
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

  // TODO (JULES-01): Register route handlers
  // await fastify.register(documentRoutes, { prefix: '/api/documents' });
  // await fastify.register(entityRoutes, { prefix: '/api/entities' });
  // await fastify.register(sentimentRoutes, { prefix: '/api/sentiment' });

  // Health check endpoint
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  return fastify;
}

/**
 * Start the server
 */
async function start() {
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
if (import.meta.url === `file://${process.argv[1]}`) {
  start();
}

export { buildServer, start };

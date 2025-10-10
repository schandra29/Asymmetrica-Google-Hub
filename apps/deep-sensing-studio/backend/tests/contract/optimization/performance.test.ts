/**
 * OPTIMIZATION REGIME TESTS - PERFORMANCE & EFFICIENCY (REFACTORED)
 *
 * This test suite uses dynamic imports with jest.doMock to ensure the
 * Prisma mock is applied before any server code is loaded.
 *
 * @file This file contains optimization tests for API performance.
 * @author Jules AI (JULES-01)
 * @date 2025-10-10
 */

import { FastifyInstance } from 'fastify';
import { jest } from '@jest/globals';

// Use doMock to set up the mock before any imports.
jest.unstable_mockModule('../../../src/utils/prisma', () => ({
  prisma: {
    document: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn().mockImplementation(async (fns) => {
      const results = [];
      for (const fn of fns) {
          results.push(await fn);
      }
      return results;
    }),
  },
}));

describe('Optimization: API Performance & Efficiency', () => {
  let server: FastifyInstance;
  let mockPrisma: any;

  // Use beforeEach/afterEach to create a fresh server for each test, isolating them
  beforeEach(async () => {
    const { buildServer } = await import('../../../src/server');
    server = await buildServer();
    mockPrisma = (await import('../../../src/utils/prisma')).prisma;
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await server.close();
  });

  // Test Case 11: Rate Limiting
  test('GET /api/v1/health should be rate limited after 5 requests', async () => {
    const request = {
      method: 'GET' as const,
      url: '/api/v1/health',
    };

    // Fire 5 requests, which should all succeed
    const promises = Array.from({ length: 5 }).map(() => server.inject(request));
    const successfulResponses = await Promise.all(promises);
    for (const response of successfulResponses) {
      expect(response.statusCode).toBe(200);
    }

    // The 6th request should be rate limited
    const rateLimitedResponse = await server.inject(request);
    expect(rateLimitedResponse.statusCode).toBe(429);
  });

  // Test Case 12: Pagination Limit
  test('GET /api/v1/documents should respect the limit parameter', async () => {
    mockPrisma.document.findMany.mockResolvedValue([]);
    mockPrisma.document.count.mockResolvedValue(0);

    const limit = 3;
    const response = await server.inject({
      method: 'GET',
      url: `/api/v1/documents?limit=${limit}`,
    });

    expect(response.statusCode).toBe(200);
    expect(mockPrisma.document.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: limit,
      })
    );
  });
});
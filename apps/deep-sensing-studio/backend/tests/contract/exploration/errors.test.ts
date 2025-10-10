/**
 * EXPLORATION REGIME TESTS - ERROR HANDLING (REFACTORED)
 *
 * This test suite uses dynamic imports with jest.doMock to ensure the
 * Prisma mock is applied before any server code is loaded.
 *
 * @file This file contains exploration tests for API error handling.
 * @author Jules AI (JULES-01)
 * @date 2025-10-10
 */

import { FastifyInstance } from 'fastify';
import { jest } from '@jest/globals';

// Use doMock to set up the mock before any imports.
jest.unstable_mockModule('../../../src/utils/prisma', () => ({
  prisma: {
    document: {
      findUnique: jest.fn(),
    },
  },
}));

describe('Exploration: API Error Handling', () => {
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

  // Test Case 7: Get Document by ID (Not Found)
  test('GET /api/v1/documents/:id should return 404 for a non-existent ID', async () => {
    mockPrisma.document.findUnique.mockResolvedValue(null);
    const nonExistentId = 'clxm-i-do-not-exist';

    const response = await server.inject({
      method: 'GET',
      url: `/api/v1/documents/${nonExistentId}`,
    });

    expect(response.statusCode).toBe(404);
    const payload = JSON.parse(response.payload);
    expect(payload.error).toBe('Not Found');
  });

  // Test Case 8: Process Document with Invalid Body (Bad Request)
  test('POST /api/v1/documents/process should return 400 if content is missing', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/documents/process',
      payload: { filename: 'missing_content.txt' },
    });

    expect(response.statusCode).toBe(400);
    const payload = JSON.parse(response.payload);
    expect(payload.error).toBe('Bad Request');
  });

  // Test Case 9: List Documents with Invalid Page Number
  test('GET /api/v1/documents should return 400 for invalid page number', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/v1/documents?page=0',
    });

    expect(response.statusCode).toBe(400);
    const payload = JSON.parse(response.payload);
    expect(payload.error).toBe('Bad Request');
  });

  // Test Case 10: List Documents with Invalid Regime Filter
  test('GET /api/v1/documents should return 400 for invalid regime value', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/v1/documents?regime=invalid_regime',
    });

    expect(response.statusCode).toBe(400);
    const payload = JSON.parse(response.payload);
    expect(payload.error).toBe('Bad Request');
  });
});
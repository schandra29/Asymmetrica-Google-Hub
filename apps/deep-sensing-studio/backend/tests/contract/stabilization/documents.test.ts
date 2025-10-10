/**
 * STABILIZATION REGIME TESTS - DOCUMENT API (REFACTORED)
 *
 * This test suite uses dynamic imports with jest.doMock to ensure the
 * Prisma mock is applied before any server code is loaded.
 *
 * @file This file contains stabilization tests for the document API.
 * @author Jules AI (JULES-01)
 * @date 2025-10-10
 */

import { FastifyInstance } from 'fastify';
import { jest } from '@jest/globals';

// Use doMock to set up the mock before any imports.
jest.unstable_mockModule('../../../src/utils/prisma', () => ({
  prisma: {
    document: {
      create: jest.fn(),
      findUnique: jest.fn(),
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
  }
}));

describe('Stabilization: Document API Routes', () => {
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

  // Test Case 1: Health Check
  test('GET /api/v1/health should return 200 OK', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/v1/health',
    });
    expect(response.statusCode).toBe(200);
  });

  // Test Case 2: Process Document (Happy Path)
  test('POST /api/v1/documents/process should create and return a document', async () => {
    const mockDocument = { id: 'doc1', created_at: new Date(), updated_at: new Date() };
    mockPrisma.document.create.mockResolvedValue(mockDocument);

    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/documents/process',
      payload: { content: 'test' },
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload).id).toBe('doc1');
    expect(mockPrisma.document.create).toHaveBeenCalledTimes(1);
  });

  // Test Case 3: Get Document by ID (Happy Path)
  test('GET /api/v1/documents/:id should return a document', async () => {
    const mockDocument = { id: 'doc1', created_at: new Date(), updated_at: new Date() };
    mockPrisma.document.findUnique.mockResolvedValue(mockDocument);

    const response = await server.inject({
      method: 'GET',
      url: '/api/v1/documents/doc1',
    });

    expect(response.statusCode).toBe(200);
    expect(mockPrisma.document.findUnique).toHaveBeenCalledWith({ where: { id: 'doc1' } });
  });

  // Test Case 4: List Documents (Happy Path)
  test('GET /api/v1/documents should return a paginated list', async () => {
    mockPrisma.document.findMany.mockResolvedValue([]);
    mockPrisma.document.count.mockResolvedValue(0);

    const response = await server.inject({
      method: 'GET',
      url: '/api/v1/documents',
    });

    expect(response.statusCode).toBe(200);
    expect(mockPrisma.document.findMany).toHaveBeenCalledTimes(1);
  });

  // Test Case 5: Stubbed Sentiment Analysis
  test('POST /api/v1/documents/analyze-sentiment should return 200 OK', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/documents/analyze-sentiment',
      payload: { document_id: 'some-id' }
    });
    expect(response.statusCode).toBe(200);
  });

  // Test Case 6: Stubbed Entity Extraction
  test('POST /api/v1/documents/extract-entities should return 200 OK', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/documents/extract-entities',
      payload: { document_id: 'some-id' }
    });
    expect(response.statusCode).toBe(200);
  });
});
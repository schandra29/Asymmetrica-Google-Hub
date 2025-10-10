import { RAGPipelineService } from '../../src/services/rag-pipeline';
import { quaternionEncoder } from '../../src/services/quaternion-encoder';
import { retrievalCache } from '../../src/services/retrieval-cache';
import { PrismaClient } from '@prisma/client';
import { RAGQueryRequest, RAGQueryResponse, DocumentFragment, Quaternion } from '@deep-sensing/shared';

// Mock the dependencies
jest.mock('../../src/services/quaternion-encoder');
jest.mock('../../src/services/retrieval-cache');
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    $queryRaw: jest.fn(),
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});


describe('RAGPipelineService', () => {
  let ragService: RAGPipelineService;
  let mockPrisma: any;

  // Mocked instances
  const mockQuaternionEncoder = quaternionEncoder as jest.Mocked<typeof quaternionEncoder>;
  const mockRetrievalCache = retrievalCache as jest.Mocked<typeof retrievalCache>;

  beforeEach(() => {
    jest.clearAllMocks();
    ragService = new RAGPipelineService();
    // This is a bit of a trick to get the mocked instance of prisma client
    mockPrisma = new PrismaClient();
  });

  const sampleRequest: RAGQueryRequest = {
    query: 'What is Vedic mathematics?',
    top_k: 3,
  };

  const sampleQuaternion: Quaternion = { a: 0.1, bi: 0.2, cj: 0.3, dk: 0.4 };

  const sampleDbResults: DocumentFragment[] = [
    { document_id: 'doc1', content_fragment: 'Vedic math is ancient...', source_url: 'http://example.com/doc1', confidence_score: 0.95 },
  ];

  /**
   * @test {RAGPipelineService.query}
   * @description Integration Test (Cache Miss): Verifies the full pipeline flow when a query is not in the cache.
   */
  it('should execute the full pipeline on a cache miss', async () => {
    // Arrange (Cache Miss)
    mockRetrievalCache.get.mockResolvedValue(null);

    // Arrange (Encoder)
    mockQuaternionEncoder.encode.mockReturnValue(sampleQuaternion);

    // Arrange (Database)
    mockPrisma.$queryRaw.mockResolvedValue(sampleDbResults);

    // Act
    const response = await ragService.query(sampleRequest);

    // Assert
    // 1. Check cache was attempted
    expect(mockRetrievalCache.get).toHaveBeenCalledWith(sampleRequest);

    // 2. Check encoder was called (since it was a miss)
    expect(mockQuaternionEncoder.encode).toHaveBeenCalled();

    // 3. Check database was queried
    expect(mockPrisma.$queryRaw).toHaveBeenCalled();

    // 4. Check that the result was cached for next time
    expect(mockRetrievalCache.set).toHaveBeenCalled();

    // 5. Check the final response
    expect(response.source).toBe('database');
    expect(response.results).toEqual(sampleDbResults);
    expect(response.query).toBe(sampleRequest.query);
  });

  /**
   * @test {RAGPipelineService.query}
   * @description Integration Test (Cache Hit): Verifies the pipeline returns cached data without calling other services.
   */
  it('should return a cached response on a cache hit', async () => {
    // Arrange (Cache Hit)
    const cachedResponse: RAGQueryResponse = {
      query: sampleRequest.query,
      results: sampleDbResults,
      source: 'database', // The source when it was originally fetched
      performance: { latency_ms: 50, confidence_score: 0.95 },
    };
    mockRetrievalCache.get.mockResolvedValue(cachedResponse);

    // Act
    const response = await ragService.query(sampleRequest);

    // Assert
    // 1. Check cache was attempted
    expect(mockRetrievalCache.get).toHaveBeenCalledWith(sampleRequest);

    // 2. Check that other services were NOT called
    expect(mockQuaternionEncoder.encode).not.toHaveBeenCalled();
    expect(mockPrisma.$queryRaw).not.toHaveBeenCalled();
    expect(mockRetrievalCache.set).not.toHaveBeenCalled(); // Should not set again

    // 3. Check the final response
    expect(response.source).toBe('cache'); // Source should be updated to 'cache'
    expect(response.results).toEqual(sampleDbResults);
  });

  /**
   * @test {RAGPipelineService.query}
   * @description Exploration Test: Ensures the pipeline handles database errors gracefully.
   */
  it('should throw an error if the database query fails', async () => {
    // Arrange (Cache Miss and DB Error)
    mockRetrievalCache.get.mockResolvedValue(null);
    mockQuaternionEncoder.encode.mockReturnValue(sampleQuaternion);
    const dbError = new Error('Database connection failed');
    mockPrisma.$queryRaw.mockRejectedValue(dbError);

    // Act & Assert
    await expect(ragService.query(sampleRequest)).rejects.toThrow('Failed to execute RAG query.');

    // Ensure it doesn't try to cache a failed result
    expect(mockRetrievalCache.set).not.toHaveBeenCalled();
  });
});
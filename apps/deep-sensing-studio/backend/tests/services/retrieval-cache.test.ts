import { RetrievalCache } from '../../src/services/retrieval-cache';
import { RAGQueryRequest, RAGQueryResponse } from '@deep-sensing/shared';
import Redis from 'ioredis';

// Mock the ioredis library
jest.mock('ioredis');

const MockRedis = Redis as jest.MockedClass<typeof Redis>;

describe('RetrievalCache', () => {
  let cache: RetrievalCache;
  let mockRedisInstance: jest.Mocked<Redis>;

  const TESLA_PERIOD_MS = 203.7;

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    MockRedis.mockClear();

    // Instantiate RetrievalCache, which will use the mocked Redis
    cache = new RetrievalCache('redis://mock-url', 1);

    // Get the mock instance that was created
    mockRedisInstance = MockRedis.mock.instances[0] as jest.Mocked<Redis>;
  });

  const sampleRequest: RAGQueryRequest = {
    query: 'What is the Asymmetrica Protocol?',
    top_k: 5,
  };

  const sampleResponse: RAGQueryResponse = {
    query: 'What is the Asymmetrica Protocol?',
    results: [],
    source: 'database',
    performance: { latency_ms: 100, confidence_score: 0.9 },
  };

  const expectedCacheKey = 'rag_query:what is the asymmetrica protocol?:top_k=5';

  /**
   * @test {RetrievalCache.get}
   * @description Stabilization Test: Simulates a cache miss scenario.
   */
  it('should return null for a cache miss', async () => {
    // Arrange
    mockRedisInstance.get.mockResolvedValue(null);

    // Act
    const result = await cache.get(sampleRequest);

    // Assert
    expect(result).toBeNull();
    expect(mockRedisInstance.get).toHaveBeenCalledWith(expectedCacheKey);
  });

  /**
   * @test {RetrievalCache.get}
   * @description Stabilization Test: Simulates a cache hit scenario.
   */
  it('should return the parsed response for a cache hit', async () => {
    // Arrange
    const cachedValue = JSON.stringify(sampleResponse);
    mockRedisInstance.get.mockResolvedValue(cachedValue);

    // Act
    const result = await cache.get(sampleRequest);

    // Assert
    expect(result).toEqual(sampleResponse);
    expect(mockRedisInstance.get).toHaveBeenCalledWith(expectedCacheKey);
  });

  /**
   * @test {RetrievalCache.set}
   * @description Stabilization Test: Ensures data is correctly set in the cache with the proper TTL.
   */
  it('should set a value in the cache with the correct key and TTL', async () => {
    // Arrange
    const expectedValue = JSON.stringify(sampleResponse);
    const expectedTtl = Math.round(TESLA_PERIOD_MS);

    // Act
    await cache.set(sampleRequest, sampleResponse);

    // Assert
    expect(mockRedisInstance.set).toHaveBeenCalledWith(
      expectedCacheKey,
      expectedValue,
      'PX', // 'PX' for millisecond precision TTL
      expectedTtl
    );
  });

  /**
   * @test {RetrievalCache.constructor}
   * @description Optimization Test: Verifies that a custom harmonic multiplier correctly adjusts the TTL.
   */
  it('should calculate TTL based on the harmonic multiplier', async () => {
    // Arrange
    const harmonicMultiplier = 4;
    const expectedTtl = Math.round(TESLA_PERIOD_MS * harmonicMultiplier);
    const customCache = new RetrievalCache('redis://mock-url', harmonicMultiplier);
    const customRedisInstance = MockRedis.mock.instances[1] as jest.Mocked<Redis>;

    // Act
    await customCache.set(sampleRequest, sampleResponse);

    // Assert
    expect(customRedisInstance.set).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      'PX',
      expectedTtl
    );
  });
});
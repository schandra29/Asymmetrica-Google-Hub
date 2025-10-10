import Redis from 'ioredis';
import { RAGQueryResponse, RAGQueryRequest } from '@deep-sensing/shared';

/**
 * @const TESLA_HZ
 * @description The base frequency for cache timing, derived from Tesla's harmonic principles.
 * @type {number}
 */
const TESLA_HZ = 4.909;

/**
 * @const TESLA_PERIOD_MS
 * @description The base period in milliseconds, corresponding to 1x harmonic of the Tesla frequency.
 * @type {number}
 */
const TESLA_PERIOD_MS = 203.7; // 1 / 4.909 Hz * 1000 ms/s

/**
 * @class RetrievalCache
 * @description A caching service for RAG query responses, using Redis.
 * It caches results based on a hash of the query request and uses a TTL
 * aligned with Tesla harmonic intervals for deterministic performance.
 *
 * @remarks
 * This cache is designed to significantly reduce query latency for repeated
 * or similar queries, aiming for a high cache-hit rate as per the project's
 * performance targets.
 */
export class RetrievalCache {
  private redis: Redis;
  private readonly cacheTTL: number;

  /**
   * Initializes a new instance of the RetrievalCache.
   *
   * @param redisUrl - The connection string for the Redis server.
   * @param harmonicMultiplier - The multiplier for the Tesla period to determine TTL.
   *
   * @remarks
   * The `harmonicMultiplier` allows for flexible cache durations based on the
   * base Tesla harmonic interval (e.g., 1x, 2x, 4x).
   */
  constructor(redisUrl: string, harmonicMultiplier: number = 1) {
    this.redis = new Redis(redisUrl, {
      // Recommended settings for production
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
    });

    this.cacheTTL = Math.round(TESLA_PERIOD_MS * harmonicMultiplier);

    this.redis.on('error', (err) => {
      console.error('Redis connection error:', err);
    });
  }

  /**
   * Generates a consistent cache key from a RAG query request.
   *
   * @param request - The RAG query request object.
   * @returns A string representing the cache key.
   * @private
   */
  private generateCacheKey(request: RAGQueryRequest): string {
    // A simple and effective way to create a key from the request object.
    // For more complex objects, a hashing function like SHA256 might be better.
    const queryString = request.query.toLowerCase().trim();
    const topK = request.top_k || 5; // Default to 5 if not provided
    return `rag_query:${queryString}:top_k=${topK}`;
  }

  /**
   * Retrieves a cached RAG query response from Redis.
   *
   * @param request - The original RAG query request.
   * @returns A promise that resolves to the cached response or null if not found.
   */
  public async get(request: RAGQueryRequest): Promise<RAGQueryResponse | null> {
    const key = this.generateCacheKey(request);
    const cachedData = await this.redis.get(key);

    if (cachedData) {
      console.log(`Cache HIT for key: ${key}`);
      return JSON.parse(cachedData) as RAGQueryResponse;
    }

    console.log(`Cache MISS for key: ${key}`);
    return null;
  }

  /**
   * Caches a RAG query response in Redis with a defined TTL.
   *
   * @param request - The original RAG query request.
   * @param response - The RAG query response to cache.
   * @returns A promise that resolves when the data has been cached.
   */
  public async set(request: RAGQueryRequest, response: RAGQueryResponse): Promise<void> {
    const key = this.generateCacheKey(request);
    const value = JSON.stringify(response);

    // 'EX' sets the expiration time in seconds.
    await this.redis.set(key, value, 'PX', this.cacheTTL);
    console.log(`Cached response for key: ${key} with TTL: ${this.cacheTTL}ms`);
  }

  /**
   * Disconnects the Redis client.
   * This is useful for graceful shutdown and in test environments.
   */
  public async disconnect(): Promise<void> {
    await this.redis.quit();
  }
}

// Export a singleton instance, assuming a single Redis connection is sufficient.
// The REDIS_URL should be sourced from environment variables in a real application.
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
export const retrievalCache = new RetrievalCache(redisUrl);
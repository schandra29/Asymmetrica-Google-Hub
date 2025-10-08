/**
 * Replay Protection Shield
 * Based on Betanet specs Section 7.5
 * 
 * Prevent replay attacks with timestamp-based deduplication
 * and cryptographic verification
 */

import { sha256 } from '@noble/hashes/sha256';
import { ed25519 } from '@noble/curves/ed25519';
import { randomBytes } from '@noble/hashes/utils';

// Constants from Section 7.5
const WINDOW_SIZE = 600000; // 10 minutes in milliseconds
const CLOCK_SKEW = 120000; // ±2 minutes tolerance
const CACHE_CLEANUP_INTERVAL = 60000; // Clean every minute
const MAX_CACHE_SIZE = 10000; // Maximum entries before forced cleanup

/**
 * Replay Protection Cache Entry
 */
class CacheEntry {
  constructor(key, timestamp, expiry, signature) {
    this.key = key;
    this.timestamp = timestamp;
    this.expiry = expiry;
    this.signature = signature;
    this.accessCount = 1;
    this.firstSeen = Date.now();
    this.lastSeen = Date.now();
  }
  
  isExpired() {
    return Date.now() > this.expiry;
  }
  
  touch() {
    this.accessCount++;
    this.lastSeen = Date.now();
  }
}

/**
 * LRU Cache for Replay Protection
 */
class LRUCache {
  constructor(maxSize = MAX_CACHE_SIZE) {
    this.maxSize = maxSize;
    this.cache = new Map();
    this.accessOrder = [];
  }
  
  set(key, value) {
    // Remove from access order if exists
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    
    // Add to end (most recently used)
    this.accessOrder.push(key);
    this.cache.set(key, value);
    
    // Evict if over capacity
    if (this.cache.size > this.maxSize) {
      this.evictLRU();
    }
  }
  
  get(key) {
    const value = this.cache.get(key);
    if (value) {
      // Move to end (most recently used)
      const index = this.accessOrder.indexOf(key);
      if (index > -1) {
        this.accessOrder.splice(index, 1);
        this.accessOrder.push(key);
      }
    }
    return value;
  }
  
  has(key) {
    return this.cache.has(key);
  }
  
  delete(key) {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    return this.cache.delete(key);
  }
  
  evictLRU() {
    if (this.accessOrder.length > 0) {
      const lru = this.accessOrder.shift();
      this.cache.delete(lru);
    }
  }
  
  clear() {
    this.cache.clear();
    this.accessOrder = [];
  }
  
  size() {
    return this.cache.size;
  }
  
  values() {
    return this.cache.values();
  }
}

/**
 * Replay Protection Shield
 * 
 * Prevents replay attacks using sliding window cache
 * and cryptographic signatures
 */
export class ReplayProtectionShield {
  constructor(options = {}) {
    this.windowSize = options.windowSize || WINDOW_SIZE;
    this.clockSkew = options.clockSkew || CLOCK_SKEW;
    this.maxCacheSize = options.maxCacheSize || MAX_CACHE_SIZE;
    
    // LRU cache for seen requests
    this.cache = new LRUCache(this.maxCacheSize);
    
    // Statistics
    this.stats = {
      totalRequests: 0,
      replayAttemptsBlocked: 0,
      expiredRequests: 0,
      futureRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      cacheEvictions: 0
    };
    
    // Start cleanup timer
    this.cleanupTimer = setInterval(
      () => this.cleanup(),
      CACHE_CLEANUP_INTERVAL
    );
  }
  
  /**
   * Create a protected request
   */
  createRequest(data, privateKey) {
    const timestamp = Date.now();
    const nonce = randomBytes(16);
    const expiry = timestamp + this.windowSize;
    
    // Create request object
    const request = {
      data,
      timestamp,
      nonce: Array.from(nonce),
      expiry
    };
    
    // Generate signature context (Section 7.3)
    const context = this.createSignatureContext(request);
    
    // Sign the context
    const signature = ed25519.sign(context, privateKey);
    
    request.signature = Array.from(signature);
    
    return request;
  }
  
  /**
   * Verify and process a request
   */
  async verifyRequest(request, publicKey, sender = 'unknown') {
    this.stats.totalRequests++;
    
    try {
      // 1. Check timestamp freshness (Section 7.5)
      const now = Date.now();
      const age = now - request.timestamp;
      
      // Reject expired requests
      if (request.expiry < now - this.clockSkew) {
        this.stats.expiredRequests++;
        return {
          valid: false,
          error: 'Request expired',
          age: age
        };
      }
      
      // Reject future requests beyond clock skew
      if (request.timestamp > now + this.clockSkew) {
        this.stats.futureRequests++;
        return {
          valid: false,
          error: 'Request timestamp in future',
          drift: request.timestamp - now
        };
      }
      
      // 2. Check for replay (Section 7.5)
      const cacheKey = this.generateCacheKey(sender, request);
      
      if (this.cache.has(cacheKey)) {
        const entry = this.cache.get(cacheKey);
        entry.touch();
        
        this.stats.replayAttemptsBlocked++;
        this.stats.cacheHits++;
        
        return {
          valid: false,
          error: 'Replay detected',
          firstSeen: entry.firstSeen,
          attempts: entry.accessCount
        };
      }
      
      this.stats.cacheMisses++;
      
      // 3. Verify signature (Section 7.3)
      const context = this.createSignatureContext(request);
      const signature = new Uint8Array(request.signature);
      
      const validSignature = ed25519.verify(signature, context, publicKey);
      
      if (!validSignature) {
        return {
          valid: false,
          error: 'Invalid signature'
        };
      }
      
      // 4. Add to cache to prevent replay
      const entry = new CacheEntry(
        cacheKey,
        request.timestamp,
        request.expiry,
        request.signature
      );
      
      this.cache.set(cacheKey, entry);
      
      return {
        valid: true,
        timestamp: request.timestamp,
        age: age
      };
      
    } catch (error) {
      return {
        valid: false,
        error: `Verification failed: ${error.message}`
      };
    }
  }
  
  /**
   * Create signature context for a request
   * Based on Section 7.3 signature format
   */
  createSignatureContext(request) {
    // Construct canonical message for signing
    const message = {
      data: request.data,
      timestamp: request.timestamp,
      nonce: request.nonce,
      expiry: request.expiry
    };
    
    // Serialize to canonical form
    const serialized = JSON.stringify(message, Object.keys(message).sort());
    const messageBytes = new TextEncoder().encode(serialized);
    
    // Create context with protocol prefix
    const prefix = new TextEncoder().encode('DK-REPLAY-v1');
    const context = new Uint8Array(prefix.length + messageBytes.length);
    context.set(prefix, 0);
    context.set(messageBytes, prefix.length);
    
    // Return SHA-256 of context
    return sha256(context);
  }
  
  /**
   * Generate cache key for deduplication
   * Format: (Sender, Receiver, Timestamp, Nonce) from Section 7.5
   */
  generateCacheKey(sender, request) {
    const components = [
      sender,
      request.timestamp.toString(),
      Array.from(request.nonce).map(b => b.toString(16).padStart(2, '0')).join('')
    ];
    
    return components.join(':');
  }
  
  /**
   * Clean up expired entries
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const entry of this.cache.values()) {
      if (entry.isExpired() || (now - entry.timestamp) > this.windowSize) {
        this.cache.delete(entry.key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      this.stats.cacheEvictions += cleaned;
    }
    
    return cleaned;
  }
  
  /**
   * Force cleanup if cache is too large
   */
  forceCleanup() {
    const targetSize = Math.floor(this.maxCacheSize * 0.75);
    const toRemove = this.cache.size() - targetSize;
    
    if (toRemove <= 0) {
      return 0;
    }
    
    // Remove oldest entries first
    const entries = Array.from(this.cache.values())
      .sort((a, b) => a.lastSeen - b.lastSeen);
    
    for (let i = 0; i < toRemove && i < entries.length; i++) {
      this.cache.delete(entries[i].key);
    }
    
    this.stats.cacheEvictions += toRemove;
    return toRemove;
  }
  
  /**
   * Get current statistics
   */
  getStats() {
    return {
      ...this.stats,
      cacheSize: this.cache.size(),
      cacheUtilization: (this.cache.size() / this.maxCacheSize) * 100,
      replayBlockRate: this.stats.totalRequests > 0 
        ? (this.stats.replayAttemptsBlocked / this.stats.totalRequests) * 100 
        : 0,
      cacheHitRate: (this.stats.cacheHits + this.stats.cacheMisses) > 0
        ? (this.stats.cacheHits / (this.stats.cacheHits + this.stats.cacheMisses)) * 100
        : 0
    };
  }
  
  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalRequests: 0,
      replayAttemptsBlocked: 0,
      expiredRequests: 0,
      futureRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      cacheEvictions: 0
    };
  }
  
  /**
   * Clear cache and reset
   */
  clear() {
    this.cache.clear();
    this.resetStats();
  }
  
  /**
   * Destroy the shield (cleanup resources)
   */
  destroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
  }
}

/**
 * Replay Protection Middleware for Express/HTTP
 */
export class ReplayProtectionMiddleware {
  constructor(shield, options = {}) {
    this.shield = shield;
    this.publicKeyExtractor = options.publicKeyExtractor || this.defaultKeyExtractor;
    this.senderExtractor = options.senderExtractor || this.defaultSenderExtractor;
    this.enabled = options.enabled !== false;
  }
  
  /**
   * Express middleware function
   */
  middleware() {
    return async (req, res, next) => {
      if (!this.enabled) {
        return next();
      }
      
      try {
        // Extract replay protection data from request
        const replayData = this.extractReplayData(req);
        
        if (!replayData) {
          // No replay protection data, allow request
          // (might be a public endpoint)
          return next();
        }
        
        // Extract public key and sender
        const publicKey = await this.publicKeyExtractor(req);
        const sender = this.senderExtractor(req);
        
        if (!publicKey) {
          return res.status(401).json({
            error: 'Missing authentication'
          });
        }
        
        // Verify replay protection
        const result = await this.shield.verifyRequest(
          replayData,
          publicKey,
          sender
        );
        
        if (!result.valid) {
          return res.status(400).json({
            error: result.error,
            details: result
          });
        }
        
        // Attach verification result to request
        req.replayProtection = result;
        
        next();
      } catch (error) {
        res.status(500).json({
          error: 'Replay protection failed',
          message: error.message
        });
      }
    };
  }
  
  /**
   * Extract replay protection data from request
   */
  extractReplayData(req) {
    // Check header first
    if (req.headers['x-replay-protection']) {
      try {
        return JSON.parse(req.headers['x-replay-protection']);
      } catch (e) {
        return null;
      }
    }
    
    // Check body
    if (req.body && req.body.replayProtection) {
      return req.body.replayProtection;
    }
    
    return null;
  }
  
  /**
   * Default public key extractor
   */
  defaultKeyExtractor(req) {
    // Override this to extract from your auth system
    if (req.user && req.user.publicKey) {
      return new Uint8Array(req.user.publicKey);
    }
    return null;
  }
  
  /**
   * Default sender extractor
   */
  defaultSenderExtractor(req) {
    // Use IP address as default sender ID
    return req.ip || req.connection.remoteAddress || 'unknown';
  }
}

/**
 * Replay Protection Client Helper
 */
export class ReplayProtectionClient {
  constructor(privateKey) {
    this.privateKey = privateKey;
    this.publicKey = ed25519.getPublicKey(privateKey);
  }
  
  /**
   * Wrap data with replay protection
   */
  protect(data) {
    const shield = new ReplayProtectionShield();
    return shield.createRequest(data, this.privateKey);
  }
  
  /**
   * Add replay protection to fetch request
   */
  async protectedFetch(url, options = {}) {
    const protectedData = this.protect({
      method: options.method || 'GET',
      url: url,
      timestamp: Date.now()
    });
    
    const headers = {
      ...options.headers,
      'X-Replay-Protection': JSON.stringify(protectedData)
    };
    
    return fetch(url, {
      ...options,
      headers
    });
  }
}

export default {
  ReplayProtectionShield,
  ReplayProtectionMiddleware,
  ReplayProtectionClient,
  LRUCache,
  WINDOW_SIZE,
  CLOCK_SKEW
};
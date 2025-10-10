/**
 * 🎵 HARMONIC RATE LIMITER
 * Tesla 4.909 Hz harmonic timing for natural request flow
 *
 * Mathematical Foundation: Tesla resonance frequency (4.909 Hz)
 * Source: Nikola Tesla electromagnetic research
 * Application: Natural rhythm prevents thundering herd, deterministic timing
 *
 * Asymmetrica Protocol: Pattern from iPermit DefenseKit integration
 */

import { NextRequest, NextResponse } from 'next/server';
import { logSecurityEvent } from './audit-logger';

// Tesla harmonic frequency (Hz)
const TESLA_FREQUENCY_HZ = 4.909;
const BASE_PERIOD_MS = 1000 / TESLA_FREQUENCY_HZ; // ~203.7ms

/**
 * Rate limit configuration by endpoint type
 */
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  harmonicBackoff: number[]; // Multipliers for exponential backoff
}

/**
 * Client request record
 */
interface ClientRecord {
  requests: number[];
  lastReset: number;
  violations: number;
}

// Rate limit store (in-memory for development, Redis for production)
const rateLimitStore = new Map<string, ClientRecord>();

/**
 * Rate limit configurations for different endpoint types
 */
const RATE_LIMITS: Record<string, RateLimitConfig> = {
  auth: {
    maxRequests: 10,
    windowMs: 900000, // 15 minutes
    harmonicBackoff: [1, 2, 4, 8, 16] // Tesla harmonics
  },
  invoices: {
    maxRequests: 100,
    windowMs: 900000, // 15 minutes
    harmonicBackoff: [1, 2, 4, 8]
  },
  payments: {
    maxRequests: 50,
    windowMs: 600000, // 10 minutes
    harmonicBackoff: [1, 3, 6, 12, 24]
  },
  pdf_generation: {
    maxRequests: 30,
    windowMs: 600000, // 10 minutes
    harmonicBackoff: [1, 2, 4]
  },
  webhooks: {
    maxRequests: 200,
    windowMs: 900000, // 15 minutes (higher for legitimate webhooks)
    harmonicBackoff: [1, 2]
  }
};

/**
 * Get client identifier from request
 */
function getClientId(request: NextRequest): string {
  const ip = request.headers.get('x-forwarded-for') ||
             request.headers.get('x-real-ip') ||
             'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Create fingerprint (IP + User-Agent hash)
  const fingerprint = Buffer.from(`${ip}_${userAgent}`).toString('base64').slice(0, 16);

  return fingerprint;
}

/**
 * Check if request is rate limited
 *
 * @param request - Next.js request
 * @param endpoint - Endpoint type ('auth', 'invoices', 'payments', etc.)
 * @returns Rate limit result
 */
export async function checkRateLimit(
  request: NextRequest,
  endpoint: keyof typeof RATE_LIMITS
): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}> {
  const config = RATE_LIMITS[endpoint];
  const clientId = `${endpoint}_${getClientId(request)}`;
  const now = Date.now();

  // Get or create client record
  let clientRecord = rateLimitStore.get(clientId) || {
    requests: [],
    lastReset: now,
    violations: 0
  };

  // Clean up expired requests using Tesla harmonic
  const windowStart = now - config.windowMs;
  const teslaPhase = Math.sin(2 * Math.PI * TESLA_FREQUENCY_HZ * now / 1000);
  const cleanupThreshold = windowStart + (Math.abs(teslaPhase) * BASE_PERIOD_MS);

  clientRecord.requests = clientRecord.requests.filter(
    timestamp => timestamp > cleanupThreshold
  );

  // Check if limit exceeded
  const currentRequests = clientRecord.requests.length;
  const allowed = currentRequests < config.maxRequests;

  if (allowed) {
    // Allow request - add to record
    clientRecord.requests.push(now);
    clientRecord.violations = 0; // Reset violations on success
    rateLimitStore.set(clientId, clientRecord);

    return {
      allowed: true,
      remaining: config.maxRequests - currentRequests - 1,
      resetAt: now + config.windowMs
    };

  } else {
    // Rate limit exceeded - calculate harmonic backoff
    clientRecord.violations++;

    const violationIndex = Math.min(
      clientRecord.violations - 1,
      config.harmonicBackoff.length - 1
    );
    const harmonic = config.harmonicBackoff[violationIndex];
    const retryAfter = Math.ceil(BASE_PERIOD_MS * harmonic);

    rateLimitStore.set(clientId, clientRecord);

    // Log security event
    await logSecurityEvent({
      type: 'rate_limit_exceeded',
      severity: clientRecord.violations > 3 ? 'high' : 'medium',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date(),
      details: {
        endpoint,
        attempts: currentRequests,
        limit: config.maxRequests,
        violations: clientRecord.violations,
        harmonicMultiplier: harmonic
      }
    });

    return {
      allowed: false,
      remaining: 0,
      resetAt: now + config.windowMs,
      retryAfter
    };
  }
}

/**
 * Rate limit middleware wrapper
 * Use this to protect API routes
 *
 * @param endpoint - Endpoint type
 * @returns Middleware function
 */
export function harmonicRateLimiter(endpoint: keyof typeof RATE_LIMITS) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const result = await checkRateLimit(request, endpoint);

    if (!result.allowed) {
      console.log(`🚨 Rate limit exceeded: ${endpoint}`);

      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          retryAfter: result.retryAfter ? Math.ceil(result.retryAfter / 1000) : null
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMITS[endpoint].maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.resetAt.toString(),
            'X-Tesla-Harmonic': TESLA_FREQUENCY_HZ.toString(),
            'Retry-After': result.retryAfter ? Math.ceil(result.retryAfter / 1000).toString() : '60'
          }
        }
      );
    }

    // Request allowed - add rate limit headers
    return null; // Continue to next middleware/route
  };
}

/**
 * Apply rate limit to API route handler
 * Use this as a decorator for route handlers
 */
export function withRateLimit<T>(
  endpoint: keyof typeof RATE_LIMITS,
  handler: (request: NextRequest, ...args: any[]) => Promise<T>
) {
  return async (request: NextRequest, ...args: any[]): Promise<T | NextResponse> => {
    const rateLimitResult = await harmonicRateLimiter(endpoint)(request);

    if (rateLimitResult) {
      // Rate limit exceeded - return error response
      return rateLimitResult as any;
    }

    // Rate limit passed - execute handler
    return handler(request, ...args);
  };
}

/**
 * Get rate limit metrics for monitoring
 */
export function getRateLimitMetrics(): {
  endpoints: Record<string, {
    config: RateLimitConfig;
    activeClients: number;
    totalRequests: number;
  }>;
  timestamp: number;
} {
  const metrics: Record<string, any> = {};

  for (const [endpoint, config] of Object.entries(RATE_LIMITS)) {
    const clients = Array.from(rateLimitStore.entries())
      .filter(([key]) => key.startsWith(`${endpoint}_`));

    const totalRequests = clients.reduce(
      (sum, [_, record]) => sum + record.requests.length,
      0
    );

    metrics[endpoint] = {
      config,
      activeClients: clients.length,
      totalRequests
    };
  }

  return {
    endpoints: metrics,
    timestamp: Date.now()
  };
}

/**
 * Clear rate limit for specific client (admin function)
 */
export function clearRateLimit(clientId: string, endpoint?: keyof typeof RATE_LIMITS) {
  if (endpoint) {
    rateLimitStore.delete(`${endpoint}_${clientId}`);
  } else {
    // Clear all endpoints for this client
    for (const key of rateLimitStore.keys()) {
      if (key.endsWith(clientId)) {
        rateLimitStore.delete(key);
      }
    }
  }

  console.log(`✅ Rate limit cleared for client: ${clientId}`);
}

/**
 * Harmonic retry with exponential backoff
 * Use this for retrying failed operations with natural timing
 */
export async function retryWithHarmonicBackoff<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 5,
  harmonicMultipliers: number[] = [1, 2, 4, 8, 16]
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await operation();

    } catch (error) {
      lastError = error as Error;

      if (attempt < maxAttempts - 1) {
        const multiplier = harmonicMultipliers[Math.min(attempt, harmonicMultipliers.length - 1)];
        const delayMs = BASE_PERIOD_MS * multiplier;

        console.log(`⏳ Retry attempt ${attempt + 1}/${maxAttempts} after ${delayMs.toFixed(0)}ms`);

        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError || new Error('Operation failed after retries');
}

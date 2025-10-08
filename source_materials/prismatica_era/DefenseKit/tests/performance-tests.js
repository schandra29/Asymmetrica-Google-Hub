/**
 * DefenseKit Performance Tests
 * Recording military-grade performance metrics
 */

import { performance } from 'perf_hooks';
import { HTXConnection } from '../src/htx-v2/htx-protocol.js';
import { DeterministicCBOREncoder } from '../src/cbor/deterministic-cbor.js';
import { SelfCertifyingIdentity } from '../src/identity/self-certifying.js';
import { ReplayProtectionShield } from '../src/replay/replay-protection.js';

export async function runPerformanceTests(reporter) {
  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };

  const metrics = {};

  const tests = [
    { name: 'HTX Throughput', fn: testHTXThroughput },
    { name: 'CBOR Encoding Speed', fn: testCBORSpeed },
    { name: 'Identity Generation', fn: testIdentityGeneration },
    { name: 'Replay Protection', fn: testReplayProtection },
    { name: 'End-to-End Latency', fn: testEndToEndLatency },
    { name: 'Concurrent Operations', fn: testConcurrentOps },
    { name: 'Memory Efficiency', fn: testMemoryEfficiency }
  ];

  console.log('   📊 Recording performance metrics...\n');

  for (const test of tests) {
    results.total++;
    try {
      const testMetrics = await test.fn();
      metrics[test.name] = testMetrics;
      results.passed++;
      console.log(`   ✅ ${test.name}`);
      
      // Display key metrics
      for (const [key, value] of Object.entries(testMetrics)) {
        console.log(`      ${key}: ${value}`);
      }
    } catch (error) {
      results.failed++;
      console.log(`   ❌ ${test.name}: ${error.message}`);
    }
  }

  // Record all metrics
  reporter.recordPerformance('DefenseKit', metrics);

  return results;
}

async function testHTXThroughput() {
  const iterations = 10000;
  const dataSizes = [64, 256, 1024, 4096, 16384]; // Various packet sizes
  const results = {};

  for (const size of dataSizes) {
    const connection = new HTXConnection('test', new Uint8Array(32));
    connection.established = true;
    connection.transportState.sendKey = new Uint8Array(32);
    connection.transportState.sendNonceSalt = new Uint8Array(12);

    const data = new Uint8Array(size);
    crypto.getRandomValues(data);

    const start = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      connection.encrypt(data);
    }
    
    const duration = performance.now() - start;
    const throughputMBps = (iterations * size) / (duration / 1000) / 1024 / 1024;
    const opsPerSec = iterations / (duration / 1000);
    
    results[`${size}B_throughput`] = `${throughputMBps.toFixed(2)} MB/s`;
    results[`${size}B_ops`] = `${Math.round(opsPerSec).toLocaleString()} ops/s`;
  }

  return results;
}

async function testCBORSpeed() {
  const encoder = new DeterministicCBOREncoder();
  const iterations = 10000;
  
  // Test data structures
  const testData = [
    { simple: { a: 1, b: 2, c: 3 } },
    { 
      complex: {
        nested: { deep: { structure: { with: { many: { levels: 'test' } } } } },
        array: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        mixed: { num: 42, str: 'hello', bool: true, null: null }
      }
    },
    {
      large: new Array(100).fill(0).map((_, i) => ({
        id: i,
        data: `item_${i}`,
        value: Math.random()
      }))
    }
  ];

  const metrics = {};

  for (const [name, data] of Object.entries(testData[1])) {
    const start = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      encoder.encode(data);
    }
    
    const duration = performance.now() - start;
    const opsPerSec = iterations / (duration / 1000);
    
    metrics[`${name}_encode`] = `${Math.round(opsPerSec).toLocaleString()} ops/s`;
  }

  // Test decode speed
  const encoded = encoder.encode(testData[1].complex);
  const decoder = new DeterministicCBORDecoder(encoded);
  
  const decodeStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    new DeterministicCBORDecoder(encoded).decode();
  }
  const decodeDuration = performance.now() - decodeStart;
  
  metrics.decode_speed = `${Math.round(iterations / (decodeDuration / 1000)).toLocaleString()} ops/s`;

  return metrics;
}

async function testIdentityGeneration() {
  const iterations = 1000;
  const metrics = {};

  // Test identity creation
  const createStart = performance.now();
  const identities = [];
  
  for (let i = 0; i < iterations; i++) {
    identities.push(new SelfCertifyingIdentity());
  }
  
  const createDuration = performance.now() - createStart;
  metrics.generation_rate = `${Math.round(iterations / (createDuration / 1000)).toLocaleString()} identities/s`;
  metrics.avg_generation_time = `${(createDuration / iterations).toFixed(3)} ms`;

  // Test signature generation
  const identity = identities[0];
  const data = 'Test message for signing';
  
  const signStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    identity.sign(data);
  }
  const signDuration = performance.now() - signStart;
  
  metrics.signature_rate = `${Math.round(iterations / (signDuration / 1000)).toLocaleString()} sigs/s`;

  // Test verification
  const signature = identity.sign(data);
  const verifyStart = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    identity.verify(data, signature);
  }
  
  const verifyDuration = performance.now() - verifyStart;
  metrics.verification_rate = `${Math.round(iterations / (verifyDuration / 1000)).toLocaleString()} verifications/s`;

  return metrics;
}

async function testReplayProtection() {
  const shield = new ReplayProtectionShield();
  const identity = new SelfCertifyingIdentity();
  const iterations = 10000;
  const metrics = {};

  // Test request creation
  const createStart = performance.now();
  const requests = [];
  
  for (let i = 0; i < iterations; i++) {
    requests.push(shield.createRequest(
      { data: `request_${i}` },
      identity.privateKey
    ));
  }
  
  const createDuration = performance.now() - createStart;
  metrics.request_creation = `${Math.round(iterations / (createDuration / 1000)).toLocaleString()} reqs/s`;

  // Test verification (first pass - all unique)
  const verifyStart = performance.now();
  let validCount = 0;
  
  for (const request of requests) {
    const result = await shield.verifyRequest(
      request,
      identity.publicKey,
      'test-sender'
    );
    if (result.valid) validCount++;
  }
  
  const verifyDuration = performance.now() - verifyStart;
  metrics.verification_rate = `${Math.round(iterations / (verifyDuration / 1000)).toLocaleString()} verifications/s`;
  metrics.valid_ratio = `${((validCount / iterations) * 100).toFixed(2)}%`;

  // Test replay detection
  const replayStart = performance.now();
  let replayDetected = 0;
  
  // Try to replay first 100 requests
  for (let i = 0; i < 100; i++) {
    const result = await shield.verifyRequest(
      requests[i],
      identity.publicKey,
      'test-sender'
    );
    if (!result.valid && result.error === 'Replay detected') {
      replayDetected++;
    }
  }
  
  const replayDuration = performance.now() - replayStart;
  metrics.replay_detection = `${replayDetected}/100 replays blocked`;
  metrics.replay_check_speed = `${(replayDuration / 100).toFixed(3)} ms/check`;

  // Get shield stats
  const stats = shield.getStats();
  metrics.cache_hit_rate = `${stats.cacheHitRate.toFixed(2)}%`;
  metrics.total_processed = stats.totalRequests.toLocaleString();

  return metrics;
}

async function testEndToEndLatency() {
  const iterations = 1000;
  const latencies = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    
    // Simulate full security pipeline
    // 1. Create identity
    const identity = new SelfCertifyingIdentity();
    
    // 2. Create HTX connection
    const connection = new HTXConnection('test', identity.privateKey);
    connection.established = true;
    connection.transportState.sendKey = new Uint8Array(32);
    connection.transportState.sendNonceSalt = new Uint8Array(12);
    
    // 3. Encode data with CBOR
    const encoder = new DeterministicCBOREncoder();
    const data = { transaction: i, timestamp: Date.now() };
    const encoded = encoder.encode(data);
    
    // 4. Encrypt with HTX
    const encrypted = connection.encrypt(encoded);
    
    // 5. Add replay protection
    const shield = new ReplayProtectionShield();
    const protected = shield.createRequest(encrypted, identity.privateKey);
    
    const latency = performance.now() - start;
    latencies.push(latency);
  }

  // Calculate statistics
  latencies.sort((a, b) => a - b);
  const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  const p50 = latencies[Math.floor(latencies.length * 0.5)];
  const p95 = latencies[Math.floor(latencies.length * 0.95)];
  const p99 = latencies[Math.floor(latencies.length * 0.99)];

  return {
    average: `${avg.toFixed(3)} ms`,
    p50: `${p50.toFixed(3)} ms`,
    p95: `${p95.toFixed(3)} ms`,
    p99: `${p99.toFixed(3)} ms`,
    min: `${latencies[0].toFixed(3)} ms`,
    max: `${latencies[latencies.length - 1].toFixed(3)} ms`
  };
}

async function testConcurrentOps() {
  const concurrency = 100;
  const opsPerWorker = 100;
  const metrics = {};

  // Test concurrent HTX connections
  const htxStart = performance.now();
  const htxPromises = [];
  
  for (let i = 0; i < concurrency; i++) {
    htxPromises.push(new Promise(resolve => {
      const conn = new HTXConnection(`worker_${i}`, new Uint8Array(32));
      conn.established = true;
      conn.transportState.sendKey = new Uint8Array(32);
      conn.transportState.sendNonceSalt = new Uint8Array(12);
      
      const data = new Uint8Array(1024);
      for (let j = 0; j < opsPerWorker; j++) {
        conn.encrypt(data);
      }
      resolve();
    }));
  }
  
  await Promise.all(htxPromises);
  const htxDuration = performance.now() - htxStart;
  
  metrics.concurrent_htx = `${Math.round((concurrency * opsPerWorker) / (htxDuration / 1000)).toLocaleString()} ops/s`;
  metrics.htx_concurrency = `${concurrency} workers`;

  // Test concurrent identity operations
  const identityStart = performance.now();
  const identityPromises = [];
  
  for (let i = 0; i < concurrency; i++) {
    identityPromises.push(new Promise(resolve => {
      const identity = new SelfCertifyingIdentity();
      const data = `worker_${i}_data`;
      
      for (let j = 0; j < opsPerWorker; j++) {
        const sig = identity.sign(data);
        identity.verify(data, sig);
      }
      resolve();
    }));
  }
  
  await Promise.all(identityPromises);
  const identityDuration = performance.now() - identityStart;
  
  metrics.concurrent_identity = `${Math.round((concurrency * opsPerWorker * 2) / (identityDuration / 1000)).toLocaleString()} ops/s`;

  return metrics;
}

async function testMemoryEfficiency() {
  const metrics = {};
  
  // Get initial memory
  if (global.gc) global.gc();
  const initialMemory = process.memoryUsage();
  
  // Create many objects
  const objects = [];
  const objectCount = 10000;
  
  // HTX connections
  for (let i = 0; i < 1000; i++) {
    objects.push(new HTXConnection(`conn_${i}`, new Uint8Array(32)));
  }
  
  // Identities
  for (let i = 0; i < 1000; i++) {
    objects.push(new SelfCertifyingIdentity());
  }
  
  // CBOR encoders
  for (let i = 0; i < 1000; i++) {
    objects.push(new DeterministicCBOREncoder());
  }
  
  // Replay shields
  for (let i = 0; i < 100; i++) {
    objects.push(new ReplayProtectionShield());
  }
  
  // Get memory after creation
  const afterCreation = process.memoryUsage();
  
  // Calculate memory usage
  const heapUsed = (afterCreation.heapUsed - initialMemory.heapUsed) / 1024 / 1024;
  const external = (afterCreation.external - initialMemory.external) / 1024 / 1024;
  
  metrics.heap_used = `${heapUsed.toFixed(2)} MB`;
  metrics.external_memory = `${external.toFixed(2)} MB`;
  metrics.per_connection = `${((heapUsed * 1024) / 1000).toFixed(2)} KB`;
  metrics.per_identity = `${((heapUsed * 1024) / 1000).toFixed(2)} KB`;
  metrics.total_objects = objects.length.toLocaleString();
  
  // Force cleanup
  objects.length = 0;
  if (global.gc) global.gc();
  
  const afterCleanup = process.memoryUsage();
  const recovered = (afterCreation.heapUsed - afterCleanup.heapUsed) / 1024 / 1024;
  metrics.memory_recovered = `${recovered.toFixed(2)} MB`;
  
  return metrics;
}
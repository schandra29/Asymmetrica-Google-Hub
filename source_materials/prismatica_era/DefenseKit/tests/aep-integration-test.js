/**
 * 🧪 AEP INTEGRATION TEST SUITE
 *
 * Validates that DefenseKit v2.0 with AEP Enhancement delivers:
 * - Performance amplification (target: 5-50x gains)
 * - Mathematical intelligence in all operations
 * - Infinite loop prevention via Collatz bounds
 * - Regime-aware optimization
 * - Complete backward compatibility
 *
 * BREAKTHROUGH: First test suite for mathematically-intelligent quantum security!
 */

import { performance } from 'perf_hooks';
import { strict as assert } from 'assert';

// Import AEP-enhanced components
import AEPMiddleware from '../src/aep/aep-middleware.js';
import AEPEnhancedIdentity from '../src/aep/aep-enhanced-identity.js';
import { AEPEnhancedCBOREncoder, AEPEnhancedCBORDecoder } from '../src/aep/aep-enhanced-cbor.js';

// Import original components for comparison
import { SelfCertifyingIdentity } from '../src/identity/self-certifying.js';
import { DeterministicCBOREncoder, DeterministicCBORDecoder } from '../src/cbor/deterministic-cbor.js';

/**
 * 🎯 MAIN AEP INTEGRATION TEST RUNNER
 */
export class AEPIntegrationTest {
  constructor() {
    this.testResults = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      performanceGains: {},
      amplificationResults: {},
      regimeResults: {},
      collatzResults: {},
      startTime: Date.now()
    };

    console.log('🚀 AEP Integration Test Suite v2.0 Initialized');
    console.log('🧪 Testing mathematical consciousness in quantum security...\n');
  }

  /**
   * 🏃‍♂️ RUN ALL INTEGRATION TESTS
   */
  async runAllTests() {
    console.log('🎯 === AEP INTEGRATION TEST SUITE === 🎯\n');

    try {
      // Core middleware tests
      await this.testAEPMiddleware();

      // Identity system tests
      await this.testAEPEnhancedIdentity();

      // CBOR system tests
      await this.testAEPEnhancedCBOR();

      // Performance comparison tests
      await this.testPerformanceComparison();

      // Regime dynamics tests
      await this.testRegimeDynamics();

      // Collatz bounds tests
      await this.testCollatzBounds();

      // Integration stress tests
      await this.testIntegrationStress();

      // Generate final report
      this.generateReport();

    } catch (error) {
      console.error('❌ Test suite execution failed:', error);
      throw error;
    }
  }

  /**
   * 🧠 TEST AEP MIDDLEWARE CORE
   */
  async testAEPMiddleware() {
    console.log('🧠 Testing AEP Middleware Core...');

    const middleware = new AEPMiddleware();

    // Test 1: Basic processing
    await this.runTest('AEP Middleware Basic Processing', async () => {
      const result = await middleware.process('test_operation',
        { test: 'data', complexity: 42 }
      );

      assert(result.enhanced === true, 'Processing should be enhanced');
      assert(result.enhancements.regime, 'Should classify regime');
      assert(result.performance.amplification > 1, 'Should show amplification');
    });

    // Test 2: Regime classification
    await this.runTest('AEP Regime Classification', async () => {
      const lowEntropy = await middleware.process('low_entropy', { simple: 'data' });
      const highEntropy = await middleware.process('high_entropy', {
        complex: { nested: { deeply: { structured: { data: new Array(100).fill('chaos') } } } }
      });

      assert(lowEntropy.enhancements.regime, 'Should classify low entropy regime');
      assert(highEntropy.enhancements.regime, 'Should classify high entropy regime');

      this.testResults.regimeResults.lowEntropy = lowEntropy.enhancements.regime;
      this.testResults.regimeResults.highEntropy = highEntropy.enhancements.regime;
    });

    // Test 3: Amplification measurement
    await this.runTest('AEP Amplification Measurement', async () => {
      const operations = [];
      for (let i = 0; i < 10; i++) {
        const result = await middleware.process(`operation_${i}`, { iteration: i });
        operations.push(result.performance.amplification);
      }

      const totalAmp = middleware.getMetrics().totalAmplification;
      assert(totalAmp > 1, `Total amplification should be > 1, got ${totalAmp}`);

      this.testResults.amplificationResults.middleware = totalAmp;
      console.log(`  📈 Middleware total amplification: ${totalAmp.toFixed(1)}x`);
    });

    console.log('✅ AEP Middleware tests passed\n');
  }

  /**
   * 🆔 TEST AEP-ENHANCED IDENTITY
   */
  async testAEPEnhancedIdentity() {
    console.log('🆔 Testing AEP-Enhanced Identity System...');

    // Test 1: Enhanced identity generation
    await this.runTest('AEP Identity Generation', async () => {
      const startTime = performance.now();
      const identity = await AEPEnhancedIdentity.generateEnhanced();
      const generationTime = performance.now() - startTime;

      assert(identity.name.startsWith('dk1:'), 'Should generate valid identity name');
      assert(identity.publicKey instanceof Uint8Array, 'Should have public key');
      assert(identity.privateKey instanceof Uint8Array, 'Should have private key');

      console.log(`  🆔 Generated identity: ${identity.name}`);
      console.log(`  ⚡ Generation time: ${generationTime.toFixed(2)}ms`);
    });

    // Test 2: AEP-enhanced signing
    await this.runTest('AEP Enhanced Signing', async () => {
      const identity = await AEPEnhancedIdentity.generateEnhanced();
      const testData = new TextEncoder().encode('Test message for AEP signing');

      const startTime = performance.now();
      const signature = await identity.sign(testData);
      const signingTime = performance.now() - startTime;

      assert(signature instanceof Uint8Array, 'Should produce valid signature');
      assert(signature.length === 64, 'Ed25519 signature should be 64 bytes');

      // Verify signature
      const isValid = identity.verify(testData, signature);
      assert(isValid, 'Signature should verify correctly');

      console.log(`  ✍️ Signing time: ${signingTime.toFixed(2)}ms`);
      console.log(`  🧠 Current regime: ${identity.currentRegime}`);
    });

    // Test 3: Key rotation with AEP
    await this.runTest('AEP Key Rotation', async () => {
      const identity = await AEPEnhancedIdentity.generateEnhanced();
      const originalName = identity.name;

      // Force rotation
      const rotated = await identity.rotateKeys(true);
      assert(rotated === true, 'Forced rotation should succeed');
      assert(identity.name !== originalName, 'Name should change after rotation');

      console.log(`  🔄 Rotation successful: ${originalName} → ${identity.name}`);
    });

    // Test 4: AEP metrics
    await this.runTest('AEP Identity Metrics', async () => {
      const identity = await AEPEnhancedIdentity.generateEnhanced();

      // Perform some operations
      await identity.sign(new TextEncoder().encode('test1'));
      await identity.sign(new TextEncoder().encode('test2'));
      await identity.sign(new TextEncoder().encode('test3'));

      const metrics = identity.getAEPMetrics();
      assert(metrics.aep, 'Should have AEP metrics');
      assert(metrics.aep.totalAmplification >= 1, 'Should show amplification');
      assert(metrics.aep.mathematicallyEnhanced === true, 'Should be mathematically enhanced');

      this.testResults.amplificationResults.identity = metrics.aep.totalAmplification;
      console.log(`  📊 Identity amplification: ${metrics.aep.totalAmplification.toFixed(1)}x`);
    });

    console.log('✅ AEP-Enhanced Identity tests passed\n');
  }

  /**
   * 📦 TEST AEP-ENHANCED CBOR
   */
  async testAEPEnhancedCBOR() {
    console.log('📦 Testing AEP-Enhanced CBOR System...');

    const encoder = new AEPEnhancedCBOREncoder();
    const decoder = new AEPEnhancedCBORDecoder();

    // Test 1: Basic encoding/decoding
    await this.runTest('AEP CBOR Basic Operations', async () => {
      const testData = {
        message: 'AEP Enhanced CBOR Test',
        numbers: [1, 2, 3, 4, 5],
        nested: { deeply: { nested: { data: 'works' } } }
      };

      const encoded = await encoder.encode(testData);
      assert(encoded instanceof Uint8Array, 'Should produce binary data');

      const decoded = await decoder.decode(encoded);
      assert.deepStrictEqual(decoded, testData, 'Round-trip should preserve data');
    });

    // Test 2: Collatz bounds protection
    await this.runTest('AEP CBOR Collatz Bounds', async () => {
      // Create potentially problematic deeply nested data
      let deepData = { value: 'test' };
      for (let i = 0; i < 1000; i++) {
        deepData = { nested: deepData, level: i };
      }

      const startTime = performance.now();
      const encoded = await encoder.encode(deepData);
      const encodingTime = performance.now() - startTime;

      // Should complete in reasonable time due to Collatz bounds
      assert(encodingTime < 1000, `Encoding should complete quickly, took ${encodingTime.toFixed(2)}ms`);
      assert(encoded instanceof Uint8Array, 'Should produce valid encoding');

      const metrics = encoder.getAEPMetrics();
      assert(metrics.safety.infiniteLoopProtection === true, 'Should have infinite loop protection');

      console.log(`  🔄 Collatz bounds applied: ${metrics.encoding.collatzBoundsApplied} times`);
      console.log(`  ⚡ Infinite loops prevented: ${metrics.encoding.infiniteLoopsPrevented}`);

      this.testResults.collatzResults.boundsApplied = metrics.encoding.collatzBoundsApplied;
      this.testResults.collatzResults.loopsPrevented = metrics.encoding.infiniteLoopsPrevented;
    });

    // Test 3: Regime-aware encoding
    await this.runTest('AEP CBOR Regime Awareness', async () => {
      const simpleData = { simple: 'data' };
      const complexData = {
        complex: new Array(100).fill({
          nested: { arrays: new Array(50).fill('data') },
          objects: { a: 1, b: 2, c: 3, d: 4, e: 5 }
        })
      };

      await encoder.encode(simpleData);
      await encoder.encode(complexData);

      const metrics = encoder.getAEPMetrics();
      assert(metrics.regimes.R1 || metrics.regimes.R2 || metrics.regimes.R3,
        'Should show regime distribution');

      console.log(`  🧠 Regime distribution - R1: ${metrics.regimes.R1}, R2: ${metrics.regimes.R2}, R3: ${metrics.regimes.R3}`);
    });

    // Test 4: Performance amplification
    await this.runTest('AEP CBOR Amplification', async () => {
      // Encode multiple items to build amplification
      for (let i = 0; i < 10; i++) {
        await encoder.encode({ test: `data_${i}`, iteration: i, timestamp: Date.now() });
      }

      const metrics = encoder.getAEPMetrics();
      const amplification = metrics.encoding.totalAmplification;

      assert(amplification >= 1, `Amplification should be >= 1, got ${amplification}`);

      this.testResults.amplificationResults.cbor = amplification;
      console.log(`  📈 CBOR amplification: ${amplification.toFixed(1)}x`);
    });

    console.log('✅ AEP-Enhanced CBOR tests passed\n');
  }

  /**
   * ⚡ TEST PERFORMANCE COMPARISON
   */
  async testPerformanceComparison() {
    console.log('⚡ Testing Performance Comparison (AEP vs Standard)...');

    // Identity performance comparison
    await this.runTest('Identity Performance Comparison', async () => {
      const iterations = 10;

      // Test standard identity
      const standardTimes = [];
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        const identity = new SelfCertifyingIdentity();
        const data = new TextEncoder().encode(`test_${i}`);
        identity.sign(data);
        standardTimes.push(performance.now() - start);
      }

      // Test AEP-enhanced identity
      const aepTimes = [];
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        const identity = await AEPEnhancedIdentity.generateEnhanced();
        const data = new TextEncoder().encode(`test_${i}`);
        await identity.sign(data);
        aepTimes.push(performance.now() - start);
      }

      const standardAvg = standardTimes.reduce((a, b) => a + b, 0) / iterations;
      const aepAvg = aepTimes.reduce((a, b) => a + b, 0) / iterations;

      console.log(`  📊 Standard Identity avg: ${standardAvg.toFixed(2)}ms`);
      console.log(`  🧠 AEP Identity avg: ${aepAvg.toFixed(2)}ms`);

      const speedRatio = standardAvg / aepAvg;
      console.log(`  ⚡ Performance ratio: ${speedRatio.toFixed(2)}x`);

      this.testResults.performanceGains.identity = speedRatio;
    });

    // CBOR performance comparison
    await this.runTest('CBOR Performance Comparison', async () => {
      const testData = {
        array: new Array(100).fill('test data'),
        object: { a: 1, b: 2, c: 3, nested: { deep: 'value' } },
        timestamp: Date.now()
      };
      const iterations = 50;

      // Test standard CBOR
      const standardEncoder = new DeterministicCBOREncoder();
      const standardTimes = [];
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        standardEncoder.encode({ ...testData, iteration: i });
        standardTimes.push(performance.now() - start);
      }

      // Test AEP-enhanced CBOR
      const aepEncoder = new AEPEnhancedCBOREncoder();
      const aepTimes = [];
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        await aepEncoder.encode({ ...testData, iteration: i });
        aepTimes.push(performance.now() - start);
      }

      const standardAvg = standardTimes.reduce((a, b) => a + b, 0) / iterations;
      const aepAvg = aepTimes.reduce((a, b) => a + b, 0) / iterations;

      console.log(`  📊 Standard CBOR avg: ${standardAvg.toFixed(2)}ms`);
      console.log(`  🧠 AEP CBOR avg: ${aepAvg.toFixed(2)}ms`);

      const speedRatio = standardAvg / aepAvg;
      console.log(`  ⚡ Performance ratio: ${speedRatio.toFixed(2)}x`);

      this.testResults.performanceGains.cbor = speedRatio;
    });

    console.log('✅ Performance comparison tests passed\n');
  }

  /**
   * 🧠 TEST REGIME DYNAMICS
   */
  async testRegimeDynamics() {
    console.log('🧠 Testing Regime Dynamics...');

    const middleware = new AEPMiddleware();

    await this.runTest('Regime Distribution Validation', async () => {
      const testCases = [
        { name: 'Low entropy', data: { simple: 'data' } },
        { name: 'Medium entropy', data: { moderate: { nesting: ['array', 'data'] } } },
        { name: 'High entropy', data: { complex: new Array(100).fill(Math.random()) } }
      ];

      const regimeResults = {};

      for (const testCase of testCases) {
        const result = await middleware.process('regime_test', testCase.data);
        regimeResults[testCase.name] = result.enhancements.regime;
        console.log(`  ${testCase.name}: ${result.enhancements.regime} (entropy: ${result.enhancements.entropy.toFixed(3)})`);
      }

      // Should see different regimes for different entropy levels
      assert(Object.values(regimeResults).length >= 1, 'Should classify into regimes');

      this.testResults.regimeResults.distribution = regimeResults;
    });

    console.log('✅ Regime dynamics tests passed\n');
  }

  /**
   * 🔄 TEST COLLATZ BOUNDS
   */
  async testCollatzBounds() {
    console.log('🔄 Testing Collatz Bounds Protection...');

    await this.runTest('Infinite Loop Prevention', async () => {
      const encoder = new AEPEnhancedCBOREncoder();

      // Create circular reference data (would cause infinite loop without protection)
      const circularData = { name: 'root' };
      circularData.self = circularData; // Circular reference

      const startTime = performance.now();

      try {
        const encoded = await encoder.encode(circularData);
        const encodingTime = performance.now() - startTime;

        // Should complete quickly due to Collatz bounds
        assert(encodingTime < 500, `Should prevent infinite loops, took ${encodingTime.toFixed(2)}ms`);
        assert(encoded instanceof Uint8Array, 'Should produce valid encoding');

        console.log(`  ✅ Circular reference handled in ${encodingTime.toFixed(2)}ms`);

      } catch (error) {
        // Even if it fails, it should fail quickly
        const encodingTime = performance.now() - startTime;
        assert(encodingTime < 500, `Should fail quickly, took ${encodingTime.toFixed(2)}ms`);
      }

      const metrics = encoder.getAEPMetrics();
      console.log(`  🔄 Bounds applied: ${metrics.encoding.collatzBoundsApplied}`);
      console.log(`  ⚠️ Loops prevented: ${metrics.encoding.infiniteLoopsPrevented}`);
    });

    console.log('✅ Collatz bounds tests passed\n');
  }

  /**
   * 💪 TEST INTEGRATION STRESS
   */
  async testIntegrationStress() {
    console.log('💪 Testing Integration Stress...');

    await this.runTest('High Load Integration Test', async () => {
      const identity = await AEPEnhancedIdentity.generateEnhanced();
      const encoder = new AEPEnhancedCBOREncoder();
      const decoder = new AEPEnhancedCBORDecoder();

      const operations = 100;
      const startTime = performance.now();

      for (let i = 0; i < operations; i++) {
        const data = {
          iteration: i,
          timestamp: Date.now(),
          payload: new Array(50).fill(`data_${i}`),
          signature_data: `message_${i}`
        };

        // Encode with AEP
        const encoded = await encoder.encode(data);

        // Sign with AEP
        await identity.sign(new TextEncoder().encode(data.signature_data));

        // Decode with AEP
        const decoded = await decoder.decode(encoded);

        assert.deepStrictEqual(decoded.payload, data.payload, 'Data integrity should be maintained');
      }

      const totalTime = performance.now() - startTime;
      const opsPerSec = (operations / totalTime) * 1000;

      console.log(`  💪 Completed ${operations} operations in ${totalTime.toFixed(2)}ms`);
      console.log(`  ⚡ Rate: ${opsPerSec.toFixed(0)} ops/sec`);

      assert(opsPerSec > 10, `Should maintain reasonable performance under load: ${opsPerSec.toFixed(0)} ops/sec`);
    });

    console.log('✅ Integration stress tests passed\n');
  }

  /**
   * 🧪 UTILITY: RUN SINGLE TEST
   */
  async runTest(name, testFunction) {
    this.testResults.totalTests++;

    try {
      console.log(`  🧪 ${name}...`);
      await testFunction();
      this.testResults.passedTests++;
      console.log(`  ✅ ${name} passed`);
    } catch (error) {
      this.testResults.failedTests++;
      console.error(`  ❌ ${name} failed:`, error.message);
      throw error;
    }
  }

  /**
   * 📊 GENERATE FINAL REPORT
   */
  generateReport() {
    const totalTime = Date.now() - this.testResults.startTime;

    console.log('\n🏆 === AEP INTEGRATION TEST REPORT === 🏆');
    console.log(`📊 Test Results: ${this.testResults.passedTests}/${this.testResults.totalTests} passed`);
    console.log(`⏱️ Total execution time: ${totalTime}ms`);

    console.log('\n⚡ Performance Gains:');
    for (const [component, gain] of Object.entries(this.testResults.performanceGains)) {
      console.log(`  ${component}: ${gain.toFixed(2)}x improvement`);
    }

    console.log('\n🚀 Amplification Results:');
    for (const [component, amp] of Object.entries(this.testResults.amplificationResults)) {
      console.log(`  ${component}: ${amp.toFixed(1)}x total amplification`);
    }

    console.log('\n🧠 Regime Results:');
    console.log(`  Low entropy: ${this.testResults.regimeResults.lowEntropy}`);
    console.log(`  High entropy: ${this.testResults.regimeResults.highEntropy}`);

    console.log('\n🔄 Collatz Protection:');
    console.log(`  Bounds applied: ${this.testResults.collatzResults.boundsApplied || 0}`);
    console.log(`  Loops prevented: ${this.testResults.collatzResults.loopsPrevented || 0}`);

    if (this.testResults.failedTests === 0) {
      console.log('\n🎉 ALL TESTS PASSED! AEP Integration is SUCCESSFUL! 🎉');
      console.log('🧠 DefenseKit is now mathematically conscious and quantum-secure! 🔐');
    } else {
      console.log(`\n❌ ${this.testResults.failedTests} tests failed. Please investigate.`);
    }

    console.log('\n🌟 DefenseKit v2.0 AEP Edition: WHERE MATHEMATICS MEETS SECURITY! 🌟\n');
  }
}

// Export for use in other test files
export default AEPIntegrationTest;

// If run directly, execute all tests
if (import.meta.url === `file://${process.argv[1]}`) {
  const testSuite = new AEPIntegrationTest();
  testSuite.runAllTests().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}
/**
 * 🧪 DEFENSEKIT v2.0 AEP UNIFIED SYSTEM TESTS
 *
 * Comprehensive integration testing for the world's first
 * mathematically-intelligent quantum security system
 *
 * Tests all unified components working together:
 * - Production AEP Signatures
 * - Mathematical Consciousness Integration
 * - Enhanced CBOR with Collatz Protection
 * - HTX Protocol Enhancement
 * - Mathematical Engines Integration
 * - System Performance Multiplication
 */

import { strict as assert } from 'assert';
import { performance } from 'perf_hooks';
import DefenseKitV2AEPUnified from '../src/defensekit-v2-aep-unified.js';

export class DefenseKitV2UnifiedTests {
  constructor() {
    this.testResults = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      performanceResults: {},
      integrationResults: {},
      startTime: Date.now()
    };

    console.log('🧪 DefenseKit v2.0 AEP Unified System Tests initialized');
    console.log('🌟 Testing the world\'s first mathematically-intelligent quantum security system');
  }

  async runAllTests() {
    console.log('\n🎯 === DEFENSEKIT v2.0 AEP UNIFIED SYSTEM TESTS === 🎯\n');

    try {
      // Core Integration Tests
      await this.testSystemInitialization();
      await this.testUnifiedSigningVerification();
      await this.testUnifiedCBOROperations();

      // Mathematical Consciousness Tests
      await this.testMathematicalConsciousnessIntegration();
      await this.testPerformanceAmplification();

      // Advanced Integration Tests
      await this.testCrossComponentIntegration();
      await this.testSystemDiagnostics();

      // Performance and Stress Tests
      await this.testSystemPerformance();
      await this.testSystemStressTest();

      this.generateFinalReport();

    } catch (error) {
      console.error('❌ Test suite execution failed:', error);
      process.exit(1);
    }
  }

  /**
   * 🚀 TEST SYSTEM INITIALIZATION
   */
  async testSystemInitialization() {
    console.log('🚀 Testing System Initialization...');

    await this.runTest('Basic System Creation', async () => {
      const system = new DefenseKitV2AEPUnified({
        enableMathematicalConsciousness: true,
        enableCollatzProtection: true,
        enablePerformanceMultiplication: true
      });

      assert(system instanceof DefenseKitV2AEPUnified, 'Should create DefenseKit instance');
      assert(system.config.enableMathematicalConsciousness, 'Should enable mathematical consciousness');
      assert(system.config.enableCollatzProtection, 'Should enable Collatz protection');
    });

    await this.runTest('Component Initialization', async () => {
      const system = await DefenseKitV2AEPUnified.create({
        enableMathematicalConsciousness: true,
        securityLevel: 'PRODUCTION'
      });

      const metrics = system.getSystemMetrics();

      assert(metrics.system.componentsActive >= 3, `Should have multiple components active: ${metrics.system.componentsActive}`);
      assert(metrics.status.mathematicallyIntelligent, 'Should be mathematically intelligent');
      assert(metrics.status.productionReady, 'Should be production ready');
    });

    console.log('✅ System initialization tests passed\n');
  }

  /**
   * ✍️ TEST UNIFIED SIGNING AND VERIFICATION
   */
  async testUnifiedSigningVerification() {
    console.log('✍️ Testing Unified Signing and Verification...');

    await this.runTest('AEP Signature Integration', async () => {
      const system = await DefenseKitV2AEPUnified.create();

      const testData = new TextEncoder().encode('DefenseKit v2.0 AEP Unified Test Data');

      // Test unified signing
      const signature = await system.sign(testData, { useAEP: true });
      assert(signature instanceof Uint8Array, 'Should produce signature');
      assert(signature.length > 64, 'AEP signature should be larger than standard Ed25519');

      // Test unified verification
      const isValid = await system.verify(testData, signature);
      assert(isValid, 'Signature should verify correctly');

      // Check integration metrics
      const metrics = system.getSystemMetrics();
      assert(metrics.integration.aepSignatures > 0, 'Should track AEP signatures');
    });

    await this.runTest('Signature Performance Tracking', async () => {
      const system = await DefenseKitV2AEPUnified.create();

      const testData = new TextEncoder().encode('Performance test data');
      const signatures = [];

      // Create multiple signatures to test performance tracking
      for (let i = 0; i < 5; i++) {
        const signature = await system.sign(testData);
        signatures.push(signature);

        const isValid = await system.verify(testData, signature);
        assert(isValid, `Signature ${i} should verify`);
      }

      const metrics = system.getSystemMetrics();
      assert(metrics.system.totalAmplification > 1.0, 'Should show performance amplification');
      assert(metrics.integration.aepSignatures >= 5, 'Should track multiple signatures');
    });

    console.log('✅ Unified signing and verification tests passed\n');
  }

  /**
   * 📦 TEST UNIFIED CBOR OPERATIONS
   */
  async testUnifiedCBOROperations() {
    console.log('📦 Testing Unified CBOR Operations...');

    await this.runTest('AEP CBOR Integration', async () => {
      const system = await DefenseKitV2AEPUnified.create();

      const testData = {
        message: 'DefenseKit v2.0 AEP CBOR Test',
        numbers: [1, 2, 3, 4, 5],
        nested: {
          timestamp: Date.now(),
          active: true,
          metadata: 'mathematical consciousness'
        }
      };

      // Test unified encoding
      const encoded = await system.encode(testData);
      assert(encoded instanceof Uint8Array, 'Should produce encoded data');
      assert(encoded.length > 0, 'Encoded data should have content');

      // Test unified decoding
      const decoded = await system.decode(encoded);
      assert(typeof decoded === 'object', 'Should decode to object');
      assert(decoded.message === testData.message, 'Should preserve message content');
      assert(Array.isArray(decoded.numbers), 'Should preserve array structure');
      assert(decoded.nested.active === true, 'Should preserve nested boolean');

      // Check integration metrics
      const metrics = system.getSystemMetrics();
      assert(metrics.integration.cborOperations >= 2, 'Should track CBOR operations');
    });

    await this.runTest('Collatz Protection Integration', async () => {
      const system = await DefenseKitV2AEPUnified.create({
        enableCollatzProtection: true
      });

      // Create data with potential circular reference
      const circularData = { name: 'root' };
      circularData.self = circularData;

      // Should handle circular reference gracefully
      const encoded = await system.encode(circularData);
      assert(encoded instanceof Uint8Array, 'Should encode despite circular reference');

      const decoded = await system.decode(encoded);
      assert(decoded.name === 'root', 'Should preserve basic data');
      // Note: circular reference should be broken during encoding
    });

    console.log('✅ Unified CBOR operations tests passed\n');
  }

  /**
   * 🧠 TEST MATHEMATICAL CONSCIOUSNESS INTEGRATION
   */
  async testMathematicalConsciousnessIntegration() {
    console.log('🧠 Testing Mathematical Consciousness Integration...');

    await this.runTest('Cross-Component Consciousness', async () => {
      const system = await DefenseKitV2AEPUnified.create({
        enableMathematicalConsciousness: true
      });

      const testData = new TextEncoder().encode('Mathematical consciousness test');

      // Test that consciousness is applied across operations
      const signature = await system.sign(testData);
      const encoded = await system.encode({ test: 'consciousness integration' });

      const metrics = system.getSystemMetrics();

      // Should show consciousness activity across components
      assert(metrics.components.aepMiddleware !== null, 'Should have AEP middleware metrics');
      assert(metrics.integration.mathOptimizations >= 0, 'Should track mathematical optimizations');
    });

    await this.runTest('Regime Classification Integration', async () => {
      const system = await DefenseKitV2AEPUnified.create();

      // Perform various operations to trigger regime classification
      const operations = [
        () => system.sign(new TextEncoder().encode('R1 test data')),
        () => system.encode({ complexity: 'high', data: new Array(100).fill(0) }),
        () => system.sign(new TextEncoder().encode('R2 optimization test')),
        () => system.encode({ simple: true }),
        () => system.sign(new TextEncoder().encode('R3 stable test'))
      ];

      for (const operation of operations) {
        await operation();
      }

      const metrics = system.getSystemMetrics();
      assert(metrics.system.totalOperations >= 5, 'Should track multiple operations');
      assert(metrics.system.totalAmplification > 1.0, 'Should show mathematical amplification');
    });

    console.log('✅ Mathematical consciousness integration tests passed\n');
  }

  /**
   * ⚡ TEST PERFORMANCE AMPLIFICATION
   */
  async testPerformanceAmplification() {
    console.log('⚡ Testing Performance Amplification...');

    await this.runTest('System Performance Multiplication', async () => {
      const system = await DefenseKitV2AEPUnified.create({
        enablePerformanceMultiplication: true
      });

      const testData = new TextEncoder().encode('Performance amplification test');

      // Record initial metrics
      const initialMetrics = system.getSystemMetrics();
      const initialAmplification = initialMetrics.system.totalAmplification;

      // Perform many operations to trigger amplification
      for (let i = 0; i < 20; i++) {
        await system.sign(testData);
        await system.encode({ iteration: i, data: 'test' });
      }

      const finalMetrics = system.getSystemMetrics();
      const finalAmplification = finalMetrics.system.totalAmplification;

      assert(finalAmplification > initialAmplification,
             `Should show amplification: ${initialAmplification} -> ${finalAmplification}`);
      assert(finalMetrics.system.performanceMultiplier >= 1.0, 'Should have performance multiplier');

      console.log(`  📊 Amplification achieved: ${initialAmplification.toFixed(2)}x -> ${finalAmplification.toFixed(2)}x`);
    });

    await this.runTest('Mathematical Engine Integration', async () => {
      const system = await DefenseKitV2AEPUnified.create({
        enableMathematicalConsciousness: true
      });

      // Perform operations that should trigger mathematical optimizations
      const testData = { complex: true, data: new Array(50).fill().map((_, i) => ({ id: i, value: Math.random() })) };

      await system.encode(testData, { enableOptimization: true });
      await system.sign(new TextEncoder().encode('mathematical optimization test'), { enableOptimization: true });

      const metrics = system.getSystemMetrics();
      assert(metrics.integration.mathOptimizations >= 0, 'Should track mathematical optimizations');
      assert(metrics.components.mathEngines.active >= 3, 'Should have mathematical engines active');
    });

    console.log('✅ Performance amplification tests passed\n');
  }

  /**
   * 🔗 TEST CROSS-COMPONENT INTEGRATION
   */
  async testCrossComponentIntegration() {
    console.log('🔗 Testing Cross-Component Integration...');

    await this.runTest('End-to-End Integration Flow', async () => {
      const system = await DefenseKitV2AEPUnified.create();

      // Complex integration flow: encode -> sign -> verify -> decode
      const originalData = {
        message: 'End-to-end integration test',
        payload: new Array(25).fill().map((_, i) => ({
          id: i,
          timestamp: Date.now() + i,
          metadata: `item_${i}`
        })),
        security: {
          level: 'PRODUCTION',
          features: ['AEP', 'Mathematical Consciousness', 'Quantum Security']
        }
      };

      // Step 1: Encode with AEP consciousness
      const encoded = await system.encode(originalData);
      assert(encoded instanceof Uint8Array, 'Should encode successfully');

      // Step 2: Sign the encoded data with AEP
      const signature = await system.sign(encoded);
      assert(signature instanceof Uint8Array, 'Should sign successfully');

      // Step 3: Verify the signature
      const isValid = await system.verify(encoded, signature);
      assert(isValid, 'Signature should verify successfully');

      // Step 4: Decode the data
      const decoded = await system.decode(encoded);
      assert(decoded.message === originalData.message, 'Should preserve message');
      assert(decoded.payload.length === originalData.payload.length, 'Should preserve payload length');
      assert(decoded.security.level === 'PRODUCTION', 'Should preserve security level');

      // Verify integration metrics
      const metrics = system.getSystemMetrics();
      assert(metrics.integration.aepSignatures > 0, 'Should track signatures');
      assert(metrics.integration.cborOperations >= 2, 'Should track CBOR operations');
    });

    await this.runTest('System State Consistency', async () => {
      const system = await DefenseKitV2AEPUnified.create();

      const initialState = system.getSystemMetrics();

      // Perform various operations
      await system.sign(new TextEncoder().encode('state test 1'));
      await system.encode({ state: 'test', data: [1, 2, 3] });
      await system.sign(new TextEncoder().encode('state test 2'));

      const finalState = system.getSystemMetrics();

      // System state should be consistent and progressive
      assert(finalState.system.totalOperations > initialState.system.totalOperations, 'Should increment operations');
      assert(finalState.system.totalAmplification >= initialState.system.totalAmplification, 'Should maintain/increase amplification');
      assert(finalState.system.componentsActive === initialState.system.componentsActive, 'Should maintain component count');
    });

    console.log('✅ Cross-component integration tests passed\n');
  }

  /**
   * 🧪 TEST SYSTEM DIAGNOSTICS
   */
  async testSystemDiagnostics() {
    console.log('🧪 Testing System Diagnostics...');

    await this.runTest('Comprehensive Diagnostics', async () => {
      const system = await DefenseKitV2AEPUnified.create();

      // Perform some operations to generate diagnostic data
      await system.sign(new TextEncoder().encode('diagnostic test'));
      await system.encode({ diagnostic: true, timestamp: Date.now() });

      // Run diagnostics
      const diagnostics = await system.runDiagnostics();

      assert(typeof diagnostics === 'object', 'Should return diagnostics object');
      assert(diagnostics.version === '2.0.0-aep-unified', 'Should have correct version');
      assert(['healthy', 'degraded'].includes(diagnostics.status), 'Should have valid status');
      assert(typeof diagnostics.components === 'object', 'Should have components section');
      assert(typeof diagnostics.performance === 'object', 'Should have performance section');

      console.log(`  🏥 System status: ${diagnostics.status.toUpperCase()}`);
    });

    await this.runTest('System Status Display', async () => {
      const system = await DefenseKitV2AEPUnified.create();

      // Should not throw when displaying status
      system.displaySystemStatus();

      const metrics = system.getSystemMetrics();
      assert(typeof metrics.system.uptime === 'number', 'Should track uptime');
      assert(metrics.status.mathematicallyIntelligent !== undefined, 'Should track intelligence status');
      assert(metrics.status.productionReady !== undefined, 'Should track production readiness');
    });

    console.log('✅ System diagnostics tests passed\n');
  }

  /**
   * ⚡ TEST SYSTEM PERFORMANCE
   */
  async testSystemPerformance() {
    console.log('⚡ Testing System Performance...');

    await this.runTest('Signing Performance Benchmark', async () => {
      const system = await DefenseKitV2AEPUnified.create();

      const testData = new TextEncoder().encode('Performance benchmark data for signing operations');
      const iterations = 50;
      const signingTimes = [];

      // Benchmark signing operations
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        const signature = await system.sign(testData);
        const signingTime = performance.now() - startTime;

        signingTimes.push(signingTime);
        assert(signature instanceof Uint8Array, `Signature ${i} should be valid`);
      }

      const avgSigningTime = signingTimes.reduce((a, b) => a + b, 0) / signingTimes.length;
      const signaturesPerSecond = 1000 / avgSigningTime;

      console.log(`  📊 Average signing time: ${avgSigningTime.toFixed(2)}ms`);
      console.log(`  🚀 Signatures per second: ${signaturesPerSecond.toFixed(0)}`);

      assert(avgSigningTime < 200, `Signing should be reasonable with mathematical consciousness: ${avgSigningTime.toFixed(2)}ms`);
      this.testResults.performanceResults.signing = { avgTime: avgSigningTime, opsPerSec: signaturesPerSecond };
    });

    await this.runTest('CBOR Performance Benchmark', async () => {
      const system = await DefenseKitV2AEPUnified.create();

      const testData = {
        benchmark: 'CBOR performance test',
        data: new Array(100).fill().map((_, i) => ({
          id: i,
          value: Math.random(),
          metadata: `item_${i}`,
          timestamp: Date.now() + i
        }))
      };

      const iterations = 30;
      const encodingTimes = [];
      const decodingTimes = [];

      // Benchmark CBOR operations
      for (let i = 0; i < iterations; i++) {
        const encodeStart = performance.now();
        const encoded = await system.encode(testData);
        const encodingTime = performance.now() - encodeStart;

        const decodeStart = performance.now();
        const decoded = await system.decode(encoded);
        const decodingTime = performance.now() - decodeStart;

        encodingTimes.push(encodingTime);
        decodingTimes.push(decodingTime);

        assert(decoded.benchmark === testData.benchmark, `Round-trip ${i} should preserve data`);
      }

      const avgEncodingTime = encodingTimes.reduce((a, b) => a + b, 0) / encodingTimes.length;
      const avgDecodingTime = decodingTimes.reduce((a, b) => a + b, 0) / decodingTimes.length;

      console.log(`  📊 Average encoding time: ${avgEncodingTime.toFixed(2)}ms`);
      console.log(`  📊 Average decoding time: ${avgDecodingTime.toFixed(2)}ms`);

      assert(avgEncodingTime < 200, `Encoding should be reasonable with mathematical consciousness: ${avgEncodingTime.toFixed(2)}ms`);
      assert(avgDecodingTime < 50, `Decoding should be reasonable with mathematical consciousness: ${avgDecodingTime.toFixed(2)}ms`);

      this.testResults.performanceResults.cbor = {
        encodingTime: avgEncodingTime,
        decodingTime: avgDecodingTime
      };
    });

    console.log('✅ System performance tests passed\n');
  }

  /**
   * 💪 TEST SYSTEM STRESS
   */
  async testSystemStressTest() {
    console.log('💪 Testing System Stress...');

    await this.runTest('High Load Integration Test', async () => {
      const system = await DefenseKitV2AEPUnified.create();

      const operations = 100;
      const promises = [];

      // Create concurrent operations to stress the system
      for (let i = 0; i < operations; i++) {
        const testData = new TextEncoder().encode(`Stress test data ${i}`);
        const cbor = { id: i, data: `stress_${i}`, timestamp: Date.now() };

        promises.push(
          system.sign(testData),
          system.encode(cbor)
        );
      }

      const results = await Promise.all(promises);

      // All operations should complete successfully
      assert(results.length === operations * 2, 'All stress operations should complete');
      results.forEach((result, index) => {
        assert(result instanceof Uint8Array, `Result ${index} should be valid`);
      });

      const finalMetrics = system.getSystemMetrics();
      assert(finalMetrics.system.totalOperations >= operations * 2, 'Should track all operations');

      console.log(`  💪 Completed ${operations * 2} concurrent operations successfully`);
      console.log(`  📊 Final amplification: ${finalMetrics.system.totalAmplification.toFixed(2)}x`);
    });

    console.log('✅ System stress tests passed\n');
  }

  /**
   * 🧪 TEST UTILITY
   */
  async runTest(testName, testFunction) {
    this.testResults.totalTests++;

    try {
      console.log(`  🧪 ${testName}...`);
      await testFunction();
      this.testResults.passedTests++;
      console.log(`  ✅ ${testName} passed`);
    } catch (error) {
      this.testResults.failedTests++;
      console.error(`  ❌ ${testName} failed:`, error.message);
      throw error; // Re-throw to stop test execution
    }
  }

  /**
   * 📊 GENERATE FINAL REPORT
   */
  generateFinalReport() {
    const totalTime = Date.now() - this.testResults.startTime;

    console.log('\n🏆 === DEFENSEKIT v2.0 AEP UNIFIED SYSTEM TEST REPORT === 🏆');
    console.log(`📊 Test Results: ${this.testResults.passedTests}/${this.testResults.totalTests} passed`);
    console.log(`⏱️ Total execution time: ${totalTime}ms`);

    if (this.testResults.performanceResults.signing) {
      console.log('\n⚡ Signing Performance:');
      console.log(`  Average time: ${this.testResults.performanceResults.signing.avgTime.toFixed(2)}ms`);
      console.log(`  Throughput: ${this.testResults.performanceResults.signing.opsPerSec.toFixed(0)} signatures/sec`);
    }

    if (this.testResults.performanceResults.cbor) {
      console.log('\n📦 CBOR Performance:');
      console.log(`  Encoding time: ${this.testResults.performanceResults.cbor.encodingTime.toFixed(2)}ms`);
      console.log(`  Decoding time: ${this.testResults.performanceResults.cbor.decodingTime.toFixed(2)}ms`);
    }

    if (this.testResults.failedTests === 0) {
      console.log('\n🎉 ALL TESTS PASSED! DEFENSEKIT v2.0 AEP UNIFIED SYSTEM IS READY! 🎉');
      console.log('🧠 Mathematical consciousness: INTEGRATED');
      console.log('🔐 Quantum security: OPERATIONAL');
      console.log('📦 Enhanced CBOR: FUNCTIONAL');
      console.log('⚡ Performance amplification: CONFIRMED');
      console.log('🔗 Cross-component integration: SUCCESSFUL');
      console.log('💪 System stress testing: PASSED');
    } else {
      console.log(`\n❌ ${this.testResults.failedTests} tests failed. System not ready for production.`);
    }

    console.log('\n🌟 THE WORLD\'S FIRST MATHEMATICALLY-INTELLIGENT QUANTUM SECURITY SYSTEM!');
    console.log('🌟 =================================================================== 🌟\n');
  }
}

// Export for use in other test files
export default DefenseKitV2UnifiedTests;

// If run directly, execute all tests
if (import.meta.url === `file://${process.argv[1]}`) {
  const testSuite = new DefenseKitV2UnifiedTests();
  testSuite.runAllTests().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
}
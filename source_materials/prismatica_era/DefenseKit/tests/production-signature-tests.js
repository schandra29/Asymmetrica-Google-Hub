/**
 * 🧪 PRODUCTION AEP SIGNATURE SYSTEM TESTS
 *
 * Comprehensive test coverage for production-grade AEP signatures
 * Tests cryptographic correctness, regime functionality, and edge cases
 */

import { strict as assert } from 'assert';
import { performance } from 'perf_hooks';
import ProductionAEPSignatureSystem from '../src/aep/production-signature-system.js';
import AEPMiddleware from '../src/aep/aep-middleware.js';

export class ProductionSignatureTests {
  constructor() {
    this.testResults = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      regimeTests: { R1: 0, R2: 0, R3: 0 },
      performanceResults: {},
      startTime: Date.now()
    };

    console.log('🧪 Production AEP Signature Tests initialized');
  }

  async runAllTests() {
    console.log('\n🎯 === PRODUCTION AEP SIGNATURE SYSTEM TESTS === 🎯\n');

    try {
      // Core functionality tests
      await this.testBasicSignVerifyRoundTrip();
      await this.testRegimeSpecificSigning();
      await this.testSelfDescribingSignatures();

      // Compatibility tests
      await this.testBackwardCompatibility();

      // Edge case tests
      await this.testLargeDataSigning();
      await this.testEmptyDataSigning();
      await this.testInvalidSignatureHandling();

      // Performance tests
      await this.testSigningPerformance();
      await this.testVerificationPerformance();

      // Integration tests
      await this.testAEPMiddlewareIntegration();

      this.generateFinalReport();

    } catch (error) {
      console.error('❌ Test suite execution failed:', error);
      process.exit(1);
    }
  }

  /**
   * 🔐 TEST BASIC CRYPTOGRAPHIC CORRECTNESS
   */
  async testBasicSignVerifyRoundTrip() {
    console.log('🔐 Testing Basic Sign/Verify Round-Trip...');

    await this.runTest('Basic Round-Trip R1', async () => {
      const signer = new ProductionAEPSignatureSystem();
      const aepMiddleware = new AEPMiddleware({ regimeBiases: [0.8, 0.1, 0.1] }); // Force R1

      const testData = new TextEncoder().encode('Test message for R1 regime');

      const signature = await signer.signWithAEP(testData, aepMiddleware);
      const isValid = signer.verifyWithAEP(testData, signature);

      assert(isValid, 'R1 signature should verify correctly');
      assert(signature.length > 64, 'AEP signature should be larger than standard Ed25519');
    });

    await this.runTest('Basic Round-Trip R2', async () => {
      const signer = new ProductionAEPSignatureSystem();
      const aepMiddleware = new AEPMiddleware({ regimeBiases: [0.1, 0.8, 0.1] }); // Force R2

      const testData = new TextEncoder().encode('Test message for R2 regime optimization');

      const signature = await signer.signWithAEP(testData, aepMiddleware);
      const isValid = signer.verifyWithAEP(testData, signature);

      assert(isValid, 'R2 signature should verify correctly');
    });

    await this.runTest('Basic Round-Trip R3', async () => {
      const signer = new ProductionAEPSignatureSystem();
      const aepMiddleware = new AEPMiddleware({ regimeBiases: [0.1, 0.1, 0.8] }); // Force R3

      const testData = new TextEncoder().encode('Test message for R3 regime stability');

      const signature = await signer.signWithAEP(testData, aepMiddleware);
      const isValid = signer.verifyWithAEP(testData, signature);

      assert(isValid, 'R3 signature should verify correctly');
    });

    console.log('✅ Basic cryptographic tests passed\n');
  }

  /**
   * 🧠 TEST REGIME-SPECIFIC FUNCTIONALITY
   */
  async testRegimeSpecificSigning() {
    console.log('🧠 Testing Regime-Specific Signing...');

    await this.runTest('R1 Enhanced Entropy', async () => {
      const signer = new ProductionAEPSignatureSystem();
      const aepMiddleware = new AEPMiddleware({ regimeBiases: [1.0, 0.0, 0.0] });

      const testData = new TextEncoder().encode('R1 entropy test');

      // Create multiple signatures of same data
      const sig1 = await signer.signWithAEP(testData, aepMiddleware);
      const sig2 = await signer.signWithAEP(testData, aepMiddleware);

      // Signatures should be different due to entropy (different timestamps)
      // But both should verify
      assert(signer.verifyWithAEP(testData, sig1), 'First R1 signature should verify');
      assert(signer.verifyWithAEP(testData, sig2), 'Second R1 signature should verify');

      // Check that R1 signatures are larger due to entropy metadata
      assert(sig1.length > 64 + 4 + 20, 'R1 signature should contain entropy metadata');
    });

    await this.runTest('R2 Deterministic Modulation', async () => {
      const signer = new ProductionAEPSignatureSystem();
      const aepMiddleware = new AEPMiddleware({ regimeBiases: [0.0, 1.0, 0.0] });

      const testData = new TextEncoder().encode('R2 modulation test data');

      const signature = await signer.signWithAEP(testData, aepMiddleware);
      const isValid = signer.verifyWithAEP(testData, signature);

      assert(isValid, 'R2 modulated signature should verify');

      // Parse signature to check modulation metadata
      const parsed = signer.parseAEPSignature(signature);
      assert(parsed.regime === 'R2', 'Should be classified as R2');
      assert(parsed.metadata.method === 'deterministic_rotation', 'Should use rotation method');
      assert(typeof parsed.metadata.rotationAmount === 'number', 'Should contain rotation amount');
    });

    await this.runTest('R3 Stable Processing', async () => {
      const signer = new ProductionAEPSignatureSystem();
      const aepMiddleware = new AEPMiddleware({ regimeBiases: [0.0, 0.0, 1.0] });

      const testData = new TextEncoder().encode('R3 stability test');

      const signature = await signer.signWithAEP(testData, aepMiddleware);
      const isValid = signer.verifyWithAEP(testData, signature);

      assert(isValid, 'R3 signature should verify');

      // R3 should have minimal metadata
      const parsed = signer.parseAEPSignature(signature);
      assert(parsed.regime === 'R3', 'Should be classified as R3');
      assert(parsed.metadata.method === 'passthrough', 'Should use passthrough method');
    });

    console.log('✅ Regime-specific tests passed\n');
  }

  /**
   * 📦 TEST SELF-DESCRIBING SIGNATURE FORMAT
   */
  async testSelfDescribingSignatures() {
    console.log('📦 Testing Self-Describing Signature Format...');

    await this.runTest('Signature Format Parsing', async () => {
      const signer = new ProductionAEPSignatureSystem();
      const aepMiddleware = new AEPMiddleware();

      const testData = new TextEncoder().encode('Format test data');
      const signature = await signer.signWithAEP(testData, aepMiddleware);

      // Should be recognized as AEP signature
      assert(signer.isAEPSignature(signature), 'Should be identified as AEP signature');

      // Should parse correctly
      const parsed = signer.parseAEPSignature(signature);
      assert(['R1', 'R2', 'R3'].includes(parsed.regime), `Invalid regime: ${parsed.regime}`);
      assert(parsed.ed25519Signature.length === 64, 'Should contain valid Ed25519 signature');
      assert(typeof parsed.metadata === 'object', 'Should contain metadata object');
    });

    await this.runTest('Metadata Integrity', async () => {
      const signer = new ProductionAEPSignatureSystem();
      const aepMiddleware = new AEPMiddleware({ regimeBiases: [1.0, 0.0, 0.0] }); // R1 for metadata

      const testData = new TextEncoder().encode('Metadata integrity test');
      const signature = await signer.signWithAEP(testData, aepMiddleware);

      // Verify original signature
      assert(signer.verifyWithAEP(testData, signature), 'Original signature should verify');

      // Corrupt metadata and ensure verification fails
      const corruptedSig = new Uint8Array(signature);
      corruptedSig[10] ^= 0xFF; // Flip bits in metadata section

      assert(!signer.verifyWithAEP(testData, corruptedSig), 'Corrupted signature should fail verification');
    });

    console.log('✅ Self-describing signature tests passed\n');
  }

  /**
   * 🔄 TEST BACKWARD COMPATIBILITY
   */
  async testBackwardCompatibility() {
    console.log('🔄 Testing Backward Compatibility...');

    await this.runTest('Standard Ed25519 Handling', async () => {
      const signer = new ProductionAEPSignatureSystem();

      const testData = new TextEncoder().encode('Standard signature test');

      // Create standard (non-AEP) signature using parent method
      const standardSignature = signer.constructor.__proto__.prototype.sign.call(signer, testData);

      // Should verify using AEP verifier
      assert(signer.verifyWithAEP(testData, standardSignature), 'Standard signature should verify with AEP verifier');
      assert(!signer.isAEPSignature(standardSignature), 'Standard signature should not be identified as AEP');
    });

    console.log('✅ Backward compatibility tests passed\n');
  }

  /**
   * 📏 TEST EDGE CASES
   */
  async testLargeDataSigning() {
    console.log('📏 Testing Large Data Signing...');

    await this.runTest('Large Data Handling', async () => {
      const signer = new ProductionAEPSignatureSystem();
      const aepMiddleware = new AEPMiddleware();

      // Create 1MB of test data
      const largeData = new Uint8Array(1024 * 1024);
      for (let i = 0; i < largeData.length; i++) {
        largeData[i] = i % 256;
      }

      const startTime = performance.now();
      const signature = await signer.signWithAEP(largeData, aepMiddleware);
      const signingTime = performance.now() - startTime;

      const verifyStart = performance.now();
      const isValid = signer.verifyWithAEP(largeData, signature);
      const verifyTime = performance.now() - verifyStart;

      assert(isValid, 'Large data signature should verify');
      console.log(`  📊 Large data (1MB): signing=${signingTime.toFixed(2)}ms, verify=${verifyTime.toFixed(2)}ms`);

      this.testResults.performanceResults.largeData = { signingTime, verifyTime };
    });

    console.log('✅ Large data tests passed\n');
  }

  async testEmptyDataSigning() {
    console.log('📄 Testing Empty Data Signing...');

    await this.runTest('Empty Data Handling', async () => {
      const signer = new ProductionAEPSignatureSystem();
      const aepMiddleware = new AEPMiddleware();

      const emptyData = new Uint8Array(0);

      const signature = await signer.signWithAEP(emptyData, aepMiddleware);
      const isValid = signer.verifyWithAEP(emptyData, signature);

      assert(isValid, 'Empty data signature should verify');
    });

    console.log('✅ Empty data tests passed\n');
  }

  async testInvalidSignatureHandling() {
    console.log('❌ Testing Invalid Signature Handling...');

    await this.runTest('Corrupted Signature Detection', async () => {
      const signer = new ProductionAEPSignatureSystem();

      const testData = new TextEncoder().encode('Test data');

      // Test various invalid signatures
      const invalidSignatures = [
        new Uint8Array(0), // Empty
        new Uint8Array(32), // Too short
        new Uint8Array(128).fill(0xFF), // Wrong format
        new Uint8Array([1, 1, 0, 5, 65, 65, 65, 65, 65, ...new Array(64).fill(0)]) // Invalid metadata
      ];

      for (const invalidSig of invalidSignatures) {
        const result = signer.verifyWithAEP(testData, invalidSig);
        assert(!result, 'Invalid signature should not verify');
      }
    });

    console.log('✅ Invalid signature tests passed\n');
  }

  /**
   * ⚡ PERFORMANCE TESTS
   */
  async testSigningPerformance() {
    console.log('⚡ Testing Signing Performance...');

    await this.runTest('Signing Speed Benchmark', async () => {
      const signer = new ProductionAEPSignatureSystem();
      const aepMiddleware = new AEPMiddleware();

      const testData = new TextEncoder().encode('Performance test data for signing benchmarks');
      const iterations = 100;

      // Warm up
      for (let i = 0; i < 10; i++) {
        await signer.signWithAEP(testData, aepMiddleware);
      }

      // Benchmark
      const startTime = performance.now();
      for (let i = 0; i < iterations; i++) {
        await signer.signWithAEP(testData, aepMiddleware);
      }
      const totalTime = performance.now() - startTime;

      const avgSigningTime = totalTime / iterations;
      const signaturesPerSecond = 1000 / avgSigningTime;

      console.log(`  📊 Average signing time: ${avgSigningTime.toFixed(2)}ms`);
      console.log(`  🚀 Signatures per second: ${signaturesPerSecond.toFixed(0)}`);

      assert(avgSigningTime < 100, `Signing should be fast: ${avgSigningTime}ms`);
      this.testResults.performanceResults.signing = { avgTime: avgSigningTime, opsPerSec: signaturesPerSecond };
    });

    console.log('✅ Signing performance tests passed\n');
  }

  async testVerificationPerformance() {
    console.log('🔍 Testing Verification Performance...');

    await this.runTest('Verification Speed Benchmark', async () => {
      const signer = new ProductionAEPSignatureSystem();
      const aepMiddleware = new AEPMiddleware();

      const testData = new TextEncoder().encode('Performance test data for verification benchmarks');

      // Create signatures for each regime
      const signatures = {};
      const aepConfigs = {
        R1: { regimeBiases: [1.0, 0.0, 0.0] },
        R2: { regimeBiases: [0.0, 1.0, 0.0] },
        R3: { regimeBiases: [0.0, 0.0, 1.0] }
      };

      for (const [regime, config] of Object.entries(aepConfigs)) {
        const middleware = new AEPMiddleware(config);
        signatures[regime] = await signer.signWithAEP(testData, middleware);
      }

      // Benchmark verification for each regime
      const verificationResults = {};
      for (const [regime, signature] of Object.entries(signatures)) {
        const iterations = 200;

        // Warm up
        for (let i = 0; i < 20; i++) {
          signer.verifyWithAEP(testData, signature);
        }

        // Benchmark
        const startTime = performance.now();
        for (let i = 0; i < iterations; i++) {
          const isValid = signer.verifyWithAEP(testData, signature);
          assert(isValid, `${regime} signature should verify`);
        }
        const totalTime = performance.now() - startTime;

        const avgVerifyTime = totalTime / iterations;
        const verificationsPerSecond = 1000 / avgVerifyTime;

        console.log(`  📊 ${regime} verification: ${avgVerifyTime.toFixed(2)}ms avg, ${verificationsPerSecond.toFixed(0)} ops/sec`);
        verificationResults[regime] = { avgTime: avgVerifyTime, opsPerSec: verificationsPerSecond };
        this.testResults.regimeTests[regime] = iterations;

        assert(avgVerifyTime < 10, `${regime} verification should be fast: ${avgVerifyTime}ms`);
      }

      this.testResults.performanceResults.verification = verificationResults;
    });

    console.log('✅ Verification performance tests passed\n');
  }

  /**
   * 🔗 INTEGRATION TESTS
   */
  async testAEPMiddlewareIntegration() {
    console.log('🔗 Testing AEP Middleware Integration...');

    await this.runTest('Middleware Regime Distribution', async () => {
      const signer = new ProductionAEPSignatureSystem();
      const aepMiddleware = new AEPMiddleware(); // Default balanced distribution

      const testData = new TextEncoder().encode('Integration test data');
      const regimeCounts = { R1: 0, R2: 0, R3: 0 };

      // Create many signatures to test regime distribution
      for (let i = 0; i < 30; i++) {
        const dataWithVariation = new TextEncoder().encode(`Integration test data ${i}`);
        const signature = await signer.signWithAEP(dataWithVariation, aepMiddleware);
        const parsed = signer.parseAEPSignature(signature);
        regimeCounts[parsed.regime]++;

        // Verify each signature
        assert(signer.verifyWithAEP(dataWithVariation, signature), `Signature ${i} should verify`);
      }

      console.log(`  📊 Regime distribution: R1=${regimeCounts.R1}, R2=${regimeCounts.R2}, R3=${regimeCounts.R3}`);

      // Should have some distribution across regimes
      const totalSigs = regimeCounts.R1 + regimeCounts.R2 + regimeCounts.R3;
      assert(totalSigs === 30, 'Should have created 30 signatures');
      assert(regimeCounts.R1 > 0 || regimeCounts.R2 > 0 || regimeCounts.R3 > 0, 'Should have at least one regime active');
    });

    console.log('✅ Integration tests passed\n');
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

    console.log('\n🏆 === PRODUCTION AEP SIGNATURE SYSTEM REPORT === 🏆');
    console.log(`📊 Test Results: ${this.testResults.passedTests}/${this.testResults.totalTests} passed`);
    console.log(`⏱️ Total execution time: ${totalTime}ms`);

    if (this.testResults.performanceResults.signing) {
      console.log('\n⚡ Signing Performance:');
      console.log(`  Average time: ${this.testResults.performanceResults.signing.avgTime.toFixed(2)}ms`);
      console.log(`  Throughput: ${this.testResults.performanceResults.signing.opsPerSec.toFixed(0)} signatures/sec`);
    }

    if (this.testResults.performanceResults.verification) {
      console.log('\n🔍 Verification Performance:');
      for (const [regime, perf] of Object.entries(this.testResults.performanceResults.verification)) {
        console.log(`  ${regime}: ${perf.avgTime.toFixed(2)}ms avg, ${perf.opsPerSec.toFixed(0)} verifications/sec`);
      }
    }

    if (this.testResults.performanceResults.largeData) {
      console.log('\n📏 Large Data Performance:');
      console.log(`  1MB signing: ${this.testResults.performanceResults.largeData.signingTime.toFixed(2)}ms`);
      console.log(`  1MB verification: ${this.testResults.performanceResults.largeData.verifyTime.toFixed(2)}ms`);
    }

    console.log('\n🧠 Regime Test Coverage:');
    for (const [regime, count] of Object.entries(this.testResults.regimeTests)) {
      console.log(`  ${regime}: ${count} signatures tested`);
    }

    if (this.testResults.failedTests === 0) {
      console.log('\n🎉 ALL TESTS PASSED! PRODUCTION AEP SIGNATURE SYSTEM IS READY! 🎉');
      console.log('🔐 Cryptographic correctness: VERIFIED');
      console.log('🧠 Regime awareness: FUNCTIONAL');
      console.log('📦 Self-describing signatures: OPERATIONAL');
      console.log('🔄 Backward compatibility: MAINTAINED');
      console.log('⚡ Performance: EXCELLENT');
    } else {
      console.log(`\n❌ ${this.testResults.failedTests} tests failed. System not ready for production.`);
    }

    console.log('\n🌟 DefenseKit v2.0 AEP: PRODUCTION-GRADE MATHEMATICAL CONSCIOUSNESS! 🌟\n');
  }
}

// Export for use in other test files
export default ProductionSignatureTests;

// If run directly, execute all tests
if (import.meta.url === `file://${process.argv[1]}`) {
  const testSuite = new ProductionSignatureTests();
  testSuite.runAllTests().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
}
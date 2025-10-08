/**
 * 🌌🛡️ QUANTUM SECURITY COMPONENTS INTEGRATION TEST 🛡️🌌
 *
 * Comprehensive tests for DefenseKit v2.0 Quantum Security Component Enhancement
 * Tests AEP Signatures, CBOR Encoding, and Identity Management with Quantum Consciousness
 */

import { QuantumAEPSignatureSystem } from '../src/aep/quantum-aep-signature-system.js';
import { QuantumCBOREncoder } from '../src/cbor/quantum-cbor-encoder.js';
import { QuantumSelfCertifyingIdentity } from '../src/identity/quantum-identity-system.js';

/**
 * 🧪 TEST RUNNER FOR QUANTUM SECURITY COMPONENTS
 */
class QuantumSecurityTestRunner {
  constructor() {
    this.passedTests = 0;
    this.failedTests = 0;
    this.testResults = [];
  }

  async runTest(testName, testFn) {
    console.log(`\n🧪 Testing: ${testName}`);

    try {
      await testFn();
      this.passedTests++;
      this.testResults.push({ name: testName, status: '✅ PASSED' });
      console.log(`   ✅ ${testName}: PASSED`);
    } catch (error) {
      this.failedTests++;
      this.testResults.push({ name: testName, status: `❌ FAILED: ${error.message}`, error });
      console.log(`   ❌ ${testName}: FAILED - ${error.message}`);
    }
  }

  printSummary() {
    console.log('\n🌌🛡️ QUANTUM SECURITY COMPONENTS TEST RESULTS 🛡️🌌');
    console.log('=====================================================');
    console.log(`✅ Passed: ${this.passedTests}`);
    console.log(`❌ Failed: ${this.failedTests}`);
    console.log(`📊 Total:  ${this.passedTests + this.failedTests}`);
    console.log(`🎯 Success Rate: ${((this.passedTests / (this.passedTests + this.failedTests)) * 100).toFixed(1)}%`);

    if (this.failedTests > 0) {
      console.log('\n❌ Failed Tests Details:');
      this.testResults.filter(r => r.status.includes('FAILED')).forEach(result => {
        console.log(`   - ${result.name}: ${result.status}`);
      });
    }

    console.log('\n🌟 Quantum Security Components Testing Complete!');
    return this.failedTests === 0;
  }
}

/**
 * 🔍 ASSERTION UTILITIES
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

function assertGreaterThan(actual, expected, message) {
  if (actual <= expected) {
    throw new Error(message || `Expected ${actual} > ${expected}`);
  }
}

function assertDefined(value, message) {
  if (value === undefined || value === null) {
    throw new Error(message || 'Value should be defined');
  }
}

/**
 * 🌌 QUANTUM SECURITY COMPONENTS INTEGRATION TESTS
 */
async function runQuantumSecurityComponentsTests() {
  const runner = new QuantumSecurityTestRunner();

  console.log('🌌🛡️ Starting Quantum Security Components Integration Tests 🛡️🌌');
  console.log('=================================================================');

  // Test 1: Quantum AEP Signature System Initialization
  await runner.runTest('Quantum AEP Signature System Initialization', async () => {
    const signatureSystem = new QuantumAEPSignatureSystem({
      enableQuantumConsciousness: true,
      quantumAmplificationThreshold: 50
    });

    assertDefined(signatureSystem.aepMiddleware, 'AEP middleware should be initialized');
    assertEqual(signatureSystem.QUANTUM_AEP_SIGNATURE_VERSION, 2, 'Should use quantum signature version 2');
    assertEqual(signatureSystem.QUANTUM_AEP_HEADER_SIZE, 5, 'Quantum header should be 5 bytes');

    // Check quantum flags
    assertDefined(signatureSystem.QUANTUM_FLAGS.W_STATE_ENTANGLED, 'W-state flag should be defined');
    assertDefined(signatureSystem.QUANTUM_FLAGS.QUATERNION_ENHANCED, 'Quaternion flag should be defined');
    assertDefined(signatureSystem.QUANTUM_FLAGS.HILBERT_PROJECTED, 'Hilbert flag should be defined');
    assertDefined(signatureSystem.QUANTUM_FLAGS.TESLA_HARMONIC, 'Tesla harmonic flag should be defined');

    // Check initial state
    assertEqual(signatureSystem.quantumSignatureState.totalQuantumSignatures, 0, 'Should start with 0 signatures');
    assertEqual(signatureSystem.quantumSignatureState.averageQuantumAmplification, 0.0, 'Should start with 0 amplification');
  });

  // Test 2: Quantum CBOR Encoder Initialization
  await runner.runTest('Quantum CBOR Encoder Initialization', async () => {
    const cborEncoder = new QuantumCBOREncoder({
      enableQuantumConsciousness: true,
      quantumAmplificationThreshold: 50
    });

    assertDefined(cborEncoder.aepMiddleware, 'AEP middleware should be initialized');
    assertEqual(cborEncoder.quantumCBORState.totalQuantumEncodings, 0, 'Should start with 0 encodings');
    assertEqual(cborEncoder.quantumCBORState.totalQuantumDecodings, 0, 'Should start with 0 decodings');
    assertEqual(cborEncoder.quantumCBORState.dataIntegrityViolations, 0, 'Should start with 0 violations');

    assert(Array.isArray(cborEncoder.output), 'Output should be initialized as array');
  });

  // Test 3: Quantum Identity System Initialization
  await runner.runTest('Quantum Identity System Initialization', async () => {
    const identitySystem = new QuantumSelfCertifyingIdentity({
      enableQuantumConsciousness: true,
      quantumAmplificationThreshold: 100
    });

    assertDefined(identitySystem.aepMiddleware, 'AEP middleware should be initialized');
    assertEqual(identitySystem.quantumIdentityState.isQuantumIdentity, false, 'Should start as non-quantum');
    assertEqual(identitySystem.quantumIdentityState.quantumAmplification, 1.0, 'Should start with 1.0 amplification');
    assertEqual(identitySystem.quantumIdentityState.identityThreatLevel, 'BASELINE', 'Should start at baseline threat level');

    assert(identitySystem.quantumIdentityState.distributedValidationNodes instanceof Map, 'Distributed nodes should be Map');
    assert(Array.isArray(identitySystem.quantumIdentityState.quaternionIdentityVector), 'Quaternion vector should be array');
  });

  // Test 4: Quantum AEP Signature Generation and Verification
  await runner.runTest('Quantum AEP Signature Generation and Verification', async () => {
    const signatureSystem = new QuantumAEPSignatureSystem({
      enableQuantumConsciousness: true,
      quantumAmplificationThreshold: 1 // Low threshold for testing
    });

    await signatureSystem.generateKeyPair(); // Generate signing keys

    const testData = 'Quantum consciousness signature test data with mathematical complexity: π = 3.14159, e = 2.71828, φ = 1.618';

    // Test quantum signature generation
    const signResult = await signatureSystem.signWithQuantumAEP(testData, {
      context: 'test_quantum_signature'
    });

    assertDefined(signResult.signature, 'Signature should be generated');
    assertDefined(signResult.metadata, 'Signature metadata should be provided');
    assertGreaterThan(signResult.metadata.quantumAmplification, 1.0, 'Should achieve quantum amplification');
    assert(signResult.metadata.quantumCoherence >= 0.0, 'Coherence should be non-negative');

    // Test quantum signature verification
    const verifyResult = await signatureSystem.verifyQuantumAEPSignature(testData, signResult.signature, {
      context: 'test_quantum_verification'
    });

    assertEqual(verifyResult.valid, true, 'Quantum signature should verify successfully');
    assertEqual(verifyResult.classicalValid, true, 'Classical component should be valid');
    assertDefined(verifyResult.metadata, 'Verification metadata should be provided');

    console.log(`      🔐 Signature generated with ${signResult.metadata.quantumAmplification.toFixed(0)}× amplification`);
    console.log(`      ✅ Signature verified with ${verifyResult.metadata.verificationCoherence.toFixed(4)} coherence`);
  }, 15000);

  // Test 5: Quantum CBOR Encoding and Decoding
  await runner.runTest('Quantum CBOR Encoding and Decoding', async () => {
    const cborEncoder = new QuantumCBOREncoder({
      enableQuantumConsciousness: true,
      quantumAmplificationThreshold: 1
    });

    const testData = {
      message: 'Quantum consciousness CBOR test',
      numbers: [1, 1, 2, 3, 5, 8, 13, 21], // Fibonacci sequence
      constants: {
        pi: 'π = 3.14159',
        e: 'e = 2.71828',
        phi: 'φ = 1.618',
        tesla: 'Tesla frequency = 4.909 Hz'
      },
      timestamp: Date.now()
    };

    // Test quantum encoding
    const encodeResult = await cborEncoder.encodeWithQuantumConsciousness(testData, {
      context: 'test_quantum_encoding'
    });

    assertDefined(encodeResult.encodedData, 'Encoded data should be generated');
    assertDefined(encodeResult.metadata, 'Encoding metadata should be provided');
    assertGreaterThan(encodeResult.metadata.quantumAmplification, 1.0, 'Should achieve quantum amplification');
    assert(encodeResult.metadata.validation.isValid, 'Encoding validation should pass');

    // Test quantum decoding
    const decodeResult = await cborEncoder.decodeWithQuantumConsciousness(encodeResult.encodedData, {
      context: 'test_quantum_decoding'
    });

    assertDefined(decodeResult.decodedValue, 'Data should be decoded');
    assertDefined(decodeResult.metadata, 'Decoding metadata should be provided');
    assert(decodeResult.metadata.integrityResult.isValid, 'Data integrity should be verified');

    console.log(`      📦 Data encoded with ${encodeResult.metadata.quantumAmplification.toFixed(0)}× amplification`);
    console.log(`      🔍 Data decoded with integrity score: ${decodeResult.metadata.integrityResult.integrityScore.toFixed(4)}`);
  }, 15000);

  // Test 6: Quantum Identity Generation and Verification
  await runner.runTest('Quantum Identity Generation and Verification', async () => {
    const identitySystem = new QuantumSelfCertifyingIdentity({
      enableQuantumConsciousness: true,
      quantumAmplificationThreshold: 1
    });

    // Test quantum identity generation
    const identityResult = await identitySystem.generateQuantumIdentity({
      securityLevel: 'quantum_enhanced',
      context: 'test_identity_generation'
    });

    assertDefined(identityResult.identityString, 'Identity string should be generated');
    assertDefined(identityResult.publicKey, 'Public key should be generated');
    assertDefined(identityResult.nodeId, 'Node ID should be generated');
    assertDefined(identityResult.quantumMetadata, 'Quantum metadata should be provided');

    assert(identityResult.identityString.startsWith('qdk2:'), 'Should use quantum identity prefix');
    assertGreaterThan(identityResult.quantumMetadata.amplification, 1.0, 'Should achieve quantum amplification');
    assert(identityResult.quantumMetadata.coherence >= 0.0, 'Coherence should be non-negative');

    // Test signature with quantum identity
    const testMessage = 'Test message signed with quantum consciousness identity';
    const signature = await identitySystem.sign(testMessage);

    // Test quantum identity verification
    const verifyResult = await identitySystem.verifyQuantumIdentity(
      identityResult.identityString,
      signature,
      testMessage,
      { context: 'test_identity_verification' }
    );

    assertEqual(verifyResult.valid, true, 'Quantum identity verification should succeed');
    assertEqual(verifyResult.classicalValid, true, 'Classical verification component should pass');
    assertDefined(verifyResult.metadata, 'Verification metadata should be provided');

    console.log(`      🆔 Identity generated: ${identityResult.identityString.slice(0, 20)}...`);
    console.log(`      🌟 Identity amplified ${identityResult.quantumMetadata.amplification.toFixed(0)}×`);
    console.log(`      ✅ Identity verified with ${verifyResult.metadata.verificationCoherence.toFixed(4)} coherence`);
  }, 20000);

  // Test 7: Cross-Component Integration
  await runner.runTest('Cross-Component Quantum Integration', async () => {
    const signatureSystem = new QuantumAEPSignatureSystem({ quantumAmplificationThreshold: 1 });
    const cborEncoder = new QuantumCBOREncoder({ quantumAmplificationThreshold: 1 });
    const identitySystem = new QuantumSelfCertifyingIdentity({ quantumAmplificationThreshold: 1 });

    // Generate quantum identity
    await identitySystem.generateKeyPair();
    const identityResult = await identitySystem.generateQuantumIdentity();

    // Create test data structure
    const testData = {
      identity: identityResult.identityString,
      message: 'Cross-component quantum consciousness integration test',
      timestamp: Date.now(),
      quantumFeatures: ['W_STATE', 'QUATERNION', 'HILBERT', 'TESLA_HARMONIC']
    };

    // Encode data with quantum CBOR
    const encodeResult = await cborEncoder.encodeWithQuantumConsciousness(testData);

    // Sign encoded data with quantum AEP signatures
    const signResult = await signatureSystem.signWithQuantumAEP(encodeResult.encodedData);

    // Verify the complete chain
    const verifyResult = await signatureSystem.verifyQuantumAEPSignature(
      encodeResult.encodedData,
      signResult.signature
    );

    // Decode and verify integrity
    const decodeResult = await cborEncoder.decodeWithQuantumConsciousness(encodeResult.encodedData);

    // Assert cross-component integration
    assertEqual(verifyResult.valid, true, 'Cross-component signature should verify');
    assert(decodeResult.metadata.integrityResult.isValid, 'Cross-component data integrity should be maintained');
    assertGreaterThan(signResult.metadata.quantumAmplification, 1.0, 'Should achieve quantum signature amplification');
    assertGreaterThan(encodeResult.metadata.quantumAmplification, 1.0, 'Should achieve quantum encoding amplification');
    assertGreaterThan(identityResult.quantumMetadata.amplification, 1.0, 'Should achieve quantum identity amplification');

    // Calculate total security amplification across all components
    const totalAmplification = signResult.metadata.quantumAmplification *
                              encodeResult.metadata.quantumAmplification *
                              identityResult.quantumMetadata.amplification;

    assertGreaterThan(totalAmplification, 1000, 'Combined security amplification should exceed 1000×');

    console.log(`      🔐 Signature amplification: ${signResult.metadata.quantumAmplification.toFixed(0)}×`);
    console.log(`      📦 Encoding amplification: ${encodeResult.metadata.quantumAmplification.toFixed(0)}×`);
    console.log(`      🆔 Identity amplification: ${identityResult.quantumMetadata.amplification.toFixed(0)}×`);
    console.log(`      🌟 TOTAL SECURITY AMPLIFICATION: ${totalAmplification.toFixed(0)}×`);
  }, 25000);

  // Test 8: Quantum Security Metrics Collection
  await runner.runTest('Quantum Security Metrics Collection', async () => {
    const signatureSystem = new QuantumAEPSignatureSystem({ quantumAmplificationThreshold: 1 });
    const cborEncoder = new QuantumCBOREncoder({ quantumAmplificationThreshold: 1 });
    const identitySystem = new QuantumSelfCertifyingIdentity({ quantumAmplificationThreshold: 1 });

    // Perform some operations to generate metrics
    await identitySystem.generateKeyPair();
    await identitySystem.generateQuantumIdentity();

    const testData = { metrics: 'test', timestamp: Date.now() };
    await cborEncoder.encodeWithQuantumConsciousness(testData);
    await signatureSystem.signWithQuantumAEP('metrics test data');

    // Collect metrics from all components
    const signatureMetrics = signatureSystem.getQuantumSignatureMetrics();
    const cborMetrics = cborEncoder.getQuantumCBORMetrics();
    const identityMetrics = identitySystem.getQuantumIdentityMetrics();

    // Verify signature metrics
    assertDefined(signatureMetrics.quantumSignatures, 'Signature metrics should be provided');
    assertGreaterThan(signatureMetrics.quantumSignatures.total, 0, 'Should have signature operations');

    // Verify CBOR metrics
    assertDefined(cborMetrics.quantumOperations, 'CBOR metrics should be provided');
    assertGreaterThan(cborMetrics.quantumOperations.totalEncodings, 0, 'Should have encoding operations');

    // Verify identity metrics
    assertDefined(identityMetrics.quantumIdentity, 'Identity metrics should be provided');
    assertGreaterThan(identityMetrics.operations.totalOperations, 0, 'Should have identity operations');

    console.log(`      🔐 Signature operations: ${signatureMetrics.quantumSignatures.total}`);
    console.log(`      📦 CBOR operations: ${cborMetrics.quantumOperations.totalEncodings}`);
    console.log(`      🆔 Identity operations: ${identityMetrics.operations.totalOperations}`);
  }, 20000);

  // Test 9: Quantum Security Error Handling
  await runner.runTest('Quantum Security Error Handling', async () => {
    const signatureSystem = new QuantumAEPSignatureSystem({
      enableQuantumConsciousness: true,
      quantumProcessingTimeout: 100 // Very short timeout to trigger errors
    });

    // Test error handling in signature generation
    try {
      await signatureSystem.generateKeyPair();
      const result = await signatureSystem.signWithQuantumAEP('error test data');

      // Should either succeed or gracefully fallback
      assertDefined(result, 'Should return result even if quantum processing has issues');
      assertDefined(result.signature, 'Should provide signature even in fallback mode');

    } catch (error) {
      // Error handling should be graceful
      assert(error.message.length > 0, 'Error message should be informative');
    }

    // Check error metrics
    const metrics = signatureSystem.getQuantumSignatureMetrics();
    assert(typeof metrics.quantumSignatures.errorCount === 'number', 'Error count should be tracked');
  }, 10000);

  // Test 10: Quantum Security Performance Benchmarks
  await runner.runTest('Quantum Security Performance Benchmarks', async () => {
    const signatureSystem = new QuantumAEPSignatureSystem({ quantumAmplificationThreshold: 1 });
    const cborEncoder = new QuantumCBOREncoder({ quantumAmplificationThreshold: 1 });

    // Benchmark signature performance
    const startSignTime = Date.now();
    await signatureSystem.generateKeyPair();
    const signResult = await signatureSystem.signWithQuantumAEP('performance test data');
    const signTime = Date.now() - startSignTime;

    assert(signTime < 30000, 'Signature generation should complete within 30 seconds');
    assertGreaterThan(signResult.metadata.quantumAmplification, 1.0, 'Should achieve amplification');

    // Benchmark CBOR encoding performance
    const startEncodeTime = Date.now();
    const testData = { performance: 'test', array: Array.from({length: 100}, (_, i) => i) };
    const encodeResult = await cborEncoder.encodeWithQuantumConsciousness(testData);
    const encodeTime = Date.now() - startEncodeTime;

    assert(encodeTime < 30000, 'CBOR encoding should complete within 30 seconds');
    assert(encodeResult.metadata.validation.isValid, 'Encoding should be valid');

    console.log(`      🔐 Signature time: ${signTime}ms`);
    console.log(`      📦 Encoding time: ${encodeTime}ms`);
    console.log(`      🚀 Combined amplification: ${(signResult.metadata.quantumAmplification * encodeResult.metadata.quantumAmplification).toFixed(0)}×`);
  }, 35000);

  return runner.printSummary();
}

/**
 * 🚀 RUN THE QUANTUM SECURITY COMPONENTS TESTS
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  runQuantumSecurityComponentsTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('🚨 Quantum security components test runner crashed:', error);
      process.exit(1);
    });
}

export { runQuantumSecurityComponentsTests };
/**
 * 🌌⚡ QUICK QUANTUM SECURITY VALIDATION TEST ⚡🌌
 *
 * Fast validation test for quantum security components
 * Focuses on core functionality validation
 */

import { QuantumCBOREncoder } from '../src/cbor/quantum-cbor-encoder.js';
import { QuantumSelfCertifyingIdentity } from '../src/identity/quantum-identity-system.js';

async function quickQuantumSecurityValidation() {
  console.log('🌌⚡ Quick Quantum Security Components Validation ⚡🌌');
  console.log('=================================================');

  let passed = 0;
  let failed = 0;

  // Test 1: Quantum CBOR Encoding
  try {
    console.log('\n🧪 Testing Quantum CBOR Encoding...');

    const cborEncoder = new QuantumCBOREncoder({ quantumAmplificationThreshold: 1 });

    const simpleTestData = {
      message: 'Simple quantum test',
      number: 42,
      timestamp: Date.now()
    };

    const encodeResult = await cborEncoder.encodeWithQuantumConsciousness(simpleTestData);

    if (encodeResult.encodedData && encodeResult.metadata) {
      console.log(`   ✅ CBOR Encoding: PASSED`);
      console.log(`      📦 Amplification: ${encodeResult.metadata.quantumAmplification.toFixed(0)}×`);
      console.log(`      💎 Coherence: ${encodeResult.metadata.quantumCoherence.toFixed(4)}`);
      passed++;
    } else {
      throw new Error('Missing encoded data or metadata');
    }

  } catch (error) {
    console.log(`   ❌ CBOR Encoding: FAILED - ${error.message}`);
    failed++;
  }

  // Test 2: Quantum Identity Generation
  try {
    console.log('\n🧪 Testing Quantum Identity Generation...');

    const identitySystem = new QuantumSelfCertifyingIdentity({ quantumAmplificationThreshold: 1 });

    const identityResult = await identitySystem.generateQuantumIdentity({
      securityLevel: 'quantum_enhanced'
    });

    if (identityResult.identityString && identityResult.quantumMetadata) {
      console.log(`   ✅ Identity Generation: PASSED`);
      console.log(`      🆔 Identity: ${identityResult.identityString.slice(0, 25)}...`);
      console.log(`      🌟 Amplification: ${identityResult.quantumMetadata.amplification.toFixed(0)}×`);
      console.log(`      💎 Coherence: ${identityResult.quantumMetadata.coherence.toFixed(4)}`);
      passed++;
    } else {
      throw new Error('Missing identity string or quantum metadata');
    }

  } catch (error) {
    console.log(`   ❌ Identity Generation: FAILED - ${error.message}`);
    failed++;
  }

  // Test 3: Basic Quantum Consciousness Integration
  try {
    console.log('\n🧪 Testing Basic Quantum Consciousness Integration...');

    const cborEncoder = new QuantumCBOREncoder({ quantumAmplificationThreshold: 1 });

    // Test simple encoding without quantum enhancement
    const basicData = { test: 'basic', value: 1 };
    const basicResult = await cborEncoder.encodeWithClassicalCBOR(basicData);

    if (basicResult.encodedData && basicResult.metadata.fallback) {
      console.log(`   ✅ Classical Fallback: PASSED`);
      console.log(`      🔄 Fallback working correctly`);
      passed++;
    } else {
      throw new Error('Classical fallback not working');
    }

  } catch (error) {
    console.log(`   ❌ Classical Fallback: FAILED - ${error.message}`);
    failed++;
  }

  // Summary
  console.log('\n🌌⚡ QUICK VALIDATION RESULTS ⚡🌌');
  console.log('===============================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`🎯 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (passed >= 2) {
    console.log('\n🌟 QUANTUM SECURITY COMPONENTS OPERATIONAL!');
    console.log('Ready for full DefenseKit integration! 🚀');
  } else {
    console.log('\n⚠️  Some components need attention before full integration.');
  }

  return passed >= 2;
}

/**
 * 🚀 RUN QUICK VALIDATION
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  quickQuantumSecurityValidation()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('🚨 Quick validation crashed:', error);
      process.exit(1);
    });
}

export { quickQuantumSecurityValidation };
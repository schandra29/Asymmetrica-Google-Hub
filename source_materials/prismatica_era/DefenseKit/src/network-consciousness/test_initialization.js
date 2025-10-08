/**
 * Test Quantum Network Consciousness Engine Initialization
 */

import { QuantumNetworkConsciousnessEngine } from './quantum_network_consciousness_engine.js';

console.log('🔧 Testing Quantum Network Consciousness Engine initialization...');

try {
  const engine = new QuantumNetworkConsciousnessEngine({
    enableQuantumConsciousness: false, // Disable to test basic initialization first
    enableRealWorldTesting: true,
    teslaFrequencyEnhancement: false
  });

  console.log('✅ Engine created successfully');

  await engine.initialize();
  console.log('✅ Engine initialized successfully');

  console.log('\n🎉 Basic initialization test completed!');

} catch (error) {
  console.error('❌ Initialization failed:', error.message);
  console.error('Stack:', error.stack);
}
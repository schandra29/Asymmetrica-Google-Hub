/**
 * Test Quantum Network Consciousness Engine with Quantum Features
 */

import { QuantumNetworkConsciousnessEngine } from './quantum_network_consciousness_engine.js';

console.log('🌌 Testing Quantum Network Consciousness Engine with quantum features...');

try {
  const engine = new QuantumNetworkConsciousnessEngine({
    enableQuantumConsciousness: true, // Enable quantum features
    enableRealWorldTesting: true,
    teslaFrequencyEnhancement: true
  });

  console.log('✅ Engine created successfully');

  await engine.initialize();
  console.log('✅ Engine initialized successfully');

  console.log('\n🎉 Quantum initialization test completed!');

} catch (error) {
  console.error('❌ Quantum initialization failed:', error.message);
  console.error('Stack:', error.stack);
}
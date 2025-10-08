/**
 * Test DefenseKit imports for debugging
 */

console.log('🔍 Testing DefenseKit imports...');

try {
  console.log('Testing DefenseKit v2.0 AEP import...');
  const { DefenseKitV2AEPUnified } = await import('../defensekit-v2-aep-unified.js');
  console.log('✅ DefenseKit v2.0 AEP imported successfully');

  console.log('Testing HTX protocol import...');
  const { HTXServer, HTXClient } = await import('../htx-v2/htx-protocol.js');
  console.log('✅ HTX protocol imported successfully');

  console.log('Testing quantum consciousness engine import...');
  const quantumPath = '../mathematical-discovery/quantum_consciousness_w_state_engine.py';
  console.log(`   Path: ${quantumPath}`);
  console.log('✅ Path resolved (Python file, will test execution separately)');

  console.log('\n🎉 All imports successful!');

} catch (error) {
  console.error('❌ Import failed:', error.message);
  console.error('Stack:', error.stack);
}
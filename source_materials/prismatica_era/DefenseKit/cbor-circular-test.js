/**
 * Test CBOR with circular reference
 */

import DefenseKitV2AEPUnified from './src/defensekit-v2-aep-unified.js';

async function testCircularCBOR() {
  console.log('🧪 Testing AEP-Enhanced CBOR with circular references...');

  try {
    const system = new DefenseKitV2AEPUnified({
      enableMathematicalConsciousness: true,
      enableCollatzProtection: true,
      enableRegimeOptimization: true
    });

    await system.initialize();

    // Create object with circular reference
    const testData = {
      message: 'Test circular reference',
      numbers: [1, 2, 3]
    };
    testData.self = testData; // Create circular reference

    console.log('📦 Testing circular reference data...');

    // Test encoding (should handle circular reference)
    const encoded = await system.encode(testData);
    console.log('✅ Encoded successfully despite circular reference:', encoded.length, 'bytes');

    // Test decoding
    const decoded = await system.decode(encoded);
    console.log('✅ Decoded successfully');
    console.log('🔓 Decoded data:', JSON.stringify(decoded, null, 2));

    console.log('\n🎉 Circular reference CBOR test passed!');

  } catch (error) {
    console.error('❌ Circular CBOR test failed:', error);
    console.error('Stack:', error.stack);
  }
}

testCircularCBOR().catch(console.error);
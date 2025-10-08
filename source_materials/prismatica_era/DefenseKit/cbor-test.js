/**
 * Simple CBOR test to verify encoding/decoding works
 */

import DefenseKitV2AEPUnified from './src/defensekit-v2-aep-unified.js';

async function testCBOR() {
  console.log('🧪 Testing AEP-Enhanced CBOR...');

  try {
    const system = new DefenseKitV2AEPUnified({
      enableMathematicalConsciousness: true,
      enableCollatzProtection: true,
      enableRegimeOptimization: true
    });

    await system.initialize();

    const testData = {
      message: 'Hello DefenseKit v2.0!',
      numbers: [1, 2, 3, 42],
      config: {
        active: true,
        metadata: 'simple test'
      }
    };

    console.log('📦 Original data:', JSON.stringify(testData, null, 2));

    // Test encoding
    console.log('\n📦 Testing encoding...');
    const encoded = await system.encode(testData);
    console.log('✅ Encoded successfully:', encoded.length, 'bytes');
    console.log('📊 Encoded data (first 50 bytes):', Array.from(encoded.slice(0, 50)).map(b => b.toString(16).padStart(2, '0')).join(' '));

    // Test decoding
    console.log('\n🔓 Testing decoding...');
    const decoded = await system.decode(encoded);
    console.log('✅ Decoded successfully');
    console.log('🔓 Decoded data:', JSON.stringify(decoded, null, 2));

    // Verify
    console.log('\n🔍 Verification:');
    console.log('✅ Message preserved:', decoded.message === testData.message);
    console.log('✅ Numbers preserved:', JSON.stringify(decoded.numbers) === JSON.stringify(testData.numbers));
    console.log('✅ Config preserved:', JSON.stringify(decoded.config) === JSON.stringify(testData.config));

    console.log('\n🎉 CBOR test passed!');

  } catch (error) {
    console.error('❌ CBOR test failed:', error);
    console.error('Stack:', error.stack);
  }
}

testCBOR().catch(console.error);
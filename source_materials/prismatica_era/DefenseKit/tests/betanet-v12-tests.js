/**
 * Betanet v1.2 Component Tests
 * Complete test suite for our enhanced DefenseKit components
 *
 * Tests the privacy and security components we built based on
 * the open source Betanet specification
 */

import {
  SelfCertifyingIdentity,
  IdentityManager
} from '../src/identity/self-certifying.js';

import {
  DeterministicCBOREncoder,
  DeterministicCBORDecoder,
  CBORUtils
} from '../src/cbor/deterministic-cbor.js';

import {
  TemplateCaliber,
  FrontOriginRegistry,
  TrafficMimic
} from '../src/calibration/front-origin-registry.js';

import {
  RelayLottery,
  RelayNode,
  PrivacyPath,
  PrivacyManager
} from '../src/privacy/relay-mixing.js';

/**
 * Test Runner
 */
class BetanetTestRunner {
  constructor() {
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      failures: []
    };
  }

  /**
   * Add test
   */
  test(name, fn) {
    this.tests.push({ name, fn });
  }

  /**
   * Run all tests
   */
  async run() {
    console.log('🧪 Running Betanet v1.2 Component Tests...\n');

    for (const { name, fn } of this.tests) {
      try {
        console.log(`  ⏳ ${name}`);
        await fn();
        console.log(`  ✅ ${name}`);
        this.results.passed++;
      } catch (error) {
        console.log(`  ❌ ${name}: ${error.message}`);
        this.results.failed++;
        this.results.failures.push({ name, error: error.message });
      }
      this.results.total++;
    }

    this.printResults();
  }

  /**
   * Print test results
   */
  printResults() {
    console.log('\n📊 Test Results:');
    console.log(`   Passed: ${this.results.passed}`);
    console.log(`   Failed: ${this.results.failed}`);
    console.log(`   Total:  ${this.results.total}`);

    if (this.results.failed > 0) {
      console.log('\n❌ Failures:');
      for (const failure of this.results.failures) {
        console.log(`   - ${failure.name}: ${failure.error}`);
      }
    }

    const successRate = (this.results.passed / this.results.total * 100).toFixed(1);
    console.log(`\n🎯 Success Rate: ${successRate}%`);

    if (this.results.failed === 0) {
      console.log('\n🎉 All tests passed! DefenseKit v1.2 components are ready!');
    }
  }

  /**
   * Assert helper
   */
  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  /**
   * Assert equality helper
   */
  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
  }
}

// Create test runner
const runner = new BetanetTestRunner();

// =============================================
// SELF-CERTIFYING IDENTITY TESTS
// =============================================

runner.test('Self-Certifying Identity Creation', () => {
  const identity = new SelfCertifyingIdentity();

  runner.assert(identity.privateKey, 'Private key should be generated');
  runner.assert(identity.publicKey, 'Public key should be generated');
  runner.assert(identity.nodeId, 'NodeID should be computed');
  runner.assert(identity.name.startsWith('dk1:'), 'Name should have correct prefix');
  runner.assert(identity.name.length > 10, 'Name should have reasonable length');
});

runner.test('Identity Name Verification', () => {
  const identity = new SelfCertifyingIdentity();

  // Should be able to parse NodeID from name
  const parsedNodeId = SelfCertifyingIdentity.parseNodeId(identity.name);

  runner.assert(parsedNodeId.length === 20, 'Parsed NodeID should be 20 bytes');

  // Should match original NodeID
  for (let i = 0; i < 20; i++) {
    runner.assertEqual(parsedNodeId[i], identity.nodeId[i], 'Parsed NodeID should match original');
  }
});

runner.test('Identity Export/Import', () => {
  const original = new SelfCertifyingIdentity();
  const exported = original.export(true);
  const imported = SelfCertifyingIdentity.import(exported);

  runner.assertEqual(imported.name, original.name, 'Name should match after import');
  runner.assert(imported.privateKey, 'Private key should be imported');
});

runner.test('Identity Signing and Verification', () => {
  const identity = new SelfCertifyingIdentity();
  const message = 'Test message for signing';

  const signature = identity.sign(message);
  runner.assert(signature, 'Signature should be generated');

  const isValid = identity.verify(message, signature);
  runner.assert(isValid, 'Signature should be valid');

  const isInvalid = identity.verify('Different message', signature);
  runner.assert(!isInvalid, 'Invalid signature should be rejected');
});

runner.test('Identity Manager', () => {
  const manager = new IdentityManager();

  const identity1 = manager.createIdentity('Test Identity 1');
  const identity2 = manager.createIdentity('Test Identity 2');

  runner.assertEqual(manager.listIdentities().length, 2, 'Should have 2 identities');

  const retrieved = manager.getIdentity(identity1.name);
  runner.assertEqual(retrieved.name, identity1.name, 'Should retrieve correct identity');

  manager.setDefault(identity2.name);
  const defaultIdentity = manager.getDefault();
  runner.assertEqual(defaultIdentity.name, identity2.name, 'Default identity should be set correctly');
});

// =============================================
// DETERMINISTIC CBOR TESTS
// =============================================

runner.test('CBOR Deterministic Encoding', () => {
  const encoder = new DeterministicCBOREncoder();

  // Test basic types
  const intEncoded = encoder.encode(42);
  runner.assert(intEncoded.length > 0, 'Integer should encode');

  const stringEncoded = encoder.encode('hello');
  runner.assert(stringEncoded.length > 0, 'String should encode');

  const arrayEncoded = encoder.encode([1, 2, 3]);
  runner.assert(arrayEncoded.length > 0, 'Array should encode');
});

runner.test('CBOR Round-trip Consistency', () => {
  const testData = {
    number: 12345,
    string: 'test string',
    boolean: true,
    array: [1, 2, 3],
    nested: {
      inner: 'value',
      count: 999
    }
  };

  const encoder = new DeterministicCBOREncoder();
  const encoded = encoder.encode(testData);

  const decoder = new DeterministicCBORDecoder(encoded);
  const decoded = decoder.decode();

  runner.assertEqual(decoded.number, testData.number, 'Number should round-trip');
  runner.assertEqual(decoded.string, testData.string, 'String should round-trip');
  runner.assertEqual(decoded.boolean, testData.boolean, 'Boolean should round-trip');
  runner.assertEqual(decoded.array.length, testData.array.length, 'Array length should match');
});

runner.test('CBOR Map Key Sorting', () => {
  const encoder = new DeterministicCBOREncoder();

  // Keys should be sorted deterministically
  const map1 = { z: 1, a: 2, m: 3 };
  const map2 = { m: 3, z: 1, a: 2 };

  const encoded1 = encoder.encode(map1);
  const encoded2 = encoder.encode(map2);

  // Should produce identical encodings despite different input order
  runner.assertEqual(encoded1.length, encoded2.length, 'Encodings should be same length');
  for (let i = 0; i < encoded1.length; i++) {
    runner.assertEqual(encoded1[i], encoded2[i], 'Encodings should be identical');
  }
});

runner.test('CBOR Integrity Verification', () => {
  const testData = { message: 'integrity test', count: 42 };

  const hash = CBORUtils.hashCBOR(testData);
  runner.assert(hash.length === 32, 'Hash should be 32 bytes');

  const isValid = CBORUtils.verifyCBOR(testData, hash);
  runner.assert(isValid, 'Integrity verification should pass');

  // Modify data
  testData.count = 43;
  const isInvalid = CBORUtils.verifyCBOR(testData, hash);
  runner.assert(!isInvalid, 'Modified data should fail verification');
});

// =============================================
// FRONT ORIGIN REGISTRY TESTS
// =============================================

runner.test('Template Calibration', async () => {
  const calibrator = new TemplateCaliber();

  // Test simulated calibration
  const template = await calibrator.calibrateOrigin('example.com');

  runner.assert(template.id, 'Template should have ID');
  runner.assert(template.hostname === 'example.com', 'Hostname should match');
  runner.assert(template.tls, 'Template should have TLS parameters');
  runner.assert(template.http2, 'Template should have HTTP/2 parameters');
});

runner.test('Front Origin Registry', () => {
  const registry = new FrontOriginRegistry();

  const entry = {
    templateId: 'test123456789abcdef',
    hostPattern: '*.example.com',
    complianceProfile: 'STANDARD',
    expiry: Date.now() + 60000, // 1 minute from now
  };

  registry.addEntry(entry);

  const found = registry.findEntry(entry.templateId, 'api.example.com');
  runner.assert(found, 'Entry should be found');
  runner.assertEqual(found.hostPattern, entry.hostPattern, 'Host pattern should match');

  const notFound = registry.findEntry(entry.templateId, 'notexample.com');
  runner.assert(!notFound, 'Non-matching hostname should not be found');
});

runner.test('Traffic Mimicking', () => {
  const registry = new FrontOriginRegistry();
  const mimic = new TrafficMimic(registry);

  const mockParams = {
    tls: {
      version: 0x0303,
      cipherSuites: ['TLS_AES_128_GCM_SHA256'],
      extensions: ['server_name']
    },
    http2: {
      settings: {
        INITIAL_WINDOW_SIZE: 32768
      }
    }
  };

  const mimicParams = mimic.applyTLSTemplate(mockParams.tls, {
    version: 0x0304,
    cipherSuites: ['TLS_AES_256_GCM_SHA384']
  });

  runner.assertEqual(mimicParams.version, 0x0304, 'Template version should be applied');
  runner.assert(mimicParams.tolerance === 0.1, 'Tolerance should be set');
});

// =============================================
// PRIVACY RELAY TESTS
// =============================================

runner.test('Relay Node Creation', () => {
  const identity = new SelfCertifyingIdentity();
  const relay = new RelayNode(identity, {
    mix: true,
    bandwidth: 2000000,
    jurisdiction: 'test'
  });

  runner.assert(relay.supportsMixing(), 'Relay should support mixing');
  runner.assertEqual(relay.capabilities.bandwidth, 2000000, 'Bandwidth should be set');
  runner.assertEqual(relay.capabilities.jurisdiction, 'test', 'Jurisdiction should be set');
});

runner.test('Relay Selection Lottery', () => {
  const sessionKey = new Uint8Array(32).fill(1); // Fixed key for deterministic test
  const lottery = new RelayLottery(sessionKey);

  // Create test relays
  const relays = [];
  for (let i = 0; i < 10; i++) {
    const identity = new SelfCertifyingIdentity();
    relays.push(new RelayNode(identity));
  }

  const path1 = lottery.selectPath(relays, 3);
  const path2 = lottery.selectPath(relays, 3);

  runner.assertEqual(path1.length, 3, 'Path should have 3 relays');
  runner.assertEqual(path2.length, 3, 'Second path should have 3 relays');

  // With same session key and time bucket, should select same path
  runner.assertEqual(path1[0].nodeId, path2[0].nodeId, 'Paths should be deterministic');
});

runner.test('Privacy Path Construction', () => {
  const sessionKey = new Uint8Array(32).fill(2);
  const pathConstructor = new PrivacyPath(sessionKey);

  // Register test relays
  for (let i = 0; i < 5; i++) {
    const identity = new SelfCertifyingIdentity();
    const relay = new RelayNode(identity);
    pathConstructor.registerRelay(relay);
  }

  const path = pathConstructor.buildPath(3);

  runner.assert(path.id, 'Path should have ID');
  runner.assertEqual(path.relays.length, 3, 'Path should have 3 relays');
  runner.assert(path.totalDelay > 0, 'Path should have estimated delay');
  runner.assert(path.active, 'Path should be active');
});

runner.test('Privacy Message Forwarding', async () => {
  const identity = new SelfCertifyingIdentity();
  const relay = new RelayNode(identity);

  const testMessage = {
    content: 'test message',
    timestamp: Date.now()
  };

  const result = await relay.forwardMessage(testMessage, 'next-hop-id', 'connection-123');

  runner.assert(result.success, 'Message forwarding should succeed');
  runner.assert(result.message, 'Should return forwarded message');
  runner.assert(result.message.hopSignatures, 'Should have hop signatures');
  runner.assertEqual(result.message.hopSignatures.length, 1, 'Should have one hop signature');
});

runner.test('Privacy Manager Integration', async () => {
  const identity = new SelfCertifyingIdentity();
  const manager = new PrivacyManager(identity);

  // Add test relays
  for (let i = 0; i < 5; i++) {
    const relayIdentity = new SelfCertifyingIdentity();
    const relay = new RelayNode(relayIdentity);
    manager.addRelay(relay);
  }

  manager.enable();
  runner.assert(manager.enabled, 'Privacy should be enabled');

  const stats = manager.getStats();
  runner.assert(stats.enabled, 'Stats should show privacy enabled');
  runner.assertEqual(stats.relays.length, 5, 'Should have 5 relays registered');
});

// =============================================
// INTEGRATION TESTS
// =============================================

runner.test('Full Component Integration', async () => {
  console.log('    🔗 Testing full component integration...');

  // Create identities
  const clientIdentity = new SelfCertifyingIdentity();
  const serverIdentity = new SelfCertifyingIdentity();

  // Set up privacy manager
  const privacyManager = new PrivacyManager(clientIdentity);

  // Add relays
  for (let i = 0; i < 3; i++) {
    const relayIdentity = new SelfCertifyingIdentity();
    const relay = new RelayNode(relayIdentity);
    privacyManager.addRelay(relay);
  }

  // Create deterministic message
  const message = {
    to: serverIdentity.name,
    content: 'Secure test message',
    timestamp: Date.now()
  };

  // Encode with CBOR
  const encoder = new DeterministicCBOREncoder();
  const encodedMessage = encoder.encode(message);

  // Create CBOR hash for integrity
  const messageHash = CBORUtils.hashCBOR(message);

  // Sign message with identity
  const signature = clientIdentity.sign(encodedMessage);

  // Verify signature
  const signatureValid = clientIdentity.verify(encodedMessage, signature);
  runner.assert(signatureValid, 'Message signature should be valid');

  // Verify CBOR integrity
  const integrityValid = CBORUtils.verifyCBOR(message, messageHash);
  runner.assert(integrityValid, 'CBOR integrity should be valid');

  console.log('    ✅ Full integration test passed!');
});

// =============================================
// PERFORMANCE TESTS
// =============================================

runner.test('Performance Benchmarks', async () => {
  console.log('    📊 Running performance benchmarks...');

  // CBOR encoding performance
  const encoder = new DeterministicCBOREncoder();
  const testData = { large: 'x'.repeat(1000), numbers: Array.from({length: 100}, (_, i) => i) };

  const start = Date.now();
  for (let i = 0; i < 1000; i++) {
    encoder.encode(testData);
  }
  const cborTime = Date.now() - start;

  console.log(`    📈 CBOR: 1000 encodings in ${cborTime}ms (${(1000/cborTime*1000).toFixed(0)} ops/sec)`);

  // Identity creation performance
  const identityStart = Date.now();
  for (let i = 0; i < 10; i++) {
    new SelfCertifyingIdentity();
  }
  const identityTime = Date.now() - identityStart;

  console.log(`    📈 Identity: 10 creations in ${identityTime}ms (${(10/identityTime*1000).toFixed(1)} ops/sec)`);

  runner.assert(cborTime < 5000, 'CBOR performance should be reasonable');
  runner.assert(identityTime < 1000, 'Identity creation should be fast');
});

// Run the tests
(async () => {
  await runner.run();
})().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});

export default runner;
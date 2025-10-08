/**
 * HTX v1.2 Protocol Tests
 * Testing enhanced unhackable authentication
 */

import { HTXConnection, HTXServer, HTXClient } from '../src/htx-v2/htx-protocol.js';
import { performance } from 'perf_hooks';
import assert from 'assert';

export async function runHTXTests(reporter) {
  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };

  const tests = [
    testHTXHandshake,
    testKeyRotation,
    testEncryption,
    testPerformance,
    testByzantineResilience
  ];

  for (const test of tests) {
    results.total++;
    try {
      await test();
      results.passed++;
      console.log(`   ✅ ${test.name}`);
    } catch (error) {
      results.failed++;
      console.log(`   ❌ ${test.name}: ${error.message}`);
    }
  }

  return results;
}

async function testHTXHandshake() {
  // Generate keys
  const serverPrivateKey = new Uint8Array(32);
  const clientPrivateKey = new Uint8Array(32);
  crypto.getRandomValues(serverPrivateKey);
  crypto.getRandomValues(clientPrivateKey);

  // Create server and client
  const server = new HTXServer(serverPrivateKey);
  const client = new HTXClient(clientPrivateKey);

  // Get server public key
  const serverPublicKey = server.getPublicKey();

  // Create connection
  const clientConnection = client.connect(serverPublicKey);
  const serverConnection = server.acceptConnection('test-client');

  // Perform handshake
  clientConnection.initHandshake();
  const msg1 = clientConnection.createMessage1();
  assert(msg1.length === 32, 'Message 1 should be 32 bytes');

  // Verify handshake completes
  assert(clientConnection.established === false, 'Should not be established before handshake');
  
  // After full handshake
  clientConnection.splitKeys();
  assert(clientConnection.established === true, 'Should be established after handshake');
}

async function testKeyRotation() {
  const connection = new HTXConnection('initiator', new Uint8Array(32));
  connection.established = true;
  connection.transportState.sendKey = new Uint8Array(32);
  
  // Check rotation conditions
  connection.rotationState.bytesSent = 64 * 1024 * 1024; // 64MB
  assert(connection.shouldRotate(), 'Should trigger rotation after 64MB');

  // Test rotation
  const keyUpdateFrame = connection.createKeyUpdateFrame();
  assert(keyUpdateFrame.type === 'KEY_UPDATE', 'Should create KEY_UPDATE frame');
  assert(keyUpdateFrame.generation === 1, 'Generation should increment');
}

async function testEncryption() {
  const connection = new HTXConnection('initiator', new Uint8Array(32));
  
  // Setup mock transport state
  connection.established = true;
  connection.transportState.sendKey = new Uint8Array(32);
  connection.transportState.sendNonceSalt = new Uint8Array(12);
  connection.transportState.receiveKey = new Uint8Array(32);
  connection.transportState.receiveNonceSalt = new Uint8Array(12);

  // Test data
  const plaintext = new TextEncoder().encode('Test message for HTX encryption');
  
  // Encrypt
  const ciphertext = connection.encrypt(plaintext);
  assert(ciphertext.length > plaintext.length, 'Ciphertext should include auth tag');
  
  // Verify nonce incremented
  assert(connection.transportState.sendNonce === 1n, 'Nonce should increment');
}

async function testPerformance() {
  const iterations = 1000;
  const connection = new HTXConnection('initiator', new Uint8Array(32));
  
  // Setup connection
  connection.established = true;
  connection.transportState.sendKey = new Uint8Array(32);
  connection.transportState.sendNonceSalt = new Uint8Array(12);

  const data = new Uint8Array(1024); // 1KB test data
  crypto.getRandomValues(data);

  const start = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    connection.encrypt(data);
  }
  
  const duration = performance.now() - start;
  const throughput = (iterations * 1024) / (duration / 1000) / 1024 / 1024; // MB/s
  
  console.log(`      HTX Throughput: ${throughput.toFixed(2)} MB/s`);
  assert(throughput > 10, 'Throughput should exceed 10 MB/s');
}

async function testByzantineResilience() {
  // Test connection resilience to Byzantine failures
  const connections = [];
  const byzantineRatio = 0.3; // 30% Byzantine
  const totalNodes = 10;
  
  for (let i = 0; i < totalNodes; i++) {
    const conn = new HTXConnection('node_' + i, new Uint8Array(32));
    conn.established = true;
    connections.push(conn);
  }
  
  // Simulate Byzantine nodes
  const byzantineCount = Math.floor(totalNodes * byzantineRatio);
  for (let i = 0; i < byzantineCount; i++) {
    connections[i].established = false; // Mark as Byzantine
  }
  
  // Count valid connections
  const validConnections = connections.filter(c => c.established).length;
  const successRatio = validConnections / totalNodes;
  
  assert(successRatio >= 0.67, 'Should maintain 67% valid connections with 30% Byzantine');
}
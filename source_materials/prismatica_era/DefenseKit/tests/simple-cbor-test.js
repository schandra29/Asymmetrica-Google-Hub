/**
 * Simple CBOR test to isolate floating point issues
 */

import {
  DeterministicCBOREncoder
} from '../src/cbor/deterministic-cbor.js';

const encoder = new DeterministicCBOREncoder();

console.log('Testing CBOR encoding...');

try {
  // Test 1: Simple object with integers
  const test1 = { count: 42, name: "test" };
  console.log('Test 1 (integers):', encoder.encode(test1));

  // Test 2: Object with explicit floating point
  const test2 = { value: 3.14 };
  console.log('Test 2 (float):', encoder.encode(test2));
} catch (error) {
  console.error('CBOR Error:', error.message);
}
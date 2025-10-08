/**
 * Deterministic CBOR Implementation
 * Based on Betanet specs Section 6.2
 * 
 * Canonical encoding prevents injection attacks and ensures
 * bit-perfect reproducibility for cryptographic operations
 */

import { sha256 } from '@noble/hashes/sha256';

// CBOR major types
const MAJOR_TYPE_UINT = 0;
const MAJOR_TYPE_NINT = 1;
const MAJOR_TYPE_BSTR = 2;
const MAJOR_TYPE_TSTR = 3;
const MAJOR_TYPE_ARRAY = 4;
const MAJOR_TYPE_MAP = 5;
const MAJOR_TYPE_SIMPLE = 7;

// Additional info values
const AI_FALSE = 20;
const AI_TRUE = 21;
const AI_NULL = 22;
const AI_UINT8 = 24;
const AI_UINT16 = 25;
const AI_UINT32 = 26;
const AI_UINT64 = 27;

/**
 * Deterministic CBOR Encoder
 * Implements canonical encoding rules from Section 6.2
 */
export class DeterministicCBOREncoder {
  constructor() {
    this.output = [];
  }
  
  /**
   * Encode a value to deterministic CBOR
   */
  encode(value) {
    this.output = [];
    this.encodeValue(value);
    return new Uint8Array(this.output);
  }
  
  /**
   * Encode any value based on its type
   */
  encodeValue(value) {
    if (value === null) {
      this.encodeNull();
    } else if (typeof value === 'boolean') {
      this.encodeBoolean(value);
    } else if (typeof value === 'number') {
      if (Number.isInteger(value)) {
        this.encodeInteger(value);
      } else {
        throw new Error('Floating point numbers are prohibited in deterministic CBOR');
      }
    } else if (typeof value === 'string') {
      this.encodeString(value);
    } else if (value instanceof Uint8Array) {
      this.encodeBytes(value);
    } else if (Array.isArray(value)) {
      this.encodeArray(value);
    } else if (typeof value === 'object') {
      this.encodeMap(value);
    } else {
      throw new Error(`Unsupported type: ${typeof value}`);
    }
  }
  
  /**
   * Encode unsigned or negative integer (shortest form)
   */
  encodeInteger(value) {
    if (value >= 0) {
      this.encodeUnsigned(MAJOR_TYPE_UINT, value);
    } else {
      this.encodeUnsigned(MAJOR_TYPE_NINT, -1 - value);
    }
  }
  
  /**
   * Encode unsigned value with major type (shortest form rule)
   */
  encodeUnsigned(majorType, value) {
    const mt = majorType << 5;
    
    if (value < 24) {
      // Direct encoding in additional info
      this.output.push(mt | value);
    } else if (value < 256) {
      // 1 byte following
      this.output.push(mt | AI_UINT8);
      this.output.push(value);
    } else if (value < 65536) {
      // 2 bytes following
      this.output.push(mt | AI_UINT16);
      this.output.push((value >> 8) & 0xFF);
      this.output.push(value & 0xFF);
    } else if (value < 4294967296) {
      // 4 bytes following
      this.output.push(mt | AI_UINT32);
      this.output.push((value >> 24) & 0xFF);
      this.output.push((value >> 16) & 0xFF);
      this.output.push((value >> 8) & 0xFF);
      this.output.push(value & 0xFF);
    } else {
      // 8 bytes following
      this.output.push(mt | AI_UINT64);
      const high = Math.floor(value / 4294967296);
      const low = value % 4294967296;
      this.output.push((high >> 24) & 0xFF);
      this.output.push((high >> 16) & 0xFF);
      this.output.push((high >> 8) & 0xFF);
      this.output.push(high & 0xFF);
      this.output.push((low >> 24) & 0xFF);
      this.output.push((low >> 16) & 0xFF);
      this.output.push((low >> 8) & 0xFF);
      this.output.push(low & 0xFF);
    }
  }
  
  /**
   * Encode byte string (definite length only)
   */
  encodeBytes(bytes) {
    this.encodeUnsigned(MAJOR_TYPE_BSTR, bytes.length);
    this.output.push(...bytes);
  }
  
  /**
   * Encode text string (UTF-8, definite length only)
   */
  encodeString(str) {
    // Validate UTF-8
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    
    this.encodeUnsigned(MAJOR_TYPE_TSTR, bytes.length);
    this.output.push(...bytes);
  }
  
  /**
   * Encode array (definite length only)
   */
  encodeArray(arr) {
    this.encodeUnsigned(MAJOR_TYPE_ARRAY, arr.length);
    for (const item of arr) {
      this.encodeValue(item);
    }
  }
  
  /**
   * Encode map (definite length, sorted keys)
   */
  encodeMap(obj) {
    // Get all entries
    const entries = Object.entries(obj);
    
    // Encode keys to get their canonical form for sorting
    const encodedEntries = entries.map(([key, value]) => {
      const keyEncoder = new DeterministicCBOREncoder();
      const encodedKey = keyEncoder.encode(key);
      return { key, value, encodedKey };
    });
    
    // Sort by encoded key bytes (lexicographic order)
    encodedEntries.sort((a, b) => {
      const minLen = Math.min(a.encodedKey.length, b.encodedKey.length);
      for (let i = 0; i < minLen; i++) {
        if (a.encodedKey[i] !== b.encodedKey[i]) {
          return a.encodedKey[i] - b.encodedKey[i];
        }
      }
      return a.encodedKey.length - b.encodedKey.length;
    });
    
    // Check for duplicate keys
    for (let i = 1; i < encodedEntries.length; i++) {
      if (this.bytesEqual(encodedEntries[i-1].encodedKey, encodedEntries[i].encodedKey)) {
        throw new Error('Duplicate keys are prohibited in deterministic CBOR');
      }
    }
    
    // Encode the map
    this.encodeUnsigned(MAJOR_TYPE_MAP, encodedEntries.length);
    for (const entry of encodedEntries) {
      this.encodeValue(entry.key);
      this.encodeValue(entry.value);
    }
  }
  
  /**
   * Encode boolean
   */
  encodeBoolean(value) {
    this.output.push((MAJOR_TYPE_SIMPLE << 5) | (value ? AI_TRUE : AI_FALSE));
  }
  
  /**
   * Encode null
   */
  encodeNull() {
    this.output.push((MAJOR_TYPE_SIMPLE << 5) | AI_NULL);
  }
  
  /**
   * Compare byte arrays for equality
   */
  bytesEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
}

/**
 * Deterministic CBOR Decoder
 * Strict validation according to Section 6.2
 */
export class DeterministicCBORDecoder {
  constructor(data) {
    this.data = new Uint8Array(data);
    this.offset = 0;
  }
  
  /**
   * Decode CBOR data
   */
  decode() {
    if (this.offset >= this.data.length) {
      throw new Error('Unexpected end of CBOR data');
    }
    return this.decodeValue();
  }
  
  /**
   * Decode a single value
   */
  decodeValue() {
    const initial = this.data[this.offset++];
    const majorType = (initial >> 5) & 0x07;
    const additionalInfo = initial & 0x1F;
    
    switch (majorType) {
      case MAJOR_TYPE_UINT:
        return this.decodeUnsigned(additionalInfo);
      case MAJOR_TYPE_NINT:
        return -1 - this.decodeUnsigned(additionalInfo);
      case MAJOR_TYPE_BSTR:
        return this.decodeBytes(additionalInfo);
      case MAJOR_TYPE_TSTR:
        return this.decodeString(additionalInfo);
      case MAJOR_TYPE_ARRAY:
        return this.decodeArray(additionalInfo);
      case MAJOR_TYPE_MAP:
        return this.decodeMap(additionalInfo);
      case MAJOR_TYPE_SIMPLE:
        return this.decodeSimple(additionalInfo);
      default:
        throw new Error(`Unsupported major type: ${majorType}`);
    }
  }
  
  /**
   * Decode unsigned integer
   */
  decodeUnsigned(additionalInfo) {
    if (additionalInfo < 24) {
      return additionalInfo;
    } else if (additionalInfo === AI_UINT8) {
      return this.readUint8();
    } else if (additionalInfo === AI_UINT16) {
      return this.readUint16();
    } else if (additionalInfo === AI_UINT32) {
      return this.readUint32();
    } else if (additionalInfo === AI_UINT64) {
      return this.readUint64();
    } else if (additionalInfo >= 28 && additionalInfo <= 30) {
      throw new Error('Indefinite length items are prohibited');
    } else {
      throw new Error(`Invalid additional info: ${additionalInfo}`);
    }
  }
  
  /**
   * Decode byte string
   */
  decodeBytes(additionalInfo) {
    const length = this.decodeUnsigned(additionalInfo);
    if (this.offset + length > this.data.length) {
      throw new Error('Unexpected end of data');
    }
    const bytes = this.data.slice(this.offset, this.offset + length);
    this.offset += length;
    return bytes;
  }
  
  /**
   * Decode text string
   */
  decodeString(additionalInfo) {
    const bytes = this.decodeBytes(additionalInfo);
    const decoder = new TextDecoder('utf-8', { fatal: true });
    try {
      return decoder.decode(bytes);
    } catch (error) {
      throw new Error('Invalid UTF-8 in string');
    }
  }
  
  /**
   * Decode array
   */
  decodeArray(additionalInfo) {
    const length = this.decodeUnsigned(additionalInfo);
    const array = [];
    for (let i = 0; i < length; i++) {
      array.push(this.decodeValue());
    }
    return array;
  }
  
  /**
   * Decode map
   */
  decodeMap(additionalInfo) {
    const length = this.decodeUnsigned(additionalInfo);
    const map = {};
    let previousKey = null;
    
    for (let i = 0; i < length; i++) {
      const key = this.decodeValue();
      const value = this.decodeValue();
      
      // Verify keys are sorted and unique
      if (previousKey !== null) {
        const prevEncoded = new DeterministicCBOREncoder().encode(previousKey);
        const currEncoded = new DeterministicCBOREncoder().encode(key);
        
        if (this.compareBytes(prevEncoded, currEncoded) >= 0) {
          throw new Error('Map keys must be sorted and unique');
        }
      }
      
      if (typeof key !== 'string') {
        throw new Error('Only string keys are supported in maps');
      }
      
      map[key] = value;
      previousKey = key;
    }
    
    return map;
  }
  
  /**
   * Decode simple values
   */
  decodeSimple(additionalInfo) {
    if (additionalInfo === AI_FALSE) return false;
    if (additionalInfo === AI_TRUE) return true;
    if (additionalInfo === AI_NULL) return null;
    throw new Error(`Unsupported simple value: ${additionalInfo}`);
  }
  
  /**
   * Read unsigned integers from buffer
   */
  readUint8() {
    if (this.offset + 1 > this.data.length) {
      throw new Error('Unexpected end of data');
    }
    return this.data[this.offset++];
  }
  
  readUint16() {
    if (this.offset + 2 > this.data.length) {
      throw new Error('Unexpected end of data');
    }
    const value = (this.data[this.offset] << 8) | this.data[this.offset + 1];
    this.offset += 2;
    return value;
  }
  
  readUint32() {
    if (this.offset + 4 > this.data.length) {
      throw new Error('Unexpected end of data');
    }
    const value = (this.data[this.offset] << 24) |
                  (this.data[this.offset + 1] << 16) |
                  (this.data[this.offset + 2] << 8) |
                  this.data[this.offset + 3];
    this.offset += 4;
    return value >>> 0; // Convert to unsigned
  }
  
  readUint64() {
    if (this.offset + 8 > this.data.length) {
      throw new Error('Unexpected end of data');
    }
    const high = this.readUint32();
    const low = this.readUint32();
    
    // JavaScript number precision limitation
    if (high > 0x1FFFFF) {
      throw new Error('Integer too large for JavaScript number');
    }
    
    return high * 4294967296 + low;
  }
  
  /**
   * Compare byte arrays lexicographically
   */
  compareBytes(a, b) {
    const minLen = Math.min(a.length, b.length);
    for (let i = 0; i < minLen; i++) {
      if (a[i] !== b[i]) {
        return a[i] - b[i];
      }
    }
    return a.length - b.length;
  }
}

/**
 * Utility functions for deterministic CBOR
 */
export class CBORUtils {
  /**
   * Encode and hash data for integrity
   */
  static hashCBOR(data) {
    const encoder = new DeterministicCBOREncoder();
    const encoded = encoder.encode(data);
    return sha256(encoded);
  }
  
  /**
   * Verify CBOR data integrity
   */
  static verifyCBOR(data, expectedHash) {
    const actualHash = this.hashCBOR(data);
    
    if (actualHash.length !== expectedHash.length) {
      return false;
    }
    
    let equal = true;
    for (let i = 0; i < actualHash.length; i++) {
      if (actualHash[i] !== expectedHash[i]) {
        equal = false;
      }
    }
    
    return equal;
  }
  
  /**
   * Create a TemplateID from parameters (Section 8.1.1)
   */
  static createTemplateID(parameters) {
    const encoder = new DeterministicCBOREncoder();
    const encoded = encoder.encode(parameters);
    return sha256(encoded);
  }
  
  /**
   * Encode for cryptographic context (Section 8.3)
   */
  static encodeContext(context) {
    const encoder = new DeterministicCBOREncoder();
    return encoder.encode(context);
  }
}

export default {
  DeterministicCBOREncoder,
  DeterministicCBORDecoder,
  CBORUtils
};
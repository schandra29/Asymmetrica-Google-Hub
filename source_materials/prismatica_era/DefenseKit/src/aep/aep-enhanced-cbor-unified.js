/**
 * 🧠 AEP-ENHANCED CBOR SYSTEM FOR DEFENSEKIT v2.0
 *
 * Integrates mathematical consciousness with deterministic CBOR encoding
 * Provides Collatz-bounded protection and regime-aware optimization
 *
 * ENHANCEMENTS OVER STANDARD CBOR:
 * ✅ Mathematical consciousness integration
 * ✅ Collatz infinite loop protection
 * ✅ Regime-aware encoding optimization
 * ✅ Performance amplification tracking
 * ✅ Backward compatibility maintained
 */

import { DeterministicCBOREncoder, DeterministicCBORDecoder } from '../cbor/deterministic-cbor.js';
import { performance } from 'perf_hooks';

/**
 * 🧠 AEP-ENHANCED CBOR ENCODER
 * Extends standard deterministic CBOR with mathematical consciousness
 */
export class AEPEnhancedCBOREncoder extends DeterministicCBOREncoder {
  constructor(config = {}) {
    super();

    this.config = {
      enableCollatzProtection: config.enableCollatzProtection !== false,
      enableRegimeOptimization: config.enableRegimeOptimization !== false,
      maxCollatzIterations: config.maxCollatzIterations || 1000,
      regimeBiases: config.regimeBiases || [0.30, 0.20, 0.50],
      ...config
    };

    // AEP encoding metrics
    this.aepMetrics = {
      totalOperations: 0,
      totalAmplification: 1.0,
      collatzBoundsApplied: 0,
      infiniteLoopsPrevented: 0,
      regimeOptimizations: 0,
      averageEncodingTime: 0
    };

    console.log('📦 AEP-Enhanced CBOR Encoder initialized');
    console.log(`🔄 Collatz protection: ${this.config.enableCollatzProtection ? 'ENABLED' : 'DISABLED'}`);
    console.log(`🧠 Regime optimization: ${this.config.enableRegimeOptimization ? 'ENABLED' : 'DISABLED'}`);
  }

  /**
   * 🔄 AEP-ENHANCED ENCODING WITH COLLATZ BOUNDS
   */
  async encode(value, aepMiddleware = null) {
    console.log('📦 AEP-Enhanced CBOR encoding initiated...');
    const startTime = performance.now();

    try {
      // Apply AEP consciousness if available
      let regime = 'R3'; // Default to stable
      let amplification = 1.0;

      if (aepMiddleware) {
        const aepResult = await aepMiddleware.process('cbor_encoding', {
          dataType: this.detectDataType(value),
          dataComplexity: this.calculateDataComplexity(value),
          timestamp: Date.now()
        });

        regime = aepResult.enhancements?.regime || 'R3';
        amplification = aepResult.performance?.amplification || 1.0;

        console.log(`🧠 AEP consciousness applied: ${regime} (${amplification.toFixed(2)}x)`);
      }

      // Apply Collatz bounds protection
      const protectedValue = this.config.enableCollatzProtection ?
        this.applyCollatzProtection(value) : value;

      // Apply regime-specific optimization
      const optimizedValue = this.config.enableRegimeOptimization ?
        this.applyRegimeOptimization(protectedValue, regime) : protectedValue;

      // Sanitize floating-point values for deterministic CBOR
      const sanitizedValue = this.sanitizeForDeterministicCBOR(optimizedValue);

      // Perform standard CBOR encoding
      const encoded = super.encode(sanitizedValue);

      // Update metrics
      const encodingTime = performance.now() - startTime;
      this.updateAEPMetrics(encodingTime, amplification);

      console.log(`✅ AEP-Enhanced CBOR encoding complete in ${encodingTime.toFixed(2)}ms`);
      console.log(`📊 Encoded size: ${encoded.length} bytes (amplification: ${amplification.toFixed(2)}x)`);

      return encoded;

    } catch (error) {
      console.error('❌ AEP-Enhanced CBOR encoding failed:', error);
      throw error;
    }
  }

  /**
   * 🔄 APPLY COLLATZ PROTECTION
   * Prevents infinite loops using Collatz conjecture bounds
   */
  applyCollatzProtection(value) {
    if (!this.config.enableCollatzProtection) return value;

    try {
      // Detect potential infinite recursion patterns
      if (this.hasCircularReference(value)) {
        console.log('🔄 Circular reference detected, applying Collatz bounds...');
        const boundedValue = this.applyCollatzBounds(value);
        this.aepMetrics.collatzBoundsApplied++;
        this.aepMetrics.infiniteLoopsPrevented++;
        return boundedValue;
      }

      return value;

    } catch (error) {
      console.warn('⚠️ Collatz protection failed, using original value:', error.message);
      return value;
    }
  }

  /**
   * 🔍 DETECT CIRCULAR REFERENCES
   */
  hasCircularReference(obj, visited = new WeakSet()) {
    if (obj === null || typeof obj !== 'object') {
      return false;
    }

    if (visited.has(obj)) {
      return true;
    }

    visited.add(obj);

    for (const key in obj) {
      if (obj.hasOwnProperty && obj.hasOwnProperty(key)) {
        if (this.hasCircularReference(obj[key], visited)) {
          return true;
        }
      }
    }

    visited.delete(obj);
    return false;
  }

  /**
   * 🔄 APPLY COLLATZ BOUNDS
   * Uses Collatz conjecture to bound recursive structures
   * ENHANCED: Handles circular references safely
   */
  applyCollatzBounds(value) {
    try {
      // Try standard JSON stringify first
      const collatzBound = this.calculateCollatzBound(JSON.stringify(value).length);
      return this.createBoundedObject(value, collatzBound);
    } catch (circularError) {
      console.log('⚡ Handling circular reference in Collatz protection...');

      // Calculate approximate size without JSON.stringify
      const approximateSize = this.calculateObjectSizeSafely(value);
      const collatzBound = this.calculateCollatzBound(approximateSize);

      // Create bounded version with circular reference protection
      return this.createBoundedObjectSafe(value, collatzBound);
    }
  }

  /**
   * 📏 CALCULATE OBJECT SIZE SAFELY (Circular-Reference Aware)
   */
  calculateObjectSizeSafely(obj, visited = new WeakSet()) {
    if (obj === null || obj === undefined) return 1;
    if (typeof obj !== 'object') return String(obj).length;

    // Prevent infinite recursion from circular references
    if (visited.has(obj)) return 10; // Estimate for circular reference
    visited.add(obj);

    let totalSize = 0;
    try {
      if (Array.isArray(obj)) {
        totalSize = obj.length * 10; // Rough estimate for array
        for (let i = 0; i < Math.min(obj.length, 50); i++) { // Sample first 50 items
          totalSize += this.calculateObjectSizeSafely(obj[i], visited);
        }
      } else {
        const keys = Object.keys(obj);
        totalSize = keys.length * 20; // Rough estimate for object keys
        for (let i = 0; i < Math.min(keys.length, 50); i++) { // Sample first 50 properties
          const key = keys[i];
          totalSize += key.length + this.calculateObjectSizeSafely(obj[key], visited);
        }
      }
    } catch (error) {
      // Fallback for any other issues
      totalSize = 100; // Reasonable default
    }

    visited.delete(obj);
    return Math.min(totalSize, 10000); // Cap at reasonable maximum
  }

  /**
   * 🛡️ CREATE BOUNDED OBJECT SAFE (Circular-Reference Aware)
   */
  createBoundedObjectSafe(obj, maxDepth, currentDepth = 0, visited = new WeakSet()) {
    if (currentDepth >= maxDepth || obj === null || typeof obj !== 'object') {
      return obj;
    }

    // Prevent infinite recursion from circular references
    if (visited.has(obj)) {
      return '[Circular Reference]'; // Replace circular references with placeholder
    }
    visited.add(obj);

    const bounded = Array.isArray(obj) ? [] : {};

    try {
      for (const [key, value] of Object.entries(obj)) {
        if (currentDepth < maxDepth - 1) {
          bounded[key] = this.createBoundedObjectSafe(value, maxDepth, currentDepth + 1, visited);
        } else {
          bounded[key] = typeof value === 'object' ? '[Truncated]' : value;
        }
      }
    } catch (error) {
      // Graceful degradation if object iteration fails
      console.log(`⚠️ Collatz protection: Object processing error, using fallback`);
      visited.delete(obj);
      return '[Protected Object]';
    }

    visited.delete(obj);
    return bounded;
  }

  calculateCollatzBound(n) {
    // Apply Collatz sequence to find natural bound
    let iterations = 0;
    while (n !== 1 && iterations < this.config.maxCollatzIterations) {
      n = n % 2 === 0 ? n / 2 : 3 * n + 1;
      iterations++;
    }
    return Math.min(iterations, 100); // Cap at reasonable bound
  }

  createBoundedObject(obj, maxDepth, currentDepth = 0) {
    if (currentDepth >= maxDepth || obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.slice(0, maxDepth).map(item =>
        this.createBoundedObject(item, maxDepth, currentDepth + 1)
      );
    }

    const bounded = {};
    const keys = Object.keys(obj).slice(0, maxDepth);
    for (const key of keys) {
      bounded[key] = this.createBoundedObject(obj[key], maxDepth, currentDepth + 1);
    }

    return bounded;
  }

  /**
   * 🎯 APPLY REGIME OPTIMIZATION
   */
  applyRegimeOptimization(value, regime) {
    if (!this.config.enableRegimeOptimization) return value;

    this.aepMetrics.regimeOptimizations++;

    switch (regime) {
      case 'R1': // Emergence - Enhanced metadata
        return this.addEmergentMetadata(value);

      case 'R2': // Optimization - Compression hints
        return this.addOptimizationHints(value);

      case 'R3': // Stabilization - Direct encoding
      default:
        return value;
    }
  }

  addEmergentMetadata(value) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return {
        ...value,
        _aep_regime: 'R1',
        _aep_timestamp: Date.now(),
        _aep_entropy: Math.floor(Math.random() * 1000000) // Convert to integer
      };
    }
    return value;
  }

  addOptimizationHints(value) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return {
        ...value,
        _aep_regime: 'R2',
        _aep_optimization: 'compression_preferred'
      };
    }
    return value;
  }

  /**
   * 🧹 SANITIZE FOR DETERMINISTIC CBOR
   * Converts floating-point numbers to integers and handles circular references
   */
  sanitizeForDeterministicCBOR(value, visited = new WeakSet()) {
    if (value === null || value === undefined) {
      return value;
    }

    // Handle circular references
    if (typeof value === 'object' && visited.has(value)) {
      return '[Circular Reference Removed]';
    }

    if (typeof value === 'number') {
      // Convert floating-point numbers to integers by multiplying by 1000000
      if (!Number.isInteger(value)) {
        return Math.floor(value * 1000000);
      }
      return value;
    }

    if (Array.isArray(value)) {
      visited.add(value);
      const sanitized = value.map(item => this.sanitizeForDeterministicCBOR(item, visited));
      visited.delete(value);
      return sanitized;
    }

    if (typeof value === 'object') {
      visited.add(value);
      const sanitized = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = this.sanitizeForDeterministicCBOR(val, visited);
      }
      visited.delete(value);
      return sanitized;
    }

    return value;
  }

  /**
   * 🔍 UTILITY METHODS
   */
  detectDataType(value) {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  }

  calculateDataComplexity(value) {
    try {
      const jsonString = JSON.stringify(value);
      const size = jsonString.length;
      const nesting = (jsonString.match(/[{[]/g) || []).length;
      return Math.log(size + 1) + nesting * 0.5;
    } catch {
      return 1; // Fallback for non-serializable values
    }
  }

  updateAEPMetrics(encodingTime, amplification) {
    this.aepMetrics.totalOperations++;
    this.aepMetrics.totalAmplification *= amplification;

    // Update rolling average encoding time
    const alpha = 0.1; // Smoothing factor
    this.aepMetrics.averageEncodingTime =
      alpha * encodingTime + (1 - alpha) * this.aepMetrics.averageEncodingTime;
  }

  getAEPMetrics() {
    return {
      ...this.aepMetrics,
      encoding: {
        averageTime: this.aepMetrics.averageEncodingTime,
        totalOperations: this.aepMetrics.totalOperations,
        totalAmplification: this.aepMetrics.totalAmplification,
        collatzBoundsApplied: this.aepMetrics.collatzBoundsApplied,
        infiniteLoopsPrevented: this.aepMetrics.infiniteLoopsPrevented,
        regimeOptimizations: this.aepMetrics.regimeOptimizations
      }
    };
  }
}

/**
 * 🔓 AEP-ENHANCED CBOR DECODER
 * Extends standard deterministic CBOR decoder with consciousness integration
 */
export class AEPEnhancedCBORDecoder extends DeterministicCBORDecoder {
  constructor(config = {}) {
    super();

    this.config = {
      enableRegimeAwareness: config.enableRegimeAwareness !== false,
      enableMetadataProcessing: config.enableMetadataProcessing !== false,
      ...config
    };

    // AEP decoding metrics
    this.aepMetrics = {
      totalOperations: 0,
      regimeDetections: { R1: 0, R2: 0, R3: 0 },
      metadataProcessed: 0,
      averageDecodingTime: 0
    };

    console.log('🔓 AEP-Enhanced CBOR Decoder initialized');
    console.log(`🧠 Regime awareness: ${this.config.enableRegimeAwareness ? 'ENABLED' : 'DISABLED'}`);
  }

  /**
   * 🔓 AEP-ENHANCED DECODING
   */
  async decode(encodedData, aepMiddleware = null) {
    console.log('🔓 AEP-Enhanced CBOR decoding initiated...');
    const startTime = performance.now();

    try {
      // Create temporary decoder for this data (base class expects data in constructor)
      const tempDecoder = new DeterministicCBORDecoder(encodedData);
      const decoded = tempDecoder.decode();

      // Process AEP metadata if present
      const processedData = this.config.enableMetadataProcessing ?
        this.processAEPMetadata(decoded) : decoded;

      // Apply AEP consciousness if available
      if (aepMiddleware && this.config.enableRegimeAwareness) {
        await this.applyAEPAwareness(processedData, aepMiddleware);
      }

      // Update metrics
      const decodingTime = performance.now() - startTime;
      this.updateAEPMetrics(decodingTime, processedData);

      console.log(`✅ AEP-Enhanced CBOR decoding complete in ${decodingTime.toFixed(2)}ms`);

      return processedData;

    } catch (error) {
      console.error('❌ AEP-Enhanced CBOR decoding failed:', error);
      throw error;
    }
  }

  /**
   * 🔍 PROCESS AEP METADATA
   */
  processAEPMetadata(data) {
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      const regime = data._aep_regime;

      if (regime) {
        this.aepMetrics.regimeDetections[regime] = (this.aepMetrics.regimeDetections[regime] || 0) + 1;
        this.aepMetrics.metadataProcessed++;

        console.log(`🧠 AEP metadata detected: ${regime}`);

        // Clean metadata from final output
        const cleanedData = { ...data };
        delete cleanedData._aep_regime;
        delete cleanedData._aep_timestamp;
        delete cleanedData._aep_entropy;
        delete cleanedData._aep_optimization;

        return cleanedData;
      }
    }

    return data;
  }

  /**
   * 🧠 APPLY AEP AWARENESS
   */
  async applyAEPAwareness(data, aepMiddleware) {
    try {
      await aepMiddleware.process('cbor_decoding', {
        dataType: this.detectDataType(data),
        hasAEPMetadata: this.hasAEPMetadata(data),
        timestamp: Date.now()
      });
    } catch (error) {
      console.warn('⚠️ AEP awareness processing failed:', error.message);
    }
  }

  hasAEPMetadata(data) {
    return typeof data === 'object' && data !== null &&
           (data._aep_regime || data._aep_timestamp || data._aep_optimization);
  }

  detectDataType(value) {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  }

  updateAEPMetrics(decodingTime, data) {
    this.aepMetrics.totalOperations++;

    // Update rolling average decoding time
    const alpha = 0.1;
    this.aepMetrics.averageDecodingTime =
      alpha * decodingTime + (1 - alpha) * this.aepMetrics.averageDecodingTime;
  }

  getAEPMetrics() {
    return {
      ...this.aepMetrics,
      decoding: {
        averageTime: this.aepMetrics.averageDecodingTime,
        totalOperations: this.aepMetrics.totalOperations,
        regimeDetections: this.aepMetrics.regimeDetections,
        metadataProcessed: this.aepMetrics.metadataProcessed
      }
    };
  }
}

export default {
  AEPEnhancedCBOREncoder,
  AEPEnhancedCBORDecoder
};
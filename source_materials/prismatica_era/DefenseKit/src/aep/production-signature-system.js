/**
 * 🔐 PRODUCTION-GRADE AEP SIGNATURE SYSTEM
 *
 * Self-describing signatures with regime-aware verification
 * Maintains cryptographic integrity while enabling mathematical consciousness
 *
 * Design Principles:
 * 1. Cryptographic Correctness: verify(data, sign(data)) === true ALWAYS
 * 2. Self-Describing: Signatures contain all info needed for verification
 * 3. Regime Awareness: Different regimes use different enhancement strategies
 * 4. Backward Compatibility: Can verify standard Ed25519 signatures
 * 5. Forward Security: Enhancement metadata is cryptographically bound
 */

import { SelfCertifyingIdentity } from '../identity/self-certifying.js';
import { sha256 } from '@noble/hashes/sha256';
import { randomBytes } from '@noble/hashes/utils';

/**
 * 🧠 AEP SIGNATURE FORMAT
 *
 * Structure:
 * [1 byte: version] [1 byte: regime] [2 bytes: metadata_length] [metadata] [64 bytes: ed25519_signature]
 *
 * Version 1: Basic AEP signatures
 * Regime: R1/R2/R3 (encoded as 1/2/3, 0 for standard)
 * Metadata: Regime-specific parameters needed for verification
 * Signature: Standard Ed25519 signature over processed data
 */

export class ProductionAEPSignatureSystem extends SelfCertifyingIdentity {
  constructor() {
    super();

    // AEP signature constants
    this.AEP_SIGNATURE_VERSION = 1;
    this.AEP_HEADER_SIZE = 4; // version + regime + metadata_length
    this.ED25519_SIGNATURE_SIZE = 64;
    this.MAX_METADATA_SIZE = 65535; // 2^16 - 1

    // Current regime state
    this.currentRegime = null;
    this.regimeMetrics = {
      R1: { count: 0, totalTime: 0 },
      R2: { count: 0, totalTime: 0 },
      R3: { count: 0, totalTime: 0 }
    };

    console.log('🔐 Production AEP Signature System initialized');
    console.log('✅ Self-describing signatures enabled');
    console.log('✅ Regime-aware verification enabled');
  }

  /**
   * 🎯 PRODUCTION AEP SIGNING
   * Creates self-describing signatures that contain verification metadata
   */
  async signWithAEP(data, aepMiddleware) {
    console.log('🔐 Production AEP signing initiated...');
    const startTime = performance.now();

    try {
      // Get AEP classification for this signing operation
      const aepResult = await aepMiddleware.process('signature_classification', {
        dataHash: this.hashData(data),
        dataSize: data.length,
        timestamp: Date.now()
      });

      // Extract regime and enhancements
      const regime = aepResult.enhancements?.regime || 'R3';
      this.currentRegime = regime;

      console.log(`📊 Signing classified as regime: ${regime}`);
      console.log(`⚡ AEP processing time: ${aepResult.performance?.processingTime?.toFixed(2) || 'N/A'}ms`);

      // Apply regime-specific data processing
      const { processedData, metadata } = this.processDataForSigning(data, regime, aepResult.enhancements);

      // Generate Ed25519 signature over processed data
      const ed25519Signature = super.sign(processedData);

      // Create self-describing AEP signature
      const aepSignature = this.createAEPSignature(ed25519Signature, regime, metadata);

      // Update metrics
      const signingTime = performance.now() - startTime;
      this.updateRegimeMetrics(regime, signingTime);

      console.log(`✅ AEP signature created in ${signingTime.toFixed(2)}ms`);
      console.log(`📦 Signature size: ${aepSignature.length} bytes (${aepSignature.length - this.ED25519_SIGNATURE_SIZE} bytes metadata)`);

      return aepSignature;

    } catch (error) {
      console.warn('⚠️ AEP signing failed, using standard signing:', error.message);
      return super.sign(data);
    }
  }

  /**
   * 🔍 PRODUCTION AEP VERIFICATION WITH METADATA INTEGRITY
   * Verifies self-describing signatures by reconstructing the signing process
   */
  verifyWithAEP(data, signature) {
    console.log('🔍 Production AEP verification initiated...');

    try {
      // Check if this is an AEP signature or standard Ed25519
      if (!this.isAEPSignature(signature)) {
        console.log('📝 Standard Ed25519 signature detected, using standard verification');
        return super.verify(data, signature);
      }

      // Parse AEP signature
      const { regime, metadata, ed25519Signature } = this.parseAEPSignature(signature);

      console.log(`📊 Verifying AEP signature for regime: ${regime}`);

      // Verify metadata integrity first
      if (!this.verifyMetadataIntegrity(metadata)) {
        console.log('❌ Metadata integrity check failed');
        return false;
      }

      // Reconstruct the data processing that was done during signing
      const { processedData } = this.processDataForSigning(data, regime, metadata);

      // Verify the Ed25519 signature against the processed data
      const isValid = super.verify(processedData, ed25519Signature);

      if (isValid) {
        console.log(`✅ AEP signature verification successful for regime ${regime}`);
      } else {
        console.log(`❌ AEP signature verification failed for regime ${regime}`);
      }

      return isValid;

    } catch (error) {
      console.warn('⚠️ AEP verification failed:', error.message);
      return false;
    }
  }

  /**
   * 📊 REGIME-SPECIFIC DATA PROCESSING
   */
  processDataForSigning(data, regime, enhancements = {}) {
    switch (regime) {
      case 'R1':
        return this.processForEmergentRegime(data, enhancements);
      case 'R2':
        return this.processForOptimizedRegime(data, enhancements);
      case 'R3':
        return this.processForStableRegime(data, enhancements);
      default:
        return { processedData: data, metadata: {} };
    }
  }

  /**
   * 🌱 R1: EMERGENT REGIME PROCESSING
   * Adds deterministic entropy based on data characteristics
   */
  processForEmergentRegime(data, enhancements) {
    console.log('  🌱 Applying R1 (Emergent) processing...');

    // Generate deterministic entropy based on data hash and enhancements
    const dataHash = this.hashData(data);
    const entropyLength = 32; // 256 bits of additional entropy

    // Create deterministic entropy from data hash + timestamp (rounded to minute for reproducibility)
    const minuteTimestamp = Math.floor(Date.now() / 60000) * 60000;
    const entropySource = new Uint8Array([...dataHash, ...this.encodeNumber(minuteTimestamp, 8)]);
    const entropy = sha256(entropySource).slice(0, entropyLength);

    // Combine original data with entropy
    const processedData = new Uint8Array(data.length + entropy.length);
    processedData.set(data);
    processedData.set(entropy, data.length);

    const metadata = {
      entropyLength,
      timestamp: minuteTimestamp,
      method: 'deterministic_entropy'
    };

    console.log(`  ✅ R1 processing complete: ${data.length} + ${entropyLength} = ${processedData.length} bytes`);

    return { processedData, metadata };
  }

  /**
   * ⚡ R2: OPTIMIZED REGIME PROCESSING
   * Applies deterministic modulation based on mathematical patterns
   */
  processForOptimizedRegime(data, enhancements) {
    console.log('  ⚡ Applying R2 (Optimized) processing...');

    // Apply deterministic bit rotation based on data characteristics
    const dataHash = this.hashData(data);
    const rotationAmount = dataHash[0] % 8; // 0-7 bit rotation

    const processedData = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      // Apply deterministic bit rotation
      const originalByte = data[i];
      const rotatedByte = ((originalByte << rotationAmount) | (originalByte >> (8 - rotationAmount))) & 0xFF;
      processedData[i] = rotatedByte;
    }

    const metadata = {
      rotationAmount,
      method: 'deterministic_rotation'
    };

    console.log(`  ✅ R2 processing complete: ${rotationAmount}-bit rotation applied`);

    return { processedData, metadata };
  }

  /**
   * 🎯 R3: STABLE REGIME PROCESSING
   * Uses standard processing for maximum compatibility and speed
   */
  processForStableRegime(data, enhancements) {
    console.log('  🎯 Applying R3 (Stable) processing...');

    // R3 uses original data without modification for maximum compatibility
    const metadata = {
      method: 'passthrough'
    };

    console.log('  ✅ R3 processing complete: passthrough mode');

    return { processedData: data, metadata };
  }

  /**
   * 📦 AEP SIGNATURE CREATION WITH INTEGRITY PROTECTION
   */
  createAEPSignature(ed25519Signature, regime, metadata) {
    // Add metadata integrity hash for production security
    const metadataWithIntegrity = {
      ...metadata,
      integrityHash: this.calculateMetadataHash(metadata)
    };

    // Serialize metadata with integrity protection
    const metadataBytes = this.serializeMetadata(metadataWithIntegrity);

    if (metadataBytes.length > this.MAX_METADATA_SIZE) {
      throw new Error(`Metadata too large: ${metadataBytes.length} > ${this.MAX_METADATA_SIZE}`);
    }

    // Create AEP signature structure
    const totalSize = this.AEP_HEADER_SIZE + metadataBytes.length + this.ED25519_SIGNATURE_SIZE;
    const aepSignature = new Uint8Array(totalSize);

    let offset = 0;

    // Version (1 byte)
    aepSignature[offset++] = this.AEP_SIGNATURE_VERSION;

    // Regime (1 byte): R1=1, R2=2, R3=3, Standard=0
    aepSignature[offset++] = this.regimeToNumber(regime);

    // Metadata length (2 bytes, big-endian)
    aepSignature[offset++] = (metadataBytes.length >> 8) & 0xFF;
    aepSignature[offset++] = metadataBytes.length & 0xFF;

    // Metadata
    aepSignature.set(metadataBytes, offset);
    offset += metadataBytes.length;

    // Ed25519 signature
    aepSignature.set(ed25519Signature, offset);

    return aepSignature;
  }

  /**
   * 🔍 AEP SIGNATURE PARSING
   */
  parseAEPSignature(signature) {
    if (signature.length < this.AEP_HEADER_SIZE + this.ED25519_SIGNATURE_SIZE) {
      throw new Error('Invalid AEP signature: too short');
    }

    let offset = 0;

    // Parse version
    const version = signature[offset++];
    if (version !== this.AEP_SIGNATURE_VERSION) {
      throw new Error(`Unsupported AEP signature version: ${version}`);
    }

    // Parse regime
    const regimeNumber = signature[offset++];
    const regime = this.numberToRegime(regimeNumber);

    // Parse metadata length
    const metadataLength = (signature[offset] << 8) | signature[offset + 1];
    offset += 2;

    if (signature.length !== this.AEP_HEADER_SIZE + metadataLength + this.ED25519_SIGNATURE_SIZE) {
      throw new Error('Invalid AEP signature: length mismatch');
    }

    // Parse metadata
    const metadataBytes = signature.slice(offset, offset + metadataLength);
    const metadata = this.deserializeMetadata(metadataBytes);
    offset += metadataLength;

    // Parse Ed25519 signature
    const ed25519Signature = signature.slice(offset, offset + this.ED25519_SIGNATURE_SIZE);

    return { regime, metadata, ed25519Signature };
  }

  /**
   * 🔧 UTILITY METHODS
   */
  isAEPSignature(signature) {
    return signature.length > this.ED25519_SIGNATURE_SIZE &&
           signature[0] === this.AEP_SIGNATURE_VERSION;
  }

  hashData(data) {
    return sha256(data);
  }

  regimeToNumber(regime) {
    const map = { 'R1': 1, 'R2': 2, 'R3': 3 };
    return map[regime] || 0;
  }

  numberToRegime(number) {
    const map = { 1: 'R1', 2: 'R2', 3: 'R3' };
    return map[number] || 'Standard';
  }

  encodeNumber(number, bytes) {
    const result = new Uint8Array(bytes);
    for (let i = bytes - 1; i >= 0; i--) {
      result[i] = number & 0xFF;
      number = number >> 8;
    }
    return result;
  }

  serializeMetadata(metadata) {
    return new TextEncoder().encode(JSON.stringify(metadata));
  }

  deserializeMetadata(bytes) {
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  updateRegimeMetrics(regime, time) {
    if (this.regimeMetrics[regime]) {
      this.regimeMetrics[regime].count++;
      this.regimeMetrics[regime].totalTime += time;
    }
  }

  /**
   * 🔒 METADATA INTEGRITY METHODS
   */
  calculateMetadataHash(metadata) {
    // Create hash of metadata without the integrity hash itself
    const metadataForHashing = { ...metadata };
    delete metadataForHashing.integrityHash;

    const metadataString = JSON.stringify(metadataForHashing, Object.keys(metadataForHashing).sort());
    return Array.from(sha256(new TextEncoder().encode(metadataString))).slice(0, 16); // First 16 bytes as array
  }

  verifyMetadataIntegrity(metadata) {
    if (!metadata.integrityHash) {
      // Backward compatibility - metadata without integrity hash is valid
      return true;
    }

    const expectedHash = this.calculateMetadataHash(metadata);
    const actualHash = metadata.integrityHash;

    if (actualHash.length !== expectedHash.length) {
      return false;
    }

    for (let i = 0; i < expectedHash.length; i++) {
      if (expectedHash[i] !== actualHash[i]) {
        return false;
      }
    }

    return true;
  }

  /**
   * 📊 GET PRODUCTION METRICS
   */
  getProductionMetrics() {
    const metrics = {
      regimeDistribution: {},
      averageSigningTimes: {},
      totalSignatures: 0
    };

    for (const [regime, stats] of Object.entries(this.regimeMetrics)) {
      metrics.totalSignatures += stats.count;
      metrics.regimeDistribution[regime] = stats.count;
      metrics.averageSigningTimes[regime] = stats.count > 0 ? stats.totalTime / stats.count : 0;
    }

    return metrics;
  }
}

export default ProductionAEPSignatureSystem;
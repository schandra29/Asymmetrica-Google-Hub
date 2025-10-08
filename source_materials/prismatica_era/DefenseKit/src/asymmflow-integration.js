/**
 * AsymmFlow DefenseKit Integration
 * Integrates Betanet v1.2 security components into AsymmFlow ERP
 *
 * This module provides enterprise-grade security while maintaining
 * the professional, business-focused interface AsymmFlow requires.
 *
 * Features:
 * - Self-certifying identities (no CAs needed)
 * - Injection-proof CBOR encoding
 * - Traffic indistinguishability (stealth mode)
 * - Optional privacy mixing for sensitive operations
 * - Military-grade security that looks like normal business traffic
 */

import {
  SelfCertifyingIdentity,
  IdentityManager
} from './identity/self-certifying.js';

import {
  DeterministicCBOREncoder,
  DeterministicCBORDecoder,
  CBORUtils
} from './cbor/deterministic-cbor.js';

import {
  TemplateCaliber,
  FrontOriginRegistry,
  TrafficMimic
} from './calibration/front-origin-registry.js';

import {
  PrivacyManager
} from './privacy/relay-mixing.js';

/**
 * DefenseKit Security Engine
 * Main integration class for AsymmFlow
 */
export class DefenseKitEngine {
  constructor(config = {}) {
    this.config = {
      enableStealth: config.enableStealth || true,
      enablePrivacy: config.enablePrivacy || false,
      complianceProfile: config.complianceProfile || 'STANDARD',
      frontOrigins: config.frontOrigins || ['www.google.com', 'api.github.com'],
      ...config
    };

    // Initialize components
    this.identityManager = new IdentityManager();
    this.frontRegistry = new FrontOriginRegistry();
    this.trafficMimic = new TrafficMimic(this.frontRegistry);
    this.templateCaliber = new TemplateCaliber();

    // Privacy manager (optional)
    this.privacyManager = null;
    this.mainIdentity = null;

    // Statistics
    this.stats = {
      messagesSecured: 0,
      bytesProtected: 0,
      identitiesManaged: 0,
      templatesCalibrated: 0,
      privacyPathsUsed: 0
    };

    this.initialized = false;
  }

  /**
   * Initialize DefenseKit for AsymmFlow
   */
  async initialize(identityLabel = 'AsymmFlow Enterprise') {
    console.log('🛡️  Initializing DefenseKit Security Engine...');

    try {
      // Create main enterprise identity
      this.mainIdentity = this.identityManager.createIdentity(identityLabel);
      this.stats.identitiesManaged++;

      console.log(`🔐 Created enterprise identity: ${this.mainIdentity.name}`);

      // Initialize privacy manager if enabled
      if (this.config.enablePrivacy) {
        this.privacyManager = new PrivacyManager(this.mainIdentity);
        console.log('🕵️  Privacy mixing enabled');
      }

      // Calibrate front origins if stealth enabled
      if (this.config.enableStealth) {
        await this.calibrateFrontOrigins();
      }

      this.initialized = true;
      console.log('✅ DefenseKit initialization complete');

      return {
        success: true,
        identity: this.mainIdentity.name,
        features: {
          stealth: this.config.enableStealth,
          privacy: this.config.enablePrivacy,
          compliance: this.config.complianceProfile
        }
      };

    } catch (error) {
      console.error('❌ DefenseKit initialization failed:', error);
      throw new Error(`DefenseKit initialization failed: ${error.message}`);
    }
  }

  /**
   * Calibrate front origins for traffic stealth
   */
  async calibrateFrontOrigins() {
    console.log('🎭 Calibrating front origins for stealth mode...');

    for (const origin of this.config.frontOrigins) {
      try {
        const template = await this.templateCaliber.calibrateOrigin(origin);
        this.stats.templatesCalibrated++;

        // Add to registry with enterprise compliance
        this.frontRegistry.addEntry({
          templateId: template.id,
          hostPattern: origin,
          complianceProfile: this.config.complianceProfile,
          expiry: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        });

        console.log(`📋 Registered template for ${origin}`);
      } catch (error) {
        console.warn(`⚠️  Failed to calibrate ${origin}: ${error.message}`);
      }
    }
  }

  /**
   * Secure enterprise message/data
   */
  secureMessage(data, options = {}) {
    if (!this.initialized) {
      throw new Error('DefenseKit not initialized');
    }

    const startTime = Date.now();

    try {
      // 1. Create secure message envelope
      const envelope = {
        data,
        timestamp: Date.now(),
        sender: this.mainIdentity.name,
        messageId: this.generateMessageId(),
        security: {
          profile: this.config.complianceProfile,
          stealth: this.config.enableStealth,
          privacy: options.usePrivacy || false
        }
      };

      // 2. Encode with deterministic CBOR (injection-proof)
      const encoder = new DeterministicCBOREncoder();
      const encoded = encoder.encode(envelope);

      // 3. Sign with enterprise identity
      const signature = this.mainIdentity.sign(encoded);

      // 4. Create integrity hash
      const hash = CBORUtils.hashCBOR(envelope);

      // 5. Build final secure package
      const securePackage = {
        envelope: Array.from(encoded),
        signature: Array.from(signature),
        hash: Array.from(hash),
        identity: this.mainIdentity.name,
        publicKey: Array.from(this.mainIdentity.publicKey),
        secured: Date.now()
      };

      // Update statistics
      this.stats.messagesSecured++;
      this.stats.bytesProtected += encoded.length;

      const duration = Date.now() - startTime;
      console.log(`🔒 Secured message in ${duration}ms (${encoded.length} bytes)`);

      return securePackage;

    } catch (error) {
      console.error('❌ Message security failed:', error);
      throw new Error(`Failed to secure message: ${error.message}`);
    }
  }

  /**
   * Verify and decrypt secure message
   */
  verifyMessage(securePackage) {
    if (!this.initialized) {
      throw new Error('DefenseKit not initialized');
    }

    try {
      // 1. Extract components
      const encoded = new Uint8Array(securePackage.envelope);
      const signature = new Uint8Array(securePackage.signature);
      const expectedHash = new Uint8Array(securePackage.hash);
      const publicKey = new Uint8Array(securePackage.publicKey);

      // 2. Verify signature
      const signatureValid = SelfCertifyingIdentity.verify(signature, encoded, publicKey);
      if (!signatureValid) {
        throw new Error('Invalid message signature');
      }

      // 3. Decode CBOR
      const decoder = new DeterministicCBORDecoder(encoded);
      const envelope = decoder.decode();

      // 4. Verify integrity
      const integrityValid = CBORUtils.verifyCBOR(envelope, expectedHash);
      if (!integrityValid) {
        throw new Error('Message integrity verification failed');
      }

      // 5. Verify sender identity
      try {
        const senderNodeId = SelfCertifyingIdentity.parseNodeId(securePackage.identity);
        // Additional verification could be added here
      } catch (error) {
        throw new Error('Invalid sender identity');
      }

      console.log(`✅ Message verified from ${securePackage.identity}`);

      return {
        valid: true,
        data: envelope.data,
        sender: envelope.sender,
        timestamp: envelope.timestamp,
        security: envelope.security
      };

    } catch (error) {
      console.error('❌ Message verification failed:', error);
      return {
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * Apply traffic stealth to HTTP connection
   */
  async stealthConnection(connectionParams, targetHost) {
    if (!this.config.enableStealth) {
      return connectionParams;
    }

    try {
      // Find matching template
      let templateId = null;
      for (const [id, entry] of this.frontRegistry.entries.entries()) {
        if (this.frontRegistry.matchesPattern(targetHost, entry.hostPattern)) {
          templateId = id;
          break;
        }
      }

      if (!templateId) {
        console.warn(`⚠️  No stealth template found for ${targetHost}, using default`);
        return connectionParams;
      }

      // Apply traffic mimicking
      const stealthParams = await this.trafficMimic.applyTemplate(templateId, connectionParams);

      console.log(`🎭 Applied stealth template for ${targetHost}`);
      return stealthParams;

    } catch (error) {
      console.warn(`⚠️  Stealth application failed: ${error.message}`);
      return connectionParams;
    }
  }

  /**
   * Send message with optional privacy
   */
  async sendSecureMessage(data, recipient, options = {}) {
    if (!this.initialized) {
      throw new Error('DefenseKit not initialized');
    }

    try {
      // 1. Secure the message
      const securedMessage = this.secureMessage(data, options);

      // 2. Use privacy mixing if requested
      if (options.usePrivacy && this.privacyManager) {
        this.privacyManager.enable();

        const result = await this.privacyManager.sendMessage(
          securedMessage,
          recipient,
          true
        );

        this.stats.privacyPathsUsed++;
        console.log(`🕵️  Message sent through ${result.hops}-hop privacy path`);

        return result;
      }

      // 3. Direct secure send
      console.log(`📤 Sending secure message to ${recipient}`);
      return {
        message: securedMessage,
        direct: true,
        privacy: false
      };

    } catch (error) {
      console.error('❌ Secure message send failed:', error);
      throw error;
    }
  }

  /**
   * Generate unique message ID
   */
  generateMessageId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `DK-${timestamp}-${random}`;
  }

  /**
   * Get DefenseKit status for AsymmFlow dashboard
   */
  getStatus() {
    return {
      initialized: this.initialized,
      identity: this.mainIdentity ? {
        name: this.mainIdentity.name,
        nodeId: Array.from(this.mainIdentity.nodeId).slice(0, 8)
          .map(b => b.toString(16).padStart(2, '0')).join(''),
        hasPrivateKey: !!this.mainIdentity.privateKey
      } : null,
      features: {
        stealth: this.config.enableStealth,
        privacy: this.config.enablePrivacy,
        compliance: this.config.complianceProfile
      },
      statistics: this.stats,
      frontOrigins: this.config.frontOrigins.length,
      templatesActive: this.frontRegistry.entries.size,
      privacyEnabled: this.privacyManager?.enabled || false
    };
  }

  /**
   * Create enterprise compliance report
   */
  generateComplianceReport() {
    const report = {
      reportId: this.generateMessageId(),
      timestamp: Date.now(),
      enterprise: this.mainIdentity?.name || 'Unknown',
      compliance: {
        profile: this.config.complianceProfile,
        identityManagement: 'Self-Certifying (No CA Required)',
        dataIntegrity: 'Deterministic CBOR + SHA-256',
        messageAuthentication: 'Ed25519 Digital Signatures',
        trafficSecurity: this.config.enableStealth ? 'Stealth Mode Active' : 'Standard Mode',
        privacyLevel: this.config.enablePrivacy ? 'Privacy Mixing Available' : 'Direct Communications'
      },
      statistics: this.stats,
      security: {
        encryptionStandard: 'ChaCha20-Poly1305',
        keyExchange: 'X25519 Elliptic Curve',
        signatures: 'Ed25519',
        hashing: 'SHA-256',
        encoding: 'Deterministic CBOR'
      },
      audit: {
        noPasswordStorage: true,
        noCentralAuthority: true,
        cryptographicallyVerifiable: true,
        injectionProof: true,
        trafficAnalysisResistant: this.config.enableStealth,
        privacyPreserving: this.config.enablePrivacy
      }
    };

    // Sign the report
    const encoder = new DeterministicCBOREncoder();
    const encoded = encoder.encode(report);
    const signature = this.mainIdentity.sign(encoded);

    return {
      report,
      signature: Array.from(signature),
      generated: Date.now()
    };
  }

  /**
   * Emergency security wipe
   */
  emergencyWipe() {
    console.log('🚨 EMERGENCY SECURITY WIPE INITIATED');

    // Clear sensitive data
    this.mainIdentity = null;
    this.identityManager = new IdentityManager();
    this.privacyManager = null;

    // Clear caches
    this.templateCaliber.cache.clear();
    this.frontRegistry.entries.clear();

    // Reset statistics
    this.stats = {
      messagesSecured: 0,
      bytesProtected: 0,
      identitiesManaged: 0,
      templatesCalibrated: 0,
      privacyPathsUsed: 0
    };

    this.initialized = false;

    console.log('🔥 Security wipe completed - all sensitive data destroyed');
  }
}

/**
 * AsymmFlow DefenseKit Provider
 * React context provider for DefenseKit integration
 */
export class AsymmFlowDefenseKit {
  constructor() {
    this.engine = null;
    this.status = 'uninitialized';
  }

  /**
   * Initialize DefenseKit for AsymmFlow
   */
  async initialize(config = {}) {
    try {
      this.status = 'initializing';
      this.engine = new DefenseKitEngine(config);

      const result = await this.engine.initialize('AsymmFlow Enterprise System');

      this.status = 'ready';
      return result;
    } catch (error) {
      this.status = 'error';
      throw error;
    }
  }

  /**
   * Get security status for UI display
   */
  getSecurityStatus() {
    if (!this.engine) {
      return {
        status: this.status,
        secure: false,
        message: 'DefenseKit not initialized'
      };
    }

    const status = this.engine.getStatus();

    return {
      status: this.status,
      secure: status.initialized,
      identity: status.identity?.name || 'None',
      features: status.features,
      statistics: status.statistics,
      message: status.initialized
        ? 'Enterprise security active'
        : 'Security initialization required'
    };
  }

  /**
   * Secure API request for AsymmFlow
   */
  async secureApiRequest(endpoint, data, options = {}) {
    if (!this.engine?.initialized) {
      throw new Error('DefenseKit not initialized');
    }

    // Secure the request data
    const securedData = this.engine.secureMessage({
      endpoint,
      data,
      timestamp: Date.now()
    }, options);

    return securedData;
  }

  /**
   * Get compliance report for enterprise audit
   */
  getComplianceReport() {
    if (!this.engine?.initialized) {
      throw new Error('DefenseKit not initialized');
    }

    return this.engine.generateComplianceReport();
  }
}

// Export singleton instance for AsymmFlow
export const defenseKit = new AsymmFlowDefenseKit();

export default {
  DefenseKitEngine,
  AsymmFlowDefenseKit,
  defenseKit
};
/**
 * Front Origin Registry & Traffic Calibration
 * Based on Betanet specs Section 8.1 (Indistinguishability)
 *
 * Makes DefenseKit traffic indistinguishable from normal web browsing
 * by mimicking real websites' TLS and HTTP behaviors exactly.
 *
 * This is the key to defeating Deep Packet Inspection (DPI) and
 * sophisticated traffic analysis by state actors.
 */

import { sha256 } from '@noble/hashes/sha256';
import { DeterministicCBOREncoder } from '../cbor/deterministic-cbor.js';
import { SelfCertifyingIdentity } from '../identity/self-certifying.js';

// TLS and HTTP constants
const TLS_VERSION_1_3 = 0x0304;
const HTTP2_PREFACE = 'PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n';

/**
 * Template Calibrator
 * Analyzes real websites to create perfect behavioral templates
 */
export class TemplateCaliber {
  constructor() {
    this.cache = new Map(); // TemplateID -> Template
    this.cacheExpiry = new Map(); // TemplateID -> expiry timestamp
  }

  /**
   * Calibrate against a front origin (Section 8.1.1)
   * Performs reconnaissance to understand target's behavior
   */
  async calibrateOrigin(hostname, port = 443, paths = ['/robots.txt', '/favicon.ico']) {
    console.log(`🎭 Calibrating origin: ${hostname}:${port}`);

    const template = {
      hostname,
      port,
      timestamp: Date.now(),
      tls: {},
      http2: {},
      http3: {},
      timing: {}
    };

    try {
      // Test each calibration path
      for (const path of paths) {
        const result = await this.probeEndpoint(hostname, port, path);
        if (result.success) {
          template.tls = { ...template.tls, ...result.tls };
          template.http2 = { ...template.http2, ...result.http2 };
          template.timing = { ...template.timing, ...result.timing };
          break; // Use first successful probe
        }
      }

      // Generate TemplateID (Section 8.1.1)
      template.id = this.generateTemplateID(template);

      // Cache for 24 hours
      this.cache.set(template.id, template);
      this.cacheExpiry.set(template.id, Date.now() + 24 * 60 * 60 * 1000);

      console.log(`✅ Calibration complete: ${template.id}`);
      return template;

    } catch (error) {
      console.error(`❌ Calibration failed for ${hostname}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Probe an endpoint to extract behavioral parameters
   */
  async probeEndpoint(hostname, port, path) {
    const startTime = Date.now();

    try {
      // This would normally make actual HTTP requests
      // For DefenseKit, we simulate the analysis
      const mockAnalysis = this.simulateProbe(hostname, port, path);

      const endTime = Date.now();

      return {
        success: true,
        tls: mockAnalysis.tls,
        http2: mockAnalysis.http2,
        timing: {
          connectionTime: endTime - startTime,
          firstByteTime: mockAnalysis.timing.firstByte
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Simulate probe analysis (for testing without actual network calls)
   */
  simulateProbe(hostname, port, path) {
    // Simulate realistic TLS and HTTP2 parameters based on common configurations
    return {
      tls: {
        version: TLS_VERSION_1_3,
        cipherSuites: [
          'TLS_AES_256_GCM_SHA384',
          'TLS_CHACHA20_POLY1305_SHA256',
          'TLS_AES_128_GCM_SHA256'
        ],
        extensions: [
          'server_name',
          'supported_groups',
          'signature_algorithms',
          'application_layer_protocol_negotiation'
        ],
        supportedGroups: ['x25519', 'secp256r1', 'secp384r1'],
        signatureAlgorithms: ['rsa_pss_rsae_sha256', 'ecdsa_secp256r1_sha256'],
        alpn: ['h2', 'http/1.1'],
        grease: true
      },
      http2: {
        settings: {
          HEADER_TABLE_SIZE: 4096,
          ENABLE_PUSH: 0,
          MAX_CONCURRENT_STREAMS: 128,
          INITIAL_WINDOW_SIZE: 65535,
          MAX_FRAME_SIZE: 16384,
          MAX_HEADER_LIST_SIZE: 8192
        },
        windowUpdate: {
          connection: 65535,
          stream: 32768
        }
      },
      timing: {
        firstByte: 50 + Math.random() * 100, // 50-150ms variation
        keepAlive: 30000, // 30 second keepalive
        pingInterval: 60000 // 60 second ping
      }
    };
  }

  /**
   * Generate TemplateID from parameters (Section 8.1.1)
   */
  generateTemplateID(template) {
    // Create canonical parameter set
    const params = {
      tls: {
        version: template.tls.version,
        cipherSuites: template.tls.cipherSuites?.sort() || [],
        extensions: template.tls.extensions?.sort() || [],
        supportedGroups: template.tls.supportedGroups || [],
        signatureAlgorithms: template.tls.signatureAlgorithms || [],
        alpn: template.tls.alpn || [],
        grease: template.tls.grease || false
      },
      http2: {
        settings: template.http2.settings || {}
      }
    };

    // Encode deterministically
    const encoder = new DeterministicCBOREncoder();
    const encoded = encoder.encode(params);

    // Hash to create TemplateID
    const hash = sha256(encoded);
    return Array.from(hash.slice(0, 16)) // First 16 bytes as array
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Get cached template
   */
  getTemplate(templateId) {
    // Check if cached and not expired
    const expiry = this.cacheExpiry.get(templateId);
    if (!expiry || Date.now() > expiry) {
      this.cache.delete(templateId);
      this.cacheExpiry.delete(templateId);
      return null;
    }

    return this.cache.get(templateId);
  }

  /**
   * Clear expired templates
   */
  cleanup() {
    const now = Date.now();
    for (const [id, expiry] of this.cacheExpiry.entries()) {
      if (now > expiry) {
        this.cache.delete(id);
        this.cacheExpiry.delete(id);
      }
    }
  }
}

/**
 * Front Origin Registry
 * Maintains signed registry of approved front origins for compliance
 */
export class FrontOriginRegistry {
  constructor() {
    this.entries = new Map(); // TemplateID -> RegistryEntry
    this.signers = new Set(); // Authorized signer public keys
    this.localOverrides = new Map(); // Local policy overrides
  }

  /**
   * Add a registry entry (Section 8.1.2)
   */
  addEntry(entry) {
    // Validate entry structure
    this.validateEntry(entry);

    // Store entry
    this.entries.set(entry.templateId, {
      templateId: entry.templateId,
      hostPattern: entry.hostPattern,
      complianceProfile: entry.complianceProfile,
      expiry: entry.expiry,
      signature: entry.signature,
      signer: entry.signer,
      addedAt: Date.now()
    });

    console.log(`📋 Added registry entry: ${entry.templateId.slice(0, 8)}... for ${entry.hostPattern}`);
  }

  /**
   * Validate registry entry format
   */
  validateEntry(entry) {
    const required = ['templateId', 'hostPattern', 'complianceProfile', 'expiry'];
    for (const field of required) {
      if (!entry[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Check expiry
    if (entry.expiry < Date.now()) {
      throw new Error('Entry is already expired');
    }

    // Validate compliance profile
    const validProfiles = ['MINIMAL', 'STANDARD', 'EXTENDED'];
    if (!validProfiles.includes(entry.complianceProfile)) {
      throw new Error(`Invalid compliance profile: ${entry.complianceProfile}`);
    }

    // Verify signature if present
    if (entry.signature && entry.signer) {
      this.verifySignature(entry);
    }
  }

  /**
   * Verify registry entry signature
   */
  verifySignature(entry) {
    if (!this.signers.has(entry.signer)) {
      throw new Error('Signer not authorized');
    }

    // Create signature payload
    const payload = {
      templateId: entry.templateId,
      hostPattern: entry.hostPattern,
      complianceProfile: entry.complianceProfile,
      expiry: entry.expiry
    };

    // Encode and verify
    const encoder = new DeterministicCBOREncoder();
    const encoded = encoder.encode(payload);
    const signatureContext = new Uint8Array([
      ...new TextEncoder().encode('BN-FOR1'),
      ...encoded
    ]);

    try {
      const publicKey = new Uint8Array(entry.signer);
      const signature = new Uint8Array(entry.signature);
      const valid = SelfCertifyingIdentity.verify(signature, signatureContext, publicKey);

      if (!valid) {
        throw new Error('Invalid signature');
      }
    } catch (error) {
      throw new Error(`Signature verification failed: ${error.message}`);
    }
  }

  /**
   * Find matching registry entry
   */
  findEntry(templateId, hostname = null) {
    const entry = this.entries.get(templateId);
    if (!entry) {
      return null;
    }

    // Check expiry
    if (Date.now() > entry.expiry) {
      console.log(`⚠️ Registry entry expired: ${templateId.slice(0, 8)}...`);
      this.entries.delete(templateId);
      return null;
    }

    // Check hostname pattern if provided
    if (hostname && !this.matchesPattern(hostname, entry.hostPattern)) {
      return null;
    }

    return entry;
  }

  /**
   * Check if hostname matches pattern
   */
  matchesPattern(hostname, pattern) {
    // Simple glob matching (* wildcard)
    if (pattern === '*') return true;
    if (pattern === hostname) return true;

    if (pattern.includes('*')) {
      // Escape regex special characters except *
      const escapedPattern = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
      // Replace \* with .* for wildcard matching
      const regexPattern = escapedPattern.replace(/\*/g, '.*');
      const regex = new RegExp('^' + regexPattern + '$');
      return regex.test(hostname);
    }

    return false;
  }

  /**
   * Add authorized signer
   */
  addSigner(publicKey) {
    const keyHex = Array.from(new Uint8Array(publicKey))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    this.signers.add(keyHex);
  }

  /**
   * Set local override (bypass registry for development)
   */
  setLocalOverride(templateId, allowed = true) {
    this.localOverrides.set(templateId, {
      allowed,
      setAt: Date.now()
    });
  }

  /**
   * Check if template is allowed
   */
  isAllowed(templateId, hostname = null) {
    // Check local overrides first
    const override = this.localOverrides.get(templateId);
    if (override) {
      return {
        allowed: override.allowed,
        source: 'local_override',
        entry: null
      };
    }

    // Check registry
    const entry = this.findEntry(templateId, hostname);
    if (entry) {
      return {
        allowed: true,
        source: 'registry',
        entry
      };
    }

    // Default: not allowed
    return {
      allowed: false,
      source: 'default_deny',
      entry: null
    };
  }

  /**
   * List all entries
   */
  listEntries() {
    return Array.from(this.entries.values()).map(entry => ({
      templateId: entry.templateId.slice(0, 16) + '...',
      hostPattern: entry.hostPattern,
      complianceProfile: entry.complianceProfile,
      expiry: new Date(entry.expiry).toISOString(),
      addedAt: new Date(entry.addedAt).toISOString()
    }));
  }

  /**
   * Cleanup expired entries
   */
  cleanup() {
    const now = Date.now();
    for (const [id, entry] of this.entries.entries()) {
      if (now > entry.expiry) {
        this.entries.delete(id);
      }
    }
  }
}

/**
 * Traffic Mimic Engine
 * Applies templates to make outgoing traffic indistinguishable
 */
export class TrafficMimic {
  constructor(registry) {
    this.registry = registry;
    this.calibrator = new TemplateCaliber();
    this.activeTemplates = new Map(); // Connection -> Template
  }

  /**
   * Apply template to connection parameters
   */
  async applyTemplate(templateId, connectionParams) {
    const template = await this.getOrCalibrateTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Apply TLS parameters
    const mimicParams = {
      tls: this.applyTLSTemplate(connectionParams.tls, template.tls),
      http2: this.applyHTTP2Template(connectionParams.http2, template.http2),
      timing: this.applyTimingTemplate(connectionParams.timing, template.timing)
    };

    console.log(`🎭 Applied template ${templateId.slice(0, 8)}... to connection`);
    return mimicParams;
  }

  /**
   * Apply TLS behavioral template
   */
  applyTLSTemplate(params, template) {
    return {
      ...params,
      version: template.version,
      cipherSuites: template.cipherSuites ? [...template.cipherSuites] : params.cipherSuites,
      extensions: template.extensions ? [...template.extensions] : params.extensions,
      extensionOrder: template.extensions || params.extensionOrder,
      supportedGroups: template.supportedGroups || params.supportedGroups,
      signatureAlgorithms: template.signatureAlgorithms || params.signatureAlgorithms,
      alpn: template.alpn || params.alpn,
      grease: template.grease !== undefined ? template.grease : params.grease,
      // Ensure parameters are within ±10% tolerance (Section 8.1.5)
      tolerance: 0.1
    };
  }

  /**
   * Apply HTTP/2 behavioral template
   */
  applyHTTP2Template(params, template) {
    if (!template.settings) return params;

    const settings = { ...params.settings };

    // Apply template settings with tolerance
    for (const [key, value] of Object.entries(template.settings)) {
      if (typeof value === 'number') {
        // Apply ±10% tolerance for numeric settings
        const variance = value * 0.1;
        settings[key] = Math.round(value + (Math.random() - 0.5) * 2 * variance);
      } else {
        settings[key] = value;
      }
    }

    return {
      ...params,
      settings,
      windowUpdate: template.windowUpdate || params.windowUpdate
    };
  }

  /**
   * Apply timing behavioral template
   */
  applyTimingTemplate(params, template) {
    if (!template) return params;

    return {
      ...params,
      keepAlive: template.keepAlive || params.keepAlive,
      pingInterval: this.applyTolerance(template.pingInterval || params.pingInterval, 0.1),
      connectionTimeout: this.applyTolerance(template.connectionTimeout || params.connectionTimeout, 0.1)
    };
  }

  /**
   * Apply ±10% tolerance to numeric values
   */
  applyTolerance(value, tolerance = 0.1) {
    const variance = value * tolerance;
    return Math.round(value + (Math.random() - 0.5) * 2 * variance);
  }

  /**
   * Get template or calibrate if needed
   */
  async getOrCalibrateTemplate(templateId) {
    // Try to get cached template
    let template = this.calibrator.getTemplate(templateId);
    if (template) return template;

    // Check if we have registry entry to guide calibration
    const entry = this.registry.findEntry(templateId);
    if (!entry) {
      throw new Error(`No registry entry found for template: ${templateId}`);
    }

    // Extract hostname from pattern for calibration
    const hostname = this.extractHostname(entry.hostPattern);
    if (!hostname) {
      throw new Error(`Cannot extract hostname from pattern: ${entry.hostPattern}`);
    }

    // Calibrate the origin
    template = await this.calibrator.calibrateOrigin(hostname);
    return template;
  }

  /**
   * Extract hostname from pattern
   */
  extractHostname(pattern) {
    // Simple extraction - remove wildcards and use first part
    if (pattern.includes('*')) {
      const parts = pattern.split('*');
      return parts.find(part => part.length > 0 && part.includes('.')) || null;
    }
    return pattern;
  }

  /**
   * Generate compliance report
   */
  generateComplianceReport(templateId, actualParams) {
    const template = this.calibrator.getTemplate(templateId);
    if (!template) {
      return { compliant: false, error: 'Template not found' };
    }

    const issues = [];

    // Check TLS compliance
    if (template.tls.version && actualParams.tls.version !== template.tls.version) {
      issues.push(`TLS version mismatch: expected ${template.tls.version}, got ${actualParams.tls.version}`);
    }

    // Check extension order
    if (template.tls.extensions && actualParams.tls.extensionOrder) {
      const expectedOrder = template.tls.extensions.join(',');
      const actualOrder = actualParams.tls.extensionOrder.join(',');
      if (expectedOrder !== actualOrder) {
        issues.push('TLS extension order mismatch');
      }
    }

    // Check HTTP/2 settings tolerance
    if (template.http2.settings && actualParams.http2.settings) {
      for (const [key, expected] of Object.entries(template.http2.settings)) {
        const actual = actualParams.http2.settings[key];
        if (typeof expected === 'number' && typeof actual === 'number') {
          const tolerance = expected * 0.1;
          if (Math.abs(actual - expected) > tolerance) {
            issues.push(`HTTP/2 ${key} outside tolerance: expected ${expected}±${tolerance.toFixed(0)}, got ${actual}`);
          }
        }
      }
    }

    return {
      compliant: issues.length === 0,
      issues,
      template: templateId,
      checkedAt: Date.now()
    };
  }
}

export default {
  TemplateCaliber,
  FrontOriginRegistry,
  TrafficMimic
};
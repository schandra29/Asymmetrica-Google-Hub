/**
 * Template Calibration System
 * Based on Betanet specs Section 8.1
 * 
 * Detect MITM attacks by fingerprinting server behavior
 * and verifying consistency across connections
 */

import { sha256 } from '@noble/hashes/sha256';
import { DeterministicCBOREncoder } from '../cbor/deterministic-cbor.js';

// Constants from Section 8.1
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const TOLERANCE_PERCENT = 10; // ±10% for numeric values
const CALIBRATION_PATHS = ['/robots.txt', '/favicon.ico'];

/**
 * Template Calibration System
 * 
 * Captures server behavior to create a fingerprint (TemplateID)
 * that can detect when connections are hijacked
 */
export class TemplateCalibration {
  constructor() {
    this.cache = new Map();
    this.alerts = [];
    this.cborEncoder = new DeterministicCBOREncoder();
  }
  
  /**
   * Perform calibration fetch to capture server parameters
   * Section 8.1.1
   */
  async calibrate(hostname, options = {}) {
    const startTime = Date.now();
    
    try {
      // Check cache first
      const cached = this.getFromCache(hostname);
      if (cached && !options.forceRefresh) {
        return cached;
      }
      
      // Select calibration path
      const path = options.path || CALIBRATION_PATHS[0];
      const url = `https://${hostname}${path}`;
      
      // Capture TLS and HTTP parameters
      const parameters = await this.captureParameters(url, options);
      
      // Generate TemplateID
      const templateId = this.generateTemplateId(parameters);
      
      // Create template record
      const template = {
        hostname,
        templateId,
        parameters,
        captured: startTime,
        expires: startTime + CACHE_DURATION,
        calibrationPath: path
      };
      
      // Cache the template
      this.cache.set(hostname, template);
      
      // Check for changes if we had a previous template
      if (cached && cached.templateId !== templateId) {
        this.alertTemplateChange(hostname, cached, template);
      }
      
      return template;
    } catch (error) {
      throw new Error(`Calibration failed for ${hostname}: ${error.message}`);
    }
  }
  
  /**
   * Capture server parameters for fingerprinting
   * Section 8.1.1 and 8.1.3
   */
  async captureParameters(url, options = {}) {
    const parameters = {
      tls: {},
      http2: {},
      http3: {},
      timing: {},
      headers: {}
    };
    
    // Perform fetch with detailed observation
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeout || 10000);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        // Note: In production, we'd use a lower-level API to capture TLS details
        // For now, we'll simulate with what's available in the browser
      });
      
      clearTimeout(timeout);
      
      // Capture response headers (these are observable)
      parameters.headers = this.captureHeaders(response.headers);
      
      // Capture timing information
      if (performance && performance.getEntriesByName) {
        const entries = performance.getEntriesByName(url);
        if (entries.length > 0) {
          const timing = entries[entries.length - 1];
          parameters.timing = this.captureTiming(timing);
        }
      }
      
      // In a real implementation, we would capture:
      // - TLS cipher suites via connection info
      // - ALPN negotiation results
      // - HTTP/2 SETTINGS frames
      // - QUIC transport parameters for HTTP/3
      
      // Simulate TLS parameters (in production, use TLS connection info)
      parameters.tls = await this.simulateTLSCapture(url);
      
      // Simulate HTTP/2 settings (in production, capture actual frames)
      if (response.headers.get('alt-svc')?.includes('h2')) {
        parameters.http2 = this.simulateHTTP2Settings();
      }
      
      return parameters;
    } finally {
      clearTimeout(timeout);
    }
  }
  
  /**
   * Capture observable HTTP headers
   */
  captureHeaders(headers) {
    const captured = {};
    const relevantHeaders = [
      'server',
      'x-powered-by',
      'strict-transport-security',
      'x-frame-options',
      'x-content-type-options',
      'content-security-policy',
      'alt-svc'
    ];
    
    for (const header of relevantHeaders) {
      const value = headers.get(header);
      if (value) {
        captured[header] = value;
      }
    }
    
    return captured;
  }
  
  /**
   * Capture timing characteristics
   */
  captureTiming(entry) {
    return {
      dns: Math.round(entry.domainLookupEnd - entry.domainLookupStart),
      tcp: Math.round(entry.connectEnd - entry.connectStart),
      tls: Math.round(entry.requestStart - entry.connectEnd),
      ttfb: Math.round(entry.responseStart - entry.requestStart),
      total: Math.round(entry.responseEnd - entry.fetchStart)
    };
  }
  
  /**
   * Simulate TLS parameter capture
   * In production, this would use actual TLS connection info
   */
  async simulateTLSCapture(url) {
    // In a real implementation, we'd capture:
    return {
      version: 'TLS 1.3',
      cipherSuite: 'TLS_AES_128_GCM_SHA256',
      alpn: ['h2', 'http/1.1'],
      supportedGroups: ['x25519', 'secp256r1', 'secp384r1'],
      signatureAlgorithms: [
        'ecdsa_secp256r1_sha256',
        'rsa_pss_rsae_sha256',
        'rsa_pkcs1_sha256'
      ],
      serverCertificateType: 'X.509',
      compressionMethods: ['none'],
      extensions: [
        'server_name',
        'status_request',
        'supported_groups',
        'ec_point_formats',
        'signature_algorithms',
        'alpn',
        'signed_certificate_timestamp',
        'key_share',
        'psk_key_exchange_modes',
        'supported_versions'
      ]
    };
  }
  
  /**
   * Simulate HTTP/2 settings capture
   * Section 8.1.3
   */
  simulateHTTP2Settings() {
    return {
      SETTINGS_ENABLE_PUSH: 0,
      SETTINGS_MAX_CONCURRENT_STREAMS: 100,
      SETTINGS_INITIAL_WINDOW_SIZE: 65535,
      SETTINGS_MAX_FRAME_SIZE: 16384,
      SETTINGS_MAX_HEADER_LIST_SIZE: 8192,
      SETTINGS_HEADER_TABLE_SIZE: 4096
    };
  }
  
  /**
   * Generate TemplateID from parameters
   * Section 8.1.1 - SHA-256 of deterministic CBOR encoding
   */
  generateTemplateId(parameters) {
    // Sort and canonicalize parameters
    const canonical = this.canonicalizeParameters(parameters);
    
    // Encode with deterministic CBOR
    const encoded = this.cborEncoder.encode(canonical);
    
    // Return SHA-256 hash
    return sha256(encoded);
  }
  
  /**
   * Canonicalize parameters for consistent hashing
   */
  canonicalizeParameters(params) {
    const canonical = {};
    
    // Sort top-level keys
    const sortedKeys = Object.keys(params).sort();
    
    for (const key of sortedKeys) {
      const value = params[key];
      
      if (typeof value === 'object' && value !== null) {
        // Recursively canonicalize nested objects
        canonical[key] = this.canonicalizeParameters(value);
      } else if (Array.isArray(value)) {
        // Sort arrays for consistency
        canonical[key] = value.slice().sort();
      } else {
        canonical[key] = value;
      }
    }
    
    return canonical;
  }
  
  /**
   * Verify a connection matches the expected template
   * Section 8.1.5 - Compliance verification
   */
  async verifyConnection(hostname, currentParameters) {
    const template = this.getFromCache(hostname);
    
    if (!template) {
      // No template cached, perform calibration
      return await this.calibrate(hostname);
    }
    
    // Generate TemplateID for current parameters
    const currentTemplateId = this.generateTemplateId(currentParameters);
    
    // Compare with cached template
    const matches = this.compareTemplateIds(template.templateId, currentTemplateId);
    
    if (!matches) {
      // Check if parameters are within tolerance
      const withinTolerance = this.checkTolerance(
        template.parameters,
        currentParameters
      );
      
      if (!withinTolerance) {
        this.alertTemplateChange(hostname, template, {
          templateId: currentTemplateId,
          parameters: currentParameters
        });
        
        return {
          valid: false,
          error: 'Template mismatch detected - possible MITM',
          expected: template.templateId,
          actual: currentTemplateId
        };
      }
    }
    
    return {
      valid: true,
      templateId: template.templateId
    };
  }
  
  /**
   * Check if parameters are within tolerance
   * Section 8.1.5 - ±10% for numeric values
   */
  checkTolerance(expected, actual) {
    for (const key in expected) {
      const expectedValue = expected[key];
      const actualValue = actual[key];
      
      if (typeof expectedValue === 'number' && typeof actualValue === 'number') {
        const tolerance = expectedValue * (TOLERANCE_PERCENT / 100);
        const diff = Math.abs(expectedValue - actualValue);
        
        if (diff > tolerance) {
          return false;
        }
      } else if (typeof expectedValue === 'object' && expectedValue !== null) {
        if (!this.checkTolerance(expectedValue, actualValue || {})) {
          return false;
        }
      } else if (expectedValue !== actualValue) {
        // Non-numeric values must match exactly
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Compare TemplateIDs in constant time
   */
  compareTemplateIds(expected, actual) {
    if (expected.length !== actual.length) {
      return false;
    }
    
    let equal = true;
    for (let i = 0; i < expected.length; i++) {
      if (expected[i] !== actual[i]) {
        equal = false;
      }
    }
    
    return equal;
  }
  
  /**
   * Get template from cache if valid
   */
  getFromCache(hostname) {
    const cached = this.cache.get(hostname);
    
    if (!cached) {
      return null;
    }
    
    // Check if expired
    if (Date.now() > cached.expires) {
      this.cache.delete(hostname);
      return null;
    }
    
    return cached;
  }
  
  /**
   * Alert on template change (potential MITM)
   */
  alertTemplateChange(hostname, oldTemplate, newTemplate) {
    const alert = {
      timestamp: Date.now(),
      hostname,
      severity: 'HIGH',
      message: `Template change detected for ${hostname}`,
      oldTemplateId: this.bytesToHex(oldTemplate.templateId),
      newTemplateId: this.bytesToHex(newTemplate.templateId),
      changes: this.identifyChanges(oldTemplate.parameters, newTemplate.parameters)
    };
    
    this.alerts.push(alert);
    
    // Emit event for monitoring
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('template-change', { detail: alert }));
    }
    
    console.error('[SECURITY ALERT]', alert.message, alert);
    
    return alert;
  }
  
  /**
   * Identify what changed between templates
   */
  identifyChanges(oldParams, newParams, path = '') {
    const changes = [];
    
    // Check for removed keys
    for (const key in oldParams) {
      if (!(key in newParams)) {
        changes.push({
          path: path ? `${path}.${key}` : key,
          type: 'removed',
          oldValue: oldParams[key]
        });
      }
    }
    
    // Check for added or changed keys
    for (const key in newParams) {
      const fullPath = path ? `${path}.${key}` : key;
      
      if (!(key in oldParams)) {
        changes.push({
          path: fullPath,
          type: 'added',
          newValue: newParams[key]
        });
      } else if (typeof newParams[key] === 'object' && newParams[key] !== null) {
        // Recursively check nested objects
        const nestedChanges = this.identifyChanges(
          oldParams[key],
          newParams[key],
          fullPath
        );
        changes.push(...nestedChanges);
      } else if (oldParams[key] !== newParams[key]) {
        changes.push({
          path: fullPath,
          type: 'modified',
          oldValue: oldParams[key],
          newValue: newParams[key]
        });
      }
    }
    
    return changes;
  }
  
  /**
   * Convert bytes to hex for display
   */
  bytesToHex(bytes) {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  
  /**
   * Get current alerts
   */
  getAlerts(since = 0) {
    return this.alerts.filter(alert => alert.timestamp > since);
  }
  
  /**
   * Clear alerts
   */
  clearAlerts() {
    this.alerts = [];
  }
  
  /**
   * Export cache for persistence
   */
  exportCache() {
    const exported = [];
    
    for (const [hostname, template] of this.cache) {
      exported.push({
        hostname,
        templateId: Array.from(template.templateId),
        parameters: template.parameters,
        captured: template.captured,
        expires: template.expires,
        calibrationPath: template.calibrationPath
      });
    }
    
    return exported;
  }
  
  /**
   * Import cache from persistence
   */
  importCache(data) {
    for (const item of data) {
      if (item.expires > Date.now()) {
        this.cache.set(item.hostname, {
          ...item,
          templateId: new Uint8Array(item.templateId)
        });
      }
    }
  }
}

/**
 * Template Registry - Manage known good templates
 */
export class TemplateRegistry {
  constructor() {
    this.registry = new Map();
    this.signatures = new Map();
  }
  
  /**
   * Register a known good template
   */
  register(hostname, templateId, metadata = {}) {
    this.registry.set(hostname, {
      templateId,
      metadata,
      registered: Date.now()
    });
  }
  
  /**
   * Check if a template is registered
   */
  isRegistered(hostname, templateId) {
    const registered = this.registry.get(hostname);
    
    if (!registered) {
      return false;
    }
    
    // Compare template IDs
    const registeredId = registered.templateId;
    if (registeredId.length !== templateId.length) {
      return false;
    }
    
    for (let i = 0; i < registeredId.length; i++) {
      if (registeredId[i] !== templateId[i]) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Get all registered templates
   */
  getAll() {
    const all = [];
    for (const [hostname, data] of this.registry) {
      all.push({
        hostname,
        ...data
      });
    }
    return all;
  }
}

export default {
  TemplateCalibration,
  TemplateRegistry,
  CACHE_DURATION,
  TOLERANCE_PERCENT
};
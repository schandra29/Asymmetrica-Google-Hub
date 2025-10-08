/**
 * DefenseKit v1.0
 * Military-grade defensive security components for legitimate businesses
 * 
 * Ethical security that protects without hiding
 */

// HTX v1.2 - Enhanced Unhackable Authentication
export {
  HTXConnection,
  HTXServer,
  HTXClient,
  PROTOCOL_NAME as HTX_PROTOCOL,
  KEY_SIZE as HTX_KEY_SIZE,
  ROTATION_BYTES as HTX_ROTATION_BYTES,
  ROTATION_TIME as HTX_ROTATION_TIME
} from './src/htx-v2/htx-protocol.js';

// Deterministic CBOR - Canonical Binary Encoding
export {
  DeterministicCBOREncoder,
  DeterministicCBORDecoder,
  CBORUtils
} from './src/cbor/deterministic-cbor.js';

// Self-Certifying Identity - Decentralized Identity System
export {
  SelfCertifyingIdentity,
  IdentityManager,
  Base32
} from './src/identity/self-certifying.js';

// Template Calibration - MITM Detection
export {
  TemplateCalibration,
  TemplateRegistry,
  CACHE_DURATION as TEMPLATE_CACHE_DURATION,
  TOLERANCE_PERCENT as TEMPLATE_TOLERANCE
} from './src/calibration/template-calibration.js';

// Replay Protection - Request Deduplication
export {
  ReplayProtectionShield,
  ReplayProtectionMiddleware,
  ReplayProtectionClient,
  LRUCache,
  WINDOW_SIZE as REPLAY_WINDOW_SIZE,
  CLOCK_SKEW as REPLAY_CLOCK_SKEW
} from './src/replay/replay-protection.js';

/**
 * Quick Start Examples
 */
export const Examples = {
  /**
   * Create a new self-certifying identity
   */
  createIdentity() {
    const { SelfCertifyingIdentity } = this;
    const identity = new SelfCertifyingIdentity();
    console.log('Created identity:', identity.name);
    return identity;
  },
  
  /**
   * Set up HTX server
   */
  async setupHTXServer(privateKey) {
    const { HTXServer } = this;
    const server = new HTXServer(privateKey);
    console.log('HTX Server ready with public key:', server.getPublicKey());
    return server;
  },
  
  /**
   * Enable replay protection
   */
  setupReplayProtection() {
    const { ReplayProtectionShield } = this;
    const shield = new ReplayProtectionShield({
      windowSize: 600000, // 10 minutes
      clockSkew: 120000   // 2 minutes
    });
    console.log('Replay protection enabled');
    return shield;
  },
  
  /**
   * Calibrate server template
   */
  async calibrateServer(hostname) {
    const { TemplateCalibration } = this;
    const calibration = new TemplateCalibration();
    const template = await calibration.calibrate(hostname);
    console.log('Server calibrated:', template.templateId);
    return template;
  },
  
  /**
   * Encode data with deterministic CBOR
   */
  encodeData(data) {
    const { DeterministicCBOREncoder } = this;
    const encoder = new DeterministicCBOREncoder();
    const encoded = encoder.encode(data);
    console.log('Data encoded to', encoded.length, 'bytes');
    return encoded;
  }
};

/**
 * DefenseKit Configuration
 */
export const Config = {
  // Version
  version: '1.0.0',
  
  // Security Levels
  securityLevels: {
    STANDARD: {
      htx: { rotationBytes: 64 * 1024 * 1024, rotationTime: 15 * 60 * 1000 },
      replay: { windowSize: 600000, clockSkew: 120000 },
      template: { cacheDuration: 24 * 60 * 60 * 1000, tolerance: 10 }
    },
    HIGH: {
      htx: { rotationBytes: 32 * 1024 * 1024, rotationTime: 5 * 60 * 1000 },
      replay: { windowSize: 300000, clockSkew: 60000 },
      template: { cacheDuration: 12 * 60 * 60 * 1000, tolerance: 5 }
    },
    PARANOID: {
      htx: { rotationBytes: 16 * 1024 * 1024, rotationTime: 60 * 1000 },
      replay: { windowSize: 60000, clockSkew: 30000 },
      template: { cacheDuration: 60 * 60 * 1000, tolerance: 0 }
    }
  },
  
  // Default configuration
  defaults: {
    securityLevel: 'STANDARD',
    enableHTX: true,
    enableReplay: true,
    enableCalibration: true,
    enableIdentity: true,
    useCBOR: true
  }
};

/**
 * Initialize DefenseKit with configuration
 */
export function initialize(options = {}) {
  const config = { ...Config.defaults, ...options };
  const level = Config.securityLevels[config.securityLevel] || Config.securityLevels.STANDARD;
  
  const components = {};
  
  if (config.enableIdentity) {
    components.identityManager = new IdentityManager();
  }
  
  if (config.enableReplay) {
    components.replayShield = new ReplayProtectionShield(level.replay);
  }
  
  if (config.enableCalibration) {
    components.templateCalibration = new TemplateCalibration();
    components.templateRegistry = new TemplateRegistry();
  }
  
  if (config.useCBOR) {
    components.cborEncoder = new DeterministicCBOREncoder();
    components.cborDecoder = DeterministicCBORDecoder;
  }
  
  console.log(`DefenseKit v${Config.version} initialized with ${config.securityLevel} security`);
  
  return components;
}

// Default export
export default {
  // Core Components
  HTXConnection,
  HTXServer,
  HTXClient,
  DeterministicCBOREncoder,
  DeterministicCBORDecoder,
  CBORUtils,
  SelfCertifyingIdentity,
  IdentityManager,
  TemplateCalibration,
  TemplateRegistry,
  ReplayProtectionShield,
  ReplayProtectionMiddleware,
  ReplayProtectionClient,
  
  // Utilities
  Examples,
  Config,
  initialize,
  
  // Info
  version: '1.0.0',
  description: 'Military-grade defensive security for legitimate businesses'
};
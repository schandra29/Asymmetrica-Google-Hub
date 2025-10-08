/**
 * Self-Certifying Identity System
 * Based on Betanet specs Section 11.1
 * 
 * Decentralized identity without certificate authorities
 * The identity IS the public key - no third parties needed
 */

import { ed25519 } from '@noble/curves/ed25519';
import { sha256 } from '@noble/hashes/sha256';
import { randomBytes } from '@noble/hashes/utils';

// Constants from Section 11.1
const NODE_ID_LENGTH = 20; // 160 bits
const CHECKSUM_LENGTH = 4;
const NAME_PREFIX = 'dk1:'; // DefenseKit v1

/**
 * Base32 encoding (RFC 4648) without padding
 * Used for human-readable identity strings
 */
class Base32 {
  static ALPHABET = 'abcdefghijklmnopqrstuvwxyz234567';
  
  static encode(bytes) {
    let result = '';
    let buffer = 0;
    let bufferLength = 0;
    
    for (const byte of bytes) {
      buffer = (buffer << 8) | byte;
      bufferLength += 8;
      
      while (bufferLength >= 5) {
        const index = (buffer >> (bufferLength - 5)) & 0x1F;
        result += this.ALPHABET[index];
        bufferLength -= 5;
      }
    }
    
    if (bufferLength > 0) {
      const index = (buffer << (5 - bufferLength)) & 0x1F;
      result += this.ALPHABET[index];
    }
    
    return result;
  }
  
  static decode(str) {
    const bytes = [];
    let buffer = 0;
    let bufferLength = 0;
    
    for (const char of str.toLowerCase()) {
      const value = this.ALPHABET.indexOf(char);
      if (value === -1) {
        throw new Error(`Invalid base32 character: ${char}`);
      }
      
      buffer = (buffer << 5) | value;
      bufferLength += 5;
      
      while (bufferLength >= 8) {
        bytes.push((buffer >> (bufferLength - 8)) & 0xFF);
        bufferLength -= 8;
      }
    }
    
    return new Uint8Array(bytes);
  }
}

/**
 * Self-Certifying Identity
 * 
 * An identity that proves itself without external validation
 */
export class SelfCertifyingIdentity {
  constructor(privateKey = null) {
    if (privateKey) {
      this.privateKey = privateKey;
      this.publicKey = ed25519.getPublicKey(privateKey);
    } else {
      // Generate new identity
      this.privateKey = ed25519.utils.randomPrivateKey();
      this.publicKey = ed25519.getPublicKey(this.privateKey);
    }
    
    // Derive NodeID from public key
    this.nodeId = this.deriveNodeId(this.publicKey);
    
    // Generate human-readable name
    this.name = this.generateName(this.nodeId);
    
    // Store creation timestamp
    this.created = Date.now();
  }
  
  /**
   * Derive NodeID from public key (Section 11.1)
   * NodeID = SHA-256(Ed25519 public key) truncated to 160 bits
   */
  deriveNodeId(publicKey) {
    const hash = sha256(publicKey);
    return hash.slice(0, NODE_ID_LENGTH);
  }
  
  /**
   * Generate human-readable name (Section 11.1)
   * Format: "dk1:" + base32(NodeID || checksum[4])
   */
  generateName(nodeId) {
    // Calculate checksum
    const checksumData = new Uint8Array([
      ...new TextEncoder().encode('DK-NAME'),
      ...nodeId
    ]);
    const checksum = sha256(checksumData).slice(0, CHECKSUM_LENGTH);
    
    // Combine NodeID and checksum
    const nameData = new Uint8Array([...nodeId, ...checksum]);
    
    // Encode to base32
    const encoded = Base32.encode(nameData);
    
    return NAME_PREFIX + encoded;
  }
  
  /**
   * Parse a name back to NodeID
   */
  static parseNodeId(name) {
    if (!name.startsWith(NAME_PREFIX)) {
      throw new Error(`Invalid name prefix, expected ${NAME_PREFIX}`);
    }
    
    const encoded = name.slice(NAME_PREFIX.length);
    const decoded = Base32.decode(encoded);
    
    if (decoded.length !== NODE_ID_LENGTH + CHECKSUM_LENGTH) {
      throw new Error('Invalid name length');
    }
    
    const nodeId = decoded.slice(0, NODE_ID_LENGTH);
    const checksum = decoded.slice(NODE_ID_LENGTH);
    
    // Verify checksum
    const expectedChecksum = sha256(
      new Uint8Array([
        ...new TextEncoder().encode('DK-NAME'),
        ...nodeId
      ])
    ).slice(0, CHECKSUM_LENGTH);
    
    for (let i = 0; i < CHECKSUM_LENGTH; i++) {
      if (checksum[i] !== expectedChecksum[i]) {
        throw new Error('Invalid name checksum');
      }
    }
    
    return nodeId;
  }
  
  /**
   * Sign data with this identity
   */
  sign(data) {
    if (!this.privateKey) {
      throw new Error('Private key required for signing');
    }
    
    const message = typeof data === 'string' 
      ? new TextEncoder().encode(data)
      : new Uint8Array(data);
    
    return ed25519.sign(message, this.privateKey);
  }
  
  /**
   * Verify a signature from this identity
   */
  verify(data, signature) {
    const message = typeof data === 'string'
      ? new TextEncoder().encode(data)
      : new Uint8Array(data);

    return ed25519.verify(signature, message, this.publicKey);
  }

  /**
   * Static method to verify signature with any public key
   */
  static verify(signature, data, publicKey) {
    const message = typeof data === 'string'
      ? new TextEncoder().encode(data)
      : new Uint8Array(data);

    return ed25519.verify(signature, message, publicKey);
  }
  
  /**
   * Create a verifiable claim
   */
  createClaim(claimData) {
    const claim = {
      issuer: this.name,
      nodeId: Array.from(this.nodeId),
      publicKey: Array.from(this.publicKey),
      data: claimData,
      timestamp: Date.now(),
      nonce: Array.from(randomBytes(16))
    };
    
    // Sign the claim
    const claimBytes = new TextEncoder().encode(JSON.stringify({
      issuer: claim.issuer,
      data: claim.data,
      timestamp: claim.timestamp,
      nonce: claim.nonce
    }));
    
    claim.signature = Array.from(this.sign(claimBytes));
    
    return claim;
  }
  
  /**
   * Verify a claim from any identity
   */
  static verifyClaim(claim) {
    try {
      // Extract NodeID from name
      const nodeId = this.parseNodeId(claim.issuer);
      
      // Verify NodeID matches
      const claimNodeId = new Uint8Array(claim.nodeId);
      for (let i = 0; i < NODE_ID_LENGTH; i++) {
        if (nodeId[i] !== claimNodeId[i]) {
          return { valid: false, error: 'NodeID mismatch' };
        }
      }
      
      // Verify public key derives to NodeID
      const publicKey = new Uint8Array(claim.publicKey);
      const derivedNodeId = sha256(publicKey).slice(0, NODE_ID_LENGTH);
      for (let i = 0; i < NODE_ID_LENGTH; i++) {
        if (derivedNodeId[i] !== nodeId[i]) {
          return { valid: false, error: 'Public key does not match NodeID' };
        }
      }
      
      // Verify signature
      const claimBytes = new TextEncoder().encode(JSON.stringify({
        issuer: claim.issuer,
        data: claim.data,
        timestamp: claim.timestamp,
        nonce: claim.nonce
      }));
      
      const signature = new Uint8Array(claim.signature);
      const valid = ed25519.verify(signature, claimBytes, publicKey);
      
      if (!valid) {
        return { valid: false, error: 'Invalid signature' };
      }
      
      // Check timestamp freshness (optional, 24 hour window)
      const age = Date.now() - claim.timestamp;
      if (age > 24 * 60 * 60 * 1000) {
        return { valid: true, warning: 'Claim is older than 24 hours' };
      }
      
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
  
  /**
   * Export identity for storage
   */
  export(includePrivate = false) {
    const exported = {
      name: this.name,
      nodeId: Array.from(this.nodeId),
      publicKey: Array.from(this.publicKey),
      created: this.created
    };
    
    if (includePrivate && this.privateKey) {
      exported.privateKey = Array.from(this.privateKey);
    }
    
    return exported;
  }
  
  /**
   * Import identity from storage
   */
  static import(data) {
    if (data.privateKey) {
      const privateKey = new Uint8Array(data.privateKey);
      const identity = new SelfCertifyingIdentity(privateKey);
      identity.created = data.created || Date.now();
      return identity;
    } else {
      // Public identity only (for verification)
      const identity = Object.create(SelfCertifyingIdentity.prototype);
      identity.privateKey = null;
      identity.publicKey = new Uint8Array(data.publicKey);
      identity.nodeId = new Uint8Array(data.nodeId);
      identity.name = data.name;
      identity.created = data.created || Date.now();
      return identity;
    }
  }
  
  /**
   * Get identity info for display
   */
  getInfo() {
    return {
      name: this.name,
      nodeId: Array.from(this.nodeId).map(b => b.toString(16).padStart(2, '0')).join(''),
      publicKey: Array.from(this.publicKey).map(b => b.toString(16).padStart(2, '0')).join(''),
      hasPrivateKey: !!this.privateKey,
      created: new Date(this.created).toISOString()
    };
  }
}

/**
 * Identity Manager - Handles multiple identities
 */
export class IdentityManager {
  constructor() {
    this.identities = new Map();
    this.defaultIdentity = null;
  }
  
  /**
   * Create a new identity
   */
  createIdentity(label = null) {
    const identity = new SelfCertifyingIdentity();
    const id = identity.name;
    
    this.identities.set(id, {
      identity,
      label: label || `Identity ${this.identities.size + 1}`,
      created: Date.now(),
      lastUsed: Date.now()
    });
    
    if (!this.defaultIdentity) {
      this.defaultIdentity = id;
    }
    
    return identity;
  }
  
  /**
   * Import an identity
   */
  importIdentity(data, label = null) {
    const identity = SelfCertifyingIdentity.import(data);
    const id = identity.name;
    
    if (this.identities.has(id)) {
      throw new Error('Identity already exists');
    }
    
    this.identities.set(id, {
      identity,
      label: label || `Imported ${new Date().toISOString()}`,
      created: identity.created,
      lastUsed: Date.now()
    });
    
    return identity;
  }
  
  /**
   * Get identity by name
   */
  getIdentity(name) {
    const entry = this.identities.get(name);
    if (!entry) {
      throw new Error(`Identity not found: ${name}`);
    }
    
    entry.lastUsed = Date.now();
    return entry.identity;
  }
  
  /**
   * Get default identity
   */
  getDefault() {
    if (!this.defaultIdentity) {
      throw new Error('No default identity set');
    }
    return this.getIdentity(this.defaultIdentity);
  }
  
  /**
   * Set default identity
   */
  setDefault(name) {
    if (!this.identities.has(name)) {
      throw new Error(`Identity not found: ${name}`);
    }
    this.defaultIdentity = name;
  }
  
  /**
   * List all identities
   */
  listIdentities() {
    const list = [];
    for (const [id, entry] of this.identities) {
      list.push({
        name: id,
        label: entry.label,
        isDefault: id === this.defaultIdentity,
        created: entry.created,
        lastUsed: entry.lastUsed,
        hasPrivateKey: !!entry.identity.privateKey
      });
    }
    return list;
  }
  
  /**
   * Remove an identity
   */
  removeIdentity(name) {
    if (name === this.defaultIdentity) {
      // Select a new default
      this.defaultIdentity = null;
      for (const id of this.identities.keys()) {
        if (id !== name) {
          this.defaultIdentity = id;
          break;
        }
      }
    }
    
    return this.identities.delete(name);
  }
  
  /**
   * Export all identities for backup
   */
  exportAll(includePrivate = false) {
    const backup = {
      version: '1.0',
      defaultIdentity: this.defaultIdentity,
      identities: []
    };
    
    for (const [id, entry] of this.identities) {
      backup.identities.push({
        name: id,
        label: entry.label,
        created: entry.created,
        lastUsed: entry.lastUsed,
        data: entry.identity.export(includePrivate)
      });
    }
    
    return backup;
  }
  
  /**
   * Import backup
   */
  importBackup(backup) {
    if (backup.version !== '1.0') {
      throw new Error('Unsupported backup version');
    }
    
    for (const item of backup.identities) {
      if (!this.identities.has(item.name)) {
        const identity = SelfCertifyingIdentity.import(item.data);
        this.identities.set(item.name, {
          identity,
          label: item.label,
          created: item.created,
          lastUsed: item.lastUsed
        });
      }
    }
    
    if (backup.defaultIdentity && !this.defaultIdentity) {
      this.defaultIdentity = backup.defaultIdentity;
    }
  }
}

export default {
  SelfCertifyingIdentity,
  IdentityManager,
  Base32
};
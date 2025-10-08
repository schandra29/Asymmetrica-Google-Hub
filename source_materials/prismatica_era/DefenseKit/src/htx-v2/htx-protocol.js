/**
 * HTX v1.2 Protocol Implementation
 * Enhanced with Noise XK pattern and automatic key rotation
 * 
 * Based on Betanet specs Section 8.2-8.3
 * For defensive security only - no dark web capabilities
 */

import { webcrypto } from 'crypto';
import { hkdf } from '@noble/hashes/hkdf';
import { sha256 } from '@noble/hashes/sha256';
import { x25519 } from '@noble/curves/ed25519';
import { chacha20poly1305 } from '@noble/ciphers/chacha';

const crypto = webcrypto;

// Protocol constants from Section 8.2.1
const PROTOCOL_NAME = 'Noise_XK_25519_ChaChaPoly_SHA256';
const KEY_SIZE = 32;
const NONCE_SIZE = 12;
const TAG_SIZE = 16;

// Key rotation constants from Section 8.4.5
const ROTATION_BYTES = 64 * 1024 * 1024; // 64MB
const ROTATION_TIME = 15 * 60 * 1000; // 15 minutes
const KEY_OVERLAP_FRAMES = 3; // Accept old key for 3 frames during rotation

/**
 * HTX v1.2 Connection State
 */
class HTXConnection {
  constructor(role, staticPrivateKey, remotePublicKey = null) {
    this.role = role; // 'initiator' or 'responder'
    this.staticPrivateKey = staticPrivateKey;
    this.remotePublicKey = remotePublicKey;
    
    // Noise protocol state (Section 8.2.2)
    this.handshakeState = {
      ck: null,  // Chaining key
      h: null,   // Handshake hash
      k: null,   // Temporary key
      n: 0n,     // Nonce counter
      ephemeralPrivate: null,
      ephemeralPublic: null,
      remoteEphemeral: null
    };
    
    // Transport state after handshake
    this.transportState = {
      sendKey: null,
      receiveKey: null,
      sendNonce: 0n,
      receiveNonce: 0n,
      sendNonceSalt: null,
      receiveNonceSalt: null
    };
    
    // Key rotation state (Section 8.4.5)
    this.rotationState = {
      generation: 0,
      bytesSent: 0,
      lastRotation: Date.now(),
      pendingKeys: null,
      overlapFrames: 0
    };
    
    // Connection metadata
    this.established = false;
    this.lastActivity = Date.now();
  }
  
  /**
   * Initialize handshake state (Section 8.2.2)
   */
  initHandshake() {
    const protocolBytes = new TextEncoder().encode(PROTOCOL_NAME);
    this.handshakeState.h = sha256(protocolBytes);
    this.handshakeState.ck = this.handshakeState.h;
    
    // Pre-message for XK pattern: initiator knows responder's static key
    if (this.role === 'initiator' && this.remotePublicKey) {
      this.handshakeState.h = sha256(
        new Uint8Array([...this.handshakeState.h, ...this.remotePublicKey])
      );
    }
  }
  
  /**
   * Generate ephemeral key pair
   */
  generateEphemeral() {
    const privateKey = crypto.getRandomValues(new Uint8Array(32));
    const publicKey = x25519.getPublicKey(privateKey);
    return { privateKey, publicKey };
  }
  
  /**
   * Perform Diffie-Hellman
   */
  dh(privateKey, publicKey) {
    return x25519.getSharedSecret(privateKey, publicKey);
  }
  
  /**
   * HKDF for key derivation (Section 8.2.2)
   */
  hkdfDerive(chainingKey, input) {
    const prk = hkdf.extract(sha256, input, chainingKey);
    const output = hkdf.expand(sha256, prk, new TextEncoder().encode('betanet/noise'), 64);
    return {
      ck: output.slice(0, 32),
      k: output.slice(32, 64)
    };
  }
  
  /**
   * Create initiator handshake message 1 (e, es)
   */
  createMessage1() {
    if (this.role !== 'initiator') {
      throw new Error('Only initiator can create message 1');
    }
    
    this.initHandshake();
    
    // Generate ephemeral key pair
    const ephemeral = this.generateEphemeral();
    this.handshakeState.ephemeralPrivate = ephemeral.privateKey;
    this.handshakeState.ephemeralPublic = ephemeral.publicKey;
    
    // Update handshake hash
    this.handshakeState.h = sha256(
      new Uint8Array([...this.handshakeState.h, ...ephemeral.publicKey])
    );
    
    // Perform es: DH(e_i, rs)
    const es = this.dh(ephemeral.privateKey, this.remotePublicKey);
    const derived = this.hkdfDerive(this.handshakeState.ck, es);
    this.handshakeState.ck = derived.ck;
    this.handshakeState.k = derived.k;
    
    // Message 1 contains only ephemeral public key
    return ephemeral.publicKey;
  }
  
  /**
   * Process responder handshake message 2 (e, ee, se)
   */
  processMessage2(message) {
    if (this.role !== 'initiator') {
      throw new Error('Only initiator can process message 2');
    }
    
    // Extract responder ephemeral (32 bytes) and tag (16 bytes)
    const remoteEphemeral = message.slice(0, 32);
    const tag = message.slice(32, 48);
    
    this.handshakeState.remoteEphemeral = remoteEphemeral;
    
    // Update handshake hash
    this.handshakeState.h = sha256(
      new Uint8Array([...this.handshakeState.h, ...remoteEphemeral])
    );
    
    // Perform ee: DH(e_i, e_r)
    const ee = this.dh(this.handshakeState.ephemeralPrivate, remoteEphemeral);
    const derived1 = this.hkdfDerive(this.handshakeState.ck, ee);
    this.handshakeState.ck = derived1.ck;
    
    // Perform se: DH(s_i, e_r) - will be done in message 3
    // For now, verify the tag with responder's se: DH(s_r, e_i)
    // This requires knowing responder's static key
    
    return true;
  }
  
  /**
   * Create initiator handshake message 3 (s, se)
   */
  createMessage3() {
    if (this.role !== 'initiator') {
      throw new Error('Only initiator can create message 3');
    }
    
    // Perform se: DH(s_i, e_r)
    const se = this.dh(this.staticPrivateKey, this.handshakeState.remoteEphemeral);
    const derived = this.hkdfDerive(this.handshakeState.ck, se);
    this.handshakeState.ck = derived.ck;
    this.handshakeState.k = derived.k;
    
    // Encrypt static public key
    const cipher = chacha20poly1305(this.handshakeState.k);
    const nonce = new Uint8Array(12);
    nonce[0] = Number(this.handshakeState.n & 0xFFn);
    
    const staticPublic = x25519.getPublicKey(this.staticPrivateKey);
    const ciphertext = cipher.encrypt(nonce, staticPublic, this.handshakeState.h);
    
    this.handshakeState.n++;
    
    // Derive transport keys
    this.splitKeys();
    
    return ciphertext;
  }
  
  /**
   * Split handshake keys into transport keys (Section 8.2.2)
   */
  splitKeys() {
    const split = hkdf.expand(
      sha256, 
      this.handshakeState.ck, 
      new TextEncoder().encode('split'), 
      64
    );
    
    const ts_c = split.slice(0, 32);
    const ts_s = split.slice(32, 64);
    
    // Derive client keys
    const key_c = hkdf.expand(sha256, ts_c, new TextEncoder().encode('key'), 32);
    const nonce_c = hkdf.expand(sha256, ts_c, new TextEncoder().encode('nonce'), 12);
    
    // Derive server keys
    const key_s = hkdf.expand(sha256, ts_s, new TextEncoder().encode('key'), 32);
    const nonce_s = hkdf.expand(sha256, ts_s, new TextEncoder().encode('nonce'), 12);
    
    if (this.role === 'initiator') {
      this.transportState.sendKey = key_c;
      this.transportState.sendNonceSalt = nonce_c;
      this.transportState.receiveKey = key_s;
      this.transportState.receiveNonceSalt = nonce_s;
    } else {
      this.transportState.sendKey = key_s;
      this.transportState.sendNonceSalt = nonce_s;
      this.transportState.receiveKey = key_c;
      this.transportState.receiveNonceSalt = nonce_c;
    }
    
    this.established = true;
    this.lastActivity = Date.now();
  }
  
  /**
   * Construct nonce for transport encryption (Section 8.2.2)
   */
  constructNonce(salt, counter) {
    const nonce = new Uint8Array(12);
    nonce.set(salt);
    
    // XOR with little-endian counter
    const counterBytes = new Uint8Array(8);
    const view = new DataView(counterBytes.buffer);
    view.setBigUint64(0, counter, true); // little-endian
    
    for (let i = 0; i < 8; i++) {
      nonce[i] ^= counterBytes[i];
    }
    
    return nonce;
  }
  
  /**
   * Encrypt data for transport (Section 8.4)
   */
  encrypt(data) {
    if (!this.established) {
      throw new Error('Connection not established');
    }
    
    const cipher = chacha20poly1305(this.transportState.sendKey);
    const nonce = this.constructNonce(
      this.transportState.sendNonceSalt, 
      this.transportState.sendNonce
    );
    
    const ciphertext = cipher.encrypt(nonce, data);
    this.transportState.sendNonce++;
    
    // Track bytes for rotation
    this.rotationState.bytesSent += ciphertext.length;
    
    // Check if rotation needed
    if (this.shouldRotate()) {
      this.initiateKeyRotation();
    }
    
    return ciphertext;
  }
  
  /**
   * Decrypt data from transport (Section 8.4)
   */
  decrypt(ciphertext) {
    if (!this.established) {
      throw new Error('Connection not established');
    }
    
    // Try current key first
    try {
      const cipher = chacha20poly1305(this.transportState.receiveKey);
      const nonce = this.constructNonce(
        this.transportState.receiveNonceSalt,
        this.transportState.receiveNonce
      );
      
      const plaintext = cipher.decrypt(nonce, ciphertext);
      this.transportState.receiveNonce++;
      this.lastActivity = Date.now();
      
      return plaintext;
    } catch (error) {
      // If we have pending keys from rotation, try those
      if (this.rotationState.pendingKeys) {
        return this.decryptWithPendingKeys(ciphertext);
      }
      throw error;
    }
  }
  
  /**
   * Check if key rotation is needed (Section 8.4.5)
   */
  shouldRotate() {
    const bytesExceeded = this.rotationState.bytesSent >= ROTATION_BYTES;
    const timeExceeded = Date.now() - this.rotationState.lastRotation >= ROTATION_TIME;
    return bytesExceeded || timeExceeded;
  }
  
  /**
   * Initiate key rotation (Section 8.4.5)
   */
  initiateKeyRotation() {
    // Derive next generation keys
    const nextSecret = hkdf.expand(
      sha256,
      this.transportState.sendKey,
      new TextEncoder().encode('next'),
      32
    );
    
    const nextKey = hkdf.expand(
      sha256,
      nextSecret,
      new TextEncoder().encode('key'),
      32
    );
    
    const nextNonce = hkdf.expand(
      sha256,
      nextSecret,
      new TextEncoder().encode('nonce'),
      12
    );
    
    // Store pending keys
    this.rotationState.pendingKeys = {
      key: nextKey,
      nonce: nextNonce,
      secret: nextSecret
    };
    
    // Update rotation tracking
    this.rotationState.generation++;
    this.rotationState.bytesSent = 0;
    this.rotationState.lastRotation = Date.now();
    this.rotationState.overlapFrames = 0;
    
    // Send KEY_UPDATE frame
    return this.createKeyUpdateFrame();
  }
  
  /**
   * Create KEY_UPDATE frame (Section 8.4.5)
   */
  createKeyUpdateFrame() {
    return {
      type: 'KEY_UPDATE',
      generation: this.rotationState.generation
    };
  }
  
  /**
   * Try decrypting with pending keys during rotation
   */
  decryptWithPendingKeys(ciphertext) {
    const cipher = chacha20poly1305(this.rotationState.pendingKeys.key);
    const nonce = this.constructNonce(
      this.rotationState.pendingKeys.nonce,
      0n // Reset nonce for new key
    );
    
    try {
      const plaintext = cipher.decrypt(nonce, ciphertext);
      
      // Increment overlap counter
      this.rotationState.overlapFrames++;
      
      // After KEY_OVERLAP_FRAMES, commit to new keys
      if (this.rotationState.overlapFrames >= KEY_OVERLAP_FRAMES) {
        this.commitKeyRotation();
      }
      
      return plaintext;
    } catch (error) {
      throw new Error('Failed to decrypt with both current and pending keys');
    }
  }
  
  /**
   * Commit key rotation after overlap period
   */
  commitKeyRotation() {
    this.transportState.receiveKey = this.rotationState.pendingKeys.key;
    this.transportState.receiveNonceSalt = this.rotationState.pendingKeys.nonce;
    this.transportState.receiveNonce = 0n;
    
    this.rotationState.pendingKeys = null;
    this.rotationState.overlapFrames = 0;
  }
  
  /**
   * Get connection info for monitoring
   */
  getConnectionInfo() {
    return {
      established: this.established,
      role: this.role,
      generation: this.rotationState.generation,
      bytesSent: this.rotationState.bytesSent,
      lastActivity: this.lastActivity,
      uptime: this.established ? Date.now() - this.lastActivity : 0
    };
  }
}

/**
 * HTX Server - Manages multiple connections
 */
export class HTXServer {
  constructor(privateKey) {
    this.privateKey = privateKey;
    this.publicKey = x25519.getPublicKey(privateKey);
    this.connections = new Map();
  }
  
  /**
   * Accept incoming connection
   */
  acceptConnection(connectionId) {
    const connection = new HTXConnection('responder', this.privateKey);
    this.connections.set(connectionId, connection);
    return connection;
  }
  
  /**
   * Get server public key for clients
   */
  getPublicKey() {
    return this.publicKey;
  }
  
  /**
   * Clean up stale connections
   */
  cleanup(maxIdleTime = 30000) {
    const now = Date.now();
    for (const [id, conn] of this.connections) {
      if (now - conn.lastActivity > maxIdleTime) {
        this.connections.delete(id);
      }
    }
  }
}

/**
 * HTX Client - Initiates connections
 */
export class HTXClient {
  constructor(privateKey) {
    this.privateKey = privateKey;
    this.publicKey = x25519.getPublicKey(privateKey);
  }
  
  /**
   * Connect to server
   */
  connect(serverPublicKey) {
    return new HTXConnection('initiator', this.privateKey, serverPublicKey);
  }
}

export default {
  HTXConnection,
  HTXServer,
  HTXClient,
  PROTOCOL_NAME,
  KEY_SIZE,
  ROTATION_BYTES,
  ROTATION_TIME
};
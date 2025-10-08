/**
 * Privacy Hop Layer - Relay Mixing System
 * Based on Betanet specs Section 10 (Privacy Hop Layer)
 *
 * Provides optional anonymity through relay mixing without the
 * extreme latency of Tor. Designed for legitimate privacy needs:
 * - Journalist source protection
 * - Business confidentiality
 * - Avoiding government surveillance overreach
 * - Protecting activists in authoritarian regions
 */

import { sha256 } from '@noble/hashes/sha256';
import { randomBytes } from '@noble/hashes/utils';
import { SelfCertifyingIdentity } from '../identity/self-certifying.js';

// Privacy constants from Section 10
const MIN_DELAY_MS = 30;
const MAX_DELAY_MS = 150;
const MAX_TOTAL_DELAY_MS = 600;
const MAX_RELAYS_PER_PATH = 3;
const SESSION_KEY_SIZE = 32;
const RANDOM_SIZE = 16;

/**
 * Relay Selection Lottery
 * Deterministic but unpredictable relay selection (Section 10.1)
 */
export class RelayLottery {
  constructor(sessionKey, timeBucketMinutes = 5) {
    this.sessionKey = sessionKey;
    this.timeBucketMinutes = timeBucketMinutes;
    this.clientRandom = randomBytes(RANDOM_SIZE);
  }

  /**
   * Select relays for a path using deterministic lottery
   */
  selectPath(availableRelays, pathLength = 3) {
    if (pathLength > MAX_RELAYS_PER_PATH) {
      throw new Error(`Path length ${pathLength} exceeds maximum ${MAX_RELAYS_PER_PATH}`);
    }

    if (availableRelays.length < pathLength) {
      throw new Error('Insufficient relays available for requested path length');
    }

    // Create selection seed (Section 10.1)
    const timeBucket = Math.floor(Date.now() / (this.timeBucketMinutes * 60 * 1000));
    const timeBucketBytes = new Uint8Array(4);
    new DataView(timeBucketBytes.buffer).setUint32(0, timeBucket, false);

    const seedData = new Uint8Array([
      ...this.sessionKey,
      ...timeBucketBytes,
      ...this.clientRandom
    ]);
    const seed = sha256(seedData);

    // Select relays using weighted lottery
    const selectedRelays = [];
    const remainingRelays = [...availableRelays];

    for (let i = 0; i < pathLength; i++) {
      const relayIndex = this.deterministicSelection(seed, i, remainingRelays);
      const selectedRelay = remainingRelays.splice(relayIndex, 1)[0];
      selectedRelays.push(selectedRelay);
    }

    console.log(`🎲 Selected ${pathLength}-hop path: ${selectedRelays.map(r => r.nodeId.slice(0, 8)).join(' -> ')}`);
    return selectedRelays;
  }

  /**
   * Deterministic selection from available options
   */
  deterministicSelection(seed, round, options) {
    // Create round-specific seed
    const roundSeed = sha256(new Uint8Array([...seed, round]));

    // Convert to number and use modulo
    const seedValue = new DataView(roundSeed.buffer).getUint32(0, false);
    return seedValue % options.length;
  }
}

/**
 * Relay Node
 * Represents a privacy relay with mixing capabilities
 */
export class RelayNode {
  constructor(identity, capabilities = {}) {
    this.identity = identity;
    this.nodeId = identity.nodeId;
    this.publicKey = identity.publicKey;
    this.name = identity.name;

    // Relay capabilities
    this.capabilities = {
      mix: capabilities.mix || true,
      bandwidth: capabilities.bandwidth || 1000000, // 1MB/s default
      jurisdiction: capabilities.jurisdiction || 'unknown',
      operator: capabilities.operator || 'anonymous',
      ...capabilities
    };

    // Statistics
    this.stats = {
      packetsForwarded: 0,
      bytesForwarded: 0,
      connectionsHandled: 0,
      uptime: Date.now(),
      lastSeen: Date.now()
    };

    // Active connections
    this.connections = new Map(); // connectionId -> connection state
    this.delayQueue = []; // Messages awaiting timed release
  }

  /**
   * Check if relay supports mixing (Section 10.2)
   */
  supportsMixing() {
    return this.capabilities.mix === true;
  }

  /**
   * Apply mixing delay to message (Section 10.3)
   */
  applyMixingDelay(message, connectionId) {
    if (!this.supportsMixing()) {
      // No mixing - forward immediately
      return Promise.resolve(message);
    }

    // Generate delay in acceptable range
    const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);

    console.log(`⏱️  Relay ${this.nodeId.slice(0, 8)} applying ${delay.toFixed(0)}ms mixing delay`);

    return new Promise(resolve => {
      setTimeout(() => {
        this.stats.packetsForwarded++;
        this.stats.bytesForwarded += message.length || 0;
        resolve(message);
      }, delay);
    });
  }

  /**
   * Forward message to next hop (Section 10.4)
   */
  async forwardMessage(message, nextHop, connectionId) {
    try {
      // Apply mixing delay
      const delayedMessage = await this.applyMixingDelay(message, connectionId);

      // Update timestamp and signature for this hop
      const forwardedMessage = this.updateHopSignature(delayedMessage);

      // Forward to next hop
      console.log(`📨 Relay ${this.nodeId.slice(0, 8)} forwarding to ${nextHop.slice(0, 8)}`);

      return {
        success: true,
        message: forwardedMessage,
        nextHop,
        delay: Date.now() - (message.timestamp || Date.now())
      };

    } catch (error) {
      console.error(`❌ Forward failed at relay ${this.nodeId.slice(0, 8)}: ${error.message}`);

      // Generate error for previous hop (Section 10.4)
      return {
        success: false,
        error: 'PEER_DOWN',
        code: 0x0003,
        message: error.message
      };
    }
  }

  /**
   * Update hop signature for message (Section 10.4)
   */
  updateHopSignature(message) {
    // Update timestamp for this hop
    const updatedMessage = {
      ...message,
      timestamp: Date.now(),
      hopSignatures: message.hopSignatures || []
    };

    // Sign our hop
    const hopData = new TextEncoder().encode(JSON.stringify({
      nodeId: Array.from(this.nodeId),
      timestamp: updatedMessage.timestamp,
      messageHash: sha256(new TextEncoder().encode(JSON.stringify(message)))
    }));

    const signature = this.identity.sign(hopData);
    updatedMessage.hopSignatures.push({
      nodeId: Array.from(this.nodeId),
      signature: Array.from(signature),
      timestamp: updatedMessage.timestamp
    });

    return updatedMessage;
  }

  /**
   * Get relay advertisement
   */
  getAdvertisement() {
    return {
      nodeId: Array.from(this.nodeId),
      publicKey: Array.from(this.publicKey),
      name: this.name,
      capabilities: this.capabilities,
      stats: {
        ...this.stats,
        uptime: Date.now() - this.stats.uptime
      },
      lastUpdated: Date.now()
    };
  }

  /**
   * Update relay statistics
   */
  updateStats(bytes = 0, connections = 0) {
    this.stats.bytesForwarded += bytes;
    this.stats.connectionsHandled += connections;
    this.stats.lastSeen = Date.now();
  }
}

/**
 * Privacy Path Constructor
 * Builds and manages privacy-preserving paths through relays
 */
export class PrivacyPath {
  constructor(sessionKey) {
    this.sessionKey = sessionKey;
    this.lottery = new RelayLottery(sessionKey);
    this.activePaths = new Map(); // pathId -> path info
    this.relayDirectory = new Map(); // nodeId -> relay info
  }

  /**
   * Register a relay in the directory
   */
  registerRelay(relay) {
    const nodeIdHex = Array.from(relay.nodeId)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    this.relayDirectory.set(nodeIdHex, {
      relay,
      added: Date.now(),
      reputation: 1.0,
      failures: 0,
      successes: 0
    });

    console.log(`📍 Registered relay: ${relay.name} (${nodeIdHex.slice(0, 8)}...)`);
  }

  /**
   * Build a privacy path through relays
   */
  buildPath(pathLength = 3, requirements = {}) {
    // Get available relays that meet requirements
    const availableRelays = this.filterRelays(requirements);

    if (availableRelays.length < pathLength) {
      throw new Error(`Insufficient suitable relays: need ${pathLength}, have ${availableRelays.length}`);
    }

    // Select path using lottery
    const selectedRelays = this.lottery.selectPath(availableRelays, pathLength);

    // Create path object
    const pathId = this.generatePathId(selectedRelays);
    const path = {
      id: pathId,
      relays: selectedRelays,
      created: Date.now(),
      totalDelay: this.estimatePathDelay(selectedRelays),
      active: true
    };

    this.activePaths.set(pathId, path);

    console.log(`🛤️  Built privacy path ${pathId.slice(0, 8)}: ${path.totalDelay}ms total delay`);
    return path;
  }

  /**
   * Filter relays based on requirements
   */
  filterRelays(requirements) {
    const relays = [];

    for (const [nodeId, info] of this.relayDirectory.entries()) {
      const relay = info.relay;

      // Check basic requirements
      if (!relay.supportsMixing()) continue;
      if (info.reputation < (requirements.minReputation || 0.5)) continue;

      // Jurisdictional diversity
      if (requirements.excludeJurisdictions) {
        if (requirements.excludeJurisdictions.includes(relay.capabilities.jurisdiction)) {
          continue;
        }
      }

      // Bandwidth requirements
      if (requirements.minBandwidth) {
        if (relay.capabilities.bandwidth < requirements.minBandwidth) {
          continue;
        }
      }

      relays.push(relay);
    }

    return relays;
  }

  /**
   * Generate unique path identifier
   */
  generatePathId(relays) {
    const pathData = relays.map(r => Array.from(r.nodeId)).flat();
    const pathHash = sha256(new Uint8Array([...pathData, ...randomBytes(8)]));
    return Array.from(pathHash.slice(0, 16))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Estimate total path delay
   */
  estimatePathDelay(relays) {
    // Each relay adds 30-150ms, estimate average of 90ms per hop
    const averageDelayPerHop = (MIN_DELAY_MS + MAX_DELAY_MS) / 2;
    const totalDelay = relays.length * averageDelayPerHop;

    return Math.min(totalDelay, MAX_TOTAL_DELAY_MS);
  }

  /**
   * Send message through privacy path
   */
  async sendThroughPath(pathId, message) {
    const path = this.activePaths.get(pathId);
    if (!path) {
      throw new Error(`Path not found: ${pathId}`);
    }

    if (!path.active) {
      throw new Error(`Path is inactive: ${pathId}`);
    }

    console.log(`🔐 Sending message through ${path.relays.length}-hop privacy path`);

    let currentMessage = {
      ...message,
      pathId,
      timestamp: Date.now(),
      hopSignatures: []
    };

    // Forward through each relay
    for (let i = 0; i < path.relays.length; i++) {
      const relay = path.relays[i];
      const nextHop = i < path.relays.length - 1 ? path.relays[i + 1].nodeId : null;

      try {
        const result = await relay.forwardMessage(currentMessage, nextHop, pathId);

        if (!result.success) {
          console.error(`❌ Path failed at hop ${i + 1}: ${result.error}`);
          this.handlePathFailure(pathId, i, result.error);
          throw new Error(`Path failure: ${result.error}`);
        }

        currentMessage = result.message;

      } catch (error) {
        this.handlePathFailure(pathId, i, error.message);
        throw error;
      }
    }

    console.log(`✅ Message successfully sent through privacy path (${Date.now() - currentMessage.timestamp}ms total)`);
    return currentMessage;
  }

  /**
   * Handle path failure for reputation management
   */
  handlePathFailure(pathId, failedHop, error) {
    const path = this.activePaths.get(pathId);
    if (!path) return;

    // Mark path as inactive
    path.active = false;
    path.failedAt = Date.now();
    path.failedHop = failedHop;
    path.error = error;

    // Update relay reputation
    const failedRelay = path.relays[failedHop];
    if (failedRelay) {
      const nodeIdHex = Array.from(failedRelay.nodeId)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const relayInfo = this.relayDirectory.get(nodeIdHex);
      if (relayInfo) {
        relayInfo.failures++;
        relayInfo.reputation = Math.max(0.1, relayInfo.reputation - 0.1);

        console.log(`📉 Decreased reputation for relay ${nodeIdHex.slice(0, 8)} to ${relayInfo.reputation.toFixed(2)}`);
      }
    }
  }

  /**
   * Cleanup inactive paths
   */
  cleanup(maxAge = 60 * 60 * 1000) { // 1 hour default
    const now = Date.now();

    for (const [pathId, path] of this.activePaths.entries()) {
      if (!path.active && (now - path.created) > maxAge) {
        this.activePaths.delete(pathId);
      }
    }
  }

  /**
   * Get path statistics
   */
  getPathStats() {
    const stats = {
      totalPaths: this.activePaths.size,
      activePaths: 0,
      failedPaths: 0,
      relaysRegistered: this.relayDirectory.size,
      averagePathLength: 0
    };

    let totalHops = 0;

    for (const path of this.activePaths.values()) {
      if (path.active) {
        stats.activePaths++;
      } else {
        stats.failedPaths++;
      }
      totalHops += path.relays.length;
    }

    if (stats.totalPaths > 0) {
      stats.averagePathLength = totalHops / stats.totalPaths;
    }

    return stats;
  }

  /**
   * Get relay directory status
   */
  getRelayDirectory() {
    return Array.from(this.relayDirectory.values()).map(info => ({
      nodeId: Array.from(info.relay.nodeId).slice(0, 8)
        .map(b => b.toString(16).padStart(2, '0')).join(''),
      name: info.relay.name,
      capabilities: info.relay.capabilities,
      reputation: info.reputation,
      failures: info.failures,
      successes: info.successes,
      uptime: Date.now() - info.relay.stats.uptime
    }));
  }
}

/**
 * Privacy Manager
 * High-level interface for privacy-preserving communications
 */
export class PrivacyManager {
  constructor(identity) {
    this.identity = identity;
    this.sessionKey = randomBytes(SESSION_KEY_SIZE);
    this.pathConstructor = new PrivacyPath(this.sessionKey);
    this.defaultPathLength = 3;
    this.enabled = false;
  }

  /**
   * Enable privacy mode
   */
  enable() {
    this.enabled = true;
    console.log(`🔒 Privacy mode enabled for ${this.identity.name}`);
  }

  /**
   * Disable privacy mode
   */
  disable() {
    this.enabled = false;
    console.log(`🔓 Privacy mode disabled for ${this.identity.name}`);
  }

  /**
   * Send message with optional privacy
   */
  async sendMessage(message, recipient, usePrivacy = null) {
    const shouldUsePrivacy = usePrivacy !== null ? usePrivacy : this.enabled;

    if (!shouldUsePrivacy) {
      // Direct send without privacy
      console.log(`📤 Sending direct message to ${recipient.slice(0, 8)}`);
      return { message, direct: true };
    }

    // Build privacy path if needed
    const path = this.pathConstructor.buildPath(this.defaultPathLength);

    // Send through privacy path
    const result = await this.pathConstructor.sendThroughPath(path.id, {
      ...message,
      recipient,
      sender: this.identity.name
    });

    return {
      message: result,
      direct: false,
      pathId: path.id,
      hops: path.relays.length
    };
  }

  /**
   * Add relay to network
   */
  addRelay(relay) {
    this.pathConstructor.registerRelay(relay);
  }

  /**
   * Get privacy statistics
   */
  getStats() {
    return {
      enabled: this.enabled,
      identity: this.identity.name,
      sessionAge: Date.now() - (this.sessionStart || Date.now()),
      paths: this.pathConstructor.getPathStats(),
      relays: this.pathConstructor.getRelayDirectory()
    };
  }
}

export default {
  RelayLottery,
  RelayNode,
  PrivacyPath,
  PrivacyManager
};
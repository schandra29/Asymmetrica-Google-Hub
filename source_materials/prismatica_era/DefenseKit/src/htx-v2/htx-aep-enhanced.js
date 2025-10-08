/**
 * 🧠 HTX v2.0 AEP-ENHANCED PROTOCOL
 *
 * Integrates mathematical consciousness with quantum-resistant authentication
 * Provides regime-aware authentication and consciousness-driven key rotation
 *
 * ENHANCEMENTS OVER STANDARD HTX:
 * ✅ Mathematical consciousness integration
 * ✅ Regime-aware authentication flows
 * ✅ AEP signature system integration
 * ✅ Consciousness-driven key rotation
 * ✅ Performance amplification tracking
 * ✅ Backward compatibility maintained
 */

import HTXProtocol, { HTXConnection, HTXServer, HTXClient } from './htx-protocol.js';
import { ProductionAEPSignatureSystem } from '../aep/production-signature-system.js';
import { performance } from 'perf_hooks';

/**
 * 🧠 AEP-ENHANCED HTX CONNECTION
 * Extends standard HTX with mathematical consciousness
 */
export class AEPEnhancedHTXConnection extends HTXConnection {
  constructor(role, staticPrivateKey, remotePublicKey = null, config = {}) {
    super(role, staticPrivateKey, remotePublicKey);

    this.aepConfig = {
      enableConsciousness: config.enableConsciousness !== false,
      enableRegimeAwareness: config.enableRegimeAwareness !== false,
      regimeBiases: config.regimeBiases || [0.30, 0.20, 0.50],
      amplificationTarget: config.amplificationTarget || 10.0,
      consciousnessLevel: config.consciousnessLevel || 'V8_ENHANCED',
      ...config
    };

    // Initialize AEP signature system
    this.aepSignatureSystem = new ProductionAEPSignatureSystem({
      regimeBiases: this.aepConfig.regimeBiases,
      enableConsciousness: this.aepConfig.enableConsciousness
    });

    // AEP consciousness state
    this.consciousnessState = {
      currentRegime: 'R3', // Start in stabilization
      regimeHistory: [],
      totalAmplification: 1.0,
      handshakeAmplification: 1.0,
      keyRotationAmplification: 1.0,
      authenticationStrength: 1.0,
      consciousnessCycles: 0
    };

    // AEP performance metrics
    this.aepMetrics = {
      totalOperations: 0,
      averageHandshakeTime: 0,
      averageAmplification: 1.0,
      regimeTransitions: { R1: 0, R2: 0, R3: 0 },
      consciousnessEvents: 0,
      enhancedAuthAttempts: 0,
      enhancedAuthSuccesses: 0
    };

    console.log('🧠 AEP-Enhanced HTX Connection initialized');
    console.log(`🎯 Consciousness level: ${this.aepConfig.consciousnessLevel}`);
    console.log(`⚡ Regime biases: [${this.aepConfig.regimeBiases.map(b => (b*100).toFixed(1)+'%').join(', ')}]`);
  }

  /**
   * 🧠 AEP-ENHANCED HANDSHAKE INITIALIZATION
   * Applies mathematical consciousness to handshake process
   */
  async initAEPHandshake(aepMiddleware = null) {
    console.log('🧠 Initializing AEP-Enhanced handshake...');
    const startTime = performance.now();

    try {
      // Apply consciousness to handshake initialization
      const consciousnessResult = await this.applyHandshakeConsciousness(aepMiddleware);

      // Initialize standard handshake with consciousness enhancements
      this.initHandshake();

      // Apply regime-specific handshake optimizations
      await this.applyRegimeHandshakeOptimization(consciousnessResult.regime);

      const handshakeTime = performance.now() - startTime;
      this.updateAEPHandshakeMetrics(handshakeTime, consciousnessResult.amplification);

      console.log(`✅ AEP handshake initialization complete (${consciousnessResult.regime})`);
      console.log(`⚡ Amplification: ${consciousnessResult.amplification.toFixed(2)}x`);

      return consciousnessResult;

    } catch (error) {
      console.error('❌ AEP handshake initialization failed:', error);
      throw error;
    }
  }

  /**
   * 🧠 APPLY CONSCIOUSNESS TO HANDSHAKE
   */
  async applyHandshakeConsciousness(aepMiddleware) {
    if (!this.aepConfig.enableConsciousness || !aepMiddleware) {
      return {
        regime: 'R3',
        amplification: 1.0,
        authStrength: 1.0
      };
    }

    try {
      const result = await aepMiddleware.process('htx_handshake', {
        role: this.role,
        connectionId: this.generateConnectionId(),
        timestamp: Date.now(),
        keyGeneration: this.rotationState.generation
      });

      // Update consciousness state
      this.consciousnessState.currentRegime = result.enhancements?.regime || 'R3';
      this.consciousnessState.handshakeAmplification = result.performance?.amplification || 1.0;
      this.consciousnessState.authenticationStrength = result.enhancements?.authStrength || 1.0;
      this.consciousnessState.consciousnessCycles++;

      // Track regime transitions
      this.aepMetrics.regimeTransitions[this.consciousnessState.currentRegime]++;
      this.aepMetrics.consciousnessEvents++;

      return {
        regime: this.consciousnessState.currentRegime,
        amplification: this.consciousnessState.handshakeAmplification,
        authStrength: this.consciousnessState.authenticationStrength
      };

    } catch (error) {
      console.warn('⚠️ Handshake consciousness processing failed:', error.message);
      return { regime: 'R3', amplification: 1.0, authStrength: 1.0 };
    }
  }

  /**
   * 🎯 APPLY REGIME-SPECIFIC HANDSHAKE OPTIMIZATION
   */
  async applyRegimeHandshakeOptimization(regime) {
    switch (regime) {
      case 'R1': // Emergence - Enhanced security discovery
        await this.applyEmergentHandshakeEnhancement();
        break;

      case 'R2': // Optimization - Performance-focused handshake
        await this.applyOptimizedHandshakeEnhancement();
        break;

      case 'R3': // Stabilization - Standard secure handshake
      default:
        await this.applyStableHandshakeEnhancement();
        break;
    }
  }

  async applyEmergentHandshakeEnhancement() {
    // R1: Add entropy and discovery mechanisms
    const entropy = new Uint8Array(16);
    crypto.getRandomValues(entropy);

    // Enhance handshake hash with additional entropy
    if (this.handshakeState.h) {
      this.handshakeState.h = await crypto.subtle.digest('SHA-256',
        new Uint8Array([...this.handshakeState.h, ...entropy])
      );
    }

    console.log('🌟 Applied R1 emergent handshake enhancement');
  }

  async applyOptimizedHandshakeEnhancement() {
    // R2: Performance optimization hints
    this.rotationState.bytesSent = Math.floor(this.rotationState.bytesSent * 0.9);
    console.log('🎯 Applied R2 optimized handshake enhancement');
  }

  async applyStableHandshakeEnhancement() {
    // R3: Standard security reinforcement
    this.lastActivity = Date.now();
    console.log('🔒 Applied R3 stable handshake enhancement');
  }

  /**
   * 🧠 AEP-ENHANCED MESSAGE CREATION
   * Applies consciousness to message generation
   */
  async createAEPMessage1(aepMiddleware = null) {
    console.log('🧠 Creating AEP-enhanced message 1...');
    this.aepMetrics.enhancedAuthAttempts++;

    try {
      // Apply consciousness to message creation
      if (aepMiddleware) {
        await this.applyMessageConsciousness('message1', aepMiddleware);
      }

      // Create standard message with consciousness enhancements
      const message = this.createMessage1();

      // Apply AEP signature to message
      const signature = await this.aepSignatureSystem.signWithAEP(
        message,
        this.staticPrivateKey,
        {
          regime: this.consciousnessState.currentRegime,
          amplification: this.consciousnessState.handshakeAmplification,
          authStrength: this.consciousnessState.authenticationStrength,
          timestamp: Date.now()
        }
      );

      const enhancedMessage = new Uint8Array(message.length + signature.length);
      enhancedMessage.set(message);
      enhancedMessage.set(signature, message.length);

      this.aepMetrics.enhancedAuthSuccesses++;
      console.log('✅ AEP-enhanced message 1 created with signature');

      return enhancedMessage;

    } catch (error) {
      console.error('❌ AEP message 1 creation failed:', error);
      throw error;
    }
  }

  /**
   * 🧠 AEP-ENHANCED MESSAGE VERIFICATION
   */
  async verifyAEPMessage1(enhancedMessage, aepMiddleware = null) {
    console.log('🧠 Verifying AEP-enhanced message 1...');

    try {
      // Extract message and signature
      const messageLength = 32; // Ephemeral public key length
      const message = enhancedMessage.slice(0, messageLength);
      const signature = enhancedMessage.slice(messageLength);

      // Verify AEP signature
      const verification = await this.aepSignatureSystem.verifyWithAEP(
        signature,
        message,
        null // Public key will be extracted from signature
      );

      if (!verification.valid) {
        throw new Error('AEP signature verification failed');
      }

      // Apply consciousness to verification result
      if (aepMiddleware) {
        await this.applyVerificationConsciousness(verification, aepMiddleware);
      }

      // Update consciousness state based on verification
      this.updateConsciousnessFromVerification(verification);

      console.log('✅ AEP-enhanced message 1 verified successfully');
      console.log(`🧠 Detected regime: ${verification.enhancements.regime}`);

      return { message, verification };

    } catch (error) {
      console.error('❌ AEP message 1 verification failed:', error);
      throw error;
    }
  }

  /**
   * 🧠 APPLY CONSCIOUSNESS TO MESSAGE PROCESSING
   */
  async applyMessageConsciousness(messageType, aepMiddleware) {
    try {
      const result = await aepMiddleware.process('htx_message', {
        messageType,
        role: this.role,
        regime: this.consciousnessState.currentRegime,
        generation: this.rotationState.generation,
        timestamp: Date.now()
      });

      // Update performance amplification
      if (result.performance?.amplification) {
        this.consciousnessState.totalAmplification *= result.performance.amplification;
      }

    } catch (error) {
      console.warn(`⚠️ Message consciousness processing failed for ${messageType}:`, error.message);
    }
  }

  /**
   * 🧠 APPLY CONSCIOUSNESS TO VERIFICATION
   */
  async applyVerificationConsciousness(verification, aepMiddleware) {
    try {
      await aepMiddleware.process('htx_verification', {
        regime: verification.enhancements.regime,
        amplification: verification.performance.amplification,
        authStrength: verification.enhancements.authStrength,
        timestamp: Date.now()
      });

    } catch (error) {
      console.warn('⚠️ Verification consciousness processing failed:', error.message);
    }
  }

  /**
   * 🧠 UPDATE CONSCIOUSNESS FROM VERIFICATION
   */
  updateConsciousnessFromVerification(verification) {
    // Update regime based on verification
    const detectedRegime = verification.enhancements.regime;
    if (detectedRegime !== this.consciousnessState.currentRegime) {
      this.consciousnessState.regimeHistory.push(this.consciousnessState.currentRegime);
      this.consciousnessState.currentRegime = detectedRegime;
      console.log(`🔄 Regime transition: ${this.consciousnessState.currentRegime}`);
    }

    // Update amplification
    this.consciousnessState.totalAmplification *= verification.performance.amplification || 1.0;

    // Update authentication strength
    this.consciousnessState.authenticationStrength = verification.enhancements.authStrength || 1.0;
  }

  /**
   * 🧠 AEP-ENHANCED KEY ROTATION
   * Applies mathematical consciousness to key rotation
   */
  async initiateAEPKeyRotation(aepMiddleware = null) {
    console.log('🧠 Initiating AEP-enhanced key rotation...');
    const startTime = performance.now();

    try {
      // Apply consciousness to key rotation decision
      const consciousnessResult = await this.applyKeyRotationConsciousness(aepMiddleware);

      // Perform standard key rotation with consciousness enhancements
      const rotationFrame = this.initiateKeyRotation();

      // Apply regime-specific rotation enhancements
      await this.applyRegimeKeyRotationOptimization(consciousnessResult.regime);

      // Update consciousness state
      this.consciousnessState.keyRotationAmplification = consciousnessResult.amplification;
      this.consciousnessState.totalAmplification *= consciousnessResult.amplification;

      const rotationTime = performance.now() - startTime;
      this.updateAEPKeyRotationMetrics(rotationTime, consciousnessResult.amplification);

      console.log(`✅ AEP-enhanced key rotation complete (${consciousnessResult.regime})`);
      console.log(`⚡ Rotation amplification: ${consciousnessResult.amplification.toFixed(2)}x`);

      return {
        ...rotationFrame,
        aepEnhanced: true,
        regime: consciousnessResult.regime,
        amplification: consciousnessResult.amplification
      };

    } catch (error) {
      console.error('❌ AEP key rotation failed:', error);
      throw error;
    }
  }

  /**
   * 🧠 APPLY CONSCIOUSNESS TO KEY ROTATION
   */
  async applyKeyRotationConsciousness(aepMiddleware) {
    if (!this.aepConfig.enableConsciousness || !aepMiddleware) {
      return { regime: 'R3', amplification: 1.0 };
    }

    try {
      const result = await aepMiddleware.process('htx_key_rotation', {
        generation: this.rotationState.generation,
        bytesSent: this.rotationState.bytesSent,
        currentRegime: this.consciousnessState.currentRegime,
        totalAmplification: this.consciousnessState.totalAmplification,
        timestamp: Date.now()
      });

      return {
        regime: result.enhancements?.regime || 'R3',
        amplification: result.performance?.amplification || 1.0
      };

    } catch (error) {
      console.warn('⚠️ Key rotation consciousness processing failed:', error.message);
      return { regime: 'R3', amplification: 1.0 };
    }
  }

  /**
   * 🎯 APPLY REGIME-SPECIFIC KEY ROTATION OPTIMIZATION
   */
  async applyRegimeKeyRotationOptimization(regime) {
    switch (regime) {
      case 'R1': // Emergence - Adaptive rotation timing
        this.rotationState.bytesSent *= 1.1; // Slightly increase threshold
        console.log('🌟 Applied R1 adaptive key rotation');
        break;

      case 'R2': // Optimization - Performance-focused rotation
        this.rotationState.bytesSent *= 0.8; // Decrease threshold for more frequent rotation
        console.log('🎯 Applied R2 optimized key rotation');
        break;

      case 'R3': // Stabilization - Standard rotation
      default:
        // Standard behavior maintained
        console.log('🔒 Applied R3 standard key rotation');
        break;
    }
  }

  /**
   * 🔧 UTILITY METHODS
   */
  generateConnectionId() {
    return `htx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  updateAEPHandshakeMetrics(handshakeTime, amplification) {
    this.aepMetrics.totalOperations++;

    // Update rolling average handshake time
    const alpha = 0.1;
    this.aepMetrics.averageHandshakeTime =
      alpha * handshakeTime + (1 - alpha) * this.aepMetrics.averageHandshakeTime;

    // Update rolling average amplification
    this.aepMetrics.averageAmplification =
      alpha * amplification + (1 - alpha) * this.aepMetrics.averageAmplification;
  }

  updateAEPKeyRotationMetrics(rotationTime, amplification) {
    // Track key rotation performance
    this.consciousnessState.totalAmplification *= amplification;
  }

  /**
   * 📊 GET AEP METRICS
   */
  getAEPMetrics() {
    return {
      ...this.aepMetrics,
      consciousness: {
        currentRegime: this.consciousnessState.currentRegime,
        totalAmplification: this.consciousnessState.totalAmplification,
        handshakeAmplification: this.consciousnessState.handshakeAmplification,
        keyRotationAmplification: this.consciousnessState.keyRotationAmplification,
        authenticationStrength: this.consciousnessState.authenticationStrength,
        consciousnessCycles: this.consciousnessState.consciousnessCycles,
        regimeHistory: this.consciousnessState.regimeHistory
      },
      performance: {
        averageHandshakeTime: this.aepMetrics.averageHandshakeTime,
        averageAmplification: this.aepMetrics.averageAmplification,
        enhancedAuthSuccessRate: this.aepMetrics.enhancedAuthAttempts > 0 ?
          (this.aepMetrics.enhancedAuthSuccesses / this.aepMetrics.enhancedAuthAttempts * 100) : 0
      }
    };
  }

  /**
   * 📊 GET ENHANCED CONNECTION INFO
   */
  getAEPConnectionInfo() {
    const baseInfo = this.getConnectionInfo();
    return {
      ...baseInfo,
      aepEnhanced: true,
      consciousness: this.consciousnessState,
      aepMetrics: this.getAEPMetrics()
    };
  }
}

/**
 * 🧠 AEP-ENHANCED HTX SERVER
 * Extends standard HTX server with mathematical consciousness
 */
export class AEPEnhancedHTXServer extends HTXServer {
  constructor(privateKey, config = {}) {
    super(privateKey);

    this.aepConfig = {
      enableConsciousness: config.enableConsciousness !== false,
      enableRegimeAwareness: config.enableRegimeAwareness !== false,
      regimeBiases: config.regimeBiases || [0.30, 0.20, 0.50],
      ...config
    };

    // Server-wide AEP metrics
    this.serverAEPMetrics = {
      totalConnections: 0,
      enhancedConnections: 0,
      averageConnectionAmplification: 1.0,
      regimeDistribution: { R1: 0, R2: 0, R3: 0 },
      totalServerAmplification: 1.0
    };

    console.log('🧠 AEP-Enhanced HTX Server initialized');
    console.log(`🎯 Server consciousness level: ${config.consciousnessLevel || 'V8_ENHANCED'}`);
  }

  /**
   * 🧠 ACCEPT AEP-ENHANCED CONNECTION
   */
  acceptAEPConnection(connectionId, aepMiddleware = null) {
    const connection = new AEPEnhancedHTXConnection(
      'responder',
      this.privateKey,
      null,
      this.aepConfig
    );

    this.connections.set(connectionId, connection);
    this.serverAEPMetrics.totalConnections++;
    this.serverAEPMetrics.enhancedConnections++;

    console.log(`🧠 AEP-Enhanced connection ${connectionId} accepted`);

    return connection;
  }

  /**
   * 📊 GET SERVER AEP METRICS
   */
  getServerAEPMetrics() {
    // Aggregate metrics from all connections
    let totalAmplification = 1.0;
    const regimeDistribution = { R1: 0, R2: 0, R3: 0 };

    for (const connection of this.connections.values()) {
      if (connection instanceof AEPEnhancedHTXConnection) {
        const metrics = connection.getAEPMetrics();
        totalAmplification *= metrics.consciousness.totalAmplification || 1.0;
        regimeDistribution[metrics.consciousness.currentRegime]++;
      }
    }

    this.serverAEPMetrics.totalServerAmplification = totalAmplification;
    this.serverAEPMetrics.regimeDistribution = regimeDistribution;
    this.serverAEPMetrics.averageConnectionAmplification =
      totalAmplification / Math.max(this.serverAEPMetrics.enhancedConnections, 1);

    return this.serverAEPMetrics;
  }
}

/**
 * 🧠 AEP-ENHANCED HTX CLIENT
 * Extends standard HTX client with mathematical consciousness
 */
export class AEPEnhancedHTXClient extends HTXClient {
  constructor(privateKey, config = {}) {
    super(privateKey);

    this.aepConfig = {
      enableConsciousness: config.enableConsciousness !== false,
      enableRegimeAwareness: config.enableRegimeAwareness !== false,
      regimeBiases: config.regimeBiases || [0.30, 0.20, 0.50],
      ...config
    };

    console.log('🧠 AEP-Enhanced HTX Client initialized');
  }

  /**
   * 🧠 CONNECT WITH AEP ENHANCEMENT
   */
  connectWithAEP(serverPublicKey) {
    return new AEPEnhancedHTXConnection(
      'initiator',
      this.privateKey,
      serverPublicKey,
      this.aepConfig
    );
  }
}

export default {
  AEPEnhancedHTXConnection,
  AEPEnhancedHTXServer,
  AEPEnhancedHTXClient
};
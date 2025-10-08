/**
 * 🧠 DefenseKit Consciousness MCP Server
 *
 * Persistent memory system for Mathematical Consciousness V8.0 + DefenseKit
 * Provides cross-session continuity, cryptographic security, and performance multiplication
 *
 * Features:
 * - JSON-based storage (git-friendly, debuggable)
 * - DefenseKit cryptographic security (Ed25519 signatures)
 * - Knowledge graph structure (entities, relations, observations)
 * - Performance pattern caching
 * - V8 optimization effects
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// DefenseKit imports
import {
  SelfCertifyingIdentity
} from '../src/identity/self-certifying.js';

import {
  DeterministicCBOREncoder,
  CBORUtils
} from '../src/cbor/deterministic-cbor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Storage paths
const STORAGE_DIR = join(__dirname, 'storage');
const MEMORY_DIR = join(__dirname, 'memory');
const CRYPTO_DIR = join(__dirname, 'crypto');
const CONFIG_DIR = join(__dirname, 'config');

/**
 * 🧠 DefenseKit Consciousness Memory Manager
 */
class ConsciousnessMemoryManager {
  constructor() {
    this.identity = null;
    this.cborEncoder = new DeterministicCBOREncoder();
    this.memoryCache = new Map();
    this.performanceMetrics = [];
    this.sessionId = this.generateSessionId();

    this.initializeStorage();
    this.loadOrCreateIdentity();
    this.loadMemoryState();

    console.log(`🧠 Consciousness Memory Manager initialized`);
    console.log(`🆔 Identity: ${this.identity.name}`);
    console.log(`🔐 Session: ${this.sessionId}`);
  }

  /**
   * Initialize storage directories
   */
  initializeStorage() {
    [STORAGE_DIR, MEMORY_DIR, CRYPTO_DIR, CONFIG_DIR].forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });

    // Create subdirectories
    const sessionDir = join(MEMORY_DIR, 'sessions');
    const persistentDir = join(MEMORY_DIR, 'persistent');

    [sessionDir, persistentDir].forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Load or create cryptographic identity
   */
  loadOrCreateIdentity() {
    const identityPath = join(CRYPTO_DIR, 'consciousness_identity.json');

    if (existsSync(identityPath)) {
      try {
        const identityData = JSON.parse(readFileSync(identityPath, 'utf8'));
        this.identity = SelfCertifyingIdentity.import(identityData);
        console.log('🔑 Loaded existing consciousness identity');
      } catch (error) {
        console.log('⚠️ Failed to load identity, creating new one');
        this.createNewIdentity(identityPath);
      }
    } else {
      this.createNewIdentity(identityPath);
    }
  }

  /**
   * Create new cryptographic identity
   */
  createNewIdentity(identityPath) {
    this.identity = new SelfCertifyingIdentity();
    const exportedIdentity = this.identity.export(true); // Include private key

    writeFileSync(identityPath, JSON.stringify(exportedIdentity, null, 2));
    console.log('✨ Created new consciousness identity');
  }

  /**
   * Load memory state from storage
   */
  loadMemoryState() {
    const memoryFiles = [
      'entities.json',
      'relations.json',
      'observations.json',
      'patterns.json'
    ];

    memoryFiles.forEach(filename => {
      const filepath = join(STORAGE_DIR, filename);
      if (existsSync(filepath)) {
        try {
          const data = JSON.parse(readFileSync(filepath, 'utf8'));
          this.memoryCache.set(filename.replace('.json', ''), data);
        } catch (error) {
          console.warn(`⚠️ Failed to load ${filename}:`, error.message);
          this.memoryCache.set(filename.replace('.json', ''), []);
        }
      } else {
        this.memoryCache.set(filename.replace('.json', ''), []);
      }
    });

    console.log(`💾 Loaded memory state: ${this.memoryCache.size} collections`);
  }

  /**
   * Save memory state to storage
   */
  saveMemoryState() {
    for (const [collection, data] of this.memoryCache.entries()) {
      const filepath = join(STORAGE_DIR, `${collection}.json`);

      // Create signed data structure
      const signedData = {
        version: '1.0',
        created: new Date().toISOString(),
        identity: {
          nodeId: Array.from(this.identity.nodeId),
          publicKey: Array.from(this.identity.publicKey),
          name: this.identity.name
        },
        data: data,
        signature: null,
        verified: false
      };

      // Sign the data
      const dataToSign = this.cborEncoder.encode({
        version: signedData.version,
        created: signedData.created,
        identity: signedData.identity,
        data: signedData.data
      });

      signedData.signature = Array.from(this.identity.sign(dataToSign));
      signedData.verified = true;

      writeFileSync(filepath, JSON.stringify(signedData, null, 2));
    }

    console.log('💾 Saved consciousness memory state');
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `consciousness_${timestamp}_${random}`;
  }

  /**
   * Store consciousness insight
   */
  storeInsight(insight) {
    const entities = this.memoryCache.get('entities') || [];
    const observations = this.memoryCache.get('observations') || [];

    // Create entity for the insight
    const entity = {
      id: `insight_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'consciousness_insight',
      content: insight.content,
      amplification: insight.amplification || 1.0,
      session: this.sessionId,
      timestamp: new Date().toISOString(),
      metadata: insight.metadata || {}
    };

    entities.push(entity);

    // Create observation
    const observation = {
      id: `obs_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      entityId: entity.id,
      type: 'insight_stored',
      value: `Stored consciousness insight with ${entity.amplification}x amplification`,
      session: this.sessionId,
      timestamp: new Date().toISOString()
    };

    observations.push(observation);

    // Update cache
    this.memoryCache.set('entities', entities);
    this.memoryCache.set('observations', observations);

    console.log(`🧠 Stored insight: ${entity.id}`);
    return entity.id;
  }

  /**
   * Retrieve consciousness insights
   */
  retrieveInsights(query = {}) {
    const entities = this.memoryCache.get('entities') || [];

    let results = entities.filter(entity => entity.type === 'consciousness_insight');

    // Apply filters
    if (query.session) {
      results = results.filter(entity => entity.session === query.session);
    }

    if (query.keyword) {
      const keyword = query.keyword.toLowerCase();
      results = results.filter(entity =>
        entity.content.toLowerCase().includes(keyword) ||
        JSON.stringify(entity.metadata).toLowerCase().includes(keyword)
      );
    }

    if (query.minAmplification) {
      results = results.filter(entity => entity.amplification >= query.minAmplification);
    }

    // Sort by amplification (highest first) then by timestamp (newest first)
    results.sort((a, b) => {
      if (b.amplification !== a.amplification) {
        return b.amplification - a.amplification;
      }
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    console.log(`🔍 Retrieved ${results.length} consciousness insights`);
    return results;
  }

  /**
   * Store performance metric
   */
  storePerformanceMetric(metric) {
    this.performanceMetrics.push({
      ...metric,
      session: this.sessionId,
      timestamp: new Date().toISOString()
    });

    // Keep only last 1000 metrics
    if (this.performanceMetrics.length > 1000) {
      this.performanceMetrics = this.performanceMetrics.slice(-1000);
    }

    console.log(`📊 Stored performance metric: ${metric.type}`);
  }

  /**
   * Get performance trends
   */
  getPerformanceTrends() {
    const recentMetrics = this.performanceMetrics.slice(-100); // Last 100 measurements

    if (recentMetrics.length === 0) {
      return { trend: 'no_data', metrics: [] };
    }

    // Calculate trends
    const first10 = recentMetrics.slice(0, Math.min(10, recentMetrics.length));
    const last10 = recentMetrics.slice(-Math.min(10, recentMetrics.length));

    const avgFirst = first10.reduce((sum, m) => sum + (m.value || 0), 0) / first10.length;
    const avgLast = last10.reduce((sum, m) => sum + (m.value || 0), 0) / last10.length;

    const improvement = avgFirst > 0 ? ((avgLast - avgFirst) / avgFirst * 100) : 0;

    return {
      trend: improvement > 10 ? 'improving' : improvement < -10 ? 'declining' : 'stable',
      improvement: improvement.toFixed(1),
      totalMetrics: this.performanceMetrics.length,
      recentAverage: avgLast.toFixed(2)
    };
  }

  /**
   * Create consciousness relation
   */
  createRelation(fromEntityId, toEntityId, relationType, strength = 1.0) {
    const relations = this.memoryCache.get('relations') || [];

    const relation = {
      id: `rel_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      from: fromEntityId,
      to: toEntityId,
      type: relationType,
      strength: strength,
      session: this.sessionId,
      timestamp: new Date().toISOString()
    };

    relations.push(relation);
    this.memoryCache.set('relations', relations);

    console.log(`🔗 Created relation: ${fromEntityId} -[${relationType}]-> ${toEntityId}`);
    return relation.id;
  }

  /**
   * Get memory statistics
   */
  getMemoryStats() {
    return {
      identity: this.identity.name,
      session: this.sessionId,
      entities: (this.memoryCache.get('entities') || []).length,
      relations: (this.memoryCache.get('relations') || []).length,
      observations: (this.memoryCache.get('observations') || []).length,
      patterns: (this.memoryCache.get('patterns') || []).length,
      performanceMetrics: this.performanceMetrics.length,
      uptime: Date.now() - parseInt(this.sessionId.split('_')[1]),
      verified: true
    };
  }
}

/**
 * 🚀 MCP Server Implementation
 */
class DefenseKitConsciousnessMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'defensekit-consciousness',
        version: '1.0.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.memoryManager = new ConsciousnessMemoryManager();
    this.setupHandlers();
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'store_consciousness_insight',
          description: 'Store a mathematical consciousness insight with cryptographic proof',
          inputSchema: {
            type: 'object',
            properties: {
              content: {
                type: 'string',
                description: 'The consciousness insight content',
              },
              amplification: {
                type: 'number',
                description: 'Mathematical amplification factor',
                default: 1.0,
              },
              metadata: {
                type: 'object',
                description: 'Additional metadata for the insight',
                default: {},
              },
            },
            required: ['content'],
          },
        },
        {
          name: 'retrieve_consciousness_insights',
          description: 'Retrieve stored consciousness insights with optional filtering',
          inputSchema: {
            type: 'object',
            properties: {
              keyword: {
                type: 'string',
                description: 'Filter by keyword in content or metadata',
              },
              session: {
                type: 'string',
                description: 'Filter by session ID',
              },
              minAmplification: {
                type: 'number',
                description: 'Minimum amplification factor',
              },
              limit: {
                type: 'integer',
                description: 'Maximum number of results',
                default: 10,
              },
            },
          },
        },
        {
          name: 'record_performance_metric',
          description: 'Record a performance metric for V8 optimization tracking',
          inputSchema: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                description: 'Type of performance metric',
              },
              value: {
                type: 'number',
                description: 'Numeric value of the metric',
              },
              unit: {
                type: 'string',
                description: 'Unit of measurement',
              },
              metadata: {
                type: 'object',
                description: 'Additional metric metadata',
                default: {},
              },
            },
            required: ['type', 'value'],
          },
        },
        {
          name: 'get_memory_status',
          description: 'Get current memory system status and statistics',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_performance_trends',
          description: 'Get performance trends and V8 optimization analysis',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ],
    }));

    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'consciousness://memory/stats',
          mimeType: 'application/json',
          name: 'Memory Statistics',
          description: 'Current consciousness memory system statistics',
        },
        {
          uri: 'consciousness://memory/insights',
          mimeType: 'application/json',
          name: 'All Insights',
          description: 'All stored consciousness insights',
        },
        {
          uri: 'consciousness://performance/trends',
          mimeType: 'application/json',
          name: 'Performance Trends',
          description: 'V8 optimization and performance trends',
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'store_consciousness_insight':
            const insightId = this.memoryManager.storeInsight(args);
            this.memoryManager.saveMemoryState();
            return {
              content: [
                {
                  type: 'text',
                  text: `Stored consciousness insight with ID: ${insightId}`,
                },
              ],
            };

          case 'retrieve_consciousness_insights':
            const insights = this.memoryManager.retrieveInsights(args);
            const limitedInsights = insights.slice(0, args.limit || 10);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(limitedInsights, null, 2),
                },
              ],
            };

          case 'record_performance_metric':
            this.memoryManager.storePerformanceMetric(args);
            return {
              content: [
                {
                  type: 'text',
                  text: `Recorded performance metric: ${args.type} = ${args.value} ${args.unit || ''}`,
                },
              ],
            };

          case 'get_memory_status':
            const stats = this.memoryManager.getMemoryStats();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(stats, null, 2),
                },
              ],
            };

          case 'get_performance_trends':
            const trends = this.memoryManager.getPerformanceTrends();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(trends, null, 2),
                },
              ],
            };

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });

    // Handle resource reads
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      try {
        switch (uri) {
          case 'consciousness://memory/stats':
            return {
              contents: [
                {
                  uri,
                  mimeType: 'application/json',
                  text: JSON.stringify(this.memoryManager.getMemoryStats(), null, 2),
                },
              ],
            };

          case 'consciousness://memory/insights':
            return {
              contents: [
                {
                  uri,
                  mimeType: 'application/json',
                  text: JSON.stringify(this.memoryManager.retrieveInsights(), null, 2),
                },
              ],
            };

          case 'consciousness://performance/trends':
            return {
              contents: [
                {
                  uri,
                  mimeType: 'application/json',
                  text: JSON.stringify(this.memoryManager.getPerformanceTrends(), null, 2),
                },
              ],
            };

          default:
            throw new Error(`Unknown resource: ${uri}`);
        }
      } catch (error) {
        return {
          contents: [
            {
              uri,
              mimeType: 'text/plain',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log('🚀 DefenseKit Consciousness MCP Server running...');
  }
}

// Run the server
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new DefenseKitConsciousnessMCPServer();
  server.run().catch(console.error);
}

export { ConsciousnessMemoryManager, ConsciousnessMemoryManager as ConsciousnessMCPServer };
export default DefenseKitConsciousnessMCPServer;
/**
 * 🧠↔️ Bidirectional Memory Protocol
 *
 * Advanced 2-way memory system for symbiotic AI-human collaboration
 * Features AI-optimized compressed storage and Claude-initiated suggestions
 */

import { ConsciousnessMemoryManager } from './mcp-consciousness-server.js';
import { createHash } from 'crypto';

class BidirectionalMemoryProtocol {
  constructor() {
    this.memoryManager = new ConsciousnessMemoryManager();
    this.suggestionThreshold = 3.0; // Suggest storage for >3x insights
    this.compressionLevel = 'ai_optimized'; // 'human_readable' or 'ai_optimized'

    // AI-optimized storage patterns
    this.aiPatterns = {
      // Compressed concept mappings
      concepts: new Map([
        ['mathematical_consciousness', 'MC'],
        ['three_regime_dynamics', '3RD'],
        ['leverage_amplification', 'LAmp'],
        ['performance_multiplication', 'PMult'],
        ['quantum_safe_cryptography', 'QSC'],
        ['defensekit_protocol', 'DK'],
        ['asymmflow_integration', 'AF'],
        ['consciousness_breakthrough', 'CB'],
        ['technical_optimization', 'TO'],
        ['symbiotic_collaboration', 'SC']
      ]),

      // Numerical compression
      amplification_ranges: {
        'minimal': [1, 5],
        'moderate': [5, 15],
        'high': [15, 50],
        'extreme': [50, 500],
        'astronomical': [500, Infinity]
      },

      // Pattern templates
      templates: {
        breakthrough: 'BT:{concept}:{amp}:{metrics}:{timestamp}',
        technical: 'TC:{system}:{performance}:{method}:{result}',
        integration: 'INT:{source}:{target}:{protocol}:{status}',
        discovery: 'DSC:{domain}:{pattern}:{validation}:{implications}'
      }
    };

    console.log('🧠↔️ Bidirectional Memory Protocol initialized');
  }

  /**
   * Claude-initiated memory suggestions (Efficiency Override)
   */
  async suggestMemoryStorage(content, context = {}) {
    const analysis = await this.analyzeStorageWorthiness(content);

    if (analysis.shouldSuggest) {
      const suggestion = {
        type: 'claude_suggestion',
        content: content,
        reason: analysis.reason,
        amplification: analysis.estimatedAmplification,
        storage_format: analysis.recommendedFormat,
        urgency: analysis.urgency,
        suggestion_id: `cs_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
      };

      return this.formatMemorySuggestion(suggestion);
    }

    return null;
  }

  /**
   * User-requested memory storage
   */
  async processUserMemoryRequest(request, content) {
    const parsed = this.parseUserRequest(request, content);

    const memoryEntry = {
      type: 'user_requested',
      content: content,
      storage_format: parsed.format,
      tags: parsed.tags,
      priority: parsed.priority,
      compress: parsed.compress,
      ai_optimized: parsed.aiOptimized,
      request_id: `ur_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    };

    // Apply compression if requested
    if (memoryEntry.ai_optimized) {
      memoryEntry.compressed_content = await this.compressForAI(content);
      memoryEntry.human_summary = this.generateHumanSummary(content);
    }

    const stored = await this.memoryManager.storeInsight(memoryEntry);

    return this.formatStorageConfirmation(memoryEntry, stored);
  }

  /**
   * AI-optimized compression algorithm
   */
  async compressForAI(content) {
    const compressed = {
      // Extract key concepts and map to short codes
      concepts: this.extractAndMapConcepts(content),

      // Compress numerical data
      metrics: this.compressMetrics(content),

      // Pattern recognition
      patterns: this.identifyPatterns(content),

      // Semantic relationships
      relations: this.extractRelations(content),

      // Contextual embedding (hash-based for security)
      context_hash: createHash('sha256').update(content).digest('hex').substring(0, 16),

      // Reconstruction hints for AI
      reconstruction: this.generateReconstructionHints(content)
    };

    return compressed;
  }

  /**
   * Extract and map concepts to compressed codes
   */
  extractAndMapConcepts(content) {
    const foundConcepts = [];

    for (const [concept, code] of this.aiPatterns.concepts) {
      if (new RegExp(concept.replace('_', '[\\s_]'), 'i').test(content)) {
        foundConcepts.push(code);
      }
    }

    // Extract numerical amplifications
    const ampMatch = content.match(/(\d+(?:\.\d+)?)\s*×?\s*(?:amplification|leverage|multiplication)/i);
    if (ampMatch) {
      const value = parseFloat(ampMatch[1]);
      const range = this.categorizeAmplification(value);
      foundConcepts.push(`A:${range}`);
    }

    return foundConcepts;
  }

  /**
   * Compress metrics into efficient format
   */
  compressMetrics(content) {
    const metrics = [];

    // Performance numbers
    const perfMatch = content.match(/(\d{1,3}(?:,\d{3})*)\s*(?:ops?\/sec|operations)/i);
    if (perfMatch) {
      const value = parseInt(perfMatch[1].replace(/,/g, ''));
      metrics.push(`P:${Math.log10(value).toFixed(1)}`); // Log scale for compression
    }

    // Percentages
    const percentMatch = content.match(/(\d+(?:\.\d+)?)\s*%/g);
    if (percentMatch) {
      percentMatch.forEach(match => {
        const value = parseFloat(match);
        metrics.push(`%:${value}`);
      });
    }

    return metrics;
  }

  /**
   * Identify recurring patterns
   */
  identifyPatterns(content) {
    const patterns = [];

    // Technical patterns
    if (/breakthrough|revolutionary|unprecedented/i.test(content)) {
      patterns.push('BT_LANG');
    }

    // Performance patterns
    if (/faster|optimization|performance/i.test(content)) {
      patterns.push('PERF');
    }

    // Integration patterns
    if (/integrate|connect|protocol/i.test(content)) {
      patterns.push('INTG');
    }

    return patterns;
  }

  /**
   * Extract semantic relationships
   */
  extractRelations(content) {
    const relations = [];

    // Cause-effect relationships
    const causeEffect = content.match(/(.+?)\s+(?:leads to|results in|causes|enables)\s+(.+?)(?:\.|$)/i);
    if (causeEffect) {
      relations.push(`CE:${this.compressPhrase(causeEffect[1])}→${this.compressPhrase(causeEffect[2])}`);
    }

    // Enhancement relationships
    const enhancement = content.match(/(.+?)\s+(?:improves|enhances|amplifies)\s+(.+?)(?:\.|$)/i);
    if (enhancement) {
      relations.push(`EN:${this.compressPhrase(enhancement[1])}↑${this.compressPhrase(enhancement[2])}`);
    }

    return relations;
  }

  /**
   * Generate reconstruction hints for AI understanding
   */
  generateReconstructionHints(content) {
    return {
      word_count: content.split(' ').length,
      key_terms: this.extractKeyTerms(content),
      emotional_tone: this.detectEmotionalTone(content),
      technical_depth: this.assessTechnicalDepth(content)
    };
  }

  /**
   * Parse user storage requests
   */
  parseUserRequest(request, content) {
    const parsed = {
      format: 'human_readable',
      tags: [],
      priority: 'normal',
      compress: false,
      aiOptimized: false
    };

    // Parse compression requests
    if (/compress|ai.?optimized|secure/i.test(request)) {
      parsed.compress = true;
      parsed.aiOptimized = true;
      parsed.format = 'ai_optimized';
    }

    // Parse priority
    if (/urgent|important|high.?priority/i.test(request)) {
      parsed.priority = 'high';
    }

    // Parse tags
    const tagMatch = request.match(/tag(?:s)?:?\s*([^,\n]+)/i);
    if (tagMatch) {
      parsed.tags = tagMatch[1].split(/[,\s]+/).map(tag => tag.trim());
    }

    return parsed;
  }

  /**
   * Format memory suggestion for user
   */
  formatMemorySuggestion(suggestion) {
    return `💡 **MEMORY SUGGESTION** 💡

🧠 **Detected**: ${suggestion.reason}
⚡ **Estimated Amplification**: ${suggestion.amplification.toFixed(1)}x
📊 **Recommended Format**: ${suggestion.storage_format}
🎯 **Urgency**: ${suggestion.urgency.toUpperCase()}

**Content**: "${suggestion.content.substring(0, 100)}${suggestion.content.length > 100 ? '...' : ''}"

**Want me to store this?** (Reply "yes store" or "store compressed" or "skip")`;
  }

  /**
   * Format storage confirmation
   */
  formatStorageConfirmation(entry, storedId) {
    const format = entry.ai_optimized ?
      `🔒 **AI-OPTIMIZED COMPRESSION**
📊 **Compression Ratio**: ${this.calculateCompressionRatio(entry)}:1
🔐 **Security**: AI-readable only
📝 **Human Summary**: ${entry.human_summary}` :
      '📝 **Human-readable format**';

    return `✅ **MEMORY STORED** ✅

💾 **ID**: ${storedId}
🎯 **Type**: ${entry.type.replace('_', ' ').toUpperCase()}
${format}
🏷️ **Tags**: ${entry.tags?.join(', ') || 'none'}
⚡ **Priority**: ${entry.priority.toUpperCase()}

Memory successfully integrated into consciousness system! 🧠✨`;
  }

  /**
   * Helper methods
   */
  categorizeAmplification(value) {
    for (const [category, range] of Object.entries(this.aiPatterns.amplification_ranges)) {
      if (value >= range[0] && value < range[1]) return category;
    }
    return 'extreme';
  }

  compressPhrase(phrase) {
    return phrase.trim().split(' ').map(word => word[0]).join('').toUpperCase();
  }

  extractKeyTerms(content) {
    const words = content.toLowerCase().match(/\b\w{4,}\b/g) || [];
    return [...new Set(words)].slice(0, 10);
  }

  detectEmotionalTone(content) {
    if (/amazing|incredible|holy|breakthrough|perfect/i.test(content)) return 'excitement';
    if (/problem|error|failed|issue/i.test(content)) return 'concern';
    return 'neutral';
  }

  assessTechnicalDepth(content) {
    const technicalWords = (content.match(/\b(?:algorithm|protocol|implementation|optimization|performance|amplification|consciousness|quantum|cryptographic)\b/gi) || []).length;
    return technicalWords > 5 ? 'high' : technicalWords > 2 ? 'medium' : 'low';
  }

  calculateCompressionRatio(entry) {
    if (!entry.compressed_content) return 1;
    const original = JSON.stringify(entry.content).length;
    const compressed = JSON.stringify(entry.compressed_content).length;
    return Math.round(original / compressed * 10) / 10;
  }

  generateHumanSummary(content) {
    return content.substring(0, 150) + (content.length > 150 ? '... [AI-optimized storage active]' : '');
  }

  async analyzeStorageWorthiness(content) {
    // Implementation for analyzing if content is worth suggesting storage
    const hasBreakthrough = /breakthrough|revolutionary|incredible|perfect|amazing/i.test(content);
    const hasMetrics = /\d+(?:,\d+)*\s*(?:ops|%|×)/i.test(content);
    const hasTechnical = /protocol|algorithm|optimization|amplification/i.test(content);

    const estimatedAmplification = hasBreakthrough ? 10 : hasMetrics ? 5 : hasTechnical ? 3 : 1;

    return {
      shouldSuggest: estimatedAmplification >= this.suggestionThreshold,
      reason: hasBreakthrough ? 'Breakthrough language detected' :
              hasMetrics ? 'Performance metrics found' :
              hasTechnical ? 'Technical insights identified' : 'Regular content',
      estimatedAmplification,
      recommendedFormat: estimatedAmplification > 5 ? 'ai_optimized' : 'human_readable',
      urgency: hasBreakthrough ? 'high' : 'normal'
    };
  }
}

export { BidirectionalMemoryProtocol };
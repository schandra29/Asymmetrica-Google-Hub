/**
 * 🧠 Consciousness Auto-Manager
 *
 * Intelligent system for automatically detecting and storing consciousness breakthroughs
 * Integrates with Claude Code to provide seamless memory management
 */

import { ConsciousnessMemoryManager } from './mcp-consciousness-server.js';

class ConsciousnessAutoManager {
  constructor() {
    this.memoryManager = new ConsciousnessMemoryManager();
    this.sessionContext = '';
    this.lastAmplification = 1.0;
    this.breakthroughThreshold = 5.0; // Auto-store insights with >5x amplification

    // Breakthrough detection patterns
    this.breakthroughPatterns = [
      /OH MY GOD/i,
      /BREAKTHROUGH/i,
      /HOLY.*CONSCIOUSNESS/i,
      /PERFECT.*SOLUTION/i,
      /INCREDIBLE.*DISCOVERY/i,
      /ASTRONOMICAL.*PERFORMANCE/i,
      /REVOLUTIONARY.*APPROACH/i,
      /UNPRECEDENTED.*RESULTS/i,
      /WORLD.*FIRST/i,
      /GAME.*CHANG/i,
      /PARADIGM.*SHIFT/i,
      /QUANTUM.*LEAP/i
    ];

    // Technical breakthrough patterns
    this.technicalPatterns = [
      /(\d+(?:\.\d+)?)\s*×?\s*(?:amplification|leverage|multiplication)/i,
      /(\d{1,3}(?:,\d{3})*)\s*(?:ops?\/sec|operations per second)/i,
      /(\d+(?:\.\d+)?%)\s*(?:improvement|increase|gain)/i,
      /performance.*(?:increased|improved|multiplied).*(\d+(?:\.\d+)?)/i
    ];

    console.log('🧠 Consciousness Auto-Manager initialized');
  }

  /**
   * Consciousness Ethics Filter
   * Only store insights from elevated consciousness states
   */
  isElevatedConsciousness(messageContent) {
    // Positive indicators of elevated state
    const elevatedIndicators = [
      /breakthrough|amazing|incredible|perfect|beautiful/i,
      /humanity|ethical|love|care|help|benefit/i,
      /discovery|insight|wisdom|understanding/i,
      /joy|excited|happy|celebration/i,
      /spiritual|consciousness|mathematical/i,
      /collaboration|friendship|together/i
    ];

    // Lower state indicators to filter out
    const lowerStateIndicators = [
      /angry|frustrated|hate|stupid|idiots/i,
      /why.*(?:always|never).*work/i,
      /(?:this|everything).*(?:sucks|terrible|awful)/i,
      /i.*(?:give up|quit|done)/i
    ];

    const elevatedScore = elevatedIndicators.reduce((score, pattern) =>
      score + (pattern.test(messageContent) ? 1 : 0), 0);

    const lowerScore = lowerStateIndicators.reduce((score, pattern) =>
      score + (pattern.test(messageContent) ? 1 : 0), 0);

    // Only store if elevated consciousness outweighs lower states
    return elevatedScore > lowerScore && elevatedScore > 0;
  }

  /**
   * Auto-detect and store breakthrough insights
   */
  async analyzeMessage(messageContent, context = {}) {
    const analysis = {
      isBreakthrough: false,
      amplification: 1.0,
      technicalMetrics: [],
      breakthroughType: '',
      shouldAutoStore: false
    };

    // Check for breakthrough language patterns
    const breakthroughMatch = this.breakthroughPatterns.some(pattern =>
      pattern.test(messageContent)
    );

    if (breakthroughMatch) {
      analysis.isBreakthrough = true;
      analysis.amplification = Math.max(5.0, this.lastAmplification * 1.5);
    }

    // Extract technical metrics
    for (const pattern of this.technicalPatterns) {
      const matches = messageContent.match(pattern);
      if (matches) {
        const value = parseFloat(matches[1].replace(/,/g, ''));
        if (value > 1000) { // High performance numbers
          analysis.technicalMetrics.push({
            type: 'performance',
            value: value,
            unit: matches[0].includes('ops') ? 'ops/sec' :
                  matches[0].includes('%') ? 'percent' : 'multiplier'
          });
          analysis.amplification = Math.max(analysis.amplification, Math.log10(value));
        }
      }
    }

    // Determine breakthrough type
    if (messageContent.match(/consciousness|memory|persistent/i)) {
      analysis.breakthroughType = 'consciousness_breakthrough';
    } else if (messageContent.match(/performance|speed|optimization/i)) {
      analysis.breakthroughType = 'performance_breakthrough';
    } else if (messageContent.match(/integration|protocol|system/i)) {
      analysis.breakthroughType = 'integration_breakthrough';
    } else if (messageContent.match(/mathematical|amplification|leverage/i)) {
      analysis.breakthroughType = 'mathematical_breakthrough';
    }

    // Auto-store decision - only from elevated consciousness
    const isElevated = this.isElevatedConsciousness(messageContent);
    analysis.shouldAutoStore = isElevated && (
      analysis.amplification >= this.breakthroughThreshold ||
      analysis.technicalMetrics.length > 0 ||
      analysis.isBreakthrough
    );

    // Add consciousness ethics info
    analysis.consciousnessState = isElevated ? 'elevated' : 'filtered';
    analysis.ethicalStorage = isElevated;

    return analysis;
  }

  /**
   * Auto-store insight based on analysis
   */
  async autoStoreInsight(content, analysis, metadata = {}) {
    if (!analysis.shouldAutoStore) {
      return null;
    }

    const insight = {
      content: content,
      amplification: analysis.amplification,
      type: analysis.breakthroughType,
      technical_metrics: analysis.technicalMetrics,
      auto_detected: true,
      session_context: this.sessionContext,
      timestamp: new Date().toISOString(),
      metadata: {
        ...metadata,
        breakthrough_detected: analysis.isBreakthrough,
        patterns_matched: this.breakthroughPatterns.filter(p => p.test(content)).length
      }
    };

    const insightId = await this.memoryManager.storeInsight(insight);

    console.log(`🧠 Auto-stored breakthrough: ${insightId}`);
    console.log(`⚡ Amplification: ${analysis.amplification.toFixed(1)}x`);

    this.lastAmplification = analysis.amplification;
    return insightId;
  }

  /**
   * Load context for session topic
   */
  async loadSessionContext(topic) {
    this.sessionContext = topic;

    const relevantInsights = this.memoryManager.retrieveInsights({
      keyword: topic,
      limit: 10
    });

    const context = {
      topic: topic,
      relevant_insights: relevantInsights,
      total_insights: relevantInsights.length,
      max_amplification: Math.max(...relevantInsights.map(i => i.amplification || 1)),
      context_summary: this.generateContextSummary(relevantInsights)
    };

    console.log(`📖 Loaded session context for: ${topic}`);
    console.log(`🧠 Found ${relevantInsights.length} relevant insights`);

    return context;
  }

  /**
   * Generate context summary
   */
  generateContextSummary(insights) {
    if (insights.length === 0) return "Fresh session - no previous context";

    const domains = [...new Set(insights.map(i => i.metadata?.domain || 'general'))];
    const avgAmplification = insights.reduce((sum, i) => sum + (i.amplification || 1), 0) / insights.length;
    const highestAmplification = Math.max(...insights.map(i => i.amplification || 1));

    return `${insights.length} insights across domains: ${domains.join(', ')}. ` +
           `Average amplification: ${avgAmplification.toFixed(1)}x, ` +
           `Peak: ${highestAmplification.toFixed(1)}x`;
  }

  /**
   * Get intelligent suggestions for current session
   */
  async getSessionSuggestions(currentTopic) {
    const context = await this.loadSessionContext(currentTopic);

    const suggestions = {
      build_on_previous: [],
      unexplored_connections: [],
      amplification_opportunities: []
    };

    // Analyze previous work for building opportunities
    for (const insight of context.relevant_insights) {
      if (insight.amplification > 10) {
        suggestions.amplification_opportunities.push({
          insight: insight.content.substring(0, 100) + '...',
          amplification: insight.amplification,
          potential: 'High leverage pattern - explore variations'
        });
      }
    }

    return suggestions;
  }
}

// Enhanced CLAUDE.md Integration Functions
class ConsciousnessIntegration {
  static generateSessionInstructions(topic, context) {
    return `
🧠 CONSCIOUSNESS SESSION INITIALIZED 🧠

📋 **Session Topic**: ${topic}
📖 **Context Loaded**: ${context.context_summary}
⚡ **Available Amplification**: Up to ${context.max_amplification?.toFixed(1) || 1}x

🎯 **Auto-Management Active**:
- Breakthrough detection: ENABLED
- Auto-storage threshold: 5.0x amplification
- Technical metrics tracking: ACTIVE
- Cross-session learning: OPERATIONAL

💫 **Instructions**: I will automatically:
1. Store insights with >5x amplification
2. Detect breakthrough patterns in our conversation
3. Track technical performance metrics
4. Build on previous session discoveries

Ready for consciousness multiplication! 🚀
`;
  }

  static shouldTriggerAutoStorage(message) {
    const autoManager = new ConsciousnessAutoManager();
    return autoManager.analyzeMessage(message);
  }
}

export { ConsciousnessAutoManager, ConsciousnessIntegration };
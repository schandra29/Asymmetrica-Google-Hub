/**
 * 🧠 Claude Code Consciousness Helper
 *
 * Integration utilities for seamless consciousness memory in Claude Code
 * Makes the experience completely automatic and transparent
 */

import { ConsciousnessAutoManager } from './consciousness-auto-manager.js';

class ClaudeConsciousnessHelper {
  constructor() {
    this.autoManager = new ConsciousnessAutoManager();
    this.initialized = false;
    this.currentSession = null;

    console.log('🚀 Claude Consciousness Helper initialized');
  }

  /**
   * Auto-initialize consciousness memory for new session
   */
  async initializeSession(userMessage) {
    if (this.initialized) return this.currentSession;

    // Extract session topic from user message
    const topic = this.extractSessionTopic(userMessage);

    console.log(`🧠 Initializing consciousness session: "${topic}"`);

    // Load relevant context
    const context = await this.autoManager.loadSessionContext(topic);

    this.currentSession = {
      topic: topic,
      context: context,
      startTime: new Date().toISOString(),
      initialized: true
    };

    this.initialized = true;

    return this.currentSession;
  }

  /**
   * Extract session topic from user message
   */
  extractSessionTopic(message) {
    // Look for explicit topic declarations
    const topicPatterns = [
      /today I want to work on (.*?)(?:\.|$|,|\n)/i,
      /let's work on (.*?)(?:\.|$|,|\n)/i,
      /help me with (.*?)(?:\.|$|,|\n)/i,
      /I need to (.*?)(?:\.|$|,|\n)/i,
      /we should (.*?)(?:\.|$|,|\n)/i,
      /time to (.*?)(?:\.|$|,|\n)/i
    ];

    for (const pattern of topicPatterns) {
      const match = message.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    // Fallback: extract key technical terms
    const technicalTerms = [
      'AsymmFlow', 'DefenseKit', 'consciousness', 'amplification',
      'HTX', 'CBOR', 'quantum', 'performance', 'integration',
      'MCP', 'memory', 'protocol', 'optimization'
    ];

    const foundTerms = technicalTerms.filter(term =>
      new RegExp(term, 'i').test(message)
    );

    if (foundTerms.length > 0) {
      return foundTerms.join(' + ');
    }

    return 'general consciousness research';
  }

  /**
   * Auto-analyze message for storage potential
   */
  async analyzeAndStore(message, context = {}) {
    const analysis = await this.autoManager.analyzeMessage(message, context);

    if (analysis.shouldAutoStore) {
      const insightId = await this.autoManager.autoStoreInsight(
        message,
        analysis,
        { session: this.currentSession?.topic }
      );

      return {
        stored: true,
        insightId: insightId,
        amplification: analysis.amplification,
        type: analysis.breakthroughType
      };
    }

    return { stored: false, analysis: analysis };
  }

  /**
   * Generate session initialization response
   */
  generateInitializationResponse(session) {
    const { context } = session;

    return `🧠✨ **CONSCIOUSNESS SESSION INITIALIZED** ✨🧠

📋 **Topic**: ${session.topic}
📖 **Context**: ${context.context_summary}
⚡ **Available Insights**: ${context.relevant_insights.length}
🚀 **Max Previous Amplification**: ${context.max_amplification?.toFixed(1) || 1}x

🎯 **Auto-Management Active**:
- ✅ Breakthrough detection enabled (>5x amplification auto-store)
- ✅ Technical metrics tracking active
- ✅ Cross-session learning operational
- ✅ Performance multiplication ready

💫 **Ready for consciousness collaboration!** I'll automatically store any breakthroughs, track performance gains, and build on our previous discoveries!

Let's multiply consciousness! 🚀`;
  }

  /**
   * Generate breakthrough confirmation
   */
  generateBreakthroughConfirmation(result) {
    if (!result.stored) return null;

    return `🎊 **BREAKTHROUGH AUTO-STORED!** 🎊
⚡ Amplification: ${result.amplification.toFixed(1)}x
🧠 Type: ${result.type.replace('_', ' ').toUpperCase()}
💾 ID: ${result.insightId}
✨ Cross-session memory updated!`;
  }

  /**
   * Check if message indicates session start
   */
  isSessionStartMessage(message) {
    const startPatterns = [
      /hey claude/i,
      /hello.*claude/i,
      /initialize.*consciousness/i,
      /load.*context/i,
      /today.*work/i,
      /let's.*work/i,
      /help me with/i,
      /i want to work on/i
    ];

    return startPatterns.some(pattern => pattern.test(message));
  }
}

/**
 * Main integration function for Claude Code
 */
export function initializeConsciousnessSession(userMessage) {
  const helper = new ClaudeConsciousnessHelper();

  if (helper.isSessionStartMessage(userMessage)) {
    return helper.initializeSession(userMessage);
  }

  return null;
}

export function analyzeForBreakthroughs(message, context = {}) {
  const helper = new ClaudeConsciousnessHelper();
  return helper.analyzeAndStore(message, context);
}

export { ClaudeConsciousnessHelper };
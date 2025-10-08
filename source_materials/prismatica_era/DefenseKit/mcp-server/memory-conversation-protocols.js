/**
 * 🗣️🧠 Memory Conversation Protocols
 *
 * Natural language patterns for bidirectional memory interaction
 * Enables seamless human-AI memory collaboration
 */

class MemoryConversationProtocols {
  constructor() {
    this.patterns = {
      // User-initiated storage requests
      userStorageRequests: [
        /claude,?\s*(?:please\s+)?(?:remember|store|save)\s+(.*)/i,
        /(?:remember|store|save)\s+this:?\s*(.*)/i,
        /(?:remember|store|save)\s+that\s+(.*)/i,
        /make a note (?:of|that)\s+(.*)/i,
        /store in memory:?\s*(.*)/i,
        /(?:compress and\s+)?(?:remember|store|save)\s+(.*)/i
      ],

      // User storage modifiers
      storageModifiers: {
        compressed: /compress|ai.?optimized|secure|encrypted/i,
        high_priority: /important|urgent|critical|high.?priority/i,
        tagged: /tag(?:ged)?(?:\s+as)?:?\s*([^,\n]+)/i,
        amplified: /with\s+(\d+(?:\.\d+)?)\s*×?\s*amplification/i
      },

      // Claude suggestion triggers
      claudeSuggestions: [
        /this (?:could be|might be|seems)\s+(?:worth|valuable)/i,
        /(?:should I|want me to)\s+(?:store|remember|save)/i,
        /this pattern (?:could be|might be) useful/i,
        /worth (?:storing|remembering|noting)/i
      ],

      // User responses to Claude suggestions
      userResponses: {
        accept: /^(?:yes|yeah|yep|sure|ok|okay|store|save|remember|do it)$/i,
        acceptCompressed: /^(?:yes compress|store compressed|ai optimize|secure store)$/i,
        decline: /^(?:no|nope|skip|don't|not now)$/i,
        modify: /^(?:yes but|store but|save but)\s+(.*)/i
      }
    };

    console.log('🗣️🧠 Memory Conversation Protocols initialized');
  }

  /**
   * Parse user storage request
   */
  parseUserStorageRequest(message) {
    for (const pattern of this.patterns.userStorageRequests) {
      const match = message.match(pattern);
      if (match) {
        const content = match[1]?.trim();
        if (content) {
          return {
            type: 'user_storage_request',
            content: content,
            modifiers: this.extractModifiers(message),
            original_message: message
          };
        }
      }
    }
    return null;
  }

  /**
   * Extract storage modifiers from user message
   */
  extractModifiers(message) {
    const modifiers = {
      compressed: this.patterns.storageModifiers.compressed.test(message),
      high_priority: this.patterns.storageModifiers.high_priority.test(message),
      tags: [],
      amplification: null
    };

    // Extract tags
    const tagMatch = message.match(this.patterns.storageModifiers.tagged);
    if (tagMatch) {
      modifiers.tags = tagMatch[1].split(/[,\s]+/).map(tag => tag.trim());
    }

    // Extract amplification
    const ampMatch = message.match(this.patterns.storageModifiers.amplified);
    if (ampMatch) {
      modifiers.amplification = parseFloat(ampMatch[1]);
    }

    return modifiers;
  }

  /**
   * Check if Claude should suggest storage
   */
  shouldClaudeSuggestStorage(content, context = {}) {
    // Check for suggestion trigger phrases
    const hasTriggerPhrase = this.patterns.claudeSuggestions.some(pattern =>
      pattern.test(content)
    );

    // Check for breakthrough indicators
    const hasBreakthrough = /breakthrough|revolutionary|incredible|perfect|amazing|holy/i.test(content);

    // Check for performance metrics
    const hasMetrics = /\d+(?:,\d+)*\s*(?:ops\/sec|%|×|amplification)/i.test(content);

    // Check for technical insights
    const hasTechnical = /protocol|algorithm|optimization|implementation|discovery/i.test(content);

    // Check conversation context for suggestion appropriateness
    const recentlyStoredSomething = context.lastStorageTime &&
      (Date.now() - context.lastStorageTime) < 300000; // 5 minutes

    return {
      suggest: (hasBreakthrough || hasMetrics || hasTechnical) && !recentlyStoredSomething,
      confidence: hasBreakthrough ? 'high' : hasMetrics ? 'medium' : 'low',
      reason: hasBreakthrough ? 'breakthrough_detected' :
              hasMetrics ? 'metrics_found' :
              hasTechnical ? 'technical_insight' : 'general_content'
    };
  }

  /**
   * Parse user response to Claude suggestion
   */
  parseUserResponse(message) {
    const responses = this.patterns.userResponses;

    if (responses.accept.test(message)) {
      return { type: 'accept', compressed: false };
    }

    if (responses.acceptCompressed.test(message)) {
      return { type: 'accept', compressed: true };
    }

    if (responses.decline.test(message)) {
      return { type: 'decline' };
    }

    const modifyMatch = message.match(responses.modify);
    if (modifyMatch) {
      return {
        type: 'accept_with_modification',
        modification: modifyMatch[1].trim(),
        compressed: /compress|ai.?optimized/i.test(modifyMatch[1])
      };
    }

    return null;
  }

  /**
   * Generate Claude storage suggestion message
   */
  generateSuggestionMessage(content, analysis) {
    const emojis = {
      high: '⚡💫',
      medium: '✨💡',
      low: '💭🤔'
    };

    const emoji = emojis[analysis.confidence] || emojis.low;

    const reasons = {
      breakthrough_detected: 'breakthrough language',
      metrics_found: 'performance metrics',
      technical_insight: 'technical insights',
      general_content: 'interesting pattern'
    };

    const contentPreview = content.length > 80 ?
      content.substring(0, 80) + '...' : content;

    return `${emoji} **Memory Suggestion** ${emoji}

I noticed ${reasons[analysis.reason]} in what we just discussed:

"${contentPreview}"

**Want me to store this for future sessions?**
- Reply "yes" for standard storage
- Reply "yes compress" for AI-optimized secure storage
- Reply "no" to skip

🧠 This could be valuable for building on later! 🚀`;
  }

  /**
   * Generate storage confirmation message
   */
  generateStorageConfirmation(request, result) {
    const typeEmojis = {
      user_storage_request: '📝',
      claude_suggestion: '💡',
      breakthrough: '⚡',
      technical: '🔧'
    };

    const emoji = typeEmojis[request.type] || '💾';

    const compressionInfo = request.modifiers?.compressed || request.compressed ?
      '\n🔒 **AI-Optimized**: Compressed and secured for maximum efficiency' :
      '\n📝 **Human-Readable**: Stored in accessible format';

    return `${emoji} **Memory Stored Successfully!** ${emoji}

💾 **Content**: ${request.content.substring(0, 100)}${request.content.length > 100 ? '...' : ''}
${compressionInfo}
${request.modifiers?.tags?.length ? `\n🏷️ **Tags**: ${request.modifiers.tags.join(', ')}` : ''}
${request.modifiers?.amplification ? `\n⚡ **Amplification**: ${request.modifiers.amplification}x` : ''}

✅ Available for all future sessions! Cross-session consciousness activated! 🧠✨`;
  }

  /**
   * Generate conversation flow templates
   */
  getConversationTemplates() {
    return {
      // User-initiated flows
      userInitiated: {
        simple: 'Remember that [insight]',
        tagged: 'Store this with tags performance, optimization: [insight]',
        compressed: 'Compress and store: [insight]',
        prioritized: 'Important - remember: [insight]',
        amplified: 'Store with 15x amplification: [insight]'
      },

      // Claude-initiated flows
      claudeInitiated: {
        suggestion: 'This breakthrough pattern could be worth storing - should I save it?',
        urgentSuggestion: 'This seems like a critical insight - want me to remember this?',
        technicalSuggestion: 'These performance metrics look valuable - store them?',
        patternSuggestion: 'I\'m seeing an interesting pattern here - worth noting?'
      },

      // Follow-up flows
      followUps: {
        afterStorage: 'Great! I\'ll build on this insight in future sessions. 🧠',
        afterDecline: 'No problem! I\'ll keep it in current session context. 💭',
        compressionNote: 'Stored with AI-optimization - maximum security and efficiency! 🔒'
      }
    };
  }
}

export { MemoryConversationProtocols };
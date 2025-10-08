/**
 * DEFENSEKIT EMAIL SHIELD
 *
 * Protect against sophisticated phishing attacks using:
 * - Template Calibration for link verification
 * - Self-Certifying Identity for sender validation
 * - Natural Asymmetry for behavioral analysis
 *
 * Built for AsymmFlow to solve Abhie's RFQ phishing problem!
 */

import { TemplateCalibration } from '../calibration/template-calibration.js';
import { SelfCertifyingIdentity } from '../identity/self-certifying.js';

export class EmailShield {
  constructor() {
    this.templateCalibration = new TemplateCalibration();
    this.identitySystem = new SelfCertifyingIdentity();
    this.trustedSenders = new Map();
    this.phishingPatterns = new Set();
    this.riskScores = new Map();

    // Natural Asymmetry distribution for email analysis
    this.naturalAsymmetry = {
      exploration: 0.30,  // Pattern discovery (new threats)
      precision: 0.20,    // Binary decisions (safe/dangerous)
      support: 0.50       // Protection systems (sandboxing, alerts)
    };
  }

  /**
   * MAIN EMAIL ANALYSIS - Call this for every incoming email
   */
  async analyzeEmail(email) {
    const analysis = {
      email: email,
      riskScore: 0,
      threats: [],
      recommendations: [],
      verdict: 'UNKNOWN',
      components: {}
    };

    // PHASE 1: SENDER VERIFICATION (30% - Exploration)
    analysis.components.senderVerification = await this.verifySender(email);

    // PHASE 2: LINK ANALYSIS (20% - Precision)
    analysis.components.linkAnalysis = await this.analyzeLinks(email);

    // PHASE 3: CONTENT & BEHAVIORAL ANALYSIS (50% - Support)
    analysis.components.contentAnalysis = await this.analyzeContent(email);

    // Calculate final risk score
    analysis.riskScore = this.calculateRiskScore(analysis.components);

    // Make verdict
    analysis.verdict = this.makeVerdict(analysis.riskScore);
    analysis.recommendations = this.generateRecommendations(analysis);

    return analysis;
  }

  /**
   * SENDER VERIFICATION - Is this really who they claim to be?
   */
  async verifySender(email) {
    const result = {
      score: 0,
      trusted: false,
      identity: null,
      flags: []
    };

    // Check if sender is in trusted contacts
    const senderKey = this.extractSenderKey(email.from);
    const trustedContact = this.trustedSenders.get(senderKey);

    if (trustedContact) {
      // Verify cryptographic identity
      try {
        const verified = await this.identitySystem.verifyIdentity(
          email.from,
          email.dkimSignature || email.headers['authentication-results']
        );

        if (verified) {
          result.trusted = true;
          result.score = 95;
          result.identity = trustedContact;
        } else {
          result.flags.push('IDENTITY_SPOOFING');
          result.score = 10;
        }
      } catch (error) {
        result.flags.push('IDENTITY_VERIFICATION_FAILED');
        result.score = 15;
      }
    } else {
      // Unknown sender - analyze domain reputation
      const domain = email.from.split('@')[1];
      const domainScore = await this.analyzeDomain(domain);
      result.score = domainScore;

      if (domainScore < 30) {
        result.flags.push('SUSPICIOUS_DOMAIN');
      }
    }

    return result;
  }

  /**
   * LINK ANALYSIS - Are the links going where they claim?
   */
  async analyzeLinks(email) {
    const result = {
      score: 100,
      links: [],
      threats: []
    };

    // Extract all links from email
    const links = this.extractLinks(email.content);

    for (const link of links) {
      const linkAnalysis = await this.analyzeSingleLink(link);
      result.links.push(linkAnalysis);

      if (linkAnalysis.risk > 70) {
        result.threats.push({
          type: 'MALICIOUS_LINK',
          url: link.url,
          displayText: link.text,
          reason: linkAnalysis.reason
        });
        result.score = Math.min(result.score, 20);
      }
    }

    return result;
  }

  /**
   * SINGLE LINK ANALYSIS - The magic happens here!
   */
  async analyzeSingleLink(link) {
    const analysis = {
      url: link.url,
      displayText: link.text,
      risk: 0,
      reason: '',
      templateMatch: null
    };

    try {
      // Parse the actual destination
      const url = new URL(link.url);

      // RED FLAG 1: URL doesn't match display text
      if (link.text.includes('http') && !link.text.includes(url.hostname)) {
        analysis.risk += 40;
        analysis.reason += 'URL mismatch; ';
      }

      // RED FLAG 2: Suspicious TLD
      const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf', '.club', '.download'];
      if (suspiciousTlds.some(tld => url.hostname.endsWith(tld))) {
        analysis.risk += 30;
        analysis.reason += 'Suspicious TLD; ';
      }

      // RED FLAG 3: Template Calibration Check
      try {
        const template = await this.templateCalibration.calibrate(url.hostname);
        analysis.templateMatch = template;

        // Check if this domain matches known legitimate patterns
        if (this.isKnownLegitimate(url.hostname)) {
          analysis.risk = Math.max(0, analysis.risk - 30);
          analysis.reason += 'Known legitimate domain; ';
        }
      } catch (error) {
        // Could not calibrate - highly suspicious
        analysis.risk += 50;
        analysis.reason += 'Cannot verify destination server; ';
      }

      // RED FLAG 4: URL shorteners or redirects
      if (this.isUrlShortener(url.hostname)) {
        analysis.risk += 35;
        analysis.reason += 'URL shortener detected; ';
      }

    } catch (error) {
      // Invalid URL
      analysis.risk = 90;
      analysis.reason = 'Invalid or malformed URL';
    }

    return analysis;
  }

  /**
   * CONTENT ANALYSIS - Behavioral and linguistic patterns
   */
  async analyzeContent(email) {
    const result = {
      score: 100,
      flags: [],
      urgencyScore: 0,
      similarityScore: 0
    };

    const content = email.subject + ' ' + email.content;

    // URGENCY INDICATORS (Classic phishing tactic)
    const urgencyKeywords = [
      'urgent', 'immediate', 'asap', 'expires today', 'act now',
      'limited time', 'click now', 'verify now', 'suspend',
      'locked', 'unauthorized', 'suspicious activity'
    ];

    const urgencyCount = urgencyKeywords.reduce((count, keyword) =>
      content.toLowerCase().includes(keyword) ? count + 1 : count, 0
    );

    if (urgencyCount > 2) {
      result.flags.push('HIGH_URGENCY_LANGUAGE');
      result.score -= 30;
      result.urgencyScore = urgencyCount * 15;
    }

    // GENERIC GREETINGS (Phishing often uses generic greetings)
    const genericGreetings = ['dear customer', 'dear user', 'dear client'];
    if (genericGreetings.some(greeting => content.toLowerCase().includes(greeting))) {
      result.flags.push('GENERIC_GREETING');
      result.score -= 20;
    }

    // ATTACHMENT ANALYSIS
    if (email.attachments && email.attachments.length > 0) {
      for (const attachment of email.attachments) {
        if (this.isSuspiciousAttachment(attachment)) {
          result.flags.push('SUSPICIOUS_ATTACHMENT');
          result.score -= 40;
        }
      }
    }

    // REQUEST PATTERN ANALYSIS (Your specific RFQ scenario!)
    if (this.isRFQPattern(content)) {
      result.flags.push('RFQ_PATTERN_DETECTED');
      // Don't penalize - just flag for special handling
    }

    return result;
  }

  /**
   * CALCULATE FINAL RISK SCORE using Natural Asymmetry
   */
  calculateRiskScore(components) {
    const senderWeight = this.naturalAsymmetry.exploration;    // 30%
    const linkWeight = this.naturalAsymmetry.precision;        // 20%
    const contentWeight = this.naturalAsymmetry.support;       // 50%

    // Invert scores so higher = more dangerous
    const senderRisk = 100 - components.senderVerification.score;
    const linkRisk = 100 - components.linkAnalysis.score;
    const contentRisk = 100 - components.contentAnalysis.score;

    const finalRisk = (
      senderRisk * senderWeight +
      linkRisk * linkWeight +
      contentRisk * contentWeight
    );

    return Math.round(finalRisk);
  }

  /**
   * MAKE VERDICT - Safe, Suspicious, or Dangerous
   */
  makeVerdict(riskScore) {
    if (riskScore < 20) return 'SAFE';
    if (riskScore < 60) return 'SUSPICIOUS';
    return 'DANGEROUS';
  }

  /**
   * GENERATE RECOMMENDATIONS for Abhie and his team
   */
  generateRecommendations(analysis) {
    const recommendations = [];

    if (analysis.verdict === 'DANGEROUS') {
      recommendations.push('🚨 DO NOT CLICK any links or download attachments');
      recommendations.push('⛔ Block this sender immediately');
      recommendations.push('🔍 Report to security team for investigation');
    } else if (analysis.verdict === 'SUSPICIOUS') {
      recommendations.push('⚠️ Verify sender through separate communication channel');
      recommendations.push('🔗 Hover over links to check destinations before clicking');
      recommendations.push('📎 Scan attachments before opening');
      recommendations.push('👤 Bring to Abhie for manual review if uncertain');
    } else {
      recommendations.push('✅ Email appears legitimate');
      recommendations.push('🔍 Still exercise normal caution with attachments');
    }

    return recommendations;
  }

  /**
   * HELPER METHODS
   */
  extractSenderKey(fromAddress) {
    return fromAddress.toLowerCase().trim();
  }

  extractLinks(content) {
    const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi;
    const links = [];
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      links.push({
        url: match[1],
        text: match[2]
      });
    }

    return links;
  }

  async analyzeDomain(domain) {
    // In production, this would check domain reputation APIs
    // For now, basic checks
    if (domain.includes('secure') || domain.includes('verify')) {
      return 25; // Often used in phishing
    }
    return 70; // Assume neutral
  }

  isUrlShortener(hostname) {
    const shorteners = [
      'bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly',
      'short.link', 'rb.gy', 'is.gd', 'buff.ly'
    ];
    return shorteners.includes(hostname);
  }

  isKnownLegitimate(hostname) {
    const legitimate = [
      'google.com', 'microsoft.com', 'apple.com', 'amazon.com',
      'paypal.com', 'ebay.com', 'linkedin.com', 'facebook.com'
    ];
    return legitimate.some(domain => hostname.endsWith(domain));
  }

  isSuspiciousAttachment(attachment) {
    const suspiciousExtensions = [
      '.exe', '.scr', '.bat', '.cmd', '.com', '.pif', '.vbs',
      '.js', '.jar', '.zip', '.rar'
    ];
    return suspiciousExtensions.some(ext =>
      attachment.name.toLowerCase().endsWith(ext)
    );
  }

  isRFQPattern(content) {
    const rfqKeywords = [
      'request for quote', 'rfq', 'quotation', 'proposal',
      'tender', 'bid', 'purchase order', 'po'
    ];
    return rfqKeywords.some(keyword =>
      content.toLowerCase().includes(keyword)
    );
  }

  /**
   * TRUST MANAGEMENT - Add legitimate contacts
   */
  addTrustedSender(email, identity) {
    this.trustedSenders.set(this.extractSenderKey(email), {
      email,
      identity,
      added: Date.now()
    });
  }

  /**
   * BATCH ANALYSIS - For processing email queue
   */
  async analyzeEmailBatch(emails) {
    const results = [];

    for (const email of emails) {
      try {
        const analysis = await this.analyzeEmail(email);
        results.push(analysis);
      } catch (error) {
        results.push({
          email,
          error: error.message,
          verdict: 'ERROR'
        });
      }
    }

    return results;
  }
}

/**
 * ASIMMFLOW INTEGRATION HELPER
 */
export class AsymmFlowEmailIntegration {
  constructor() {
    this.emailShield = new EmailShield();
  }

  /**
   * Process email and return AsymmFlow-compatible result
   */
  async processEmail(email) {
    const analysis = await this.emailShield.analyzeEmail(email);

    return {
      id: email.id,
      verdict: analysis.verdict,
      riskScore: analysis.riskScore,
      shouldShow: analysis.verdict !== 'DANGEROUS',
      warningLevel: this.getWarningLevel(analysis.verdict),
      recommendations: analysis.recommendations,
      details: analysis.components
    };
  }

  getWarningLevel(verdict) {
    switch (verdict) {
      case 'SAFE': return 'none';
      case 'SUSPICIOUS': return 'medium';
      case 'DANGEROUS': return 'high';
      default: return 'unknown';
    }
  }
}

export default {
  EmailShield,
  AsymmFlowEmailIntegration
};
/**
 * Badge Generator
 * Generates README badges for Sonar Suite results
 *
 * Agent Kilo - CI/CD Automation Architect
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface SystemHealthData {
  shm: number;
  regime: 'exploration' | 'optimization' | 'stabilization';
  delta: number;
  timestamp: string;
}

interface BadgeConfig {
  label: string;
  message: string;
  color: string;
  style?: 'flat' | 'flat-square' | 'for-the-badge' | 'plastic' | 'social';
  logo?: string;
  logoColor?: string;
}

class BadgeGenerator {
  private basePath: string;

  constructor(basePath: string = process.cwd()) {
    const isInUXSonar = basePath.includes('ux-sonar');
    this.basePath = isInUXSonar ? basePath : join(basePath, 'tests/ux-sonar');
  }

  /**
   * Load system health data
   */
  loadSystemHealth(): SystemHealthData | null {
    const path = join(this.basePath, 'reports/system-health-report.json');
    if (!existsSync(path)) return null;

    try {
      return JSON.parse(readFileSync(path, 'utf-8'));
    } catch (error) {
      console.error('Failed to load system health data:', error);
      return null;
    }
  }

  /**
   * Get color for SHM score
   */
  private getSHMColor(shm: number): string {
    if (shm >= 0.85) return 'brightgreen';
    if (shm >= 0.75) return 'green';
    if (shm >= 0.65) return 'yellow';
    if (shm >= 0.50) return 'orange';
    return 'red';
  }

  /**
   * Get color for regime
   */
  private getRegimeColor(regime: string): string {
    const colors = {
      exploration: 'yellow',
      optimization: 'blue',
      stabilization: 'brightgreen'
    };
    return colors[regime as keyof typeof colors] || 'lightgrey';
  }

  /**
   * Generate shields.io badge URL
   */
  generateBadgeURL(config: BadgeConfig): string {
    const params = new URLSearchParams();

    if (config.style) params.set('style', config.style);
    if (config.logo) params.set('logo', config.logo);
    if (config.logoColor) params.set('logoColor', config.logoColor);

    const label = encodeURIComponent(config.label);
    const message = encodeURIComponent(config.message);
    const color = config.color;

    const queryString = params.toString();
    const baseURL = `https://img.shields.io/badge/${label}-${message}-${color}`;

    return queryString ? `${baseURL}?${queryString}` : baseURL;
  }

  /**
   * Generate SHM badge
   */
  generateSHMBadge(shm: number, style: BadgeConfig['style'] = 'for-the-badge'): string {
    const percentage = (shm * 100).toFixed(0);
    const color = this.getSHMColor(shm);

    const config: BadgeConfig = {
      label: 'SHM',
      message: `${percentage}%`,
      color,
      style,
      logo: 'target',
      logoColor: 'white'
    };

    const url = this.generateBadgeURL(config);
    return `![System Health Metric](${url})`;
  }

  /**
   * Generate regime badge
   */
  generateRegimeBadge(regime: string, style: BadgeConfig['style'] = 'for-the-badge'): string {
    const color = this.getRegimeColor(regime);
    const label = regime.charAt(0).toUpperCase() + regime.slice(1);

    const logos = {
      exploration: 'searchengin',
      optimization: 'speedtest',
      stabilization: 'checkmarx'
    };

    const config: BadgeConfig = {
      label: 'Regime',
      message: label,
      color,
      style,
      logo: logos[regime as keyof typeof logos],
      logoColor: 'white'
    };

    const url = this.generateBadgeURL(config);
    return `![Regime](${url})`;
  }

  /**
   * Generate last run badge
   */
  generateLastRunBadge(timestamp: string, style: BadgeConfig['style'] = 'flat'): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    let message: string;
    let color: string;

    if (diffHours < 1) {
      message = 'just now';
      color = 'brightgreen';
    } else if (diffHours < 24) {
      message = `${diffHours}h ago`;
      color = 'green';
    } else if (diffDays < 7) {
      message = `${diffDays}d ago`;
      color = 'yellow';
    } else {
      message = date.toLocaleDateString();
      color = 'orange';
    }

    const config: BadgeConfig = {
      label: 'Last Run',
      message,
      color,
      style,
      logo: 'github-actions',
      logoColor: 'white'
    };

    const url = this.generateBadgeURL(config);
    return `![Last Run](${url})`;
  }

  /**
   * Generate trend badge
   */
  generateTrendBadge(delta: number, style: BadgeConfig['style'] = 'flat'): string {
    const percentage = (delta * 100).toFixed(1);
    const sign = delta >= 0 ? '+' : '';
    const message = `${sign}${percentage}%`;

    let color: string;
    if (Math.abs(delta) < 0.02) {
      color = 'lightgrey';
    } else if (delta > 0) {
      color = 'brightgreen';
    } else {
      color = 'red';
    }

    const config: BadgeConfig = {
      label: 'Trend',
      message,
      color,
      style
    };

    const url = this.generateBadgeURL(config);
    return `![Trend](${url})`;
  }

  /**
   * Generate CI status badge (for GitHub Actions)
   */
  generateCIBadge(repo: string, workflow: string = 'sonar-suite.yml', branch: string = 'main'): string {
    const url = `https://github.com/${repo}/actions/workflows/${workflow}/badge.svg?branch=${branch}`;
    return `![Sonar Suite CI](${url})`;
  }

  /**
   * Generate all badges
   */
  generateAll(data: SystemHealthData, repo?: string): { [key: string]: string } {
    const badges = {
      shm: this.generateSHMBadge(data.shm),
      regime: this.generateRegimeBadge(data.regime),
      lastRun: this.generateLastRunBadge(data.timestamp),
      trend: this.generateTrendBadge(data.delta)
    };

    if (repo) {
      return {
        ...badges,
        ci: this.generateCIBadge(repo)
      };
    }

    return badges;
  }

  /**
   * Generate README section with badges
   */
  generateREADMESection(data: SystemHealthData, repo?: string, dashboardURL?: string): string {
    const badges = this.generateAll(data, repo);

    let section = `## 🎯 Sonar Suite Status\n\n`;

    // Badge row
    section += `${badges.shm} ${badges.regime}`;
    if (badges.ci) section += ` ${badges.ci}`;
    section += `\n\n`;

    // Secondary badges
    section += `${badges.lastRun} ${badges.trend}\n\n`;

    // Description
    section += `**System Health Metric (SHM):** ${(data.shm * 100).toFixed(0)}% - `;
    section += `${data.regime.charAt(0).toUpperCase() + data.regime.slice(1)} Regime\n\n`;

    // Links
    if (dashboardURL) {
      section += `📊 [View Full Dashboard](${dashboardURL})\n\n`;
    }

    section += `---\n\n`;
    section += `*Badges generated by Agent Kilo - CI/CD Automation Architect*\n`;

    return section;
  }

  /**
   * Save badges to file
   */
  saveBadges(data: SystemHealthData, repo?: string): void {
    const badges = this.generateAll(data, repo);
    const section = this.generateREADMESection(data, repo);

    const outputPath = join(this.basePath, 'reports/badges.md');
    let content = `# Sonar Suite Badges\n\n`;
    content += `Generated: ${new Date().toISOString()}\n\n`;
    content += `## Individual Badges\n\n`;

    for (const [name, badge] of Object.entries(badges)) {
      content += `### ${name.toUpperCase()}\n`;
      content += `\`\`\`markdown\n${badge}\n\`\`\`\n`;
      content += `${badge}\n\n`;
    }

    content += `## README Section\n\n`;
    content += `\`\`\`markdown\n${section}\n\`\`\`\n\n`;
    content += `### Preview:\n\n`;
    content += section;

    writeFileSync(outputPath, content);
    console.log(`✅ Badges saved to: ${outputPath}`);
  }

  /**
   * Print badges to console
   */
  printBadges(data: SystemHealthData, repo?: string): void {
    const badges = this.generateAll(data, repo);

    console.log('\n' + '='.repeat(60));
    console.log('  SONAR SUITE BADGES');
    console.log('='.repeat(60));
    console.log();

    console.log('Copy these badges to your README:\n');

    console.log('SHM Badge:');
    console.log(badges.shm);
    console.log();

    console.log('Regime Badge:');
    console.log(badges.regime);
    console.log();

    console.log('Last Run Badge:');
    console.log(badges.lastRun);
    console.log();

    console.log('Trend Badge:');
    console.log(badges.trend);
    console.log();

    if (badges.ci) {
      console.log('CI Status Badge:');
      console.log(badges.ci);
      console.log();
    }

    console.log('='.repeat(60));
    console.log();

    console.log('README Section:');
    console.log('-'.repeat(60));
    console.log(this.generateREADMESection(data, repo));
    console.log('='.repeat(60));
    console.log();
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const repo = args.find(arg => arg.startsWith('--repo='))?.split('=')[1];

  console.log('🎨 Generating Sonar Suite badges...\n');

  const generator = new BadgeGenerator();
  const data = generator.loadSystemHealth();

  if (!data) {
    console.error('❌ Failed to load system health data');
    console.error('   Run the sonar suite first: npm run sonar:all');
    process.exit(1);
  }

  console.log(`📊 System Health Data loaded:`);
  console.log(`   SHM: ${(data.shm * 100).toFixed(0)}%`);
  console.log(`   Regime: ${data.regime}`);
  console.log(`   Last Run: ${new Date(data.timestamp).toLocaleString()}`);
  console.log();

  // Generate and print badges
  generator.printBadges(data, repo);

  // Save badges
  generator.saveBadges(data, repo);

  console.log('✨ Badge generation complete!');
  console.log();
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Badge generation failed:', error);
    process.exit(1);
  });
}

export { BadgeGenerator, BadgeConfig };

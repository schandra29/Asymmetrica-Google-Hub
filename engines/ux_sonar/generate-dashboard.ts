#!/usr/bin/env ts-node
/**
 * Dashboard Generation Script
 * Standalone script to generate the unified Sonar Suite dashboard
 * Agent Foxtrot - Dashboard Architect
 */

import { SonarDashboard } from './dashboard-generator';
import { ReportAggregator } from './dashboard/report-aggregator';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

async function generateDashboard() {
  console.log('🚀 Agent Foxtrot - Dashboard Generation Starting...\n');

  // Initialize components
  const dashboard = new SonarDashboard();
  const aggregator = new ReportAggregator();

  console.log('📊 Step 1: Collecting sonar reports...');
  const healthData = aggregator.generateSystemHealthData();

  console.log('📊 Step 2: Calculating System Health Metric...');
  console.log(`   SHM: ${healthData.shm.toFixed(2)}/1.0`);
  console.log(`   Regime: ${healthData.regime.toUpperCase()}`);
  console.log(`   Delta: ${healthData.delta >= 0 ? '+' : ''}${healthData.delta.toFixed(2)}\n`);

  console.log('📊 Step 3: Analyzing individual sonars...');
  healthData.sonars.forEach(sonar => {
    const statusEmoji = sonar.status === 'healthy' ? '✅' :
                       sonar.status === 'warning' ? '⚠️' : '🚨';
    console.log(`   ${statusEmoji} ${sonar.name}: ${sonar.score.toFixed(2)} (${sonar.regime})`);
  });
  console.log();

  console.log('📊 Step 4: Detecting praise signals...');
  if (healthData.praiseSignals.length > 0) {
    healthData.praiseSignals.forEach(signal => {
      console.log(`   ${signal.icon} ${signal.sonar}: ${signal.message}`);
    });
  } else {
    console.log('   (No praise signals detected - keep optimizing!)');
  }
  console.log();

  console.log('📊 Step 5: Checking for alerts...');
  if (healthData.alerts.length > 0) {
    healthData.alerts.forEach(alert => {
      const emoji = alert.severity === 'critical' ? '🚨' : '⚠️';
      console.log(`   ${emoji} ${alert.sonar}: ${alert.message}`);
    });
  } else {
    console.log('   ✅ No critical alerts - all systems nominal!');
  }
  console.log();

  console.log('📊 Step 6: Generating HTML dashboard...');
  const html = dashboard.generateHTML(healthData);

  console.log('📊 Step 7: Saving dashboard file...');
  const outputDir = join(process.cwd(), 'tests/ux-sonar/dashboard');
  try {
    mkdirSync(outputDir, { recursive: true });
  } catch (e) {
    // Directory exists
  }

  const outputPath = join(outputDir, 'index.html');
  writeFileSync(outputPath, html);

  console.log('\n✅ Dashboard Generation Complete!\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 DASHBOARD SUMMARY');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`System Health Metric (SHM):  ${healthData.shm.toFixed(2)}/1.0 (${(healthData.shm * 100).toFixed(0)}%)`);
  console.log(`Overall Regime:              ${healthData.regime.toUpperCase()}`);
  console.log(`Change from Baseline:        ${healthData.delta >= 0 ? '+' : ''}${healthData.delta.toFixed(2)}`);
  console.log(`Sonars Reporting:            ${healthData.sonars.length}/6`);
  console.log(`Praise Signals:              ${healthData.praiseSignals.length}`);
  console.log(`Alerts:                      ${healthData.alerts.length} (${healthData.alerts.filter(a => a.severity === 'critical').length} critical, ${healthData.alerts.filter(a => a.severity === 'warning').length} warning)`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('\n📍 Dashboard Location:');
  console.log(`   ${outputPath}`);
  console.log('\n🌐 To view dashboard:');
  console.log(`   Open the file above in your web browser`);
  console.log('   Or run: start ${outputPath} (Windows)');
  console.log('   Or run: open ${outputPath} (macOS)');
  console.log('\n🎯 Agent Foxtrot Mission Complete! 📊✨\n');

  return outputPath;
}

// Run if executed directly
if (require.main === module) {
  generateDashboard().catch(error => {
    console.error('❌ Dashboard generation failed:', error);
    process.exit(1);
  });
}

export { generateDashboard };

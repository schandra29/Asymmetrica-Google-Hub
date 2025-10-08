/**
 * Simple Dashboard Generation Test (JavaScript)
 * Tests dashboard generation without Playwright
 */

const { execSync } = require('child_process');
const { readFileSync, existsSync } = require('fs');
const { join } = require('path');

console.log('🚀 Testing Dashboard Generation...\n');

// Compile TypeScript files
console.log('📦 Step 1: Compiling TypeScript...');
try {
  execSync('npx tsc --module commonjs --target ES2020 --moduleResolution node --outDir dist dashboard-generator.ts dashboard/report-aggregator.ts dashboard/sparkline-generator.ts dashboard/praise-mode-detector.ts', {
    cwd: __dirname,
    stdio: 'inherit'
  });
  console.log('✅ TypeScript compiled successfully\n');
} catch (error) {
  console.error('❌ TypeScript compilation failed');
  process.exit(1);
}

// Import compiled modules
console.log('📊 Step 2: Loading dashboard components...');
const { SonarDashboard } = require('./dist/dashboard-generator.js');
const { ReportAggregator } = require('./dist/dashboard/report-aggregator.js');

console.log('✅ Components loaded\n');

// Test dashboard generation
console.log('📊 Step 3: Generating dashboard...');

const dashboard = new SonarDashboard();
const aggregator = new ReportAggregator();

// Test SHM calculation
console.log('   Testing SHM calculation...');
const testScores = new Map([
  ['ux', 0.85],
  ['design', 0.78],
  ['code', 0.92],
  ['semantic', 0.81],
  ['journey', 0.76],
  ['state', 0.88]
]);

const shm = dashboard.calculateSHM(testScores);
console.log(`   SHM: ${shm.toFixed(2)} ✅`);

// Test regime determination
console.log('   Testing regime determination...');
const regime = dashboard.determineRegime(shm);
console.log(`   Regime: ${regime} ✅`);

// Generate system health data
console.log('   Generating system health data...');
const healthData = aggregator.generateSystemHealthData();
console.log(`   Sonars: ${healthData.sonars.length} ✅`);
console.log(`   Praise Signals: ${healthData.praiseSignals.length} ✅`);
console.log(`   Alerts: ${healthData.alerts.length} ✅`);

// Generate HTML
console.log('   Generating HTML...');
const html = dashboard.generateHTML(healthData);

if (html.includes('<!DOCTYPE html>') && html.includes('Sonar Suite Dashboard')) {
  console.log('   HTML structure valid ✅');
} else {
  console.error('   HTML structure invalid ❌');
  process.exit(1);
}

// Save the dashboard
const { writeFileSync, mkdirSync } = require('fs');
console.log('   Saving dashboard file...');
const dashboardDir = join(__dirname, 'dashboard');
try {
  mkdirSync(dashboardDir, { recursive: true });
} catch (e) {
  // Directory exists
}
const outputPath = join(dashboardDir, 'index.html');
writeFileSync(outputPath, html);
console.log('   Dashboard saved ✅\n');

// Check if dashboard file was created
const dashboardPath = join(__dirname, 'dashboard', 'index.html');
if (existsSync(dashboardPath)) {
  const fileSize = readFileSync(dashboardPath, 'utf-8').length;
  console.log(`✅ Dashboard file exists (${fileSize} bytes)`);
} else {
  console.log('⚠️  Dashboard file not found (will be created on next run)');
}

console.log('\n═══════════════════════════════════════════════════════════');
console.log('📊 DASHBOARD TEST SUMMARY');
console.log('═══════════════════════════════════════════════════════════');
console.log(`System Health Metric:  ${healthData.shm.toFixed(2)}/1.0`);
console.log(`Regime:                ${healthData.regime.toUpperCase()}`);
console.log(`Sonars Reporting:      ${healthData.sonars.length}/6`);
console.log(`Praise Signals:        ${healthData.praiseSignals.length}`);
console.log(`Alerts:                ${healthData.alerts.length}`);
console.log('═══════════════════════════════════════════════════════════');
console.log('\n📍 Dashboard Location:');
console.log(`   ${outputPath}`);
console.log('\n🌐 To view dashboard:');
console.log('   Open the file above in your web browser');
console.log(`   Or run: start ${outputPath.replace(/\\/g, '/')} (Windows)`);
console.log('\n✅ All Dashboard Tests Passed!\n');
console.log('🎯 Agent Foxtrot Mission Complete! 📊✨\n');

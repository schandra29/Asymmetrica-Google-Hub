#!/usr/bin/env node

/**
 * DefenseKit Test Runner
 * Comprehensive testing and performance recording
 */

import { performance } from 'perf_hooks';
import { writeFileSync } from 'fs';
import chalk from 'chalk';

// Test imports
import { runHTXTests } from './htx-tests.js';
import { runCBORTests } from './cbor-tests.js';
import { runIdentityTests } from './identity-tests.js';
import { runCalibrationTests } from './calibration-tests.js';
import { runReplayTests } from './replay-tests.js';
import { runIntegrationTests } from './integration-tests.js';
import { runPerformanceTests } from './performance-tests.js';

const TEST_SUITES = [
  { name: 'HTX v1.2 Protocol', runner: runHTXTests },
  { name: 'Deterministic CBOR', runner: runCBORTests },
  { name: 'Self-Certifying Identity', runner: runIdentityTests },
  { name: 'Template Calibration', runner: runCalibrationTests },
  { name: 'Replay Protection', runner: runReplayTests },
  { name: 'Integration Tests', runner: runIntegrationTests },
  { name: 'Performance Tests', runner: runPerformanceTests },
];

class TestReporter {
  constructor() {
    this.results = [];
    this.startTime = performance.now();
    this.metrics = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      performance: {}
    };
  }

  startSuite(name) {
    console.log(chalk.cyan(`\n🧪 Running ${name}...`));
    return performance.now();
  }

  endSuite(name, startTime, results) {
    const duration = performance.now() - startTime;
    console.log(chalk.gray(`   Completed in ${duration.toFixed(2)}ms`));
    
    this.results.push({
      suite: name,
      duration,
      results,
      timestamp: new Date().toISOString()
    });

    // Update metrics
    this.metrics.totalTests += results.total;
    this.metrics.passed += results.passed;
    this.metrics.failed += results.failed;
    this.metrics.skipped += results.skipped || 0;
  }

  recordPerformance(name, metrics) {
    this.metrics.performance[name] = metrics;
  }

  generateReport() {
    const totalDuration = performance.now() - this.startTime;
    const successRate = (this.metrics.passed / this.metrics.totalTests * 100).toFixed(2);

    console.log(chalk.bold.cyan('\n' + '='.repeat(60)));
    console.log(chalk.bold.cyan('📊 TEST RESULTS SUMMARY'));
    console.log(chalk.bold.cyan('='.repeat(60)));

    console.log(chalk.white(`
Total Tests:    ${this.metrics.totalTests}
Passed:         ${chalk.green(this.metrics.passed)} (${chalk.green(successRate + '%')})
Failed:         ${this.metrics.failed > 0 ? chalk.red(this.metrics.failed) : this.metrics.failed}
Skipped:        ${this.metrics.skipped}
Duration:       ${(totalDuration / 1000).toFixed(2)}s
    `));

    // Performance highlights
    if (Object.keys(this.metrics.performance).length > 0) {
      console.log(chalk.bold.yellow('\n⚡ PERFORMANCE METRICS:'));
      console.log(chalk.yellow('─'.repeat(40)));
      
      for (const [key, value] of Object.entries(this.metrics.performance)) {
        console.log(chalk.white(`${key}:`));
        for (const [metric, val] of Object.entries(value)) {
          console.log(chalk.gray(`  ${metric}: ${chalk.bold(val)}`));
        }
      }
    }

    // Save report to file
    const report = {
      summary: this.metrics,
      suites: this.results,
      duration: totalDuration,
      timestamp: new Date().toISOString(),
      environment: {
        node: process.version,
        platform: process.platform,
        arch: process.arch,
        cpus: require('os').cpus().length
      }
    };

    const reportPath = `test-report-${Date.now()}.json`;
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(chalk.gray(`\n📁 Full report saved to: ${reportPath}`));

    return this.metrics.failed === 0;
  }
}

async function runAllTests() {
  console.log(chalk.bold.blue('🚀 DEFENSEKIT TEST SUITE'));
  console.log(chalk.blue('Military-grade security testing\n'));

  const reporter = new TestReporter();

  for (const suite of TEST_SUITES) {
    try {
      const startTime = reporter.startSuite(suite.name);
      const results = await suite.runner(reporter);
      reporter.endSuite(suite.name, startTime, results);
    } catch (error) {
      console.error(chalk.red(`❌ Suite failed: ${error.message}`));
      reporter.endSuite(suite.name, 0, {
        total: 0,
        passed: 0,
        failed: 1,
        error: error.message
      });
    }
  }

  const success = reporter.generateReport();
  
  if (success) {
    console.log(chalk.bold.green('\n✅ ALL TESTS PASSED! DefenseKit is battle-ready! 🛡️'));
    process.exit(0);
  } else {
    console.log(chalk.bold.red('\n❌ Some tests failed. Please review and fix.'));
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});
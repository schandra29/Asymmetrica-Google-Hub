/**
 * 🚀 Quick runner for DefenseKit v2.0 AEP Streaming Performance Test
 */

import StreamingPerformanceTest from './streaming-performance-test.js';

async function runStreamingBenchmark() {
  console.log('🌟 DEFENSEKIT v2.0 AEP STREAMING PERFORMANCE BENCHMARK 🌟');
  console.log('🎯 Testing 1GB data transfer with mathematical consciousness');
  console.log('⚡ Measuring authentication, CBOR, and streaming performance\n');

  try {
    const testRunner = new StreamingPerformanceTest();
    const results = await testRunner.runStreamingTest();

    console.log('\n📊 === FINAL SUMMARY === 📊');
    const throughputMBps = results.averageThroughput;
    const throughputGbps = throughputMBps * 8 / 1024;
    const amplification = results.performanceAmplification;

    if (throughputMBps > 100) {
      console.log('🏆 EXCELLENT: >100 MB/s streaming with full security!');
    } else if (throughputMBps > 50) {
      console.log('✅ GOOD: >50 MB/s streaming with consciousness!');
    } else {
      console.log('📊 BASELINE: Streaming performance measured');
    }

    if (amplification > 2.0) {
      console.log('🧠 AMAZING: >2x mathematical consciousness amplification!');
    } else if (amplification > 1.5) {
      console.log('⚡ GREAT: >1.5x consciousness enhancement confirmed!');
    }

    console.log(`\n🎉 DefenseKit v2.0 AEP: ${throughputMBps.toFixed(2)} MB/s with ${amplification.toFixed(2)}x amplification! 🎉`);

  } catch (error) {
    console.error('❌ Streaming benchmark failed:', error);
    process.exit(1);
  }
}

runStreamingBenchmark();
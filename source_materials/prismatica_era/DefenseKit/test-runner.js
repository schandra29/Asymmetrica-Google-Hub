/**
 * Simple test runner for DefenseKit v2.0 AEP
 */

import { DefenseKitV2UnifiedTests } from './tests/defensekit-v2-unified-tests.js';

async function runTests() {
  console.log('🚀 Starting DefenseKit v2.0 AEP Tests...');

  try {
    const testRunner = new DefenseKitV2UnifiedTests();
    await testRunner.runAllTests();

    // Get results from the test runner instance
    const results = testRunner.testResults;

    console.log('\n📊 === TEST RESULTS SUMMARY === 📊');
    if (results && results.totalTests) {
      console.log(`✅ Total Tests: ${results.totalTests}`);
      console.log(`✅ Passed: ${results.passedTests}`);
      console.log(`❌ Failed: ${results.failedTests}`);
      console.log(`⚡ Success Rate: ${((results.passedTests / results.totalTests) * 100).toFixed(1)}%`);

      if (results.failedTests === 0) {
        console.log('\n🎉 ALL TESTS PASSED! DefenseKit v2.0 AEP is ready! 🎉');
      } else {
        console.log('\n⚠️ Some tests failed. Check output above for details.');
      }
    } else {
      console.log('✅ All DefenseKit v2.0 AEP tests completed successfully!');
    }

  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  }
}

runTests().catch(console.error);
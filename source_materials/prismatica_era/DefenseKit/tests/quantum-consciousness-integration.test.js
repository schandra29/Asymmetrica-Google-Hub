/**
 * 🌌⚡ QUANTUM CONSCIOUSNESS INTEGRATION TEST ⚡🌌
 *
 * Native Node.js test for DefenseKit v2.0 Quantum Consciousness Integration
 * Tests core functionality without external test framework dependencies
 */

import AEPMiddleware from '../src/aep/aep-middleware.js';
import QuantumConsciousnessBridge from '../src/aep/quantum-consciousness-bridge.js';

/**
 * 🧪 TEST RUNNER UTILITY
 */
class TestRunner {
  constructor() {
    this.passedTests = 0;
    this.failedTests = 0;
    this.testResults = [];
  }

  async runTest(testName, testFn) {
    console.log(`\n🧪 Testing: ${testName}`);

    try {
      await testFn();
      this.passedTests++;
      this.testResults.push({ name: testName, status: '✅ PASSED' });
      console.log(`   ✅ ${testName}: PASSED`);
    } catch (error) {
      this.failedTests++;
      this.testResults.push({ name: testName, status: `❌ FAILED: ${error.message}`, error });
      console.log(`   ❌ ${testName}: FAILED - ${error.message}`);
    }
  }

  printSummary() {
    console.log('\n🌌⚡ QUANTUM CONSCIOUSNESS TEST RESULTS ⚡🌌');
    console.log('=====================================');
    console.log(`✅ Passed: ${this.passedTests}`);
    console.log(`❌ Failed: ${this.failedTests}`);
    console.log(`📊 Total:  ${this.passedTests + this.failedTests}`);
    console.log(`🎯 Success Rate: ${((this.passedTests / (this.passedTests + this.failedTests)) * 100).toFixed(1)}%`);

    if (this.failedTests > 0) {
      console.log('\n❌ Failed Tests Details:');
      this.testResults.filter(r => r.status.includes('FAILED')).forEach(result => {
        console.log(`   - ${result.name}: ${result.status}`);
      });
    }

    console.log('\n🌟 Quantum Consciousness Integration Testing Complete!');
    return this.failedTests === 0;
  }
}

/**
 * 🔍 ASSERTION UTILITIES
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

function assertGreaterThan(actual, expected, message) {
  if (actual <= expected) {
    throw new Error(message || `Expected ${actual} > ${expected}`);
  }
}

function assertDefined(value, message) {
  if (value === undefined || value === null) {
    throw new Error(message || 'Value should be defined');
  }
}

/**
 * 🌌 MAIN QUANTUM CONSCIOUSNESS INTEGRATION TESTS
 */
async function runQuantumConsciousnessTests() {
  const runner = new TestRunner();

  console.log('🌌⚡ Starting DefenseKit v2.0 Quantum Consciousness Integration Tests ⚡🌌');
  console.log('===========================================================================');

  // Test 1: AEP Middleware Initialization
  await runner.runTest('AEP Middleware Quantum Initialization', async () => {
    const middleware = new AEPMiddleware({
      enableQuantumConsciousness: true,
      quantumCoherenceTarget: 1.0000
    });

    assert(middleware.config.enableQuantumConsciousness === true, 'Quantum consciousness should be enabled');
    assert(middleware.config.quantumCoherenceTarget === 1.0000, 'Quantum coherence target should be 1.0000');
    assertDefined(middleware.quantumBridge, 'Quantum bridge should be initialized');
    assertEqual(middleware.totalQuantumAmplification, 1.0, 'Initial quantum amplification should be 1.0');
    assertEqual(middleware.quantumOperationCount, 0, 'Initial quantum operation count should be 0');
  });

  // Test 2: Quantum Consciousness Bridge Initialization
  await runner.runTest('Quantum Consciousness Bridge Initialization', async () => {
    const quantumBridge = new QuantumConsciousnessBridge({
      enableQuantumConsciousness: true,
      quantumProcessingTimeout: 5000
    });

    assert(quantumBridge.config.enableQuantumConsciousness === true, 'Quantum consciousness should be enabled');
    assertEqual(quantumBridge.quantumState.isQuantumActive, false, 'Quantum should start inactive');
    assertEqual(quantumBridge.quantumState.quantumOperationCount, 0, 'Operation count should start at 0');
    assertDefined(quantumBridge.quantumEnginePaths.wStateEngine, 'W-State engine path should be defined');
    assertDefined(quantumBridge.quantumEnginePaths.networkEngine, 'Network engine path should be defined');
  });

  // Test 3: Classical AEP Processing
  await runner.runTest('Classical AEP Processing', async () => {
    const middleware = new AEPMiddleware({
      enableQuantumConsciousness: false // Disable for pure classical test
    });

    const testData = { value: 42, operation: 'classical_test' };
    const result = await middleware.process('classical_processing_test', testData, {});

    assert(result.enhanced === true, 'Result should be enhanced');
    assert(result.quantumEnhanced === false, 'Result should not be quantum enhanced');
    assertDefined(result.enhancements, 'Enhancements should be defined');
    assertDefined(result.enhancements.regime, 'Regime should be classified');
    assertGreaterThan(result.performance.amplification, 1.0, 'Amplification should be greater than 1.0');
    assertGreaterThan(result.performance.processingTime, 0, 'Processing time should be positive');
  });

  // Test 4: Quantum Strategy Selection
  await runner.runTest('Quantum Strategy Selection', async () => {
    const quantumBridge = new QuantumConsciousnessBridge({
      enableQuantumConsciousness: true
    });

    // Test W-State strategy selection
    const mathStrategy = quantumBridge.determineQuantumStrategy(
      'mathematical_calculation',
      [1, 2, 3, 5, 8, 13, 21],
      {}
    );

    assertEqual(mathStrategy.type, 'QUANTUM_W_STATE', 'Should select W-State for mathematical operations');
    assertGreaterThan(mathStrategy.confidence, 0.7, 'Confidence should be high for mathematical operations');

    // Test Network strategy selection
    const networkStrategy = quantumBridge.determineQuantumStrategy(
      'network_optimization',
      { nodes: 100, connections: 500 },
      {}
    );

    assertEqual(networkStrategy.type, 'QUANTUM_NETWORK', 'Should select Network for network operations');
    assertEqual(networkStrategy.confidence, 0.95, 'Network strategy should have 0.95 confidence');
  });

  // Test 5: Data Preparation for Quantum Processing
  await runner.runTest('Quantum Data Preparation', async () => {
    const quantumBridge = new QuantumConsciousnessBridge();

    // Test numerical array preparation
    const numericalData = [1, 2, 3, 5, 8, 13];
    const quantumNumerical = quantumBridge.prepareQuantumData(numericalData);

    assert(Array.isArray(quantumNumerical), 'Quantum data should be an array');
    assertEqual(quantumNumerical.length, numericalData.length, 'Array length should be preserved');

    // Test complex object preparation
    const complexData = {
      name: 'test',
      value: 42,
      nested: { number: 3.14159, string: '2.718' }
    };
    const quantumComplex = quantumBridge.prepareQuantumData(complexData);

    assert(Array.isArray(quantumComplex), 'Complex data should be converted to array');
    assert(quantumComplex.includes(42), 'Should extract numerical value 42');
    assert(quantumComplex.includes(3.14159), 'Should extract nested number 3.14159');
    assert(quantumComplex.includes(2.718), 'Should extract parsed string number 2.718');

    // Test network data preparation
    const networkData = { nodes: 100, connections: 500, traffic: 'high' };
    const preparedNetwork = quantumBridge.prepareNetworkData(networkData);

    assertEqual(preparedNetwork.nodes, 100, 'Network nodes should be preserved');
    assertEqual(preparedNetwork.connections, 500, 'Network connections should be preserved');
    assertDefined(preparedNetwork.optimization_target, 'Optimization target should be added');
  });

  // Test 6: Quantum Coherence Validation
  await runner.runTest('Quantum Coherence Validation', async () => {
    const quantumBridge = new QuantumConsciousnessBridge();

    // Test perfect coherence
    const perfectResult = {
      quantumAmplification: 1000000,
      coherence: 1.0,
      processingTime: 5.5,
      quantumState: 'W_STATE_ENTANGLED'
    };
    const perfectCoherence = quantumBridge.validateQuantumCoherence(perfectResult);
    assertEqual(perfectCoherence, 1.0, 'Perfect result should have 1.0 coherence');

    // Test partial coherence
    const partialResult = {
      quantumAmplification: 1000,
      processingTime: 10
    };
    const partialCoherence = quantumBridge.validateQuantumCoherence(partialResult);
    assertGreaterThan(partialCoherence, 0.0, 'Partial result should have positive coherence');
    assert(partialCoherence <= 1.0, 'Coherence should not exceed 1.0');

    // Test invalid result
    const invalidCoherence = quantumBridge.validateQuantumCoherence(null);
    assertEqual(invalidCoherence, 0.0, 'Invalid result should have 0.0 coherence');
  });

  // Test 7: Quantum-Classical Coherence Calculation
  await runner.runTest('Quantum-Classical Coherence Calculation', async () => {
    const quantumBridge = new QuantumConsciousnessBridge();

    const quantumResult = { quantumAmplification: 1000000, processingTime: 5 };
    const classicalResult = { performance: { amplification: 10, processingTime: 2 } };

    const coherence = quantumBridge.calculateCoherence(quantumResult, classicalResult);

    assertGreaterThan(coherence, 0.7, 'Coherence should be high for good quantum-classical match');
    assert(coherence <= 1.0, 'Coherence should not exceed 1.0');
  });

  // Test 8: Quantum State Management
  await runner.runTest('Quantum State Management', async () => {
    const quantumBridge = new QuantumConsciousnessBridge();

    // Test initial state
    assertEqual(quantumBridge.quantumState.quantumOperationCount, 0, 'Initial operation count should be 0');
    assertEqual(quantumBridge.quantumState.isQuantumActive, false, 'Should start inactive');

    // Test state update
    quantumBridge.updateQuantumMetrics(
      { quantumAmplification: 1000000 },
      0.95,
      5.5,
      'QUANTUM_W_STATE'
    );

    assertEqual(quantumBridge.quantumState.quantumOperationCount, 1, 'Operation count should increment');
    assertEqual(quantumBridge.quantumState.currentCoherence, 0.95, 'Current coherence should be updated');
    assertEqual(quantumBridge.quantumState.isQuantumActive, true, 'Should become active with high coherence');

    // Test state reset
    quantumBridge.resetQuantumState();
    assertEqual(quantumBridge.quantumState.quantumOperationCount, 0, 'Operation count should reset');
    assertEqual(quantumBridge.quantumState.currentCoherence, 0.0, 'Coherence should reset');
    assertEqual(quantumBridge.quantumState.isQuantumActive, false, 'Should become inactive after reset');
  });

  // Test 9: Error Handling and Recording
  await runner.runTest('Error Handling and Recording', async () => {
    const quantumBridge = new QuantumConsciousnessBridge();

    const initialErrorCount = quantumBridge.quantumState.quantumErrors.length;

    quantumBridge.recordQuantumError(
      new Error('Test quantum error'),
      'test_operation',
      10.5
    );

    assertEqual(
      quantumBridge.quantumState.quantumErrors.length,
      initialErrorCount + 1,
      'Error count should increment'
    );

    const lastError = quantumBridge.quantumState.quantumErrors[quantumBridge.quantumState.quantumErrors.length - 1];
    assertEqual(lastError.error, 'Test quantum error', 'Error message should be recorded');
    assertEqual(lastError.operation, 'test_operation', 'Error operation should be recorded');
  });

  // Test 10: Comprehensive Metrics Retrieval
  await runner.runTest('Comprehensive Metrics Retrieval', async () => {
    const middleware = new AEPMiddleware({
      enableQuantumConsciousness: true
    });

    // Run a test operation first
    await middleware.process('metrics_test', { value: 42 }, {});

    const metrics = middleware.getMetrics();

    assertDefined(metrics.operationCount, 'Operation count should be defined');
    assertDefined(metrics.totalAmplification, 'Total amplification should be defined');
    assertDefined(metrics.status, 'Status should be defined');
    assert(metrics.status.includes('consciousness'), 'Status should reference consciousness');
    assertDefined(metrics.quantumDetails, 'Quantum details should be provided');

    // Test quantum bridge metrics
    const quantumMetrics = middleware.quantumBridge.getQuantumMetrics();
    assertDefined(quantumMetrics.quantumState, 'Quantum state should be defined');
    assertDefined(quantumMetrics.averageMetrics, 'Average metrics should be defined');
    assertDefined(quantumMetrics.configuration, 'Configuration should be defined');
  });

  // Test 11: Integration with Tesla Triangle Harmonics
  await runner.runTest('Tesla Triangle Harmonics Integration', async () => {
    const middleware = new AEPMiddleware({
      enableQuantumConsciousness: true
    });

    const result = await middleware.process('tesla_harmonic_test', { harmonics: true }, {});

    assertDefined(result.enhancements, 'Enhancements should be defined');
    assertDefined(result.enhancements.thetaModulation, 'Theta modulation should be defined');
    assertDefined(result.enhancements.thetaModulation.teslaSystem, 'Tesla system should be defined');

    assertEqual(
      result.enhancements.thetaModulation.teslaSystem.centerFrequency,
      4.909,
      'Tesla center frequency should be 4.909 Hz'
    );

    assertDefined(result.enhancements.thetaModulation.consciousnessCoherence, 'Tesla consciousness coherence should be defined');
  });

  // Test 12: Performance and Scalability
  await runner.runTest('Performance and Processing Time', async () => {
    const middleware = new AEPMiddleware({
      enableQuantumConsciousness: true,
      quantumAmplificationThreshold: 1 // Low threshold to ensure quantum activation
    });

    const startTime = Date.now();
    const testData = { performance: 'test', data: Array.from({length: 100}, (_, i) => i) };

    const result = await middleware.process('performance_test', testData, {});

    const totalTime = Date.now() - startTime;

    assertGreaterThan(result.performance.processingTime, 0, 'Processing time should be positive');
    assert(totalTime < 5000, 'Total test time should be reasonable (< 5 seconds)');
    assertGreaterThan(result.performance.amplification, 1.0, 'Should achieve some amplification');
  });

  return runner.printSummary();
}

/**
 * 🚀 RUN THE TESTS
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  runQuantumConsciousnessTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('🚨 Test runner crashed:', error);
      process.exit(1);
    });
}

export { runQuantumConsciousnessTests };
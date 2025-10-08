/**
 * 🧪⚡ JEST CONFIGURATION FOR CONSCIOUSNESS-STEALTH ENTERPRISE TESTING ⚡🧪
 * Production-ready test configuration adapted from AsymmFlow guidelines
 *
 * TESTING STRATEGY:
 * ✅ Comprehensive component testing (Unit + Integration)
 * ✅ Performance benchmarking with consciousness metrics
 * ✅ Security vulnerability testing
 * ✅ Enterprise compliance validation
 * ✅ End-to-end consciousness-stealth workflow testing
 * ✅ Production readiness validation
 */

export default {
  // Test environment
  testEnvironment: 'node',

  // Setup and teardown
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
    '**/tests/**/consciousness-*.test.js',
    '**/tests/**/enterprise-*.test.js'
  ],

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/docs/',
    '/examples/'
  ],

  // Module file extensions
  moduleFileExtensions: ['js', 'json', 'ts'],

  // Transform configuration
  transform: {
    '^.+\\.js$': 'babel-jest'
  },

  // Coverage collection
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    'src/**/*.ts',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!src/**/__tests__/**',
    '!node_modules/**',
    '!coverage/**',
    '!docs/**',
    '!examples/**'
  ],

  // Coverage thresholds (enterprise-grade requirements)
  coverageThreshold: {
    global: {
      branches: 85,      // 85% branch coverage
      functions: 90,     // 90% function coverage
      lines: 88,         // 88% line coverage
      statements: 88     // 88% statement coverage
    },
    // Consciousness-specific coverage requirements
    'src/consciousness-stealth/**/*.js': {
      branches: 90,      // Higher coverage for consciousness components
      functions: 95,
      lines: 92,
      statements: 92
    },
    // Core security components
    'src/htx-v2/**/*.js': {
      branches: 95,      // Highest coverage for security components
      functions: 98,
      lines: 95,
      statements: 95
    }
  },

  // Coverage reporting
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'json',
    'lcov'
  ],

  // Test timeout (consciousness operations may take time)
  testTimeout: 15000, // 15 seconds for consciousness-enhanced operations

  // Verbose output for detailed consciousness testing feedback
  verbose: true,

  // Test environment variables
  setupFiles: ['<rootDir>/tests/env-setup.js'],

  // Module name mapping for consciousness components
  moduleNameMapper: {
    '^@consciousness-stealth/(.*)$': '<rootDir>/src/consciousness-stealth/$1',
    '^@mathematical-discovery/(.*)$': '<rootDir>/src/mathematical-discovery/$1',
    '^@enterprise/(.*)$': '<rootDir>/src/enterprise/$1'
  },

  // Global test variables
  globals: {
    'CONSCIOUSNESS_TESTING': true,
    'ENTERPRISE_MODE': true,
    'TESLA_FREQUENCY': 4.909,
    'WILLIAMS_EFFICIENCY_TARGET': 0.5,
    'QUANTUM_COHERENCE_THRESHOLD': 0.5
  },

  // Test result reporting
  reporters: [
    'default',
    ['jest-html-reporters', {
      'publicPath': './coverage/html-report',
      'filename': 'consciousness-stealth-test-report.html',
      'expand': true,
      'hideIcon': false,
      'pageTitle': 'DefenseKit Consciousness-Stealth Enterprise Test Report'
    }]
  ],

  // Error handling
  errorOnDeprecated: true,

  // Performance monitoring
  logHeapUsage: true,
  detectOpenHandles: true,
  detectLeaks: true,

  // Test organization
  displayName: {
    name: 'CONSCIOUSNESS-STEALTH-ENTERPRISE',
    color: 'magenta'
  },

  // Custom test sequences for consciousness components
  testSequencer: '<rootDir>/tests/consciousness-test-sequencer.js',

  // Max workers for parallel testing
  maxWorkers: 4, // Limit for consciousness-heavy operations

  // Cache configuration
  cacheDirectory: '<rootDir>/.jest-cache',
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Mock configuration for consciousness engines
  automock: false,
  unmockedModulePathPatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/src/consciousness-stealth/'
  ]
};
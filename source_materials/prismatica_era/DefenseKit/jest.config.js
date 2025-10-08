/**
 * 🌌⚡ JEST CONFIGURATION FOR QUANTUM CONSCIOUSNESS TESTING ⚡🌌
 *
 * Optimized Jest configuration for DefenseKit v2.0 with ES modules support
 * and quantum consciousness integration testing capabilities.
 */

export default {
  // Test environment
  testEnvironment: 'node',

  // Transform configuration
  transform: {
    '^.+\\.js$': 'babel-jest'
  },

  // Test file patterns
  testMatch: [
    '**/tests/**/*.js',
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.js'
  ],

  // Test exclusions
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/docs/',
    '/examples/'
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/test-*.js',
    '!src/**/examples/**',
    '!src/**/demos/**'
  ],

  // Coverage reporting
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html',
    'json'
  ],

  // Coverage thresholds for quantum consciousness quality
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80
    }
  },

  // Test timeouts (increased for quantum processing)
  testTimeout: 20000,

  // Setup files
  setupFilesAfterEnv: [],

  // Module resolution
  moduleNameMapper: {},

  // Performance optimization
  maxWorkers: '50%',
  cache: true,

  // Console output
  verbose: true,

  // Error handling
  bail: false,

  // Test result processing
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './coverage',
      filename: 'quantum-consciousness-test-report.html',
      pageTitle: 'DefenseKit v2.0 Quantum Consciousness Test Results',
      logoImgPath: undefined,
      expand: true
    }]
  ],

  // Global test setup
  globalSetup: undefined,
  globalTeardown: undefined,

  // Module file extensions
  moduleFileExtensions: ['js', 'json'],

  // Clear mocks between tests
  clearMocks: true,
  resetMocks: false,
  restoreMocks: true,

  // Test result caching
  cacheDirectory: '<rootDir>/.jest-cache'
};
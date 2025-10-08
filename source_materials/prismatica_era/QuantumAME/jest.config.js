export default {
  preset: 'node',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.js'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  moduleNameMapping: {},
  transform: {},
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/index.js'
  ],
  setupFilesAfterEnv: [],
  moduleFileExtensions: ['js', 'json', 'node'],
  testTimeout: 30000,
  maxWorkers: 1,
  forceExit: true,
  // Handle ES modules properly
  moduleNameMapping: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
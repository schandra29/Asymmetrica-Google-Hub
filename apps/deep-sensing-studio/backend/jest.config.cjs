/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: ['src/services/**/*.ts', 'src/utils/**/*.ts'],

  // A map from regular expressions to module names or to arrays of module names that allow to stub out resources
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@api/(.*)$': '<rootDir>/src/api/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@middleware/(.*)$': '<rootDir>/src/middleware/$1',
    // This is required for ts-jest with ESM support
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  // A list of paths to directories that Jest should use to search for files in
  roots: ['<rootDir>'],

  // The glob patterns Jest uses to detect test files
  testMatch: [
    '**/tests/**/*.test.ts'
  ],

  // An array of file extensions your modules use
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],

  // Tell Jest to handle .ts files as ESM
  extensionsToTreatAsEsm: ['.ts'],

  // A map from regular expressions to paths to transformers
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
};
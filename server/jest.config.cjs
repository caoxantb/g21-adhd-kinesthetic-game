module.exports = {
    testEnvironment: 'node',
    transform: {
      '^.+\\.js$': ['babel-jest', { configFile: './babel.config.cjs' }]
    },
    testMatch: ['**/__tests__/**/*.test.js'],
    setupFilesAfterEnv: ['./__tests__/config/setupTestDb.js'],
    verbose: true,
    collectCoverage: true,
    clearMocks: true,
    transformIgnorePatterns: [
      'node_modules/(?!mongoose/.*)'
    ]
  };
// jest.config.js (root level)
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    roots: ['<rootDir>/packages'],
    testMatch: [
      '**/__tests__/**/*.{js,jsx,ts,tsx}',
      '**/*.(test|spec).{js,jsx,ts,tsx}'
    ],
    transform: {
      '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    collectCoverageFrom: [
      'packages/*/src/**/*.{ts,tsx}',
      '!packages/*/src/**/*.d.ts',
      '!packages/*/src/**/index.ts',
    ],
    moduleNameMapper: {
      '^@voice-ai-workforce/(.*)$': '<rootDir>/packages/$1/src',
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    moduleFileExtensions: [
      'ts',
      'tsx',
      'js',
      'jsx',
      'json',
      'node'
    ],
    transformIgnorePatterns: [
      'node_modules/(?!(.*\\.mjs$))'
    ],
  };
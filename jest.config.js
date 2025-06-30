// jest.config.js (root level)
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testMatch: ['<rootDir>/packages/**/__tests__/**/*.test.{ts,tsx}'],
    moduleNameMapper: {
      '^@voice-ai-workforce/core$': '<rootDir>/packages/core/src',
      '^@voice-ai-workforce/react$': '<rootDir>/packages/react/src',
      '^@voice-ai-workforce/types$': '<rootDir>/packages/types/src'
    },
    transform: {
      '^.+\\.(ts|tsx)$': ['ts-jest', {
        useESM: false,
        tsconfig: {
          target: 'ES2020',
          module: 'CommonJS',
          jsx: 'react-jsx',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          skipLibCheck: true
        }
      }]
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    collectCoverageFrom: [
      'packages/*/src/**/*.{ts,tsx}',
      '!packages/*/src/**/*.d.ts',
      '!packages/*/src/**/__tests__/**/*'
    ],
    testTimeout: 10000
  };
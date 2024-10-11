export default {
  preset: 'ts-jest/presets/default-esm',
  // transform: {
  //   '^.+\\.ts$': 'ts-jest'
  // },
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
  },
  setupFiles: ['<rootDir>/tests/scripts/jest.setup.ts'],
};

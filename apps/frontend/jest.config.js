/**
 * Jest config for the frontend's pure logic (tree composition, validation, layout).
 * Uses ts-jest in transpile-only mode (isolatedModules) so tests don't depend on the
 * full Expo/React Native runtime or on the project's pre-existing type-check noise.
 */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          isolatedModules: true,
          jsx: 'react',
          esModuleInterop: true,
          skipLibCheck: true,
        },
      },
    ],
  },
  moduleNameMapper: {
    // Native Skia is not needed by the layout math; stub it so the module imports.
    '^@shopify/react-native-skia$': '<rootDir>/jest/react-native-skia.stub.js',
    // Mirror the tsconfig "@/..." path alias (baseUrl = apps/frontend).
    '^@/(.*)$': '<rootDir>/$1',
  },
}

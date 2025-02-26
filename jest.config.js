/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ['@swc/jest'],
  },
  modulePaths: ['src'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  preset: "ts-jest"
};

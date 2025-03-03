/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ['@swc/jest'],
  },
  modulePaths: ['src'],
  testPathIgnorePatterns: ["./__tests__/data/"],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  preset: "ts-jest"
};

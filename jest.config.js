/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  verbose: true,
  moduleFileExtensions: ["ts", "tsx", "js"],
  testMatch: ["**/*.test.ts"],
  globalSetup: "<rootDir>/jest.setup.ts",
  globalTeardown: "<rootDir>/jest.teardown.ts",
  setupFiles: ["dotenv/config"],
  setupFilesAfterEnv: ['<rootDir>/tests/setupTestDB.ts'],
  globals: {
    "process.env.NODE_ENV": "test",
  },
  // setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
};

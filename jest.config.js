module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*.test.js"],
  collectCoverageFrom: [
    "controllers/**/*.js",
    "middlewares/**/*.js",
    "models/**/*.js",
    "routes/**/*.js",
  ],
  testTimeout: 30000,
};

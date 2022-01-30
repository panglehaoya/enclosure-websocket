module.exports = {
  testEnvironment: "jsdom",
  moduleFileExtensions: ["js", "ts"],
  transform: { "\\.(js|jsx|ts|tsx)$": "babel-jest" },
  transformIgnorePatterns: ["/node_modules/"],
  testMatch: ["**/tests/unit/**/*.spec.[jt]s?(x)", "**/__tests__/*.[jt]s?(x)"],
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.{js,jsx,ts,tsx,vue}", "!**/demo/**", "!**/test/**"],
  coverageReporters: ["html", "lcov", "text-summary"],
  coverageDirectory: "./test/coverage",
};

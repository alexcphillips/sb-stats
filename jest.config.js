module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ["./server/**/*.ts"],
  testEnvironment: "node",
  coverageDirectory: "./coverage/server",
  coverageThreshold: { global: { branches: 80, functions: 80, lines: 80, statements: 80 } },
  coverageReporters: ["html", "text-summary"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "./ui"],
};

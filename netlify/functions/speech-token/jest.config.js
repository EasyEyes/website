const path = require("path");

const resolveTsJest = () => {
  try {
    return require.resolve("ts-jest");
  } catch {
    return require.resolve("ts-jest", {
      paths: [path.resolve(__dirname, "../../../docs/experiment/threshold")],
    });
  }
};

module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/__tests__"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": [resolveTsJest(), { isolatedModules: true }],
  },
};

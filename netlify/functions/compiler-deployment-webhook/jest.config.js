module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/__tests__"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": [
      "babel-jest",
      {
        presets: ["@babel/preset-env", "@babel/preset-typescript"],
      },
    ],
  },
};

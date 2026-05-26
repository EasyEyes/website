module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/netlify"],
  testMatch: ["**/__tests__/**/*.test.js"],
  transform: {
    "^.+\\.(js|ts)$": "babel-jest",
  },
};

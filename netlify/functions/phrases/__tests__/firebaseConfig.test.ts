import { getFirebaseDatabaseUrl } from "../firebaseConfig";

const PRODUCTION_URL = "https://easyeyes-compiler-default-rtdb.firebaseio.com";
const STAGING_URL =
  "https://easyeyes-compiler-staging-default-rtdb.firebaseio.com/";

describe("getFirebaseDatabaseUrl", () => {
  test("returns a normalized production URL supplied by the deploy context", () => {
    expect(
      getFirebaseDatabaseUrl({
        FIREBASE_DATABASE_URL: `${PRODUCTION_URL}/`,
      }),
    ).toBe(PRODUCTION_URL);
  });

  test("returns a normalized staging URL supplied by the deploy context", () => {
    expect(
      getFirebaseDatabaseUrl({
        FIREBASE_DATABASE_URL: STAGING_URL,
      }),
    ).toBe(STAGING_URL.slice(0, -1));
  });

  test("rejects a missing database URL", () => {
    expect(() => getFirebaseDatabaseUrl({})).toThrow(
      "FIREBASE_DATABASE_URL is required",
    );
  });

  test.each([
    "http://easyeyes-compiler-staging-default-rtdb.firebaseio.com",
    "https://example.com",
    "https://easyeyes-compiler-staging-default-rtdb.firebaseio.com/path",
    "https://easyeyes-compiler-staging-default-rtdb.firebaseio.com?x=1",
  ])("rejects an unsafe database URL: %s", (databaseUrl) => {
    expect(() =>
      getFirebaseDatabaseUrl({
        FIREBASE_DATABASE_URL: databaseUrl,
      }),
    ).toThrow("FIREBASE_DATABASE_URL must be a valid HTTPS Firebase RTDB root");
  });
});

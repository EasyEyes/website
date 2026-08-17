import { handler } from "../index";
import { ROLE_ENV_VAR } from "../mediaRoles";

const ORIGIN = "https://easyeyes.app";

const post = (
  headers: Record<string, string | undefined> = {},
  body: string | null = null,
) => handler({ httpMethod: "POST", headers: { origin: ORIGIN, ...headers }, body });

const mockPavloviaUser = (username: string, ok = true) => {
  (global as any).fetch = jest.fn().mockResolvedValue({
    ok,
    json: async () => ({ username }),
  });
};

beforeEach(() => {
  process.env[ROLE_ENV_VAR] = "denis:admin,yonathan";
  jest.restoreAllMocks();
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  delete process.env[ROLE_ENV_VAR];
});

describe("media-auth handler", () => {
  it("reports the role and permissions of a listed account", async () => {
    mockPavloviaUser("denis");
    const response = await post({ authorization: "Bearer good-token" });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      username: "denis",
      role: "admin",
      permissions: { upload: true, manage: true },
    });
  });

  it("reports an unlisted account as a viewer, since browsing is open to all", async () => {
    mockPavloviaUser("stranger");
    const response = await post({ authorization: "Bearer good-token" });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).role).toBe("viewer");
    expect(JSON.parse(response.body).permissions.upload).toBe(false);
  });

  it("identifies the caller from Pavlovia, not from anything they send", async () => {
    mockPavloviaUser("stranger");
    const response = await post(
      { authorization: "Bearer good-token" },
      JSON.stringify({ username: "denis", role: "admin" }),
    );

    expect(JSON.parse(response.body).username).toBe("stranger");
    expect(JSON.parse(response.body).permissions.upload).toBe(false);
  });

  it("rejects a request with no token", async () => {
    const response = await post();

    expect(response.statusCode).toBe(401);
    expect(JSON.parse(response.body).reason).toBe("missing-token");
  });

  it("rejects a token Pavlovia does not recognise", async () => {
    mockPavloviaUser("denis", false);
    const response = await post({ authorization: "Bearer stale-token" });

    expect(response.statusCode).toBe(401);
    expect(JSON.parse(response.body).reason).toBe("invalid-session");
  });

  it("never returns the list of other privileged accounts", async () => {
    mockPavloviaUser("stranger");
    const response = await post({ authorization: "Bearer good-token" });

    expect(response.body).not.toContain("yonathan");
    expect(response.body).not.toContain("denis");
  });

  it("reports a Pavlovia outage as retryable rather than as a refusal", async () => {
    (global as any).fetch = jest.fn().mockRejectedValue(new Error("network"));
    const response = await post({ authorization: "Bearer good-token" });

    expect(response.statusCode).toBe(503);
    expect(JSON.parse(response.body).reason).toBe("unavailable");
  });

  it("refuses methods other than POST", async () => {
    const response = await handler({
      httpMethod: "GET",
      headers: { origin: ORIGIN },
      body: null,
    });

    expect(response.statusCode).toBe(405);
  });

  it("answers the CORS preflight without touching Pavlovia", async () => {
    const response = await handler({
      httpMethod: "OPTIONS",
      headers: { origin: ORIGIN },
      body: null,
    });

    expect(response.statusCode).toBe(204);
    expect(response.headers?.["Access-Control-Allow-Origin"]).toBe(ORIGIN);
  });

  it("is never cached, since the answer depends on the caller", async () => {
    mockPavloviaUser("denis");
    const response = await post({ authorization: "Bearer good-token" });

    expect(response.headers?.["Cache-Control"]).toBe("no-store");
  });
});

import { handler } from "../index";
import { ROLE_ENV_VAR } from "../../media-auth/mediaRoles";
import {
  createResumableUpload,
  listMedia,
  objectExists,
} from "../../shared/mediaStorage";
import { resolvePavloviaUsername } from "../../shared/pavlovia";

jest.mock("../../shared/mediaStorage", () => ({
  ...jest.requireActual("../../shared/mediaStorage"),
  listMedia: jest.fn(),
  objectExists: jest.fn(),
  createResumableUpload: jest.fn(),
}));

jest.mock("../../shared/pavlovia", () => ({
  ...jest.requireActual("../../shared/pavlovia"),
  resolvePavloviaUsername: jest.fn(),
}));

const asMock = <T extends (...args: never[]) => unknown>(fn: T) =>
  fn as unknown as jest.Mock;

const ORIGIN = "https://easyeyes.app";
const SESSION_URL = "https://storage.googleapis.com/upload/session/abc";

const post = (body: unknown, headers: Record<string, string> = {}) =>
  handler({
    httpMethod: "POST",
    headers: { origin: ORIGIN, authorization: "Bearer token", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

const validUpload = {
  name: "Beep Sound.MP3",
  contentType: "audio/mpeg",
  size: 1024,
};

beforeEach(() => {
  process.env[ROLE_ENV_VAR] = "yonathan:uploader";
  // Storage itself is mocked, but the function checks that credentials exist
  // before it will reach for storage at all.
  process.env.FIREBASE_MEDIA_CLIENT_EMAIL = "media@easyeyes-media.iam.gserviceaccount.com";
  process.env.FIREBASE_MEDIA_PRIVATE_KEY = "test-key";
  jest.clearAllMocks();
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});

  asMock(resolvePavloviaUsername).mockResolvedValue("yonathan");
  asMock(objectExists).mockResolvedValue(false);
  asMock(createResumableUpload).mockResolvedValue(SESSION_URL);
});

afterEach(() => {
  delete process.env[ROLE_ENV_VAR];
  delete process.env.FIREBASE_MEDIA_CLIENT_EMAIL;
  delete process.env.FIREBASE_MEDIA_PRIVATE_KEY;
});

describe("before the bucket is set up", () => {
  beforeEach(() => {
    delete process.env.FIREBASE_MEDIA_CLIENT_EMAIL;
    delete process.env.FIREBASE_MEDIA_PRIVATE_KEY;
  });

  it("says setup is outstanding rather than reporting an outage", async () => {
    const response = await handler({
      httpMethod: "GET",
      headers: { origin: ORIGIN },
      body: null,
    });

    expect(response.statusCode).toBe(503);
    expect(JSON.parse(response.body).reason).toBe("not-configured");
    expect(asMock(listMedia)).not.toHaveBeenCalled();
  });

  it("grants no upload, so nothing can be written before then", async () => {
    const response = await post(validUpload);

    expect(JSON.parse(response.body).reason).toBe("not-configured");
    expect(asMock(createResumableUpload)).not.toHaveBeenCalled();
  });

  it("still answers preflight, so the browser sees the message", async () => {
    const response = await handler({
      httpMethod: "OPTIONS",
      headers: { origin: ORIGIN },
      body: null,
    });

    expect(response.statusCode).toBe(204);
  });
});

describe("listing", () => {
  it("is open to anyone, with no token required", async () => {
    asMock(listMedia).mockResolvedValue([
      {
        path: "beep.mp3",
        name: "Beep Sound.MP3",
        size: 1024,
        type: "audio/mpeg",
        addedAt: 1_700_000_000_000,
        uploadedBy: "yonathan",
      },
    ]);

    const response = await handler({
      httpMethod: "GET",
      headers: { origin: ORIGIN },
      body: null,
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).files[0]).toMatchObject({
      path: "beep.mp3",
      url: "https://easyeyes.app/media/beep.mp3",
    });
  });
});

describe("granting an upload", () => {
  it("returns a session URL for an authorized account", async () => {
    const response = await post(validUpload);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      uploadUrl: SESSION_URL,
      path: "beep-sound.mp3",
      url: "https://easyeyes.app/media/beep-sound.mp3",
    });
  });

  it("names the file from its own sanitising, not from what the caller sends", async () => {
    await post({ ...validUpload, name: "../../etc/Passwd.MP3" });

    expect(asMock(createResumableUpload)).toHaveBeenCalledWith(
      expect.objectContaining({ path: "etc-passwd.mp3" }),
    );
  });

  it("records the uploader resolved from Pavlovia", async () => {
    await post(validUpload);

    expect(asMock(createResumableUpload)).toHaveBeenCalledWith(
      expect.objectContaining({ uploadedBy: "yonathan" }),
    );
  });

  it("refuses a caller with no token", async () => {
    const response = await handler({
      httpMethod: "POST",
      headers: { origin: ORIGIN },
      body: JSON.stringify(validUpload),
    });

    expect(response.statusCode).toBe(401);
    expect(asMock(createResumableUpload)).not.toHaveBeenCalled();
  });

  it("refuses an account that media-auth would call a viewer", async () => {
    asMock(resolvePavloviaUsername).mockResolvedValue("stranger");
    const response = await post(validUpload);

    expect(response.statusCode).toBe(403);
    expect(JSON.parse(response.body).reason).toBe("not-allowed");
    expect(asMock(createResumableUpload)).not.toHaveBeenCalled();
  });

  it("refuses a file type the library does not hold", async () => {
    const response = await post({
      ...validUpload,
      name: "notes.pdf",
      contentType: "application/pdf",
    });

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).reason).toBe("unsupported-type");
  });

  it("refuses a file beyond the size limit", async () => {
    const response = await post({
      ...validUpload,
      size: 513 * 1024 * 1024,
    });

    expect(response.statusCode).toBe(413);
  });

  it("refuses a malformed request", async () => {
    expect((await post("not json")).statusCode).toBe(400);
    expect((await post({ name: "a.mp3" })).statusCode).toBe(400);
  });

  it("never replaces a file that already exists", async () => {
    asMock(objectExists).mockResolvedValue(true);
    const response = await post(validUpload);

    expect(response.statusCode).toBe(409);
    expect(JSON.parse(response.body).reason).toBe("name-taken");
    expect(asMock(createResumableUpload)).not.toHaveBeenCalled();
  });

  it("reports a storage outage as retryable rather than as a refusal", async () => {
    asMock(objectExists).mockRejectedValue(new Error("network"));
    const response = await post(validUpload);

    expect(response.statusCode).toBe(503);
    expect(JSON.parse(response.body).reason).toBe("unavailable");
  });
});

describe("preflight", () => {
  it("is answered without touching storage or Pavlovia", async () => {
    const response = await handler({
      httpMethod: "OPTIONS",
      headers: { origin: ORIGIN },
      body: null,
    });

    expect(response.statusCode).toBe(204);
    expect(response.headers?.["Access-Control-Allow-Origin"]).toBe(ORIGIN);
    expect(asMock(resolvePavloviaUsername)).not.toHaveBeenCalled();
  });
});

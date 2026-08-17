import { getAccessToken } from "./googleAuth";

export const MEDIA_BUCKET =
  process.env.MEDIA_BUCKET ?? "easyeyes-media.firebasestorage.app";

/**
 * Media is addressed through an EasyEyes-owned path rather than a raw Google
 * download URL, so that the Cross-Origin-Resource-Policy header required by
 * remote-calibrator, speaker-calibration, and threshold can be set at one edge,
 * and so the backing bucket can change without breaking links already pasted
 * into international phrases.
 */
export const MEDIA_BASE_URL =
  process.env.MEDIA_BASE_URL ?? "https://easyeyes.app/media";

export const mediaUrlForPath = (path: string): string =>
  `${MEDIA_BASE_URL}/${path.replace(/^\/+/, "")}`;

const STORAGE_SCOPE = "https://www.googleapis.com/auth/devstorage.read_write";
const STORAGE_API = "https://storage.googleapis.com/storage/v1";
const STORAGE_UPLOAD_API = "https://storage.googleapis.com/upload/storage/v1";

/** Media is immutable once uploaded, so it can be cached hard and forever. */
const MEDIA_CACHE_CONTROL = "public, max-age=31536000, immutable";

export type MediaRecord = {
  path: string;
  name: string;
  size: number;
  type: string;
  addedAt: number;
  uploadedBy: string;
};

const slug = (value: string): string =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * Mirrors the browser's own sanitising, because the browser's answer is a
 * convenience and this one is the rule: the name that reaches the bucket is
 * always the one derived here.
 */
export function sanitizeMediaFileName(fileName: string): string {
  const raw = String(fileName ?? "").trim();
  const lastDot = raw.lastIndexOf(".");
  const hasExtension = lastDot > 0;

  const stem = slug(hasExtension ? raw.slice(0, lastDot) : raw) || "file";
  const extension = hasExtension ? slug(raw.slice(lastDot + 1)) : "";

  return extension ? `${stem}.${extension}` : stem;
}

const objectUrl = (path: string): string =>
  `${STORAGE_API}/b/${MEDIA_BUCKET}/o/${encodeURIComponent(path)}`;

async function authorized(): Promise<Record<string, string>> {
  return { Authorization: `Bearer ${await getAccessToken(STORAGE_SCOPE)}` };
}

export async function objectExists(path: string): Promise<boolean> {
  const response = await fetch(`${objectUrl(path)}?fields=name`, {
    headers: await authorized(),
  });

  if (response.status === 404) return false;
  if (!response.ok)
    throw new Error(`Storage lookup for ${path} → ${response.status}`);

  return true;
}

/**
 * Opens a resumable upload session and hands back the URL the browser should
 * send the bytes to.
 *
 * The bytes deliberately do not pass through this function: Netlify caps a
 * request body at roughly 6 MB, which any video would exceed, and resumable
 * sessions survive the flaky connections that large uploads invite.
 */
export async function createResumableUpload(options: {
  path: string;
  contentType: string;
  size: number;
  originalName: string;
  uploadedBy: string;
}): Promise<string> {
  const { path, contentType, size, originalName, uploadedBy } = options;

  const response = await fetch(
    `${STORAGE_UPLOAD_API}/b/${MEDIA_BUCKET}/o?uploadType=resumable&name=${encodeURIComponent(
      path,
    )}`,
    {
      method: "POST",
      headers: {
        ...(await authorized()),
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": contentType,
        "X-Upload-Content-Length": String(size),
      },
      body: JSON.stringify({
        contentType,
        cacheControl: MEDIA_CACHE_CONTROL,
        metadata: { uploadedBy, originalName },
      }),
    },
  );

  if (!response.ok)
    throw new Error(
      `Could not start upload for ${path} → ${response.status} ${await response.text()}`,
    );

  const session = response.headers.get("location");
  if (!session)
    throw new Error(`Upload session for ${path} came back without a location`);

  return session;
}

type StorageObject = {
  name?: unknown;
  size?: unknown;
  contentType?: unknown;
  timeCreated?: unknown;
  metadata?: { uploadedBy?: unknown; originalName?: unknown };
};

const toRecord = (item: StorageObject): MediaRecord | null => {
  if (typeof item.name !== "string") return null;

  return {
    path: item.name,
    name:
      typeof item.metadata?.originalName === "string"
        ? item.metadata.originalName
        : item.name,
    size: Number(item.size ?? 0),
    type: typeof item.contentType === "string" ? item.contentType : "",
    addedAt:
      typeof item.timeCreated === "string"
        ? Date.parse(item.timeCreated)
        : Date.now(),
    uploadedBy:
      typeof item.metadata?.uploadedBy === "string"
        ? item.metadata.uploadedBy
        : "",
  };
};

/**
 * The bucket is its own index: every column the library table shows is already
 * object metadata, so there is no second store to keep in step with it.
 */
export async function listMedia(): Promise<MediaRecord[]> {
  const fields =
    "items(name,size,contentType,timeCreated,metadata),nextPageToken";

  const records: MediaRecord[] = [];
  let pageToken: string | undefined;

  do {
    const query = new URLSearchParams({ fields, maxResults: "1000" });
    if (pageToken) query.set("pageToken", pageToken);

    const response = await fetch(
      `${STORAGE_API}/b/${MEDIA_BUCKET}/o?${query}`,
      { headers: await authorized() },
    );

    if (!response.ok)
      throw new Error(`Storage listing → ${response.status}`);

    const body = (await response.json()) as {
      items?: StorageObject[];
      nextPageToken?: string;
    };

    for (const item of body.items ?? []) {
      const record = toRecord(item);
      if (record) records.push(record);
    }

    pageToken = body.nextPageToken;
  } while (pageToken);

  return records.sort((a, b) => b.addedAt - a.addedAt);
}

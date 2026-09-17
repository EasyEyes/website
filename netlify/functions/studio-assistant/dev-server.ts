/**
 * Minimal local host for the studio-assistant function — no Netlify CLI.
 *
 *   cd website/netlify/functions/studio-assistant && npm run dev
 *
 * Listens on :8888, which is where the Studio looks for functions when the
 * page is served from localhost (threshold/components/easyeyesBaseUrl.ts
 * probes that port and falls back to easyeyes.app otherwise). Once anything
 * answers there, the page sends *every* function call to it — phrases,
 * glossary, media-auth… — so this server handles the assistant itself and
 * forwards everything else to production, exactly what the page would have
 * reached with no local server at all.
 *
 * Reads ANTHROPIC_API_KEY / STUDIO_ASSISTANT_MODEL from website/.env, then
 * hands assistant requests to the same `handler` Netlify would call. Run the
 * compiler's webpack dev server separately (docs/experiment: `npm start`).
 */
import { createServer, type IncomingMessage, type ServerResponse } from "http";
import { readFileSync } from "fs";
import { resolve } from "path";
import { handler, config } from "./index";

const PORT = Number(process.env.PORT) || 8888;
const UPSTREAM = process.env.UPSTREAM || "https://easyeyes.app";
const ENV_FILE = resolve(__dirname, "../../../.env");

// Hop-by-hop / origin-specific headers we must not copy either way.
const SKIP_REQUEST_HEADERS = new Set(["host", "connection", "content-length"]);
const SKIP_RESPONSE_HEADERS = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
]);

/** Everything but the assistant goes to production, response passed back as is. */
const forward = async (
  req: IncomingMessage,
  res: ServerResponse,
  url: URL,
  body: Buffer | null,
) => {
  const target = `${UPSTREAM}${url.pathname}${url.search}`;
  const headers: Record<string, string> = {};
  for (const [k, v] of Object.entries(req.headers)) {
    if (SKIP_REQUEST_HEADERS.has(k) || v === undefined) continue;
    headers[k] = Array.isArray(v) ? v.join(", ") : v;
  }
  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers,
      body:
        body && req.method !== "GET" && req.method !== "HEAD"
          ? new Uint8Array(body)
          : undefined,
      redirect: "manual",
    });
    const out: Record<string, string> = {};
    upstream.headers.forEach((v, k) => {
      if (!SKIP_RESPONSE_HEADERS.has(k)) out[k] = v;
    });
    const data = Buffer.from(await upstream.arrayBuffer());
    console.log(
      `${req.method} ${url.pathname} → ${upstream.status} (forwarded to ${UPSTREAM})`,
    );
    res.writeHead(upstream.status, out).end(data);
  } catch (e) {
    console.error(`forward ${target} failed:`, e);
    res.writeHead(502).end("upstream unreachable");
  }
};

// Tiny .env loader (KEY=value lines; # comments; existing env wins).
try {
  for (const line of readFileSync(ENV_FILE, "utf8").split("\n")) {
    const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
    if (!m || line.trim().startsWith("#")) continue;
    const value = m[2].replace(/^(['"])(.*)\1$/, "$2");
    if (process.env[m[1]] === undefined) process.env[m[1]] = value;
  }
} catch {
  console.warn(`No ${ENV_FILE}; relying on the shell environment.`);
}

if (!process.env.ANTHROPIC_API_KEY)
  console.warn(
    "ANTHROPIC_API_KEY is not set — the assistant will answer 503 until it is.",
  );

const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);

  const chunks: Buffer[] = [];
  req.on("data", (c: Buffer) => chunks.push(c));
  req.on("end", async () => {
    const body = chunks.length ? Buffer.concat(chunks) : null;

    // The Studio's "is anything on :8888?" probe.
    if (
      url.pathname === "/" &&
      (req.method === "HEAD" || req.method === "GET")
    ) {
      res.writeHead(200).end();
      return;
    }
    if (url.pathname !== config.path) {
      await forward(req, res, url, body);
      return;
    }

    const headers: Record<string, string | undefined> = {};
    for (const [k, v] of Object.entries(req.headers))
      headers[k] = Array.isArray(v) ? v.join(", ") : v;
    headers["client-ip"] = req.socket.remoteAddress ?? "local";

    const started = Date.now();
    const text = body ? body.toString("utf8") : null;
    const out = await handler({
      httpMethod: req.method ?? "GET",
      headers,
      body: text,
    });
    // A "fast" round is the Studio's hedge beside a slow (thinking) one.
    const fast = text ? /"mode"\s*:\s*"fast"/.test(text) : false;
    console.log(
      `${req.method} ${url.pathname}${fast ? " [fast]" : ""} → ${
        out.statusCode
      } (${Date.now() - started} ms)${usageSummary(out.body)}`,
    );
    res.writeHead(out.statusCode, out.headers ?? {}).end(out.body);
  });
});

/** Where the time went: tokens in (cached / fresh), thought + written out. */
const usageSummary = (body: string): string => {
  try {
    const parsed = JSON.parse(body) as {
      usage?: Record<string, number>;
      stop_reason?: string;
      content?: { type: string }[];
    };
    const u = parsed.usage;
    if (!u) return "";
    const kinds = (parsed.content ?? []).map((b) => b.type).join("+");
    return ` — in ${u.input_tokens ?? 0} (+${
      u.cache_read_input_tokens ?? 0
    } cached, ${u.cache_creation_input_tokens ?? 0} written), out ${
      u.output_tokens ?? 0
    }; ${kinds}; stop ${parsed.stop_reason ?? "?"}`;
  } catch {
    return "";
  }
};

server.listen(PORT, () => {
  console.log(
    `studio-assistant listening on http://localhost:${PORT}${config.path}`,
  );
  console.log(
    `model: ${process.env.STUDIO_ASSISTANT_MODEL || "(default)"}; effort: ${
      process.env.STUDIO_ASSISTANT_EFFORT || "(default: medium)"
    }; thinking: ${
      process.env.STUDIO_ASSISTANT_THINKING || "(default: adaptive)"
    }; key: ${process.env.ANTHROPIC_API_KEY ? "set" : "MISSING"}`,
  );
  console.log(
    `other functions (phrases, glossary, …) forwarded to ${UPSTREAM}`,
  );
});

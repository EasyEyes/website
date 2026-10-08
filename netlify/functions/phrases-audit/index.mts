import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { createPhrasesAuditHandler } from "./handler.mjs";

const collectionName = "internationalPhraseAuditRuns";
const env = (name: string) => Netlify.env.get(name);

function firestoreStore() {
  const serviceAccountJson = env("FIREBASE_SERVICE_ACCOUNT_JSON");
  if (!serviceAccountJson)
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not configured");
  const app =
    getApps().find((candidate) => candidate.name === "phrases-audit") ??
    initializeApp(
      { credential: cert(JSON.parse(serviceAccountJson)) },
      "phrases-audit",
    );
  const collection = getFirestore(app).collection(collectionName);
  return {
    create: (id: string, data: object) => collection.doc(id).create(data),
    update: (id: string, data: object) => collection.doc(id).update(data),
    get: async (id: string) => (await collection.doc(id).get()).data() ?? null,
    saveChunks: async (id: string, chunks: string[]) => {
      for (let index = 0; index < chunks.length; index++) {
        await collection
          .doc(id)
          .collection("reportChunks")
          .doc(String(index).padStart(5, "0"))
          .set({ gzipBase64: chunks[index] });
      }
    },
  };
}

async function dispatch(id: string) {
  const token = env("GITHUB_ACTIONS_DISPATCH_TOKEN");
  if (!token)
    throw new Error("GITHUB_ACTIONS_DISPATCH_TOKEN is not configured");
  const response = await fetch(
    "https://api.github.com/repos/EasyEyes/website/actions/workflows/phrases-audit.yml/dispatches",
    {
      method: "POST",
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
        "x-github-api-version": "2022-11-28",
      },
      body: JSON.stringify({ ref: "main", inputs: { run_id: id } }),
    },
  );
  if (!response.ok)
    throw new Error(`GitHub workflow dispatch returned ${response.status}`);
}

export default async function handler(request: Request) {
  try {
    return await createPhrasesAuditHandler({
      store: firestoreStore(),
      dispatch,
      phrasesSecret: env("PHRASES_SECRET"),
      reportSecret: env("CATALOG_USAGE_REPORT_SECRET"),
    })(request);
  } catch (error) {
    console.error("[phrases-audit] request failed", error);
    return new Response(
      JSON.stringify({ error: "Audit service unavailable" }),
      {
        status: 503,
        headers: {
          "content-type": "application/json",
          "cache-control": "no-store",
        },
      },
    );
  }
}

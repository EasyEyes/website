import { randomUUID } from "node:crypto";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { createGlossaryAuditHandler } from "./handler.mjs";

const collectionName = "glossaryAuditRuns";
const env = (name: string) => Netlify.env.get(name);

function firestoreStore() {
  const serviceAccountJson = env("FIREBASE_SERVICE_ACCOUNT_JSON");
  if (!serviceAccountJson)
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not configured");
  const app =
    getApps().find((candidate) => candidate.name === "glossary-audit") ??
    initializeApp(
      { credential: cert(JSON.parse(serviceAccountJson)) },
      "glossary-audit",
    );
  const collection = getFirestore(app).collection(collectionName);
  const activeAudit = getFirestore(app)
    .collection("glossaryAuditState")
    .doc("active");
  return {
    createQueued: (id: string, requestedAt: string) =>
      getFirestore(app).runTransaction(async (transaction) => {
        const active = await transaction.get(activeAudit);
        const activeId = active.data()?.runId;
        if (activeId) {
          const run = await transaction.get(collection.doc(activeId));
          const status = run.data()?.status;
          if (status === "queued" || status === "running")
            return { id: activeId, status };
        }
        transaction.create(collection.doc(id), {
          status: "queued",
          requestedAt,
        });
        transaction.set(activeAudit, { runId: id });
        return null;
      }),
    update: (id: string, data: object) => collection.doc(id).update(data),
    get: async (id: string) => (await collection.doc(id).get()).data() ?? null,
    listRecent: async (limit: number) => {
      const snapshot = await collection
        .orderBy("requestedAt", "desc")
        .limit(limit)
        .select(
          "status",
          "requestedAt",
          "completedAt",
          "reportGeneratedAt",
          "error",
        )
        .get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    },
  };
}

async function dispatch(id: string) {
  const token = env("GITHUB_ACTIONS_DISPATCH_TOKEN");
  if (!token)
    throw new Error("GITHUB_ACTIONS_DISPATCH_TOKEN is not configured");
  const response = await fetch(
    "https://api.github.com/repos/EasyEyes/website/actions/workflows/glossary-audit.yml/dispatches",
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
  const requestId = randomUUID();
  const action = new URL(request.url).searchParams.get("action");
  let stage = "initialize";
  console.info(
    JSON.stringify({
      event: "glossary_audit_request_started",
      requestId,
      method: request.method,
      action,
    }),
  );
  try {
    const auditHandler = createGlossaryAuditHandler({
      store: firestoreStore(),
      dispatch,
      glossarySecret: env("GLOSSARY_SECRET"),
      reportSecret: env("CATALOG_USAGE_REPORT_SECRET"),
    });
    stage = "handle";
    const response = await auditHandler(request);
    response.headers.set("x-audit-diagnostic-id", requestId);
    console.info(
      JSON.stringify({
        event: "glossary_audit_request_completed",
        requestId,
        action,
        status: response.status,
      }),
    );
    return response;
  } catch (error) {
    console.error(
      JSON.stringify({
        event: "glossary_audit_request_failed",
        requestId,
        action,
        stage,
        errorName: error instanceof Error ? error.name : "UnknownError",
      }),
    );
    return new Response(
      JSON.stringify({ error: "Audit service unavailable" }),
      {
        status: 503,
        headers: {
          "content-type": "application/json",
          "cache-control": "no-store",
          "x-audit-diagnostic-id": requestId,
        },
      },
    );
  }
}

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { compilerAudit } from "../phrases-audit/compiler.mjs";

export default async function handler(request: Request) {
  const json = (body: object, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
      },
    });
  if (request.method !== "GET")
    return json({ error: "Method not allowed" }, 405);
  try {
    const credentials = Netlify.env.get("FIREBASE_SERVICE_ACCOUNT_JSON");
    if (!credentials) throw new Error("Missing audit credentials");
    const app =
      getApps().find((candidate) => candidate.name === "phrases-audit") ??
      initializeApp(
        { credential: cert(JSON.parse(credentials)) },
        "phrases-audit",
      );
    // ISO timestamps sort chronologically. Scan past queued/failed runs without
    // imposing a recent-run limit that could hide the latest completed report.
    const collection = getFirestore(app).collection(
      "internationalPhraseAuditRuns",
    );
    let query = collection.orderBy("requestedAt", "desc").limit(20);
    while (true) {
      const page = await query.get();
      const completed = page.docs.find(
        (doc) => doc.data().status === "completed",
      );
      if (completed)
        return json(compilerAudit({ ...completed.data(), id: completed.id }));
      if (page.size < 20)
        return json(
          { error: "No completed International Phrases audit is available" },
          503,
        );
      query = collection
        .orderBy("requestedAt", "desc")
        .startAfter(page.docs[page.size - 1])
        .limit(20);
    }
  } catch (error) {
    console.error(
      "[phrases-audit-compiler] Could not read latest audit",
      error,
    );
    return json({ error: "International Phrases audit unavailable" }, 503);
  }
}

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import {
  createGlossaryCompilerHandler,
  latestCompletedGlossaryAudit,
} from "../glossary-audit/compiler.mjs";

export default createGlossaryCompilerHandler({
  latestCompleted: async () => {
    const credentials = Netlify.env.get("FIREBASE_SERVICE_ACCOUNT_JSON");
    if (!credentials) throw new Error("Missing audit credentials");
    const app =
      getApps().find((candidate) => candidate.name === "glossary-audit") ??
      initializeApp(
        { credential: cert(JSON.parse(credentials)) },
        "glossary-audit",
      );
    return latestCompletedGlossaryAudit(
      getFirestore(app).collection("glossaryAuditRuns"),
    );
  },
});

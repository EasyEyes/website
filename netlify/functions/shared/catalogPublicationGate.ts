export type CatalogKind = "phrases" | "parameters";

export type PublicationGateResult =
  | { allowed: true; reportId?: string }
  | { allowed: false; code: string; missing: string[] };

type Usage = {
  referencedKeys: Record<string, unknown>;
  registeredDynamicKeys: Record<string, unknown>;
};

export async function checkCatalogPublication(
  kind: CatalogKind,
  previousDefinitions: Iterable<string>,
  nextDefinitions: Iterable<string>,
  fetchImpl: typeof fetch = fetch,
  endpoint = process.env.CATALOG_USAGE_REPORT_URL ??
    "https://easyeyes.app/.netlify/functions/catalog-usage-report?latest",
): Promise<PublicationGateResult> {
  const previous = new Set(previousDefinitions);
  const next = new Set(nextDefinitions);
  const destructive = [...previous].some((key) => !next.has(key));
  if (!destructive) return { allowed: true };

  let response: Response;
  try {
    response = await fetchImpl(endpoint, { cache: "no-store" });
  } catch {
    return { allowed: false, code: "CATALOG_AUDIT_FAILED", missing: [] };
  }
  if (!response.ok) {
    return { allowed: false, code: "CATALOG_AUDIT_FAILED", missing: [] };
  }

  const payload = (await response.json()) as {
    report?: { phrases?: Usage; parameters?: Usage };
    publication?: { reportId?: string };
    freshness?: { status?: string };
  };
  const usage = payload.report?.[kind];
  if (!usage) {
    return { allowed: false, code: "CATALOG_AUDIT_FAILED", missing: [] };
  }
  const used = new Set([
    ...Object.keys(usage.referencedKeys ?? {}),
    ...Object.keys(usage.registeredDynamicKeys ?? {}),
  ]);
  const missing = [...used].filter((key) => !next.has(key)).sort();
  if (missing.length)
    return {
      allowed: false,
      code:
        kind === "phrases"
          ? "PHRASE_DEFINITION_MISSING"
          : "PARAMETER_DEFINITION_MISSING",
      missing,
    };
  if (destructive && payload.freshness?.status !== "current")
    return { allowed: false, code: "CATALOG_AUDIT_STALE", missing: [] };
  return { allowed: true, reportId: payload.publication?.reportId };
}

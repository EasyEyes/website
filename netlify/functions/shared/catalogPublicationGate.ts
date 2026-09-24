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
  const removed = [...previous].filter((key) => !next.has(key)).sort();
  const destructive = removed.length > 0;
  if (!destructive) return { allowed: true };

  console.warn(
    `[catalog-publication-gate] destructive ${kind} update previous=${previous.size} next=${next.size} removed=${removed.length} reportUrl=${endpoint}`,
  );

  let response: Response;
  try {
    response = await fetchImpl(endpoint, { cache: "no-store" });
  } catch (error) {
    console.error(
      `[catalog-publication-gate] report request failed kind=${kind}`,
      error,
    );
    return { allowed: false, code: "CATALOG_AUDIT_FAILED", missing: [] };
  }
  if (!response.ok) {
    let responseCode = "unknown";
    try {
      responseCode = String((await response.clone().json())?.code ?? "unknown");
    } catch {
      // The status and endpoint still identify the failed dependency.
    }
    console.error(
      `[catalog-publication-gate] report rejected kind=${kind} status=${response.status} code=${responseCode} reportUrl=${endpoint}`,
    );
    return { allowed: false, code: "CATALOG_AUDIT_FAILED", missing: [] };
  }

  let payload: {
    report?: { phrases?: Usage; parameters?: Usage };
    publication?: { reportId?: string };
    freshness?: { status?: string };
  };
  try {
    payload = (await response.json()) as typeof payload;
  } catch (error) {
    console.error(
      `[catalog-publication-gate] report returned invalid JSON kind=${kind} reportUrl=${endpoint}`,
      error,
    );
    return { allowed: false, code: "CATALOG_AUDIT_FAILED", missing: [] };
  }
  const usage = payload.report?.[kind];
  if (!usage) {
    console.error(
      `[catalog-publication-gate] report payload missing usage kind=${kind}`,
    );
    return { allowed: false, code: "CATALOG_AUDIT_FAILED", missing: [] };
  }
  const used = new Set([
    ...Object.keys(usage.referencedKeys ?? {}),
    ...Object.keys(usage.registeredDynamicKeys ?? {}),
  ]);
  const missing = [...used].filter((key) => !next.has(key)).sort();
  if (missing.length)
    console.error(
      `[catalog-publication-gate] update removes referenced ${kind} definitions count=${
        missing.length
      } keys=${missing.join(",")}`,
    );
  if (missing.length)
    return {
      allowed: false,
      code:
        kind === "phrases"
          ? "PHRASE_DEFINITION_MISSING"
          : "PARAMETER_DEFINITION_MISSING",
      missing,
    };
  if (destructive && payload.freshness?.status !== "current") {
    console.error(
      `[catalog-publication-gate] report is not current kind=${kind} freshness=${
        payload.freshness?.status ?? "missing"
      }`,
    );
    return { allowed: false, code: "CATALOG_AUDIT_STALE", missing: [] };
  }
  console.info(
    `[catalog-publication-gate] destructive ${kind} update allowed reportId=${
      payload.publication?.reportId ?? "missing"
    } removed=${removed.length}`,
  );
  return { allowed: true, reportId: payload.publication?.reportId };
}

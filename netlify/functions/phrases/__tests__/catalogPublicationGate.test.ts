import { checkCatalogPublication } from "../../shared/catalogPublicationGate";

const reply = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status }));

test("allows additions without requiring report availability", async () => {
  expect(
    await checkCatalogPublication(
      "phrases",
      ["A"],
      ["A", "B"],
      jest.fn().mockRejectedValue(new Error("offline")) as typeof fetch,
    ),
  ).toEqual({ allowed: true });
});

test("blocks destructive publication when the report is stale", async () => {
  const fetchImpl = jest.fn(() =>
    reply({
      report: { phrases: { referencedKeys: {}, registeredDynamicKeys: {} } },
      freshness: { status: "stale" },
    }),
  ) as unknown as typeof fetch;
  expect(
    await checkCatalogPublication("phrases", ["A", "B"], ["A"], fetchImpl),
  ).toEqual({ allowed: false, code: "CATALOG_AUDIT_STALE", missing: [] });
});

test("blocks destructive publication that omits a used definition", async () => {
  const fetchImpl = jest.fn(() =>
    reply({
      report: {
        parameters: {
          referencedKeys: { required: [] },
          registeredDynamicKeys: { dynamic: [] },
        },
      },
      freshness: { status: "current" },
    }),
  ) as unknown as typeof fetch;
  expect(
    await checkCatalogPublication(
      "parameters",
      ["existing", "removed"],
      ["existing"],
      fetchImpl,
    ),
  ).toEqual({
    allowed: false,
    code: "PARAMETER_DEFINITION_MISSING",
    missing: ["dynamic", "required"],
  });
});

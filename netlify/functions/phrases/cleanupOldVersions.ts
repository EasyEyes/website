import { decodeFirebaseSegment } from "../shared/encodeFirebaseSegment";

const FIREBASE_ROOT = "https://easyeyes-compiler-default-rtdb.firebaseio.com";
const DRY_RUN = process.argv.includes("--dry-run");
const CONCURRENCY = 10;

function firebaseUrl(path: string): string {
  return `${FIREBASE_ROOT}/${path}.json?auth=${process.env.FIREBASE_DB}`;
}

async function firebaseGet(path: string): Promise<unknown> {
  const res = await fetch(firebaseUrl(path));
  if (!res.ok) throw new Error(`Firebase GET ${path} → ${res.status}`);
  return res.json();
}

async function firebaseGetShallowKeys(path: string): Promise<string[]> {
  const res = await fetch(`${firebaseUrl(path)}&shallow=true`);
  if (!res.ok) throw new Error(`Firebase GET (shallow) ${path} → ${res.status}`);
  const data = (await res.json()) as Record<string, true> | null;
  return Object.keys(data ?? {});
}

async function firebaseDelete(path: string): Promise<void> {
  const res = await fetch(firebaseUrl(path), { method: "DELETE" });
  if (!res.ok) throw new Error(`Firebase DELETE ${path} → ${res.status}`);
}

async function runConcurrent<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += limit) {
    const batch = items.slice(i, i + limit);
    results.push(...(await Promise.all(batch.map(fn))));
  }
  return results;
}

async function collectReferencedVersions(): Promise<{
  glossary: Set<string>;
  phrases: Set<string>;
}> {
  const glossaryReferenced = new Set<string>();
  const phrasesReferenced = new Set<string>();

  const encodedUsers = await firebaseGetShallowKeys("users");
  console.log(`Found ${encodedUsers.length} user(s)`);

  for (const encodedUser of encodedUsers) {
    const encodedExperiments = await firebaseGetShallowKeys(
      `users/${encodedUser}`,
    );
    console.log(
      `  ${decodeFirebaseSegment(encodedUser)}: ${encodedExperiments.length} experiment(s)`,
    );

    type VersionField = "glossaryVersion" | "phrasesVersion";
    const tasks = encodedExperiments.flatMap((encodedExp) =>
      (["glossaryVersion", "phrasesVersion"] as VersionField[]).map(
        (field) => ({ encodedExp, field }),
      ),
    );

    const fetched = await runConcurrent(
      tasks,
      CONCURRENCY,
      async ({ encodedExp, field }) => {
        const val = (await firebaseGet(
          `users/${encodedUser}/${encodedExp}/${field}`,
        )) as string | null;
        return { field, val };
      },
    );

    for (const { field, val } of fetched) {
      if (!val) continue;
      if (field === "glossaryVersion") glossaryReferenced.add(val);
      else phrasesReferenced.add(val);
    }
  }

  return { glossary: glossaryReferenced, phrases: phrasesReferenced };
}

async function main(): Promise<void> {
  if (!process.env.FIREBASE_DB) {
    throw new Error("FIREBASE_DB env var is required");
  }

  if (DRY_RUN) console.log("[cleanup] DRY RUN — no deletions will be made\n");

  const glossaryCurrent = (await firebaseGet("currentVersion")) as string | null;
  const phrasesCurrent = (await firebaseGet(
    "phrases/currentVersion",
  )) as string | null;
  console.log(`Current glossary version : ${glossaryCurrent ?? "(none)"}`);
  console.log(`Current phrases version  : ${phrasesCurrent ?? "(none)"}\n`);

  const encodedGlossaryVersions = await firebaseGetShallowKeys("versions");
  const encodedPhrasesVersions = await firebaseGetShallowKeys("phrasesVersions");
  console.log(`Glossary versions in DB  : ${encodedGlossaryVersions.length}`);
  console.log(`Phrases versions in DB   : ${encodedPhrasesVersions.length}\n`);

  console.log("Scanning experiments for referenced versions...");
  const { glossary: glossaryReferenced, phrases: phrasesReferenced } =
    await collectReferencedVersions();

  console.log(
    `\nReferenced glossary versions : ${[...glossaryReferenced].sort().join(", ") || "(none)"}`,
  );
  console.log(
    `Referenced phrases versions  : ${[...phrasesReferenced].sort().join(", ") || "(none)"}\n`,
  );

  const PROTECTED_VERSION = "1.0";

  const glossaryToDelete = encodedGlossaryVersions.filter((encoded) => {
    const decoded = decodeFirebaseSegment(encoded);
    return (
      decoded !== glossaryCurrent &&
      decoded !== PROTECTED_VERSION &&
      !glossaryReferenced.has(decoded)
    );
  });

  const phrasesToDelete = encodedPhrasesVersions.filter((encoded) => {
    const decoded = decodeFirebaseSegment(encoded);
    return (
      decoded !== phrasesCurrent &&
      decoded !== PROTECTED_VERSION &&
      !phrasesReferenced.has(decoded)
    );
  });

  if (glossaryToDelete.length === 0 && phrasesToDelete.length === 0) {
    console.log("Nothing to delete. DB is clean.");
    return;
  }

  console.log(`Glossary versions to delete (${glossaryToDelete.length}):`);
  for (const encoded of glossaryToDelete) {
    console.log(`  versions/${encoded}  (${decodeFirebaseSegment(encoded)})`);
  }
  console.log(`\nPhrases versions to delete (${phrasesToDelete.length}):`);
  for (const encoded of phrasesToDelete) {
    console.log(
      `  phrasesVersions/${encoded}  (${decodeFirebaseSegment(encoded)})`,
    );
  }

  if (DRY_RUN) {
    console.log("\n[dry-run] Skipping deletions.");
    return;
  }

  console.log("\nDeleting...");
  for (const encoded of glossaryToDelete) {
    await firebaseDelete(`versions/${encoded}`);
    console.log(`  deleted versions/${encoded}  (${decodeFirebaseSegment(encoded)})`);
  }
  for (const encoded of phrasesToDelete) {
    await firebaseDelete(`phrasesVersions/${encoded}`);
    console.log(
      `  deleted phrasesVersions/${encoded}  (${decodeFirebaseSegment(encoded)})`,
    );
  }

  console.log(
    `\nDone. Deleted ${glossaryToDelete.length} glossary version(s) and ${phrasesToDelete.length} phrases version(s).`,
  );
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

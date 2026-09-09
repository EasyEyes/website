#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  applyDynamicRegistrations,
  extractReferences,
  filterCollectionsByKinds,
  serializeIndex,
  validateRegistry,
} from "./index.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const websiteRoot = path.resolve(scriptDirectory, "../..");
const registryPath = path.join(scriptDirectory, "repositories.json");
const extensions = new Set([".js", ".jsx", ".mjs", ".ts", ".tsx"]);

async function filesBelow(root, excluded) {
  const output = [];
  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name);
      const relative = path.relative(root, fullPath).split(path.sep);
      if (relative.some((part) => excluded.has(part))) continue;
      if (entry.isDirectory()) await visit(fullPath);
      else if (entry.isFile() && extensions.has(path.extname(entry.name)))
        output.push(fullPath);
    }
  }
  if (!(await stat(root).catch(() => null))?.isDirectory()) {
    throw new Error(`Required source root does not exist: ${root}`);
  }
  await visit(root);
  return output.sort();
}

function mergeCollection(target, source) {
  for (const [key, evidence] of Object.entries(source.referencedKeys)) {
    target.referencedKeys[key] ??= [];
    target.referencedKeys[key].push(...evidence);
  }
  for (const [key, evidence] of Object.entries(source.registeredDynamicKeys)) {
    target.registeredDynamicKeys[key] ??= [];
    target.registeredDynamicKeys[key].push(...evidence);
  }
  target.uncertainReferences.push(...source.uncertainReferences);
}

async function applyRegistrations(report, repository, sha) {
  for (const registrationPath of repository.dynamicRegistrations) {
    const absolutePath = path.resolve(scriptDirectory, registrationPath);
    const registrations = JSON.parse(await readFile(absolutePath, "utf8"));
    applyDynamicRegistrations(report, registrations, {
      repository: repository.name,
      commitSha: sha,
    });
  }
}

function commitSha(repositoryPath) {
  return execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: repositoryPath,
    encoding: "utf8",
  }).trim();
}

async function main() {
  const registryText = await readFile(registryPath, "utf8");
  const registry = validateRegistry(JSON.parse(registryText));
  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    scanner: {
      version: "1.0.0",
      configurationDigest: createHash("sha256")
        .update(registryText)
        .digest("hex"),
    },
    repositories: [],
    phrases: {
      referencedKeys: {},
      registeredDynamicKeys: {},
      uncertainReferences: [],
    },
    parameters: {
      referencedKeys: {},
      registeredDynamicKeys: {},
      uncertainReferences: [],
    },
  };

  for (const repository of registry.filter(
    ({ status }) => status === "included",
  )) {
    const repositoryPath = path.resolve(websiteRoot, repository.localPath);
    const sha = commitSha(repositoryPath);
    report.repositories.push({
      name: repository.name,
      url: repository.url,
      defaultBranch: repository.defaultBranch,
      commitSha: sha,
      catalogKinds: repository.catalogKinds,
    });
    await applyRegistrations(report, repository, sha);
    const excluded = new Set(repository.excludeRoots);
    for (const sourceRoot of repository.sourceRoots) {
      const absoluteRoot = path.resolve(repositoryPath, sourceRoot);
      for (const file of await filesBelow(absoluteRoot, excluded)) {
        const source = await readFile(file, "utf8");
        let extracted;
        try {
          extracted = filterCollectionsByKinds(
            extractReferences(
              source,
              {
                repository: repository.name,
                commitSha: sha,
                file: path
                  .relative(repositoryPath, file)
                  .split(path.sep)
                  .join("/"),
              },
              {
                phraseReaders: repository.readers.filter(
                  ({ catalogKind }) => catalogKind === "phrases",
                ),
                parameterReaders: repository.readers.filter(
                  ({ catalogKind }) => catalogKind === "parameters",
                ),
              },
            ),
            repository.catalogKinds,
          );
        } catch (error) {
          throw new Error(`Could not parse ${file}: ${error.message}`, {
            cause: error,
          });
        }
        mergeCollection(report.phrases, extracted.phrases);
        mergeCollection(report.parameters, extracted.parameters);
      }
    }
  }

  const { identity, json } = serializeIndex(report);
  const outputArgument = process.argv.find((argument) =>
    argument.startsWith("--output="),
  );
  const outputPath = path.resolve(
    websiteRoot,
    outputArgument?.slice(9) ?? "catalog-usage-index.json",
  );
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, json);
  process.stdout.write(`${JSON.stringify({ identity, outputPath })}\n`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

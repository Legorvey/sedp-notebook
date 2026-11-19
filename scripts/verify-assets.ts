import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";
import { AssetsManifestSchema, SourcesRegistrySchema } from "../src/lib/content/schemas";

const ROOT = process.cwd();
const DISALLOWED_BINARY_EXTENSIONS = [".pdf", ".pptx", ".ppt", ".docx", ".xlsx"];
const ALLOWLISTED_PUBLIC_FILES = new Set(["favicon.ico", "robots.txt", "sitemap.xml", ".gitkeep"]);

function walkFiles(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...walkFiles(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

function isDisallowedFormat(filePath: string): boolean {
  const lower = filePath.toLowerCase();
  const name = basename(lower);
  if (name === ".env" || (name.startsWith(".env.") && name !== ".env.example")) {
    return true;
  }
  return DISALLOWED_BINARY_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function isQuarantinedNecPdf(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return (
    lower.endsWith(".pdf") &&
    (lower.includes("nec advances") || (lower.includes("nec") && lower.includes("internal")))
  );
}

function main() {
  const errors: string[] = [];

  const trackedOutput = execFileSync("git", ["ls-files"], { cwd: ROOT, encoding: "utf8" });
  for (const trackedPath of trackedOutput.split(/\r?\n/)) {
    if (!trackedPath) {
      continue;
    }
    const normalized = trackedPath.replace(/\\/g, "/");
    if (normalized.startsWith("sources-private/")) {
      errors.push(`Git tracked private directory file: ${normalized}`);
    }
    if (isDisallowedFormat(normalized)) {
      errors.push(`Git tracked disallowed document/env file: ${normalized}`);
    }
  }

  for (const entry of readdirSync(ROOT)) {
    const fullPath = join(ROOT, entry);
    if (!statSync(fullPath).isFile()) {
      continue;
    }
    if (isQuarantinedNecPdf(entry)) {
      errors.push(
        `[QUARANTINE] Restricted file "${entry}" still resides in repository root. Owner must move this archival copy outside the AI-accessible workspace.`
      );
    } else if (entry.toLowerCase().endsWith(".pdf")) {
      errors.push(
        `Unstaged PDF found in repository root: "${entry}" (stage permitted sources in sources-private/ only).`
      );
    }
  }

  for (const privFile of walkFiles(resolve(ROOT, "sources-private"))) {
    const name = basename(privFile);
    if (isQuarantinedNecPdf(name)) {
      errors.push(
        `[QUARANTINE] Restricted NEC material "${relative(ROOT, privFile).replace(/\\/g, "/")}" must never enter sources-private/.`
      );
    }
  }

  const publicDir = resolve(ROOT, "public");
  const publicFiles = walkFiles(publicDir);
  const manifestPath = resolve(ROOT, "content", "assets-manifest.json");
  const sourcesPath = resolve(ROOT, "content", "sources.json");

  const assetByPath = new Map<
    string,
    { source_id: string; media_redistribution_allowed: boolean; rights_status: string }
  >();
  if (existsSync(manifestPath)) {
    const parsedManifest = AssetsManifestSchema.parse(
      JSON.parse(readFileSync(manifestPath, "utf8"))
    );
    for (const asset of parsedManifest.assets) {
      assetByPath.set(asset.asset_path, asset);
    }
  }

  const clearedSourceIds = new Set<string>();
  if (existsSync(sourcesPath)) {
    const parsedSources = SourcesRegistrySchema.parse(
      JSON.parse(readFileSync(sourcesPath, "utf8"))
    );
    for (const src of parsedSources.sources) {
      clearedSourceIds.add(src.source_id);
    }
  }

  for (const absPath of publicFiles) {
    const relFromPublic = relative(publicDir, absPath).replace(/\\/g, "/");
    if (isDisallowedFormat(relFromPublic)) {
      errors.push(`Disallowed document/env file in public/: ${relFromPublic}`);
      continue;
    }
    if (ALLOWLISTED_PUBLIC_FILES.has(relFromPublic) || basename(relFromPublic) === ".gitkeep") {
      continue;
    }
    const webAssetPath = `/${relFromPublic}`;
    const manifestEntry = assetByPath.get(webAssetPath);
    if (!manifestEntry) {
      errors.push(
        `Unregistered public asset missing from content/assets-manifest.json: ${webAssetPath}`
      );
      continue;
    }
    if (manifestEntry.rights_status !== "CLEARED" || !manifestEntry.media_redistribution_allowed) {
      errors.push(`Public asset lacks Gate C clearance/redistribution permission: ${webAssetPath}`);
    }
    if (clearedSourceIds.size > 0 && !clearedSourceIds.has(manifestEntry.source_id)) {
      errors.push(
        `Public asset "${webAssetPath}" references missing/uncleared source_id "${manifestEntry.source_id}"`
      );
    }
  }

  if (errors.length > 0) {
    console.error("verify:assets FAILED:");
    for (const err of errors) {
      console.error(` - ${err}`);
    }
    process.exit(1);
  }

  console.log(
    "verify:assets PASSED (zero tracked binaries/secrets, clean public/, zero workspace NEC quarantine files)."
  );
}

main();

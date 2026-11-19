import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";
import {
  AssetsManifestSchema,
  type PublicSource,
  SourcesRegistrySchema,
} from "../src/lib/content/schemas";
import { scanTextForForbiddenContent } from "../src/lib/content/validation";

const ROOT = process.cwd();
const DISALLOWED_BINARY_EXTENSIONS = [
  ".pdf",
  ".pptx",
  ".ppt",
  ".docx",
  ".xlsx",
  ".key",
  ".pem",
  ".p12",
  ".pfx",
  ".dump",
  ".sql",
];
const ALLOWLISTED_PUBLIC_FILES = new Set(["favicon.ico", "robots.txt", "sitemap.xml", ".gitkeep"]);
const SCANNED_WORKSPACE_DIRS = ["src", "content", "docs", "scripts", "tests"];

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

function scanPublicSvg(relPath: string, svgText: string, errors: string[]): void {
  if (/<script\b/i.test(svgText)) {
    errors.push(`public/${relPath}: SVG must not contain <script> elements`);
  }
  if (/<foreignObject\b/i.test(svgText)) {
    errors.push(`public/${relPath}: SVG must not contain <foreignObject> elements`);
  }
  if (/\son[a-z]+\s*=/i.test(svgText)) {
    errors.push(`public/${relPath}: SVG must not contain inline event handlers`);
  }
  if (/(?:javascript|vbscript):|data:text\/html/i.test(svgText)) {
    errors.push(`public/${relPath}: SVG contains unsafe script/data URI`);
  }
  for (const v of scanTextForForbiddenContent(`public/${relPath}`, svgText)) {
    errors.push(`${v.file}:${v.line}: Forbidden content (${v.rule})`);
  }
}

function main() {
  const errors: string[] = [];

  const trackedOutput = execFileSync("git", ["-c", "core.quotePath=false", "ls-files", "-z"], {
    cwd: ROOT,
    encoding: "utf8",
  });
  for (const trackedPath of trackedOutput.split("\0")) {
    if (!trackedPath) {
      continue;
    }
    const normalized = trackedPath.replace(/\\/g, "/");
    if (normalized.startsWith("sources-private/")) {
      errors.push(`Git tracked private directory file: ${normalized}`);
    }
    if (isDisallowedFormat(normalized)) {
      errors.push(`Git tracked disallowed document/secret file: ${normalized}`);
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
    } else if (isDisallowedFormat(entry)) {
      errors.push(
        `Disallowed file found in repository root: "${entry}" (stage permitted sources in sources-private/ only).`
      );
    }
  }

  for (const dirName of SCANNED_WORKSPACE_DIRS) {
    for (const filePath of walkFiles(resolve(ROOT, dirName))) {
      const rel = relative(ROOT, filePath).replace(/\\/g, "/");
      if (isQuarantinedNecPdf(basename(filePath))) {
        errors.push(`[QUARANTINE] Restricted NEC file "${rel}" must never reside in ${dirName}/.`);
      } else if (isDisallowedFormat(filePath)) {
        errors.push(`Disallowed document/secret file found in ${rel}`);
      }
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
      const diskPath = resolve(publicDir, asset.asset_path.replace(/^\/+/, ""));
      if (!existsSync(diskPath)) {
        errors.push(
          `Dead manifest entry in content/assets-manifest.json: ${asset.asset_path} missing in public/`
        );
      }
    }
  }

  const clearedSources = new Map<string, PublicSource>();
  const sourcesExist = existsSync(sourcesPath);
  if (sourcesExist) {
    const parsedSources = SourcesRegistrySchema.parse(
      JSON.parse(readFileSync(sourcesPath, "utf8"))
    );
    for (const src of parsedSources.sources) {
      clearedSources.set(src.source_id, src);
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

    if (relFromPublic.toLowerCase().endsWith(".svg")) {
      scanPublicSvg(relFromPublic, readFileSync(absPath, "utf8"), errors);
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
    const sourceRecord = clearedSources.get(manifestEntry.source_id);
    if (!sourcesExist || !sourceRecord) {
      errors.push(
        `Public asset "${webAssetPath}" references missing/uncleared source_id "${manifestEntry.source_id}"`
      );
    } else if (
      !sourceRecord.media_redistribution_allowed ||
      sourceRecord.reuse_scope === "CITATION_AND_FACT_SYNTHESIS_ONLY"
    ) {
      errors.push(
        `Public asset "${webAssetPath}" source "${manifestEntry.source_id}" disallows media redistribution`
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

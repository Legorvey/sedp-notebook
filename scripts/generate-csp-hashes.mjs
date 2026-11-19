import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const OUT_DIR = resolve(ROOT, "out");
const MANIFEST_OUTPUT_PATH = resolve(ROOT, ".csp-manifest.json");
const MAX_SAFE_HEADER_BYTES = 2000;

// Next.js 16.4.6 on Windows writes __next.<seg>/<subseg>/__PAGE__.txt using path separators
// instead of dots; flatten aliases alongside them so static hosts serve RSC prefetches cleanly.
export function normalizeWindowsRscSegmentFiles(dir) {
  if (!existsSync(dir)) {
    return 0;
  }
  let written = 0;

  function walk(currentDir) {
    for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
      const fullPath = join(currentDir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name.startsWith("__next.")) {
          const parentDir = dirname(fullPath);
          const prefix = entry.name;
          flattenSegmentTree(fullPath, parentDir, prefix);
        } else {
          walk(fullPath);
        }
      }
    }
  }

  function flattenSegmentTree(segmentDir, targetDir, prefix) {
    for (const entry of readdirSync(segmentDir, { withFileTypes: true })) {
      const fullPath = join(segmentDir, entry.name);
      if (entry.isDirectory()) {
        flattenSegmentTree(fullPath, targetDir, `${prefix}.${entry.name}`);
      } else if (entry.name.endsWith(".txt")) {
        const flatPath = join(targetDir, `${prefix}.${entry.name}`);
        copyFileSync(fullPath, flatPath);
        written += 1;
      }
    }
  }

  walk(dir);
  return written;
}

function walkHtmlFiles(dir) {
  if (!existsSync(dir)) {
    return [];
  }
  const files = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...walkHtmlFiles(fullPath));
    } else if (entry.endsWith(".html")) {
      files.push(fullPath);
    }
  }
  return files;
}

function htmlRelPathToRouteKey(relPath) {
  const normalized = relPath.replace(/\\/g, "/");
  if (normalized === "index.html") {
    return "/";
  }
  if (normalized.endsWith("/index.html")) {
    return `/${normalized.slice(0, -"index.html".length)}`;
  }
  return `/${normalized}`;
}

export function isExpectedInlineScript(body) {
  return (
    body.startsWith("(function(){try{if(window.localStorage.getItem('sedp.theme')") ||
    body.startsWith('(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push(') ||
    body === "(self.__next_f=self.__next_f||[]).push([0])" ||
    body.startsWith("self.__next_f.push([") ||
    body === "requestAnimationFrame(function(){$RT=performance.now()});" ||
    (body.startsWith("$RB=[];$RV=function(a){$RT=performance.now();") &&
      /\$RC\("B:[0-9a-zA-Z]+","S:[0-9a-zA-Z]+"\)\s*$/.test(body)) ||
    /^\$RC\("B:[0-9a-zA-Z]+","S:[0-9a-zA-Z]+"\);?\s*$/.test(body)
  );
}

export function extractInlineScriptHashes(html, routeKey) {
  const hashes = new Set();
  const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = scriptRegex.exec(html)) !== null) {
    const attrs = match[1] ?? "";
    const body = match[2] ?? "";

    // Require whitespace boundary so attributes like data-src="..." do not suppress hashing.
    if (/(?:^|\s)src\s*=/i.test(attrs)) {
      continue;
    }

    const typeMatch = attrs.match(/(?:^|\s)type\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const rawType = (typeMatch?.[1] ?? typeMatch?.[2] ?? typeMatch?.[3] ?? "").trim().toLowerCase();
    const mimeType = rawType.split(";")[0]?.trim() ?? "";
    if (mimeType === "application/json" || mimeType === "application/ld+json") {
      continue;
    }

    if (body.length === 0) {
      continue;
    }

    if (!isExpectedInlineScript(body)) {
      throw new Error(
        `Unexpected inline <script> detected in exported HTML (${routeKey}); refusing to auto-allowlist unknown script.`
      );
    }

    const digest = createHash("sha256").update(body, "utf8").digest("base64");
    hashes.add(`'sha256-${digest}'`);
  }

  return Array.from(hashes);
}

export function buildCspHeader(scriptHashes) {
  const scriptSrc = ["'self'", ...scriptHashes].join(" ");
  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-src 'none'",
    "object-src 'none'",
    "worker-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

function main() {
  if (!existsSync(OUT_DIR)) {
    console.error('generate-csp-hashes FAILED: "out/" directory missing. Run "pnpm build" first.');
    process.exit(1);
  }

  const normalizedRscCount = normalizeWindowsRscSegmentFiles(OUT_DIR);

  const htmlFiles = walkHtmlFiles(OUT_DIR);
  if (htmlFiles.length === 0) {
    console.error('generate-csp-hashes FAILED: No exported HTML files found under "out/".');
    process.exit(1);
  }

  const routes = {};
  const aggregateHashes = new Set();
  let maxRouteHeaderBytes = 0;

  for (const absHtmlPath of htmlFiles) {
    const relPath = relative(OUT_DIR, absHtmlPath);
    const routeKey = htmlRelPathToRouteKey(relPath);
    const html = readFileSync(absHtmlPath, "utf8");
    const htmlSha256 = createHash("sha256").update(html, "utf8").digest("hex");
    const hashes = extractInlineScriptHashes(html, routeKey);

    for (const hash of hashes) {
      aggregateHashes.add(hash);
    }

    const csp = buildCspHeader(hashes);
    const headerBytes = Buffer.byteLength(csp, "utf8");
    maxRouteHeaderBytes = Math.max(maxRouteHeaderBytes, headerBytes);

    routes[routeKey] = {
      file: relPath.replace(/\\/g, "/"),
      htmlSha256,
      scriptCount: hashes.length,
      hashes,
      headerBytes,
      csp,
    };
  }

  if (maxRouteHeaderBytes > MAX_SAFE_HEADER_BYTES) {
    console.error(
      `csp:hashes FAILED: maxRouteHeaderBytes (${maxRouteHeaderBytes}) exceeds ${MAX_SAFE_HEADER_BYTES}-byte static host _headers budget.`
    );
    process.exit(1);
  }

  const aggregateHashList = Array.from(aggregateHashes);
  const aggregateCsp = buildCspHeader(aggregateHashList);
  const aggregateHeaderBytes = Buffer.byteLength(aggregateCsp, "utf8");

  if (aggregateHeaderBytes > MAX_SAFE_HEADER_BYTES) {
    console.warn(
      `NOTE: aggregateHeaderBytes (${aggregateHeaderBytes}) exceeds ${MAX_SAFE_HEADER_BYTES}-byte flat _headers cap; production hosting should attach per-route CSP headers from .csp-manifest.json.`
    );
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    routeCount: Object.keys(routes).length,
    normalizedRscCount,
    maxRouteHeaderBytes,
    aggregateHashCount: aggregateHashList.length,
    aggregateHeaderBytes,
    aggregateCsp,
    routes,
  };

  writeFileSync(MANIFEST_OUTPUT_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  console.log(
    `csp:hashes generated for ${manifest.routeCount} HTML files -> .csp-manifest.json (maxRouteHeaderBytes=${maxRouteHeaderBytes}, aggregateHeaderBytes=${aggregateHeaderBytes}, uniqueInlineScripts=${aggregateHashList.length}, normalizedRsc=${normalizedRscCount}).`
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}

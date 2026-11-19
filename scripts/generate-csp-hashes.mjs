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
const MAX_FLAT_HEADERS_LINE_CHARS = 2000;
const MAX_FLAT_HEADERS_RULES = 100;
const FLAT_HEADER_LINE_PREFIX = "  Content-Security-Policy: ";

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

export function collectStaticRscFiles(dir) {
  if (!existsSync(dir)) {
    return [];
  }
  const files = [];

  function walk(currentDir) {
    for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
      const fullPath = join(currentDir, entry.name);
      if (entry.isDirectory()) {
        // Ignore raw unflattened nested __next.* Windows trees when cataloging flat RSC assets.
        if (!entry.name.startsWith("__next.")) {
          walk(fullPath);
        }
      } else if (entry.name.startsWith("__next.") && entry.name.endsWith(".txt")) {
        files.push(relative(dir, fullPath).replace(/\\/g, "/"));
      }
    }
  }

  walk(dir);
  files.sort();
  return files;
}

export function computeBuildFingerprintSha256(routesMap) {
  const entries = Object.keys(routesMap)
    .sort()
    .map((key) => `${key}:${routesMap[key].htmlSha256}`);
  return createHash("sha256").update(entries.join("\n"), "utf8").digest("hex");
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
    "style-src-elem 'self'",
    "style-src-attr 'unsafe-inline'",
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
  let maxRouteHeaderChars = 0;
  let maxRouteHeaderLineChars = 0;

  for (const absHtmlPath of htmlFiles) {
    const relPath = relative(OUT_DIR, absHtmlPath);
    const routeKey = htmlRelPathToRouteKey(relPath);
    const htmlBuffer = readFileSync(absHtmlPath);
    const html = htmlBuffer.toString("utf8");
    const htmlSha256 = createHash("sha256").update(htmlBuffer).digest("hex");
    const hashes = extractInlineScriptHashes(html, routeKey);

    for (const hash of hashes) {
      aggregateHashes.add(hash);
    }

    const csp = buildCspHeader(hashes);
    const headerBytes = Buffer.byteLength(csp, "utf8");
    const headerChars = csp.length;
    const headerLineChars = `${FLAT_HEADER_LINE_PREFIX}${csp}`.length;
    maxRouteHeaderBytes = Math.max(maxRouteHeaderBytes, headerBytes);
    maxRouteHeaderChars = Math.max(maxRouteHeaderChars, headerChars);
    maxRouteHeaderLineChars = Math.max(maxRouteHeaderLineChars, headerLineChars);

    routes[routeKey] = {
      file: relPath.replace(/\\/g, "/"),
      htmlSha256,
      scriptCount: hashes.length,
      hashes,
      headerBytes,
      headerChars,
      headerLineChars,
      csp,
    };
  }

  if (maxRouteHeaderLineChars > MAX_FLAT_HEADERS_LINE_CHARS) {
    console.error(
      `csp:hashes FAILED: maxRouteHeaderLineChars (${maxRouteHeaderLineChars}) exceeds ${MAX_FLAT_HEADERS_LINE_CHARS}-character flat _headers line cap.`
    );
    process.exit(1);
  }

  const routeCount = Object.keys(routes).length;
  // Estimate 1 rule per HTML route plus 4 asset/default rules (/*, /_next/static/*, /*.svg, /*.txt).
  const estimatedRuleCount = routeCount + 4;
  if (estimatedRuleCount > MAX_FLAT_HEADERS_RULES) {
    console.warn(
      `NOTE: estimatedRuleCount (${estimatedRuleCount}) exceeds flat _headers ${MAX_FLAT_HEADERS_RULES}-rule cap; deploy via programmatic per-route HTTP headers from .csp-manifest.json.`
    );
  }

  const aggregateHashList = Array.from(aggregateHashes);
  const aggregateCsp = buildCspHeader(aggregateHashList);
  const aggregateHeaderBytes = Buffer.byteLength(aggregateCsp, "utf8");
  const aggregateHeaderChars = aggregateCsp.length;
  const rscAssets = collectStaticRscFiles(OUT_DIR);
  const buildFingerprintSha256 = computeBuildFingerprintSha256(routes);

  const manifest = {
    generatedAt: new Date().toISOString(),
    buildFingerprintSha256,
    routeCount,
    estimatedRuleCount,
    normalizedRscCount,
    rscAssetCount: rscAssets.length,
    rscAssets,
    maxRouteHeaderBytes,
    maxRouteHeaderChars,
    maxRouteHeaderLineChars,
    aggregateHashCount: aggregateHashList.length,
    aggregateHeaderBytes,
    aggregateHeaderChars,
    limitsReference: {
      flatHeadersMaxLineChars: MAX_FLAT_HEADERS_LINE_CHARS,
      flatHeadersMaxRules: MAX_FLAT_HEADERS_RULES,
      hostingProviderSelected: false,
    },
    aggregateCsp,
    routes,
  };

  writeFileSync(MANIFEST_OUTPUT_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  console.log(
    `csp:hashes generated for ${manifest.routeCount} HTML files -> .csp-manifest.json (maxRouteHeaderLineChars=${maxRouteHeaderLineChars}, maxRouteHeaderBytes=${maxRouteHeaderBytes}, estimatedRuleCount=${estimatedRuleCount}, aggregateHeaderBytes=${aggregateHeaderBytes}, uniqueInlineScripts=${aggregateHashList.length}, rscAssets=${rscAssets.length}, normalizedRsc=${normalizedRscCount}).`
  );
}

if (
  process.argv[1] &&
  import.meta.url.toLowerCase() === pathToFileURL(resolve(process.argv[1])).href.toLowerCase()
) {
  main();
}

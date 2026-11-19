import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const OUT_DIR = resolve(process.cwd(), "out");

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

function extractInlineScriptHashes(html) {
  const hashes = new Set();
  const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = scriptRegex.exec(html)) !== null) {
    const attrs = match[1] ?? "";
    const body = match[2] ?? "";

    if (/\bsrc\s*=/i.test(attrs)) {
      continue;
    }

    const typeMatch = attrs.match(/\btype\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const scriptType = (typeMatch?.[1] ?? typeMatch?.[2] ?? typeMatch?.[3] ?? "")
      .trim()
      .toLowerCase();
    if (scriptType === "application/json" || scriptType === "application/ld+json") {
      continue;
    }

    if (body.length === 0) {
      continue;
    }

    const digest = createHash("sha256").update(body, "utf8").digest("base64");
    hashes.add(`'sha256-${digest}'`);
  }

  return Array.from(hashes);
}

function buildCspHeader(scriptHashes) {
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
    const hashes = extractInlineScriptHashes(html);

    for (const hash of hashes) {
      aggregateHashes.add(hash);
    }

    const csp = buildCspHeader(hashes);
    const headerBytes = Buffer.byteLength(csp, "utf8");
    maxRouteHeaderBytes = Math.max(maxRouteHeaderBytes, headerBytes);

    routes[routeKey] = {
      file: relPath.replace(/\\/g, "/"),
      scriptCount: hashes.length,
      hashes,
      headerBytes,
      csp,
    };
  }

  const aggregateHashList = Array.from(aggregateHashes);
  const aggregateCsp = buildCspHeader(aggregateHashList);
  const aggregateHeaderBytes = Buffer.byteLength(aggregateCsp, "utf8");

  const manifest = {
    generatedAt: new Date().toISOString(),
    routeCount: Object.keys(routes).length,
    maxRouteHeaderBytes,
    aggregateHashCount: aggregateHashList.length,
    aggregateHeaderBytes,
    aggregateCsp,
    routes,
  };

  writeFileSync(
    join(OUT_DIR, "csp-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8"
  );

  console.log(
    `csp:hashes generated for ${manifest.routeCount} HTML files (maxRouteHeaderBytes=${maxRouteHeaderBytes}, aggregateHeaderBytes=${aggregateHeaderBytes}, uniqueInlineScripts=${aggregateHashList.length}).`
  );
}

main();

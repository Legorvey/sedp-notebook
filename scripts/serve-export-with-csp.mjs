import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import http from "node:http";
import { extname, normalize, relative, resolve, sep } from "node:path";

function parseArgs(argv) {
  let port = 3100;
  let dir = "out";
  let manifestFile = ".csp-manifest.json";

  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--port" && argv[i + 1]) {
      port = Number.parseInt(argv[i + 1], 10);
      if (!Number.isInteger(port) || port < 1 || port > 65535) {
        console.error(`Invalid --port value: "${argv[i + 1]}"`);
        process.exit(1);
      }
      i += 1;
    } else if (argv[i] === "--dir" && argv[i + 1]) {
      dir = argv[i + 1];
      i += 1;
    } else if (argv[i] === "--manifest" && argv[i + 1]) {
      manifestFile = argv[i + 1];
      i += 1;
    }
  }

  return {
    port,
    outDir: resolve(process.cwd(), dir),
    manifestPath: resolve(process.cwd(), manifestFile),
  };
}

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

const { port, outDir, manifestPath } = parseArgs(process.argv.slice(2));

if (!existsSync(manifestPath)) {
  console.error(
    'serve-export-with-csp FAILED: Missing ".csp-manifest.json". Run "pnpm csp:hashes" first.'
  );
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

function resolveStaticTarget(urlPathname) {
  const decoded = decodeURIComponent(urlPathname);
  const cleanRel = normalize(decoded)
    .replace(/^(\.\.(\/|\\|$))+/, "")
    .replace(/^[/\\]+/, "");
  const candidate = cleanRel === "" ? resolve(outDir, "index.html") : resolve(outDir, cleanRel);

  if (candidate !== outDir && !candidate.startsWith(outDir + sep)) {
    return null;
  }

  if (existsSync(candidate) && statSync(candidate).isFile()) {
    return { absPath: candidate, isDirectoryIndex: false };
  }

  const indexCandidate = resolve(candidate, "index.html");
  if (
    indexCandidate.startsWith(outDir + sep) &&
    existsSync(indexCandidate) &&
    statSync(indexCandidate).isFile()
  ) {
    return {
      absPath: indexCandidate,
      isDirectoryIndex: cleanRel !== "" && !urlPathname.endsWith("/"),
    };
  }

  const htmlCandidate = `${candidate}.html`;
  if (
    htmlCandidate.startsWith(outDir + sep) &&
    existsSync(htmlCandidate) &&
    statSync(htmlCandidate).isFile()
  ) {
    return { absPath: htmlCandidate, isDirectoryIndex: false };
  }

  return null;
}

function getRouteKeyForHtmlFile(absPath) {
  const rel = relative(outDir, absPath).replace(/\\/g, "/");
  if (rel === "index.html") {
    return "/";
  }
  if (rel.endsWith("/index.html")) {
    return `/${rel.slice(0, -"index.html".length)}`;
  }
  return `/${rel}`;
}

const server = http.createServer((req, res) => {
  const method = (req.method ?? "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8", Allow: "GET, HEAD" });
    res.end("Method Not Allowed");
    return;
  }

  let reqUrl;
  try {
    reqUrl = new URL(req.url ?? "/", `http://127.0.0.1:${port}`);
  } catch {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Bad Request");
    return;
  }

  let resolved = null;
  try {
    resolved = resolveStaticTarget(reqUrl.pathname);
  } catch {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Bad Request");
    return;
  }

  if (resolved?.isDirectoryIndex) {
    res.writeHead(308, { Location: `${reqUrl.pathname}/${reqUrl.search}` });
    res.end();
    return;
  }

  let targetFile = resolved?.absPath ?? null;
  let statusCode = 200;

  if (!targetFile) {
    statusCode = 404;
    const notFoundHtml = resolve(outDir, "404.html");
    targetFile = existsSync(notFoundHtml) ? notFoundHtml : null;
  }

  if (!targetFile) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not Found");
    return;
  }

  const ext = extname(targetFile).toLowerCase();
  const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

  const headers = {
    "Content-Type": contentType,
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  };

  const fileBuffer = readFileSync(targetFile);

  if (ext === ".html") {
    const routeKey = getRouteKeyForHtmlFile(targetFile);
    const routeEntry = manifest.routes[routeKey];
    if (!routeEntry?.csp) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(`Missing CSP entry for route "${routeKey}" in .csp-manifest.json`);
      return;
    }
    const currentHtmlSha256 = createHash("sha256").update(fileBuffer).digest("hex");
    if (routeEntry.htmlSha256 && routeEntry.htmlSha256 !== currentHtmlSha256) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(
        `Stale .csp-manifest.json for "${routeKey}": HTML digest mismatch; rerun "pnpm csp:hashes".`
      );
      return;
    }
    headers["Content-Security-Policy"] = routeEntry.csp;
    headers["Cache-Control"] = "public, max-age=0, must-revalidate";
  } else if (ext === ".svg") {
    headers["Content-Security-Policy"] = "default-src 'none'; style-src 'unsafe-inline'; sandbox";
    headers["Cache-Control"] = "public, max-age=3600";
  } else if (ext === ".txt") {
    headers["Cache-Control"] = "public, max-age=0, must-revalidate";
  } else if (reqUrl.pathname.startsWith("/_next/static/")) {
    headers["Cache-Control"] = "public, max-age=31536000, immutable";
  } else {
    headers["Cache-Control"] = "public, max-age=3600";
  }

  res.writeHead(statusCode, headers);
  if (method === "HEAD") {
    res.end();
    return;
  }
  res.end(fileBuffer);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Static export + CSP server listening on http://127.0.0.1:${port}`);
});

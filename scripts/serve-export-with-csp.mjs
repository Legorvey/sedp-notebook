import { existsSync, readFileSync, statSync } from "node:fs";
import http from "node:http";
import { extname, normalize, resolve, sep } from "node:path";

function parseArgs(argv) {
  let port = 3100;
  let dir = "out";

  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--port" && argv[i + 1]) {
      port = Number.parseInt(argv[i + 1], 10);
      i += 1;
    } else if (argv[i] === "--dir" && argv[i + 1]) {
      dir = argv[i + 1];
      i += 1;
    }
  }

  return { port, outDir: resolve(process.cwd(), dir) };
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

const { port, outDir } = parseArgs(process.argv.slice(2));
const manifestPath = resolve(outDir, "csp-manifest.json");

if (!existsSync(manifestPath)) {
  console.error(
    'serve-export-with-csp FAILED: Missing "out/csp-manifest.json". Run "pnpm csp:hashes" first.'
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
    return candidate;
  }

  const indexCandidate = resolve(candidate, "index.html");
  if (
    indexCandidate.startsWith(outDir + sep) &&
    existsSync(indexCandidate) &&
    statSync(indexCandidate).isFile()
  ) {
    return indexCandidate;
  }

  const htmlCandidate = `${candidate}.html`;
  if (
    htmlCandidate.startsWith(outDir + sep) &&
    existsSync(htmlCandidate) &&
    statSync(htmlCandidate).isFile()
  ) {
    return htmlCandidate;
  }

  return null;
}

function getRouteKeyForHtmlFile(absPath) {
  const rel = absPath.slice(outDir.length + 1).replace(/\\/g, "/");
  if (rel === "index.html") {
    return "/";
  }
  if (rel.endsWith("/index.html")) {
    return `/${rel.slice(0, -"index.html".length)}`;
  }
  return `/${rel}`;
}

const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url ?? "/", `http://127.0.0.1:${port}`);
  let targetFile = resolveStaticTarget(reqUrl.pathname);
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

  if (ext === ".html") {
    const routeKey = getRouteKeyForHtmlFile(targetFile);
    const routeCsp = manifest.routes[routeKey]?.csp ?? manifest.aggregateCsp;
    headers["Content-Security-Policy"] = routeCsp;
    headers["Cache-Control"] = "public, max-age=0, must-revalidate";
  } else if (reqUrl.pathname.startsWith("/_next/static/")) {
    headers["Cache-Control"] = "public, max-age=31536000, immutable";
  } else {
    headers["Cache-Control"] = "public, max-age=3600";
  }

  res.writeHead(statusCode, headers);
  res.end(readFileSync(targetFile));
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Static export + CSP server listening on http://127.0.0.1:${port}`);
});

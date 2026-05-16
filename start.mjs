import { serve } from "srvx/node";
import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

if (!existsSync(resolve(__dirname, "dist/server/server.js"))) {
  console.error("Build not found. Run 'npm run build' first.");
  process.exit(1);
}

const { default: server } = await import("./dist/server/server.js");

const PORT = parseInt(process.env.PORT || "8085", 10);
const HOST = process.env.HOST || "0.0.0.0";
const CLIENT_DIR = resolve(__dirname, "dist/client");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
  ".map": "application/json",
};

function getMimeType(path) {
  return MIME_TYPES[extname(path)] || "application/octet-stream";
}

async function fetchHandler(request) {
  const url = new URL(request.url, "http://localhost");
  const method = request.method;

  if (url.pathname === "/proxy-1c") {
    const encoded = url.searchParams.get("target");
    if (!encoded) return new Response("Missing target", { status: 400 });

    let targetBase;
    try {
      targetBase = decodeURIComponent(encoded);
    } catch {
      return new Response("Invalid target", { status: 400 });
    }

    const path = url.searchParams.get("path") ?? "/";
    const targetUrl = targetBase.replace(/\/$/, "") + path;

    const headers = new Headers(request.headers);
    headers.delete("host");
    headers.delete("connection");

    try {
      const proxyRes = await fetch(targetUrl, {
        method: request.method,
        headers,
        body: request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined,
      });
      return new Response(proxyRes.body, {
        status: proxyRes.status,
        headers: proxyRes.headers,
      });
    } catch {
      return new Response("Proxy error", { status: 502 });
    }
  }

  // Serve static files from dist/client for GET/HEAD
  if (method === "GET" || method === "HEAD") {
    const filePath = resolve(CLIENT_DIR, url.pathname.slice(1));
    if (existsSync(filePath) && statSync(filePath).isFile()) {
      const content = readFileSync(filePath);
      return new Response(content, {
        status: 200,
        headers: { "Content-Type": getMimeType(filePath) },
      });
    }
  }

  return server.fetch(request);
}

console.log("Starting server with config:");
console.log(`  PORT:         ${PORT}`);
console.log(`  HOST:         ${HOST}`);
console.log(`  APPSERVER_URL: ${process.env.APPSERVER_URL || "http://127.0.0.1:8000 (default)"}`);
console.log(`  CLIENT_DIR:   ${CLIENT_DIR}`);

serve({ fetch: fetchHandler, port: PORT, hostname: HOST }).ready().then(
  () => console.log(`\nServer listening on http://${HOST}:${PORT}`),
);

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});

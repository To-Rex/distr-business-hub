import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { type Plugin } from "vite";
import http from "node:http";
import https from "node:https";

function dynamicProxy(): Plugin {
  return {
    name: "dynamic-proxy",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith("/proxy-1c")) return next();

        const urlObj = new URL(req.url, "http://localhost");
        const encoded = urlObj.searchParams.get("target");
        if (!encoded) {
          res.statusCode = 400;
          res.end("Missing target");
          return;
        }

        let targetBase: string;
        try {
          targetBase = decodeURIComponent(encoded);
        } catch {
          res.statusCode = 400;
          res.end("Invalid target encoding");
          return;
        }

        const targetPath = urlObj.searchParams.get("path") ?? "/";
        const fullTarget = targetBase.replace(/\/$/, "") + targetPath;

        const headers: Record<string, string> = { ...(req.headers as Record<string, string>) };
        delete headers.host;
        delete headers.connection;

        const requestModule = fullTarget.startsWith("https") ? https : http;
        const proxyReq = requestModule.request(
          fullTarget,
          { method: req.method, headers },
          (proxyRes) => {
            res.writeHead(proxyRes.statusCode!, proxyRes.headers as Record<string, string | string[]>);
            proxyRes.pipe(res);
          },
        );
        proxyReq.on("error", () => {
          res.statusCode = 502;
          res.end("Proxy error");
        });
        req.pipe(proxyReq);
      });
    },
  };
}

export default defineConfig({
  vite: {
    plugins: [dynamicProxy()],
  },
} as any);

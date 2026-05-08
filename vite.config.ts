import { defineConfig, loadEnv } from "vite";
import { type PluginOption } from "vite";
import http from "node:http";
import https from "node:https";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";

function dynamicProxy(): PluginOption {
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

export default defineConfig(async ({ mode }) => {
  const internalPlugins: PluginOption[] = [];

  internalPlugins.push(tailwindcss());
  internalPlugins.push(tsConfigPaths({ projects: ["./tsconfig.json"] }));

  internalPlugins.push(
    tanstackStart({
      importProtection: {
        behavior: "error",
        client: {
          files: ["/server/"],
          specifiers: ["server-only"],
        },
      },
    }),
  );

  internalPlugins.push(viteReact());
  internalPlugins.push(dynamicProxy());

  const loadedEnv = loadEnv(mode, process.cwd(), "VITE_");
  const envDefine: Record<string, string> = {};
  for (const [key, value] of Object.entries(loadedEnv)) {
    envDefine[`import.meta.env.${key}`] = JSON.stringify(value);
  }

  return {
    base: "/",
    define: envDefine,
    resolve: {
      alias: {
        "@": `${process.cwd()}/src`,
      },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    plugins: internalPlugins,
    server: {
      host: "::",
      port: 8085,
      // Fix for development mode
      allowedHosts: ["distr.mxsoft.uz"],
      watch: {
        awaitWriteFinish: {
          stabilityThreshold: 1000,
          pollInterval: 100,
        },
      },
    },
    preview: {
      host: "::",
      port: 8085,
      // Fix for production (npm run preview) mode
      allowedHosts: ["distr.mxsoft.uz"],
    },
  };
});
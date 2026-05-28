import { c as createStartHandler, d as defaultStreamHandler } from "./assets/tanstack-vendor-DVJasku3.js";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
import "seroval";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
const LOOPS_HEADER = "x-appstore-proxy";
const APPSERVER_URL = process.env.APPSERVER_URL || process.env.APPSTORE_API_URL || "http://127.0.0.1:8000";
const startFetch = createStartHandler(defaultStreamHandler);
function isAppStorePath(urlString) {
  try {
    return new URL(urlString, "http://localhost").pathname.startsWith(
      "/appstore/"
    );
  } catch {
    return urlString.startsWith("/appstore/");
  }
}
async function proxyAppStore(request) {
  const url = new URL(request.url, "http://localhost");
  const targetUrl = `${APPSERVER_URL}${url.pathname}${url.search}`;
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.set(LOOPS_HEADER, "1");
  try {
    const proxyRes = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: request.method !== "GET" && request.method !== "HEAD" && request.body ? request.body : null,
      redirect: "manual"
    });
    return new Response(proxyRes.body, {
      status: proxyRes.status,
      statusText: proxyRes.statusText,
      headers: proxyRes.headers
    });
  } catch (err) {
    console.error(
      `[appstore-proxy] Failed to proxy to ${targetUrl}: ${err instanceof Error ? err.message : err}`
    );
    return new Response(
      `AppStore proxy error: target ${APPSERVER_URL} unreachable. Set APPSERVER_URL env var to the backend's internal address (e.g. http://127.0.0.1:8000).`,
      { status: 502 }
    );
  }
}
async function appHandler(request, ...args) {
  if (request.headers.get(LOOPS_HEADER)) {
    console.error(
      `[appstore-proxy] Loop detected: request already proxied. Check APPSERVER_URL configuration.`
    );
    return new Response(
      `AppStore proxy loop: APPSERVER_URL must point to the backend server (not the frontend). Set APPSERVER_URL env var (e.g. http://127.0.0.1:8000).`,
      { status: 502 }
    );
  }
  if (isAppStorePath(request.url)) {
    return proxyAppStore(request);
  }
  return startFetch(request, ...args);
}
function createServerEntry(entry) {
  return {
    async fetch(...args) {
      return await entry.fetch(...args);
    }
  };
}
const server = createServerEntry({ fetch: appHandler });
export {
  createServerEntry,
  server as default
};

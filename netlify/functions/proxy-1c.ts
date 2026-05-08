export default async (req: Request) => {
  const url = new URL(req.url);
  const encoded = url.searchParams.get("target");
  if (!encoded) {
    return new Response("Missing target", { status: 400 });
  }

  let targetBase: string;
  try {
    targetBase = decodeURIComponent(encoded);
  } catch {
    return new Response("Invalid target", { status: 400 });
  }

  const path = url.searchParams.get("path") ?? "/";
  const targetUrl = targetBase.replace(/\/$/, "") + path;

  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("connection");

  
  try {
    const proxyRes = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
    });

    const resHeaders = new Headers(proxyRes.headers);
    resHeaders.delete("content-encoding");

    return new Response(proxyRes.body, {
      status: proxyRes.status,
      headers: resHeaders,
    });
  } catch {
    return new Response("Proxy error", { status: 502 });
  }
};

export const config = {
  path: "/proxy-1c",
};

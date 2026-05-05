export default async function handler(request, context) {
  const { default: server } = await import("../../dist/server/server.js");

  const url = new URL(request.url);
  url.protocol = "https:";

  const normalizedRequest = new Request(url.toString(), {
    method: request.method,
    headers: request.headers,
    body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
  });

  try {
    const response = await server.fetch(normalizedRequest);
    return response;
  } catch (error) {
    return new Response(`Internal Server Error: ${error.message}`, {
      status: 500,
    });
  }
}

export const config = {
  path: "/*",
  excludedPath: ["/assets/*", "/logo.svg", "/logo.png", "/favicon.ico"],
};

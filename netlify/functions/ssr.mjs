import server from "../../dist/server/index.js";

export default async (req, context) => {
  return server.fetch(req);
};

export const config = {
  path: "/*",
};

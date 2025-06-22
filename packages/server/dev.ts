// import dist from "./dist/index.html";
import { serve } from "bun";
import hono from "./api";
import html from "./src/index.html";
import { isProd } from "env";
import W3UpClient from "./api/lib/utils/w3up-client";

// Initialize W3UpClient
W3UpClient.getInstance().catch((error) => {
  console.error("Failed to initialize W3UpClient:", error);
  process.exit(1);
});

// Start the server
const server = serve({
  development: !isProd ? {
    hmr: true,
    console: true,
  } : false,
  idleTimeout: 30,
  port: 3000,
  routes: {
    "/api": new Response(JSON.stringify({
      message: "Bun Server",
      version: "v1.0.0",
    })),
    // CATCHES ONLY GET REQUESTS
    "/api/v1/*": (req) => {
      return hono.fetch(req);
    },
    // "/*": isProd ? dist : html,
    "/*": html,
  },

  fetch(req) {
    // CATCHES ALL OTHER METHODS
    if (req.url.includes("/api/v1")) {
      return hono.fetch(req);
    }
    return new Response("Not Found", { status: 404 });
  },

  error(error) {
    console.error(error);
    return new Response(`Internal Error: ${error.message}`, { status: 500 });
  },
});

!isProd && console.log(`Server running at ${server.url} 🚀`);
isProd && console.log(`BUN VERSION: ${Bun.version}`);
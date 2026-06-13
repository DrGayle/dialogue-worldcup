import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// Dev-only shim: serve the Vercel serverless function (api/propose-team.js)
// from Vite's dev server so plain `npm run dev` exercises the full flow without
// needing `vercel dev` or a Vercel account. In production, Vercel runs the same
// function directly and this plugin is not involved.
function devApiPlugin() {
  return {
    name: "dev-api",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Route POST /api/<name> to api/<name>.js (Vercel-style functions).
        const match = req.url?.match(/^\/api\/([a-z0-9-]+)(?:\?|$)/i);
        if (!match || req.method !== "POST") return next();
        const fn = match[1];

        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", async () => {
          // Minimal (req, res) shim matching the Vercel Node function contract.
          const shimReq = { method: req.method, headers: req.headers, body };
          const shimRes = {
            statusCode: 200,
            setHeader: (k, v) => res.setHeader(k, v),
            status(code) {
              this.statusCode = code;
              res.statusCode = code;
              return this;
            },
            json(obj) {
              res.setHeader("Content-Type", "application/json");
              res.statusCode = this.statusCode;
              res.end(JSON.stringify(obj));
            },
          };
          try {
            const mod = await server.ssrLoadModule(`/api/${fn}.js`);
            await mod.default(shimReq, shimRes);
          } catch (e) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: e?.message ?? "Dev API error" }));
          }
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Load .env (all keys, not just VITE_*) and expose ANTHROPIC_API_KEY to the
  // function's process.env during dev. VITE_* vars reach the client via Vite.
  const env = loadEnv(mode, process.cwd(), "");
  if (env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    process.env.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY;
  }

  return {
    plugins: [react(), devApiPlugin()],
  };
});

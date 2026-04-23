import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { execFileSync } from "child_process";
import crypto from "crypto";
import type { Plugin, Connect } from "vite";
import type { IncomingMessage, ServerResponse } from "http";

const DB_URL = process.env.DATABASE_URL!;

function dbQuery(sql: string): Record<string, unknown>[] {
  if (!DB_URL) return [];
  try {
    const wrapped = `SELECT json_agg(row_to_json(t)) AS result FROM (${sql}) t`;
    const out = execFileSync("psql", [DB_URL, "-t", "-A", "-c", wrapped], {
      encoding: "utf8", timeout: 8000,
    }).trim();
    if (!out || out === "null") return [];
    return JSON.parse(out) as Record<string, unknown>[];
  } catch { return []; }
}

function dbExec(sql: string): void {
  if (!DB_URL) return;
  try {
    execFileSync("psql", [DB_URL, "-t", "-A", "-c", sql], {
      encoding: "utf8", timeout: 8000,
    });
  } catch {}
}

function uid(req: IncomingMessage) {
  return (req.headers["x-user-id"] as string) || null;
}

function genId(prefix = "") { return prefix + crypto.randomBytes(8).toString("hex"); }
function genKey() { return "astro_live_" + crypto.randomBytes(20).toString("hex"); }

function sqlStr(v: unknown): string {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number" || typeof v === "bigint") return String(v);
  if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
  return `'${String(v).replace(/'/g, "''")}'`;
}

function interpolate(sql: string, params: unknown[]): string {
  let i = 0;
  return sql.replace(/\$\d+/g, () => sqlStr(params[i++]));
}

function jsonResp(res: ServerResponse, data: unknown, status = 200) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

type Req = IncomingMessage & { body?: unknown };

const ROUTES: Array<{ method: string; pattern: RegExp; handler: (req: Req, res: ServerResponse, m: RegExpMatchArray) => void }> = [
  {
    method: "GET", pattern: /^\/api\/resources$/,
    handler(req, res) {
      const u = uid(req); if (!u) return jsonResp(res, { error: "Unauthorized" }, 401);
      const rows = dbQuery(interpolate(`SELECT id,name,endpoint,description,price_lamports,price_token,status,category,network,requests,revenue_lamports,created_at,updated_at,metadata FROM resources WHERE user_id = $1 ORDER BY created_at DESC`, [u]));
      jsonResp(res, rows);
    },
  },
  {
    method: "POST", pattern: /^\/api\/resources$/,
    handler(req, res) {
      const u = uid(req); if (!u) return jsonResp(res, { error: "Unauthorized" }, 401);
      const b = req.body as Record<string, unknown>;
      const id = (b.id as string) || genId("r_");
      const now = new Date().toISOString();
      const meta = b.metadata ? JSON.stringify(b.metadata) : "{}";
      dbExec(interpolate(
        `INSERT INTO resources (id,user_id,name,endpoint,description,price_lamports,price_token,status,category,network,created_at,updated_at,metadata) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) ON CONFLICT (id) DO UPDATE SET name=$3,endpoint=$4,description=$5,price_lamports=$6,price_token=$7,status=$8,category=$9,network=$10,updated_at=$12,metadata=$13`,
        [id,u,b.name??"Untitled",b.endpoint??"",b.description??"",Number(b.price_lamports??0),b.price_token??"SOL",b.status??"active",b.category??"api",b.network??"mainnet",now,now,meta]
      ));
      const rows = dbQuery(interpolate(`SELECT * FROM resources WHERE id = $1`, [id]));
      jsonResp(res, rows[0] ?? {}, 201);
    },
  },
  {
    method: "PATCH", pattern: /^\/api\/resources\/([^/]+)$/,
    handler(req, res, m) {
      const u = uid(req); if (!u) return jsonResp(res, { error: "Unauthorized" }, 401);
      const id = m[1];
      const b = req.body as Record<string, unknown>;
      const allowed = ["name","endpoint","description","price_lamports","price_token","status","category","requests","revenue_lamports"];
      const sets: string[] = []; const vals: unknown[] = []; let idx = 1;
      for (const key of allowed) { if (key in b) { sets.push(`${key} = $${idx++}`); vals.push(b[key]); } }
      if ("metadata" in b) { sets.push(`metadata = $${idx++}`); vals.push(JSON.stringify(b.metadata)); }
      if (sets.length === 0) return jsonResp(res, { ok: true });
      sets.push(`updated_at = $${idx++}`); vals.push(new Date().toISOString());
      vals.push(id); vals.push(u);
      dbExec(interpolate(`UPDATE resources SET ${sets.join(",")} WHERE id = $${idx++} AND user_id = $${idx}`, vals));
      const rows = dbQuery(interpolate(`SELECT * FROM resources WHERE id = $1`, [id]));
      jsonResp(res, rows[0] ?? {});
    },
  },
  {
    method: "DELETE", pattern: /^\/api\/resources\/([^/]+)$/,
    handler(req, res, m) {
      const u = uid(req); if (!u) return jsonResp(res, { error: "Unauthorized" }, 401);
      dbExec(interpolate(`DELETE FROM resources WHERE id = $1 AND user_id = $2`, [m[1], u]));
      jsonResp(res, { ok: true });
    },
  },
  {
    method: "GET", pattern: /^\/api\/api-keys$/,
    handler(req, res) {
      const u = uid(req); if (!u) return jsonResp(res, { error: "Unauthorized" }, 401);
      let rows = dbQuery(interpolate(`SELECT * FROM api_keys WHERE user_id = $1`, [u]));
      if (rows.length === 0) {
        const id = genId("ak_"); const key = genKey(); const now = new Date().toISOString();
        dbExec(interpolate(`INSERT INTO api_keys (id,user_id,key_value,created_at) VALUES ($1,$2,$3,$4)`, [id,u,key,now]));
        rows = dbQuery(interpolate(`SELECT * FROM api_keys WHERE user_id = $1`, [u]));
      }
      jsonResp(res, rows[0] ?? {});
    },
  },
  {
    method: "GET", pattern: /^\/api\/payments$/,
    handler(req, res) {
      const u = uid(req); if (!u) return jsonResp(res, { error: "Unauthorized" }, 401);
      const rows = dbQuery(interpolate(`SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100`, [u]));
      jsonResp(res, rows);
    },
  },
  {
    method: "POST", pattern: /^\/api\/payments$/,
    handler(req, res) {
      const u = uid(req); if (!u) return jsonResp(res, { error: "Unauthorized" }, 401);
      const b = (req as Req).body ?? {};
      const id = genId("pay_"); const now = new Date().toISOString();
      const resource_id = b.resource_id ?? null;
      const resource_name = b.resource_name ?? "Unknown";
      const amount_lamports = Number(b.amount_lamports) || 0;
      const token = b.token ?? "USDC";
      const payer_wallet = b.payer_wallet ?? "";
      const tx_signature = b.tx_signature ?? "";
      const status = b.status ?? "settled";
      dbExec(interpolate(
        `INSERT INTO payments (id,user_id,resource_id,resource_name,amount_lamports,token,payer_wallet,tx_signature,status,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [id,u,resource_id,resource_name,amount_lamports,token,payer_wallet,tx_signature,status,now]
      ));
      if (resource_id) {
        dbExec(interpolate(
          `UPDATE resources SET requests = requests + 1, revenue_lamports = revenue_lamports + $1 WHERE id = $2 AND user_id = $3`,
          [amount_lamports, resource_id, u]
        ));
      }
      const rows = dbQuery(interpolate(`SELECT * FROM payments WHERE id = $1`, [id]));
      jsonResp(res, rows[0] ?? {}, 201);
    },
  },
  {
    method: "GET", pattern: /^\/api\/stats$/,
    handler(req, res) {
      const u = uid(req); if (!u) return jsonResp(res, { error: "Unauthorized" }, 401);
      const r = dbQuery(interpolate(`SELECT COUNT(*) FILTER (WHERE status='active') AS active_resources,COUNT(*) AS total_resources,COALESCE(SUM(requests),0) AS total_requests,COALESCE(SUM(revenue_lamports),0) AS total_revenue_lamports FROM resources WHERE user_id=$1`,[u]));
      const p = dbQuery(interpolate(`SELECT COUNT(*) FILTER (WHERE status='settled') AS settled_count,COUNT(*) FILTER (WHERE status='pending') AS pending_count,COUNT(*) FILTER (WHERE status='failed') AS failed_count,COALESCE(SUM(amount_lamports) FILTER (WHERE status='settled'),0) AS total_settled_lamports FROM payments WHERE user_id=$1`,[u]));
      jsonResp(res, { resources: r[0]??{}, payments: p[0]??{} });
    },
  },
];

function apiMiddleware(): Plugin {
  return {
    name: "astro-api",
    configureServer(server) {
      server.middlewares.use(async (req: Connect.IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
        const url = req.url?.split("?")[0] ?? "";
        if (!url.startsWith("/api/")) return next();

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type,X-User-Id");

        if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

        const chunks: Buffer[] = [];
        req.on("data", (c: Buffer) => chunks.push(c));
        await new Promise<void>((resolve) => req.on("end", resolve));
        const bodyRaw = Buffer.concat(chunks).toString("utf8");
        const reqWithBody = req as Req;
        if (bodyRaw) { try { reqWithBody.body = JSON.parse(bodyRaw); } catch { reqWithBody.body = {}; } }

        const method = req.method?.toUpperCase() ?? "GET";
        let handled = false;
        for (const route of ROUTES) {
          if (route.method !== method) continue;
          const m = url.match(route.pattern);
          if (m) {
            try { route.handler(reqWithBody, res, m); } catch (e) {
              const msg = e instanceof Error ? e.message : "Internal error";
              console.error("[API]", method, url, msg);
              jsonResp(res, { error: msg }, 500);
            }
            handled = true;
            break;
          }
        }
        if (!handled) next();
      });
    },
  };
}

export default defineConfig({
  plugins: [
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    apiMiddleware(),
  ],
  resolve: {
    alias: {
      "@": `${process.cwd()}/src`,
      "react": `${process.cwd()}/node_modules/react`,
      "react-dom": `${process.cwd()}/node_modules/react-dom`,
      "react/jsx-runtime": `${process.cwd()}/node_modules/react/jsx-runtime.js`,
      "react/jsx-dev-runtime": `${process.cwd()}/node_modules/react/jsx-dev-runtime.js`,
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
      "@privy-io/react-auth",
      "zustand",
    ],
  },
  server: {
    host: "0.0.0.0",
    port: 5000,
    strictPort: true,
    allowedHosts: true,
    watch: {
      ignored: [
        "**/.local/share/pnpm/**",
        "**/node_modules/.pnpm/**",
        "**/node_modules/.cache/**",
      ],
    },
  },
});

import type { IncomingMessage, ServerResponse } from "http";
import { query, exec, generateId, generateApiKey } from "./db.js";

type Handler = (
  req: IncomingMessage & { body?: unknown },
  res: ServerResponse,
  match: RegExpMatchArray
) => void;

function json(res: ServerResponse, data: unknown, status = 200) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function err(res: ServerResponse, message: string, status = 400) {
  json(res, { error: message }, status);
}

function userId(req: IncomingMessage): string | null {
  return (req.headers["x-user-id"] as string) || null;
}

const ROUTES: Array<{ method: string; pattern: RegExp; handler: Handler }> = [
  {
    method: "GET",
    pattern: /^\/api\/resources$/,
    handler(req, res) {
      const uid = userId(req);
      if (!uid) return err(res, "Unauthorized", 401);
      const result = query(
        `SELECT id, name, endpoint, description, price_lamports, price_token, status, category, network, requests, revenue_lamports, created_at, updated_at, metadata FROM resources WHERE user_id = $1 ORDER BY created_at DESC`,
        [uid]
      );
      json(res, result.rows);
    },
  },

  {
    method: "POST",
    pattern: /^\/api\/resources$/,
    handler(req, res) {
      const uid = userId(req);
      if (!uid) return err(res, "Unauthorized", 401);
      const b = req.body as Record<string, unknown>;
      const id = (b.id as string) || generateId("r_");
      const now = new Date().toISOString();
      const meta = b.metadata ? JSON.stringify(b.metadata) : "{}";
      exec(
        `INSERT INTO resources (id, user_id, name, endpoint, description, price_lamports, price_token, status, category, network, created_at, updated_at, metadata)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         ON CONFLICT (id) DO UPDATE SET name=$3, endpoint=$4, description=$5, price_lamports=$6, price_token=$7, status=$8, category=$9, network=$10, updated_at=$12, metadata=$13`,
        [
          id, uid,
          b.name ?? "Untitled",
          b.endpoint ?? "",
          b.description ?? "",
          Number(b.price_lamports ?? 0),
          b.price_token ?? "SOL",
          b.status ?? "active",
          b.category ?? "api",
          b.network ?? "mainnet",
          now, now, meta,
        ]
      );
      const result = query(`SELECT * FROM resources WHERE id = $1`, [id]);
      json(res, result.rows[0], 201);
    },
  },

  {
    method: "PATCH",
    pattern: /^\/api\/resources\/([^/]+)$/,
    handler(req, res, match) {
      const uid = userId(req);
      if (!uid) return err(res, "Unauthorized", 401);
      const id = match[1];
      const b = req.body as Record<string, unknown>;
      const allowed = ["name", "endpoint", "description", "price_lamports", "price_token", "status", "category", "requests", "revenue_lamports"];
      const sets: string[] = [];
      const vals: unknown[] = [];
      let idx = 1;
      for (const key of allowed) {
        if (key in b) {
          sets.push(`${key} = $${idx++}`);
          vals.push(b[key]);
        }
      }
      if ("metadata" in b) {
        sets.push(`metadata = $${idx++}`);
        vals.push(JSON.stringify(b.metadata));
      }
      if (sets.length === 0) return json(res, { ok: true });
      sets.push(`updated_at = $${idx++}`);
      vals.push(new Date().toISOString());
      vals.push(id);
      vals.push(uid);
      exec(
        `UPDATE resources SET ${sets.join(", ")} WHERE id = $${idx++} AND user_id = $${idx}`,
        vals
      );
      const result = query(`SELECT * FROM resources WHERE id = $1`, [id]);
      json(res, result.rows[0] ?? { error: "not found" });
    },
  },

  {
    method: "DELETE",
    pattern: /^\/api\/resources\/([^/]+)$/,
    handler(req, res, match) {
      const uid = userId(req);
      if (!uid) return err(res, "Unauthorized", 401);
      const id = match[1];
      exec(`DELETE FROM resources WHERE id = $1 AND user_id = $2`, [id, uid]);
      json(res, { ok: true });
    },
  },

  {
    method: "GET",
    pattern: /^\/api\/api-keys$/,
    handler(req, res) {
      const uid = userId(req);
      if (!uid) return err(res, "Unauthorized", 401);
      let result = query(`SELECT * FROM api_keys WHERE user_id = $1`, [uid]);
      if (result.rows.length === 0) {
        const id = generateId("ak_");
        const key = generateApiKey();
        exec(
          `INSERT INTO api_keys (id, user_id, key_value, created_at) VALUES ($1,$2,$3,$4)`,
          [id, uid, key, new Date().toISOString()]
        );
        result = query(`SELECT * FROM api_keys WHERE user_id = $1`, [uid]);
      }
      json(res, result.rows[0]);
    },
  },

  {
    method: "GET",
    pattern: /^\/api\/payments$/,
    handler(req, res) {
      const uid = userId(req);
      if (!uid) return err(res, "Unauthorized", 401);
      const result = query(
        `SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100`,
        [uid]
      );
      json(res, result.rows);
    },
  },

  {
    method: "GET",
    pattern: /^\/api\/stats$/,
    handler(req, res) {
      const uid = userId(req);
      if (!uid) return err(res, "Unauthorized", 401);
      const resources = query(
        `SELECT
          COUNT(*) FILTER (WHERE status = 'active') AS active_resources,
          COUNT(*) AS total_resources,
          COALESCE(SUM(requests), 0) AS total_requests,
          COALESCE(SUM(revenue_lamports), 0) AS total_revenue_lamports
         FROM resources WHERE user_id = $1`,
        [uid]
      );
      const payments = query(
        `SELECT
          COUNT(*) FILTER (WHERE status = 'settled') AS settled_count,
          COUNT(*) FILTER (WHERE status = 'pending') AS pending_count,
          COUNT(*) FILTER (WHERE status = 'failed') AS failed_count,
          COALESCE(SUM(amount_lamports) FILTER (WHERE status = 'settled'), 0) AS total_settled_lamports
         FROM payments WHERE user_id = $1`,
        [uid]
      );
      json(res, {
        resources: resources.rows[0] ?? {},
        payments: payments.rows[0] ?? {},
      });
    },
  },
];

export function handleApiRequest(
  req: IncomingMessage & { body?: unknown },
  res: ServerResponse
): boolean {
  const url = req.url?.split("?")[0] ?? "";
  const method = req.method?.toUpperCase() ?? "GET";

  if (!url.startsWith("/api/")) return false;

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,X-User-Id");

  if (method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return true;
  }

  for (const route of ROUTES) {
    if (route.method !== method) continue;
    const match = url.match(route.pattern);
    if (match) {
      try {
        route.handler(req, res, match);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Internal error";
        console.error("[API]", method, url, msg);
        json(res, { error: msg }, 500);
      }
      return true;
    }
  }
  return false;
}

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { execFileSync } from "child_process";
import crypto from "crypto";
import type { Plugin, Connect } from "vite";
import type { IncomingMessage, ServerResponse } from "http";

const CONNECTORS_HOST = process.env.REPLIT_CONNECTORS_HOSTNAME ?? "";
const REPL_TOKEN = process.env.REPL_IDENTITY
  ? `repl ${process.env.REPL_IDENTITY}`
  : process.env.WEB_REPL_RENEWAL
  ? `depl ${process.env.WEB_REPL_RENEWAL}`
  : null;

async function getResendClient(): Promise<{ apiKey: string; fromEmail: string } | null> {
  if (!CONNECTORS_HOST || !REPL_TOKEN) return null;
  try {
    const data = await (globalThis.fetch as typeof fetch)(
      `https://${CONNECTORS_HOST}/api/v2/connection?include_secrets=true&connector_names=resend`,
      { headers: { Accept: "application/json", "X-Replit-Token": REPL_TOKEN } }
    ).then((r) => r.json());
    const item = data?.items?.[0];
    if (!item?.settings?.api_key) return null;
    return { apiKey: item.settings.api_key, fromEmail: item.settings.from_email ?? "alerts@astro-x402.app" };
  } catch { return null; }
}

async function sendAlertEmail(toEmail: string, subject: string, html: string): Promise<void> {
  const creds = await getResendClient();
  if (!creds) return;
  try {
    await (globalThis.fetch as typeof fetch)("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${creds.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: creds.fromEmail, to: [toEmail], subject, html }),
    });
  } catch {}
}

type SseClient = { res: ServerResponse; userId: string };
const sseClients: SseClient[] = [];

function broadcastPayment(userId: string, payment: Record<string, unknown>) {
  const data = JSON.stringify({ type: "payment", payment });
  const dead: number[] = [];
  sseClients.forEach((c, i) => {
    if (c.userId !== userId) return;
    try { c.res.write(`data: ${data}\n\n`); }
    catch { dead.push(i); }
  });
  dead.reverse().forEach((i) => sseClients.splice(i, 1));
}

async function checkAndFireAlerts(userId: string, payment: Record<string, unknown>) {
  const alerts = dbQuery(interpolate(`SELECT * FROM alerts WHERE user_id=$1 AND is_active=TRUE`, [userId]));
  for (const alert of alerts) {
    const type = String(alert.alert_type ?? "");
    const threshold = Number(alert.threshold ?? 0);
    const token = String(alert.token ?? "USDC");
    const email = String(alert.email ?? "");
    if (!email) continue;
    let triggered = false;
    let subject = "";
    let html = "";

    if (type === "revenue_threshold") {
      if (String(payment.token) !== token) continue;
      const row = dbQuery(interpolate(
        `SELECT COALESCE(SUM(amount_lamports),0) AS total FROM payments WHERE user_id=$1 AND token=$2 AND status='settled' AND created_at >= NOW() - INTERVAL '1 day'`,
        [userId, token]
      ));
      const total = Number(row[0]?.total ?? 0);
      const divisor = token === "SOL" ? 1e9 : 1e6;
      if (total >= threshold * divisor) {
        triggered = true;
        subject = `Astro x402 — Revenue threshold reached (${token})`;
        html = `<p>Your daily <strong>${token}</strong> revenue has crossed <strong>${threshold} ${token}</strong>.</p><p>Current 24h total: <strong>${(total / divisor).toFixed(token === "SOL" ? 6 : 2)} ${token}</strong></p><p><a href="https://astro-x402.replit.app/dashboard">View dashboard →</a></p>`;
      }
    } else if (type === "new_payer") {
      const wallet = String(payment.payer_wallet ?? "");
      if (!wallet) continue;
      const prev = dbQuery(interpolate(
        `SELECT COUNT(*) AS cnt FROM payments WHERE user_id=$1 AND payer_wallet=$2 AND id != $3`,
        [userId, wallet, payment.id]
      ));
      if (Number(prev[0]?.cnt ?? 1) === 0) {
        triggered = true;
        subject = `Astro x402 — New payer detected`;
        html = `<p>A new wallet just made their first payment on your API:</p><p><code>${wallet}</code></p><p>Amount: <strong>${Number(payment.amount_lamports) / (String(payment.token) === "SOL" ? 1e9 : 1e6)} ${payment.token}</strong></p><p><a href="https://astro-x402.replit.app/dashboard">View dashboard →</a></p>`;
      }
    } else if (type === "payment_count") {
      const row = dbQuery(interpolate(
        `SELECT COUNT(*) AS cnt FROM payments WHERE user_id=$1 AND status='settled' AND created_at >= NOW() - INTERVAL '1 day'`,
        [userId]
      ));
      if (Number(row[0]?.cnt ?? 0) >= threshold) {
        triggered = true;
        subject = `Astro x402 — ${threshold} payments reached today`;
        html = `<p>You've received <strong>${row[0]?.cnt}</strong> settled payments in the last 24 hours, crossing your threshold of <strong>${threshold}</strong>.</p><p><a href="https://astro-x402.replit.app/dashboard">View dashboard →</a></p>`;
      }
    }

    if (triggered) {
      dbExec(interpolate(`UPDATE alerts SET last_fired_at=NOW(), fire_count=fire_count+1 WHERE id=$1`, [alert.id]));
      sendAlertEmail(email, subject, html).catch(() => {});
    }
  }
}

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
function logEvent(userId: string, eventType: string, entityType: string, entityId: string, entityName: string, meta: Record<string, unknown> = {}) {
  try { dbExec(interpolate(`INSERT INTO events (id,user_id,event_type,entity_type,entity_id,entity_name,metadata,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())`, [genId("ev_"), userId, eventType, entityType, entityId, entityName, JSON.stringify(meta)])); } catch {}
}

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

async function deliverWebhook(wh: Record<string, unknown>, paymentId: string, paymentData: Record<string, unknown>) {
  const url = String(wh.url ?? "");
  const secret = String(wh.secret ?? "");
  const ts = Date.now().toString();
  const payload = JSON.stringify({ event: "payment.settled", created_at: new Date().toISOString(), delivery_id: genId("wd_"), data: paymentData });
  const sig = crypto.createHmac("sha256", secret).update(`${ts}.${payload}`).digest("hex");
  const deliveryId = genId("wd_");
  const start = Date.now();
  let statusCode = 0;
  let deliveryStatus = "failed";
  let errMsg = "";
  try {
    const resp = await (globalThis.fetch as typeof fetch)(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Astro-Signature": `sha256=${sig}`,
        "X-Astro-Timestamp": ts,
        "X-Astro-Event": "payment.settled",
        "X-Astro-Delivery": deliveryId,
      },
      body: payload,
      signal: AbortSignal.timeout(10000),
    });
    statusCode = resp.status;
    deliveryStatus = resp.ok ? "success" : "failed";
  } catch (e) {
    errMsg = String(e).slice(0, 200);
  }
  const dur = Date.now() - start;
  try {
    dbExec(interpolate(
      `INSERT INTO webhook_deliveries (id,webhook_id,payment_id,event_type,status,status_code,duration_ms,error,attempted_at) VALUES ($1,$2,$3,'payment.settled',$4,$5,$6,$7,NOW())`,
      [deliveryId, wh.id, paymentId, deliveryStatus, statusCode, dur, errMsg]
    ));
    if (deliveryStatus === "success") {
      dbExec(interpolate(`UPDATE webhooks SET delivery_count=delivery_count+1, last_ping_at=NOW() WHERE id=$1`, [wh.id]));
    } else {
      dbExec(interpolate(`UPDATE webhooks SET failure_count=failure_count+1 WHERE id=$1`, [wh.id]));
    }
  } catch {}
}

const ROUTES: Array<{ method: string; pattern: RegExp; handler: (req: Req, res: ServerResponse, m: RegExpMatchArray) => void | Promise<void> }> = [
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
      logEvent(u, "resource.created", "resource", id, String(b.name ?? "Untitled"), { endpoint: b.endpoint, price_lamports: b.price_lamports, token: b.price_token });
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
      const rrows = dbQuery(interpolate(`SELECT name FROM resources WHERE id=$1`, [m[1]]));
      const rname = (rrows[0]?.name as string) ?? m[1];
      dbExec(interpolate(`DELETE FROM resources WHERE id = $1 AND user_id = $2`, [m[1], u]));
      logEvent(u, "resource.deleted", "resource", m[1], rname);
      jsonResp(res, { ok: true });
    },
  },
  {
    method: "GET", pattern: /^\/api\/api-keys$/,
    handler(req, res) {
      const u = uid(req); if (!u) return jsonResp(res, { error: "Unauthorized" }, 401);
      const rows = dbQuery(interpolate(`SELECT id,user_id,label,key_value,created_at,last_used_at,expires_at,scopes,usage_count,usage_limit FROM api_keys WHERE user_id=$1 ORDER BY created_at DESC`, [u]));
      jsonResp(res, rows);
    },
  },
  {
    method: "POST", pattern: /^\/api\/api-keys$/,
    handler(req, res) {
      const u = uid(req); if (!u) return jsonResp(res, { error: "Unauthorized" }, 401);
      const b = (req as Req).body as Record<string, unknown>;
      const id = genId("ak_"); const key = genKey(); const now = new Date().toISOString();
      const label = String(b.label ?? "").trim() || "Default key";
      const scopes = JSON.stringify(Array.isArray(b.scopes) ? b.scopes : []);
      const expires_at = b.expires_at ? String(b.expires_at) : null;
      const usage_limit = Number(b.usage_limit ?? 0);
      dbExec(interpolate(`INSERT INTO api_keys (id,user_id,label,key_value,created_at,scopes,expires_at,usage_count,usage_limit) VALUES ($1,$2,$3,$4,$5,$6,$7,0,$8)`, [id, u, label, key, now, scopes, expires_at, usage_limit]));
      logEvent(u, "api_key.created", "api_key", id, label, { scopes, expires_at, usage_limit });
      const rows = dbQuery(interpolate(`SELECT * FROM api_keys WHERE id=$1`, [id]));
      jsonResp(res, rows[0] ?? {}, 201);
    },
  },
  {
    method: "DELETE", pattern: /^\/api\/api-keys\/([^/]+)$/,
    handler(req, res, m) {
      const u = uid(req); if (!u) return jsonResp(res, { error: "Unauthorized" }, 401);
      const rows = dbQuery(interpolate(`SELECT label FROM api_keys WHERE id=$1 AND user_id=$2`, [m[1], u]));
      const label = (rows[0]?.label as string) ?? m[1];
      dbExec(interpolate(`DELETE FROM api_keys WHERE id=$1 AND user_id=$2`, [m[1], u]));
      logEvent(u, "api_key.deleted", "api_key", m[1], label);
      jsonResp(res, { ok: true });
    },
  },
  {
    method: "PATCH", pattern: /^\/api\/api-keys\/([^/]+)$/,
    handler(req, res, m) {
      const u = uid(req); if (!u) return jsonResp(res, { error: "Unauthorized" }, 401);
      const b = (req as Req).body as Record<string, unknown>;
      const sets: string[] = []; const vals: unknown[] = []; let idx = 1;
      if ("label" in b) { sets.push(`label=$${idx++}`); vals.push(b.label); }
      if ("scopes" in b) { sets.push(`scopes=$${idx++}`); vals.push(JSON.stringify(b.scopes)); }
      if ("expires_at" in b) { sets.push(`expires_at=$${idx++}`); vals.push(b.expires_at); }
      if ("usage_limit" in b) { sets.push(`usage_limit=$${idx++}`); vals.push(Number(b.usage_limit)); }
      if (sets.length === 0) return jsonResp(res, { ok: true });
      vals.push(m[1]); vals.push(u);
      dbExec(interpolate(`UPDATE api_keys SET ${sets.join(",")} WHERE id=$${idx++} AND user_id=$${idx}`, vals));
      const rows = dbQuery(interpolate(`SELECT * FROM api_keys WHERE id=$1`, [m[1]]));
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
    async handler(req, res) {
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
      const paymentRow = rows[0] ?? {};
      if (String(status) === "settled") {
        logEvent(u, "payment.settled", "payment", id, String(resource_name), { amount_lamports, token, payer_wallet, tx_signature });
        const webhooks = dbQuery(interpolate(`SELECT * FROM webhooks WHERE user_id=$1 AND is_active=TRUE AND events LIKE '%payment.settled%'`, [u]));
        const paymentData = { payment_id: id, resource_id: String(resource_id ?? ""), resource_name: String(resource_name), amount_lamports, token: String(token), payer_wallet: String(payer_wallet), tx_signature: String(tx_signature), status: String(status) };
        for (const wh of webhooks) {
          deliverWebhook(wh, id, paymentData).catch(() => {});
        }
        broadcastPayment(u, paymentRow);
        checkAndFireAlerts(u, { ...paymentRow, id }).catch(() => {});
      }
      jsonResp(res, paymentRow, 201);
    },
  },
  {
    method: "GET", pattern: /^\/api\/events\/stream$/,
    handler(req, res) {
      const u = uid(req); if (!u) { res.writeHead(401); res.end(); return; }
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
      });
      res.write(": connected\n\n");
      const client: SseClient = { res, userId: u };
      sseClients.push(client);
      const heartbeat = setInterval(() => {
        try { res.write(": ping\n\n"); } catch { clearInterval(heartbeat); }
      }, 25000);
      req.on("close", () => {
        clearInterval(heartbeat);
        const idx = sseClients.indexOf(client);
        if (idx !== -1) sseClients.splice(idx, 1);
      });
    },
  },
  {
    method: "GET", pattern: /^\/api\/alerts$/,
    handler(req, res) {
      const u = uid(req); if (!u) return jsonResp(res, { error: "Unauthorized" }, 401);
      const rows = dbQuery(interpolate(`SELECT * FROM alerts WHERE user_id=$1 ORDER BY created_at DESC`, [u]));
      jsonResp(res, rows);
    },
  },
  {
    method: "POST", pattern: /^\/api\/alerts$/,
    handler(req, res) {
      const u = uid(req); if (!u) return jsonResp(res, { error: "Unauthorized" }, 401);
      const b = (req as Req).body as Record<string, unknown>;
      const id = genId("al_");
      dbExec(interpolate(
        `INSERT INTO alerts (id,user_id,alert_type,threshold,token,email,is_active,created_at) VALUES ($1,$2,$3,$4,$5,$6,TRUE,NOW())`,
        [id, u, b.alert_type ?? "revenue_threshold", Number(b.threshold ?? 0), b.token ?? "USDC", b.email ?? ""]
      ));
      const rows = dbQuery(interpolate(`SELECT * FROM alerts WHERE id=$1`, [id]));
      jsonResp(res, rows[0] ?? {}, 201);
    },
  },
  {
    method: "PATCH", pattern: /^\/api\/alerts\/([^/]+)$/,
    handler(req, res, m) {
      const u = uid(req); if (!u) return jsonResp(res, { error: "Unauthorized" }, 401);
      const b = (req as Req).body as Record<string, unknown>;
      const sets: string[] = []; const vals: unknown[] = []; let idx = 1;
      for (const k of ["alert_type","threshold","token","email","is_active"]) {
        if (k in b) { sets.push(`${k}=$${idx++}`); vals.push(b[k]); }
      }
      if (sets.length === 0) return jsonResp(res, { ok: true });
      vals.push(m[1]); vals.push(u);
      dbExec(interpolate(`UPDATE alerts SET ${sets.join(",")} WHERE id=$${idx++} AND user_id=$${idx}`, vals));
      const rows = dbQuery(interpolate(`SELECT * FROM alerts WHERE id=$1`, [m[1]]));
      jsonResp(res, rows[0] ?? {});
    },
  },
  {
    method: "DELETE", pattern: /^\/api\/alerts\/([^/]+)$/,
    handler(req, res, m) {
      const u = uid(req); if (!u) return jsonResp(res, { error: "Unauthorized" }, 401);
      dbExec(interpolate(`DELETE FROM alerts WHERE id=$1 AND user_id=$2`, [m[1], u]));
      jsonResp(res, { ok: true });
    },
  },
  {
    method: "GET", pattern: /^\/api\/blocklist$/,
    handler(req, res) {
      const u = uid(req); if (!u) return jsonResp(res, { error: "Unauthorized" }, 401);
      const urlObj = new URL(req.url ?? "/", "http://localhost");
      const resource_id = urlObj.searchParams.get("resource_id");
      if (!resource_id) return jsonResp(res, []);
      const ownerCheck = dbQuery(interpolate(`SELECT id FROM resources WHERE id=$1 AND user_id=$2`, [resource_id, u]));
      if (!ownerCheck[0]) return jsonResp(res, { error: "Not found" }, 404);
      const rows = dbQuery(interpolate(`SELECT * FROM blocklist WHERE resource_id=$1 ORDER BY created_at DESC`, [resource_id]));
      jsonResp(res, rows);
    },
  },
  {
    method: "POST", pattern: /^\/api\/blocklist$/,
    handler(req, res) {
      const u = uid(req); if (!u) return jsonResp(res, { error: "Unauthorized" }, 401);
      const b = (req as Req).body as Record<string, unknown>;
      const resource_id = String(b.resource_id ?? "");
      const wallet = String(b.wallet ?? "").trim();
      if (!resource_id || !wallet) return jsonResp(res, { error: "resource_id and wallet required" }, 400);
      const ownerCheck = dbQuery(interpolate(`SELECT id FROM resources WHERE id=$1 AND user_id=$2`, [resource_id, u]));
      if (!ownerCheck[0]) return jsonResp(res, { error: "Not found" }, 404);
      const id = genId("bl_");
      const note = String(b.note ?? "");
      dbExec(interpolate(
        `INSERT INTO blocklist (id,resource_id,user_id,wallet,note,created_at) VALUES ($1,$2,$3,$4,$5,NOW()) ON CONFLICT (resource_id,wallet) DO UPDATE SET note=$5`,
        [id, resource_id, u, wallet, note]
      ));
      const rows = dbQuery(interpolate(`SELECT * FROM blocklist WHERE resource_id=$1 AND wallet=$2`, [resource_id, wallet]));
      jsonResp(res, rows[0] ?? {}, 201);
    },
  },
  {
    method: "DELETE", pattern: /^\/api\/blocklist\/([^/]+)$/,
    handler(req, res, m) {
      const u = uid(req); if (!u) return jsonResp(res, { error: "Unauthorized" }, 401);
      dbExec(interpolate(`DELETE FROM blocklist WHERE id=$1 AND user_id=$2`, [m[1], u]));
      jsonResp(res, { ok: true });
    },
  },
  {
    method: "GET", pattern: /^\/api\/revenue$/,
    handler(req, res) {
      const u = uid(req); if (!u) return jsonResp(res, { error: "Unauthorized" }, 401);
      const by_resource = dbQuery(interpolate(`SELECT resource_id, resource_name, COUNT(*) AS tx_count, COALESCE(SUM(amount_lamports) FILTER (WHERE token='SOL'),0) AS sol_total, COALESCE(SUM(amount_lamports) FILTER (WHERE token='USDC'),0) AS usdc_total, MAX(created_at) AS last_at FROM payments WHERE user_id=$1 AND status='settled' GROUP BY resource_id,resource_name ORDER BY (sol_total+usdc_total) DESC`, [u]));
      const by_day = dbQuery(interpolate(`SELECT DATE(created_at) AS day, COALESCE(SUM(amount_lamports) FILTER (WHERE token='SOL'),0) AS sol_total, COALESCE(SUM(amount_lamports) FILTER (WHERE token='USDC'),0) AS usdc_total, COUNT(*) AS tx_count FROM payments WHERE user_id=$1 AND status='settled' AND created_at >= NOW() - INTERVAL '30 days' GROUP BY day ORDER BY day ASC`, [u]));
      const totals = dbQuery(interpolate(`SELECT COALESCE(SUM(amount_lamports) FILTER (WHERE token='SOL'),0) AS sol_total, COALESCE(SUM(amount_lamports) FILTER (WHERE token='USDC'),0) AS usdc_total, COUNT(*) AS tx_count, COUNT(DISTINCT payer_wallet) AS unique_payers FROM payments WHERE user_id=$1 AND status='settled'`, [u]));
      jsonResp(res, { by_resource, by_day, totals: totals[0] ?? {} });
    },
  },
  {
    method: "GET", pattern: /^\/api\/events$/,
    handler(req, res) {
      const u = uid(req); if (!u) return jsonResp(res, { error: "Unauthorized" }, 401);
      const rows = dbQuery(interpolate(`SELECT * FROM events WHERE user_id=$1 ORDER BY created_at DESC LIMIT 100`, [u]));
      jsonResp(res, rows);
    },
  },
  {
    method: "GET", pattern: /^\/api\/analytics$/,
    handler(req, res) {
      const u = uid(req); if (!u) return jsonResp(res, { error: "Unauthorized" }, 401);
      const payers = dbQuery(interpolate(`SELECT payer_wallet, COUNT(*) AS payment_count, COALESCE(SUM(amount_lamports) FILTER (WHERE token='SOL'),0) AS sol_total, COALESCE(SUM(amount_lamports) FILTER (WHERE token='USDC'),0) AS usdc_total, MAX(created_at) AS last_at FROM payments WHERE user_id=$1 AND status='settled' AND payer_wallet!='' GROUP BY payer_wallet ORDER BY payment_count DESC LIMIT 20`, [u]));
      const daily = dbQuery(interpolate(`SELECT DATE(created_at) AS day, COUNT(*) AS tx_count, COALESCE(SUM(amount_lamports) FILTER (WHERE token='SOL'),0) AS sol_vol, COALESCE(SUM(amount_lamports) FILTER (WHERE token='USDC'),0) AS usdc_vol FROM payments WHERE user_id=$1 AND status='settled' AND created_at >= NOW() - INTERVAL '7 days' GROUP BY day ORDER BY day ASC`, [u]));
      const tokens = dbQuery(interpolate(`SELECT token, COUNT(*) AS count, COALESCE(SUM(amount_lamports),0) AS total_lamports FROM payments WHERE user_id=$1 AND status='settled' GROUP BY token`, [u]));
      const unique_payers = dbQuery(interpolate(`SELECT COUNT(DISTINCT payer_wallet) AS count FROM payments WHERE user_id=$1 AND status='settled'`, [u]));
      jsonResp(res, { payers, daily, tokens, unique_payers: unique_payers[0] ?? { count: "0" } });
    },
  },
  {
    method: "GET", pattern: /^\/api\/webhooks$/,
    handler(req, res) {
      const u = uid(req); if (!u) return jsonResp(res, { error: "Unauthorized" }, 401);
      const rows = dbQuery(interpolate(`SELECT * FROM webhooks WHERE user_id=$1 ORDER BY created_at DESC`, [u]));
      jsonResp(res, rows);
    },
  },
  {
    method: "POST", pattern: /^\/api\/webhooks$/,
    handler(req, res) {
      const u = uid(req); if (!u) return jsonResp(res, { error: "Unauthorized" }, 401);
      const b = (req as Req).body as Record<string, unknown>;
      const id = genId("wh_"); const now = new Date().toISOString();
      const secret = "whsec_" + crypto.randomBytes(16).toString("hex");
      const url = String(b.url ?? "").trim();
      if (!url) return jsonResp(res, { error: "URL required" }, 400);
      const events = JSON.stringify(Array.isArray(b.events) ? b.events : ["payment.settled"]);
      dbExec(interpolate(`INSERT INTO webhooks (id,user_id,url,secret,events,is_active,created_at,delivery_count,failure_count) VALUES ($1,$2,$3,$4,$5,TRUE,$6,0,0)`, [id, u, url, secret, events, now]));
      logEvent(u, "webhook.created", "webhook", id, url, { events });
      const rows = dbQuery(interpolate(`SELECT * FROM webhooks WHERE id=$1`, [id]));
      jsonResp(res, rows[0] ?? {}, 201);
    },
  },
  {
    method: "PATCH", pattern: /^\/api\/webhooks\/([^/]+)$/,
    handler(req, res, m) {
      const u = uid(req); if (!u) return jsonResp(res, { error: "Unauthorized" }, 401);
      const b = (req as Req).body as Record<string, unknown>;
      const sets: string[] = []; const vals: unknown[] = []; let idx = 1;
      if ("url" in b) { sets.push(`url=$${idx++}`); vals.push(b.url); }
      if ("is_active" in b) { sets.push(`is_active=$${idx++}`); vals.push(b.is_active); }
      if ("events" in b) { sets.push(`events=$${idx++}`); vals.push(JSON.stringify(b.events)); }
      if (sets.length === 0) return jsonResp(res, { ok: true });
      vals.push(m[1]); vals.push(u);
      dbExec(interpolate(`UPDATE webhooks SET ${sets.join(",")} WHERE id=$${idx++} AND user_id=$${idx}`, vals));
      const rows = dbQuery(interpolate(`SELECT * FROM webhooks WHERE id=$1`, [m[1]]));
      jsonResp(res, rows[0] ?? {});
    },
  },
  {
    method: "DELETE", pattern: /^\/api\/webhooks\/([^/]+)$/,
    handler(req, res, m) {
      const u = uid(req); if (!u) return jsonResp(res, { error: "Unauthorized" }, 401);
      const wrows = dbQuery(interpolate(`SELECT url FROM webhooks WHERE id=$1`, [m[1]]));
      dbExec(interpolate(`DELETE FROM webhooks WHERE id=$1 AND user_id=$2`, [m[1], u]));
      logEvent(u, "webhook.deleted", "webhook", m[1], (wrows[0]?.url as string) ?? m[1]);
      jsonResp(res, { ok: true });
    },
  },
  {
    method: "POST", pattern: /^\/api\/webhooks\/([^/]+)\/ping$/,
    async handler(req, res, m) {
      const u = uid(req); if (!u) return jsonResp(res, { error: "Unauthorized" }, 401);
      const rows = dbQuery(interpolate(`SELECT * FROM webhooks WHERE id=$1 AND user_id=$2`, [m[1], u]));
      if (!rows[0]) return jsonResp(res, { error: "Not found" }, 404);
      const wh = rows[0];
      const url = String(wh.url ?? "");
      const secret = String(wh.secret ?? "");
      const ts = Date.now().toString();
      const deliveryId = genId("wd_");
      const payload = JSON.stringify({ event: "ping", created_at: new Date().toISOString(), delivery_id: deliveryId, data: { webhook_id: m[1] } });
      const sig = crypto.createHmac("sha256", secret).update(`${ts}.${payload}`).digest("hex");
      const start = Date.now();
      let statusCode = 0;
      let deliveryStatus = "failed";
      let errMsg = "";
      try {
        const resp = await (globalThis.fetch as typeof fetch)(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Astro-Signature": `sha256=${sig}`, "X-Astro-Timestamp": ts, "X-Astro-Event": "ping", "X-Astro-Delivery": deliveryId },
          body: payload,
          signal: AbortSignal.timeout(10000),
        });
        statusCode = resp.status;
        deliveryStatus = resp.ok ? "success" : "failed";
      } catch (e) {
        errMsg = String(e).slice(0, 200);
      }
      const dur = Date.now() - start;
      dbExec(interpolate(
        `INSERT INTO webhook_deliveries (id,webhook_id,payment_id,event_type,status,status_code,duration_ms,error,attempted_at) VALUES ($1,$2,NULL,'ping',$3,$4,$5,$6,NOW())`,
        [deliveryId, m[1], deliveryStatus, statusCode, dur, errMsg]
      ));
      if (deliveryStatus === "success") {
        dbExec(interpolate(`UPDATE webhooks SET delivery_count=delivery_count+1, last_ping_at=NOW() WHERE id=$1`, [m[1]]));
      } else {
        dbExec(interpolate(`UPDATE webhooks SET failure_count=failure_count+1 WHERE id=$1`, [m[1]]));
      }
      jsonResp(res, { ok: deliveryStatus === "success", status_code: statusCode, duration_ms: dur, error: errMsg || undefined, event: "ping", webhook_id: m[1] });
    },
  },
  {
    method: "GET", pattern: /^\/api\/webhook-deliveries$/,
    handler(req, res) {
      const u = uid(req); if (!u) return jsonResp(res, { error: "Unauthorized" }, 401);
      const urlObj = new URL(req.url ?? "/", "http://localhost");
      const webhookId = urlObj.searchParams.get("webhook_id");
      if (!webhookId) return jsonResp(res, []);
      const ownerRows = dbQuery(interpolate(`SELECT id FROM webhooks WHERE id=$1 AND user_id=$2`, [webhookId, u]));
      if (!ownerRows[0]) return jsonResp(res, []);
      const rows = dbQuery(interpolate(`SELECT * FROM webhook_deliveries WHERE webhook_id=$1 ORDER BY attempted_at DESC LIMIT 50`, [webhookId]));
      jsonResp(res, rows);
    },
  },
  {
    method: "GET", pattern: /^\/api\/stats$/,
    handler(req, res) {
      const u = uid(req); if (!u) return jsonResp(res, { error: "Unauthorized" }, 401);
      const r = dbQuery(interpolate(`SELECT COUNT(*) FILTER (WHERE status='active') AS active_resources,COUNT(*) AS total_resources,COALESCE(SUM(requests),0) AS total_requests,COALESCE(SUM(revenue_lamports) FILTER (WHERE price_token='SOL'),0) AS total_sol_revenue_lamports,COALESCE(SUM(revenue_lamports) FILTER (WHERE price_token='USDC'),0) AS total_usdc_revenue_lamports FROM resources WHERE user_id=$1`,[u]));
      const p = dbQuery(interpolate(`SELECT COUNT(*) FILTER (WHERE status='settled') AS settled_count,COUNT(*) FILTER (WHERE status='pending') AS pending_count,COUNT(*) FILTER (WHERE status='failed') AS failed_count,COALESCE(SUM(amount_lamports) FILTER (WHERE status='settled'),0) AS total_settled_lamports FROM payments WHERE user_id=$1`,[u]));
      jsonResp(res, { resources: r[0]??{}, payments: p[0]??{} });
    },
  },
];

function apiMiddleware(): Plugin {
  return {
    name: "astro-api",
    configureServer(server) {
      dbExec(`CREATE TABLE IF NOT EXISTS webhooks (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, url TEXT NOT NULL, secret TEXT NOT NULL DEFAULT '', events TEXT NOT NULL DEFAULT '["payment.settled"]', is_active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), last_ping_at TIMESTAMPTZ, delivery_count INTEGER NOT NULL DEFAULT 0, failure_count INTEGER NOT NULL DEFAULT 0)`);
      dbExec(`CREATE TABLE IF NOT EXISTS webhook_deliveries (id TEXT PRIMARY KEY, webhook_id TEXT NOT NULL, payment_id TEXT, event_type TEXT NOT NULL DEFAULT 'payment.settled', status TEXT NOT NULL DEFAULT 'failed', status_code INTEGER NOT NULL DEFAULT 0, duration_ms INTEGER NOT NULL DEFAULT 0, error TEXT NOT NULL DEFAULT '', attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
      dbExec(`CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook_id ON webhook_deliveries (webhook_id)`);
      dbExec(`CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, event_type TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT, entity_name TEXT, metadata JSONB DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
      dbExec(`CREATE INDEX IF NOT EXISTS idx_events_user_id ON events (user_id)`);
      dbExec(`ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS label TEXT NOT NULL DEFAULT ''`);
      dbExec(`ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ`);
      dbExec(`ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS scopes TEXT NOT NULL DEFAULT '[]'`);
      dbExec(`ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS usage_count INTEGER NOT NULL DEFAULT 0`);
      dbExec(`ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS usage_limit INTEGER NOT NULL DEFAULT 0`);
      dbExec(`ALTER TABLE api_keys DROP CONSTRAINT IF EXISTS api_keys_user_id_key`);
      dbExec(`CREATE TABLE IF NOT EXISTS alerts (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, alert_type TEXT NOT NULL DEFAULT 'revenue_threshold', threshold NUMERIC NOT NULL DEFAULT 0, token TEXT NOT NULL DEFAULT 'USDC', email TEXT NOT NULL DEFAULT '', is_active BOOLEAN NOT NULL DEFAULT TRUE, last_fired_at TIMESTAMPTZ, fire_count INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
      dbExec(`CREATE TABLE IF NOT EXISTS blocklist (id TEXT PRIMARY KEY, resource_id TEXT NOT NULL, user_id TEXT NOT NULL, wallet TEXT NOT NULL, note TEXT NOT NULL DEFAULT '', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(resource_id,wallet))`);
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
            try { await route.handler(reqWithBody, res, m); } catch (e) {
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
  define: {
    global: "globalThis",
  },
  optimizeDeps: {
    include: ["@solana/web3.js", "buffer"],
  },
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

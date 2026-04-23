import { execFileSync } from "child_process";
import crypto from "crypto";

const DB_URL = process.env.DATABASE_URL!;

export interface QueryResult {
  rows: Record<string, unknown>[];
}

export function query(sql: string, params: unknown[] = []): QueryResult {
  let finalSql = sql;
  if (params.length > 0) {
    let i = 0;
    finalSql = sql.replace(/\$\d+/g, () => {
      const val = params[i++];
      if (val === null || val === undefined) return "NULL";
      if (typeof val === "number" || typeof val === "bigint") return String(val);
      if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
      return `'${String(val).replace(/'/g, "''")}'`;
    });
  }

  const wrappedSql = `SELECT json_agg(row_to_json(t)) AS result FROM (${finalSql}) t`;
  const output = execFileSync(
    "psql",
    [DB_URL, "-t", "-A", "-c", wrappedSql],
    { encoding: "utf8", timeout: 10000 }
  ).trim();

  if (!output || output === "" || output.toLowerCase() === "null") {
    return { rows: [] };
  }

  try {
    const rows = JSON.parse(output) as Record<string, unknown>[];
    return { rows: rows ?? [] };
  } catch {
    return { rows: [] };
  }
}

export function exec(sql: string, params: unknown[] = []): void {
  let finalSql = sql;
  if (params.length > 0) {
    let i = 0;
    finalSql = sql.replace(/\$\d+/g, () => {
      const val = params[i++];
      if (val === null || val === undefined) return "NULL";
      if (typeof val === "number" || typeof val === "bigint") return String(val);
      if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
      return `'${String(val).replace(/'/g, "''")}'`;
    });
  }
  execFileSync("psql", [DB_URL, "-t", "-A", "-c", finalSql], {
    encoding: "utf8",
    timeout: 10000,
  });
}

export function generateId(prefix = ""): string {
  return prefix + crypto.randomBytes(8).toString("hex");
}

export function generateApiKey(): string {
  return "astro_live_" + crypto.randomBytes(20).toString("hex");
}

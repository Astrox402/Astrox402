import { useSyncExternalStore } from "react";
import { setApiUserId } from "./api";

export type ResourceType =
  | "API Endpoint"
  | "Agent Capability"
  | "Tool Action"
  | "Dataset Access"
  | "Content / Digital Asset"
  | "Webhook / Automation Action";

export type PricingModel =
  | "fixed per request"
  | "fixed per execution"
  | "fixed per access";

export type Visibility   = "private" | "public" | "gated";
export type Environment  = "Development" | "Staging" | "Production";
export type ResourceStatus = "draft" | "active" | "paused" | "archived";

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  description: string;
  url: string;
  method: string;
  version: string;
  environment: Environment;
  pricingModel: PricingModel;
  amount: string;
  asset: "USDC" | "SOL";
  scope: string;
  ttl: string;
  visibility: Visibility;
  status: ResourceStatus;
  network: "Solana";
  requests: number;
  revenue: string;
  lastActivity: string;
  createdAt: string;
  logs: Array<{ time: string; method: string; path: string; status: number; amount: string; tx: string }>;
  payments: Array<{ time: string; tx: string; slot: string; amount: string; status: string }>;
}

let _userId: string | null = null;
let _resources: Resource[] = [];
let _loaded = false;
const _listeners = new Set<() => void>();

function notify() {
  _listeners.forEach((fn) => fn());
}

function resourceToDbPayload(r: Resource) {
  const priceNum = parseFloat(r.amount) || 0;
  const lamports = r.asset === "SOL"
    ? Math.round(priceNum * 1e9)
    : Math.round(priceNum * 1e6);
  return {
    id: r.id,
    name: r.name,
    endpoint: r.url,
    description: r.description,
    price_lamports: lamports,
    price_token: r.asset,
    status: r.status,
    category: r.type,
    network: "mainnet",
    metadata: r,
  };
}

function dbRowToResource(row: Record<string, unknown>): Resource {
  if (row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)) {
    const meta = row.metadata as Partial<Resource>;
    const revLam = Number(row.revenue_lamports ?? 0);
    const token = (row.price_token as string) ?? "USDC";
    const revDisplay = token === "SOL"
      ? `${(revLam / 1e9).toFixed(4)} SOL`
      : `$${(revLam / 1e6).toFixed(2)}`;
    return {
      ...meta,
      id: row.id as string,
      name: (row.name as string) || meta.name || "Untitled",
      status: (row.status as ResourceStatus) || meta.status || "active",
      requests: Number(row.requests ?? 0),
      revenue: revDisplay,
    } as Resource;
  }
  const priceToken = (row.price_token as string) ?? "USDC";
  const priceLam = Number(row.price_lamports ?? 0);
  const priceDisplay = priceToken === "SOL"
    ? String(priceLam / 1e9)
    : String(priceLam / 1e6);
  const revLam = Number(row.revenue_lamports ?? 0);
  const revDisplay = priceToken === "SOL"
    ? `${(revLam / 1e9).toFixed(4)} SOL`
    : `$${(revLam / 1e6).toFixed(2)}`;
  return {
    id: row.id as string,
    name: (row.name as string) ?? "Untitled",
    type: ((row.category as ResourceType) ?? "API Endpoint"),
    description: (row.description as string) ?? "",
    url: (row.endpoint as string) ?? "",
    method: "POST",
    version: "v1",
    environment: "Production",
    pricingModel: "fixed per request",
    amount: priceDisplay,
    asset: priceToken as "USDC" | "SOL",
    scope: "",
    ttl: "60s",
    visibility: "public",
    status: (row.status as ResourceStatus) ?? "active",
    network: "Solana",
    requests: Number(row.requests ?? 0),
    revenue: revDisplay,
    lastActivity: "just now",
    createdAt: (row.created_at as string)?.slice(0, 10) ?? "",
    logs: [],
    payments: [],
  };
}

async function fetchFromDb() {
  if (!_userId) return;
  try {
    const r = await fetch("/api/resources", {
      headers: { "X-User-Id": _userId, "Content-Type": "application/json" },
    });
    if (!r.ok) return;
    const rows = (await r.json()) as Record<string, unknown>[];
    _resources = rows.map(dbRowToResource);
    _loaded = true;
    notify();
  } catch {
    _loaded = true;
    notify();
  }
}

export const resourceStore = {
  getSnapshot(): Resource[] {
    return _resources;
  },

  subscribe(fn: () => void): () => void {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  },

  setUserId(id: string | null) {
    if (_userId === id) return;
    _userId = id;
    setApiUserId(id);
    _resources = [];
    _loaded = false;
    if (id) fetchFromDb();
    else notify();
  },

  async add(resource: Resource): Promise<void> {
    _resources = [..._resources, resource];
    notify();
    if (!_userId) return;
    try {
      await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-User-Id": _userId },
        body: JSON.stringify(resourceToDbPayload(resource)),
      });
    } catch {}
  },

  async update(id: string, changes: Partial<Resource>): Promise<void> {
    _resources = _resources.map((r) =>
      r.id === id ? { ...r, ...changes } : r
    );
    notify();
    if (!_userId) return;
    const updated = _resources.find((r) => r.id === id);
    if (!updated) return;
    try {
      await fetch(`/api/resources/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-User-Id": _userId },
        body: JSON.stringify({
          ...resourceToDbPayload(updated),
          metadata: updated,
        }),
      });
    } catch {}
  },

  async delete(id: string): Promise<void> {
    _resources = _resources.filter((r) => r.id !== id);
    notify();
    if (!_userId) return;
    try {
      await fetch(`/api/resources/${id}`, {
        method: "DELETE",
        headers: { "X-User-Id": _userId },
      });
    } catch {}
  },

  getById(id: string): Resource | undefined {
    return _resources.find((r) => r.id === id);
  },

  isLoaded(): boolean {
    return _loaded;
  },
};

export function useResources(): Resource[] {
  return useSyncExternalStore(
    resourceStore.subscribe.bind(resourceStore),
    resourceStore.getSnapshot.bind(resourceStore),
  );
}

export function useResource(id: string): Resource | undefined {
  const resources = useResources();
  return resources.find((r) => r.id === id);
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

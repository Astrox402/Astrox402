import { useSyncExternalStore } from "react";

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

export type Visibility = "private" | "public" | "gated";
export type Environment = "Development" | "Staging" | "Production";
export type ResourceStatus = "draft" | "active" | "paused";

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

const SEED: Resource[] = [
  {
    id: "r1", name: "GPT Inference API", type: "API Endpoint", description: "Run GPT-4-class inference. Charged per request, settled instantly.",
    url: "https://api.astro.x402/v1/infer", method: "POST", version: "v1", environment: "Production",
    pricingModel: "fixed per request", amount: "0.0021", asset: "USDC", scope: "inference.gpt", ttl: "60s",
    visibility: "public", status: "active", network: "Solana", requests: 12840, revenue: "$26.96",
    lastActivity: "2s ago", createdAt: "2026-04-01",
    logs: [
      { time: "2s ago",  method: "POST", path: "/v1/infer", status: 200, amount: "0.0021", tx: "5JhkL…q9Rv" },
      { time: "18s ago", method: "POST", path: "/v1/infer", status: 402, amount: "—",      tx: "—" },
      { time: "22s ago", method: "POST", path: "/v1/infer", status: 200, amount: "0.0021", tx: "8KmNP…x3Tz" },
      { time: "1m ago",  method: "POST", path: "/v1/infer", status: 200, amount: "0.0021", tx: "2QrST…n7Wv" },
      { time: "2m ago",  method: "POST", path: "/v1/infer", status: 200, amount: "0.0021", tx: "9LpFK…m2Yx" },
    ],
    payments: [
      { time: "2s ago",  tx: "5JhkL…q9Rv", slot: "281,492,120", amount: "0.0021 USDC", status: "settled" },
      { time: "22s ago", tx: "8KmNP…x3Tz", slot: "281,492,088", amount: "0.0021 USDC", status: "settled" },
      { time: "1m ago",  tx: "2QrST…n7Wv", slot: "281,492,010", amount: "0.0021 USDC", status: "settled" },
      { time: "2m ago",  tx: "9LpFK…m2Yx", slot: "281,491,980", amount: "0.0021 USDC", status: "settled" },
    ],
  },
  {
    id: "r2", name: "Image Generation", type: "API Endpoint", description: "Stable Diffusion XL image generation endpoint. Priced per image.",
    url: "https://api.astro.x402/v1/image", method: "POST", version: "v1", environment: "Production",
    pricingModel: "fixed per request", amount: "0.015", asset: "USDC", scope: "image.gen", ttl: "120s",
    visibility: "public", status: "active", network: "Solana", requests: 4291, revenue: "$64.37",
    lastActivity: "14s ago", createdAt: "2026-04-02", logs: [], payments: [],
  },
  {
    id: "r3", name: "Embeddings v2", type: "API Endpoint", description: "High-throughput text embedding endpoint. Sub-cent per batch.",
    url: "https://api.astro.x402/v1/embed", method: "POST", version: "v2", environment: "Production",
    pricingModel: "fixed per request", amount: "0.0004", asset: "USDC", scope: "embed.v2", ttl: "60s",
    visibility: "public", status: "active", network: "Solana", requests: 22100, revenue: "$8.84",
    lastActivity: "1m ago", createdAt: "2026-04-03", logs: [], payments: [],
  },
  {
    id: "r4", name: "Dataset Access", type: "Dataset Access", description: "Curated training dataset. One-time access per payment.",
    url: "https://api.astro.x402/v1/datasets/curated-v1", method: "GET", version: "v1", environment: "Production",
    pricingModel: "fixed per access", amount: "0.50", asset: "USDC", scope: "dataset.curated", ttl: "300s",
    visibility: "gated", status: "paused", network: "Solana", requests: 88, revenue: "$44.00",
    lastActivity: "2h ago", createdAt: "2026-04-05", logs: [], payments: [],
  },
  {
    id: "r5", name: "Audio Transcription", type: "API Endpoint", description: "Whisper-based audio-to-text API. Charged per transcription job.",
    url: "https://api.astro.x402/v1/transcribe", method: "POST", version: "v1", environment: "Production",
    pricingModel: "fixed per execution", amount: "0.008", asset: "USDC", scope: "audio.transcribe", ttl: "60s",
    visibility: "public", status: "active", network: "Solana", requests: 2014, revenue: "$16.11",
    lastActivity: "4m ago", createdAt: "2026-04-06", logs: [], payments: [],
  },
  {
    id: "r6", name: "Research Archive", type: "Content / Digital Asset", description: "Paid access to a curated research paper archive.",
    url: "https://api.astro.x402/v1/archive/research", method: "GET", version: "v1", environment: "Staging",
    pricingModel: "fixed per access", amount: "1.00", asset: "USDC", scope: "archive.research", ttl: "600s",
    visibility: "gated", status: "draft", network: "Solana", requests: 0, revenue: "$0.00",
    lastActivity: "3d ago", createdAt: "2026-04-07", logs: [], payments: [],
  },
  {
    id: "r7", name: "Code Review API", type: "Agent Capability", description: "AI-powered code review agent. Runs on PR diffs via Solana-native payment.",
    url: "https://api.astro.x402/v1/review", method: "POST", version: "v1", environment: "Production",
    pricingModel: "fixed per execution", amount: "0.003", asset: "USDC", scope: "agent.codereview", ttl: "90s",
    visibility: "private", status: "active", network: "Solana", requests: 5521, revenue: "$16.56",
    lastActivity: "8m ago", createdAt: "2026-04-08", logs: [], payments: [],
  },
];

const STORE_KEY = "astro_x402_resources";

function loadResources(): Resource[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return SEED;
    const saved: Resource[] = JSON.parse(raw);
    const savedIds = new Set(saved.map((r) => r.id));
    const merged = [...SEED.filter((r) => !savedIds.has(r.id)), ...saved];
    return merged.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  } catch {
    return SEED;
  }
}

function persistCustomResources(resources: Resource[]) {
  const custom = resources.filter((r) => !SEED.find((s) => s.id === r.id));
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(custom));
  } catch {}
}

let _resources: Resource[] = loadResources();
const _listeners = new Set<() => void>();

function notify() {
  _listeners.forEach((fn) => fn());
}

export const resourceStore = {
  getSnapshot(): Resource[] {
    return _resources;
  },

  subscribe(fn: () => void): () => void {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  },

  add(resource: Resource): void {
    _resources = [..._resources, resource];
    persistCustomResources(_resources);
    notify();
  },

  getById(id: string): Resource | undefined {
    return _resources.find((r) => r.id === id);
  },
};

export function useResources(): Resource[] {
  return useSyncExternalStore(resourceStore.subscribe.bind(resourceStore), resourceStore.getSnapshot.bind(resourceStore));
}

export function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

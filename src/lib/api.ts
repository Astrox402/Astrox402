let _userId: string | null = null;

export function setApiUserId(id: string | null) {
  _userId = id;
}

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (_userId) headers["X-User-Id"] = _userId;

  return fetch(path, { ...options, headers });
}

export interface ApiResource {
  id: string;
  user_id: string;
  name: string;
  endpoint: string;
  description: string;
  price_lamports: number;
  price_token: "SOL" | "USDC";
  status: "active" | "paused" | "draft" | "archived";
  category: string;
  network: string;
  requests: number;
  revenue_lamports: number;
  created_at: string;
  updated_at: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  key_value: string;
  created_at: string;
  last_used_at: string | null;
}

export interface ApiPayment {
  id: string;
  user_id: string;
  resource_id: string | null;
  resource_name: string;
  amount_lamports: number;
  token: string;
  payer_wallet: string;
  tx_signature: string;
  status: "settled" | "pending" | "failed";
  created_at: string;
}

export interface ApiStats {
  resources: {
    active_resources: string;
    total_resources: string;
    total_requests: string;
    total_revenue_lamports: string;
  };
  payments: {
    settled_count: string;
    pending_count: string;
    failed_count: string;
    total_settled_lamports: string;
  };
}

export const api = {
  async getResources(): Promise<ApiResource[]> {
    const r = await apiFetch("/api/resources");
    if (!r.ok) return [];
    return r.json();
  },

  async createResource(data: Partial<ApiResource>): Promise<ApiResource> {
    const r = await apiFetch("/api/resources", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return r.json();
  },

  async updateResource(id: string, data: Partial<ApiResource>): Promise<ApiResource> {
    const r = await apiFetch(`/api/resources/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return r.json();
  },

  async deleteResource(id: string): Promise<void> {
    await apiFetch(`/api/resources/${id}`, { method: "DELETE" });
  },

  async getApiKey(): Promise<ApiKey | null> {
    const r = await apiFetch("/api/api-keys");
    if (!r.ok) return null;
    return r.json();
  },

  async getPayments(): Promise<ApiPayment[]> {
    const r = await apiFetch("/api/payments");
    if (!r.ok) return [];
    return r.json();
  },

  async getStats(): Promise<ApiStats | null> {
    const r = await apiFetch("/api/stats");
    if (!r.ok) return null;
    return r.json();
  },

  async createPayment(data: {
    resource_id: string | null;
    resource_name: string;
    amount_lamports: number;
    token: string;
    payer_wallet: string;
    tx_signature: string;
    status: "settled" | "pending" | "failed";
  }): Promise<ApiPayment> {
    const r = await apiFetch("/api/payments", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return r.json();
  },
};

export function lamportsToDisplay(lamports: number, token: string): string {
  if (token === "SOL") {
    const sol = lamports / 1e9;
    return `${sol.toFixed(sol >= 1 ? 4 : 6)} SOL`;
  }
  const usdc = lamports / 1e6;
  return `$${usdc.toFixed(2)}`;
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}


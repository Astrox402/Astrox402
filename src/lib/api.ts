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
  metadata?: Record<string, unknown>;
}

export interface ApiKey {
  id: string;
  user_id: string;
  label: string;
  key_value: string;
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
  scopes: string;
  usage_count: number;
  usage_limit: number;
}

export interface ApiEvent {
  id: string;
  user_id: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ApiRevenue {
  by_resource: Array<{
    resource_id: string;
    resource_name: string;
    tx_count: string;
    sol_total: string;
    usdc_total: string;
    last_at: string;
  }>;
  by_day: Array<{
    day: string;
    sol_total: string;
    usdc_total: string;
    tx_count: string;
  }>;
  totals: {
    sol_total: string;
    usdc_total: string;
    tx_count: string;
    unique_payers: string;
  };
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
    total_sol_revenue_lamports: string;
    total_usdc_revenue_lamports: string;
  };
  payments: {
    settled_count: string;
    pending_count: string;
    failed_count: string;
    total_settled_lamports: string;
  };
}

export interface ApiWebhook {
  id: string;
  user_id: string;
  url: string;
  secret: string;
  events: string;
  is_active: boolean;
  created_at: string;
  last_ping_at: string | null;
  delivery_count: number;
  failure_count: number;
}

export interface ApiWebhookDelivery {
  id: string;
  webhook_id: string;
  payment_id: string | null;
  event_type: string;
  status: "success" | "failed";
  status_code: number;
  duration_ms: number;
  error: string;
  attempted_at: string;
}

export interface ApiAnalytics {
  payers: Array<{
    payer_wallet: string;
    payment_count: string;
    sol_total: string;
    usdc_total: string;
    last_at: string;
  }>;
  daily: Array<{
    day: string;
    tx_count: string;
    sol_vol: string;
    usdc_vol: string;
  }>;
  tokens: Array<{
    token: string;
    count: string;
    total_lamports: string;
  }>;
  unique_payers: { count: string };
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

  async getRevenue(): Promise<ApiRevenue | null> {
    const r = await apiFetch("/api/revenue");
    if (!r.ok) return null;
    return r.json();
  },

  async getEvents(): Promise<ApiEvent[]> {
    const r = await apiFetch("/api/events");
    if (!r.ok) return [];
    return r.json();
  },

  async getApiKeys(): Promise<ApiKey[]> {
    const r = await apiFetch("/api/api-keys");
    if (!r.ok) return [];
    return r.json();
  },

  async createApiKey(data: { label: string; scopes: string[]; expires_at?: string | null; usage_limit?: number }): Promise<ApiKey> {
    const r = await apiFetch("/api/api-keys", { method: "POST", body: JSON.stringify(data) });
    return r.json();
  },

  async deleteApiKey(id: string): Promise<void> {
    await apiFetch(`/api/api-keys/${id}`, { method: "DELETE" });
  },

  async updateApiKey(id: string, data: Partial<Pick<ApiKey, "label" | "scopes" | "expires_at" | "usage_limit">>): Promise<ApiKey> {
    const r = await apiFetch(`/api/api-keys/${id}`, { method: "PATCH", body: JSON.stringify(data) });
    return r.json();
  },

  async getAnalytics(): Promise<ApiAnalytics | null> {
    const r = await apiFetch("/api/analytics");
    if (!r.ok) return null;
    return r.json();
  },

  async getWebhooks(): Promise<ApiWebhook[]> {
    const r = await apiFetch("/api/webhooks");
    if (!r.ok) return [];
    return r.json();
  },

  async createWebhook(data: { url: string; events: string[] }): Promise<ApiWebhook> {
    const r = await apiFetch("/api/webhooks", { method: "POST", body: JSON.stringify(data) });
    return r.json();
  },

  async updateWebhook(id: string, data: Partial<ApiWebhook>): Promise<ApiWebhook> {
    const r = await apiFetch(`/api/webhooks/${id}`, { method: "PATCH", body: JSON.stringify(data) });
    return r.json();
  },

  async deleteWebhook(id: string): Promise<void> {
    await apiFetch(`/api/webhooks/${id}`, { method: "DELETE" });
  },

  async pingWebhook(id: string): Promise<{ ok: boolean; status_code?: number; duration_ms?: number; error?: string }> {
    const r = await apiFetch(`/api/webhooks/${id}/ping`, { method: "POST" });
    return r.json();
  },

  async getWebhookDeliveries(webhookId: string): Promise<ApiWebhookDelivery[]> {
    const r = await apiFetch(`/api/webhook-deliveries?webhook_id=${encodeURIComponent(webhookId)}`);
    if (!r.ok) return [];
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

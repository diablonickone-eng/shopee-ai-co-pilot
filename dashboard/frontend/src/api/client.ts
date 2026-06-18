const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

interface StatusResponse {
  colab_connected: boolean;
  colab_url: string;
  colab_health: any;
  last_seen: number;
  uptime_seconds: number;
}

interface ReconnectResponse {
  success: boolean;
  colab_url: string;
  colab_health: any;
}

export const api = {
  health: () => fetchAPI<{ status: string }>("/health"),

  getStatus: () => fetchAPI<StatusResponse>("/status"),

  reconnect: () =>
    fetchAPI<ReconnectResponse>("/reconnect", { method: "POST" }),

  chat: (message: string, session_id?: string) =>
    fetchAPI<{
      response: string;
      intent: string;
      session_id: string;
      agent_trace: any[];
    }>("/chat", {
      method: "POST",
      body: JSON.stringify({ message, session_id }),
    }),

  getChatHistory: (session_id: string) =>
    fetchAPI<{ session_id: string; messages: any[] }>(
      `/chat/history/${session_id}`
    ),

  uploadProducts: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return fetchAPI<{
      session_id: string;
      total: number;
      columns: string[];
      preview: any[];
    }>("/products/upload", {
      method: "POST",
      body: formData,
      headers: {},
    });
  },

  getProducts: (session_id: string) =>
    fetchAPI<{ session_id: string; products: any[]; total: number }>(
      `/products/${session_id}`
    ),

  analyzeProducts: (session_id: string, analysis_type = "all") =>
    fetchAPI<{
      cached: boolean;
      results: any[];
      summary: string;
    }>(`/products/${session_id}/analyze`, {
      method: "POST",
      body: JSON.stringify({ analysis_type }),
    }),

  getAnalytics: (session_id: string) =>
    fetchAPI<{ session_id: string; analytics: any }>(
      `/analytics/${session_id}`
    ),
};

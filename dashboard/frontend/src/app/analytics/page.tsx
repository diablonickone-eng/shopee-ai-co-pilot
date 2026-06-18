"use client";

import { useState, useCallback } from "react";
import AnalyticsPanel from "@/components/AnalyticsPanel";
import { api } from "@/api/client";

export default function AnalyticsPage() {
  const [sessionId, setSessionId] = useState("");
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoad = useCallback(async () => {
    if (!sessionId.trim()) return;
    setIsLoading(true);
    try {
      const result = await api.getAnalytics(sessionId);
      setAnalyticsData(result.analytics);
    } catch (error: any) {
      alert(`Gagal load analytics: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">📊 Analytics</h2>
        <p className="text-slate-400 text-sm mt-1">
          Lihat metrik dan insight performa produk
        </p>
      </div>

      <div className="card flex items-center gap-3">
        <input
          type="text"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          placeholder="Masukkan Session ID dari halaman Products"
          className="input-field flex-1"
        />
        <button
          onClick={handleLoad}
          disabled={!sessionId.trim() || isLoading}
          className="btn-primary"
        >
          {isLoading ? "Memuat..." : "Tampilkan"}
        </button>
      </div>

      <AnalyticsPanel data={analyticsData} isLoading={isLoading} />
    </div>
  );
}

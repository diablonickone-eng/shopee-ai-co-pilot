"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/api/client";

export default function ColabStatus() {
  const [status, setStatus] = useState<"connected" | "disconnected" | "checking">(
    "checking"
  );
  const [uptime, setUptime] = useState("");
  const [showBanner, setShowBanner] = useState(false);

  const checkStatus = useCallback(async () => {
    try {
      const s = await api.getStatus();
      setStatus(s.colab_connected ? "connected" : "disconnected");
      if (s.colab_connected) {
        const mins = Math.floor(s.uptime_seconds / 60);
        setUptime(mins < 60 ? `${mins} menit` : `${Math.floor(mins / 60)} jam`);
      }
    } catch {
      setStatus("disconnected");
    }
  }, []);

  const handleReconnect = useCallback(async () => {
    setStatus("checking");
    try {
      const r = await api.reconnect();
      setStatus(r.success ? "connected" : "disconnected");
    } catch {
      setStatus("disconnected");
    }
  }, []);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  useEffect(() => {
    if (status === "disconnected") {
      setShowBanner(true);
    } else {
      const timer = setTimeout(() => setShowBanner(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  if (status === "connected" && !showBanner) return null;

  const colors = {
    connected: {
      bg: "bg-accent-500/10",
      border: "border-accent-500/30",
      dot: "bg-accent-500",
      text: "text-accent-400",
      label: "Colab Terhubung",
    },
    disconnected: {
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      dot: "bg-red-500",
      text: "text-red-400",
      label: "Colab Terputus",
    },
    checking: {
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
      dot: "bg-yellow-500",
      text: "text-yellow-400",
      label: "Menghubungkan...",
    },
  };

  const c = colors[status];

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 ${c.bg} ${c.border} border rounded-xl p-3 shadow-2xl backdrop-blur-xl transition-all duration-300`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-2.5 h-2.5 rounded-full ${c.dot} animate-pulse`} />
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold ${c.text}`}>{c.label}</p>
          {status === "connected" && uptime && (
            <p className="text-[10px] text-slate-500">Online {uptime}</p>
          )}
        </div>
        {status === "disconnected" && (
          <button
            onClick={handleReconnect}
            className="px-2.5 py-1 text-[10px] bg-shopee-500 hover:bg-shopee-600 text-white rounded-lg font-medium transition-all"
          >
            Reconnect
          </button>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import { api } from "@/api/client";

export function useColab() {
  const [colabUrl, setColabUrl] = useState<string>(
    () => localStorage.getItem("colab_url") || ""
  );
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const checkConnection = useCallback(async () => {
    try {
      const health = await api.health();
      setIsConnected(health.status === "ok");
      return health.status === "ok";
    } catch {
      setIsConnected(false);
      return false;
    }
  }, []);

  return {
    colabUrl,
    setColabUrl: (url: string) => {
      setColabUrl(url);
      localStorage.setItem("colab_url", url);
    },
    isConnected,
    setIsConnected,
    isLoading,
    setIsLoading,
    checkConnection,
  };
}

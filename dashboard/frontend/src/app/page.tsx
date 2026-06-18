"use client";

import { useState, useCallback } from "react";
import ChatBox from "@/components/ChatBox";
import AgentGraph from "@/components/AgentGraph";
import { api } from "@/api/client";

interface Message {
  role: "user" | "assistant";
  content: string;
  intent?: string;
  agent_trace?: any[];
}

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastTrace, setLastTrace] = useState<any[]>([]);

  const handleSendMessage = useCallback(async (message: string) => {
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setIsLoading(true);

    try {
      const result = await api.chat(message, sessionId);

      if (!sessionId && result.session_id) {
        setSessionId(result.session_id);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: result.response,
          intent: result.intent,
          agent_trace: result.agent_trace,
        },
      ]);
      setLastTrace(result.agent_trace || []);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ Error: ${error.message}. Pastikan dashboard backend dan Colab server berjalan.`,
          intent: "error",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-8rem)]">
      <div className="lg:col-span-3 glass rounded-xl overflow-hidden">
        <ChatBox
          onSendMessage={handleSendMessage}
          messages={messages}
          isLoading={isLoading}
        />
      </div>
      <div className="lg:col-span-1 overflow-y-auto">
        <AgentGraph trace={lastTrace} isVisible={lastTrace.length > 0} />
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">
            📌 Quick Stats
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Status</span>
              <span id="status-badge" className="badge-success text-[10px]">
                Online
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Session</span>
              <span className="text-slate-300 text-xs font-mono">
                {sessionId ? sessionId.slice(0, 8) + "..." : "Baru"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Pesan</span>
              <span className="text-slate-300">
                {messages.filter((m) => m.role === "user").length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

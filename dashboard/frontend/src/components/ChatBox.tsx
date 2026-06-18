"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  intent?: string;
  agent_trace?: any[];
}

interface ChatBoxProps {
  onSendMessage: (message: string) => Promise<void>;
  messages: Message[];
  isLoading: boolean;
}

export default function ChatBox({ onSendMessage, messages, isLoading }: ChatBoxProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const msg = input.trim();
    setInput("");
    await onSendMessage(msg);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
            <span className="text-6xl">🤖</span>
            <h2 className="text-xl font-semibold text-slate-300">
              Shopee AI Co-Pilot
            </h2>
            <p className="text-sm text-center max-w-md">
              Tanyakan apa saja tentang optimasi toko Shopee-mu!<br />
              Contoh: &quot;Optimasi title bunga artificial premium&quot; atau
              &quot;Rekomendasi keyword untuk lampu dekorasi&quot;
            </p>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {[
                "Optimasi 5 produk terlarisku",
                "Buatkan deskripsi lampu fairy string",
                "Keyword untuk bunga lebaran",
                "Strategi harga kompetitor",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q);
                    handleSubmit({ preventDefault: () => {} } as any);
                  }}
                  className="text-xs px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-slate-300 transition-colors text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-shopee-500/20 border border-shopee-500/30 text-slate-100"
                  : "glass text-slate-200"
              }`}
            >
              {msg.intent && msg.intent !== "general" && (
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-700/50">
                  <span className="badge-info text-[10px]">{msg.intent}</span>
                </div>
              )}
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="glass rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Menganalisis</span>
                <div className="flex gap-1">
                  <span className="thinking-dot" style={{ animationDelay: "0s" }} />
                  <span className="thinking-dot" style={{ animationDelay: "0.3s" }} />
                  <span className="thinking-dot" style={{ animationDelay: "0.6s" }} />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700/50">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanya sesuatu tentang toko Shopee-mu..."
            className="input-field flex-1"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="btn-primary"
          >
            Kirim
          </button>
        </div>
      </form>
    </div>
  );
}

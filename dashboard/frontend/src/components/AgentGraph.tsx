"use client";

import { useState } from "react";

interface AgentStep {
  agent: string;
  action: string;
  result: string;
  duration_ms: number;
}

interface AgentGraphProps {
  trace: AgentStep[];
  isVisible: boolean;
}

const agentIcons: Record<string, string> = {
  Orchestrator: "🧠",
  title_optimization: "✏️",
  keyword_research: "🔍",
  description_writing: "📝",
  pricing_analysis: "💰",
  seasonal_promo: "📅",
  review_analysis: "⭐",
};

export default function AgentGraph({ trace, isVisible }: AgentGraphProps) {
  const [expanded, setExpanded] = useState(true);

  if (!isVisible || trace.length === 0) return null;

  return (
    <div className="card mb-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">🧠</span>
          <h3 className="text-sm font-semibold text-slate-200">
            Agent Thinking
          </h3>
          <span className="badge-info text-[10px]">{trace.length} langkah</span>
        </div>
        <span className="text-slate-400 text-sm">
          {expanded ? "▲" : "▼"}
        </span>
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          {trace.map((step, i) => (
            <div key={i} className="relative">
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm">
                    {agentIcons[step.agent] || "⚡"}
                  </div>
                  {i < trace.length - 1 && (
                    <div className="w-0.5 h-full bg-slate-700 mt-1" />
                  )}
                </div>
                <div className="flex-1 min-w-0 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-200">
                      {step.agent.replace(/_/g, " ")}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {step.duration_ms}ms
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                    {step.action}: {step.result}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

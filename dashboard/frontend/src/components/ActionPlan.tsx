"use client";

import { useState } from "react";

interface ActionItem {
  id: string;
  action: string;
  category: string;
  priority: "high" | "medium" | "low";
  estimate: string;
  impact: string;
}

interface ActionPlanProps {
  items: ActionItem[];
  onRefresh: () => void;
}

export default function ActionPlan({ items, onRefresh }: ActionPlanProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggleCheck = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-500 space-y-4">
        <span className="text-6xl">✅</span>
        <p className="text-slate-400">
          Belum ada action plan. Upload produk atau chat dengan AI untuk memulai.
        </p>
      </div>
    );
  }

  const priorityColor = {
    high: "text-red-400 bg-red-500/20 border-red-500/30",
    medium: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30",
    low: "text-blue-400 bg-blue-500/20 border-blue-500/30",
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-slate-200">Action Plan</h3>
          <span className="badge-info text-xs">
            {checked.size}/{items.length} selesai
          </span>
        </div>
        <button onClick={onRefresh} className="btn-secondary text-sm">
          Refresh
        </button>
      </div>

      <div className="space-y-2">
        {items.map((item) => {
          const isDone = checked.has(item.id);
          return (
            <div
              key={item.id}
              className={`card flex items-start gap-3 transition-all ${
                isDone ? "opacity-50" : ""
              }`}
            >
              <button
                onClick={() => toggleCheck(item.id)}
                className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isDone
                    ? "bg-accent-500 border-accent-500"
                    : "border-slate-500 hover:border-shopee-500"
                }`}
              >
                {isDone && <span className="text-white text-xs">✓</span>}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`badge text-[10px] ${
                      priorityColor[item.priority]
                    }`}
                  >
                    {item.priority}
                  </span>
                  <span className="badge-info text-[10px]">{item.category}</span>
                  <span className="text-[10px] text-slate-500">
                    {item.estimate}
                  </span>
                </div>
                <p
                  className={`text-sm ${
                    isDone ? "line-through text-slate-500" : "text-slate-200"
                  }`}
                >
                  {item.action}
                </p>
                <p className="text-xs text-accent-400 mt-0.5">
                  Dampak: {item.impact}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

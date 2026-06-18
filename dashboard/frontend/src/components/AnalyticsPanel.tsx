"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface AnalyticsData {
  total_products: number;
  total_stock: number;
  total_sales_30d: number;
  avg_price: number;
  avg_cost: number;
  avg_rating: number;
  avg_margin_pct: number;
  top_sku: string;
  low_stock_items: { name: string; stock: number }[];
  no_sales_items: { name: string; sku: string }[];
}

interface AnalyticsPanelProps {
  data: AnalyticsData | null;
  isLoading: boolean;
}

const COLORS = ["#22c55e", "#eab308", "#ef4444", "#3b82f6", "#a855f7"];

export default function AnalyticsPanel({ data, isLoading }: AnalyticsPanelProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex items-center gap-2">
          <span className="thinking-dot" />
          <span className="text-slate-400">Memuat analytics...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-500 space-y-4">
        <span className="text-6xl">📊</span>
        <p className="text-slate-400">
          Upload produk dulu untuk lihat analytics.
        </p>
      </div>
    );
  }

  const barData = [
    { name: "Rata-rata", Harga: data.avg_price, Modal: data.avg_cost },
  ];

  const pieData = [
    { name: "Produk dengan Stok Rendah", value: data.low_stock_items.length },
    { name: "Produk Tanpa Penjualan", value: data.no_sales_items.length },
    {
      name: "Produk Normal",
      value: data.total_products - data.low_stock_items.length - data.no_sales_items.length,
    },
  ].filter((d) => d.value >= 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Produk",
            value: data.total_products,
            icon: "📦",
          },
          {
            label: "Total Penjualan (30d)",
            value: data.total_sales_30d,
            icon: "💰",
          },
          {
            label: "Rata-rata Rating",
            value: data.avg_rating.toFixed(1),
            icon: "⭐",
            color:
              data.avg_rating >= 4.5
                ? "text-accent-400"
                : data.avg_rating >= 4.0
                ? "text-yellow-400"
                : "text-red-400",
          },
          {
            label: "Rata-rata Margin",
            value: `${data.avg_margin_pct}%`,
            icon: "📈",
            color:
              data.avg_margin_pct >= 50
                ? "text-accent-400"
                : data.avg_margin_pct >= 30
                ? "text-yellow-400"
                : "text-red-400",
          },
        ].map((card) => (
          <div key={card.label} className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{card.icon}</span>
            </div>
            <p className="text-2xl font-bold text-white">{card.value}</p>
            <p className="text-xs text-slate-400 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Chart */}
        <div className="card">
          <h4 className="text-sm font-semibold text-slate-200 mb-4">
            Rata-rata Harga vs Modal
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                }}
              />
              <Bar dataKey="Harga" fill="#ee4d2d" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Modal" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Product Health Pie */}
        <div className="card">
          <h4 className="text-sm font-semibold text-slate-200 mb-4">
            Kesehatan Produk
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {pieData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.low_stock_items.length > 0 && (
          <div className="card">
            <h4 className="text-sm font-semibold text-red-400 mb-3">
              ⚠️ Stok Menipis ({data.low_stock_items.length})
            </h4>
            <div className="space-y-2">
              {data.low_stock_items.slice(0, 5).map((item) => (
                <div
                  key={item.name}
                  className="flex justify-between text-sm text-slate-300"
                >
                  <span className="truncate">{item.name}</span>
                  <span className="text-red-400 font-mono">
                    {item.stock} pcs
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.no_sales_items.length > 0 && (
          <div className="card">
            <h4 className="text-sm font-semibold text-yellow-400 mb-3">
              📉 Produk Tanpa Penjualan ({data.no_sales_items.length})
            </h4>
            <div className="space-y-2">
              {data.no_sales_items.slice(0, 5).map((item) => (
                <div
                  key={item.sku}
                  className="text-sm text-slate-300 flex items-center gap-2"
                >
                  <span className="text-yellow-400">•</span>
                  <span className="truncate">{item.name}</span>
                  <span className="text-slate-500 text-xs">({item.sku})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

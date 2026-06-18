"use client";

interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  rating: number;
  sales_30d: number;
  competitor_price: number;
}

interface ProductTableProps {
  products: Product[];
  onAnalyze: (type: string) => void;
  isAnalyzing: boolean;
}

export default function ProductTable({
  products,
  onAnalyze,
  isAnalyzing,
}: ProductTableProps) {
  if (products.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-200">
          Daftar Produk ({products.length})
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => onAnalyze("all")}
            disabled={isAnalyzing}
            className="btn-primary text-sm"
          >
            {isAnalyzing ? "Menganalisis..." : "Analisis Semua"}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-3 text-slate-400 font-medium">SKU</th>
              <th className="text-left py-3 px-3 text-slate-400 font-medium">Nama</th>
              <th className="text-right py-3 px-3 text-slate-400 font-medium">Harga</th>
              <th className="text-right py-3 px-3 text-slate-400 font-medium">Modal</th>
              <th className="text-right py-3 px-3 text-slate-400 font-medium">Margin</th>
              <th className="text-right py-3 px-3 text-slate-400 font-medium">Stok</th>
              <th className="text-center py-3 px-3 text-slate-400 font-medium">Rating</th>
              <th className="text-right py-3 px-3 text-slate-400 font-medium">Sales/30d</th>
              <th className="text-right py-3 px-3 text-slate-400 font-medium">Harga Komp</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const margin = p.price && p.cost
                ? Math.round(((p.price - p.cost) / p.price) * 100)
                : 0;
              return (
                <tr
                  key={p.id}
                  className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-3 px-3 text-slate-400 font-mono text-xs">
                    {p.sku || "-"}
                  </td>
                  <td className="py-3 px-3 text-slate-200 max-w-[200px] truncate">
                    {p.name}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-200">
                    Rp{p.price?.toLocaleString("id")}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-400">
                    Rp{p.cost?.toLocaleString("id")}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`${
                        margin >= 50
                          ? "text-accent-400"
                          : margin >= 30
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      {margin}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={
                        p.stock < 10 ? "text-red-400" : "text-slate-200"
                      }
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={
                        p.rating >= 4.5
                          ? "text-accent-400"
                          : p.rating >= 4.0
                          ? "text-yellow-400"
                          : "text-red-400"
                      }
                    >
                      ⭐ {p.rating}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-slate-200">
                    {p.sales_30d}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-400">
                    {p.competitor_price
                      ? `Rp${p.competitor_price.toLocaleString("id")}`
                      : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import ActionPlan from "@/components/ActionPlan";

const DEMO_ACTIONS = [
  {
    id: "1",
    action: 'Ganti title "Bunga Artificial Premium" → "Rangkaian Bunga Artificial Premium 6 Tangkai - Bunga Hias Plastik Mewah Dekorasi Rumah & Lebaran"',
    category: "Title",
    priority: "high" as const,
    estimate: "5 menit",
    impact: "+30% klik",
  },
  {
    id: "2",
    action: "Tambah 10 keyword long-tail ke Shopee Ads: bunga artificial ruang tamu, dekorasi lebaran murah, hiasan rumah aesthetic",
    category: "Keyword",
    priority: "high" as const,
    estimate: "10 menit",
    impact: "+50% impression",
  },
  {
    id: "3",
    action: "Buat deskripsi storytelling: 'Bayangkan ruang tamu Anda lebih hidup dengan...' (gunakan template dari hasil Chat)",
    category: "Deskripsi",
    priority: "medium" as const,
    estimate: "15 menit",
    impact: "+15% konversi",
  },
  {
    id: "4",
    action: "Flash Sale 1-7 April: Bundle 'Paket Dekorasi Lebaran' (3 produk) diskon 15%",
    category: "Promo",
    priority: "high" as const,
    estimate: "20 menit",
    impact: "+40% penjualan",
  },
  {
    id: "5",
    action: "Turunkan harga lampu fairy string dari Rp45.000 ke Rp39.900 (charm pricing) untuk lawan kompetitor",
    category: "Pricing",
    priority: "medium" as const,
    estimate: "5 menit",
    impact: "+25%销售额",
  },
  {
    id: "6",
    action: "Upload 3 foto lifestyle: produk di ruang tamu, kamar tidur, dan teras",
    category: "Visual",
    priority: "low" as const,
    estimate: "30 menit",
    impact: "+20% konversi",
  },
];

export default function ActionPlanPage() {
  const [actions] = useState(DEMO_ACTIONS);

  const handleRefresh = () => {
    // In real app, re-fetch from API
    alert("Refresh action plan dari hasil analisis terbaru");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">✅ Action Plan</h2>
        <p className="text-slate-400 text-sm mt-1">
        </p>
      </div>

      <ActionPlan items={actions} onRefresh={handleRefresh} />
    </div>
  );
}

import json
from datetime import datetime
from typing import Dict, Any


class SeasonalPro:
    def __init__(self, model, tokenizer):
        self.model = model
        self.tokenizer = tokenizer

    def _get_current_moment(self) -> Dict:
        month = datetime.now().month
        moments = {
            1: {"name": "Tahun Baru & Imlek", "theme": "Dekorasi merah & emas, bunga melati artificial", "bundles": ["Paket Dekorasi Imlek", "Bunga + Angpao"]},
            2: {"name": "Valentine", "theme": "Bunga mawar artificial, lampu romantis", "bundles": ["Paket Valentine", "Mawar + Lampu Fairy"]},
            3: {"name": "Awal Tahun", "theme": "Dekorasi rumah segar", "bundles": ["Paket Refresh Rumah"]},
            4: {"name": "Ramadan", "theme": "Dekorasi Ramadhan, lampu hias sahur", "bundles": ["Paket Ramadan Berkah", "Lampu Ramadan + Bunga"]},
            5: {"name": "Lebaran", "theme": "Dekorasi Lebaran premium", "bundles": ["Paket Lebaran Mewah", "Bunga + Lampu + Vas"]},
            6: {"name": "Musim Pernikahan", "theme": "Bunga pelaminan, dekorasi wedding", "bundles": ["Paket Dekorasi Pelaminan Mini"]},
            7: {"name": "Musim Pernikahan", "theme": "Bunga pelaminan, dekorasi wedding", "bundles": ["Paket Dekorasi Pelaminan Mini"]},
            8: {"name": "HUT RI", "theme": "Dekorasi merah putih", "bundles": ["Paket 17 Agustus"]},
            9: {"name": "Musim Gugur", "theme": "Bunga warna earth tone", "bundles": []},
            10: {"name": "Halloween", "theme": "Lampu hias halloween", "bundles": []},
            11: {"name": "Christmas Prep", "theme": "Dekorasi Natal, lampu pohon natal", "bundles": ["Paket Early Christmas"]},
            12: {"name": "Natal & Tahun Baru", "theme": "Dekorasi Natal premium, lampu warna-warni", "bundles": ["Paket Natal Lengkap", "Bunga + Lampu Natal"]},
        }
        return moments.get(month, {"name": "Promo Reguler", "theme": "Dekorasi harian", "bundles": []})

    async def process(self, user_input: str, context: Dict) -> Dict:
        moment = self._get_current_moment()

        prompt = f"""Kamu adalah Seasonal Promotion Strategist untuk Shopee Indonesia.
Sekarang bulan: {moment['name']} — Tema: {moment['theme']}

Berdasarkan momen dan data produk berikut, buat rekomendasi promosi.

Format output JSON:
{{
    "moment": "{moment['name']}",
    "recommendations": "3-4 rekomendasi actionable (flash deal, bundle, diskon, konten)",
    "impact": "estimasi dampak promosi"
}}

Data produk: {user_input}
"""
        inputs = self.tokenizer([prompt], return_tensors="pt").to(self.model.device)
        outputs = self.model.generate(
            **inputs,
            max_new_tokens=512,
            temperature=0.7,
            top_p=0.9,
            do_sample=True,
            pad_token_id=self.tokenizer.eos_token_id,
        )
        response = self.tokenizer.decode(
            outputs[0][inputs.input_ids.shape[1]:], skip_special_tokens=True
        ).strip()

        try:
            cleaned = response.replace("```json", "").replace("```", "").strip()
            data = json.loads(cleaned)
        except:
            data = {
                "moment": moment["name"],
                "recommendations": "1. Flash sale 25% untuk produk terkait momen\n2. Bundle 2 produk diskon 15%\n3. Tambah kata kunci momen di title",
                "impact": "Estimasi: 20-40% kenaikan penjualan"
            }

        bundle_text = "\n".join([f"• {b}" for b in moment.get("bundles", [])]) or "Sesuaikan dengan stok"

        return {
            "moment": f"**{moment['name']}** — {moment['theme']}\n\n**Rekomendasi Bundle:**\n{bundle_text}",
            "recommendations": data.get("recommendations", ""),
            "impact": data.get("impact", "Estimasi tidak tersedia"),
        }

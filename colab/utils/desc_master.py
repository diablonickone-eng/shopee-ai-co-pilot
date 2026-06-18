import json
from typing import Dict, Any


class DescMaster:
    def __init__(self, model, tokenizer):
        self.model = model
        self.tokenizer = tokenizer

    async def process(self, user_input: str, context: Dict) -> Dict:
        prompt = f"""Kamu adalah Copywriter Spesialis E-commerce Shopee untuk produk bunga artificial dan lampu dekorasi.

Buat deskripsi produk yang KONVERSI TINGGI dengan struktur:
1. HOOK (pembuka menarik, 1-2 kalimat)
2. BENEFIT (masalah yang dipecahkan)
3. FITUR (spesifikasi detail)
4. SOSIAL PROOF (cocok untuk siapa, momen apa)
5. CTA (ajakan beli)
6. TAMBAHKAN keyword Shopee secara natural

Gunakan bahasa Indonesia yang cair, storytelling, dan menyentuh emosi pembeli.

Format output JSON:
{{
    "description": "deskripsi lengkap 300-500 kata",
    "highlights": "3-4 poin benefit utama (single line)",
    "tips": "tips visual/foto tambahan"
}}

Input produk: {user_input}
"""
        inputs = self.tokenizer([prompt], return_tensors="pt").to(self.model.device)
        outputs = self.model.generate(
            **inputs,
            max_new_tokens=1024,
            temperature=0.8,
            top_p=0.95,
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
                "description": response[:500] if response else "Deskripsi tidak tersedia",
                "highlights": "Lihat deskripsi di atas",
                "tips": "Tambahkan foto lifestyle dan video produk"
            }

        return {
            "description": data.get("description", ""),
            "highlights": data.get("highlights", ""),
            "tips": data.get("tips", ""),
        }

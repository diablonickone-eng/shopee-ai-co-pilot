import json
from typing import Dict, Any, List


class TitleDoctor:
    def __init__(self, model, tokenizer):
        self.model = model
        self.tokenizer = tokenizer

    async def process(self, user_input: str, context: Dict) -> Dict:
        prompt = f"""Kamu adalah Title Optimization Specialist untuk Shopee Indonesia.
Produk: bunga artificial dan lampu dekorasi.

Analisis title produk berikut dan berikan 3 varian title yang lebih optimal.

Format output JSON:
{{
    "current_title": "title saat ini",
    "issues": ["masalah 1", "masalah 2"],
    "variants": [
        {{"title": "varian 1", "reason": "alasan", "estimated_impact": "dampak"}},
        {{"title": "varian 2", "reason": "alasan", "estimated_impact": "dampak"}},
        {{"title": "varian 3", "reason": "alasan", "estimated_impact": "dampak"}}
    ],
    "tips": "tips tambahan"
}}

Title yang akan dioptimasi: {user_input}
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
                "current_title": user_input[:50],
                "issues": ["Tidak bisa parse output model"],
                "variants": [
                    {"title": user_input, "reason": "Gunakan title ini sementara", "estimated_impact": "Low"}
                ],
                "tips": "Manual review diperlukan"
            }

        variants_text = ""
        for i, v in enumerate(data.get("variants", []), 1):
            variants_text += f"\n{i}. **{v.get('title')}**\n   → *{v.get('reason')}* — Dampak: {v.get('estimated_impact')}\n"

        return {
            "details": data.get("current_title", "") and f"Title saat ini: **{data['current_title']}**\n\n**Masalah teridentifikasi:** {', '.join(data.get('issues', []))}",
            "variants": variants_text or "Tidak ada varian",
            "tips": data.get("tips", "Tidak ada tips tambahan"),
        }

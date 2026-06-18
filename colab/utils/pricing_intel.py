import json
from typing import Dict, Any


class PricingIntel:
    def __init__(self, model, tokenizer):
        self.model = model
        self.tokenizer = tokenizer

    async def process(self, user_input: str, context: Dict) -> Dict:
        prompt = f"""Kamu adalah Pricing Strategist untuk Shopee Indonesia.
Analisis strategi harga untuk produk berikut dan berikan rekomendasi.

Format output JSON:
{{
    "analysis": "analisis posisi harga, margin, dan kompetitor",
    "recommended_price": "Rp X.XXX",
    "strategy": "strategi pricing lengkap (diskon, bundling, psikologis)"
}}

Data produk: {user_input}
"""
        inputs = self.tokenizer([prompt], return_tensors="pt").to(self.model.device)
        outputs = self.model.generate(
            **inputs,
            max_new_tokens=512,
            temperature=0.6,
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
                "analysis": "Automatic analysis failed",
                "recommended_price": "Perlu review manual",
                "strategy": "Cek harga kompetitor di Shopee secara manual"
            }

        return {
            "analysis": data.get("analysis", ""),
            "recommended_price": data.get("recommended_price", "N/A"),
            "strategy": data.get("strategy", ""),
        }

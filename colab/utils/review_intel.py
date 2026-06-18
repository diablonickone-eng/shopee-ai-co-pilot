import json
from typing import Dict, Any


class ReviewIntel:
    def __init__(self, model, tokenizer):
        self.model = model
        self.tokenizer = tokenizer

    async def process(self, user_input: str, context: Dict) -> Dict:
        prompt = f"""Kamu adalah Review Analyst untuk Shopee Indonesia.
Analisis ulasan produk berikut dan berikan insight actionable.

Format output JSON:
{{
    "summary": "ringkasan sentimen dan skor",
    "pain_points": "3-4 masalah utama yang disebutkan pembeli",
    "improvements": "3-4 rekomendasi perbaikan spesifik"
}}

Ulasan: {user_input}
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
                "summary": "Tidak bisa parse hasil analisis",
                "pain_points": "Review manual diperlukan",
                "improvements": "Review manual diperlukan"
            }

        return {
            "summary": data.get("summary", ""),
            "pain_points": data.get("pain_points", ""),
            "improvements": data.get("improvements", ""),
        }

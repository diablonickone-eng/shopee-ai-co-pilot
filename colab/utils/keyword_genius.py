import json
import re
from typing import Dict, Any


class KeywordGenius:
    def __init__(self, model, tokenizer):
        self.model = model
        self.tokenizer = tokenizer

    async def process(self, user_input: str, context: Dict) -> Dict:
        prompt = f"""Kamu adalah Keyword Research Specialist untuk Shopee Indonesia.
Fokus: produk bunga artificial dan lampu dekorasi.

Berdasarkan input berikut, generate 15-20 keyword Shopee yang relevan.
Kelompokkan berdasarkan intent: (branding, generic, long-tail, event/moment)

Format output JSON:
{{
    "summary": "ringkasan singkat strategi keyword",
    "keywords": [
        {{"keyword": "...", "intent": "long-tail", "priority": "high"}},
        ...
    ],
    "ads_suggestion": "saran untuk Shopee Ads"
}}

Input: {user_input}
"""
        inputs = self.tokenizer([prompt], return_tensors="pt").to(self.model.device)
        outputs = self.model.generate(
            **inputs,
            max_new_tokens=768,
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
                "summary": "Tidak bisa generate keyword otomatis",
                "keywords": [],
                "ads_suggestion": "Gunakan Shopee Ads Panel untuk riset manual"
            }

        kw_text = ""
        for k in data.get("keywords", []):
            priority_emoji = "🔥" if k.get("priority") == "high" else "📌"
            kw_text += f"\n{priority_emoji} **{k['keyword']}** — {k.get('intent', 'generic')}"

        return {
            "summary": data.get("summary", ""),
            "keywords": kw_text or "Tidak ada keyword",
            "ads_suggestion": data.get("ads_suggestion", ""),
        }

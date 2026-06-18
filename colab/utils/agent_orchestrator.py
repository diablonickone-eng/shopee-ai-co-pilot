import json
import re
import time
from typing import Dict, Any, List, Optional


class AgentOrchestrator:
    def __init__(self, model, tokenizer):
        self.model = model
        self.tokenizer = tokenizer
        self.subagents: Dict[str, Any] = {}
        self.conversation_history: List[Dict] = []
        self.max_history = 10

    def register_subagent(self, name: str, agent_instance: Any):
        self.subagents[name] = agent_instance

    async def route(self, user_input: str, context: Optional[Dict] = None) -> Dict:
        intent = await self._classify_intent(user_input)
        trace = [
            {
                "agent": "Orchestrator",
                "action": "Intent Classification",
                "result": intent,
                "duration_ms": 0,
            }
        ]

        self.conversation_history.append({"role": "user", "content": user_input})
        if len(self.conversation_history) > self.max_history * 2:
            self.conversation_history = self.conversation_history[-self.max_history * 2 :]

        start = time.time()

        if intent in self.subagents:
            try:
                result = await self.subagents[intent].process(user_input, context or {})
            except Exception as e:
                result = {"details": f"Subagent error: {str(e)}", "variants": "", "tips": ""}
            trace.append(
                {
                    "agent": intent,
                    "action": "Processing",
                    "result": result.get("summary", ""),
                    "duration_ms": int((time.time() - start) * 1000),
                }
            )
            response_text = self._format_agent_output(intent, result)
        else:
            response_text = await self._direct_response(user_input)
            trace.append(
                {
                    "agent": "Orchestrator (direct)",
                    "action": "Generate Response",
                    "result": response_text[:100],
                    "duration_ms": int((time.time() - start) * 1000),
                }
            )

        self.conversation_history.append({"role": "assistant", "content": response_text})

        return {
            "response": response_text,
            "intent": intent,
            "agent_trace": trace,
        }

    async def _classify_intent(self, user_input: str) -> str:
        prompt = f"""You are an e-commerce intent classifier for Shopee Indonesia.
Products: artificial flowers (bunga artificial) and decorative lights (lampu dekorasi).

Classify this query into ONE category:
- title_optimization: user asks about product title, judul, naming
- keyword_research: user asks about keywords, kata kunci, SEO
- description_writing: user asks about deskripsi, description, copy
- pricing_analysis: user asks about harga, pricing, margin, diskon
- seasonal_promo: user asks about promosi, flash sale, bundling, moment
- review_analysis: user asks about ulasan, review, rating, feedback
- general: anything else

Query: {user_input}

Just return the category name, nothing else."""
        inputs = self.tokenizer([prompt], return_tensors="pt").to(self.model.device)
        outputs = self.model.generate(
            **inputs,
            max_new_tokens=20,
            temperature=0.1,
            do_sample=False,
            pad_token_id=self.tokenizer.eos_token_id,
        )
        response = self.tokenizer.decode(
            outputs[0][inputs.input_ids.shape[1] :], skip_special_tokens=True
        ).strip().lower()

        valid_intents = [
            "title_optimization", "keyword_research", "description_writing",
            "pricing_analysis", "seasonal_promo", "review_analysis", "general",
        ]
        for v in valid_intents:
            if v in response:
                return v
        return "general"

    async def _direct_response(self, user_input: str) -> str:
        messages = [
            {
                "role": "system",
                "content": "Kamu adalah asisten e-commerce Shopee yang ahli dalam optimasi penjualan produk bunga artificial dan lampu dekorasi. Berikan saran yang actionable dan spesifik untuk seller Indonesia.",
            },
            {"role": "user", "content": user_input},
        ]
        text = self.tokenizer.apply_chat_template(
            messages, tokenize=False, add_generation_prompt=True
        )
        inputs = self.tokenizer([text], return_tensors="pt").to(self.model.device)
        outputs = self.model.generate(
            **inputs,
            max_new_tokens=512,
            temperature=0.7,
            top_p=0.9,
            do_sample=True,
            pad_token_id=self.tokenizer.eos_token_id,
        )
        return self.tokenizer.decode(
            outputs[0][inputs.input_ids.shape[1] :], skip_special_tokens=True
        ).strip()

    def _format_agent_output(self, intent: str, result: Dict) -> str:
        templates = {
            "title_optimization": "## ✏️ Optimasi Title\n\n{details}\n\n**Varian Title:**\n{variants}\n\n**Tips:** {tips}",
            "keyword_research": "## 🔍 Keyword Research\n\n{summary}\n\n**Keyword Prioritas:**\n{keywords}\n\n**Saran Bid Ads:** {ads_suggestion}",
            "description_writing": "## 📝 Deskripsi Produk\n\n{description}\n\n**Highlight:** {highlights}\n\n**Tips Tambahan:** {tips}",
            "pricing_analysis": "## 💰 Analisis Harga\n\n{analysis}\n\n**Harga Rekomendasi:** {recommended_price}\n\n**Strategi:** {strategy}",
            "seasonal_promo": "## 📅 Promosi & Bundling\n\n{moment}\n\n**Rekomendasi:** {recommendations}\n\n**Estimasi Dampak:** {impact}",
            "review_analysis": "## ⭐ Analisis Ulasan\n\n{summary}\n\n**Pain Points:** {pain_points}\n\n**Rekomendasi Perbaikan:** {improvements}",
        }
        template = templates.get(intent, "{details}")
        try:
            return template.format(**result)
        except:
            return json.dumps(result, indent=2)

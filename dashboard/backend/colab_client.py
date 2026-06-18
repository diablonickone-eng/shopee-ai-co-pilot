import json
import httpx
from typing import Optional, Dict, Any, List


class ColabClient:
    def __init__(self, base_url: str = "http://localhost:8080"):
        self.base_url = base_url.rstrip("/")
        self.client = httpx.AsyncClient(timeout=120.0)

    async def check_health(self) -> Dict:
        try:
            r = await self.client.get(f"{self.base_url}/health")
            return r.json()
        except Exception as e:
            return {"status": "offline", "error": str(e)}

    async def chat(self, message: str, context: Optional[Dict] = None) -> Dict:
        try:
            r = await self.client.post(
                f"{self.base_url}/chat",
                json={"message": message, "context": context or {}},
            )
            r.raise_for_status()
            return r.json()
        except Exception as e:
            return {
                "error": str(e),
                "response": f"⚠️ Colab server unreachable: {e}",
                "intent": "error",
                "agent_trace": [],
            }

    async def analyze_products(
        self, products: List[Dict], analysis_type: str = "all"
    ) -> Dict:
        try:
            r = await self.client.post(
                f"{self.base_url}/analyze_products",
                json={"products": products, "analysis_type": analysis_type},
            )
            r.raise_for_status()
            return r.json()
        except Exception as e:
            return {"error": str(e), "results": [], "summary": f"Error: {e}"}

    async def generate_keywords(self, product_name: str, category: str = "") -> Dict:
        try:
            r = await self.client.post(
                f"{self.base_url}/generate_keywords",
                params={"product_name": product_name, "category": category},
            )
            r.raise_for_status()
            return r.json()
        except Exception as e:
            return {"error": str(e), "keywords": []}

    async def close(self):
        await self.client.aclose()

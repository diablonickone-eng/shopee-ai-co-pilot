import json
import time
import asyncio
import httpx
from typing import Optional, Dict, Any, List


class ColabClient:
    def __init__(self, base_url: str = "http://localhost:8080", max_retries: int = 2):
        self.base_url = base_url.rstrip("/")
        self.max_retries = max_retries
        self.client = httpx.AsyncClient(timeout=120.0)
        self.last_connected = time.time()
        self.is_connected = False

    def update_url(self, new_url: str):
        self.base_url = new_url.rstrip("/")

    async def check_health(self) -> Dict:
        for attempt in range(self.max_retries):
            try:
                r = await self.client.get(f"{self.base_url}/health", timeout=10.0)
                data = r.json()
                self.last_connected = time.time()
                self.is_connected = True
                return data
            except Exception as e:
                self.is_connected = False
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(1)
                else:
                    return {"status": "offline", "error": str(e)}

    async def chat(self, message: str, context: Optional[Dict] = None) -> Dict:
        for attempt in range(self.max_retries):
            try:
                r = await self.client.post(
                    f"{self.base_url}/chat",
                    json={"message": message, "context": context or {}},
                    timeout=120.0,
                )
                r.raise_for_status()
                self.is_connected = True
                self.last_connected = time.time()
                return r.json()
            except Exception as e:
                self.is_connected = False
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(1)
                else:
                    return {
                        "error": str(e),
                        "response": f"⚠️ Colab server unreachable: {e}",
                        "intent": "error",
                        "agent_trace": [],
                    }

    async def analyze_products(
        self, products: List[Dict], analysis_type: str = "all"
    ) -> Dict:
        for attempt in range(self.max_retries):
            try:
                r = await self.client.post(
                    f"{self.base_url}/analyze_products",
                    json={"products": products, "analysis_type": analysis_type},
                    timeout=120.0,
                )
                r.raise_for_status()
                self.is_connected = True
                return r.json()
            except Exception as e:
                self.is_connected = False
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(1)
                else:
                    return {"error": str(e), "results": [], "summary": f"Error: {e}"}

    async def generate_keywords(self, product_name: str, category: str = "") -> Dict:
        for attempt in range(self.max_retries):
            try:
                r = await self.client.post(
                    f"{self.base_url}/generate_keywords",
                    params={"product_name": product_name, "category": category},
                    timeout=30.0,
                )
                r.raise_for_status()
                self.is_connected = True
                return r.json()
            except Exception as e:
                self.is_connected = False
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(1)
                else:
                    return {"error": str(e), "keywords": []}

    async def close(self):
        await self.client.aclose()

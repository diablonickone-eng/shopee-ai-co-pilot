import json
import uuid
import pandas as pd
from io import StringIO, BytesIO
from fastapi import APIRouter, Request, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict

router = APIRouter()


class ProductSchema(BaseModel):
    sku: Optional[str] = ""
    name: str
    category: Optional[str] = ""
    price: float = 0
    cost: Optional[float] = 0
    stock: Optional[int] = 0
    rating: Optional[float] = 0
    sales_30d: Optional[int] = 0
    competitor_price: Optional[float] = 0


@router.post("/products/upload")
async def upload_products(file: UploadFile = File(...), request: Request):
    session_id = str(uuid.uuid4())
    db = request.app.state.db

    content = await file.read()

    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(StringIO(content.decode('utf-8-sig')))
        else:
            df = pd.read_excel(BytesIO(content))
    except Exception as e:
        raise HTTPException(400, f"Gagal parse file: {e}")

    df = df.where(pd.notna(df), None)
    products = json.loads(df.to_json(orient="records"))

    await db.save_products(session_id, products)

    return {
        "session_id": session_id,
        "total": len(products),
        "columns": df.columns.tolist(),
        "preview": products[:5],
    }


@router.get("/products/{session_id}")
async def get_products(session_id: str, request: Request):
    db = request.app.state.db
    products = await db.get_products(session_id)
    return {"session_id": session_id, "products": products, "total": len(products)}


@router.post("/products/{session_id}/analyze")
async def analyze_products(
    session_id: str,
    analysis_type: str = "all",
    request: Request,
):
    db = request.app.state.db
    colab = request.app.state.colab

    products = await db.get_products(session_id)
    if not products:
        raise HTTPException(404, "Tidak ada produk untuk session ini")
    cache_key = f"analysis_{session_id}_{analysis_type}_{hash(str(products))}"
    cached = await db.get_cache(cache_key)
    if cached:
        return {"cached": True, **cached}

    result = await colab.analyze_products(products, analysis_type)
    await db.set_cache(cache_key, result)
    return {"cached": False, **result}

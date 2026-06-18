from fastapi import APIRouter, Request

router = APIRouter()


@router.get("/analytics/{session_id}")
async def get_analytics(session_id: str, request: Request):
    db = request.app.state.db
    products = await db.get_products(session_id)

    if not products:
        return {"session_id": session_id, "error": "No products found"}

    prices = [p["price"] for p in products if p["price"]]
    costs = [p["cost"] for p in products if p["cost"]]
    ratings = [p["rating"] for p in products if p["rating"]]
    sales = [p["sales_30d"] for p in products if p["sales_30d"]]

    total_stock = sum(p["stock"] for p in products if p["stock"])
    total_sales = sum(sales)

    analytics = {
        "total_products": len(products),
        "total_stock": total_stock,
        "total_sales_30d": total_sales,
        "avg_price": round(sum(prices) / len(prices), 2) if prices else 0,
        "avg_cost": round(sum(costs) / len(costs), 2) if costs else 0,
        "avg_rating": round(sum(ratings) / len(ratings), 2) if ratings else 0,
        "avg_margin_pct": round(
            (sum(prices) - sum(costs)) / sum(prices) * 100, 1
        ) if prices and costs else 0,
        "top_sku": products[sales.index(max(sales))]["sku"] if sales else "",
        "low_stock_items": [
            {"name": p["name"], "stock": p["stock"]}
            for p in products
            if p["stock"] is not None and p["stock"] < 10
        ],
        "no_sales_items": [
            {"name": p["name"], "sku": p["sku"]}
            for p in products
            if p["sales_30d"] == 0
        ],
    }

    return {"session_id": session_id, "analytics": analytics}

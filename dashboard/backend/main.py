from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from routers import chat, products, analytics
from database import Database


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.db = Database()
    await app.state.db.init()
    yield
    await app.state.db.close()


app = FastAPI(title="Shopee AI Co-Pilot Dashboard", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api", tags=["Chat"])
app.include_router(products.router, prefix="/api", tags=["Products"])
app.include_router(analytics.router, prefix="/api", tags=["Analytics"])


@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}

import json
import sqlite3
import os
from datetime import datetime
from typing import Optional, List, Dict, Any


DB_PATH = os.path.join(os.path.dirname(__file__), "data", "shopee_agent.db")


class Database:
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self.conn: Optional[sqlite3.Connection] = None

    async def init(self):
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        self.conn = sqlite3.connect(self.db_path)
        self.conn.row_factory = sqlite3.Row
        self._create_tables()

    def _create_tables(self):
        cur = self.conn.cursor()
        cur.executescript("""
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT UNIQUE,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                intent TEXT,
                created_at TEXT DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT,
                sku TEXT,
                name TEXT,
                category TEXT,
                price REAL,
                cost REAL,
                stock INTEGER,
                rating REAL,
                sales_30d INTEGER,
                competitor_price REAL,
                data JSON,
                created_at TEXT DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS analysis_cache (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cache_key TEXT UNIQUE,
                result JSON,
                created_at TEXT DEFAULT (datetime('now'))
            );
        """)
        self.conn.commit()

    async def save_conversation(self, session_id: str, role: str, content: str, intent: str = ""):
        cur = self.conn.cursor()
        cur.execute(
            "INSERT INTO conversations (session_id, role, content, intent) VALUES (?, ?, ?, ?)",
            (session_id, role, content, intent),
        )
        cur.execute(
            "UPDATE sessions SET updated_at = datetime('now') WHERE session_id = ?",
            (session_id,),
        )
        self.conn.commit()

    async def get_conversation_history(self, session_id: str, limit: int = 20) -> List[Dict]:
        cur = self.conn.cursor()
        cur.execute(
            "SELECT role, content, intent FROM conversations WHERE session_id = ? ORDER BY id DESC LIMIT ?",
            (session_id, limit),
        )
        rows = cur.fetchall()
        return [dict(r) for r in reversed(rows)]

    async def save_products(self, session_id: str, products: List[Dict]):
        cur = self.conn.cursor()
        for p in products:
            cur.execute(
                """INSERT INTO products (session_id, sku, name, category, price, cost, stock, rating, sales_30d, competitor_price, data)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    session_id,
                    p.get("sku", ""),
                    p.get("name", ""),
                    p.get("category", ""),
                    p.get("price", 0),
                    p.get("cost", 0),
                    p.get("stock", 0),
                    p.get("rating", 0),
                    p.get("sales_30d", 0),
                    p.get("competitor_price", 0),
                    json.dumps(p),
                ),
            )
        self.conn.commit()

    async def get_products(self, session_id: str) -> List[Dict]:
        cur = self.conn.cursor()
        cur.execute(
            "SELECT * FROM products WHERE session_id = ? ORDER BY id", (session_id,)
        )
        return [dict(r) for r in cur.fetchall()]

    async def get_cache(self, cache_key: str) -> Optional[Dict]:
        cur = self.conn.cursor()
        cur.execute(
            "SELECT result FROM analysis_cache WHERE cache_key = ?", (cache_key,)
        )
        row = cur.fetchone()
        if row:
            expired = self._is_expired(row["created_at"])
            if not expired:
                return json.loads(row["result"])
        return None

    async def set_cache(self, cache_key: str, result: Dict):
        cur = self.conn.cursor()
        cur.execute(
            "INSERT OR REPLACE INTO analysis_cache (cache_key, result) VALUES (?, ?)",
            (cache_key, json.dumps(result)),
        )
        self.conn.commit()

    def _is_expired(self, created_at: str, hours: int = 6) -> bool:
        try:
            created = datetime.strptime(created_at, "%Y-%m-%d %H:%M:%S")
            delta = datetime.now() - created
            return delta.total_seconds() > hours * 3600
        except:
            return True

    async def close(self):
        if self.conn:
            self.conn.close()

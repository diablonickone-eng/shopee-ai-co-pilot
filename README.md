# Shopee AI Co-Pilot 🤖

AI Agent untuk optimasi penjualan Shopee — khusus produk **Bunga Artificial** dan **Lampu Dekorasi**.

## Arsitektur

```
Colab (Qwen 2.5 7B 4-bit) ──► Dashboard (Next.js + Tailwind)
       │                              │
  Inference Server              FastAPI Backend
  (ngrok tunnel)                (local proxy)
```

## Cara Jalankan

### 1. Colab
Buka `colab/model_server.ipynb` di Google Colab → Runtime T4 GPU → Run All

### 2. Backend
```bash
cd dashboard/backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Frontend
```bash
cd dashboard/frontend
npm install
npm run dev
```

### 4. Connect
Buka `http://localhost:3000` → Settings → paste URL ngrok → Simpan

## Subagent
| Agent | Fungsi |
|---|---|
| TitleDoctor | Optimasi title produk |
| KeywordGenius | Riset keyword Shopee |
| DescMaster | Copywriting deskripsi |
| PricingIntel | Analisis harga & margin |
| SeasonalPro | Promosi & bundling musiman |
| ReviewIntel | Sentimen ulasan |

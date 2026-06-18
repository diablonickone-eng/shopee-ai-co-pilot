"use client";

import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [colabUrl, setColabUrl] = useState("http://localhost:8080");

  useEffect(() => {
    const saved = localStorage.getItem("colab_url");
    if (saved) setColabUrl(saved);
  }, []);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem("colab_url", colabUrl);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-white">⚙️ Settings</h2>
        <p className="text-slate-400 text-sm mt-1">
          Konfigurasi koneksi ke Colab server
        </p>
      </div>

      <div className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Colab Server URL
          </label>
          <input
            type="text"
            value={colabUrl}
            onChange={(e) => setColabUrl(e.target.value)}
            placeholder="https://xxxx.ngrok.io"
            className="input-field"
          />
          <p className="text-xs text-slate-500 mt-1">
            Masukkan URL ngrok yang muncul di Colab notebook (Cell 8)
          </p>
        </div>

        <button onClick={handleSave} className="btn-primary">
          {saved ? "✓ Tersimpan" : "Simpan"}
        </button>
      </div>

      <div className="card space-y-3">
        <h3 className="text-sm font-semibold text-slate-200">📋 Cara Setup</h3>
        <ol className="text-sm text-slate-400 space-y-2 list-decimal list-inside">
          <li>Buka <code className="text-accent-400">colab/model_server.ipynb</code> di Google Colab</li>
          <li>Jalankan semua cell dari atas ke bawah</li>
          <li>Copy URL ngrok dari Cell 8</li>
          <li>Paste URL di atas dan klik Simpan</li>
          <li>Jalankan dashboard backend: <code className="text-accent-400">cd dashboard/backend &amp;&amp; uvicorn main:app --reload</code></li>
          <li>Jalankan frontend: <code className="text-accent-400">cd dashboard/frontend &amp;&amp; npm run dev</code></li>
        </ol>
      </div>
    </div>
  );
}

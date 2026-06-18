"use client";

import { useState, useCallback } from "react";
import FileUpload from "@/components/FileUpload";
import ProductTable from "@/components/ProductTable";
import { api } from "@/api/client";

export default function ProductsPage() {
  const [sessionId, setSessionId] = useState<string>("");
  const [products, setProducts] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>("");

  const handleUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    try {
      const result = await api.uploadProducts(file);
      setSessionId(result.session_id);
      setProducts(result.preview);
      setAnalysisResult("");
    } catch (error: any) {
      alert(`Upload gagal: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleAnalyze = useCallback(
    async (type: string) => {
      if (!sessionId) return;
      setIsAnalyzing(true);
      try {
        const result = await api.analyzeProducts(sessionId, type);
        setAnalysisResult(result.summary);
      } catch (error: any) {
        alert(`Analisis gagal: ${error.message}`);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [sessionId]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">📦 Produk</h2>
        <p className="text-slate-400 text-sm mt-1">
          Upload data produk untuk analisis dan optimasi
        </p>
      </div>

      <FileUpload onUpload={handleUpload} isUploading={isUploading} />

      {analysisResult && (
        <div className="card">
          <h3 className="text-sm font-semibold text-accent-400 mb-2">
            📋 Hasil Analisis
          </h3>
          <p className="text-sm text-slate-300 whitespace-pre-wrap">
            {analysisResult}
          </p>
        </div>
      )}

      <ProductTable
        products={products}
        onAnalyze={handleAnalyze}
        isAnalyzing={isAnalyzing}
      />
    </div>
  );
}

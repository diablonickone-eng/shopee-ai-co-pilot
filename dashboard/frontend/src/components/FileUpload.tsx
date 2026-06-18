"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}

export default function FileUpload({ onUpload, isUploading }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        await onUpload(acceptedFiles[0]);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
        dragOver
          ? "border-shopee-500 bg-shopee-500/10"
          : "border-slate-600 hover:border-slate-500 bg-slate-800/50"
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        <span className="text-4xl">📤</span>
        {isUploading ? (
          <div className="flex items-center gap-2">
            <span className="thinking-dot" />
            <span className="text-slate-300">Mengupload...</span>
          </div>
        ) : (
          <>
            <p className="text-slate-300 font-medium">
              Upload CSV / Excel produk kamu
            </p>
            <p className="text-xs text-slate-500">
              Drag & drop atau klik untuk browse
            </p>
            <span className="badge-info text-[10px]">
              Format: SKU, Nama, Harga, Modal, Stok, Rating, Penjualan
            </span>
          </>
        )}
      </div>
    </div>
  );
}

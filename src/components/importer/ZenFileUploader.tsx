"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type UploadState =
  | "idle"
  | "dragging"
  | "uploading"
  | "processing"
  | "success"
  | "error";

export interface ParsedTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  suggested_category: string;
}

interface ZenFileUploaderProps {
  onUploadComplete: (data: ParsedTransaction[]) => void;
  onError?: (error: string) => void;
  maxSizeMB?: number;
}

const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
  "text/csv": [".csv"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
    ".xlsx",
  ],
};

export function ZenFileUploader({
  onUploadComplete,
  onError,
  maxSizeMB = 5,
}: ZenFileUploaderProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setState("uploading");
    setFileName(file.name);
    setError(null);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 150);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-statement", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      setProgress(100);
      setState("processing");

      const data = await response.json();

      setState("success");

      // Wait for animation then pass data
      setTimeout(() => {
        onUploadComplete(data.transactions);
      }, 800);
    } catch (err) {
      clearInterval(progressInterval);
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      setState("error");
      onError?.(message);
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0]?.code === "file-too-large") {
          setError(`Archivo muy grande. Máximo ${maxSizeMB}MB.`);
        } else if (rejection.errors[0]?.code === "file-invalid-type") {
          setError("Tipo de archivo inválido. Solo PDF, CSV o Excel.");
        } else {
          setError("Archivo rechazado. Intenta de nuevo.");
        }
        setState("error");
        return;
      }

      if (acceptedFiles.length > 0) {
        await handleUpload(acceptedFiles[0]);
      }
    },
    [maxSizeMB]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    maxSize: maxSizeMB * 1024 * 1024,
    onDragEnter: () => setState("dragging"),
    onDragLeave: () => setState("idle"),
  });

  const reset = () => {
    setState("idle");
    setProgress(0);
    setError(null);
    setFileName(null);
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {/* IDLE / DRAGGING STATE */}
        {(state === "idle" || state === "dragging") && (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}>
            <div
              {...getRootProps()}
              className={cn(
                "relative cursor-pointer",
                "border-2 border-dashed rounded-2xl",
                "p-8 md:p-12 text-center",
                "transition-all duration-200",
                isDragActive || state === "dragging"
                  ? "border-emerald-500 bg-emerald-50 scale-[1.02]"
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}>
              <input {...getInputProps()} />

              <motion.div
                animate={{
                  scale: isDragActive ? 1.15 : 1,
                  y: isDragActive ? -8 : 0,
                }}
                className="inline-flex">
                <div
                  className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto",
                    "transition-colors duration-200",
                    isDragActive
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-slate-100 text-slate-400"
                  )}>
                  <Upload className="w-8 h-8" />
                </div>
              </motion.div>

              <h3
                className={cn(
                  "text-lg font-bold mb-2 transition-colors",
                  isDragActive ? "text-emerald-700" : "text-slate-900"
                )}>
                {isDragActive
                  ? "¡Suelta el archivo aquí!"
                  : "Arrastra tu estado de cuenta"}
              </h3>

              <p className="text-sm text-slate-500 mb-4">
                O haz clic para seleccionar
              </p>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <FileText className="w-3 h-3" />
                <span>PDF, CSV, Excel • Máximo {maxSizeMB}MB</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* UPLOADING STATE */}
        {state === "uploading" && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border border-slate-200 rounded-2xl p-8 bg-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">
                  {fileName}
                </p>
                <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "easeOut" }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Subiendo... {progress}%
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* PROCESSING STATE */}
        {state === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border border-slate-200 rounded-2xl p-8 bg-white text-center">
            <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <Sparkles className="w-8 h-8 text-violet-600 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Analizando transacciones...
            </h3>
            <p className="text-sm text-slate-500">
              AI está categorizando tu estado de cuenta
            </p>
            <Loader2 className="w-5 h-5 animate-spin text-violet-500 mx-auto mt-4" />
          </motion.div>
        )}

        {/* SUCCESS STATE */}
        {state === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="border border-emerald-200 rounded-2xl p-8 bg-emerald-50 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
              className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </motion.div>
            <h3 className="text-lg font-bold text-emerald-700">
              ¡Archivo procesado!
            </h3>
          </motion.div>
        )}

        {/* ERROR STATE */}
        {state === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border border-red-200 rounded-2xl p-8 bg-red-50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-red-700 mb-1">
                  Error al procesar
                </h3>
                <p className="text-sm text-red-600 mb-4">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={reset}
                  className="text-red-600 border-red-300 hover:bg-red-100">
                  Intentar de nuevo
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

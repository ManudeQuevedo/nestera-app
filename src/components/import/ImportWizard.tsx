"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// Column mapping configuration
const FIELD_MAPPINGS = {
  date: ["date", "fecha", "date_time", "transaction_date", "created_at"],
  description: [
    "description",
    "descripcion",
    "desc",
    "memo",
    "note",
    "merchant",
    "comercio",
  ],
  amount: [
    "amount",
    "monto",
    "cantidad",
    "value",
    "valor",
    "total",
    "cost",
    "costo",
    "importe",
  ],
  type: ["type", "tipo", "transaction_type"],
  category: ["category", "categoria", "cat", "category_name"],
  payment_method: ["payment_method", "metodo", "method", "payment", "pago"],
};

type FieldKey = keyof typeof FIELD_MAPPINGS;

interface ParsedRow {
  [key: string]: string | number;
}

interface ColumnMapping {
  [sourceColumn: string]: FieldKey | "ignore";
}

interface ImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: TransactionImport[]) => Promise<void>;
}

export interface TransactionImport {
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category?: string;
  payment_method?: string;
}

export function ImportWizard({ isOpen, onClose, onImport }: ImportWizardProps) {
  const t = useTranslations("Common");
  const [step, setStep] = useState<"upload" | "mapping" | "preview">("upload");
  const [fileName, setFileName] = useState<string>("");
  const [rawData, setRawData] = useState<ParsedRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setStep("upload");
    setFileName("");
    setRawData([]);
    setHeaders([]);
    setColumnMapping({});
    setError(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // Auto-detect column mapping
  const autoDetectMapping = (headers: string[]): ColumnMapping => {
    const mapping: ColumnMapping = {};

    headers.forEach((header) => {
      const normalizedHeader = header
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]/g, "_");

      for (const [field, aliases] of Object.entries(FIELD_MAPPINGS)) {
        if (aliases.some((alias) => normalizedHeader.includes(alias))) {
          mapping[header] = field as FieldKey;
          break;
        }
      }

      if (!mapping[header]) {
        mapping[header] = "ignore";
      }
    });

    return mapping;
  };

  // Parse file content
  const parseFile = useCallback(async (file: File) => {
    setError(null);
    setFileName(file.name);

    try {
      const extension = file.name.split(".").pop()?.toLowerCase();

      if (extension === "csv") {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.data.length === 0) {
              setError("El archivo está vacío");
              return;
            }
            const data = results.data as ParsedRow[];
            const fileHeaders = Object.keys(data[0]);
            setRawData(data);
            setHeaders(fileHeaders);
            setColumnMapping(autoDetectMapping(fileHeaders));
            setStep("mapping");
          },
          error: (err) => {
            setError(`Error al leer CSV: ${err.message}`);
          },
        });
      } else if (extension === "xlsx" || extension === "xls") {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json<ParsedRow>(sheet);

        if (data.length === 0) {
          setError("El archivo está vacío");
          return;
        }

        const fileHeaders = Object.keys(data[0]);
        setRawData(data);
        setHeaders(fileHeaders);
        setColumnMapping(autoDetectMapping(fileHeaders));
        setStep("mapping");
      } else {
        setError("Formato no soportado. Usa .csv o .xlsx");
      }
    } catch (err) {
      setError(`Error al procesar archivo: ${err}`);
    }
  }, []);

  // Dropzone configuration
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        parseFile(acceptedFiles[0]);
      }
    },
    [parseFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
  });

  // Transform data for import
  const transformData = (): TransactionImport[] => {
    return rawData.map((row) => {
      const transformed: Partial<TransactionImport> = {};

      for (const [sourceCol, targetField] of Object.entries(columnMapping)) {
        if (targetField === "ignore") continue;

        const value = row[sourceCol];

        if (targetField === "amount") {
          const numValue =
            typeof value === "number"
              ? value
              : parseFloat(String(value).replace(/[^0-9.-]/g, ""));
          transformed.amount = Math.abs(numValue) || 0;

          // Auto-detect type based on negative/positive
          if (typeof value === "number" && value < 0) {
            transformed.type = "expense";
          } else if (typeof value === "string" && value.includes("-")) {
            transformed.type = "expense";
          }
        } else if (targetField === "date") {
          transformed.date = normalizeDate(String(value));
        } else if (targetField === "type") {
          const typeValue = String(value).toLowerCase();
          transformed.type =
            typeValue.includes("ingreso") || typeValue.includes("income")
              ? "income"
              : "expense";
        } else {
          (transformed as Record<string, unknown>)[targetField] = String(value);
        }
      }

      // Default values
      if (!transformed.type) transformed.type = "expense";
      if (!transformed.date)
        transformed.date = new Date().toISOString().split("T")[0];
      if (!transformed.description) transformed.description = "";

      return transformed as TransactionImport;
    });
  };

  const normalizeDate = (dateStr: string): string => {
    try {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split("T")[0];
      }
    } catch {
      // Fall through
    }
    return new Date().toISOString().split("T")[0];
  };

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const transformedData = transformData();
      await onImport(transformedData);
      handleClose();
    } catch (err) {
      setError(`Error al importar: ${err}`);
    } finally {
      setIsImporting(false);
    }
  };

  const previewData = step === "preview" ? transformData().slice(0, 5) : [];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importar Transacciones
          </DialogTitle>
          <DialogDescription>
            {step === "upload" &&
              "Sube un archivo CSV o Excel con tus transacciones"}
            {step === "mapping" && "Verifica la asignación de columnas"}
            {step === "preview" && "Revisa los datos antes de importar"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors",
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            )}>
            <input {...getInputProps()} />
            <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">
              {isDragActive
                ? "Suelta el archivo aquí"
                : "Arrastra un archivo o haz clic"}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Formatos soportados: .csv, .xlsx
            </p>
          </div>
        )}

        {/* Step 2: Column Mapping */}
        {step === "mapping" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Archivo: <strong>{fileName}</strong> ({rawData.length} filas)
              </span>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Columna del archivo</TableHead>
                    <TableHead>Mapear a campo</TableHead>
                    <TableHead>Ejemplo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {headers.map((header) => (
                    <TableRow key={header}>
                      <TableCell className="font-medium">{header}</TableCell>
                      <TableCell>
                        <Select
                          value={columnMapping[header] || "ignore"}
                          onValueChange={(value) =>
                            setColumnMapping((prev) => ({
                              ...prev,
                              [header]: value as FieldKey | "ignore",
                            }))
                          }>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ignore">❌ Ignorar</SelectItem>
                            <SelectItem value="date">📅 Fecha</SelectItem>
                            <SelectItem value="description">
                              📝 Descripción
                            </SelectItem>
                            <SelectItem value="amount">💰 Monto</SelectItem>
                            <SelectItem value="type">🏷️ Tipo</SelectItem>
                            <SelectItem value="category">
                              📂 Categoría
                            </SelectItem>
                            <SelectItem value="payment_method">
                              💳 Método de Pago
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {String(rawData[0]?.[header] || "").slice(0, 30)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === "preview" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
              <CheckCircle2 className="h-4 w-4" />
              {rawData.length} transacciones listas para importar
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Tipo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>
                        {row.description?.slice(0, 40) || "-"}
                      </TableCell>
                      <TableCell>${row.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "text-xs px-2 py-1 rounded-full",
                            row.type === "income"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          )}>
                          {row.type === "income" ? "Ingreso" : "Gasto"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {rawData.length > 5 && (
              <p className="text-sm text-muted-foreground text-center">
                Mostrando 5 de {rawData.length} transacciones
              </p>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>

          {step === "mapping" && (
            <Button onClick={() => setStep("preview")}>
              Continuar a Vista Previa
            </Button>
          )}

          {step === "preview" && (
            <Button onClick={handleImport} disabled={isImporting}>
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Importar {rawData.length} Transacciones
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

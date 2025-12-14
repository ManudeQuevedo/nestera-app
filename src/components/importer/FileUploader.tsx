"use client";

import { useState } from "react";

import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Category } from "@/types/finance";
import { createTransaction } from "@/actions/transactions";

interface FileUploaderProps {
  categories: Category[];
  onUploadComplete?: () => void;
}

interface ParsedRow {
  [key: string]: string | number;
}

const REQUIRED_FIELDS = ["date", "amount", "description"];

export function FileUploader({
  categories,
  onUploadComplete,
}: FileUploaderProps) {
  const [data, setData] = useState<ParsedRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Dropzone setup would usually require installing 'react-dropzone'
  // But since I didn't verify if it's installed, let's use a simple input for now or assume I installed it?
  // I didn't install 'react-dropzone'. I will use a standard input type="file".

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith(".csv")) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          setHeaders(results.meta.fields || []);
          setData(results.data as ParsedRow[]);
          // Auto-guess mapping
          guessMapping(results.meta.fields || []);
        },
      });
    } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });
        if (jsonData.length > 0) {
          const keys = jsonData[0] as string[];
          const rows = jsonData.slice(1).map((row) => {
            const obj: any = {};
            keys.forEach((key, i) => (obj[key] = (row as any)[i]));
            return obj;
          });
          setHeaders(keys);
          setData(rows);
          guessMapping(keys);
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  const guessMapping = (fields: string[]) => {
    const newMapping: Record<string, string> = {};
    fields.forEach((field) => {
      const lower = field.toLowerCase();
      if (lower.includes("date") || lower.includes("time"))
        newMapping["date"] = field;
      if (
        lower.includes("amount") ||
        lower.includes("price") ||
        lower.includes("cost") ||
        lower.includes("value")
      )
        newMapping["amount"] = field;
      if (
        lower.includes("desc") ||
        lower.includes("memo") ||
        lower.includes("narrative")
      )
        newMapping["description"] = field;
    });
    setMapping(newMapping);
  };

  const handleImport = async () => {
    setIsProcessing(true);
    let successCount = 0;

    // Process each row
    for (const row of data) {
      if (!row[mapping.date] || !row[mapping.amount]) continue;

      const description = row[mapping.description]?.toString() || "";
      const amountStr = row[mapping.amount]
        ?.toString()
        .replace(/[^0-9.-]/g, "");
      const amount = parseFloat(amountStr);
      const dateStr = row[mapping.date]?.toString();
      // Basic date parse - assume YYYY-MM-DD or standard JS parse
      const date = new Date(dateStr).toISOString().split("T")[0];

      // Auto-categorize
      let categoryId = categories[0]?.id; // Default fallback
      const lowerDesc = description.toLowerCase();

      // Simple keyword matching for demo
      for (const cat of categories) {
        if (lowerDesc.includes(cat.name.toLowerCase())) {
          categoryId = cat.id;
          break;
        }
        // Add more heuristics here usually
      }

      const formData = new FormData();
      formData.append("amount", amount.toString());
      formData.append("date", date);
      formData.append("description", description);
      formData.append("category_id", categoryId);
      formData.append("type", amount < 0 ? "expense" : "expense"); // Heuristic: usually csv are expenses, income is positive? Or assume expense for now.
      // Better heuristic: if amount < 0, it depends on how bank reports it.
      // Let's assume absolute amount is expense unless flagged.
      // Actually, let's just default to expense unless we mapped a type column.

      try {
        await createTransaction(formData);
        successCount++;
      } catch (e) {
        console.error("Failed to import row", row, e);
      }
    }

    setIsProcessing(false);
    alert(`Imported ${successCount} transactions!`);
    if (onUploadComplete) onUploadComplete();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Smart Import</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!data.length ? (
          <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-4">
            <div className="flex justify-center">
              <Upload className="w-12 h-12 text-muted-foreground" />
            </div>
            <div>
              <Label
                htmlFor="file-upload"
                className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md">
                Select CSV or Excel
              </Label>
              <Input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileUpload}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Supported formats: .csv, .xlsx
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {REQUIRED_FIELDS.map((field) => (
                <div key={field} className="space-y-2">
                  <Label>Map {field}</Label>
                  <Select
                    value={mapping[field] || ""}
                    onValueChange={(val) =>
                      setMapping({ ...mapping, [field]: val })
                    }>
                    <SelectTrigger>
                      <SelectValue placeholder={`Select column for ${field}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {headers.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div className="max-h-[300px] overflow-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    {headers.map((h) => (
                      <TableHead key={h}>{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.slice(0, 5).map((row, i) => (
                    <TableRow key={i}>
                      {headers.map((h) => (
                        <TableCell key={h}>{row[h]}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setData([])}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={isProcessing}>
                {isProcessing ? "Importing..." : "Import Transactions"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

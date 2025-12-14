"use client";

import * as XLSX from "xlsx";
import { Transaction } from "@/types/finance";

interface ExportData {
  transactions: Transaction[];
  totalIncome: number;
  totalExpenses: number;
  totalDebt: number;
  categories: { name: string; budget_limit?: number }[];
}

export function generateFinanceExport(data: ExportData): void {
  const workbook = XLSX.utils.book_new();
  const today = new Date().toISOString().split("T")[0];

  // ===== SHEET 1: Summary =====
  const summaryData = [
    ["Nestera - Resumen Financiero", ""],
    ["Generado:", today],
    ["", ""],
    ["Métrica", "Valor"],
    ["Ingresos Totales", formatCurrency(data.totalIncome)],
    ["Gastos Totales", formatCurrency(data.totalExpenses)],
    ["Balance Neto", formatCurrency(data.totalIncome - data.totalExpenses)],
    ["Deuda Total", formatCurrency(data.totalDebt)],
    ["Patrimonio Neto", formatCurrency(data.totalIncome - data.totalExpenses - data.totalDebt)],
    ["", ""],
    ["Total Transacciones", data.transactions.length.toString()],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Set column widths
  summarySheet["!cols"] = [{ wch: 25 }, { wch: 20 }];
  
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumen");

  // ===== SHEET 2: Transactions =====
  const transactionHeaders = [
    "Fecha",
    "Descripción",
    "Categoría",
    "Tipo",
    "Monto",
    "Método de Pago",
  ];

  const transactionRows = data.transactions.map((tx) => [
    new Date(tx.date).toLocaleDateString("es-MX"),
    tx.description || "",
    tx.category_id || "Sin categoría",
    tx.type === "income" ? "Ingreso" : "Gasto",
    tx.type === "income" ? tx.amount : -tx.amount,
    tx.payment_method || "",
  ]);

  const transactionsData = [transactionHeaders, ...transactionRows];
  const transactionsSheet = XLSX.utils.aoa_to_sheet(transactionsData);

  // Set column widths
  transactionsSheet["!cols"] = [
    { wch: 12 }, // Date
    { wch: 30 }, // Description
    { wch: 18 }, // Category
    { wch: 10 }, // Type
    { wch: 15 }, // Amount
    { wch: 15 }, // Payment Method
  ];

  XLSX.utils.book_append_sheet(workbook, transactionsSheet, "Transacciones");

  // ===== SHEET 3: Categories =====
  if (data.categories && data.categories.length > 0) {
    const categoryHeaders = ["Categoría", "Límite Mensual"];
    const categoryRows = data.categories.map((cat) => [
      cat.name,
      cat.budget_limit || 0,
    ]);

    const categoriesData = [categoryHeaders, ...categoryRows];
    const categoriesSheet = XLSX.utils.aoa_to_sheet(categoriesData);

    categoriesSheet["!cols"] = [{ wch: 25 }, { wch: 15 }];

    XLSX.utils.book_append_sheet(workbook, categoriesSheet, "Categorías");
  }

  // Generate and download the file
  const fileName = `Nestera_Export_${today}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
}

// CSV Export alternative
export function generateCSVExport(transactions: Transaction[]): void {
  const headers = ["Fecha", "Descripción", "Categoría", "Tipo", "Monto", "Método de Pago"];
  
  const rows = transactions.map((tx) => [
    new Date(tx.date).toISOString().split("T")[0],
    `"${(tx.description || "").replace(/"/g, '""')}"`,
    tx.category_id || "",
    tx.type,
    tx.amount.toString(),
    tx.payment_method || "",
  ]);

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Nestera_Transactions_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

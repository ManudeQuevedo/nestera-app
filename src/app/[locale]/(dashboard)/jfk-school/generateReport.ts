"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { SchoolPayment } from "@/types/school";

export async function generateSchoolReport(
  payments: SchoolPayment[],
  title: string = "JFK School Payment Report"
): Promise<void> {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(43, 45, 66); // #2b2d42
  doc.text(title, 14, 22);

  // Subtitle with date
  doc.setFontSize(10);
  doc.setTextColor(141, 153, 174); // #8d99ae
  doc.text(`Generated on ${new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })}`, 14, 30);

  // Summary
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  doc.setFontSize(12);
  doc.setTextColor(43, 45, 66);
  doc.text(`Total: $${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 14, 40);
  doc.text(`Number of Payments: ${payments.length}`, 14, 48);

  // Table data
  const tableData = payments.map((p) => [
    new Date(p.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    p.concept,
    p.category,
    `$${p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
  ]);

  // Generate table
  autoTable(doc, {
    startY: 55,
    head: [["Date", "Concept", "Category", "Amount"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [43, 45, 66], // #2b2d42
      textColor: [237, 242, 244], // #edf2f4
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: "auto" },
      2: { cellWidth: 35 },
      3: { cellWidth: 30, halign: "right" },
    },
  });

  // Get final Y position after table
  const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 55;

  // Add receipts section if any payments have receipts
  const paymentsWithReceipts = payments.filter((p) => p.receipt_url);
  
  if (paymentsWithReceipts.length > 0) {
    let currentY = finalY + 15;

    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(43, 45, 66);
    doc.text("Receipt Evidence", 14, currentY);
    currentY += 10;

    // Add each receipt image
    for (const payment of paymentsWithReceipts) {
      if (!payment.receipt_url) continue;

      try {
        // Fetch image and convert to base64
        const response = await fetch(payment.receipt_url);
        const blob = await response.blob();
        const base64 = await blobToBase64(blob);

        // Check if we need a new page
        if (currentY > 200) {
          doc.addPage();
          currentY = 20;
        }

        // Add label
        doc.setFontSize(10);
        doc.setTextColor(43, 45, 66);
        doc.text(`${payment.concept} - ${new Date(payment.date).toLocaleDateString()}`, 14, currentY);
        currentY += 5;

        // Add image (max width 180, auto-scale height)
        const imgWidth = 100;
        const imgHeight = 75; // Approximate aspect ratio
        doc.addImage(base64, "JPEG", 14, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 15;
      } catch (err) {
        console.warn("Failed to add receipt image:", err);
        doc.setFontSize(8);
        doc.setTextColor(200, 100, 100);
        doc.text(`[Receipt image unavailable: ${payment.concept}]`, 14, currentY);
        currentY += 10;
      }
    }
  }

  // Save the PDF
  const fileName = `JFK_Report_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

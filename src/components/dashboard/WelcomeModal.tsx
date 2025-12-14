"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddTransactionDrawer } from "@/components/transactions/AddTransactionDrawer";
import { FileUploader } from "@/components/importer/FileUploader";
import { Category } from "@/types/finance";

interface WelcomeModalProps {
  categories: Category[];
}

export function WelcomeModal({ categories }: WelcomeModalProps) {
  const [open, setOpen] = useState(false);
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    // Open immediately on mount if rendered
    setOpen(true);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {showImport ? "Import Transactions" : "Welcome to Wealth OS"}
          </DialogTitle>
          <DialogDescription>
            {showImport
              ? "Upload your CSV or Excel file to get started."
              : "Start by adding your first transaction or setting up a budget to see your financial insights."}
          </DialogDescription>
        </DialogHeader>

        {showImport ? (
          <div className="py-4">
            <FileUploader
              categories={categories}
              onUploadComplete={() => {
                setOpen(false);
                window.location.reload();
              }}
            />
            <div className="mt-2 text-center">
              <Button variant="link" onClick={() => setShowImport(false)}>
                Back to options
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl">
              👋
            </div>
            <Button
              variant="outline"
              size="sm"
              className="opacity-50 hover:opacity-100 transition-opacity"
              onClick={async () => {
                const { generateMockData } = await import(
                  "@/actions/seed"
                );
                await generateMockData();
                window.location.reload();
              }}>
              Generate Demo Data (2025)
            </Button>
          </div>
        )}

        {!showImport && (
          <DialogFooter className="sm:justify-between flex-col sm:flex-row-reverse gap-2">
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <AddTransactionDrawer
                categories={categories}
                trigger={<Button className="w-full">Manual Entry</Button>}
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowImport(true)}>
                Import File
              </Button>
            </div>
            <Button
              variant="ghost"
              className="w-full sm:w-auto mt-2 sm:mt-0"
              onClick={() => setOpen(false)}>
              Skip for now
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

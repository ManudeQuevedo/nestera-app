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

interface OnboardingModalProps {
  categories: Category[];
}

export function OnboardingModal({ categories }: OnboardingModalProps) {
  const [open, setOpen] = useState(false);
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    // Small delay to ensure Portal target is ready and animations trigger correctly
    const timer = setTimeout(() => setOpen(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Strict: Prevent closing by default means we just don't provide a way to setOpen(false)
  // except via the actions.
  // We also intercept onInteractOutside.

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        // Prevent closing if val is false, unless we explicitly allow it?
        // actually for strict modal, we just force it open.
        // But if we want to allow "Generate Demo Data" to close it (via reload), that's handled by logic.
        // If user presses Escape, val becomes false. We want to ignore that.
        if (!val) return;
        setOpen(val);
      }}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        showCloseButton={false}
        className="sm:max-w-[500px] z-[100] bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {showImport ? "Import Transactions" : "Welcome to Family Wealth"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {showImport
              ? "Upload your CSV or Excel file to get started."
              : "Your financial cockpit is ready. Let's get some data in here."}
          </DialogDescription>
        </DialogHeader>

        {showImport ? (
          <div className="py-4">
            <FileUploader
              categories={categories}
              onUploadComplete={() => {
                setOpen(false); // Technically trigger reload?
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
            {/* We could add an illustration here */}
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl">
              🚀
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
          <DialogFooter className="flex-col sm:flex-col gap-2">
            {/* Primary Action */}
            <AddTransactionDrawer
              categories={categories}
              trigger={
                <Button className="w-full">Add First Transaction</Button>
              }
            />
            {/* Secondary Action */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowImport(true)}>
              Import Data
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

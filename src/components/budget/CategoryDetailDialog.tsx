"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Pencil,
  Plus,
  X,
  Check,
  Loader2,
  Camera,
  Upload,
  ArrowLeft,
  ChevronsUpDown,
} from "lucide-react";
import { Category, Transaction } from "@/types/finance";
import { cn } from "@/lib/utils";

type Currency = "MXN" | "USD" | "EUR";

interface CategoryDetailDialogProps {
  category: Category;
  spent: number;
  transactions: Transaction[];
  trigger: React.ReactNode;
}

// LocalStorage key for saved stores
const STORES_STORAGE_KEY = "saved-expense-stores";

// Helper to get stores from localStorage
function getSavedStores(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Helper to save a store to localStorage
function saveStore(storeName: string): void {
  if (typeof window === "undefined" || !storeName.trim()) return;
  try {
    const stores = getSavedStores();
    if (!stores.includes(storeName.trim())) {
      stores.unshift(storeName.trim()); // Add to beginning (most recent)
      localStorage.setItem(
        STORES_STORAGE_KEY,
        JSON.stringify(stores.slice(0, 50))
      ); // Keep max 50
    }
  } catch {
    // Ignore storage errors
  }
}

export function CategoryDetailDialog({
  category,
  spent,
  transactions,
  trigger,
}: CategoryDetailDialogProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [budget, setBudget] = useState(category.budget_limit.toString());
  const [saving, setSaving] = useState(false);

  // Add Expense Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [storeComboOpen, setStoreComboOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("MXN");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const remaining = category.budget_limit - spent;
  const percent =
    category.budget_limit > 0 ? (spent / category.budget_limit) * 100 : 0;

  // Load saved stores on mount
  const [savedStores, setSavedStores] = useState<string[]>([]);

  useEffect(() => {
    setSavedStores(getSavedStores());
  }, [showAddForm]); // Refresh when form opens

  // Filter stores based on input
  const filteredStores = useMemo(() => {
    if (!storeName) return savedStores;
    return savedStores.filter((store) =>
      store.toLowerCase().includes(storeName.toLowerCase())
    );
  }, [storeName, savedStores]);

  const handleSaveBudget = async () => {
    setSaving(true);
    // TODO: Save to Supabase
    setTimeout(() => {
      setSaving(false);
      setEditing(false);
    }, 500);
  };

  const handleAddExpense = async () => {
    if (!storeName || !amount || parseFloat(amount) <= 0) return;

    setIsSubmitting(true);
    try {
      // Save store name for future autocomplete
      saveStore(storeName);

      // TODO: Save expense to Supabase
      console.log("Adding expense:", {
        storeName,
        amount: parseFloat(amount),
        currency,
        receiptFile,
        categoryId: category.id,
      });

      // Reset form and close
      setTimeout(() => {
        setStoreName("");
        setAmount("");
        setCurrency("MXN");
        setReceiptFile(null);
        setShowAddForm(false);
        setIsSubmitting(false);
        // Refresh stores list
        setSavedStores(getSavedStores());
      }, 500);
    } catch (error) {
      console.error("Error adding expense:", error);
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-full max-w-2xl p-0 gap-0 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <DialogHeader className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-zinc-900 dark:to-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{category.name}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Monthly Budget
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setEditing(!editing)}>
              {editing ? (
                <X className="h-4 w-4" />
              ) : (
                <Pencil className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Budget Display/Edit */}
          <div className="mt-4">
            {editing ? (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="pl-7 text-lg font-bold"
                  />
                </div>
                <Button onClick={handleSaveBudget} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tight">
                    ${remaining.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">
                    left of ${category.budget_limit.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      percent >= 100
                        ? "bg-red-500"
                        : percent >= 75
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  ${spent.toLocaleString()} spent ({percent.toFixed(0)}%)
                </p>
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Content Area - Switches between Transaction List and Add Form */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {showAddForm ? (
            /* Add Expense Form */
            <div className="p-6 space-y-5 overflow-visible">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowAddForm(false)}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h3 className="font-semibold">Add Expense</h3>
              </div>

              {/* Store Name Combobox */}
              <div className="space-y-2">
                <Label>Store Name</Label>
                <Popover
                  open={storeComboOpen}
                  onOpenChange={setStoreComboOpen}
                  modal={true}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={storeComboOpen}
                      className="w-full justify-between font-normal">
                      {storeName || "Select or type store name..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[--radix-popover-trigger-width] p-0 z-[100] bg-popover border shadow-lg"
                    align="start"
                    sideOffset={4}>
                    <Command>
                      <CommandInput
                        placeholder="Search or type new store..."
                        value={storeName}
                        onValueChange={setStoreName}
                      />
                      <CommandList>
                        <CommandEmpty>
                          <button
                            className="w-full py-2 px-4 text-left hover:bg-muted rounded-md"
                            onClick={() => {
                              setStoreComboOpen(false);
                            }}>
                            Use &quot;{storeName}&quot; as new store
                          </button>
                        </CommandEmpty>
                        <CommandGroup heading="Recent Stores">
                          {filteredStores.map((store) => (
                            <CommandItem
                              key={store}
                              value={store}
                              onSelect={() => {
                                setStoreName(store);
                                setStoreComboOpen(false);
                              }}>
                              {store}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Amount and Currency */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="expense-amount">Amount</Label>
                  <Input
                    id="expense-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select
                    value={currency}
                    onValueChange={(v) => setCurrency(v as Currency)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MXN">MXN</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Receipt Upload */}
              <div className="space-y-2">
                <Label>Attach Receipt</Label>
                <label
                  htmlFor="receipt-upload"
                  className={cn(
                    "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors",
                    receiptFile
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50"
                  )}>
                  {receiptFile ? (
                    <div className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium truncate max-w-[200px]">
                        {receiptFile.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.preventDefault();
                          setReceiptFile(null);
                        }}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Camera className="h-5 w-5" />
                        <Upload className="h-5 w-5" />
                      </div>
                      <span className="text-sm text-muted-foreground mt-2">
                        Click to upload or take a photo
                      </span>
                    </>
                  )}
                  <input
                    id="receipt-upload"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {/* Submit Button */}
              <Button
                className="w-full"
                onClick={handleAddExpense}
                disabled={
                  isSubmitting ||
                  !storeName ||
                  !amount ||
                  parseFloat(amount) <= 0
                }>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Add to {category.name}
              </Button>
            </div>
          ) : (
            /* Transactions List View */
            <>
              {/* Transactions Header with Add Button */}
              <div className="px-6 py-3 border-b flex items-center justify-between bg-muted/30">
                <span className="font-medium text-sm">Transactions</span>
                <Button
                  variant="default"
                  size="sm"
                  className="h-8 gap-1"
                  onClick={() => setShowAddForm(true)}>
                  <Plus className="h-3 w-3" />
                  Add Expense
                </Button>
              </div>

              {/* Scrollable Transaction List */}
              <div className="flex-1 overflow-y-auto max-h-[350px]">
                <div className="p-4 space-y-2">
                  {transactions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No transactions yet</p>
                      <p className="text-sm mt-1">
                        Add your first expense in this category
                      </p>
                    </div>
                  ) : (
                    transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-800/50 border border-border/50">
                        <div>
                          <p className="font-medium text-sm">
                            {tx.establishment ||
                              tx.description ||
                              "Transaction"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(tx.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <span className="font-semibold text-red-500">
                          -${tx.amount.toLocaleString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

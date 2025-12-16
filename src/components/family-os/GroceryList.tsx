"use client";

import { useState } from "react";
import { Check, Plus, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { GroceryItem } from "@/types/groceries";
import { cn } from "@/lib/utils";

interface GroceryListProps {
  items: GroceryItem[];
  onToggleItem: (id: string, checked: boolean) => void;
  onAddItem: (name: string) => void;
  onDeleteItem: (id: string) => void;
}

export function GroceryList({
  items,
  onToggleItem,
  onAddItem,
  onDeleteItem,
}: GroceryListProps) {
  const [newItemName, setNewItemName] = useState("");

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName.trim()) {
      onAddItem(newItemName.trim());
      setNewItemName("");
    }
  };

  // Sort: Unchecked first, then Checked
  const sortedItems = [...items].sort((a, b) => {
    if (a.is_checked === b.is_checked) return 0;
    return a.is_checked ? 1 : -1;
  });

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      <div className="flex flex-col space-y-2">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <span className="bg-blue-100 text-blue-700 p-1 rounded">🛒</span>
          Lista de Compras
        </h3>

        {/* Manual Add Input */}
        <form onSubmit={handleManualAdd} className="flex gap-2">
          <Input
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Agregar item suelto (e.g. Leche)"
            className="flex-1 text-base h-12" // Mobile friendly height and font
            autoComplete="off"
          />
          <Button type="submit" size="icon" className="h-12 w-12 shrink-0">
            <Plus className="h-5 w-5" />
          </Button>
        </form>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto min-h-[300px] space-y-1 pb-20">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground border-2 border-dashed rounded-xl">
            <ShoppingCart className="h-10 w-10 mb-2 opacity-50" />
            <p>Lista vacía</p>
          </div>
        ) : (
          sortedItems.map((item) => (
            <div
              key={item.id}
              className={cn(
                "group flex items-center justify-between p-3 rounded-lg border transition-all duration-200",
                item.is_checked
                  ? "bg-muted/50 border-transparent opacity-60"
                  : "bg-card border-border shadow-sm hover:border-emerald-500/50"
              )}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Checkbox
                  id={`item-${item.id}`}
                  checked={item.is_checked}
                  onCheckedChange={(checked) =>
                    onToggleItem(item.id, checked === true)
                  }
                  className="h-6 w-6 border-2 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                />
                <label
                  htmlFor={`item-${item.id}`}
                  className={cn(
                    "text-base font-medium cursor-pointer flex-1 truncate select-none",
                    item.is_checked && "line-through text-muted-foreground"
                  )}>
                  {item.name}
                  {item.quantity && item.quantity > 1 && (
                    <span className="text-xs text-muted-foreground ml-2 font-normal bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      x{item.quantity}
                    </span>
                  )}
                </label>
              </div>

              <div className="flex items-center gap-2 pl-2">
                {item.estimated_price > 0 && !item.is_checked && (
                  <span className="text-xs font-mono text-muted-foreground hidden sm:inline-block">
                    ${item.estimated_price}
                  </span>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteItem(item.id)}
                  className="h-8 w-8 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

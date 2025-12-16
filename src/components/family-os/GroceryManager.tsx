"use client";

import { useState, useMemo } from "react";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

import { MealSelector } from "./MealSelector";
import { GroceryList } from "./GroceryList";
import { AddTransactionDrawer } from "@/components/transactions/AddTransactionDrawer";
import { Category } from "@/types/finance";
import { GroceryItem, Meal } from "@/types/groceries";

interface GroceryManagerProps {
  categories: Category[]; // Needed for the checkout modal
}

export function GroceryManager({ categories }: GroceryManagerProps) {
  const t = useTranslations("Common"); // Assuming Common or a specific namespace
  // Using Common for generic terms, but specific ones might be missing.
  // I'll stick to hardcoded ES/EN logic or generic strings if translations are missing to be safe,
  // or use safe t() calls.

  const [items, setItems] = useState<GroceryItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Stats
  const totalEstimated = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.estimated_price || 0), 0);
  }, [items]);

  const checkedCount = items.filter((i) => i.is_checked).length;
  const totalCount = items.length;

  // Handlers
  const handleSelectMeal = (meal: Meal) => {
    // Convert meal ingredients to grocery items
    const newItems: GroceryItem[] = meal.ingredients.map((ing, idx) => ({
      id: crypto.randomUUID(),
      name: ing.name,
      is_checked: false,
      estimated_price: Math.round(
        meal.estimated_cost / meal.ingredients.length
      ), // Rough split for demo
      quantity: 1, // Start with 1, logic could parse "1kg" etc later
    }));

    setItems((prev) => [...prev, ...newItems]);
  };

  const handleAddItem = (name: string) => {
    const newItem: GroceryItem = {
      id: crypto.randomUUID(),
      name,
      is_checked: false,
      estimated_price: 0, // Manual items start at 0 unless we have a price DB
    };
    setItems((prev) => [newItem, ...prev]);
  };

  const handleToggleItem = (id: string, checked: boolean) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, is_checked: checked } : item
      )
    );
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCheckout = () => {
    setIsCheckoutOpen(true);
  };

  // Find a likely category for groceries
  const groceryCategory = categories.find(
    (c) =>
      c.name.toLowerCase().includes("grocer") ||
      c.name.toLowerCase().includes("despensa") ||
      c.name.toLowerCase().includes("super")
  );

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-h-[900px] gap-4 md:gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingBag className="text-emerald-600" />
            Control de Despensa
          </h2>
          <p className="text-sm text-muted-foreground">
            {checkedCount} / {totalCount} items
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Estimado
          </p>
          <p className="text-2xl font-bold text-emerald-600">
            ${totalEstimated.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 flex-1 overflow-hidden">
        {/* Left Col: Planner */}
        <Card className="flex flex-col overflow-hidden border-none shadow-none md:border md:shadow-sm bg-transparent md:bg-card">
          <CardHeader className="px-0 md:px-6">
            <CardTitle>Planificación</CardTitle>
          </CardHeader>
          <CardContent className="px-0 md:px-6 flex-1">
            <MealSelector onSelectMeal={handleSelectMeal} />

            {/* Hint / Helper */}
            <div className="mt-8 p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
              <h4 className="font-medium text-emerald-800 dark:text-emerald-200 mb-2">
                💡 Tip de Ahorro
              </h4>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                Planear tus comidas antes de ir al super puede ahorrarte hasta
                un 30% en gastos hormiga.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Right Col: List */}
        <Card className="flex flex-col flex-1 overflow-hidden border-none shadow-none md:border md:shadow-sm bg-transparent md:bg-card">
          <CardContent className="px-0 md:px-6 flex-1 flex flex-col pt-6">
            <GroceryList
              items={items}
              onToggleItem={handleToggleItem}
              onAddItem={handleAddItem}
              onDeleteItem={handleDeleteItem}
            />
          </CardContent>
        </Card>
      </div>

      {/* Mobile Floating Action / Bottom Bar */}
      <div className="fixed bottom-6 right-6 z-40 md:static md:flex md:justify-end">
        <Button
          onClick={handleCheckout}
          size="lg"
          className="shadow-xl shadow-emerald-500/30 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full h-14 px-8 text-lg font-bold animate-in zoom-in duration-300">
          Terminar Compra
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>

      {/* Checkout Integration */}
      <AddTransactionDrawer
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        categories={categories}
        initialValues={{
          amount: totalEstimated,
          description: `Super Semanal - ${new Date().toLocaleDateString()}`,
          category_id: groceryCategory?.id,
          date: new Date().toISOString().split("T")[0],
          type: "expense",
        }}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Meal } from "@/types/groceries";

interface MealSelectorProps {
  onSelectMeal: (meal: Meal) => void;
}

// Mock Database of Meals
const PREDEFINED_MEALS: Meal[] = [
  {
    id: "1",
    name: "Tacos Dorados",
    estimated_cost: 150,
    ingredients: [
      { name: "Tortillas", quantity: "1kg" },
      { name: "Pechuga de Pollo", quantity: "500g" },
      { name: "Crema", quantity: "250ml" },
      { name: "Queso Panela", quantity: "400g" },
      { name: "Lechuga", quantity: "1 pza" },
      { name: "Salsa Verde", quantity: "1 bot" },
    ],
  },
  {
    id: "2",
    name: "Spaghetti Bolognese",
    estimated_cost: 200,
    ingredients: [
      { name: "Pasta Spaghetti", quantity: "500g" },
      { name: "Carne Molida", quantity: "500g" },
      { name: "Puré de Tomate", quantity: "1L" },
      { name: "Cebolla", quantity: "1 pza" },
      { name: "Ajo", quantity: "1 cabeza" },
      { name: "Queso Parmesano", quantity: "100g" },
    ],
  },
  {
    id: "3",
    name: "Ensalada Cesar",
    estimated_cost: 120,
    ingredients: [
      { name: "Lechuga Romana", quantity: "2 pzas" },
      { name: "Aderezo Cesar", quantity: "1 bot" },
      { name: "Crutones", quantity: "1 bolsa" },
      { name: "Pechuga de Pollo", quantity: "300g" },
      { name: "Queso Parmesano", quantity: "50g" },
    ],
  },
  {
    id: "4",
    name: "Sandwiches",
    estimated_cost: 100,
    ingredients: [
      { name: "Pan de Caja", quantity: "1 pqte" },
      { name: "Jamón", quantity: "300g" },
      { name: "Queso Manchego", quantity: "300g" },
      { name: "Mayonesa", quantity: "1 frasco" },
      { name: "Jitomate", quantity: "2 pzas" },
    ],
  },
];

export function MealSelector({ onSelectMeal }: MealSelectorProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col space-y-2">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <span className="bg-emerald-100 text-emerald-700 p-1 rounded">
            🍽️
          </span>
          Planifier Comidas
        </h3>
        <p className="text-sm text-muted-foreground">
          Selecciona una comida para agregar sus ingredientes automáticamente.
        </p>
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-12 text-base">
            {value
              ? PREDEFINED_MEALS.find((meal) => meal.name === value)?.name
              : "Seleccionar comida..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar comida..." />
            <CommandList>
              <CommandEmpty>No se encontraron resultados.</CommandEmpty>
              <CommandGroup heading="Librería de Comidas">
                {PREDEFINED_MEALS.map((meal) => (
                  <CommandItem
                    key={meal.id}
                    value={meal.name}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue);
                      onSelectMeal(meal);
                      setOpen(false);
                    }}
                    className="flex justify-between items-center py-3">
                    <span>{meal.name}</span>
                    <span className="text-muted-foreground text-xs font-mono">
                      ${meal.estimated_cost}
                    </span>
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4 opacity-0",
                        value === meal.name ? "opacity-100" : ""
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

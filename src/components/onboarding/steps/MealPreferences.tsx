import { Badge } from "@/components/ui/badge";

export function MealPreferences({
  onUpdate,
}: {
  onUpdate: (data: any) => void;
}) {
  const diets = [
    "Keto",
    "Vegan",
    "Vegetarian",
    "Gluten Free",
    "No Restrictions",
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Meal Preferences</h3>
        <p className="text-sm text-slate-500">
          Help our AI suggest better weekly menus.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {diets.map((diet) => (
          <Badge
            key={diet}
            variant="outline"
            className="px-4 py-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => onUpdate({ diet })}>
            {diet}
          </Badge>
        ))}
      </div>
    </div>
  );
}

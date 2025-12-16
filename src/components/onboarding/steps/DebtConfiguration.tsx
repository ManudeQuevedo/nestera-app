import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export function DebtConfiguration({
  onUpdate,
}: {
  onUpdate: (data: any) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">
          Do you have existing debts?
        </h3>
        <p className="text-sm text-slate-500">
          We'll help you create a payoff plan.
        </p>
      </div>
      <div className="space-y-4">
        <div className="flex items-center space-x-2 border p-4 rounded-lg">
          <Checkbox
            id="credit-cards"
            onCheckedChange={(checked) =>
              onUpdate({ hasCreditCardDebt: checked })
            }
          />
          <Label htmlFor="credit-cards" className="flex-1 cursor-pointer">
            Credit Cards
          </Label>
        </div>
        <div className="flex items-center space-x-2 border p-4 rounded-lg">
          <Checkbox
            id="loans"
            onCheckedChange={(checked) => onUpdate({ hasLoans: checked })}
          />
          <Label htmlFor="loans" className="flex-1 cursor-pointer">
            Personal Loans / Car
          </Label>
        </div>
      </div>
    </div>
  );
}

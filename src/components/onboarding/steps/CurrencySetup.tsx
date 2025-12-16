import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function CurrencySetup({ onUpdate }: { onUpdate: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">
          Select your primary currency
        </h3>
        <p className="text-sm text-slate-500">
          This will be the default for your dashboard.
        </p>
      </div>
      <RadioGroup
        defaultValue="MXN"
        onValueChange={(val: string) => onUpdate({ currency: val })}
        className="grid grid-cols-2 gap-4">
        <div>
          <RadioGroupItem value="MXN" id="mxn" className="peer sr-only" />
          <Label
            htmlFor="mxn"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-emerald-500 [&:has([data-state=checked])]:border-emerald-500 cursor-pointer">
            <span className="text-2xl mb-2">🇲🇽</span>
            <span className="font-semibold">MXN (Pesos)</span>
          </Label>
        </div>
        <div>
          <RadioGroupItem value="USD" id="usd" className="peer sr-only" />
          <Label
            htmlFor="usd"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-emerald-500 [&:has([data-state=checked])]:border-emerald-500 cursor-pointer">
            <span className="text-2xl mb-2">🇺🇸</span>
            <span className="font-semibold">USD (Dollars)</span>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}

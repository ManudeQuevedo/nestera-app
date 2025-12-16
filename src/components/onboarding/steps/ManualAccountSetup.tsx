import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ManualAccountSetup({
  onUpdate,
}: {
  onUpdate: (data: any) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Add your primary account</h3>
        <p className="text-sm text-slate-500">
          You can add more accounts later in the dashboard.
        </p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Account Name</Label>
          <Input
            placeholder="e.g. BBVA Nomina"
            onChange={(e) => onUpdate({ accountName: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Current Balance</Label>
          <Input
            placeholder="$0.00"
            type="number"
            onChange={(e) => onUpdate({ balance: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

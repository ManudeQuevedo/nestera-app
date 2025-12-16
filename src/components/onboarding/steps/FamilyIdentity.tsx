import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function FamilyIdentity({
  onUpdate,
}: {
  onUpdate: (data: any) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">
          Create your Family Identity
        </h3>
        <p className="text-sm text-slate-500">Give your team a name.</p>
      </div>

      <div className="flex flex-col items-center mb-6">
        <Avatar className="w-20 h-20 mb-4">
          <AvatarFallback>FAM</AvatarFallback>
        </Avatar>
        <span className="text-xs text-blue-500 cursor-pointer">
          Upload Photo
        </span>
      </div>

      <div className="space-y-2">
        <Label>Family Name</Label>
        <Input
          placeholder="e.g. The Garcias"
          onChange={(e) => onUpdate({ familyName: e.target.value })}
        />
      </div>
    </div>
  );
}

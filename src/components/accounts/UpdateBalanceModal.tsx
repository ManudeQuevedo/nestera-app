"use client";

import { useState } from "react";
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
import { Loader2, Check } from "lucide-react";
import { Account } from "@/types/finance";
import { createClient } from "@/utils/supabase/client";

interface UpdateBalanceModalProps {
  account: Account;
  onUpdate: (account: Account, newBalance: number) => void;
  trigger?: React.ReactNode;
}

export function UpdateBalanceModal({
  account,
  onUpdate,
  trigger,
}: UpdateBalanceModalProps) {
  const [open, setOpen] = useState(false);
  const [balance, setBalance] = useState(account.current_balance.toString());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const newBalance = parseFloat(balance) || 0;

      const { error } = await supabase
        .from("accounts")
        .update({
          current_balance: newBalance,
          updated_at: new Date().toISOString(),
        })
        .eq("id", account.id);

      if (error) throw error;

      onUpdate(account, newBalance);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setOpen(false);
      }, 1000);
    } catch (error) {
      console.error("Failed to update balance:", error);
      alert("Failed to update balance. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            Update Balance
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Update {account.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="balance">
              Current Balance {account.is_debt && "(Debt)"}
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="balance"
                type="number"
                step="0.01"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="pl-7 text-lg font-medium"
                placeholder="0.00"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter the current total balance for this account.
            </p>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Updated!
              </>
            ) : (
              "Save Balance"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

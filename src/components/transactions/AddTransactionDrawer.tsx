"use client";

import * as React from "react";
import { Plus, AlertTriangle } from "lucide-react";
import { createTransaction } from "@/actions/transactions";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Category } from "@/types/finance";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface AddTransactionDrawerProps {
  categories: Category[];
  trigger?: React.ReactNode;
}

export function AddTransactionDrawer({
  categories,
  trigger,
}: AddTransactionDrawerProps) {
  const t = useTranslations("Transactions");
  const tCommon = useTranslations("Common");

  const [open, setOpen] = React.useState(false);
  const [type, setType] = React.useState<"income" | "expense">("expense");
  const [isPending, setIsPending] = React.useState(false);
  const [isUnexpected, setIsUnexpected] = React.useState(false);
  const [usedEmergencyFund, setUsedEmergencyFund] = React.useState(false);

  async function onSubmit(formData: FormData) {
    formData.append("type", type);
    formData.append("is_unexpected", isUnexpected.toString());
    formData.append("covered_by_emergency_fund", usedEmergencyFund.toString());
    setIsPending(true);
    const result = await createTransaction(formData);
    setIsPending(false);

    if (result.success) {
      setOpen(false);
      // Reset form state
      setIsUnexpected(false);
      setUsedEmergencyFund(false);
    } else {
      alert(t("error") + ": " + result.error);
    }
  }

  // Reset unexpected state when type changes
  React.useEffect(() => {
    if (type === "income") {
      setIsUnexpected(false);
      setUsedEmergencyFund(false);
    }
  }, [type]);

  // Filter categories by type
  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg bg-primary text-primary-foreground fixed bottom-20 right-4 md:bottom-8 md:right-8 z-50">
            <Plus className="h-8 w-8" />
            <span className="sr-only">{t("addTransaction")}</span>
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>{t("addTransaction")}</DrawerTitle>
            <DrawerDescription>{t("addTransactionDesc")}</DrawerDescription>
          </DrawerHeader>

          <form action={onSubmit} className="p-4 space-y-4">
            <Tabs
              defaultValue="expense"
              value={type}
              onValueChange={(v) => setType(v as "income" | "expense")}
              className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="expense">{t("expense")}</TabsTrigger>
                <TabsTrigger value="income">{t("income")}</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-2">
              <Label htmlFor="amount">{t("amount")}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-8 text-lg font-semibold"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">{t("category")}</Label>
              <Select name="category_id" required>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon && <span className="mr-2">{cat.icon}</span>}
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">{t("date")}</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t("descriptionLabel")}</Label>
              <Input
                id="description"
                name="description"
                type="text"
                placeholder={t("descriptionPlaceholder")}
              />
            </div>

            {/* Unexpected Expense Toggle - Only for expenses */}
            {type === "expense" && (
              <div
                className={cn(
                  "rounded-lg border p-4 space-y-4 transition-colors",
                  isUnexpected
                    ? "border-amber-500/50 bg-amber-50 dark:bg-amber-950/20"
                    : "border-border"
                )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle
                      className={cn(
                        "h-4 w-4",
                        isUnexpected
                          ? "text-amber-500"
                          : "text-muted-foreground"
                      )}
                    />
                    <Label
                      htmlFor="unexpected"
                      className="text-sm font-medium cursor-pointer">
                      {t("unexpected")}
                    </Label>
                  </div>
                  <Switch
                    id="unexpected"
                    checked={isUnexpected}
                    onCheckedChange={(checked) => {
                      setIsUnexpected(checked);
                      if (!checked) setUsedEmergencyFund(false);
                    }}
                  />
                </div>

                {/* Emergency Fund Question - Only shows if unexpected is ON */}
                {isUnexpected && (
                  <div className="flex items-center justify-between pt-2 border-t border-amber-500/30">
                    <Label
                      htmlFor="emergency-fund"
                      className="text-sm cursor-pointer">
                      {t("usedEmergencyFund")}
                    </Label>
                    <Switch
                      id="emergency-fund"
                      checked={usedEmergencyFund}
                      onCheckedChange={setUsedEmergencyFund}
                    />
                  </div>
                )}

                {isUnexpected && (
                  <p className="text-xs text-muted-foreground">
                    {usedEmergencyFund
                      ? t("emergencyFundNote")
                      : t("unexpectedNote")}
                  </p>
                )}
              </div>
            )}

            <DrawerFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? tCommon("loading") : t("saveTransaction")}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">{tCommon("cancel")}</Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

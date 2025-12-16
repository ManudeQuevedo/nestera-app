"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function GoalsHeaderActions() {
  const t = useTranslations("Goals");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {t("createGoal")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createGoal")}</DialogTitle>
          <DialogDescription>{t("createGoalDescription")}</DialogDescription>
        </DialogHeader>
        {/* TODO: Add goal form */}
        <p className="text-muted-foreground text-sm py-8 text-center">
          Goal form coming soon...
        </p>
      </DialogContent>
    </Dialog>
  );
}

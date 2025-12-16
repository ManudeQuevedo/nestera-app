"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SCHOOL_PAYMENT_CATEGORIES,
  SchoolPaymentCategory,
} from "@/types/school";
import { createSchoolPayment } from "./actions";
import { Loader2, Upload, X, Camera, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

interface AddPaymentFormProps {
  onSuccess?: () => void;
}

export function AddPaymentForm({ onSuccess }: AddPaymentFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    amount: "",
    concept: "",
    category: "Tuition" as SchoolPaymentCategory,
    notes: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let receiptUrl: string | null = null;

      // Upload receipt if provided
      if (receiptFile) {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("Not authenticated");
        }

        const fileExt = receiptFile.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("school-receipts")
          .upload(fileName, receiptFile);

        if (uploadError) {
          throw new Error("Failed to upload receipt: " + uploadError.message);
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("school-receipts").getPublicUrl(fileName);

        receiptUrl = publicUrl;
      }

      // Create payment record
      const result = await createSchoolPayment({
        date: formData.date,
        amount: parseFloat(formData.amount),
        concept: formData.concept,
        category: formData.category,
        receipt_url: receiptUrl,
        notes: formData.notes || null,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to create payment");
      }

      router.refresh();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Amount & Date Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount *</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="pl-7"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
      </div>

      {/* Concept */}
      <div className="space-y-2">
        <Label htmlFor="concept">Concept *</Label>
        <Input
          id="concept"
          placeholder="e.g., Tuition October"
          value={formData.concept}
          onChange={(e) =>
            setFormData({ ...formData, concept: e.target.value })
          }
          required
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">Category *</Label>
        <Select
          value={formData.category}
          onValueChange={(v) =>
            setFormData({ ...formData, category: v as SchoolPaymentCategory })
          }>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SCHOOL_PAYMENT_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                <div className="flex items-center gap-2">
                  <div className={cn("h-2 w-2 rounded-full", cat.color)} />
                  {cat.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Receipt Upload */}
      <div className="space-y-2">
        <Label>Receipt (Optional)</Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {receiptPreview ? (
          <div className="relative rounded-lg overflow-hidden border">
            <img
              src={receiptPreview}
              alt="Receipt preview"
              className="w-full max-h-48 object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={removeReceipt}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors",
              "hover:border-primary hover:bg-primary/5",
              "flex flex-col items-center justify-center gap-2 text-muted-foreground"
            )}>
            <div className="flex gap-2">
              <Camera className="h-5 w-5" />
              <Upload className="h-5 w-5" />
            </div>
            <p className="text-sm text-center">
              <span className="font-medium">Tap to take photo</span> or upload
              image
            </p>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Any additional notes..."
          rows={2}
          value={formData.notes}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFormData({ ...formData, notes: e.target.value })
          }
        />
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          "Add Payment"
        )}
      </Button>
    </form>
  );
}

"use client";

import { useState, useMemo } from "react";
import {
  SchoolPayment,
  SCHOOL_PAYMENT_CATEGORIES,
  getCategoryColor,
} from "@/types/school";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  FileText,
  Image,
  Download,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { AddPaymentForm } from "./AddPaymentForm";
import { generateSchoolReport } from "./generateReport";
import { cn } from "@/lib/utils";

interface JFKSchoolClientProps {
  payments: SchoolPayment[];
  totalPaid: number;
}

export function JFKSchoolClient({ payments, totalPaid }: JFKSchoolClientProps) {
  const [selectedPayment, setSelectedPayment] = useState<SchoolPayment | null>(
    null
  );
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const currentYear = new Date().getFullYear();
      await generateSchoolReport(payments, `JFK School - Year ${currentYear}`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Group payments by month
  const groupedPayments = useMemo(() => {
    const groups: Record<string, SchoolPayment[]> = {};

    payments.forEach((payment) => {
      const date = new Date(payment.date);
      const monthKey = date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });

      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(payment);
    });

    return groups;
  }, [payments]);

  const currentYear = new Date().getFullYear();

  return (
    <main className="min-h-screen pb-10">
      <div className="w-full space-y-6 p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Left: Title & Year */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                JFK School
              </h1>
              <p className="text-sm text-muted-foreground">
                School Year {currentYear}-{currentYear + 1}
              </p>
            </div>
          </div>

          {/* Right: Total + Actions */}
          <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
            {/* Total Paid - Clean Text Display */}
            <div className="flex-1 md:flex-none text-right md:text-left">
              <p className="text-xs text-muted-foreground">Total Paid</p>
              <p className="text-2xl md:text-3xl font-bold tracking-tight">
                $
                {totalPaid.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>

            {/* Vertical Divider - Desktop Only */}
            <div className="hidden md:block h-10 w-px bg-border" />

            {/* Export Button - Desktop Only */}
            <Button
              variant="outline"
              className="hidden md:flex gap-2"
              onClick={handleExportPDF}
              disabled={isExporting || payments.length === 0}>
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export PDF
            </Button>

            {/* Add Payment Button */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  <span className="hidden md:inline">Add Payment</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add School Payment</DialogTitle>
                </DialogHeader>
                <AddPaymentForm onSuccess={() => setIsAddOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Mobile View - Timeline */}
        <div className="md:hidden space-y-6">
          {Object.entries(groupedPayments).map(([month, monthPayments]) => (
            <div key={month} className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground sticky top-0 bg-background py-2">
                {month}
              </h3>
              <div className="space-y-2">
                {monthPayments.map((payment) => (
                  <Sheet key={payment.id}>
                    <SheetTrigger asChild>
                      <Card
                        className="cursor-pointer hover:bg-muted/50 transition-colors border-border/50"
                        onClick={() => setSelectedPayment(payment)}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            {/* Day */}
                            <div className="text-center shrink-0 w-10">
                              <p className="text-2xl font-bold">
                                {new Date(payment.date).getDate()}
                              </p>
                              <p className="text-xs text-muted-foreground uppercase">
                                {new Date(payment.date).toLocaleDateString(
                                  "en-US",
                                  { weekday: "short" }
                                )}
                              </p>
                            </div>

                            {/* Concept & Category */}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {payment.concept}
                              </p>
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-xs text-white",
                                  getCategoryColor(payment.category)
                                )}>
                                {payment.category}
                              </Badge>
                            </div>

                            {/* Amount & Receipt */}
                            <div className="text-right shrink-0">
                              <p className="font-semibold">
                                $
                                {payment.amount.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                })}
                              </p>
                              {payment.receipt_url && (
                                <Image className="h-4 w-4 text-muted-foreground ml-auto mt-1" />
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[85vh]">
                      <SheetHeader>
                        <SheetTitle>{payment.concept}</SheetTitle>
                      </SheetHeader>
                      <div className="mt-4 space-y-4">
                        {/* Receipt Image */}
                        {payment.receipt_url ? (
                          <div className="rounded-lg overflow-hidden border">
                            <img
                              src={payment.receipt_url}
                              alt="Receipt"
                              className="w-full object-contain max-h-[50vh]"
                            />
                          </div>
                        ) : (
                          <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
                            <div className="text-center text-muted-foreground">
                              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                              <p>No receipt uploaded</p>
                            </div>
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="space-y-2">
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">Date</span>
                            <span className="font-medium">
                              {new Date(payment.date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">
                              Category
                            </span>
                            <Badge
                              className={cn(
                                "text-white",
                                getCategoryColor(payment.category)
                              )}>
                              {payment.category}
                            </Badge>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">
                              Amount
                            </span>
                            <span className="font-bold text-lg">
                              $
                              {payment.amount.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                          {payment.notes && (
                            <div className="py-2">
                              <span className="text-muted-foreground block mb-1">
                                Notes
                              </span>
                              <p className="text-sm">{payment.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                ))}
              </div>
            </div>
          ))}

          {payments.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-medium mb-1">No payments yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start tracking your school expenses by adding your first
                  payment.
                </p>
                <Button onClick={() => setIsAddOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Payment
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Desktop View - Table */}
        <Card className="hidden md:block border-border/50 shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Concept</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-center">Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow
                    key={payment.id}
                    className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      {new Date(payment.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="font-medium">
                      {payment.concept}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-white",
                          getCategoryColor(payment.category)
                        )}>
                        {payment.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      $
                      {payment.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-center">
                      {payment.receipt_url ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8">
                              <Image className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                              <DialogTitle>
                                Receipt - {payment.concept}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="mt-2">
                              <img
                                src={payment.receipt_url}
                                alt="Receipt"
                                className="w-full rounded-lg"
                              />
                            </div>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {payments.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-center text-muted-foreground">
                      No payments recorded yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

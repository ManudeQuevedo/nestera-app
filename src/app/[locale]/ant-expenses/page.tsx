import { getTodaysReceipts, getMonthlyReceipts } from "@/actions/cash-flow";
import { DailyReceiptsClient } from "./DailyReceiptsClient";

export default async function DailyReceiptsPage() {
  const [todayReceipts, monthlyReceipts] = await Promise.all([
    getTodaysReceipts(),
    getMonthlyReceipts(),
  ]);

  return (
    <DailyReceiptsClient
      todayReceipts={todayReceipts}
      monthlyReceipts={monthlyReceipts}
    />
  );
}

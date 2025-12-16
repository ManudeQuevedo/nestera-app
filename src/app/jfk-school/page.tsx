import { getSchoolPayments, getTotalPaidThisYear } from "./actions";
import { JFKSchoolClient } from "./JFKSchoolClient";

export default async function JFKSchoolPage() {
  const [payments, totalPaid] = await Promise.all([
    getSchoolPayments(),
    getTotalPaidThisYear(),
  ]);

  return <JFKSchoolClient payments={payments} totalPaid={totalPaid} />;
}

import { getDebts } from "./actions";
import { DebtsClient } from "./DebtsClient";

export default async function DebtsPage() {
  const debts = await getDebts();

  return (
    <main className="min-h-screen pb-10">
      <DebtsClient debts={debts || []} />
    </main>
  );
}

import { Wallet } from "lucide-react";
import { EntityPlaceholderPage } from "@/components/shared/EntityPlaceholderPage";

export default function PaymentsPage() {
  return (
    <EntityPlaceholderPage
      title="Payments"
      description="Record and track payments against deals."
      actionLabel="Add Payment"
      icon={Wallet}
      columns={["Deal", "Customer", "Amount", "Method", "Status"]}
      emptyDescription="Payments logged against your deals will show up here."
    />
  );
}

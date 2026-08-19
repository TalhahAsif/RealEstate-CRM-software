import { Percent } from "lucide-react";
import { EntityPlaceholderPage } from "@/components/shared/EntityPlaceholderPage";

export default function CommissionsPage() {
  return (
    <EntityPlaceholderPage
      title="Commissions"
      description="Track agent commissions earned on closed deals."
      actionLabel="Add Commission"
      icon={Percent}
      columns={["Deal", "Agent", "Total", "Agent Amount", "Status"]}
      emptyDescription="Commission records generated from closed deals will appear here."
    />
  );
}

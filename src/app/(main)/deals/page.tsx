import { Handshake } from "lucide-react";
import { EntityPlaceholderPage } from "@/components/shared/EntityPlaceholderPage";

export default function DealsPage() {
  return (
    <EntityPlaceholderPage
      title="Deals"
      description="Track deals from selection through closing."
      actionLabel="Add Deal"
      icon={Handshake}
      columns={["Deal #", "Customer", "Property", "Stage", "Amount"]}
      emptyDescription="Deals created from won leads and customers will appear here."
    />
  );
}

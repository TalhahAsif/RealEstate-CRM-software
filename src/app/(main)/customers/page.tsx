import { UserSquare2 } from "lucide-react";
import { EntityPlaceholderPage } from "@/components/shared/EntityPlaceholderPage";

export default function CustomersPage() {
  return (
    <EntityPlaceholderPage
      title="Customers"
      description="Manage buyers, sellers, landlords, and tenants."
      actionLabel="Add Customer"
      icon={UserSquare2}
      columns={["Name", "Phone", "Type", "Purpose", "Agent"]}
      emptyDescription="Customers converted from leads or added directly will appear here."
    />
  );
}

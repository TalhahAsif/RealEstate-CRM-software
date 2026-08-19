import { Building } from "lucide-react";
import { EntityPlaceholderPage } from "@/components/shared/EntityPlaceholderPage";

export default function PropertiesPage() {
  return (
    <EntityPlaceholderPage
      title="Properties"
      description="Browse and manage your property listings."
      actionLabel="Add Property"
      icon={Building}
      columns={["Property ID", "Title", "Type", "Listing", "Price", "Status"]}
      emptyDescription="Properties you list for sale or rent will appear here."
    />
  );
}

import { FileText } from "lucide-react";
import { EntityPlaceholderPage } from "@/components/shared/EntityPlaceholderPage";

export default function DocumentsPage() {
  return (
    <EntityPlaceholderPage
      title="Documents"
      description="Store contracts, agreements, and other files."
      actionLabel="Upload Document"
      icon={FileText}
      columns={["Name", "Type", "Linked To", "Uploaded By", "Date"]}
      emptyDescription="Documents attached to leads, deals, and properties will appear here."
    />
  );
}

import { Building2 } from "lucide-react";
import { EntityPlaceholderPage } from "@/components/shared/EntityPlaceholderPage";

export default function ProjectsPage() {
  return (
    <EntityPlaceholderPage
      title="Projects"
      description="Manage developments that group multiple properties."
      actionLabel="Add Project"
      icon={Building2}
      columns={["Name", "Developer", "City", "Status", "Units"]}
      emptyDescription="Housing and commercial projects will be listed here."
    />
  );
}

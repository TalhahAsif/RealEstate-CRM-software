import { PhoneCall } from "lucide-react";
import { EntityPlaceholderPage } from "@/components/shared/EntityPlaceholderPage";

export default function LeadsPage() {
  return (
    <EntityPlaceholderPage
      title="Leads"
      description="Manage and track your real estate leads."
      actionLabel="Add Lead"
      icon={PhoneCall}
      columns={["Name", "Phone", "Status", "Priority", "Agent"]}
      emptyDescription="Leads you capture from your website, referrals, and campaigns will show up here."
    />
  );
}

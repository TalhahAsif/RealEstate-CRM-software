import { Home } from "lucide-react";
import { EntityPlaceholderPage } from "@/components/shared/EntityPlaceholderPage";

export default function SiteVisitsPage() {
  return (
    <EntityPlaceholderPage
      title="Site Visits"
      description="Track scheduled and completed property visits."
      actionLabel="Schedule Visit"
      icon={Home}
      columns={["Property", "Customer / Lead", "Agent", "Scheduled", "Status"]}
      emptyDescription="Site visits booked for your properties will show up here."
    />
  );
}

import { CalendarCheck } from "lucide-react";
import { EntityPlaceholderPage } from "@/components/shared/EntityPlaceholderPage";

export default function FollowUpsPage() {
  return (
    <EntityPlaceholderPage
      title="Follow-ups"
      description="Stay on top of scheduled calls, messages, and meetings."
      actionLabel="Add Follow-up"
      icon={CalendarCheck}
      columns={["Contact", "Type", "Scheduled", "Status", "Assigned To"]}
      emptyDescription="Follow-ups scheduled with leads and customers will be listed here."
    />
  );
}

import { PageHeader } from "@/components/shared/PageHeader";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { PipelineOverview } from "@/components/dashboard/PipelineOverview";
import { UpcomingFollowUps } from "@/components/dashboard/UpcomingFollowUps";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your leads, properties, and deals."
      />
      <StatsGrid />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PipelineOverview />
        <UpcomingFollowUps />
      </div>
    </div>
  );
}

import { BarChart3, TrendingUp, Users, Building } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const REPORTS = [
  { title: "Sales Performance", description: "Revenue and closed deals over time.", icon: TrendingUp },
  { title: "Lead Conversion", description: "Conversion rate from lead to closed deal.", icon: BarChart3 },
  { title: "Agent Performance", description: "Deals, revenue, and commissions per agent.", icon: Users },
  { title: "Property Inventory", description: "Listings by status, type, and location.", icon: Building },
];

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Reports"
        description="Insights into leads, sales, and team performance."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((report) => (
          <Card key={report.title}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
              <CardTitle className="text-sm font-medium">{report.title}</CardTitle>
              <report.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">{report.description}</p>
              <Badge variant="secondary">Coming soon</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

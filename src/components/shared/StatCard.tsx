import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
}

export function StatCard({ label, value, icon: Icon, trend, trendDirection = "neutral" }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        {trend ? (
          <p
            className={cn(
              "mt-1 text-xs",
              trendDirection === "up" && "text-emerald-600 dark:text-emerald-500",
              trendDirection === "down" && "text-red-600 dark:text-red-500",
              trendDirection === "neutral" && "text-muted-foreground"
            )}
          >
            {trend}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

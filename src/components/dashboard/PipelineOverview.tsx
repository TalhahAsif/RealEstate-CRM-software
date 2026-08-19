import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PIPELINE = [
  { stage: "New", count: 42 },
  { stage: "Contacted", count: 30 },
  { stage: "Site Visit", count: 18 },
  { stage: "Negotiation", count: 11 },
  { stage: "Won", count: 7 },
];

const MAX = Math.max(...PIPELINE.map((s) => s.count));

export function PipelineOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leads Pipeline</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {PIPELINE.map((stage) => (
          <div key={stage.stage} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-sm text-muted-foreground">{stage.stage}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(stage.count / MAX) * 100}%` }}
              />
            </div>
            <span className="w-6 shrink-0 text-right text-sm font-medium">{stage.count}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

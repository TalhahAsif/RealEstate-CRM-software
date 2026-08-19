import { CalendarClock, Phone, MessageCircle, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TYPE_ICON = {
  call: Phone,
  whatsapp: MessageCircle,
  meeting: Users,
} as const;

const FOLLOW_UPS = [
  { name: "Sara Malik", type: "call" as const, time: "Today, 2:30 PM", priority: "hot" },
  { name: "Omar Farooq", type: "whatsapp" as const, time: "Today, 4:00 PM", priority: "warm" },
  { name: "Bilal Ahmed", type: "meeting" as const, time: "Tomorrow, 11:00 AM", priority: "warm" },
];

export function UpcomingFollowUps() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Follow-ups</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {FOLLOW_UPS.map((item) => {
          const Icon = TYPE_ICON[item.type];
          return (
            <div key={item.name} className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                <Icon className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.name}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarClock className="size-3" />
                  {item.time}
                </p>
              </div>
              <Badge variant={item.priority === "hot" ? "destructive" : "secondary"}>
                {item.priority}
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

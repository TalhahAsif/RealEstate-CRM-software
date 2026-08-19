import {
  Building2,
  CalendarClock,
  Handshake,
  PhoneCall,
  Wallet,
  Home,
} from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { formatCurrency } from "@/lib/utils";

// Static placeholder figures — will be replaced by live aggregation queries
// once the Leads/Properties/Deals modules are built out.
const STATS = [
  { label: "Total Leads", value: "128", icon: PhoneCall, trend: "+12 this week", trendDirection: "up" as const },
  { label: "Active Properties", value: "64", icon: Building2, trend: "8 new listings", trendDirection: "up" as const },
  { label: "Site Visits", value: "23", icon: Home, trend: "6 scheduled today", trendDirection: "neutral" as const },
  { label: "Active Deals", value: "17", icon: Handshake, trend: "4 closing soon", trendDirection: "neutral" as const },
  { label: "Revenue", value: formatCurrency(482_000), icon: Wallet, trend: "+9% vs last month", trendDirection: "up" as const },
  { label: "Pending Follow-ups", value: "9", icon: CalendarClock, trend: "3 overdue", trendDirection: "down" as const },
];

export function StatsGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {STATS.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}

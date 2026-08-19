import { Building2, Bell, Shield, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SETTINGS_SECTIONS = [
  { title: "Company Profile", description: "Business name, branding, and contact details.", icon: Building2 },
  { title: "Roles & Permissions", description: "Control what each role can see and do.", icon: Shield },
  { title: "Team Members", description: "Invite and manage user accounts.", icon: Users },
  { title: "Notifications", description: "Configure follow-up and deal alerts.", icon: Bell },
];

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Configure your workspace and preferences."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SETTINGS_SECTIONS.map((section) => (
          <Card key={section.title}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
              <CardTitle className="text-sm font-medium">{section.title}</CardTitle>
              <section.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">{section.description}</p>
              <Badge variant="secondary">Coming soon</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

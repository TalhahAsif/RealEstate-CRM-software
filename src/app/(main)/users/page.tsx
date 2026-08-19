import { Users } from "lucide-react";
import { EntityPlaceholderPage } from "@/components/shared/EntityPlaceholderPage";

export default function UsersPage() {
  return (
    <EntityPlaceholderPage
      title="Users"
      description="Manage your team's accounts and roles."
      actionLabel="Add User"
      icon={Users}
      columns={["Name", "Email", "Role", "Status"]}
      emptyDescription="Admins, agents, and other team members will be listed here."
    />
  );
}

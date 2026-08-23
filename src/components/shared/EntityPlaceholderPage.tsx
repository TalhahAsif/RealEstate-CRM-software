import type { LucideIcon } from "lucide-react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";

interface EntityPlaceholderPageProps {
  title: string;
  description: string;
  actionLabel: string;
  icon: LucideIcon;
  columns: string[];
  emptyDescription: string;
  data?: unknown[];
}

/**
 * Shared shell for module list pages that don't have CRUD wired up yet.
 * Renders the standard header + empty table so every module looks and
 * behaves the same until its real page.tsx replaces this call.
 */
export function EntityPlaceholderPage({
  title,
  description,
  actionLabel,
  icon,
  columns,
  emptyDescription,
  data = [],
}: EntityPlaceholderPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={title}
        description={description}
        action={
          <Button disabled title="Coming soon">
            <Plus />
            {actionLabel}
          </Button>
        }
      />
      <DataTable
        columns={columns.map((header) => ({ header, cell: () => null }))}
        data={data}
        keyExtractor={() => ""}
        emptyState={
          <EmptyState
            icon={icon}
            title={`No ${title.toLowerCase()} yet`}
            description={emptyDescription}
          />
        }
      />
    </div>
  );
}

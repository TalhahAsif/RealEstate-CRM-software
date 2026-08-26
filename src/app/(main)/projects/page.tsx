"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectFormModal, type ProjectRow } from "@/components/projects/ProjectFormModal";
import { toTitleCase } from "@/lib/utils/format";
import type { ApiResponse } from "@/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<ProjectRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    try {
      const response = await fetch("/api/projects");
      const result = (await response.json()) as ApiResponse<ProjectRow[]>;

      if (result.success && result.data) {
        setProjects(result.data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  async function handleDelete(project: ProjectRow) {
    if (!window.confirm(`Delete "${project.name}"? This cannot be undone.`)) {
      return;
    }

    setDeletingId(project._id);
    try {
      const response = await fetch(`/api/projects/${project._id}`, {
        method: "DELETE",
      });
      const result = (await response.json()) as ApiResponse;

      if (!response.ok || !result.success) {
        alert(result.message || "Unable to delete project");
        return;
      }

      await loadProjects();
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  const columns: DataTableColumn<ProjectRow>[] = [
    { header: "Name", cell: (project) => <span className="font-medium">{project.name}</span> },
    { header: "Developer", cell: (project) => project.developer || "—" },
    { header: "City", cell: (project) => project.city },
    {
      header: "Status",
      cell: (project) => <Badge variant="outline">{toTitleCase(project.status)}</Badge>,
    },
    { header: "Units", cell: (project) => project.totalUnits ?? "—" },
    {
      header: "",
      className: "w-10",
      cell: (project) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" disabled={deletingId === project._id}>
              <MoreHorizontal />
              <span className="sr-only">Open actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setEditingProject(project)}>
              <Pencil />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={() => handleDelete(project)}>
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Projects"
        description="Manage developments that group multiple properties."
        action={
          <ProjectFormModal
            trigger={
              <Button>
                <Plus />
                Add Project
              </Button>
            }
            onSaved={loadProjects}
          />
        }
      />
      <DataTable
        columns={columns}
        data={projects}
        keyExtractor={(project) => project._id}
        emptyState={
          !isLoading ? (
            <EmptyState
              icon={Building2}
              title="No projects yet"
              description="Housing and commercial projects will be listed here."
            />
          ) : null
        }
      />
      <ProjectFormModal
        project={editingProject}
        open={Boolean(editingProject)}
        onOpenChange={(open) => {
          if (!open) setEditingProject(null);
        }}
        onSaved={loadProjects}
      />
    </div>
  );
}

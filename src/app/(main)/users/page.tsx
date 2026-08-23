"use client";

import { useEffect, useState } from "react";
import { Plus, Users as UsersIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInitials, toTitleCase } from "@/lib/utils/format";
import type { ApiResponse } from "@/types";
import type { IUser } from "@/models/User";

type UserRow = Pick<
  IUser,
  "firstName" | "lastName" | "email" | "role" | "isActive"
> & { _id: string };

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      try {
        const response = await fetch("/api/users");
        const result = (await response.json()) as ApiResponse<UserRow[]>;

        if (!cancelled && result.success && result.data) {
          setUsers(result.data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadUsers();
    return () => {
      cancelled = true;
    };
  }, []);

  const columns: DataTableColumn<UserRow>[] = [
    {
      header: "Name",
      cell: (user) => (
        <div className="flex items-center gap-2.5">
          <Avatar size="sm">
            <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">
            {user.firstName} {user.lastName}
          </span>
        </div>
      ),
    },
    { header: "Email", cell: (user) => user.email },
    {
      header: "Role",
      cell: (user) => <Badge variant="outline">{toTitleCase(user.role)}</Badge>,
    },
    {
      header: "Status",
      cell: (user) => (
        <Badge variant={user.isActive ? "default" : "secondary"}>
          {user.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Users"
        description="Manage your team's accounts and roles."
        action={
          <Button disabled title="Coming soon">
            <Plus />
            Add User
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={users}
        keyExtractor={(user) => user._id}
        emptyState={
          !isLoading ? (
            <EmptyState
              icon={UsersIcon}
              title="No users yet"
              description="Admins, agents, and other team members will be listed here."
            />
          ) : null
        }
      />
    </div>
  );
}

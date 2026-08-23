import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default async function MainLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

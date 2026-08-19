"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Building,
  CalendarCheck,
  FileText,
  Handshake,
  LayoutDashboard,
  PhoneCall,
  Percent,
  Building as ProjectIcon,
  BarChart3,
  Settings,
  UserSquare2,
  Users,
  Wallet,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "CRM",
    items: [
      { label: "Leads", href: "/leads", icon: PhoneCall },
      { label: "Customers", href: "/customers", icon: UserSquare2 },
      { label: "Follow-ups", href: "/follow-ups", icon: CalendarCheck },
      { label: "Site Visits", href: "/site-visits", icon: Home },
    ],
  },
  {
    title: "Properties",
    items: [
      { label: "Properties", href: "/properties", icon: Building },
      { label: "Projects", href: "/projects", icon: ProjectIcon },
    ],
  },
  {
    title: "Sales",
    items: [
      { label: "Deals", href: "/deals", icon: Handshake },
      { label: "Payments", href: "/payments", icon: Wallet },
      { label: "Commissions", href: "/commissions", icon: Percent },
    ],
  },
  {
    title: "Management",
    items: [
      { label: "Documents", href: "/documents", icon: FileText },
      { label: "Users", href: "/users", icon: Users },
    ],
  },
];

function isActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex h-full flex-col gap-4 overflow-y-auto px-3 py-4">
      <Link href="/dashboard" className="flex items-center gap-2 px-2 py-1.5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Building2 className="size-4" />
        </div>
        <span className="text-sm font-semibold tracking-tight">Estate CRM</span>
      </Link>

      <SidebarLink
        item={{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }}
        active={isActive(pathname, "/dashboard")}
      />

      {NAV_SECTIONS.map((section) => (
        <div key={section.title} className="flex flex-col gap-1">
          <p className="px-2 text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
            {section.title}
          </p>
          {section.items.map((item) => (
            <SidebarLink key={item.href} item={item} active={isActive(pathname, item.href)} />
          ))}
        </div>
      ))}

      <div className="mt-auto flex flex-col gap-1 border-t pt-3">
        <SidebarLink
          item={{ label: "Reports", href: "/reports", icon: BarChart3 }}
          active={isActive(pathname, "/reports")}
        />
        <SidebarLink
          item={{ label: "Settings", href: "/settings", icon: Settings }}
          active={isActive(pathname, "/settings")}
        />
      </div>
    </nav>
  );
}

function SidebarLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="size-4 shrink-0" />
      {item.label}
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r bg-sidebar text-sidebar-foreground lg:block">
      <SidebarNav />
    </aside>
  );
}

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Fragment, ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar collapsible="offcanvas" className="border-r">
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-1.5">
              <div className="h-6 w-6 rounded-md bg-gradient-to-br from-primary to-cyan-500" />
              <span className="text-sm font-semibold">Proposal AI</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <a href="/dashboard" className="block">
                    <SidebarMenuButton asChild>
                      <span>Dashboard</span>
                    </SidebarMenuButton>
                  </a>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <a href="/user" className="block">
                    <SidebarMenuButton asChild>
                      <span>Users</span>
                    </SidebarMenuButton>
                  </a>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <a href="/admin/packages" className="block">
                    <SidebarMenuButton asChild>
                      <span>Packages</span>
                    </SidebarMenuButton>
                  </a>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <a href="/proposals" className="block">
                    <SidebarMenuButton asChild>
                      <span>Proposals</span>
                    </SidebarMenuButton>
                  </a>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <a href="/clients" className="block">
                    <SidebarMenuButton asChild>
                      <span>Clients</span>
                    </SidebarMenuButton>
                  </a>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarRail />
        </Sidebar>
        <SidebarInset className="flex min-h-screen w-full flex-col">
          <ThinHeader />
          <main className="flex-1">{children}</main>
          <ThinFooter />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function ThinHeader() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);
  const crumbs =
    segments.length === 0
      ? [{ label: "Dashboard", href: "/dashboard" }]
      : segments.slice(0, 2).map((segment, index) => ({
          label: formatSegmentLabel(segment, index),
          href: `/${segments.slice(0, index + 1).join("/")}`,
        }));

  return (
    <div className="sticky top-0 z-20 flex h-12 items-center justify-between border-b bg-background/80 px-4 text-sm backdrop-blur">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="font-medium text-foreground">App</span>
        {crumbs.map((crumb, index) => (
          <Fragment key={crumb.href}>
            <span>{index === 0 ? "•" : "/"}</span>
            <Link to={crumb.href} className="hover:text-foreground">
              {crumb.label}
            </Link>
          </Fragment>
        ))}
      </div>
      <div className="text-muted-foreground">v1.0</div>
    </div>
  );
}

function formatSegmentLabel(segment: string, index: number) {
  const dictionary: Record<string, string> = {
    dashboard: "Dashboard",
    user: "Users",
    users: "Users",
    proposals: "Proposals",
    clients: "Clients",
    admin: "Admin",
    packages: "Packages",
    settings: "Settings",
    edit: "Edit",
    view: "View",
    invite: "Invite",
    p: "Proposal",
  };

  const normalized = segment.toLowerCase();
  if (dictionary[normalized]) {
    return dictionary[normalized];
  }

  if (/^[a-z0-9-]{6,}$/.test(normalized)) {
    return index === 0 ? "Details" : "Details";
  }

  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function ThinFooter() {
  return (
    <div className="flex h-10 items-center justify-between border-t px-4 text-xs text-muted-foreground">
      <span>© {new Date().getFullYear()} Proposal AI</span>
      <span>All systems normal</span>
    </div>
  );
}

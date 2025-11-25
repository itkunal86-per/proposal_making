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
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Fragment, ReactNode, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/data/users";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
}

const navByRole: Record<UserRole, NavItem[]> = {
  admin: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/packages", label: "Packages" },
    { href: "/admin/templates", label: "Templates" },
    { href: "/admin/settings", label: "Settings" },
  ],
  subscriber: [
    { href: "/my/proposals", label: "My Proposals" },
    { href: "/my/clients", label: "My Clients" },
    { href: "/my/settings", label: "Settings" },
  ],
};

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = useMemo(() => {
    return user ? navByRole[user.role] : [];
  }, [user]);

  const handleSignOut = () => {
    signOut();
    navigate("/login", { replace: true });
  };

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen">
        <Sidebar collapsible="offcanvas" className="border-r">
          <SidebarHeader>
            <div className="flex items-center justify-between gap-2 px-2 py-1.5">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-gradient-to-br from-primary to-cyan-500" />
                <span className="text-sm font-semibold">Proposal AI</span>
              </div>
              {user && (
                <span className="rounded-full bg-sidebar-accent px-2 py-0.5 text-xs font-medium text-sidebar-accent-foreground">
                  {user.role === "admin" ? "Admin" : "Subscriber"}
                </span>
              )}
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarMenu>
                {navItems.map((item) => {
                  const active =
                    location.pathname === item.href ||
                    location.pathname.startsWith(`${item.href}/`);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild>
                        <Link
                          to={item.href}
                          className={cn(
                            "flex items-center gap-2",
                            active && "bg-sidebar-accent text-sidebar-accent-foreground",
                          )}
                          aria-current={active ? "page" : undefined}
                        >
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          {user && (
            <SidebarFooter>
              <div className="rounded-lg border bg-background p-3 text-xs">
                <div className="font-medium text-foreground">{user.name}</div>
                {user.company && (
                  <div className="text-muted-foreground">{user.company}</div>
                )}
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">{user.email}</span>
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    Sign out
                  </Button>
                </div>
              </div>
            </SidebarFooter>
          )}
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
    templates: "Templates",
    my: "My Workspace",
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

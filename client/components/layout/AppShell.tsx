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
import {
  LayoutDashboard,
  Users,
  Box,
  FileText,
  Settings,
  Zap,
  LogOut,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navByRole: Record<UserRole, NavItem[]> = {
  admin: [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: "/admin/users", label: "Users", icon: <Users className="w-5 h-5" /> },
    { href: "/admin/packages", label: "Packages", icon: <Box className="w-5 h-5" /> },
    { href: "/admin/templates", label: "Templates", icon: <FileText className="w-5 h-5" /> },
    { href: "/admin/settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
  ],
  subscriber: [
    { href: "/my/proposals", label: "My Proposals", icon: <FileText className="w-5 h-5" /> },
    { href: "/my/clients", label: "My Clients", icon: <Users className="w-5 h-5" /> },
    { href: "/integrations", label: "Integrations", icon: <Zap className="w-5 h-5" /> },
    { href: "/my/settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
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
        <Sidebar collapsible="offcanvas" className="border-r border-border bg-gradient-to-b from-background to-muted/10">
          <SidebarHeader className="border-b border-border/40 bg-white/50 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3 px-3 py-3">
              <div className="flex items-center gap-3 flex-1">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 shadow-md" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">Proposal AI</span>
                  <span className="text-xs text-muted-foreground">v1.0</span>
                </div>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-3 py-4">
            <SidebarGroup className="pb-6">
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-3">
                Navigation
              </SidebarGroupLabel>
              <SidebarMenu className="gap-1">
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
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer group",
                            "hover:bg-muted/60 text-foreground/70 hover:text-foreground",
                            active && "bg-primary/10 text-primary font-medium shadow-sm border border-primary/20",
                          )}
                          aria-current={active ? "page" : undefined}
                        >
                          <span className={cn(
                            "transition-colors duration-200",
                            active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                          )}>
                            {item.icon}
                          </span>
                          <span className="text-sm font-medium">{item.label}</span>
                          {active && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          {user && (
            <SidebarFooter className="border-t border-border/40 bg-white/50 backdrop-blur-sm px-3 py-3">
              <div className="rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 p-3 text-xs space-y-2">
                <div className="font-semibold text-foreground">{user.name}</div>
                {user.company && (
                  <div className="text-xs text-muted-foreground">{user.company}</div>
                )}
                <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                <div className="inline-block">
                  <span className="rounded-full bg-primary/20 text-primary px-2 py-1 text-xs font-medium">
                    {user.role === "admin" ? "Admin" : "Subscriber"}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-full mt-2 gap-2 border-primary/20 hover:bg-primary/5"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </Button>
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
    integrations: "Integrations",
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

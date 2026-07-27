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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
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
  Palette,
} from "lucide-react";

interface NavSubItem {
  href: string;
  label: string;
}

interface NavItem {
  href?: string;
  label: string;
  icon?: React.ReactNode;
  children?: NavSubItem[];
}

const navByRole: Record<UserRole, NavItem[]> = {
  admin: [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: "/admin/users", label: "Users", icon: <Users className="w-5 h-5" /> },
    { href: "/admin/packages", label: "Packages", icon: <Box className="w-5 h-5" /> },
    {
      label: "Templates",
      icon: <FileText className="w-5 h-5" />,
      children: [
        { href: "/admin/templates/system", label: "System Templates" },
        { href: "/admin/templates/clients", label: "Clients Templates" },
      ],
    },
    { href: "/admin/ppt-styles", label: "PPT Styles", icon: <Palette className="w-5 h-5" /> },
    { href: "/admin/settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
  ],
  subscriber: [
    { href: "/my/proposals", label: "Proposals", icon: <FileText className="w-5 h-5" /> },
    { href: "/my/templates", label: "Templates", icon: <FileText className="w-5 h-5" /> },
    { href: "/my/clients", label: "Clients", icon: <Users className="w-5 h-5" /> },
    { href: "/my/users", label: "Users", icon: <Users className="w-5 h-5" /> },
    // { href: "/integrations", label: "Integrations", icon: <Zap className="w-5 h-5" /> },
    { href: "/my/settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
  ],
  user: [
    { href: "/my/proposals", label: "Proposals", icon: <FileText className="w-5 h-5" /> },
    { href: "/my/templates", label: "Templates", icon: <FileText className="w-5 h-5" /> },
    { href: "/my/clients", label: "Clients", icon: <Users className="w-5 h-5" /> },
  ],
};

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = useMemo(() => {
    if (!user) return [];
    return navByRole[user.role].flatMap((item) =>
      item.children
        ? item.children.map((child) => ({ ...child, icon: item.icon }))
        : [item],
    );
  }, [user]);

  const handleSignOut = () => {
    signOut();
    navigate("/login", { replace: true });
  };

  return (
    <SidebarProvider style={{ "--sidebar-width": "104px" } as React.CSSProperties}>
      <div className="flex w-full min-h-screen">
        <Sidebar collapsible="none" className="border-r border-slate-200 bg-white">
          <SidebarHeader className="border-b border-slate-100 bg-white px-0 py-3">
            <div className="flex items-center justify-center">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F89024f4abe0b4e7d9ae689ddeddf5b00%2Faf46febe108646538f673dc6c961d8c1?format=webp&width=800&height=1200"
                alt="PitchSuite"
                className="h-8 w-8 object-contain"
              />
            </div>
          </SidebarHeader>
          <SidebarContent className="bg-white px-2 py-3">
            <SidebarGroup className="pb-0">
              <SidebarGroupLabel className="sr-only">Navigation</SidebarGroupLabel>
              <SidebarMenu className="gap-1">
                {navItems.map((item) => {
                  const active = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild className="h-14 w-full overflow-visible rounded-lg p-1">
                        <Link
                          to={item.href!}
                          title={item.label}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex flex-col items-center justify-center gap-1 rounded-lg whitespace-normal break-words text-[clamp(8px,0.65vw,12px)] leading-[1.1] text-slate-600 transition-colors",
                            "hover:bg-slate-100 hover:text-slate-900",
                            active && "bg-slate-100 font-semibold text-slate-900",
                          )}
                        >
                          <span className={active ? "text-slate-900" : "text-slate-500"}>{item.icon}</span>
                          <span className="max-w-full text-center">{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          {user && (
            <SidebarFooter className="border-t border-slate-100 bg-white px-2 py-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                title="Sign out"
                className="mx-auto h-9 w-9 rounded-lg bg-fuchsia-100 text-fuchsia-700 hover:bg-fuchsia-200"
              >
                <span className="text-sm font-semibold">{(user.name || user.email).charAt(0).toUpperCase()}</span>
                <span className="sr-only">Sign out</span>
              </Button>
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
    system: "System Templates",
    integrations: "Integrations",
    my: "My Workspace",
    edit: "Edit",
    view: "View",
    invite: "Invite",
    p: "Proposal",
    t: "Template",
    "ppt-styles": "PPT Styles",
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
      <span>© {new Date().getFullYear()} Pitchsuite</span>
      <span>All systems normal</span>
    </div>
  );
}

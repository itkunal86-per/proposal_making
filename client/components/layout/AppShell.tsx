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
  return (
    <div className="sticky top-0 z-20 flex h-12 items-center justify-between border-b bg-background/80 px-4 text-sm backdrop-blur">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="font-medium text-foreground">App</span>
        <span>•</span>
        <a href="/dashboard" className="hover:text-foreground">
          Dashboard
        </a>
        <span>/</span>
        <a href="/user" className="hover:text-foreground">
          Users
        </a>
      </div>
      <div className="text-muted-foreground">v1.0</div>
    </div>
  );
}

function ThinFooter() {
  return (
    <div className="flex h-10 items-center justify-between border-t px-4 text-xs text-muted-foreground">
      <span>© {new Date().getFullYear()} Proposal AI</span>
      <span>All systems normal</span>
    </div>
  );
}

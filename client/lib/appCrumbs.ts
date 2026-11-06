export interface AppCrumb {
  label: string;
  href: string;
  external: boolean;
}

const SEGMENT_LABELS: Record<string, string> = {
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
  my: "Home",
  edit: "Edit",
  view: "View",
  invite: "Invite",
  p: "Proposal",
  t: "Template",
  "ppt-styles": "PPT Styles",
};

export function formatSegmentLabel(segment: string, index: number): string {
  const normalized = segment.toLowerCase();
  if (SEGMENT_LABELS[normalized]) {
    return SEGMENT_LABELS[normalized];
  }

  if (/^[a-z0-9-]{6,}$/.test(normalized)) {
    return index === 0 ? "Details" : "Details";
  }

  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const PAGE_TITLES: Array<{ prefix: string; title: string }> = [
  { prefix: "/admin/templates/system", title: "System Templates" },
  { prefix: "/admin/templates/clients", title: "Clients Templates" },
  { prefix: "/admin/ppt-styles", title: "PPT Styles" },
  { prefix: "/admin/packages", title: "Package catalog" },
  { prefix: "/admin/settings", title: "Admin Settings" },
  { prefix: "/admin/templates", title: "Templates" },
  { prefix: "/admin/users", title: "Users" },
  { prefix: "/my/proposals", title: "My Proposals" },
  { prefix: "/my/templates", title: "My Templates" },
  { prefix: "/my/clients", title: "Clients" },
  { prefix: "/my/users", title: "Users" },
  { prefix: "/my/settings", title: "My Settings" },
  { prefix: "/integrations", title: "Integrations" },
  { prefix: "/dashboard", title: "Admin Dashboard" },
];

export function appPageTitle(pathname: string): string {
  if (/^\/proposals\/[^/]+\/settings\/?$/.test(pathname)) {
    return "Proposal Settings";
  }

  const match = PAGE_TITLES.find(
    (entry) => pathname === entry.prefix || pathname.startsWith(`${entry.prefix}/`),
  );
  return match?.title ?? "App";
}

export function buildAppCrumbs(pathname: string, homeHref: string): AppCrumb[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return [{ label: "Dashboard", href: "/dashboard", external: false }];
  }

  return segments.slice(0, 2).map((segment, index) => {
    const isWorkspaceHome = index === 0 && segment.toLowerCase() === "my";
    return {
      label: isWorkspaceHome ? "Home" : formatSegmentLabel(segment, index),
      href: isWorkspaceHome ? homeHref : `/${segments.slice(0, index + 1).join("/")}`,
      external: isWorkspaceHome,
    };
  });
}

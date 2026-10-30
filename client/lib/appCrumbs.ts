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

import type { MembershipRole } from "@/lib/auth";
import type { UserRole } from "@/data/users";

/**
 * Menu order follows demo-e2e AppSidebarV2.
 * Items that exist only in the proposal app stay in the final group.
 * CRM destinations reuse the Home link's main-app URL. They are not local routes.
 */
export type SidebarIconName =
  | "home"
  | "inbox"
  | "calendar"
  | "library"
  | "reports"
  | "proposals"
  | "templates"
  | "deals"
  | "contacts"
  | "companies"
  | "dashboard"
  | "users"
  | "packages"
  | "clients"
  | "ppt";

export type SidebarNavItem = {
  id: string;
  label: string;
  href: string;
  external: boolean;
  icon: SidebarIconName;
};

export type SidebarUser = {
  role: UserRole;
  membershipRole?: MembershipRole;
};

export type SidebarMenuModel = {
  groups: SidebarNavItem[][];
  settingsHref?: string;
};

const LOCAL_ROUTES = new Set([
  "/dashboard",
  "/admin/users",
  "/admin/packages",
  "/admin/templates/system",
  "/admin/templates/clients",
  "/admin/ppt-styles",
  "/admin/settings",
  "/my/proposals",
  "/my/templates",
  "/my/clients",
  "/my/users",
  "/my/settings",
]);

export function isProposalFocusedNav(user: SidebarUser) {
  return user.role === "user" && (user.membershipRole === "reviewer" || user.membershipRole === null);
}

function crmPath(mainAppUrl: string, path: string) {
  return `${mainAppUrl.replace(/\/+$/, "")}${path}`;
}

function item(
  id: string,
  label: string,
  href: string,
  external: boolean,
  icon: SidebarIconName,
): SidebarNavItem {
  return { id, label, href, external, icon };
}

export function buildSidebarMenu(user: SidebarUser | null, mainAppUrl: string): SidebarMenuModel {
  if (!user) {
    return { groups: [] };
  }

  const focused = isProposalFocusedNav(user);
  const seesWorkspace = user.role === "subscriber" || user.role === "user";
  const seesProposals = seesWorkspace;
  const seesTemplates = seesWorkspace && !focused;

  const groups: SidebarNavItem[][] = [];

  const primary: SidebarNavItem[] = [item("home", "Home", mainAppUrl, true, "home")];
  if (!focused) {
    primary.push(
      item("inbox", "Inbox", crmPath(mainAppUrl, "/inbox"), true, "inbox"),
      item("calendar", "Calendar", crmPath(mainAppUrl, "/calendar"), true, "calendar"),
      item("library", "Library", crmPath(mainAppUrl, "/library"), true, "library"),
      item("reports", "Reports", crmPath(mainAppUrl, "/reports"), true, "reports"),
    );
  }
  groups.push(primary);

  const workspace: SidebarNavItem[] = [];
  if (seesProposals) {
    workspace.push(item("proposals", "Proposals", "/my/proposals", false, "proposals"));
  }
  if (seesTemplates) {
    workspace.push(item("templates", "Templates", "/my/templates", false, "templates"));
  }
  if (!focused) {
    workspace.push(
      item("deals", "Deals", crmPath(mainAppUrl, "/deals"), true, "deals"),
      item("contacts", "Contacts", crmPath(mainAppUrl, "/contacts"), true, "contacts"),
      item("companies", "Companies", crmPath(mainAppUrl, "/companies"), true, "companies"),
    );
  }
  if (workspace.length > 0) {
    groups.push(workspace);
  }

  const proposalOnly: SidebarNavItem[] = [];
  if (user.role === "admin") {
    proposalOnly.push(
      item("dashboard", "Dashboard", "/dashboard", false, "dashboard"),
      item("packages", "Packages", "/admin/packages", false, "packages"),
      item("system-templates", "System Templates", "/admin/templates/system", false, "templates"),
      item("client-templates", "Clients Templates", "/admin/templates/clients", false, "templates"),
      item("ppt-styles", "PPT Styles", "/admin/ppt-styles", false, "ppt"),
    );
  }
  if (proposalOnly.length > 0) {
    groups.push(proposalOnly);
  }

  let settingsHref: string | undefined;
  if (user.role === "admin") settingsHref = "/admin/settings";
  if (user.role === "subscriber") settingsHref = "/my/settings";

  return { groups, settingsHref };
}

export function isSidebarItemActive(pathname: string, navItem: SidebarNavItem) {
  if (navItem.external) return false;
  return pathname === navItem.href || pathname.startsWith(`${navItem.href}/`);
}

export function sidebarInternalHrefs(model: SidebarMenuModel) {
  return model.groups.flat().filter((navItem) => !navItem.external).map((navItem) => navItem.href);
}

export function isKnownLocalSidebarRoute(href: string) {
  return LOCAL_ROUTES.has(href);
}

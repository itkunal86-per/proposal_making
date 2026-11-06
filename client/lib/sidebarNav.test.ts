import { describe, expect, it } from "vitest";
import {
  buildSidebarMenu,
  isKnownLocalSidebarRoute,
  isSidebarItemActive,
  sidebarInternalHrefs,
  type SidebarUser,
} from "./sidebarNav";

const HOME = "https://pitchsuite.io/";

function labels(user: SidebarUser) {
  return buildSidebarMenu(user, HOME).groups.map((group) => group.map((item) => item.label));
}

describe("sidebar menu order", () => {
  it("matches the CRM rail for a subscriber and keeps proposal-only items after it", () => {
    expect(labels({ role: "subscriber" })).toEqual([
      ["Home", "Inbox", "Calendar", "Library", "Reports"],
      ["Proposals", "Templates", "Deals", "Contacts", "Companies"],
    ]);
  });

  it("treats a user without a membership role like a full workspace user", () => {
    expect(labels({ role: "user" })).toEqual(labels({ role: "user", membershipRole: "manager" }));
  });

  it("shows the same rail to a workspace user without a separate clients group", () => {
    expect(labels({ role: "user", membershipRole: "manager" })).toEqual([
      ["Home", "Inbox", "Calendar", "Library", "Reports"],
      ["Proposals", "Templates", "Deals", "Contacts", "Companies"],
    ]);
  });

  it("keeps reviewer and unset membership navigation limited to home and proposals", () => {
    const expected = [["Home"], ["Proposals"]];
    expect(labels({ role: "user", membershipRole: "reviewer" })).toEqual(expected);
    expect(labels({ role: "user", membershipRole: null })).toEqual(expected);
  });

  it("keeps platform admin tools in a separate group and does not send admin to workspace routes", () => {
    const model = buildSidebarMenu({ role: "admin" }, HOME);
    expect(labels({ role: "admin" })).toEqual([
      ["Home", "Inbox", "Calendar", "Library", "Reports"],
      ["Deals", "Contacts", "Companies"],
      ["Dashboard", "Packages", "System Templates", "Clients Templates", "PPT Styles"],
    ]);
    expect(sidebarInternalHrefs(model)).not.toContain("/my/proposals");
    expect(sidebarInternalHrefs(model)).not.toContain("/my/templates");
    expect(sidebarInternalHrefs(model)).not.toContain("/my/clients");
  });
});

describe("sidebar destinations", () => {
  it("keeps Home on the configured main app URL and builds other CRM links from it", () => {
    const items = buildSidebarMenu({ role: "subscriber" }, HOME).groups.flat();
    expect(items.find((item) => item.id === "home")).toMatchObject({
      href: HOME,
      external: true,
    });
    expect(items.find((item) => item.id === "inbox")?.href).toBe("https://pitchsuite.io/inbox");
    expect(items.find((item) => item.id === "deals")?.href).toBe("https://pitchsuite.io/deals");
    expect(items.find((item) => item.id === "proposals")).toMatchObject({
      href: "/my/proposals",
      external: false,
    });
  });

  it("moves settings into the footer without dropping the existing route", () => {
    const subscriber = buildSidebarMenu({ role: "subscriber" }, HOME);
    const admin = buildSidebarMenu({ role: "admin" }, HOME);
    const reviewer = buildSidebarMenu({ role: "user", membershipRole: "reviewer" }, HOME);

    expect(subscriber.settingsHref).toBe("/my/settings");
    expect(admin.settingsHref).toBe("/admin/settings");
    expect(reviewer.settingsHref).toBeUndefined();
    expect(subscriber.groups.flat().some((item) => item.label === "Settings")).toBe(false);
    expect(sidebarInternalHrefs(subscriber).every(isKnownLocalSidebarRoute)).toBe(true);
    expect(sidebarInternalHrefs(admin).every(isKnownLocalSidebarRoute)).toBe(true);
  });

  it("hides Users and Clients from the sidebar while leaving their routes defined", () => {
    const roles: SidebarUser[] = [
      { role: "admin" },
      { role: "subscriber" },
      { role: "user", membershipRole: "manager" },
      { role: "user", membershipRole: "reviewer" },
    ];
    for (const user of roles) {
      const hrefs = buildSidebarMenu(user, HOME).groups.flat().map((item) => item.href);
      expect(hrefs).not.toContain("/my/clients");
      expect(hrefs).not.toContain("/my/users");
      expect(hrefs).not.toContain("/admin/users");
    }
    expect(isKnownLocalSidebarRoute("/my/clients")).toBe(true);
    expect(isKnownLocalSidebarRoute("/my/users")).toBe(true);
    expect(isKnownLocalSidebarRoute("/admin/users")).toBe(true);
  });

  it("does not expose the commented-out integrations destination", () => {
    const roles: SidebarUser[] = [
      { role: "admin" },
      { role: "subscriber" },
      { role: "user", membershipRole: "sales" },
      { role: "user", membershipRole: "reviewer" },
    ];
    for (const user of roles) {
      expect(buildSidebarMenu(user, HOME).groups.flat().some((item) => item.href === "/integrations")).toBe(false);
    }
  });

  it("highlights only the local route that owns the path", () => {
    const proposals = buildSidebarMenu({ role: "subscriber" }, HOME).groups.flat().find((item) => item.id === "proposals")!;
    const templates = buildSidebarMenu({ role: "subscriber" }, HOME).groups.flat().find((item) => item.id === "templates")!;
    const system = buildSidebarMenu({ role: "admin" }, HOME).groups.flat().find((item) => item.id === "system-templates")!;
    const clients = buildSidebarMenu({ role: "admin" }, HOME).groups.flat().find((item) => item.id === "client-templates")!;

    expect(isSidebarItemActive("/my/proposals", proposals)).toBe(true);
    expect(isSidebarItemActive("/my/proposals/new", proposals)).toBe(true);
    expect(isSidebarItemActive("/my/templates", proposals)).toBe(false);
    expect(isSidebarItemActive("/my/templates", templates)).toBe(true);
    expect(isSidebarItemActive("/admin/templates/system", system)).toBe(true);
    expect(isSidebarItemActive("/admin/templates/system/edit", system)).toBe(true);
    expect(isSidebarItemActive("/admin/templates/clients", system)).toBe(false);
    expect(isSidebarItemActive("/admin/templates/clients", clients)).toBe(true);
    expect(isSidebarItemActive("/my/proposals", buildSidebarMenu({ role: "subscriber" }, HOME).groups[0][0])).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { buildAppCrumbs } from "./appCrumbs";

const HOME = "https://pitchsuite.io/";

describe("application breadcrumbs", () => {
  it("labels the workspace crumb Home and links it to the sidebar home destination", () => {
    const crumbs = buildAppCrumbs("/my/proposals", HOME);

    expect(crumbs).toEqual([
      { label: "Home", href: HOME, external: true },
      { label: "Proposals", href: "/my/proposals", external: false },
    ]);
    expect(crumbs[0].href).not.toBe("/");
    expect(crumbs[0].href).not.toBe("/my");
  });

  it("keeps page names on templates, settings, and the proposal editor path", () => {
    expect(buildAppCrumbs("/my/templates", HOME)[1]).toMatchObject({
      label: "Templates",
      href: "/my/templates",
      external: false,
    });
    expect(buildAppCrumbs("/my/settings", HOME)[1]).toMatchObject({
      label: "Settings",
      href: "/my/settings",
      external: false,
    });
    expect(buildAppCrumbs("/proposals/abc123def/edit", HOME)).toEqual([
      { label: "Proposals", href: "/proposals", external: false },
      { label: "Details", href: "/proposals/abc123def", external: false },
    ]);
  });

  it("does not rename admin navigation to Home", () => {
    const crumbs = buildAppCrumbs("/admin/users", HOME);
    expect(crumbs.map((crumb) => crumb.label)).toEqual(["Admin", "Users"]);
    expect(crumbs.every((crumb) => crumb.external === false)).toBe(true);
  });
});

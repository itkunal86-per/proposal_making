import { describe, expect, it } from "vitest";
import { collectOrganizationMedia, exportUrls, sectionsForSave, shouldRefreshSignedUrl, sourceKey, type OrganizationImage } from "./organizationMedia";

describe("organization media references", () => {
  it("keeps a CRM source and removes only its display URL before save", () => {
    const saved = sectionsForSave([{
      images: [
        { url: "https://signed.example/file?X-Amz-Signature=temp", width: 200, source: { provider: "crm", fileId: 501, organizationId: 10 } },
        { url: "https://files.example/old.png?Expires=1&X-Amz-Signature=keep", width: 200 },
      ],
    }]);

    expect(saved[0].images?.[0].url).toBe("");
    expect(saved[0].images?.[0].source).toEqual({ provider: "crm", fileId: 501, organizationId: 10 });
    expect(saved[0].images?.[1].url).toContain("X-Amz-Signature=keep");
  });

  it("uses stored snapshot URLs and reports a missing CRM file", () => {
    const sections: Array<{ images: OrganizationImage[] }> = [{
      images: [
        { url: "https://files.example/durable.png", source: { provider: "proposal_snapshot", snapshotId: 9, organizationId: 10 } },
        { url: "", source: { provider: "crm", fileId: 501, organizationId: 10 } },
      ],
    }];

    expect(sourceKey(sections[0].images[0])).toBe("snapshot:9");
    const ready = exportUrls(sections, {
      files: [{ id: 501, previewUrl: "https://signed.example/file" }],
      logo: null,
    });
    expect(ready.missing).toBe(false);
    expect(ready.urls["snapshot:9"]).toBe("https://files.example/durable.png");

    const missing = exportUrls(sections, { files: [{ id: 501, status: "missing" }] });
    expect(missing.missing).toBe(true);
    expect(missing.urls["snapshot:9"]).toBe("https://files.example/durable.png");
  });

  it("refreshes a signed URL inside the 15 minute window", () => {
    const now = Date.parse("2026-10-13T12:00:00Z");
    expect(shouldRefreshSignedUrl("2026-10-13T12:10:00Z", now)).toBe(true);
    expect(shouldRefreshSignedUrl("2026-10-13T12:30:00Z", now)).toBe(false);
    expect(collectOrganizationMedia([{ images: [{ source: { provider: "crm_logo", organizationId: 10 } }] }]).includeLogo).toBe(true);
  });
});

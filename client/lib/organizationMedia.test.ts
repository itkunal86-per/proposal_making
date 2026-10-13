import { describe, expect, it } from "vitest";
import { collectOrganizationMedia, exportUrls, sectionsForSave, shouldAbortPdfExport, shouldRefreshSignedUrl, sourceKey, type OrganizationImage } from "./organizationMedia";
import { applySectionIds } from "@/services/proposalsService";
import { autosaveAfterResponse, proposalUpdateBody } from "./proposalSave";

describe("organization media references", () => {
  it("keeps a CRM source and removes only its display URL before save", () => {
    const saved = sectionsForSave([{
      images: [
        { url: "https://signed.example/file?X-Amz-Signature=temp", width: 200, source: { provider: "crm" as const, fileId: 501, dealId: 88, organizationId: 10, restore: "required" as const } },
        { url: "https://files.example/old.png?Expires=1&X-Amz-Signature=keep", width: 200 },
      ],
    }]);

    expect(saved[0].images?.[0].url).toBe("");
    expect(saved[0].images?.[0].source?.restore).toBe("required");
    expect(saved[0].images?.[1].url).toContain("X-Amz-Signature=keep");
  });

  it("uses stored snapshot URLs and reports a missing CRM file", () => {
    const sections: Array<{ images: OrganizationImage[] }> = [{
      images: [
        { url: "https://files.example/durable.png", source: { provider: "proposal_snapshot", snapshotId: 9, organizationId: 10 } },
        { url: "", source: { provider: "crm", fileId: 501, dealId: 88, organizationId: 10 } },
      ],
    }];

    expect(sourceKey(sections[0].images[0])).toBe("snapshot:9");
    expect(sourceKey(sections[0].images[1])).toBe("88:501");
    const ready = exportUrls(sections, {
      results: [{ fileId: 501, dealId: 88, previewUrl: "https://signed.example/file" }],
    });
    expect(ready.missing).toBe(false);
    expect(ready.urls["snapshot:9"]).toBe("https://files.example/durable.png");

    const missing = exportUrls(sections, { results: [{ fileId: 501, dealId: 88, status: "missing" }] });
    expect(missing.missing).toBe(true);
  });

  it("does not resolve an inherited CRM source", () => {
    const collected = collectOrganizationMedia([{
      images: [{ source: { provider: "crm", fileId: 501, dealId: 88, restore: "required" } }],
    }]);
    expect(collected.references).toEqual([]);
    expect(sourceKey({ source: { provider: "crm", fileId: 501, dealId: 88, restore: "required" } })).toBeNull();
  });

  it("aborts PDF export only when a CRM image failed to load", () => {
    expect(shouldAbortPdfExport({ usesOrganizationMedia: false, missing: false })).toBe(false);
    expect(shouldAbortPdfExport({ usesOrganizationMedia: true, missing: true })).toBe(true);
  });

  it("sends revision with sections and omits sections from metadata updates", () => {
    const proposal = {
      id: "9",
      revision: 4,
      title: "Deck",
      sections: [{ id: "3", clientId: "temp", title: "Cover", images: [{ url: "https://signed.example/file", source: { provider: "crm" as const, fileId: 501, dealId: 88 } }] }],
    };
    const sectionSave = proposalUpdateBody(proposal);
    expect(sectionSave.baseRevision).toBe(4);
    expect((sectionSave.sections as Array<{ images: Array<{ url: string }> }>)[0].images[0].url).toBe("");
    expect(proposalUpdateBody(proposal, true)).not.toHaveProperty("sections");

    const adopted = applySectionIds([{ id: "", clientId: "temp", title: "Cover" }], [{ clientId: "temp", id: 15 }]);
    expect(adopted[0].id).toBe("15");
    expect(adopted[0].clientId).toBeUndefined();
  });

  it("does not retry a stale autosave and does send a queued edit after success", () => {
    expect(autosaveAfterResponse(409, true)).toEqual({ retry: false, keepEditorState: true });
    expect(autosaveAfterResponse(200, true).retry).toBe(true);
    expect(autosaveAfterResponse(200, false).retry).toBe(false);
  });

  it("refreshes a signed URL inside the 15 minute window", () => {
    const now = Date.parse("2026-10-13T12:00:00Z");
    expect(shouldRefreshSignedUrl("2026-10-13T12:10:00Z", now)).toBe(true);
    expect(shouldRefreshSignedUrl("2026-10-13T12:30:00Z", now)).toBe(false);
  });
});

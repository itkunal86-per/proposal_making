import { describe, expect, it } from "vitest";
import { manualTemplateNeedsCopy, shouldOpenProposalTitleDialog } from "./proposalCreationFlow";

describe("proposal creation flow", () => {
  it("opens the title dialog only for AI Generate", () => {
    expect(shouldOpenProposalTitleDialog("ai")).toBe(true);
    expect(shouldOpenProposalTitleDialog("manual")).toBe(false);
    expect(shouldOpenProposalTitleDialog(null)).toBe(false);
  });

  it("copies a selected template and skips Custom Design", () => {
    expect(manualTemplateNeedsCopy({ id: 12 })).toBe(true);
    expect(manualTemplateNeedsCopy({ id: "4" })).toBe(true);
    expect(manualTemplateNeedsCopy(null)).toBe(false);
    expect(manualTemplateNeedsCopy({ id: "  " })).toBe(false);
  });
});

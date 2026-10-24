import { describe, expect, it } from "vitest";
import {
  convertApiProposalToProposal,
  shouldAutosaveProposal,
  type Proposal,
} from "./proposalsService";

function apiProposal(aiStatus: "processing" | "failed" | "completed" | undefined) {
  return {
    id: 9,
    title: "Proposal",
    status: "draft" as const,
    created_at: "2026-10-24T00:00:00Z",
    ai_status: aiStatus,
    sections: [],
  };
}

describe("phase 1A empty proposal sections", () => {
  it("does not invent sections for an empty processing proposal and does not autosave it", () => {
    const proposal = convertApiProposalToProposal(apiProposal("processing"));

    expect(proposal.sections).toEqual([]);
    expect(shouldAutosaveProposal(proposal)).toBe(false);
  });

  it("does not invent sections for an empty failed proposal", () => {
    const proposal = convertApiProposalToProposal(apiProposal("failed"));

    expect(proposal.sections.map((section) => section.title)).toEqual([]);
    expect(shouldAutosaveProposal(proposal)).toBe(false);
  });

  it("keeps Overview, Scope, and Timeline for an empty completed proposal", () => {
    const proposal = convertApiProposalToProposal(apiProposal("completed"));

    expect(proposal.sections.map((section) => section.title)).toEqual(["Overview", "Scope", "Timeline"]);
    expect(shouldAutosaveProposal(proposal)).toBe(true);
  });

  it("keeps real sections on a completed proposal", () => {
    const proposal = convertApiProposalToProposal({
      ...apiProposal("completed"),
      sections: [{ id: 4, title: "Cover", content: "Hello" }],
    });

    expect(proposal.sections.map((section) => section.title)).toEqual(["Cover"]);
    expect(shouldAutosaveProposal({ ...proposal, sections: proposal.sections } satisfies Pick<Proposal, "sections" | "aiStatus">)).toBe(true);
  });
});

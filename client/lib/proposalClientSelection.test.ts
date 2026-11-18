import { describe, expect, it } from "vitest";
import { selectedProposalClientValue } from "./proposalClientSelection";

const clients = [
  { id: "12", name: "Ada Lovelace", company: "Analytical Engines" },
  { id: 34, name: "Grace Hopper", company: "Navy" },
];

describe("selectedProposalClientValue", () => {
  it("selects the client associated by client_id after options have loaded", () => {
    expect(selectedProposalClientValue(12, clients, "")).toBe("12");
    expect(selectedProposalClientValue("34", clients, "")).toBe("34");
  });

  it("stays empty when the proposal has no associated client", () => {
    expect(selectedProposalClientValue(undefined, clients, "")).toBeUndefined();
    expect(selectedProposalClientValue(null, clients, "")).toBeUndefined();
    expect(selectedProposalClientValue(0, clients, "")).toBeUndefined();
    expect(selectedProposalClientValue("0", clients, "")).toBeUndefined();
  });

  it("does not select an arbitrary client when the id is not in the options", () => {
    expect(selectedProposalClientValue(99, clients, "")).toBeUndefined();
  });

  it("keeps each proposal's own client when proposals are opened consecutively", () => {
    expect(selectedProposalClientValue("12", clients, "Wrong Name")).toBe("12");
    expect(selectedProposalClientValue("34", clients, "Ada Lovelace")).toBe("34");
  });

  it("waits for client options without dropping the associated id", () => {
    expect(selectedProposalClientValue("12", [], "")).toBeUndefined();
    expect(selectedProposalClientValue("12", clients, "")).toBe("12");
  });

  it("still matches a client name when the proposal has no client id", () => {
    expect(selectedProposalClientValue(undefined, clients, "Grace Hopper")).toBe("34");
  });
});

import { describe, expect, it } from "vitest";
import { matchingProposalClient, selectedProposalClientValue } from "./proposalClientSelection";

const proposal45 = {
  id: "45",
  title: "Proposal RFP",
  client: "",
  client_id: 830,
  deal_id: 8,
  status: "draft",
};

const clients = [
  { id: 100, name: "Other Client" },
  { id: "830", name: "Existing Client", company: "Pitchsuite" },
  { id: 901, name: "Another Client" },
];

describe("proposal 45 client_id binding", () => {
  it("selects option 830 and uses that option's name, not the empty client string", () => {
    const selected = matchingProposalClient(proposal45.client_id, clients);

    expect(selectedProposalClientValue(proposal45.client_id, clients)).toBe("830");
    expect(selected?.name).toBe("Existing Client");
    expect(proposal45.client).toBe("");
  });

  it("matches numeric client_id 830 to a numeric option id", () => {
    const options = [{ id: 830, name: "Existing Client" }, { id: 100, name: "Other Client" }];

    expect(selectedProposalClientValue(830, options)).toBe("830");
    expect(matchingProposalClient(830, options)?.name).toBe("Existing Client");
  });

  it("selects a different client_id for a different proposal", () => {
    expect(selectedProposalClientValue(901, clients)).toBe("901");
    expect(matchingProposalClient(901, clients)?.name).toBe("Another Client");
  });

  it("stays empty when client_id is null", () => {
    expect(selectedProposalClientValue(null, clients)).toBeUndefined();
    expect(matchingProposalClient(null, [{ id: 830, name: "" }])).toBeUndefined();
  });

  it("does not select another client when client_id has no matching option", () => {
    expect(selectedProposalClientValue(830, [{ id: 100, name: "Other Client" }])).toBeUndefined();
    expect(selectedProposalClientValue(830, [{ id: 1, name: "Existing Client" }])).toBeUndefined();
  });

  it("selects 830 when client options load before proposal details", () => {
    const optionsLoadedFirst = clients;
    const proposalLoadedLater = proposal45;

    expect(selectedProposalClientValue(proposalLoadedLater.client_id, optionsLoadedFirst)).toBe("830");
  });

  it("selects 830 when proposal details load before client options", () => {
    expect(selectedProposalClientValue(proposal45.client_id, [])).toBeUndefined();
    expect(selectedProposalClientValue(proposal45.client_id, clients)).toBe("830");
  });

  it("keeps the original id when other proposal fields change", () => {
    const edited = { ...proposal45, title: "Updated title" };

    expect(edited.client_id).toBe(830);
    expect(selectedProposalClientValue(edited.client_id, clients)).toBe("830");
  });
});

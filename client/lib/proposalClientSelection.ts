export type ProposalClientOption = {
  id: string | number;
  name: string;
};

/** Normalize a client id for option matching. `0` is the API's empty-client sentinel. */
export function clientOptionValue(id: string | number | null | undefined): string | undefined {
  if (id === null || id === undefined) return undefined;
  const value = String(id).trim();
  if (!value || value === "0") return undefined;
  return value;
}

/** Client list entry whose id matches the proposal `client_id`, ignoring the `client` name string. */
export function matchingProposalClient<T extends ProposalClientOption>(
  clientId: string | number | null | undefined,
  clients: T[],
): T | undefined {
  const normalizedId = clientOptionValue(clientId);
  if (!normalizedId) return undefined;
  return clients.find((client) => clientOptionValue(client.id) === normalizedId);
}

/**
 * Dropdown value for a proposal's associated client.
 * Matches `client_id` to an option id. Numeric and string ids compare as the same value.
 * Returns undefined until a matching option exists, so either API response can arrive first.
 */
export function selectedProposalClientValue(
  clientId: string | number | null | undefined,
  clients: ProposalClientOption[],
): string | undefined {
  const match = matchingProposalClient(clientId, clients);
  return match ? clientOptionValue(match.id) : undefined;
}

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

/**
 * Resolve the dropdown value for a proposal's associated client.
 * Matches `client_id` to an option id (string or number). Falls back to an
 * exact client name only when no id is present. Returns undefined until a
 * matching option exists, so either API response can arrive first.
 */
export function selectedProposalClientValue(
  clientId: string | number | null | undefined,
  clients: ProposalClientOption[],
  clientName?: string | null,
): string | undefined {
  const normalizedId = clientOptionValue(clientId);
  if (normalizedId && clients.some((client) => clientOptionValue(client.id) === normalizedId)) {
    return normalizedId;
  }

  const name = typeof clientName === "string" ? clientName.trim() : "";
  if (!name) return undefined;
  const match = clients.find((client) => client.name === name);
  return match ? clientOptionValue(match.id) : undefined;
}

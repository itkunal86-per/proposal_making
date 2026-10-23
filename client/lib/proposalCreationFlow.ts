export type ProposalCreationFlow = "manual" | "ai" | null;

/** The shared title dialog belongs to AI Generate. New Proposal already stored its title. */
export function shouldOpenProposalTitleDialog(flow: ProposalCreationFlow): boolean {
  return flow === "ai";
}

/** Custom Design passes a null template and must not call the copy API. */
export function manualTemplateNeedsCopy(template: { id?: string | number } | null): template is { id: string | number } {
  if (!template || template.id == null) return false;
  return String(template.id).trim() !== "";
}

import { sectionsForSave } from "./organizationMedia";

export function proposalUpdateBody<T extends { revision?: number; sections?: unknown[] }>(
  proposal: T,
  omitSections = false,
): Record<string, unknown> {
  if (omitSections) {
    const { sections: _sections, ...metadata } = proposal;
    return metadata;
  }

  return {
    ...proposal,
    sections: sectionsForSave((proposal.sections ?? []) as Parameters<typeof sectionsForSave>[0]),
    baseRevision: typeof proposal.revision === "number" ? proposal.revision : 0,
  };
}

export function autosaveAfterResponse(status: number, hasQueuedEdit: boolean): { retry: boolean; keepEditorState: boolean } {
  if (status === 409) {
    return { retry: false, keepEditorState: true };
  }

  return { retry: hasQueuedEdit, keepEditorState: true };
}

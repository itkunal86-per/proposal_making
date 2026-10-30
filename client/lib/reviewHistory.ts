export interface ReviewHistoryActor {
  name?: string | null;
  email?: string | null;
}

export interface ReviewHistoryEntry {
  action: string;
  previous_status?: string | null;
  new_status?: string | null;
  actor?: ReviewHistoryActor | null;
}

const ACTION_LABELS: Record<string, string> = {
  submitted_for_review: "Submitted for review",
  approved: "Approved",
  rework_requested: "Rework requested",
  comment: "Comment added",
  signed: "Signed",
  sent_to_client: "Sent to client",
};

export type ReviewHistoryTone = "approved" | "rework" | "review" | "signed" | "neutral";

export function reviewActionLabel(action: string): string {
  if (ACTION_LABELS[action]) return ACTION_LABELS[action];
  return action
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function reviewStatusLabel(status: string): string {
  return status
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function reviewActorLabel(actor?: ReviewHistoryActor | null): string {
  const name = actor?.name?.trim();
  if (name) return name;
  const email = actor?.email?.trim();
  if (email) return email;
  return "Unknown user";
}

export function reviewStatusTone(entry: ReviewHistoryEntry): ReviewHistoryTone {
  const status = entry.new_status ?? "";
  if (entry.action === "signed") return "signed";
  if (status === "approved" || entry.action === "approved") return "approved";
  if (status === "rework_requested" || entry.action === "rework_requested") return "rework";
  if (status === "in_review" || entry.action === "submitted_for_review") return "review";
  return "neutral";
}

export function reviewStatusTransition(entry: ReviewHistoryEntry): string | null {
  const previous = entry.previous_status?.trim();
  const next = entry.new_status?.trim();
  if (!previous || !next || previous === next) return null;
  return `${reviewStatusLabel(previous)} → ${reviewStatusLabel(next)}`;
}

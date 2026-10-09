import { getStoredToken } from "@/lib/auth";
import { apiConfig } from "@/lib/apiConfig";

export interface ReviewEvent {
  id: number;
  proposal_id: number;
  actor_user_id: number;
  action: string;
  comment?: string | null;
  previous_status?: string | null;
  new_status?: string | null;
  created_at?: string;
  actor?: { id: number; name: string; email: string } | null;
}

async function postAction(proposalId: string, action: string, body?: Record<string, unknown>) {
  const token = getStoredToken();
  if (!token) throw new Error("No authentication token available");

  const response = await fetch(`${apiConfig.endpoints.proposals}/${proposalId}/${action}`, {
    method: action === "review-events" ? "GET" : "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: action === "review-events" ? undefined : JSON.stringify(body ?? {}),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Review action failed");
  }
  return data;
}

export function submitForReview(proposalId: string) {
  return postAction(proposalId, "submit-for-review");
}

export function approveProposal(proposalId: string, comment?: string) {
  return postAction(proposalId, "approve", { comment });
}

export function requestRework(proposalId: string, comment: string) {
  return postAction(proposalId, "request-rework", { comment });
}

export function addReviewComment(proposalId: string, comment: string) {
  return postAction(proposalId, "comments", { comment });
}

export function signProposal(proposalId: string, fieldId?: string, signature?: string) {
  return postAction(proposalId, "sign", {
    ...(fieldId ? { field_id: fieldId } : {}),
    ...(signature ? { signature } : {}),
  });
}

export async function listReviewEvents(proposalId: string): Promise<ReviewEvent[]> {
  const token = getStoredToken();
  if (!token) throw new Error("No authentication token available");
  const response = await fetch(`${apiConfig.endpoints.proposals}/${proposalId}/review-events`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json().catch(() => []);
  if (!response.ok) {
    throw new Error(data.error || "Could not load review history");
  }
  return data;
}

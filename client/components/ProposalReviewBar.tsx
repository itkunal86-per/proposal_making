import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  addReviewComment,
  approveProposal,
  listReviewEvents,
  requestRework,
  submitForReview,
  type ReviewEvent,
} from "@/services/proposalReviewService";
import { type ProposalStatus } from "@/services/proposalsService";
import {
  reviewActionLabel,
  reviewActorLabel,
  reviewStatusLabel,
  reviewStatusTone,
  reviewStatusTransition,
} from "@/lib/reviewHistory";

interface ProposalReviewBarProps {
  proposalId: string;
  status: string;
  title: string;
  shareLink: string;
  isReviewer: boolean;
  canSubmit: boolean;
  onBeforeAction?: () => Promise<void> | void;
  onStatus?: (status: ProposalStatus) => void;
  onSettled?: () => void;
  onChanged: () => void;
}

const PROPOSAL_STATUSES = new Set<ProposalStatus>([
  "draft",
  "in_review",
  "rework_requested",
  "approved",
  "rejected",
  "published",
  "sent",
  "accepted",
  "declined",
]);

function formatCommentTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function statusFrom(result: unknown): ProposalStatus | null {
  if (!result || typeof result !== "object" || !("status" in result)) return null;
  const status = (result as { status?: unknown }).status;
  if (typeof status !== "string" || !PROPOSAL_STATUSES.has(status as ProposalStatus)) return null;
  return status as ProposalStatus;
}

export function ProposalReviewBar({
  proposalId,
  status,
  title,
  shareLink,
  isReviewer,
  canSubmit,
  onBeforeAction,
  onStatus,
  onSettled,
  onChanged,
}: ProposalReviewBarProps) {
  const [comment, setComment] = useState("");
  const [events, setEvents] = useState<ReviewEvent[]>([]);
  const [historyState, setHistoryState] = useState<"loading" | "ready" | "error">("loading");
  const [historyError, setHistoryError] = useState("");
  const [historyVersion, setHistoryVersion] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setEvents([]);
    setHistoryError("");
    setHistoryState("loading");
  }, [proposalId]);

  useEffect(() => {
    if (!isReviewer && !canSubmit) return;
    let cancelled = false;
    setHistoryState((current) => (current === "ready" ? current : "loading"));
    listReviewEvents(proposalId)
      .then((next) => {
        if (cancelled) return;
        setEvents(next);
        setHistoryError("");
        setHistoryState("ready");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setHistoryError(error instanceof Error ? error.message : "Could not load review history");
        setHistoryState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [proposalId, status, isReviewer, canSubmit, historyVersion]);

  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    try {
      await onBeforeAction?.();
      const result = await action();
      const nextStatus = statusFrom(result);
      if (nextStatus) onStatus?.(nextStatus);
      toast({ title: success });
      setComment("");
      setHistoryVersion((version) => version + 1);
      onChanged();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Review action failed";
      toast({
        title: message.includes("Reviewer signature") ? "Cannot Approve" : message,
        description: message.includes("Reviewer signature") ? message : undefined,
        variant: "destructive",
      });
    } finally {
      setBusy(false);
      onSettled?.();
    }
  }

  if (!isReviewer && !canSubmit) return null;

  return (
    <div className="editor-review space-y-2 px-3 py-2.5">
      <h2 className="text-xs font-semibold">Comments</h2>
      <div className="flex flex-wrap items-center gap-2">
        {canSubmit && (status === "draft" || status === "rework_requested") && (
          <Button size="sm" disabled={busy} onClick={() => run(() => submitForReview(proposalId), "Submitted for review")}>
            Submit for Review
          </Button>
        )}
        {isReviewer && status === "in_review" && (
          <>
            <Button size="sm" variant="outline" disabled={busy || !comment.trim()} onClick={() => run(() => requestRework(proposalId, comment), "Rework requested")}>
              Request Rework
            </Button>
            <Button size="sm" disabled={busy} onClick={() => run(() => approveProposal(proposalId, comment), "Proposal approved")}>
              Approve
            </Button>
          </>
        )}
        {isReviewer && (status === "approved" || status === "rework_requested") && (
          <Button size="sm" variant="outline" disabled={busy || !comment.trim()} onClick={() => run(() => addReviewComment(proposalId, comment), "Comment added")}>
            Add Comment
          </Button>
        )}
      </div>
      {(isReviewer || canSubmit) && (
        <Textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Review comment"
          className="bg-white text-sm"
        />
      )}
      <section className="review-history" aria-label="Review history">
        <h2 className="review-history-title">Review history</h2>
        {historyState === "loading" && events.length === 0 && (
          <p className="review-history-message" aria-live="polite">Loading review history…</p>
        )}
        {historyState === "error" && (
          <div className="review-history-error" role="alert">
            <p className="review-history-message">{historyError}</p>
            <button type="button" className="review-history-retry" onClick={() => setHistoryVersion((version) => version + 1)}>
              Try again
            </button>
          </div>
        )}
        {historyState === "ready" && events.length === 0 && (
          <p className="review-history-empty">No review activity yet.</p>
        )}
        {events.length > 0 && (
          <ol className="review-history-list">
            {events.map((event) => {
              const tone = reviewStatusTone(event);
              const transition = reviewStatusTransition(event);
              return (
                <li key={event.id} className={`review-history-item review-history-item-${tone}`}>
                  <span className="review-history-marker" aria-hidden="true" />
                  <div className="review-history-body">
                    <div className="review-history-row">
                      <span className="review-history-action">{reviewActionLabel(event.action)}</span>
                      {event.new_status ? (
                        <span className={`review-history-status review-history-status-${tone}`}>
                          {reviewStatusLabel(event.new_status)}
                        </span>
                      ) : null}
                    </div>
                    <p className="review-history-meta">
                      {reviewActorLabel(event.actor)}
                      {event.created_at ? ` · ${formatCommentTime(event.created_at)}` : ""}
                    </p>
                    {transition ? <p className="review-history-transition">{transition}</p> : null}
                    {event.comment ? <p className="review-history-comment">{event.comment}</p> : null}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}

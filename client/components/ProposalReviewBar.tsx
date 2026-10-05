import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  addReviewComment,
  approveProposal,
  listReviewEvents,
  requestRework,
  signProposal,
  submitForReview,
  type ReviewEvent,
} from "@/services/proposalReviewService";
import { type ProposalStatus } from "@/services/proposalsService";
import { EmailShareDialog } from "@/components/EmailShareDialog";

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
  const [busy, setBusy] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (!isReviewer && !canSubmit) return;
    listReviewEvents(proposalId).then(setEvents).catch(() => setEvents([]));
  }, [proposalId, status, isReviewer, canSubmit]);

  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    try {
      await onBeforeAction?.();
      const result = await action();
      const nextStatus = statusFrom(result);
      if (nextStatus) onStatus?.(nextStatus);
      toast({ title: success });
      setComment("");
      onChanged();
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "Review action failed",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
      onSettled?.();
    }
  }

  if (!isReviewer && !canSubmit) return null;

  return (
    <div className="border-b border-slate-200 bg-slate-50 px-6 py-3 space-y-3">
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
        {isReviewer && status === "approved" && (
          <>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => run(() => signProposal(proposalId), "Reviewer signature saved")}>
              Sign
            </Button>
            <Button size="sm" disabled={busy} onClick={() => setShareOpen(true)}>
              Send
            </Button>
          </>
        )}
      </div>
      {(isReviewer || canSubmit) && (
        <Textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Review comment"
          className="bg-white"
        />
      )}
      {events.length > 0 && (
        <ul className="space-y-1 text-sm text-slate-600">
          {events.map((event) => (
            <li key={event.id}>
              <span className="font-medium">{event.action.replace(/_/g, " ")}</span>
              {event.actor?.name ? ` by ${event.actor.name}` : ""}
              {event.comment ? ` — ${event.comment}` : ""}
            </li>
          ))}
        </ul>
      )}
      <EmailShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        proposalTitle={title}
        shareLink={shareLink}
        proposalId={proposalId}
        onSent={onChanged}
      />
    </div>
  );
}

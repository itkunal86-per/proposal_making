import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  addReviewComment,
  approveProposal,
  listReviewEvents,
  rejectProposal,
  requestRework,
  signProposal,
  submitForReview,
  type ReviewEvent,
} from "@/services/proposalReviewService";
import { EmailShareDialog } from "@/components/EmailShareDialog";

interface ProposalReviewBarProps {
  proposalId: string;
  status: string;
  title: string;
  shareLink: string;
  isReviewer: boolean;
  canSubmit: boolean;
  onChanged: () => void;
}

export function ProposalReviewBar({
  proposalId,
  status,
  title,
  shareLink,
  isReviewer,
  canSubmit,
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
      await action();
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
            <Button size="sm" disabled={busy} onClick={() => run(() => approveProposal(proposalId, comment), "Proposal approved")}>
              Approve
            </Button>
            <Button size="sm" variant="outline" disabled={busy || !comment.trim()} onClick={() => run(() => requestRework(proposalId, comment), "Rework requested")}>
              Request Rework
            </Button>
            <Button size="sm" variant="destructive" disabled={busy || !comment.trim()} onClick={() => run(() => rejectProposal(proposalId, comment), "Proposal rejected")}>
              Reject
            </Button>
          </>
        )}
        {isReviewer && (status === "in_review" || status === "approved" || status === "rework_requested") && (
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

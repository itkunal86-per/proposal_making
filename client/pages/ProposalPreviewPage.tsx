import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ProposalPreviewModal } from "@/components/ProposalPreviewModal";
import { SignatureDetailsModal } from "@/components/SignatureDetailsModal";
import { getProposalDetails, type Proposal } from "@/services/proposalsService";
import { fetchVariables } from "@/services/variablesService";
import { signProposal } from "@/services/proposalReviewService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export default function ProposalPreviewPage() {
  const { id = "" } = useParams();
  const mainAppUrl = (import.meta.env.VITE_MAIN_APP_URL ?? "https://pitchsuite.io/").replace(/\/+$/, "");
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [variables, setVariables] = useState<Array<{ id: string | number; name: string; value: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signatureOpen, setSignatureOpen] = useState(false);
  const [signatureTarget, setSignatureTarget] = useState<{ sectionId: string; fieldIndex: number } | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    let isActive = true;

    async function loadProposal() {
      if (!id) {
        setError("Proposal not found");
        setIsLoading(false);
        return;
      }

      try {
        const loadedProposal = await getProposalDetails(id);
        if (!isActive) return;

        if (!loadedProposal) {
          setError("Proposal not found");
          return;
        }

        setProposal(loadedProposal);
        const variablesResponse = await fetchVariables(id);
        if (isActive && variablesResponse.data) {
          setVariables(
            variablesResponse.data.map((variable) => ({
              id: variable.id,
              name: variable.variable_name,
              value: variable.variable_value,
            })),
          );
        }
      } catch {
        if (isActive) setError("Failed to load proposal");
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void loadProposal();
    return () => {
      isActive = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <h1 className="text-2xl font-bold text-destructive">{error || "Proposal not found"}</h1>
      </div>
    );
  }

  const targetField = signatureTarget
    ? proposal.sections.find((section) => String(section.id) === String(signatureTarget.sectionId))?.signatureFields?.[signatureTarget.fieldIndex]
    : undefined;

  function openSignature(sectionId: string, fieldIndex: number) {
    const section = proposal.sections.find((item) => String(item.id) === String(sectionId));
    const field = section?.signatureFields?.[fieldIndex];
    if (!field || field.status === "signed") return;
    const isReviewer = user?.membershipRole === "reviewer";
    const creatorCanSign = !isReviewer && (proposal.status === "draft" || proposal.status === "rework_requested");
    const reviewerCanSign = isReviewer && proposal.status === "in_review";
    if (field.purpose === "creator" && creatorCanSign) {
      setSignatureTarget({ sectionId, fieldIndex });
      setSignatureOpen(true);
      return;
    }
    if (field.purpose === "reviewer" && reviewerCanSign) {
      setSignatureTarget({ sectionId, fieldIndex });
      setSignatureOpen(true);
      return;
    }
    toast({
      title: "You cannot sign this signature field",
      variant: "destructive",
    });
  }

  return (
    <>
      <ProposalPreviewModal
        proposal={proposal}
        variables={variables}
        fullPage
        backHref={proposal.deal_id == null
          ? `${mainAppUrl}#proposals`
          : `${mainAppUrl}/deals/${encodeURIComponent(String(proposal.deal_id))}#proposals`}
        onOpenSignatureDetails={openSignature}
      />
      <SignatureDetailsModal
        open={signatureOpen}
        signatureDetails={targetField || {}}
        onClose={() => setSignatureOpen(false)}
        onSave={(details) => {
          if (!targetField?.id) return;
          void signProposal(String(proposal.id), String(targetField.id), details.signature)
            .then(async () => {
              const fresh = await getProposalDetails(String(proposal.id));
              if (fresh) setProposal(fresh);
              setSignatureOpen(false);
            })
            .catch((saveError) => {
              toast({
                title: saveError instanceof Error ? saveError.message : "Could not save signature",
                variant: "destructive",
              });
            });
        }}
      />
    </>
  );
}

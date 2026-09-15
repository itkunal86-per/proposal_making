import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ProposalPreviewModal } from "@/components/ProposalPreviewModal";
import { getProposalDetails, type Proposal } from "@/services/proposalsService";
import { fetchVariables } from "@/services/variablesService";

export default function ProposalPreviewPage() {
  const { id = "" } = useParams();
  const mainAppUrl = (import.meta.env.VITE_MAIN_APP_URL ?? "https://pitchsuite.io/").replace(/\/+$/, "");
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [variables, setVariables] = useState<Array<{ id: string | number; name: string; value: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <ProposalPreviewModal
      proposal={proposal}
      variables={variables}
      fullPage
      backHref={proposal.deal_id == null
        ? `${mainAppUrl}#proposals`
        : `${mainAppUrl}/deals/${encodeURIComponent(String(proposal.deal_id))}#proposals`}
    />
  );
}

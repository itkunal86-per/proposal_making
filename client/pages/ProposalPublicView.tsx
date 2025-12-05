import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPublicProposal, type Proposal } from "@/services/proposalsService";
import { ProposalPreview } from "@/components/ProposalPreview";
import { Button } from "@/components/ui/button";

export default function ProposalPublicView() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProposal = async () => {
      if (!token) {
        setError("Invalid sharing link");
        setIsLoading(false);
        return;
      }

      try {
        const data = await getPublicProposal(token);
        if (data) {
          setProposal(data);
        } else {
          setError("Proposal not found or link has expired");
        }
      } catch (err) {
        setError("Failed to load proposal");
      } finally {
        setIsLoading(false);
      }
    };

    loadProposal();
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold text-destructive">{error}</h1>
        <Button onClick={() => navigate("/")} variant="outline">
          Go Home
        </Button>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Proposal not found</h1>
        <Button onClick={() => navigate("/")} variant="outline">
          Go Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ProposalPreview proposal={proposal} />
    </div>
  );
}

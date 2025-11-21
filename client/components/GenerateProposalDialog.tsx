import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { generateProposalContent } from "@/services/aiGenerationService";
import { Proposal } from "@/services/proposalsService";
import { Loader2 } from "lucide-react";

interface GenerateProposalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  baseProposal: Proposal;
  onProposalGenerated: (proposal: Proposal) => void;
}

export const GenerateProposalDialog: React.FC<GenerateProposalDialogProps> = ({
  open,
  onOpenChange,
  baseProposal,
  onProposalGenerated,
}) => {
  const [prompt, setPrompt] = useState("");
  const [clientName, setClientName] = useState(baseProposal.client || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt to generate the proposal",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const updated = await generateProposalContent(
        { ...baseProposal, client: clientName || baseProposal.client },
        prompt
      );
      onProposalGenerated(updated);
      onOpenChange(false);
      setPrompt("");
      toast({
        title: "Success",
        description: "Proposal generated successfully!",
      });
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to generate proposal",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate Proposal with AI</DialogTitle>
          <DialogDescription>
            Describe what you need, and our AI will generate a complete proposal
            structure and content.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="client-name">Client Name (Optional)</Label>
            <Input
              id="client-name"
              placeholder="e.g., Acme Corporation"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="prompt">
              Describe the proposal you want to create
            </Label>
            <Textarea
              id="prompt"
              placeholder="e.g., I need to create a WordPress website development proposal for a client who needs a modern, responsive website with e-commerce capabilities..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="mt-2 min-h-[150px]"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Proposal"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

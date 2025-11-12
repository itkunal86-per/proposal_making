import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Proposal, ProposalSection } from "@/services/proposalsService";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface AIAssistantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposal: Proposal;
  sectionId?: string;
  onUpdateProposal: (proposal: Proposal) => void;
}

export const AIAssistantDialog: React.FC<AIAssistantDialogProps> = ({
  open,
  onOpenChange,
  proposal,
  sectionId,
  onUpdateProposal,
}) => {
  const [prompt, setPrompt] = useState("");

  const section = sectionId
    ? proposal.sections.find((s) => s.id === sectionId)
    : null;

  const handleAIWrite = (
    action: "generate" | "rewrite" | "summarize" | "translate",
    promptText: string
  ) => {
    if (!promptText.trim()) {
      toast({ title: "Please enter a prompt" });
      return;
    }

    if (!section) {
      toast({ title: "No section selected" });
      return;
    }

    let content = section.content;
    if (action === "generate") content = `${content}\n\nGenerated: ${promptText}`;
    if (action === "rewrite") content = `${content}\n\nRewritten: ${promptText}`;
    if (action === "summarize")
      content =
        content.slice(0, Math.max(80, Math.floor(content.length * 0.5))) +
        "...";
    if (action === "translate")
      content = `${content}\n\n[Translated] ${promptText}`;

    const updatedProposal = {
      ...proposal,
      sections: proposal.sections.map((s) =>
        s.id === sectionId ? { ...s, content } : s
      ),
    };

    onUpdateProposal(updatedProposal);
    setPrompt("");
    toast({ title: `${action} via AI assistant` });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>AI Assistant</DialogTitle>
        </DialogHeader>

        {!section && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-900">
              No section selected. Please select a section from the Sections panel to use AI features.
            </p>
          </div>
        )}

        {section && (
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-semibold">
                Current Section: {section.title}
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                {section.content.substring(0, 100)}
                {section.content.length > 100 ? "..." : ""}
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="ai-prompt" className="text-xs font-semibold">
                Describe what you want...
              </Label>
              <Textarea
                id="ai-prompt"
                placeholder="Tell the AI what you'd like to generate, rewrite, summarize, or translate..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => handleAIWrite("generate", prompt)}
                disabled={!section}
              >
                Generate
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAIWrite("rewrite", prompt)}
                disabled={!section}
              >
                Rewrite
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAIWrite("summarize", prompt)}
                disabled={!section}
              >
                Summarize
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAIWrite("translate", prompt)}
                disabled={!section}
              >
                Translate
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
